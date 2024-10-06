import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { KEYS } from '../../utils/constants';
import LocalStorageUtils from '../../utils/localStorageUtils';
import { IoIosCloseCircle } from 'react-icons/io';
import CurrencySelector from '../common/currencySelector';
import Card from '../common/card';



const PrintRateSettingsModal = ({ isOpen, onClose, settings, setSettings, isDarkMode, setIsUpiModalOpen, defaultSettings }) => {
  const [localSettings, setLocalSettings] = useState(settings); // Local copy of settings

  // Function to handle setting changes
  const handleSettingChange = (e, section, subSection) => {
    const { name, value } = e.target;

    // Define top-level fields   
    const topLevelFields = ['currencyUnit', 'showInternalCost']; // Add other top-level fields if any

    if (topLevelFields.includes(section)) {

      // Directly update the top-level field
      setLocalSettings((prev) => ({
        ...prev,
        [section]: name !== undefined ? { ...prev[section], [name]: value } : value,
      }));
    } else if (subSection) {
      // Update nested settings
      setLocalSettings((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subSection]: {
            ...prev[section][subSection],
            [name]: value,
          },
        },
      }));
    } else {
      // Update section without subSection
      setLocalSettings((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value,
        },
      }));
    }
  };

  // Function to open the UPI dialog box
  const openUpiDialogBox = () => {
    onClose();
    console.log("closing this dialog box and opening UPI setting box")
    setIsUpiModalOpen(true); // Open UPI details modal
  };

  // Function to save settings and close modal
  const saveSettings = () => {
    setSettings(localSettings);
    LocalStorageUtils.setItem(KEYS.PRINT_RATE_SETTINGS, JSON.stringify(localSettings));
    toast.success('Settings saved successfully!'); // Toast notification
    onClose();
  };

  // Function to clear settings
  const clearSettings = () => {
    // Ask for user confirmation before clearing settings
    const isConfirmed = window.confirm("Are you sure you want to clear all settings? This action cannot be undone.");

    // If the user confirmed, proceed to clear the settings
    if (isConfirmed) {
      setLocalSettings(defaultSettings); // Reset to original settings
      LocalStorageUtils.removeItem(KEYS.PRINT_RATE_SETTINGS); // Remove settings from local storage
      toast.success('Settings cleared!'); // Show success toast
    } else {
      // User canceled, do nothing
      toast.info('Clearing settings canceled.'); // Optional: Show info toast
    }
  };

  // If the modal is not open, return null
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-8">
        <div
          className={`relative rounded-lg shadow-lg p-6 max-w-lg w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} max-h-[80vh] overflow-y-auto max-w-[80vw] md:max-w-[50vw]`}
        >

          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-bold flex mx-auto ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Print Rate Settings
            </h2>
            {/* Close Icon */}
            <button onClick={onClose} title="Close" className="text-red-600 hover:text-red-800">
              <IoIosCloseCircle size={30} />
            </button>
          </div>

          {/* Page Cost Section */}
          <Card title="Page Cost" isDarkMode={isDarkMode}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Cost ({localSettings.currencyUnit}):</label>
                <input
                  type="number"
                  name="cost"
                  value={localSettings.pageCost.cost}
                  onChange={(e) => handleSettingChange(e, 'pageCost')}
                  className={`border rounded-md p-1 w-full ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-150 text-black'}`}
                />
              </div>
              <div>
                <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Pages:</label>
                <input
                  type="number"
                  name="pages"
                  value={localSettings.pageCost.pages}
                  onChange={(e) => handleSettingChange(e, 'pageCost')}
                  className={`border rounded-md p-1 w-full ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-150 text-black'}`}
                />
              </div>
            </div>
          </Card>

          {/* Black Ink Section */}
          <Card title="Black Ink" isDarkMode={isDarkMode}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Cost ({localSettings.currencyUnit}):</label>
                <input
                  type="number"
                  name="cost"
                  value={localSettings.blackInk.cost}
                  onChange={(e) => handleSettingChange(e, 'blackInk')}
                  className={`border rounded-md p-1 w-full ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-150 text-black'}`}
                />
              </div>
              <div>
                <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Yield (pages):</label>
                <input
                  type="number"
                  name="yield"
                  value={localSettings.blackInk.yield}
                  onChange={(e) => handleSettingChange(e, 'blackInk')}
                  className={`border rounded-md p-1 w-full ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-150 text-black'}`}
                />
              </div>
            </div>
          </Card>

          {/* Color Ink Section */}
          <Card title="Color Ink" isDarkMode={isDarkMode}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Cost for All ({localSettings.currencyUnit}):</label>
                <input
                  type="number"
                  name="cost"
                  value={localSettings.colorInk.cost}
                  onChange={(e) => handleSettingChange(e, 'colorInk')}
                  className={`border rounded-md p-1 w-full ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-150 text-black'}`}
                />
              </div>
              <div>
                <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Yield (pages):</label>
                <input
                  type="number"
                  name="yield"
                  value={localSettings.colorInk.yield}
                  onChange={(e) => handleSettingChange(e, 'colorInk')}
                  className={`border rounded-md p-1 w-full ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-150 text-black'}`}
                />
              </div>
            </div>
          </Card>

          {/* Profit Per Print Section */}
          <Card title="Profit Per Print" isDarkMode={isDarkMode}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Black & White Profit Settings */}
              <div>
                <h4 className={`mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Black & White:</h4>
                <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Single Sided ({localSettings.currencyUnit}):</label>
                <input
                  type="number"
                  name="singleSided"
                  value={localSettings.profit.blackAndWhite.singleSided}
                  onChange={(e) => handleSettingChange(e, 'profit', 'blackAndWhite')}
                  className={`border rounded-md p-1 w-full ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-150 text-black'}`}
                />
                <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Double Sided ({localSettings.currencyUnit}):</label>
                <input
                  type="number"
                  name="doubleSided"
                  value={localSettings.profit.blackAndWhite.doubleSided}
                  onChange={(e) => handleSettingChange(e, 'profit', 'blackAndWhite')}
                  className={`border rounded-md p-1 w-full ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-150 text-black'}`}
                />
              </div>

              {/* Color Profit Settings */}
              <div>
                <h4 className={`mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Color:</h4>
                <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Single Sided ({localSettings.currencyUnit}):</label>
                <input
                  type="number"
                  name="singleSided"
                  value={localSettings.profit.color.singleSided}
                  onChange={(e) => handleSettingChange(e, 'profit', 'color')}
                  className={`border rounded-md p-1 w-full ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-150 text-black'}`}
                />
                <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Double Sided ({localSettings.currencyUnit}):</label>
                <input
                  type="number"
                  name="doubleSided"
                  value={localSettings.profit.color.doubleSided}
                  onChange={(e) => handleSettingChange(e, 'profit', 'color')}
                  className={`border rounded-md p-1 w-full ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-150 text-black'}`}
                />
              </div>
            </div>
          </Card>

          {/* Bulk Discount Section */}
          <Card title="Bulk Discount" isDarkMode={isDarkMode}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Min Page Requirement:</label>
                <input
                  type="number"
                  name="minPages"
                  value={localSettings.discount.minPages}
                  onChange={(e) => handleSettingChange(e, 'discount')}
                  className={`border rounded-md p-1 w-full ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-150 text-black'}`}
                />
              </div>
              <div>
                <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Discount (%):</label>
                <input
                  type="number"
                  name="percentage"
                  value={localSettings.discount.percentage}
                  onChange={(e) => handleSettingChange(e, 'discount')}
                  step="0.01" // Allows decimal input
                  min="0" // Minimum value
                  max="80" // Maximum value                
                  className={`border rounded-md p-1 w-full ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-150 text-black'}`}
                />
              </div>
            </div>
          </Card>

          {/* Show Internal Cost Section */}
          <Card title="Show Internal Cost" isDarkMode={isDarkMode}>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localSettings.showInternalCost}
                onChange={() => handleSettingChange({ target: { name: undefined, value: !localSettings.showInternalCost } }, 'showInternalCost')}
                className="mr-2"
              />
              <span className={`${isDarkMode ? 'text-white' : 'text-black'}`}>Show Internal Cost</span>
            </label>
          </Card>
<CurrencySelector 
  localSettings={localSettings} 
  handleSettingChange={handleSettingChange} 
  isDarkMode={isDarkMode} 
/>

          {/* UPI Details Button */}
          <Card title="Manage UPI" isDarkMode={isDarkMode}>
            <button
              onClick={openUpiDialogBox}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded`}
            >
              Open UPI Details
            </button>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between mt-4">
            <button
              onClick={clearSettings}
              className={`px-4 py-2 rounded-md text-white ${isDarkMode ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-orange-600 hover:bg-orange-700'}`}
            >
              Reset
            </button>
            <button
              onClick={saveSettings}
              className={`px-4 py-2 rounded-md text-white ${isDarkMode ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              Save Settings
            </button>

            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-md text-white ${isDarkMode ? 'bg-red-500 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'}`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintRateSettingsModal;
