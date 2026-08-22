import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../themeContext';

interface Crumb {
  name: string;
  link?: string;
}

/**
 * Breadcrumbs component renders a navigation trail.
 * It adapts to dark/light mode using the theme context.
 */
const Breadcrumbs: React.FC<{ crumbs: Crumb[] }> = ({ crumbs }) => {
  const { isDarkMode } = useTheme();
  const textClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const separatorClass = isDarkMode ? 'text-gray-500' : 'text-gray-400';

  return (
    <nav className={`flex items-center space-x-2 text-sm mb-4 ${textClass}`} aria-label="breadcrumb">
      {crumbs.map((crumb, idx) => (
        <React.Fragment key={idx}>
          {crumb.link ? (
            <Link to={crumb.link} className={`hover:underline ${textClass}`}> {crumb.name} </Link>
          ) : (
            <span className="font-medium">{crumb.name}</span>
          )}
          {idx < crumbs.length - 1 && <span className={separatorClass}>/</span>}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
