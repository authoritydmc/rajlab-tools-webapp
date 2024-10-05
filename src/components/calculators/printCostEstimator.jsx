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
            cost: 1260, // ₹ per bottle
            yield: 4500, // pages per bottle
        },
        profitPerPrint: 0.50, // Fixed profit margin per print
        showInternalCost: false, // Toggle for internal cost section
    };

    // State to hold settings
    const [settings, setSettings] = useState(() => {
        const savedSettings = JSON.parse(localStorage.getItem('printRateSettings'));
        return savedSettings ? savedSettings : defaultSettings;
    });

    // State for calculator inputs
    const [numPages, setNumPages] = useState('10'); // Input number of pages
    const [printType, setPrintType] = useState('1-Sided'); // Input print type
    const [printMode, setPrintMode] = useState('Black & White'); // Input print mode
    const [currencyUnit, setCurrencyUnit] = useState('₹'); // State for currency unit

    // State for settings modal
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [actualNumPagesUsed, setActualNumPagesUsed] = useState(0); // State to hold actual number of pages used

    // Effect to update actualNumPagesUsed based on numPages and printType
    useEffect(() => {
        if (printType === "1-Sided") {
            setActualNumPagesUsed(Number(numPages)); // No change needed for 1-Sided
        } else {
            setActualNumPagesUsed(Math.ceil(Number(numPages) / 2)); // Round up for double-sided
        }
        calculateRates();
    }, [numPages, printType]);

    // Function to handle opening settings modal
    const openSettings = () => {
        setIsSettingsOpen(true);
    };

    // Function to handle closing settings modal
    const closeSettings = () => {
        setIsSettingsOpen(false);
    };

    // Unified function to calculate all rates and costs
    const calculateRates = () => {
        console.log("calculating cost")
        if (!numPages || numPages <= 0) return {
            customerTotal: 0,
            internalCost: 0,
            totalProfit: 0,
            inkCostPerPage: 0,
            costPerPage: 0,
            totalInkCost: 0,
            totalPageCost: 0,
            profitPerPrint: settings.profitPerPrint.toFixed(2),
        };

        const pageCostPerPrint = settings.pageCost.cost / settings.pageCost.pages; // Cost per print

        let inkCostPerPage = printMode === 'Black & White'
            ? settings.blackInk.cost / settings.blackInk.yield // Ink cost per page for Black & White
            : settings.colorInk.cost / settings.colorInk.yield; // Ink cost per page for Color

        
        // Calculate internal costs
        const totalPageCost = actualNumPagesUsed * pageCostPerPrint; // Total page cost
        const totalInkCost = inkCostPerPage * numPages; // Total ink cost
        const totalProfit = numPages * settings.profitPerPrint; // Total profit for the number of pages
        const internalCost = totalPageCost + totalInkCost; // Internal cost
        const customerTotal = internalCost +totalProfit; // Total cost for the number of pages

        return {
            customerTotal: customerTotal.toFixed(2), // Total cost formatted to 2 decimal places
            internalCost: internalCost.toFixed(2), // Internal cost formatted to 2 decimal places
            totalProfit: totalProfit.toFixed(2), // Total profit formatted to 2 decimal places
            inkCostPerPage: inkCostPerPage.toFixed(2), // Ink cost per page formatted to 2 decimal places
            costPerPage: pageCostPerPrint.toFixed(2), // Cost per page formatted to 2 decimal places
            totalInkCost: totalInkCost.toFixed(2), // Total ink cost formatted to 2 decimal places
            totalPageCost: totalPageCost.toFixed(2), // Total page cost formatted to 2 decimal places
            profitPerPrint: settings.profitPerPrint.toFixed(2), // Profit per print formatted to 2 decimal places
        };
    };

    const rates = calculateRates(); // Calculate all rates and costs

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
                        <option value="₹">Indian Rupee (₹)</option>
                        <option value="$">US Dollar ($)</option>
                        {/* Add more currencies as needed */}
                    </select>
                </div>

                {/* Display Costs */}
                <div className={`p-4 border rounded-md ${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'}`}>
                    <h2 className="text-xl font-semibold mb-2">Estimated Costs:</h2>
                    <p>Customer Total: {currencyUnit}{rates.customerTotal}</p>
                    <p>Total {actualNumPagesUsed} pages will be used to print </p>
                   
                    {settings.showInternalCost && ( // Conditional rendering
                        <>
                            <h3 className="mt-10 text-lg font-semibold mb-2">Detailed Internal Cost Breakdown:</h3>
                            <table className="w-full border border-gray-300">
                                <thead>
                                    <tr className={`${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'}`}>
                                        <th className="border px-4 py-2">Description</th>
                                        <th className="border px-4 py-2">Cost ({currencyUnit})</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border px-4 py-2 text-red-500">Page Cost:</td>
                                        <td className="border px-4 py-2 text-red-500">{currencyUnit}{rates.costPerPage}*{actualNumPagesUsed}(No of pages used) = {currencyUnit}{rates.totalPageCost}</td>
                                    </tr>
                                    <tr>
                                        <td className="border px-4 py-2 text-red-500">Ink Cost:</td>
                                        <td className="border px-4 py-2 text-red-500">{currencyUnit}{rates.inkCostPerPage}*{numPages}(No of pages used) = {currencyUnit}{rates.totalInkCost}</td>

                                    </tr>
                          
                                    <tr >
                                        <td className="border px-4 py-2 font-bold text-red-500">Total Internal Cost:</td>
                                        <td className="border px-4 py-2 font-bold text-red-500">{currencyUnit}{rates.totalPageCost} + {currencyUnit}{rates.totalInkCost} = {currencyUnit}{rates.internalCost}</td>
                                    </tr>
                                    <tr className={`${isDarkMode ? ' text-white' : ' text-gray-900'}`}>
                                        <td className="border px-4 py-2 font-bold text-green-500">+ Profit:</td>
                                        <td className="border px-4 py-2 font-bold text-green-500">{currencyUnit}{rates.profitPerPrint} *{numPages}(No of pages used)={currencyUnit}{rates.totalProfit}</td>
                                    </tr>

                                    <tr className={`${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'}`}>
                                        <td className="border px-4 py-2 font-bold text-yellow-500">Total Customer Rate:</td>
                                        <td className="border px-4 py-2 font-bold text-yellow-500">{currencyUnit}{rates.customerTotal}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            </div>

            {/* Settings Modal */}
            <PrintRateSettingsModal isOpen={isSettingsOpen} onClose={closeSettings} settings={settings} setSettings={setSettings} isDarkMode={isDarkMode} />
        </div>
    );
}
