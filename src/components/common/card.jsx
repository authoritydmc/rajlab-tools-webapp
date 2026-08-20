import React from 'react';

// Reusable Card component
const Card = ({ title, children, isDarkMode }) => {
  return (
    <div className={`rounded-lg shadow-md p-4 mb-4 ${isDarkMode ? 'bg-slate-900/60 backdrop-blur-xl' : 'bg-white/60 backdrop-blur-xl'}`}>
      <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
        {title}
      </h3>
      {children}
    </div>
  );
};

export default Card;
