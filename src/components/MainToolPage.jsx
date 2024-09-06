import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowsAltH, FaCompressArrowsAlt, FaImage, FaCogs } from 'react-icons/fa'; // Import icons
import { useTheme } from '../providers/ThemeContext'; // Adjust path if necessary

export default function MainToolListPage() {
  const [toolCategories, setToolCategories] = useState([]);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Fetch the JSON data from the `data` folder
    const fetchData = async () => {
      try {
        const response = await fetch('/toolCategories.json'); // Update URL to match the location of your JSON file
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
  }, []);

  // Function to get icon based on iconName
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'sanitize':
        return <FaCogs />;
      case 'resizer':
        return <FaArrowsAltH />;
      case 'converter':
        return <FaCompressArrowsAlt />;
      default:
        return <FaImage />;
    }
  };

  return (
    <main
      className={`min-h-screen flex flex-col items-center gap-8 px-4 py-8 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
      }`}
    >
      <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
        Available Tools
      </h2>

      {/* List of Tool Categories */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl`}>
        {toolCategories.map((category, index) => (
          <div
            key={index}
            className={`shadow-md rounded-lg overflow-hidden border ${
              isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}
          >
            <div
              className={`p-6 border-b ${
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'
              }`}
            >
              <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
              <p className="text-sm text-gray-500">Explore the tools below</p>
            </div>
            <ul className="p-6 space-y-4">
              {category.tools.map((tool, toolIndex) => (
                <li key={toolIndex} className={`flex items-center space-x-3 ${tool.isEnabled ? 'text-gray-900' : 'text-gray-400'}`}>
                  <span
                    className={`flex-shrink-0 text-2xl ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {getIcon(tool.iconName)}
                  </span>
                  <Link
                    to={tool.link}
                    className={`flex-1 text-lg ${tool.isEnabled ? 'text-blue-600 hover:underline' : 'text-gray-400'} ${
                      isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-800'
                    }`}
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
