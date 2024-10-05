import React from 'react';

const Tooltip = ({ children, tooltipText }) => {
  return (
    <div className="relative inline-block">
      {/* The text that is wrapped around the tooltip */}
      {children}

      {/* The tooltip itself */}
      <div className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2 -bottom-6 left-1/2 transform -translate-x-1/2 z-10">
        {tooltipText}
      </div>
    </div>
  );
};

export default Tooltip;
