import React from 'react';

export default function SteamingChaiIcon({
  className = '',
  size = 26,
  steamColor = '#fef08a',
}) {
  return (
    <span
      className={`inline-flex items-center justify-center relative shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="chaiCupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="45%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>

          <linearGradient id="hotTeaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          <filter id="steamFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="0.8" floodColor="#fef08a" floodOpacity="0.8" />
          </filter>
        </defs>

        <style>{`
          @keyframes steamRiseLeft {
            0% { transform: translateY(0) scaleX(1); opacity: 0; }
            30% { opacity: 0.95; }
            70% { opacity: 0.7; }
            100% { transform: translateY(-9px) scaleX(1.35) translateX(-1px); opacity: 0; }
          }
          @keyframes steamRiseCenter {
            0% { transform: translateY(0) scaleX(1); opacity: 0; }
            35% { opacity: 1; }
            75% { opacity: 0.75; }
            100% { transform: translateY(-11px) scaleX(1.4) translateX(1px); opacity: 0; }
          }
          @keyframes steamRiseRight {
            0% { transform: translateY(0) scaleX(1); opacity: 0; }
            30% { opacity: 0.9; }
            70% { opacity: 0.65; }
            100% { transform: translateY(-8.5px) scaleX(1.3) translateX(1.5px); opacity: 0; }
          }
          @keyframes simmerBubble {
            0%, 100% { transform: scale(0.85); opacity: 0.6; }
            50% { transform: scale(1.3) translateY(-0.8px); opacity: 1; }
          }
          @keyframes teaShimmer {
            0%, 100% { opacity: 0.85; }
            50% { opacity: 1; }
          }
          .steam-left {
            animation: steamRiseLeft 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            transform-origin: center bottom;
          }
          .steam-mid {
            animation: steamRiseCenter 2.4s cubic-bezier(0.4, 0, 0.2, 1) 0.4s infinite;
            transform-origin: center bottom;
          }
          .steam-right {
            animation: steamRiseRight 1.9s cubic-bezier(0.4, 0, 0.2, 1) 0.9s infinite;
            transform-origin: center bottom;
          }
          .simmer-b1 {
            animation: simmerBubble 1.2s ease-in-out infinite;
            transform-origin: center;
          }
          .simmer-b2 {
            animation: simmerBubble 1.6s ease-in-out 0.3s infinite;
            transform-origin: center;
          }
          .simmer-b3 {
            animation: simmerBubble 1.4s ease-in-out 0.7s infinite;
            transform-origin: center;
          }
        `}</style>

        {/* 3 Hot Animated Rising Steam Plumes with glowing filter */}
        <g stroke={steamColor} strokeWidth="1.75" strokeLinecap="round" filter="url(#steamFilter)">
          <path
            d="M 10 11 Q 8 7 10 3.5 Q 11.5 1 9.5 -2"
            className="steam-left"
            fill="none"
          />
          <path
            d="M 15.5 10 Q 17.5 6 15 2.5 Q 13 -0.5 15.5 -3"
            className="steam-mid"
            fill="none"
          />
          <path
            d="M 21 11 Q 23.5 7.5 21.5 4 Q 20 1 22 -1.5"
            className="steam-right"
            fill="none"
          />
        </g>

        {/* Saucer / Plate */}
        <ellipse cx="16" cy="27.5" rx="12.5" ry="2.5" fill="#451a03" opacity="0.6" />
        <ellipse cx="16" cy="27" rx="11" ry="2" fill="url(#chaiCupGrad)" />
        <ellipse cx="16" cy="26.5" rx="9" ry="1.2" fill="#78350f" opacity="0.7" />

        {/* Chai Glass Cup (Authentic Indian Tapri Cutting Glass Shape) */}
        <path
          d="M 6.5 12.5 L 9.5 24.5 C 9.8 25.5 10.8 26 12 26 L 20 26 C 21.2 26 22.2 25.5 22.5 24.5 L 25.5 12.5 C 25.8 11.2 24.8 10 23.5 10 L 8.5 10 C 7.2 10 6.2 11.2 6.5 12.5 Z"
          fill="url(#chaiCupGrad)"
          stroke="#78350f"
          strokeWidth="0.8"
        />

        {/* Cup Handle */}
        <path
          d="M 24 13 C 27.8 13.5 28.8 17.5 27 20 C 25.5 22 22.8 21.2 22.5 20.8"
          stroke="#d97706"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Hot Steaming Chai Surface */}
        <ellipse cx="16" cy="11.5" rx="8" ry="2.2" fill="#451a03" />
        <ellipse cx="16" cy="11.2" rx="7.2" ry="1.8" fill="url(#hotTeaGrad)" />

        {/* Active Simmering Boiling Bubbles */}
        <g fill="#fef9c3">
          <circle cx="13" cy="11" r="1.1" className="simmer-b1" />
          <circle cx="18.5" cy="11.3" r="1.2" className="simmer-b2" />
          <circle cx="15.8" cy="10.8" r="0.8" className="simmer-b3" />
          <circle cx="11.5" cy="11.4" r="0.6" opacity="0.8" />
          <circle cx="20" cy="11" r="0.7" opacity="0.8" />
        </g>

        {/* Glass vertical fluting / ribs */}
        <path d="M 11.5 14 L 13 23" stroke="#fef3c7" strokeWidth="0.85" opacity="0.4" strokeLinecap="round" />
        <path d="M 16 14 L 16 23.5" stroke="#fef3c7" strokeWidth="1" opacity="0.5" strokeLinecap="round" />
        <path d="M 20.5 14 L 19 23" stroke="#fef3c7" strokeWidth="0.85" opacity="0.4" strokeLinecap="round" />

        {/* Glossy light reflection highlight */}
        <path
          d="M 8.5 13.5 Q 10 18 11 23"
          stroke="#ffffff"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>
    </span>
  );
}
