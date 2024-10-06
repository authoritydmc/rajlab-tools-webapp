import React, { useState } from 'react';
import Modal from 'react-modal';
import UpiDetailsModal from '../../utils/UPIDetailsModal';

// Define a reusable Card component for better structure
const Card = ({ title, children, isDarkMode }) => (
  <div className={`rounded-lg shadow-md p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-green-150'}`}>
    <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>{title}</h3>
    {children}
  </div>
);

const PrintRateSettingsModal = ({ isOpen, onClose, settings, setSettings, isDarkMode, handleUpiDetailsSubmit }) => {
  const [localSettings, setLocalSettings] = useState(settings); // Local copy of settings
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false); // State to manage UPI modal visibility

  // Function to handle setting changes
  const handleSettingChange = (e, section, subSection) => {
    const { name, value } = e.target;

    // Check if a subSection is specified
    if (subSection) {
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
      setLocalSettings((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value,
        },
      }));
    }
  };

  // Function to open the UPI dialog
  const openUpiDialogBox = () => {
    setIsUpiModalOpen(true); // Open UPI details modal
  };

  // Function to save settings and close modal
  const saveSettings = () => {
    setSettings(localSettings);
    localStorage.setItem('printRateSettings', JSON.stringify(localSettings));
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Settings Modal"
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
        },
        content: {
          width: '90vw', // Use relative width for mobile responsiveness
          maxWidth: '800px',
          height: 'auto',
          maxHeight: '80vh',
          margin: 'auto',
          padding: '20px',
          borderRadius: '8px',
          background: isDarkMode ? '#444' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
          overflowY: 'auto',
        },
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Print Rate Settings</h2>
        {/* Save Icon */}
        <button onClick={saveSettings} title="Save Settings" className="text-blue-600 hover:text-blue-800">
          <i className="fas fa-save fa-lg"></i>
        </button>
        {/* Close Icon */}
        <button onClick={onClose} title="Close" className="text-red-600 hover:text-red-800">
          <i className="fas fa-times fa-lg"></i>
        </button>
      </div>

      {/* Page Cost Section */}
      <Card title="Page Cost" isDarkMode={isDarkMode}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Cost (₹):</label>
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
            <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Cost (₹):</label>
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
            <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Cost for All (₹):</label>
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
            <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Single Sided (₹):</label>
            <input
              type="number"
              name="singleSided"
              value={localSettings.profit.blackAndWhite.singleSided}
              onChange={(e) => handleSettingChange(e, 'profit', 'blackAndWhite')}
              className={`border rounded-md p-1 w-full ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-150 text-black'}`}
            />
            <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Double Sided (₹):</label>
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
            <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Single Sided (₹):</label>
            <input
              type="number"
              name="singleSided"
              value={localSettings.profit.color.singleSided}
              onChange={(e) => handleSettingChange(e, 'profit', 'color')}
              className={`border rounded-md p-1 w-full ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-150 text-black'}`}
            />
            <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Double Sided (₹):</label>
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
      <Card title="Show Internal Cost" isDarkMode={isDarkMode}>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={localSettings.showInternalCost}
            onChange={() => setLocalSettings((prev) => ({ ...prev, showInternalCost: !prev.showInternalCost }))}
            className="mr-2"
          />
          <span className={`${isDarkMode ? 'text-white' : 'text-black'}`}>Show Internal Cost</span>
        </label>
      </Card>


      {/* UPI Details Button */}
      <Card title="Manage UPI" isDarkMode={isDarkMode}>

        <button
          onClick={openUpiDialogBox}
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded`}
        >
          Open UPI Details
        </button>
      </Card>
      {/* UPI Details Modal */}
      <UpiDetailsModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        handleUpiDetailsSubmit={handleUpiDetailsSubmit}
        isDarkMode={isDarkMode}
      />

<div className="flex items-center mt-6 space-x-4"> {/* Added space-x-4 */}
  <button
    onClick={saveSettings}
    className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition duration-200"
  >
    Save Settings
  </button>
  <button
    onClick={onClose}
    className="bg-gray-300 text-gray-800 rounded-md px-4 py-2 hover:bg-gray-400 transition duration-200"
  >
    Cancel
  </button>
</div>

    </Modal>
    
  );
};

export default PrintRateSettingsModal;
