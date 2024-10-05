import React, { useState } from 'react';
import Modal from 'react-modal';

const PrintRateSettingsModal = ({ isOpen, onClose, settings, setSettings, isDarkMode }) => {
  const [localSettings, setLocalSettings] = useState(settings); // Local copy of settings

  // Function to handle setting changes
  const handleSettingChange = (e, section) => {
    const { name, value } = e.target;
    setLocalSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value,
      },
    }));
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
          width: '80vw', // 80% viewport width
          height: 'auto', // Auto height
          maxHeight: '90vh', // Max height to avoid overflow
          margin: 'auto',
          padding: '20px',
          borderRadius: '8px',
          background: isDarkMode ? '#333' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
        },
      }}
    >
      <h2 className="text-xl font-bold mb-4">Print Rate Settings</h2>
      
      {/* Page Cost Section */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Page Cost</h3>
        <div className="flex justify-between mb-2">
          <label>Cost (₹):</label>
          <input
            type="number"
            name="cost"
            value={localSettings.pageCost.cost}
            onChange={(e) => handleSettingChange(e, 'pageCost')}
            className={`border rounded-md p-1 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
          />
        </div>
        <div className="flex justify-between mb-2">
          <label>Pages:</label>
          <input
            type="number"
            name="pages"
            value={localSettings.pageCost.pages}
            onChange={(e) => handleSettingChange(e, 'pageCost')}
            className={`border rounded-md p-1 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
          />
        </div>
      </div>

      {/* Black Ink Section */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Black Ink</h3>
        <div className="flex justify-between mb-2">
          <label>Cost (₹):</label>
          <input
            type="number"
            name="cost"
            value={localSettings.blackInk.cost}
            onChange={(e) => handleSettingChange(e, 'blackInk')}
            className={`border rounded-md p-1 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
          />
        </div>
        <div className="flex justify-between mb-2">
          <label>Yield (pages):</label>
          <input
            type="number"
            name="yield"
            value={localSettings.blackInk.yield}
            onChange={(e) => handleSettingChange(e, 'blackInk')}
            className={`border rounded-md p-1 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
          />
        </div>
      </div>

      {/* Color Ink Section */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Color Ink</h3>
        <div className="flex justify-between mb-2">
          <label>Cost for All (₹):</label>
          <input
            type="number"
            name="cost"
            value={localSettings.colorInk.cost} // Total cost for all bottles
            onChange={(e) => handleSettingChange(e, 'colorInk')}
            className={`border rounded-md p-1 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
          />
        </div>
        <div className="flex justify-between mb-2">
          <label>Yield (pages):</label>
          <input
            type="number"
            name="yield"
            value={localSettings.colorInk.yield} // Total yield for all bottles together
            onChange={(e) => handleSettingChange(e, 'colorInk')}
            className={`border rounded-md p-1 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
          />
        </div>
      </div>

      {/* Profit Per Print Section */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Profit Per Print</h3>
        <div className="flex justify-between mb-2">
          <label>Profit (₹):</label>
          <input
            type="number"
            name="profitPerPrint"
            value={localSettings.profitPerPrint} // Profit per print
            onChange={(e) => handleSettingChange(e, 'profitPerPrint')}
            className={`border rounded-md p-1 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
          />
        </div>
      </div>

      {/* Show Internal Cost Section */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Show Internal Cost</h3>
        <label>
          <input
            type="checkbox"
            checked={localSettings.showInternalCost}
            onChange={() => setLocalSettings(prev => ({ ...prev, showInternalCost: !prev.showInternalCost }))}
          />
          Show Internal Cost
        </label>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={saveSettings}
          className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition duration-200"
        >
          Save Settings
        </button>
        <button
          onClick={onClose}
          className="ml-2 bg-gray-300 text-gray-800 rounded-md px-4 py-2 hover:bg-gray-400 transition duration-200"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default PrintRateSettingsModal;
