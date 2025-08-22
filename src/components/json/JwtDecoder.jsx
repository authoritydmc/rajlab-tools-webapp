import React, { useState, useEffect } from "react";
import { FaKey, FaCopy, FaTrash, FaCheckCircle, FaTimesCircle, FaTable } from "react-icons/fa";
import { useTheme } from "../../themeContext";
import Card from "../common/card";

function base64UrlDecode(str) {
  try {
    return JSON.stringify(JSON.parse(
      decodeURIComponent(
        atob(str.replace(/-/g, "+").replace(/_/g, "/"))
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      )
    ), null, 2);
  } catch {
    return null;
  }
}

function parseJwt(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  return {
    header: base64UrlDecode(header),
    payload: base64UrlDecode(payload),
    signature,
    raw: { header, payload, signature }
  };
}

// Helper to convert JSON to table rows
const jsonToTable = (jsonStr) => {
  try {
    const obj = JSON.parse(jsonStr);
    return (
      <table className="min-w-full text-xs border-collapse">
        <tbody>
          {Object.entries(obj).map(([key, value]) => (
            <tr key={key} className="border-b">
              <td className="font-bold px-2 py-1 border-r border-gray-700 dark:border-gray-600 text-left">{key}</td>
              <td className="px-2 py-1 text-left">{String(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } catch {
    return <span className="text-red-500">Invalid JSON</span>;
  }
};

// Helper to format seconds to human readable string
function formatDuration(seconds) {
  seconds = Math.abs(seconds);
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;
  let parts = [];
  if (days) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  if (minutes) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  if (seconds || parts.length === 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
  return parts.join(' ');
}

// Helper to check expiration and countdown for a timestamp
const getTimestampStatus = (timestamp) => {
  if (!timestamp) return null;
  const now = Math.floor(Date.now() / 1000);
  const secondsLeft = timestamp - now;
  let status = secondsLeft > 0 ? "valid" : "expired";
  let countdown = null;
  let expiryDate = new Date(timestamp * 1000).toLocaleString();
  if (status === "valid") {
    countdown = `${formatDuration(secondsLeft)} left`;
  } else {
    countdown = `Expired ${formatDuration(secondsLeft)} ago`;
  }
  return { status, countdown, expiryDate };
};

// Helper to check iat validity and show human readable countdown and status
const getIatStatus = (payloadStr) => {
  try {
    const obj = JSON.parse(payloadStr);
    if (!obj.iat) return null;
    const now = Math.floor(Date.now() / 1000);
    const secondsDiff = obj.iat - now;
    const iatDate = new Date(obj.iat * 1000).toLocaleString();
    let expStatus = null;
    if (obj.exp) {
      expStatus = obj.exp < now ? "expired" : "valid";
    }
    if (obj.iat > now) {
      return {
        status: "notYetValid",
        label: `Not yet valid (starts in ${formatDuration(secondsDiff)})`,
        icon: <FaTimesCircle className="text-yellow-400 animate-pulse" />,
        color: "text-yellow-400",
        date: iatDate
      };
    } else if (expStatus === "expired") {
      return {
        status: "expired",
        label: `Expired (issued: ${iatDate})`,
        icon: <FaTimesCircle className="text-red-400 animate-pulse" />,
        color: "text-red-400",
        date: iatDate
      };
    } else {
      // Valid
      return {
        status: "valid",
        label: `Valid (issued: ${iatDate})`,
        icon: <FaCheckCircle className="text-green-400 animate-bounce" />,
        color: "text-green-400",
        date: iatDate
      };
    }
  } catch {
    return null;
  }
};

// Helper to parse only actual JWT fields for JSON view
const getPureJwtJson = (jsonStr) => {
  try {
    const obj = JSON.parse(jsonStr);
    // Remove any keys ending with _local or _status
    const pureObj = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (!key.endsWith('_local') && !key.endsWith('_status')) {
        pureObj[key] = value;
      }
    });
    return JSON.stringify(pureObj, null, 2);
  } catch {
    return jsonStr;
  }
};

const AnimatedIconButton = ({ icon, showFeedback, feedbackIcon, title, onClick, disabled }) => (
  <button
    className={`relative px-2 py-1 text-xs rounded flex items-center justify-center transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'} ${showFeedback ? 'bg-green-500 animate-pulse' : ''}`}
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={{ minWidth: 32, minHeight: 32 }}
  >
    <span className={`transition-all duration-300 ${showFeedback ? 'opacity-0 scale-75 absolute' : 'opacity-100 scale-100'}`}>{icon}</span>
    {showFeedback && (
      <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-110 text-white animate-bounce">{feedbackIcon}</span>
    )}
  </button>
);

export default function JwtDecoder() {
  const { isDarkMode } = useTheme();
  const [jwt, setJwt] = useState("");
  const [secret, setSecret] = useState("");
  const [decoded, setDecoded] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [countdown, setCountdown] = useState("");
  const [activeTab, setActiveTab] = useState({ header: "json", payload: "json" });
  const [hoveredPart, setHoveredPart] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e, part) => {
    setHoveredPart(part);
    setMousePos({ x: e.clientX, y: e.clientY });
  };
  const handleMouseLeave = () => {
    setHoveredPart(null);
  };

  useEffect(() => {
    if (jwt.trim().length > 0) {
      const result = parseJwt(jwt);
      if (!result) {
        setDecoded(null);
        setError("Invalid JWT format.");
      } else {
        setDecoded(result);
        setError("");
      }
    } else {
      setDecoded(null);
      setError("");
    }
  }, [jwt]);

  useEffect(() => {
    let timer;
    if (decoded && decoded.payload) {
      const updateCountdown = () => {
        const { countdown: cd } = getExpiryStatus(decoded.payload);
        setCountdown(cd);
      };
      updateCountdown();
      timer = setInterval(updateCountdown, 1000);
    } else {
      setCountdown("");
    }
    return () => clearInterval(timer);
  }, [decoded]);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1200);
  };

  const handleClear = () => {
    setJwt("");
    setDecoded(null);
    setError("");
  };

  // Helper to parse iat/exp/nbf to local time and add status
  const parseTimeFields = (jsonStr) => {
    try {
      const obj = JSON.parse(jsonStr);
      ["iat", "exp", "nbf"].forEach((field) => {
        if (obj[field]) {
          const date = new Date(obj[field] * 1000);
          obj[field + "_local"] = date.toLocaleString();
          obj[field + "_status"] = getTimestampStatus(obj[field]);
        }
      });
      return JSON.stringify(obj, null, 2);
    } catch {
      return jsonStr;
    }
  };

  // Helper to check expiration and countdown
  const getExpiryStatus = (payloadStr) => {
    try {
      const obj = JSON.parse(payloadStr);
      if (!obj.exp) return { status: null, countdown: null, expiryDate: null };
      const now = Math.floor(Date.now() / 1000);
      const secondsLeft = obj.exp - now;
      let status = secondsLeft > 0 ? "valid" : "expired";
      let countdown = null;
      let expiryDate = new Date(obj.exp * 1000).toLocaleString();
      if (status === "valid") {
        if (secondsLeft < 60) countdown = `${secondsLeft} seconds left`;
        else if (secondsLeft < 3600) countdown = `${Math.floor(secondsLeft / 60)} minutes left`;
        else if (secondsLeft < 86400) countdown = `${Math.floor(secondsLeft / 3600)} hours left`;
        else countdown = `${Math.floor(secondsLeft / 86400)} days left`;
      } else {
        countdown = `Expired ${Math.abs(secondsLeft)} seconds ago`;
      }
      return { status, countdown, expiryDate };
    } catch {
      return { status: null, countdown: null, expiryDate: null };
    }
  };

  // Colorize JWT parts in a single box
  const colorizeJwt = (jwt) => {
    const parts = jwt.split(".");
    if (parts.length !== 3) return jwt;
    return (
      <span className="font-mono text-xs break-all">
        <span className="text-blue-400">{parts[0]}</span>
        <span className="text-gray-400">.</span>
        <span className="text-green-400">{parts[1]}</span>
        <span className="text-gray-400">.</span>
        <span className="text-pink-400">{parts[2]}</span>
      </span>
    );
  };

  return (
    <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-green-50 text-gray-900'} transition-colors duration-300`}>
      <h1 className={`text-3xl font-bold mb-8 text-center ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}> <FaKey className="inline-block mr-2" />JWT Decoder</h1>
      <div className={`max-w-4xl mx-auto p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-150 border-gray-300'} border`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div>
            <Card title={<span className="flex items-center gap-2">JSON WEB TOKEN (JWT)
              <AnimatedIconButton icon={<FaCopy />} showFeedback={copied === 'jwt'} feedbackIcon={<FaCheckCircle />} title="Copy JWT" onClick={() => handleCopy(jwt, 'jwt')} disabled={!jwt} />
              <AnimatedIconButton icon={<FaTrash />} showFeedback={copied === 'clear'} feedbackIcon={<FaCheckCircle />} title="Clear JWT" onClick={() => { handleClear(); setCopied('clear'); setTimeout(() => setCopied(''), 1200); }} disabled={!jwt} />
            </span>} isDarkMode={isDarkMode}>
              <textarea className={`border rounded p-3 w-full text-sm font-mono ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-green-50 text-gray-900 border-gray-300'} focus:outline-blue-400 resize-none`} rows={3} placeholder="Paste JWT here..." value={jwt} onChange={e => setJwt(e.target.value)} autoFocus style={{overflowWrap: 'break-word'}} />
              <input className={`border rounded p-2 w-full mt-4 text-sm ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-green-50 text-gray-900 border-gray-300'}`} type="text" placeholder="Secret (optional, for signature verification)" value={secret} onChange={e => setSecret(e.target.value)} />
              {error && <div className="text-red-600 mt-2">{error}</div>}
            </Card>
            {decoded && (
              <>
                <div className={`p-4 rounded mb-4 border font-mono text-base overflow-x-auto whitespace-pre-wrap break-all flex items-center gap-2 ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-green-50 border-gray-300 text-gray-900'}`} style={{ minHeight: 56, fontSize: '1.15rem', lineHeight: '1.7rem', position: 'relative' }}>{jwt ? (
                  <>
                    <span className="relative group" style={{ position: 'relative' }}
                      onMouseMove={e => handleMouseMove(e, 'header')}
                      onMouseLeave={handleMouseLeave}
                    >
                      <span className="text-blue-400 cursor-pointer">{decoded.raw.header}</span>
                    </span>
                    <span className="text-gray-400">.</span>
                    <span className="relative group" style={{ position: 'relative' }}
                      onMouseMove={e => handleMouseMove(e, 'payload')}
                      onMouseLeave={handleMouseLeave}
                    >
                      <span className="text-green-400 cursor-pointer">{decoded.raw.payload}</span>
                    </span>
                    <span className="text-gray-400">.</span>
                    <span className="relative group" style={{ position: 'relative' }}
                      onMouseMove={e => handleMouseMove(e, 'signature')}
                      onMouseLeave={handleMouseLeave}
                    >
                      <span className="text-pink-400 cursor-pointer">{decoded.raw.signature}</span>
                    </span>
                    {hoveredPart && (
                      <span
                        style={{
                          position: 'fixed',
                          left: mousePos.x + 12,
                          top: mousePos.y + 12,
                          zIndex: 9999,
                          background: hoveredPart === 'header' ? '#2563eb' : hoveredPart === 'payload' ? '#16a34a' : '#db2777',
                          color: 'white',
                          fontSize: '0.85rem',
                          borderRadius: 6,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          padding: '6px 12px',
                          pointerEvents: 'none',
                          maxWidth: 220,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {hoveredPart === 'header' && 'Header: algorithm/type'}
                        {hoveredPart === 'payload' && 'Payload: claims/data'}
                        {hoveredPart === 'signature' && 'Signature: integrity'}
                      </span>
                    )}
                  </>
                ) : <span className="text-gray-500">Paste JWT here...</span>}
                </div>
                <div className="flex items-center justify-center gap-4 mb-6" style={{ fontSize: '1.1rem', minHeight: 32 }}>
                  <span className="text-blue-400 font-semibold">Header</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-green-400 font-semibold">Payload</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-pink-400 font-semibold">Signature</span>
                  <span className="text-sm text-gray-500 ml-2">Each part is base64url encoded and separated by dots.</span>
                </div>
              </>
            )}
          </div>
          <div>
            <Card title={<span className="flex items-center gap-2">Decoded JWT
              {decoded && (() => {
                const { status, countdown, expiryDate } = getExpiryStatus(decoded.payload);
                if (status === "valid") return <span className="flex items-center gap-1 text-green-500"><FaCheckCircle /> <span className="font-semibold"></span></span>;
                if (status === "expired") return <span className="flex items-center gap-1 text-red-500"><FaTimesCircle /> <span className="font-semibold"></span></span>;
                return null;
              })()}
              {decoded && (() => {
                const { countdown, expiryDate } = getExpiryStatus(decoded.payload);
                return countdown ? <span className="ml-2 text-xs font-semibold text-yellow-400">{countdown} {expiryDate && `(exp: ${expiryDate})`}</span> : null;
              })()}
            </span>} isDarkMode={isDarkMode}>
              {decoded ? (
                <div className="space-y-4">
                  {/* Header Section with Tabs */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Header</h3>
                      <div className="flex gap-2">
                        <AnimatedIconButton icon={<FaKey className="inline-block" />} showFeedback={false} feedbackIcon={null} title="JSON" onClick={() => setActiveTab(t => ({ ...t, header: 'json' }))} disabled={activeTab.header === 'json'} />
                        <AnimatedIconButton icon={<FaTable className="inline-block" />} showFeedback={false} feedbackIcon={null} title="Table" onClick={() => setActiveTab(t => ({ ...t, header: 'table' }))} disabled={activeTab.header === 'table'} />
                        <AnimatedIconButton icon={<FaCopy />} showFeedback={copied === 'header'} feedbackIcon={<FaCheckCircle />} title="Copy Header" onClick={() => handleCopy(parseTimeFields(decoded.header), 'header')} disabled={false} />
                      </div>
                    </div>
                    {activeTab.header === 'json' ? (
                      <pre className={`p-3 rounded text-xs overflow-x-auto border font-mono whitespace-pre-wrap break-words ${isDarkMode ? 'bg-gray-900 border-blue-900 text-white' : 'bg-gray-900 border-blue-900 text-white'}`}>{parseTimeFields(decoded.header)}</pre>
                    ) : (
                      <div className={`p-3 rounded text-xs overflow-x-auto border font-mono whitespace-pre-wrap break-words ${isDarkMode ? 'bg-gray-900 border-blue-900 text-white' : 'bg-gray-900 border-blue-900 text-white'}`}>{jsonToTable(decoded.header)}</div>
                    )}
                  </div>
                  {/* Payload Section with Tabs */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-bold ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>Payload</h3>
                      <div className="flex gap-2">
                        <AnimatedIconButton icon={<FaKey className="inline-block" />} showFeedback={false} feedbackIcon={null} title="JSON" onClick={() => setActiveTab(t => ({ ...t, payload: 'json' }))} disabled={activeTab.payload === 'json'} />
                        <AnimatedIconButton icon={<FaTable className="inline-block" />} showFeedback={false} feedbackIcon={null} title="Table" onClick={() => setActiveTab(t => ({ ...t, payload: 'table' }))} disabled={activeTab.payload === 'table'} />
                        <AnimatedIconButton icon={<FaCopy />} showFeedback={copied === 'payload'} feedbackIcon={<FaCheckCircle />} title="Copy Payload" onClick={() => handleCopy(parseTimeFields(decoded.payload), 'payload')} disabled={false} />
                      </div>
                    </div>
                    {activeTab.payload === 'json' ? (
                      <pre className={`p-3 rounded text-xs overflow-x-auto border font-mono whitespace-pre-wrap break-words ${isDarkMode ? 'bg-gray-900 border-green-900 text-white' : 'bg-gray-900 border-green-900 text-white'}`}>{getPureJwtJson(decoded.payload)}</pre>
                    ) : (
                      <div className={`p-3 rounded text-xs overflow-x-auto border font-mono whitespace-pre-wrap break-words ${isDarkMode ? 'bg-gray-900 border-green-900 text-white' : 'bg-gray-900 border-green-900 text-white'}`}>{jsonToTable(decoded.payload)}</div>
                    )}
                    {/* Enhanced iat/exp feedback */}
                    {decoded && decoded.payload && (() => {
                      const obj = JSON.parse(decoded.payload);
                      const now = Math.floor(Date.now() / 1000);
                      let iatStatus = null, expStatus = null;
                      if (obj.iat) {
                        const issuedAgo = formatDuration(now - obj.iat);
                        iatStatus = (
                          <span className="flex items-center gap-2 mr-4" title="iat: Issued At">
                            <FaKey className="text-blue-400" />
                            <span className="font-semibold text-xs text-blue-400">Issued {issuedAgo} ago (iat: {obj.iat})</span>
                          </span>
                        );
                      }
                      if (obj.exp) {
                        const secondsLeft = obj.exp - now;
                        if (secondsLeft > 0) {
                          expStatus = (
                            <span className="flex items-center gap-2" title="exp: Expiry">
                              <FaCheckCircle className="text-green-400 animate-bounce" />
                              <span className="font-semibold text-xs text-green-400">Valid for {formatDuration(secondsLeft)} (exp: {obj.exp})</span>
                            </span>
                          );
                        } else {
                          expStatus = (
                            <span className="flex items-center gap-2" title="exp: Expiry">
                              <FaTimesCircle className="text-red-400 animate-pulse" />
                              <span className="font-semibold text-xs text-red-400">Expired {formatDuration(secondsLeft)} ago (exp: {obj.exp})</span>
                            </span>
                          );
                        }
                      }
                      return (
                        <div className="flex flex-wrap gap-4 mt-2">
                          {iatStatus}
                          {expStatus}
                        </div>
                      );
                    })()}
                  </div>
                  {/* Signature Section */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-bold ${isDarkMode ? 'text-pink-300' : 'text-pink-700'}`}>Signature</h3>
                      <AnimatedIconButton icon={<FaCopy />} showFeedback={copied === 'signature'} feedbackIcon={<FaCheckCircle />} title="Copy Signature" onClick={() => handleCopy(decoded.signature, 'signature')} disabled={false} />
                    </div>
                    <pre className={`p-3 rounded text-xs overflow-x-auto border font-mono whitespace-pre-wrap break-words ${isDarkMode ? 'bg-gray-900 border-pink-900 text-white' : 'bg-gray-900 border-pink-900 text-white'}`}>{decoded.signature}</pre>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-sm">Paste a valid JWT to see decoded details.</div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
