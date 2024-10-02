import React, { useState, useEffect } from 'react';
import { FaClipboard, FaTrash } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';

export default function PasswordGenerator() {
  const { isDarkMode } = useTheme(); // Access theme context

  // Define default settings
  const initialSettings = {
    passwordLength: 16,
    includeNumbers: true,
    includeLowercase: true,
    includeUppercase: true,
    includeSymbols: true,
    avoidAmbiguous: false,
  };

  const [passwordLength, setPasswordLength] = useState();
  const [includeNumbers, setIncludeNumbers] = useState();
  const [includeLowercase, setIncludeLowercase] = useState();
  const [includeUppercase, setIncludeUppercase] = useState();
  const [includeSymbols, setIncludeSymbols] = useState();
  const [avoidAmbiguous, setAvoidAmbiguous] = useState();
  const [generatedPasswords, setGeneratedPasswords] = useState([]); // Array to hold generated passwords

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('passwordGeneratorSettings'));
    if (savedSettings) {
      setPasswordLength(savedSettings.passwordLength || initialSettings.passwordLength);
      setIncludeNumbers(savedSettings.includeNumbers !== undefined ? savedSettings.includeNumbers : initialSettings.includeNumbers);
      setIncludeLowercase(savedSettings.includeLowercase !== undefined ? savedSettings.includeLowercase : initialSettings.includeLowercase);
      setIncludeUppercase(savedSettings.includeUppercase !== undefined ? savedSettings.includeUppercase : initialSettings.includeUppercase);
      setIncludeSymbols(savedSettings.includeSymbols !== undefined ? savedSettings.includeSymbols : initialSettings.includeSymbols);
      setAvoidAmbiguous(savedSettings.avoidAmbiguous !== undefined ? savedSettings.avoidAmbiguous : initialSettings.avoidAmbiguous);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    const settings = {
      passwordLength,
      includeNumbers,
      includeLowercase,
      includeUppercase,
      includeSymbols,
      avoidAmbiguous,
    };
    console.log("updating setting in localStorage to ",JSON.stringify(settings))
    localStorage.setItem('passwordGeneratorSettings', JSON.stringify(settings));
  }, [passwordLength, includeNumbers, includeLowercase, includeUppercase, includeSymbols, avoidAmbiguous]);

  // Function to generate a random password based on selected options
  const generatePasswords = () => {
    const numbers = '0123456789';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const symbols = '!#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
    const ambiguousCharacters = 'lO01'; // Characters to avoid

    let charset = '';
    if (includeNumbers) charset += numbers;
    if (includeLowercase) charset += lowercase;
    if (includeUppercase) charset += uppercase;
    if (includeSymbols) charset += symbols;

    // Option to avoid ambiguous characters
    if (avoidAmbiguous) {
      charset = charset.split('').filter(char => !ambiguousCharacters.includes(char)).join('');
    }

    // Ensure at least one character type is selected
    if (charset.length === 0) {
      toast.error('Please select at least one character type!');
      return;
    }

    const passwords = [];
    for (let j = 0; j < 5; j++) { // Generate 5 passwords
      let password = '';
      for (let i = 0; i < passwordLength; i++) {
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
      className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} transition-colors duration-300`}
    >
      <h1 className="text-3xl font-bold mb-8 text-center">Password Generator</h1>
      <Toaster /> {/* Toast container */}

      <div
        className={`max-w-2xl mx-auto p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border`}
      >
        {/* Clear Button - Icon only on top right */}
        <button
          onClick={handleClear}
          className={`absolute top-4 right-4 p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-200'}`}
        >
          <FaTrash size={20} />
        </button>

        {/* Options Section */}
        <div className="mb-6">
          <label className="block mb-2">Password Length:</label>
          <input
            type="number"
            value={passwordLength}
            onChange={(e) => setPasswordLength(Number(e.target.value))}
            min="1"
            className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'}`}
          />
        </div>

        <div className="flex flex-col mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={() => setIncludeNumbers(!includeNumbers)}
              defaultChecked // Default checked for all options
            />
            <span className="ml-2">Include Numbers (0-9)</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeLowercase}
              onChange={() => setIncludeLowercase(!includeLowercase)}
              defaultChecked // Default checked for all options
            />
            <span className="ml-2">Include Lowercase Letters (a-z)</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeUppercase}
              onChange={() => setIncludeUppercase(!includeUppercase)}
              defaultChecked // Default checked for all options
            />
            <span className="ml-2">Include Uppercase Letters (A-Z)</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={() => setIncludeSymbols(!includeSymbols)}
              defaultChecked // Default checked for all options
            />
            <span className="ml-2">Include Symbols (!@#$%^&*...)</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={avoidAmbiguous}
              onChange={() => setAvoidAmbiguous(!avoidAmbiguous)}
            />
            <span className="ml-2">Avoid Ambiguous Characters (l, O, 0, 1)</span>
          </label>
        </div>

        {/* Generate Button */}
        <button
          onClick={generatePasswords}
          className={`w-full p-2 mb-4 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          Generate Passwords
        </button>

        {/* Instructions for Clicking Passwords */}
        <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Click on any password to copy it to the clipboard.
        </p>

        {/* Output Section */}
        <div className="relative mb-4">
          <div className={`w-full border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'}`}>
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
