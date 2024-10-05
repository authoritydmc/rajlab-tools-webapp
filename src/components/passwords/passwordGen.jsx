import React, { useState, useEffect } from 'react';
import { FaClipboard, FaTrash } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import {  fetchDescriptionByLink } from '../../utils/metaUtils';

export default function PasswordGenerator() {
  const { isDarkMode } = useTheme(); // Access theme context

  // Define default settings
  const initialSettings = {
    passwordLength: 16,
    includeNumbers: true,
    includeLowercase: true,
    includeUppercase: true,
    includeSymbols: true,
    avoidAmbiguous: true,
    useCustomCharacters: false, // New option for custom characters
    customCharacters: '', // To hold user-defined characters
  };

  // State to hold settings
  const [settings, setSettings] = useState(initialSettings);
  const [generatedPasswords, setGeneratedPasswords] = useState([]); // Array to hold generated passwords

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('passwordGeneratorSettings'));
    if (savedSettings) {
    //   console.log("found saved settings: " + JSON.stringify(savedSettings));
      setSettings(prevSettings => ({
        ...prevSettings,
        ...savedSettings,
      }));
    }
  }, []);
 // Set document title and fetch the description based on the key
useEffect(() => {
    document.title = 'Strong Password Generator | Rajlabs'; // Set the document title
    
    const setMetaDescriptionFromLink = async (key) => {
      const description = await fetchDescriptionByLink(key); // Fetch the description using the link
      console.log("found Description "+description);
      
      // Check for existing meta description tag and update or create one
      let metaTag = document.querySelector('meta[name="description"]');
      if (metaTag) {
        metaTag.content = description; // Update existing meta tag content
      } else {
        // Create a new meta tag if it doesn't exist
        metaTag = document.createElement('meta');
        metaTag.name = 'description';
        metaTag.content = description; // Set the fetched description
        document.head.appendChild(metaTag);
      }
    };
  
    // Call function with desired key (adjust as needed)
    setMetaDescriptionFromLink('/password-generator');
  
    return () => {
      document.title = 'Utilities || Rajlabs'; // Reset title on unmount
  
      // Optionally, remove the meta description on unmount
      const metaTag = document.querySelector('meta[name="description"]');
      if (metaTag) {
        document.head.removeChild(metaTag); // Clean up the meta tag on unmount
      }
    };
  }, []);
  

  // Function to save settings to localStorage
  const saveSettings = (newSettings) => {
    // console.log("updating settings in localStorage to ", JSON.stringify(newSettings));
    localStorage.setItem('passwordGeneratorSettings', JSON.stringify(newSettings));
  };

  // Function to handle setting changes
  const handleSettingChange = (key, value) => {
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings, [key]: value };
      // If using custom characters, deselect all other options
      if (key === 'useCustomCharacters' && value) {
        return {
          ...newSettings,
          includeNumbers: false,
          includeLowercase: false,
          includeUppercase: false,
          includeSymbols: false,
        };
      }
      saveSettings(newSettings); // Save the updated settings to localStorage
      return newSettings;
    });
  };

  // Function to generate a random password based on selected options
  const generatePasswords = () => {
    const numbers = '0123456789';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const symbols = '!#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
    const ambiguousCharacters = 'lO0I1'; // Characters to avoid

    let charset = '';

    // Use custom characters if the option is selected
    if (settings.useCustomCharacters) {
      charset = settings.customCharacters;
    } else {
      // Otherwise, build charset from selected options
      if (settings.includeNumbers) charset += numbers;
      if (settings.includeLowercase) charset += lowercase;
      if (settings.includeUppercase) charset += uppercase;
      if (settings.includeSymbols) charset += symbols;

      // Option to avoid ambiguous characters
      if (settings.avoidAmbiguous) {
        charset = charset.split('').filter(char => !ambiguousCharacters.includes(char)).join('');
      }
    }

    // Ensure charset is not empty
    if (charset.length === 0) {
      toast.error('Please select at least one character type or provide custom characters!');
      return;
    }

    const passwords = [];
    for (let j = 0; j < 5; j++) { // Generate 5 passwords
      let password = '';
      for (let i = 0; i < settings.passwordLength; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
      }
      passwords.push(password);
    }

    setGeneratedPasswords(passwords);
  };

  // Function to handle "Copy to Clipboard" when a password is clicked
  const handleCopyToClipboard = (password) => {
    navigator.clipboard.writeText(password);
    toast.success(`Copied: ${password}`); // Show toast notification
  };

  // Function to handle "Clear" button click
  const handleClear = () => {
    setGeneratedPasswords([]);
  };

  return (
    <div
      className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-green-50 text-gray-900'} transition-colors duration-300`}
    >
      <h1 className="text-3xl font-bold mb-8 text-center">Password Generator</h1>
      <Toaster /> {/* Toast container */}

      <div
        className={`max-w-2xl mx-auto p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-150 border-gray-300'} border`}
      >
        {/* Options Section */}
        <div className="mb-6">
          <label className="block mb-2">Password Length:</label>
          <input
            type="number"
            value={settings.passwordLength}
            onChange={(e) => handleSettingChange('passwordLength', Number(e.target.value))}
            min="1"
            className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
          />
        </div>

        <div className="flex flex-col mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.includeNumbers}
              onChange={() => handleSettingChange('includeNumbers', !settings.includeNumbers)}
              disabled={settings.useCustomCharacters} // Disable if custom characters are used
            />
            <span className="ml-2">Include Numbers (0-9)</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.includeLowercase}
              onChange={() => handleSettingChange('includeLowercase', !settings.includeLowercase)}
              disabled={settings.useCustomCharacters} // Disable if custom characters are used
            />
            <span className="ml-2">Include Lowercase Letters (a-z)</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.includeUppercase}
              onChange={() => handleSettingChange('includeUppercase', !settings.includeUppercase)}
              disabled={settings.useCustomCharacters} // Disable if custom characters are used
            />
            <span className="ml-2">Include Uppercase Letters (A-Z)</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.includeSymbols}
              onChange={() => handleSettingChange('includeSymbols', !settings.includeSymbols)}
              disabled={settings.useCustomCharacters} // Disable if custom characters are used
            />
            <span className="ml-2">Include Symbols (!@#$%^&*...)</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.avoidAmbiguous}
              onChange={() => handleSettingChange('avoidAmbiguous', !settings.avoidAmbiguous)}
              disabled={settings.useCustomCharacters} // Disable if custom characters are used
            />
            <span className="ml-2">Avoid Ambiguous Characters (l, O, 0, 1)</span>
          </label>
        </div>

        {/* Custom Characters Option */}
        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={settings.useCustomCharacters}
            onChange={() => handleSettingChange('useCustomCharacters', !settings.useCustomCharacters)}
          />
          <span className="ml-2">Use Following Characters Only:</span>
        </label>
        {settings.useCustomCharacters && (
          <input
            type="text"
            value={settings.customCharacters}
            onChange={(e) => handleSettingChange('customCharacters', e.target.value)}
            placeholder="Enter custom characters"
            className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
          />
        )}

        {/* Generate Button */}
        <button
          onClick={generatePasswords}
          className={`w-full p-2 mb-4 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          Generate Passwords
        </button>
        {/* Instructions for Clicking Passwords */}

        {generatedPasswords.length > 0 && 
        <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Click on any password to copy it to the clipboard.
        </p>
}
        {/* Output Section */}
        <div className="relative mb-4">
          <div className={`w-full border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}>
            {/* Show the trash icon only if there are generated passwords */}
            {generatedPasswords.length > 0 && (
              <button
                onClick={handleClear}
                className={`absolute top-2 right-2 p-2 rounded-full hover:bg-gray-600 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
              >
                <FaTrash />
              </button>
            )}
            {generatedPasswords.map((password, index) => (
              <div
                key={index}
                className={`p-2 cursor-pointer transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-600 hover:text-white' : 'hover:bg-gray-200 hover:text-gray-900'}`}
                onClick={() => handleCopyToClipboard(password)} // Copy password on click
              >
                {password}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions Section */}
        <div className="mt-4 text-sm text-gray-500">
          <h2 className="font-semibold">Instructions:</h2>
          <p>Select options above to customize your password. Clicking on a password will copy it to the clipboard. Including different character types makes your password stronger. For example:</p>
          <ul className="list-disc list-inside">
            <li>Numbers: Increases complexity</li>
            <li>Lowercase letters: Adds variety</li>
            <li>Uppercase letters: Further increases strength</li>
            <li>Symbols: Makes passwords harder to guess</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
