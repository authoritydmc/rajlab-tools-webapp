import React, { useState } from 'react';
import Modal from 'react-modal';

// Define a reusable Card component for better structure
const Card = ({ title, children, isDarkMode }) => (
  <div className={`rounded-lg shadow-md p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-green-150'}`}>
    <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>{title}</h3>
    {children}
  </div>
);

// Define a UPI Details Modal component
const UpiDetailsModal = ({ isOpen, onClose, onSubmit }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="UPI Details Modal"
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
        },
        content: {
          width: '60vw',
          maxWidth: '500px',
          margin: 'auto',
          padding: '20px',
          borderRadius: '8px',
          background: '#fff',
        },
      }}
    >
      <h2 className="text-xl font-bold">UPI Details</h2>
      {/* UPI form goes here */}
      <button onClick={onSubmit} className="bg-blue-600 text-white rounded-md px-4 py-2 mt-4">
        Submit
      </button>
      <button onClick={onClose} className="ml-2 bg-gray-300 text-gray-800 rounded-md px-4 py-2 mt-4">
        Cancel
      </button>
    </Modal>
  );
};

const PrintRateSettingsModal = ({ isOpen, onClose, settings, setSettings, isDarkMode, handleUpiDetailsSubmit }) => {
  const [localSettings, setLocalSettings] = useState(settings); // Local copy of settings
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false); // State to manage UPI modal visibility

  // Function to handle setting changes
  const handleSettingChange = (e, section, subSection) => {
    const { name, type, checked, value } = e.target;

    // Use checked value if it's a checkbox
    const newValue = type === 'checkbox' ? checked : value;

    // Check if a subSection is specified
    if (subSection) {
      setLocalSettings((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subSection]: {
            ...prev[section][subSection],
            [name]: newValue,
          },
        },
      }));
    } else {
      setLocalSettings((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: newValue,
        },
      }));
    }
  };

  // Function to open UPI details modal
  const openUpiDialogBox = () => {
    setIsUpiModalOpen(true); // Set the UPI modal to open
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
          width: '90%', // Use 90% width for better responsiveness
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

  {/* Show Internal Cost Section */}
  <Card title="Show Internal Cost" isDarkMode={isDarkMode}>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={localSettings.showInternalCost}
            onChange={() => setLocalSettings((prev) => ({ ...prev, showInternalCost: !prev.showInternalCost }))}
            className="mr-2"
          />
          <span className={`${isDarkMode ? 'text-white' : 'text-black'}`}>Display Internal Cost</span>
        </label>
      </Card>

      {/* UPI Section */}
      <Card title="UPI Details" isDarkMode={isDarkMode}>
        <button
          onClick={openUpiDialogBox}
          className="bg-blue-600 text-white rounded-md px-4 py-2"
        >
          Manage UPI Details
        </button>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end mt-6">
        <button onClick={onClose} className="mr-2 bg-gray-300 text-gray-800 rounded-md px-4 py-2">
          Cancel
        </button>
        <button onClick={saveSettings} className="bg-blue-600 text-white rounded-md px-4 py-2">
          Save Settings
        </button>
      </div>

      {/* Render UPI Details Modal */}
      <UpiDetailsModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)} // Close the UPI modal
        handleSubmit={handleUpiDetailsSubmit}
      />
      
    </Modal>
  );
};

export default PrintRateSettingsModal;
