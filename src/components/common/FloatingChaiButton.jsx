import React from 'react';
import SteamingChaiIcon from './SteamingChaiIcon';
import { useChaiModal } from '../../chaiModalContext';
import { useTheme } from '../../themeContext';

export default function FloatingChaiButton() {
  const { openChaiModal } = useChaiModal();
  const { isDarkMode } = useTheme();

  return (
    <button
      type="button"
      onClick={() => openChaiModal('')}
      aria-label="Support Rajlabs Utilities with a cutting chai via UPI"
      title="Support Rajlabs Utilities with a cutting chai / UPI"
      className={`fixed bottom-20 right-5 z-40 group flex items-center gap-2.5 p-2.5 sm:px-4 sm:py-2.5 rounded-full backdrop-blur-xl border shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer ${
        isDarkMode
          ? 'bg-slate-900/90 hover:bg-slate-800 border-amber-500/40 hover:border-amber-400 text-slate-100 shadow-black/80 hover:shadow-amber-500/20'
          : 'bg-white/95 hover:bg-white border-amber-500/50 hover:border-amber-500 text-slate-800 shadow-slate-300/80 hover:shadow-amber-500/25'
      }`}
    >
      <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
        <SteamingChaiIcon size={22} steamColor="#fde047" />
      </div>
      <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold tracking-tight">
        <span>Support via</span>
        <span className="text-amber-500 dark:text-amber-300 font-extrabold">Chai</span>
        <span className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}>/</span>
        <span className="text-emerald-500 dark:text-emerald-400 font-extrabold">UPI</span>
      </span>
    </button>
  );
}
