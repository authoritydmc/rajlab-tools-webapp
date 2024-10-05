import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import getIconByName from '../utils/getIconsUtil';
import { useTheme } from '../themeContext';
import { logFirebaseEvent } from '../firebaseConfig';
import Tooltip from '../utils/ToolTip';

export default function MainToolListPage() {
  const [toolCategories, setToolCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('category');
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const savedViewMode = localStorage.getItem('viewMode') || 'list';
    setViewMode(savedViewMode);

    const fetchData = async () => {
      try {
        const response = await fetch('/toolCategories.json');
        if (!response.ok) {
          console.error('Failed to fetch tool categories');
          return;
        }
        const data = await response.json();
        setToolCategories(data);
      } catch (error) {
        console.error('Error fetching tool categories:', error);
      }
    };

    fetchData();

    logFirebaseEvent('MainTool Page loaded', {
      page_title: "/",
      page_path: "/",
    });
  }, []);

  const setViewModeWithSave = (mode) => {
    localStorage.setItem('viewMode', mode);
    setViewMode(mode);
  };

  // Filtered tools based on search query
  const filteredTools = toolCategories.flatMap(category =>
    category.tools.filter(tool =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tool.description && tool.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  // Filtered categories based on search query
  const filteredCategories = toolCategories
    .map(category => ({
      ...category,
      tools: category.tools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.description && tool.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }))
    .filter(category => category.tools.length > 0);

  // Handler for card click
  const handleCardClick = (link) => {
    navigate(link);
  };

  return (
    <main
      className={`min-h-screen flex flex-col items-center gap-8 px-4 py-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
        }`}
    >
      {/* Search and View Mode Toggle */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
              }`}
          />
        </div>
        <div className="flex ml-4 space-x-2">
          <button
            onClick={() => setViewModeWithSave('category')}
            className={`p-2 rounded-md ${viewMode === 'category' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'} ${isDarkMode ? 'hover:bg-blue-700' : 'hover:bg-gray-300'}`}
            title="Category View"
          >
            {getIconByName('BiCategoryAlt')} {/* Get icon by name */}
          </button>
          <button
            onClick={() => setViewModeWithSave('list')}
            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'} ${isDarkMode ? 'hover:bg-blue-700' : 'hover:bg-gray-300'}`}
            title="List View"
          >
            {getIconByName('FaList')} {/* Get icon by name */}
          </button>
        </div>
      </div>

      {/* Tool Display */}
      <div className={`grid ${viewMode === 'category' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'} gap-6 w-full max-w-6xl`}>
        {viewMode === 'category' ? (
          filteredCategories.map((category, index) => (
            <div
              key={index}
              className={`shadow-md rounded-lg overflow-hidden border card-hover-border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                }`}
            >
              <div
                className={`p-6 border-b ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'
                  }`}
              >
                <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                <p className="text-sm text-gray-500">Explore the tools below</p>
              </div>
              <ul className="p-6 space-y-4">
                {category.tools.map((tool, toolIndex) => (
                  <li key={toolIndex} className={`flex flex-col space-y-2 ${tool.isEnabled ? 'text-gray-900' : 'text-gray-400'}`}>
                    {/* Icon and Link */}
                    <div className="flex items-center space-x-3">
                      <span
                        className={`flex-shrink-0 text-2xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}
                      >
                        {getIconByName(tool.iconName)} {/* Dynamically render icon */}
                      </span>
                      <Link
                        to={tool.link}
                        className={`flex-1 text-lg font-semibold ${tool.isEnabled ? 'text-blue-600 hover:underline' : 'text-gray-400'} ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-800'
                          }`}
                      >
                        {tool.name}
                      </Link>
                    </div>
                    {/* Tool Description */}
                    {tool.description && (
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {tool.description.split(' ').slice(0, 15).join(' ')}{tool.description.split(' ').length > 15 ? '...' : ''}
                    </p>
                  )}
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          filteredTools.map((tool, toolIndex) => (
            <div
              key={toolIndex}
              onClick={() => handleCardClick(tool.link)}
              className={`shadow-md rounded-lg overflow-hidden border card-hover-border card-hover-grow cursor-pointer ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                }`}
              style={{ aspectRatio: '1 / 1' }} // Ensures square aspect ratio
            >
              <div className={`p-6 flex flex-col items-center space-y-4 `}>
                <span className={`text-2xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                  {getIconByName(tool.iconName)} {/* Dynamically render icon */}
                </span>
                <div className="text-center">
                  <div
                    className={`block text-lg font-semibold ${tool.isEnabled ? 'text-blue-600 hover:underline' : 'text-gray-400'} ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-800'
                      }`}
                  >
                    {tool.name}
                  </div>
                  {tool.description && (
  <Tooltip tooltipText={tool.description}>
    <p
      className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} group`} // Add `group` class for hover effects
    >
      {tool.description.split(' ').slice(0, 15).join(' ')}{tool.description.split(' ').length > 15 ? '...' : ''}
    </p>
  </Tooltip>
)}


                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
