import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  FaHeart,
  FaStar,
  FaExternalLinkAlt,
  FaTimes,
  FaCheckCircle,
  FaCopy,
  FaCheck,
  FaQrcode,
  FaGlobe,
  FaMobileAlt,
  FaCreditCard,
  FaRupeeSign,
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';
import SteamingChaiIcon from './SteamingChaiIcon';
import { SUPPORT_UPI_ID, SUPPORT_UPI_NAME, CASHFREE_URL, BMC_URL } from '../../config';
import { useTheme } from '../../themeContext';
import { submitFeedbackToFirestore, submitRatingToFirestore } from '../../utils/feedbackService';
import { logFirebaseEvent } from '../../firebaseConfig';

const UPI_PRESETS = [
  { amount: 21, label: 'Shubh Shuruat', emoji: '🪔' },
  { amount: 49, label: 'Cutting Chai', emoji: '☕' },
  { amount: 99, label: 'Special Masala Chai', emoji: '☕🫖' },
  { amount: 199, label: 'Chai & Samosa', emoji: '☕🥟' },
  { amount: 499, label: 'Pro Supporter', emoji: '🚀' },
];

const QR_THEMES = [
  { id: 'emerald', label: 'Emerald', dot: 'bg-emerald-500', dark: '#064e3b', badgeGradient: 'from-emerald-500 to-teal-600', ring: 'ring-emerald-400', border: 'border-emerald-500/40', text: 'text-emerald-400' },
  { id: 'amber', label: 'Chai Gold', dot: 'bg-amber-500', dark: '#451a03', badgeGradient: 'from-amber-500 to-orange-600', ring: 'ring-amber-400', border: 'border-amber-500/40', text: 'text-amber-400' },
  { id: 'indigo', label: 'Midnight', dot: 'bg-indigo-500', dark: '#0f172a', badgeGradient: 'from-indigo-500 to-blue-600', ring: 'ring-indigo-400', border: 'border-indigo-500/40', text: 'text-indigo-400' },
  { id: 'violet', label: 'UPI Purple', dot: 'bg-purple-500', dark: '#3b0764', badgeGradient: 'from-purple-500 to-fuchsia-600', ring: 'ring-purple-400', border: 'border-purple-500/40', text: 'text-purple-400' },
];

export default function SupportChaiModal({
  isOpen,
  onClose,
  downloadLabel = '',
}) {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('upi');
  const [selectedAmount, setSelectedAmount] = useState(49);
  const [customAmount, setCustomAmount] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [rating, setRating] = useState(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittedRating, setSubmittedRating] = useState(false);
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [qrTheme, setQrTheme] = useState(() => {
    const randomIndex = Math.floor(Math.random() * QR_THEMES.length);
    return QR_THEMES[randomIndex].id;
  });

  // Pick a fresh aesthetic theme on open & handle escape key
  useEffect(() => {
    if (isOpen) {
      const randomIndex = Math.floor(Math.random() * QR_THEMES.length);
      setQrTheme(QR_THEMES[randomIndex].id);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentTheme = QR_THEMES.find(t => t.id === qrTheme) || QR_THEMES[0];
  const currentAmount = customAmount ? Math.max(1, parseInt(customAmount, 10) || 0) : selectedAmount;

  // Standard Indian UPI Intent URL
  const upiPayUrl = `upi://pay?pa=${encodeURIComponent(SUPPORT_UPI_ID)}&pn=${encodeURIComponent(
    SUPPORT_UPI_NAME
  )}&am=${currentAmount}&cu=INR&tn=${encodeURIComponent(downloadLabel ? `${downloadLabel} Supporter` : 'Rajlabs Utilities Supporter')}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(SUPPORT_UPI_ID).then(() => {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    });
  };

  // Persist rating to Firestore + localStorage fallback
  const handleRate = async (stars) => {
    setRating(stars);
    setSubmittedRating(true);
    const toolLabel = downloadLabel || 'General';

    // Local cache (offline fallback + instant UX)
    try {
      const stored = JSON.parse(localStorage.getItem('rajlab_user_feedback') || '[]');
      stored.push({ rating: stars, downloadLabel: toolLabel, timestamp: new Date().toISOString(), source: 'local' });
      localStorage.setItem('rajlab_user_feedback', JSON.stringify(stored));
    } catch {
      // Ignore storage errors
    }

    // Firestore
    try {
      await submitRatingToFirestore({ rating: stars, tool: toolLabel });
      logFirebaseEvent('rate_tool', { rating: stars, tool: toolLabel });
    } catch (err) {
      console.warn('[feedback] Firestore rating save failed, kept in localStorage:', err?.message);
    }
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    const trimmed = feedbackComment.trim();
    if (!trimmed && !rating) return;
    setSubmittingComment(true);
    const toolLabel = downloadLabel || 'General';
    const payload = { rating: rating || 5, comment: trimmed, tool: toolLabel };

    // Firestore — primary store
    try {
      await submitFeedbackToFirestore(payload);
      logFirebaseEvent('submit_feedback', { rating: payload.rating, tool: toolLabel, has_comment: !!trimmed });
    } catch (err) {
      console.warn('[feedback] Firestore feedback save failed:', err?.message);
      // still continue to local fallback so UX isn't blocked
    }

    // Local cache as backup / offline queue
    try {
      const stored = JSON.parse(localStorage.getItem('rajlab_user_feedback') || '[]');
      stored.push({ ...payload, downloadLabel: toolLabel, timestamp: new Date().toISOString(), source: 'firestore_attempted' });
      localStorage.setItem('rajlab_user_feedback', JSON.stringify(stored));
    } catch {
      // Ignore storage errors
    }

    setSubmittingComment(false);
    setCommentSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-7 relative text-left transition-all duration-300 space-y-4 max-h-[94vh] overflow-y-auto ${
          isDarkMode
            ? 'bg-slate-900/95 border border-amber-500/30 text-slate-100 shadow-amber-500/10'
            : 'bg-white border border-amber-500/40 text-slate-900 shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Glowing Gradients */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-xl border transition z-10 ${
            isDarkMode
              ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 border-slate-200'
          }`}
          aria-label="Close modal"
        >
          <FaTimes className="w-4 h-4" />
        </button>

        {/* Header with Download Status Pill or Support Badge */}
        <div className="flex items-center gap-2.5 flex-wrap pr-8">
          {downloadLabel ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 dark:text-emerald-300 text-xs font-bold shadow-sm">
              <FaCheckCircle className="w-3.5 h-3.5" />
              Download Complete
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-300 text-xs font-bold shadow-sm">
              <HiSparkles className="w-3.5 h-3.5" />
              Support Rajlabs
            </span>
          )}
          {downloadLabel && (
            <span className={`text-xs font-mono truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {downloadLabel}
            </span>
          )}
        </div>

        {/* Hero Section with Steaming Animated Chai Cup */}
        <div className="flex items-start gap-3.5">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-500/25 via-amber-600/20 to-amber-700/30 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/15 p-2">
            <SteamingChaiIcon size={36} />
          </div>
          <div>
            <h3 className={`text-lg sm:text-xl font-black tracking-tight leading-snug ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {downloadLabel ? 'Saved you time & manual work?' : 'Enjoying Rajlabs Utilities?'}
            </h3>
            <p className={`text-xs mt-0.5 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Rajlabs Utilities is <strong>100% free, private &amp; client-side</strong> — zero data stored on servers. Help keep it fast, ad-free &amp; actively maintained with a cutting chai!
            </p>
          </div>
        </div>

        {/* Payment Method Switcher Tabs */}
        <div className={`flex rounded-2xl p-1 border gap-1 ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
          <button
            type="button"
            onClick={() => setActiveTab('upi')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upi'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20'
                : isDarkMode
                ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <FaQrcode className="w-3.5 h-3.5" />
            <span>Instant UPI QR (GPay / PhonePe)</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">🇮🇳 INR</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bmc')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'bmc'
                ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : isDarkMode
                ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <FaGlobe className="w-3.5 h-3.5" />
            <span>Cards / International</span>
            <span className="text-[10px] bg-amber-400/20 text-amber-500 dark:text-amber-300 px-1.5 py-0.5 rounded-full font-bold">🌍 Global</span>
          </button>
        </div>

        {/* Tab 1: UPI Direct Integration */}
        {activeTab === 'upi' && (
          <div className={`space-y-3.5 border rounded-2xl p-4 transition-all ${isDarkMode ? 'bg-slate-800/40 border-slate-700/80' : 'bg-slate-50 border-slate-200'}`}>
            {/* Amount Selection Chips */}
            <div className="space-y-1.5">
              <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <FaRupeeSign className="w-3 h-3 text-emerald-500" />
                Select Chai Amount
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {UPI_PRESETS.map((preset) => (
                  <button
                    key={preset.amount}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(preset.amount);
                      setCustomAmount('');
                    }}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      selectedAmount === preset.amount && !customAmount
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400 ring-1 ring-emerald-400 font-bold'
                        : isDarkMode
                        ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`text-xs font-black ${selectedAmount === preset.amount && !customAmount ? 'text-emerald-400 dark:text-emerald-300' : isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      ₹{preset.amount}
                    </div>
                    <div className="text-[9px] opacity-75 truncate mt-0.5">
                      {preset.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold opacity-60">₹</span>
                <input
                  type="number"
                  placeholder="Or enter custom amount (₹)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className={`w-full pl-7 pr-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 transition ${
                    isDarkMode
                      ? 'bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                  min="1"
                />
              </div>
              <div className="text-xs font-mono font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-xl shrink-0">
                ₹{currentAmount} INR
              </div>
            </div>

            {/* Dynamic QR Code & UPI Details */}
            <div className={`flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-700' : 'bg-white border-slate-200'}`}>
              {/* QR Image with Scanner Frame & Center Rupee Badge */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className={`relative bg-white p-2.5 rounded-2xl shadow-lg flex items-center justify-center border ${currentTheme.border} transition-all duration-300 group`}>
                  {/* Scanner Corner Accents */}
                  <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-500 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-500 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-500 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-500 rounded-br-lg" />

                  <QRCodeSVG
                    value={upiPayUrl}
                    size={135}
                    level="H"
                    includeMargin={false}
                    fgColor={currentTheme.dark}
                    bgColor="#ffffff"
                    className="rounded-xl"
                  />

                  {/* Center Emblem: Indian Rupee Dynamic Amount Pill */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                    <div className="bg-white border-2 border-emerald-500 rounded-full p-0.5 shadow-md flex items-center justify-center">
                      <div className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${currentTheme.badgeGradient} flex items-center gap-0.5 shadow-inner`}>
                        <span className="text-white font-black text-[11px] tracking-tight select-none font-mono">
                          ₹{currentAmount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  ⚡ Fast &amp; Direct to Bank
                </span>
              </div>

              {/* QR instructions and App Launch */}
              <div className="flex-1 space-y-2.5 min-w-0 text-center sm:text-left">
                <div>
                  <div className={`text-xs font-black flex items-center justify-center sm:justify-start gap-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <span>Scan with any UPI App</span>
                  </div>
                  <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    GPay • PhonePe • Paytm • BHIM • Cred • Amazon Pay
                  </p>
                </div>

                {/* Copy UPI ID Pill */}
                <div className={`flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono border ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                  <span className={`truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{SUPPORT_UPI_ID}</span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="p-1 rounded-lg hover:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center gap-1 text-[11px] font-sans font-bold shrink-0 transition"
                  >
                    {copiedUpi ? <FaCheck className="w-3.5 h-3.5" /> : <FaCopy className="w-3.5 h-3.5" />}
                    <span>{copiedUpi ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                {/* Direct Mobile UPI Link */}
                <a
                  href={upiPayUrl}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <FaMobileAlt className="w-3.5 h-3.5" />
                  <span>Pay ₹{currentAmount} via UPI App</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Cards, Netbanking & International (Cashfree + Buy Me a Coffee) */}
        {activeTab === 'bmc' && (
          <div className={`space-y-3.5 border rounded-2xl p-4 transition-all ${isDarkMode ? 'bg-slate-800/40 border-slate-700/80' : 'bg-slate-50 border-slate-200'}`}>
            {/* Recommended: Cashfree Payments (Cards, Netbanking, Wallets, UPI) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-500 dark:text-cyan-400 flex items-center gap-1.5">
                <FaCreditCard className="w-3.5 h-3.5" />
                Recommended for Indian Cards &amp; Netbanking
              </span>

              <a
                href={CASHFREE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`group block p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 shadow-lg hover:-translate-y-0.5 ${
                  isDarkMode
                    ? 'bg-gradient-to-br from-cyan-950/60 via-slate-900 to-emerald-950/40 border-cyan-400/60 ring-2 ring-cyan-400/20 hover:border-cyan-300'
                    : 'bg-gradient-to-br from-cyan-50 via-white to-emerald-50 border-cyan-500 ring-2 ring-cyan-500/20 hover:border-cyan-600'
                }`}
              >
                <div className="flex items-start gap-3.5 mb-3">
                  <div className={`w-12 h-12 rounded-xl p-2 flex items-center justify-center shrink-0 shadow-md border ${isDarkMode ? 'bg-slate-800 border-cyan-500/30 text-cyan-400' : 'bg-white border-cyan-200 text-cyan-600'}`}>
                    <FaCreditCard size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className={`text-sm sm:text-base font-black transition-colors ${isDarkMode ? 'text-white group-hover:text-cyan-200' : 'text-slate-900 group-hover:text-cyan-700'}`}>
                        Pay via Cards &amp; Netbanking
                      </h4>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-500 dark:text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-500/40">
                        🇮🇳 Zero Extra Fees
                      </span>
                    </div>
                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Support <strong>Rajlabs</strong> &middot; Instant Receipt
                    </div>
                  </div>
                </div>

                <div className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 hover:from-cyan-400 hover:to-teal-300 text-slate-950 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-transform group-hover:scale-[1.01]">
                  <FaCreditCard className="w-4 h-4" />
                  <span>Pay via Cashfree (Cards, Netbanking, UPI)</span>
                  <FaExternalLinkAlt className="w-3 h-3 opacity-80" />
                </div>

                <div className={`mt-3 pt-2 border-t flex flex-wrap items-center justify-between gap-1.5 text-[10px] sm:text-[11px] ${isDarkMode ? 'border-cyan-500/20 text-slate-400' : 'border-cyan-200 text-slate-500'}`}>
                  <span>Visa &middot; Mastercard &middot; RuPay &middot; Netbanking &middot; Wallets</span>
                  <span className="text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-1">
                    🔒 100% Secure Checkout
                  </span>
                </div>
              </a>
            </div>

            {/* Option 2: Buy Me a Coffee (Global / USD / PayPal) */}
            <div className={`pt-2 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                International Cards / PayPal (USD)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs mb-2.5">
                <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <span className="text-[9px] uppercase font-bold opacity-60 block">1 Coffee ($3 USD)</span>
                  <span className="font-black text-amber-500 dark:text-amber-300 text-xs">≈ ₹250 INR</span>
                </div>
                <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <span className="text-[9px] uppercase font-bold opacity-60 block">3 Coffees ($5 USD)</span>
                  <span className="font-black text-amber-500 dark:text-amber-300 text-xs">≈ ₹420 INR</span>
                </div>
              </div>

              <a
                href={BMC_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.01]"
              >
                <SteamingChaiIcon size={18} />
                <span>Support via Buy Me a Coffee ($3 / ₹250)</span>
                <FaExternalLinkAlt className="w-3 h-3 opacity-70 group-hover:opacity-100" />
              </a>
            </div>
          </div>
        )}

        {/* Quick Satisfaction Rating & Feedback Note */}
        <div className={`border rounded-2xl p-3.5 space-y-2.5 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <HiSparkles className="w-3.5 h-3.5 text-amber-400" />
              How was your tool experience?
            </span>
            {submittedRating && (
              <span className="text-[11px] text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-1">
                <FaCheckCircle className="w-3 h-3" /> Rating Saved!
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 pt-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRate(star)}
                className={`p-1.5 rounded-xl transition-transform hover:scale-125 cursor-pointer ${
                  (rating ?? 0) >= star ? 'text-amber-400' : isDarkMode ? 'text-slate-600 hover:text-amber-300' : 'text-slate-300 hover:text-amber-400'
                }`}
                title={`Rate ${star} star`}
              >
                <FaStar className="w-5 h-5" />
              </button>
            ))}
          </div>

          {/* Optional Note / Feature Request Form */}
          {submittedRating && !commentSubmitted && (
            <form onSubmit={handleSendComment} className={`pt-2 border-t space-y-2 ${isDarkMode ? 'border-slate-700/60' : 'border-slate-200'}`}>
              <input
                type="text"
                placeholder="What worked well or what can we improve? (optional)"
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                maxLength={500}
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-amber-400 transition ${
                  isDarkMode
                    ? 'bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                }`}
              />
              <div className="flex items-center justify-between">
                <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Stored in Firestore &middot; Anonymous &middot; Zero PII
                </span>
                <button
                  type="submit"
                  disabled={submittingComment || !feedbackComment.trim()}
                  className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-300 font-bold text-xs border border-amber-500/30 disabled:opacity-40 transition cursor-pointer"
                >
                  {submittingComment ? 'Sending…' : 'Send Feedback'}
                </button>
              </div>
            </form>
          )}

          {commentSubmitted && (
            <div className="pt-1.5 text-center text-xs text-emerald-500 dark:text-emerald-400 font-bold flex items-center justify-center gap-1.5">
              <FaCheckCircle className="w-4 h-4" /> Thank you! Your feedback helps us improve Rajlabs Utilities.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-2 text-xs pt-1 border-t ${isDarkMode ? 'border-slate-700/60 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
          <div className="flex items-center gap-2 text-[11px]">
            <span>🔒 100% Client-Side Privacy</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              Made with <FaHeart className="w-3 h-3 text-rose-500" /> by <strong>Raj Dubey</strong>
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 font-medium underline-offset-4 hover:underline transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
