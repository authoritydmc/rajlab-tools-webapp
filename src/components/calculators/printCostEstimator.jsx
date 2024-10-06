import React, { useState, useEffect } from 'react';
import { FaCog } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import PrintRateSettingsModal from './printRateSetting';
import { fetchDescriptionByLink } from '../../utils/metaUtils';
import UpiDetailsModal from '../../utils/UPIDetailsModal';
import QRCodeDisplay from '../CodeGenerators/QRDisplay';
import { KEYS } from '../../utils/Constants';
import LocalStorageUtils from '../../utils/localStorageUtils';
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
        profit: {
            blackAndWhite: {
                singleSided: 0.74, // Profit per page for 1-Sided Black & White
                doubleSided: 0.58, // Profit per page for 2-Sided Black & White
            },
            color: {
                singleSided: 1.10, // Profit per page for 1-Sided Color
                doubleSided: 0.8, // Profit per page for 2-Sided Color
            },
        },
        showInternalCost: false, // Toggle for internal cost section
    };

    // State to hold settings
    const [settings, setSettings] = useState(() => {
        const savedSettings = JSON.parse(localStorage.getItem('printRateSettings'));
        return savedSettings ? savedSettings : defaultSettings;
    });

    // State for calculator inputs
    const [numPages, setNumPages] = useState('2'); // Input number of pages
    const [printType, setPrintType] = useState('1-Sided'); // Input print type
    const [printMode, setPrintMode] = useState('Black & White'); // Input print mode
    const [currencyUnit, setCurrencyUnit] = useState('₹'); // State for currency unit

    // State for settings modal
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [actualNumPagesUsed, setActualNumPagesUsed] = useState(0); // State to hold actual number of pages used

    // State for UPI details modal
    const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
    // State for UPI details
    const [upiAddress, setUpiAddress] = useState(LocalStorageUtils.getItem(KEYS.UPI_ADDRESS) || ''); // UPI address
    const [upiName, setUpiName] = useState( LocalStorageUtils.getItem(KEYS.UPI_NAME)  || ''); // UPI name
    const [showQrCode, setShowQrCode] = useState(!!(LocalStorageUtils.getItem(KEYS.UPI_NAME)&& LocalStorageUtils.getItem(KEYS.UPI_ADDRESS))); // Show QR code if UPI details are present


    // Effect to update actualNumPagesUsed based on numPages and printType
    useEffect(() => {
        if (printType === "1-Sided") {
            setActualNumPagesUsed(Number(numPages)); // No change needed for 1-Sided
        } else {
            setActualNumPagesUsed(Math.ceil(Number(numPages) / 2)); // Round up for double-sided
        }

    }, [numPages, printType, settings]); // Add settings to dependencies to re-calculate on setting changes


    useEffect(() => {
        document.title = 'Print Cost Estimator| Rajlabs'; // Set the document title

        const setMetaDescriptionFromLink = async (key) => {
            const description = await fetchDescriptionByLink(key); // Fetch the description using the link
            console.log("found Description " + description);

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
        setMetaDescriptionFromLink('/print-cost-estimator');

        return () => {
            document.title = 'Utilities || Rajlabs'; // Reset title on unmount

            // Optionally, remove the meta description on unmount
            const metaTag = document.querySelector('meta[name="description"]');
            if (metaTag) {
                document.head.removeChild(metaTag); // Clean up the meta tag on unmount
            }
        };
    }, []);

    // Function to handle UPI address and name inputs
    // Function to handle UPI details submission
    const handleUpiDetailsSubmit = (address, name) => {
        setUpiAddress(address);
        setUpiName(name);
        LocalStorageUtils.setItem(KEYS.UPI_ADDRESS,address)
        LocalStorageUtils.setItem(KEYS.UPI_NAME,name)
        toast.success('UPI details saved successfully!'); // Toast notification
        setShowQrCode(true); // Show QR code after saving details
        setIsUpiModalOpen(false); // Close the modal
    };
    // Function to generate the UPI link for the QR code
    const generateUpiLink = (rates) => {
        if (!upiAddress || !upiName) {
            console.log("UPI details not available")
            // handleUpiDetails(); // Prompt for UPI details if not set
        }
        return `upi://pay?pa=${upiAddress}&pn=${upiName}&am=${rates.customerTotal}&cu=INR`; // Generate UPI link
    };

    // Function to toggle the visibility of the QR code
    const toggleQrCode = () => {
        setShowQrCode(!showQrCode); // Toggle QR code visibility
    };

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
        console.log("calculating cost");
        if (!numPages || numPages <= 0) return {
            customerTotal: 0,
            internalCost: 0,
            totalProfit: 0,
            inkCostPerPage: 0,
            costPerPage: 0,
            totalInkCost: 0,
            totalPageCost: 0,
            profitPerPrint: 0, // Set to 0 as we don't calculate profit when no pages are input
        };

        // Calculate cost per print and ink cost per page based on print mode
        const pageCostPerPrint = settings.pageCost.cost / settings.pageCost.pages; // Cost per print
        let inkCostPerPage = printMode === 'Black & White'
            ? settings.blackInk.cost / settings.blackInk.yield // Ink cost per page for Black & White
            : settings.colorInk.cost / settings.colorInk.yield; // Ink cost per page for Color

        // Determine profit per print based on print type and mode
        const profitPerPrint = printMode === 'Black & White'
            ? (printType === '1-Sided' ? settings.profit.blackAndWhite.singleSided : numPages > 1 ? settings.profit.blackAndWhite.doubleSided : settings.profit.blackAndWhite.singleSided)
            : (printType === '1-Sided' ? settings.profit.color.singleSided : numPages > 1 ? settings.profit.color.doubleSided : settings.profit.color.singleSided);


        // Calculate internal costs
        const totalPageCost = actualNumPagesUsed * pageCostPerPrint; // Total page cost
        const totalInkCost = parseFloat(inkCostPerPage) * numPages; // Total ink cost for actual pages used
        const totalProfit = numPages * parseFloat(profitPerPrint); // Total profit for the number of pages
        const internalCost = totalPageCost + totalInkCost; // Internal cost
        const customerTotal = internalCost + totalProfit; // Total cost for the number of pages
        const customerCostPerPage = customerTotal / numPages;
        return {
            customerTotal: customerTotal.toFixed(2), // Total cost formatted to 2 decimal places
            internalCost: internalCost.toFixed(2), // Internal cost formatted to 2 decimal places
            totalProfit: totalProfit.toFixed(2), // Total profit formatted to 2 decimal places
            inkCostPerPage: inkCostPerPage.toFixed(4), // Ink cost per page formatted to 2 decimal places
            costPerPage: pageCostPerPrint.toFixed(3), // Cost per page formatted to 2 decimal places
            totalInkCost: totalInkCost.toFixed(2), // Total ink cost formatted to 2 decimal places
            totalPageCost: totalPageCost.toFixed(2), // Total page cost formatted to 2 decimal places
            profitPerPrint: parseFloat(profitPerPrint).toFixed(2), // Profit per print formatted to 2 decimal places
            customerCostPerPage: customerCostPerPage.toFixed(2)
        };
    };

    const rates = calculateRates(); // Calculate all rates and costs

    return (
        <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-green-50 text-gray-900'} transition-colors duration-300 relative`}>
            <Toaster /> {/* Toast container */}

            <h1 className="text-3xl font-bold mb-8 text-center">Print Rate Calculator</h1>

            <div className={`max-w-3xl mx-auto p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-150 border-gray-300'} border`}>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex-grow"></div> {/* This div takes up all available space to push the button to the right */}
                    <button
                        onClick={openSettings}
                        className={`p-2 flex items-center rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} transition-colors duration-300`}
                        aria-label="Settings"
                    >
                        <FaCog size={20} className="mr-2" /> {/* Add margin to separate icon from text */}
                        Settings
                    </button>
                </div>

                <div className="mb-6">
                    <label className="block mb-2">Number of Pages:</label>
                    <input
                        type="number"
                        value={numPages}
                        onChange={(e) => setNumPages(e.target.value)}
                        min="1"
                        className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
                    />
                </div>

                <div className="mb-6">
                    <label className="block mb-2">Print Type / Page:</label>
                    <select
                        value={printType}
                        onChange={(e) => setPrintType(e.target.value)}
                        className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
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
                        className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
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
                        className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
                    >
                        <option value="₹">Indian Rupee (₹)</option>
                        <option value="$">US Dollar ($)</option>
                        {/* Add more currencies as needed */}
                    </select>
                </div>

                {/* Display Costs */}
                <div className={`p-4 border rounded-md ${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-green-50 text-gray-900 border-gray-300'}`}>
                    <h2 className="text-xl font-semibold mb-2">Estimated Costs:</h2>
                    {/* Updated the class to include a larger text size */}
                    <p className="text-md">
                        Customer Total:
                        <span className="text-2xl font-bold text-green-500 ml-4 mr-4">
                            {currencyUnit}{rates.customerTotal}
                        </span>
                        [ {currencyUnit}{rates.customerCostPerPage} / Page ]
                    </p>
                    <p>Total {actualNumPagesUsed} pages will be used to print</p>

                    <div className="flex justify-center mb-6">
                    {showQrCode ? (
                        <QRCodeDisplay
                            data={generateUpiLink(rates)} // Generate UPI link
                            size={256} // Example size
                            errorCorrectionLevel="H" // Example error correction level
                            shareTitle={`UPI Payment QR `}
                            shareText={`Paying ${upiName} (${upiAddress}) ${rates.customerTotal ? ` ₹${rates.customerTotal}` : ''}`} // Conditional sharing text
                            headerText={`UPI Payment of ${rates.customerTotal} to ${upiName} (${upiAddress}) `}
                        />
                    ) : (
                        <button 
                            onClick={() => setIsUpiModalOpen(true)} // Open modal for UPI details
                            className="p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                        >
                            Generate Payment QR
                        </button>
                    )}
                </div>
                    {settings.showInternalCost && ( // Conditional rendering
                        <>
                            <h3 className="mt-5 text-lg font-semibold mb-2">Detailed Internal Cost Breakdown:</h3>
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
                                        <td className="border px-4 py-2 text-red-500">{currencyUnit}{rates.costPerPage} * {actualNumPagesUsed} (No of pages used) = {currencyUnit}{rates.totalPageCost}</td>
                                    </tr>
                                    <tr>
                                        <td className="border px-4 py-2 text-red-500">Ink Cost:</td>
                                        <td className="border px-4 py-2 text-red-500">{currencyUnit}{rates.inkCostPerPage} * {numPages} (No of page side printed) = {currencyUnit}{rates.totalInkCost}</td>
                                    </tr>

                                    <tr>
                                        <td className="border px-4 py-2 font-bold text-red-500">Total Internal Cost:</td>
                                        <td className="border px-4 py-2 font-bold text-red-500">{currencyUnit}{rates.totalPageCost} + {currencyUnit}{rates.totalInkCost} = {currencyUnit}{rates.internalCost}</td>
                                    </tr>
                                    <tr className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        <td className="border px-4 py-2 font-bold text-green-500">+ Profit:</td>
                                        <td className="border px-4 py-2 font-bold text-green-500">{currencyUnit}{rates.profitPerPrint} * {numPages} (No of pages printed) = {currencyUnit}{rates.totalProfit}</td>
                                    </tr>

                                    <tr className={`${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'}`}>
                                        <td className="border px-4 py-2 font-bold text-yellow-500">Total Customer Rate:</td>
                                        <td className="border px-4 py-2 font-bold text-yellow-500">{currencyUnit}{rates.customerTotal} [ {currencyUnit}{rates.customerCostPerPage} / Page ]</td>
                                    </tr>
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            </div>

            {/* Settings Modal */}
            <PrintRateSettingsModal isOpen={isSettingsOpen} onClose={closeSettings} settings={settings} setSettings={setSettings} isDarkMode={isDarkMode} handleUpiDetailsSubmit={handleUpiDetailsSubmit} />
        
                {/* UPI Details Modal */}
                <UpiDetailsModal 
                    isOpen={isUpiModalOpen} 
                    onClose={() => setIsUpiModalOpen(false)} 
                    onSubmit={handleUpiDetailsSubmit} 
                />
        </div>
    );
}
