import React, { useState, useEffect } from 'react';
import { FaPrint } from 'react-icons/fa';
import { useTheme } from '../../themeContext';

export default function PrintRateCalculator() {
  const { isDarkMode } = useTheme(); // Access theme context

  // State to store user input
  const [numPages, setNumPages] = useState('');
  const [printType, setPrintType] = useState('1-Sided');
  const [printMode, setPrintMode] = useState('Black & White');

  // Set document title and fetch meta description
  useEffect(() => {
    document.title = 'Print Rate Calculator | Rajlabs';

    const setMetaDescription = (description) => {
      let metaTag = document.querySelector('meta[name="description"]');
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.name = 'description';
        document.head.appendChild(metaTag);
      }
      metaTag.content = description;
    };

    setMetaDescription('Use this Print Rate Calculator to calculate printing costs for Black & White or Color prints.');
    
    return () => {
      document.title = 'Utilities | Rajlabs'; // Reset title on unmount
      const metaTag = document.querySelector('meta[name="description"]');
      if (metaTag) {
        document.head.removeChild(metaTag); // Clean up meta tag on unmount
      }
    };
  }, []);

  // Rate calculation based on print type and mode
  const calculateRates = () => {
    const customerRates = { 
      "Black & White": { "1-Sided": 1.20, "2-Sided": 1.60 },
      "Color": { "1-Sided": 1.50, "2-Sided": 2.00 }
    };

    const internalRates = {
      "Black & White": { "1-Sided": { cost: 0.75, profit: 0.45 }, "2-Sided": { cost: 0.80, profit: 0.80 } },
      "Color": { "1-Sided": { cost: 0.95, profit: 0.55 }, "2-Sided": { cost: 1.90, profit: 0.10 } }
    };

    const selectedRate = customerRates[printMode][printType];
    const selectedInternal = internalRates[printMode][printType];

    const customerTotal = numPages * selectedRate;
    const internalCost = numPages * selectedInternal.cost;
    const totalProfit = numPages * selectedInternal.profit;

    return {
      customerTotal,
      internalCost,
      totalProfit
    };
  };

  const { customerTotal, internalCost, totalProfit } = calculateRates();

  // Handle printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} transition-colors duration-300`}>
      <h1 className="text-3xl font-bold mb-8 text-center">Print Rate Calculator</h1>

      <div className={`max-w-2xl mx-auto p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border`}>
        {/* Input Section */}
        <div className="mb-6">
          <label className="block mb-2">Number of Pages:</label>
          <input
            type="number"
            value={numPages}
            onChange={(e) => setNumPages(e.target.value)}
            min="1"
            className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'}`}
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2">Print Type:</label>
          <select
            value={printType}
            onChange={(e) => setPrintType(e.target.value)}
            className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'}`}
          >
            <option value="1-Sided">1-Sided</option>
            <option value="2-Sided">2-Sided</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block mb-2">Print Mode:</label>
          <select
            value={printMode}
            onChange={(e) => setPrintMode(e.target.value)}
            className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'}`}
          >
            <option value="Black & White">Black & White</option>
            <option value="Color">Color</option>
          </select>
        </div>

        {/* Display Calculated Rates */}
        <div className="mb-6">
          <h3 className="text-lg font-bold">Customer Rate</h3>
          <p>Total for {numPages} pages ({printType}, {printMode}): ₹{customerTotal}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold">Internal Cost & Profit</h3>
          <p>Cost: ₹{internalCost}</p>
          <p>Profit: ₹{totalProfit}</p>
        </div>

        {/* Print Button */}
        <button
          onClick={handlePrint}
          className={`w-full p-2 rounded-md transition-colors duration-300 flex justify-center items-center gap-2 ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          <FaPrint />
          Print Rate
        </button>
      </div>
    </div>
  );
}
