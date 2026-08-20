import React, { useState, useEffect } from 'react';
import { HiSpeakerWave, HiSpeakerXMark } from 'react-icons/hi2';
import { useTheme } from '../../themeContext';

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem('rajlabs_sound') !== 'off';
  });
  const { isDarkMode } = useTheme();

  useEffect(() => {
    localStorage.setItem('rajlabs_sound', enabled ? 'on' : 'off');
  }, [enabled]);

  useEffect(() => {
    window.__rajlabsSound = enabled;
  }, [enabled]);

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className={`fixed bottom-5 right-5 z-50 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-250 active:scale-90 ${
        enabled
          ? isDarkMode
            ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/20 shadow-lg shadow-indigo-500/10'
            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 shadow-lg shadow-indigo-500/10'
          : isDarkMode
            ? 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/[0.06]'
            : 'bg-slate-100 text-slate-400 hover:bg-slate-200 border border-slate-200'
      }`}
      title={enabled ? 'Mute sounds' : 'Enable sounds'}
    >
      {enabled ? <HiSpeakerWave size={18} /> : <HiSpeakerXMark size={18} />}
    </button>
  );
}
