import React, { useState, useEffect } from 'react';
import { FaCog } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import PrintRateSettingsModal from './printRateSetting';

export default function PrintRateCalculator() {
  const { isDarkMode } = useTheme(); // Access theme context

  // Default cost settings
  const defaultSettings = {
    pageCost: {
      cost: 335, // ₹
      pages: 500, // pages
    },
    blackInk: {
      cost: 570, // ₹ per bottle
      yield: 6600, // pages per bottle
    },
    colorInk: {
     cost:1260,
     yield:4500
    },
    profitPerPrint:0.50,
    showInternalCost: false, // Toggle for internal cost section
  };

  // State to hold settings
  const [settings, setSettings] = useState(defaultSettings);
  
  // State for calculator inputs
  const [numPages, setNumPages] = useState('1');
  const [printType, setPrintType] = useState('1-Sided');
  const [printMode, setPrintMode] = useState('Black & White');
  const [currencyUnit, setCurrencyUnit] = useState('₹'); // State for currency unit

  // State for settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('printRateSettings'));
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, []);

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('printRateSettings', JSON.stringify(settings));
  }, [settings]);

  // Function to handle opening settings modal
  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  // Function to handle closing settings modal
  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  // Function to calculate rates
  const calculateRates = () => {
    if (!numPages || numPages <= 0) return { customerTotal: 0 };

    let customerTotal = 0;
    if (printMode === 'Black & White') {
      const rate = printType === '1-Sided' ? 1.20 : 1.60;
      customerTotal = (printType === '2-Sided') ? (numPages / 2) * rate : numPages * rate;
    } else {
      const rate = printType === '1-Sided' ? 1.50 : 2.00;
      customerTotal = (printType === '2-Sided') ? (numPages / 2) * rate : numPages * rate;
    }

    return {
      customerTotal: customerTotal.toFixed(2),
    };
  };

  const { customerTotal } = calculateRates();

  // Function to calculate internal costs and profits
  const calculateInternal = () => {
    if (!numPages || numPages <= 0) return { internalCost: 0, totalProfit: 0 };

    const pageCostPerPage = settings.pageCost.cost / settings.pageCost.pages;
    let inkCostPerPage = 0;

    if (printMode === 'Black & White') {
      inkCostPerPage = settings.blackInk.cost / settings.blackInk.yield;
    } else {
      // Color ink (CMY)
      const colorInkTotalCost = Object.values(settings.colorInk).reduce((total, ink) => total + ink.cost, 0);
      inkCostPerPage = colorInkTotalCost / Object.values(settings.colorInk).reduce((total, ink) => total + ink.yield, 0);
    }

    const costPerPage = pageCostPerPage + inkCostPerPage;
    const selectedProfit = printMode === 'Black & White' ? (printType === '1-Sided' ? 0.45 : 0.80) : (printType === '1-Sided' ? 0.55 : 0.10);
    
    const internalCost = numPages * costPerPage;
    const totalProfit = numPages * selectedProfit;

    return {
      internalCost: internalCost.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
    };
  };

  const { internalCost, totalProfit } = calculateInternal();

  // Handle printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} transition-colors duration-300 relative`}>
      <Toaster /> {/* Toast container */}

      {/* Settings Icon */}
      <button
        onClick={openSettings}
        className={`absolute top-8 right-8 p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} transition-colors duration-300`}
        aria-label="Settings"
      >
        <FaCog size={20} />
      </button>

      <h1 className="text-3xl font-bold mb-8 text-center">Print Rate Calculator</h1>

      <div className={`max-w-3xl mx-auto p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border`}>
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
          <label className="block mb-2">Print Type / Page:</label>
          <select
            value={printType}
            onChange={(e) => setPrintType(e.target.value)}
            className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'}`}
          >
            <option value="1-Sided">1-Sided (1 Side only print per page)</option>
            <option value="2-Sided">2-Sided (Both Side of Page Printed)</option>
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

        {/* Currency Unit Selector */}
        <div className="mb-6">
          <label className="block mb-2">Currency Unit:</label>
          <select
            value={currencyUnit}
            onChange={(e) => setCurrencyUnit(e.target.value)}
            className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'}`}
          >
            <option value="₹">Rupees (₹)</option>
            <option value="$">Dollars ($)</option>
            <option value="€">Euros (€)</option>
            {/* Add more currency options as needed */}
          </select>
        </div>

        {/* Example Costs Section */}
        <div className={`mb-6 p-4 border rounded-md ${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'}`}>
          <h2 className="text-xl font-semibold mb-2">Estimated Costs:</h2>
          <p>Customer Total: {currencyUnit}{customerTotal}</p>

         {settings.showInternalCost && ( // Conditional rendering
        <>
          <p>Internal Cost: {currencyUnit}{results.internalCost.toFixed(2)}</p>
          <p>Total Profit: {currencyUnit}{results.profit.toFixed(2)}</p>
        </>
      )}
        </div>

  

        {/* Print Button */}
        <button
          onClick={handlePrint}
          className={`w-full py-2 mt-4 rounded-md ${isDarkMode ? 'bg-blue-500 hover:bg-blue-400' : 'bg-blue-700 hover:bg-blue-600'} text-white transition-colors duration-300`}
        >
          Print Estimate
        </button>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <PrintRateSettingsModal
          isOpen={isSettingsOpen}
          onClose={closeSettings}
          settings={settings}
          setSettings={setSettings}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
