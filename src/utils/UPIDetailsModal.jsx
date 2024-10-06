import React, { useState, useEffect } from 'react';
import { useTheme } from '../themeContext';
import LocalStorageUtils from './localStorageUtils';
import { KEYS } from './Constants';
const UpiDetailsModal = ({ isOpen, onClose, onSubmit }) => {
    const { isDarkMode } = useTheme();
    // State for UPI address and name
    const [upiAddress, setUpiAddress] = useState('');
    const [upiName, setUpiName] = useState('');
    const [error, setError] = useState('');

    // Function to validate UPI address format
    const validateUpiAddress = (address) => {
        // Simple regex for UPI address validation
        const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
        return upiRegex.test(address);
    };

    // Load stored values when the modal opens
    useEffect(() => {
        if (isOpen) {
            const storedUpiAddress = LocalStorageUtils.getItem(KEYS.UPI_ADDRESS)|| '';
            const storedUpiName = LocalStorageUtils.getItem(KEYS.UPI_NAME) || '';
            setUpiAddress(storedUpiAddress);
            setUpiName(storedUpiName);
        }
    }, [isOpen]);

    // Handle form submission
    const handleSubmit = () => {
        if (!upiAddress || !upiName) {
            setError('Both fields are required.');
            return;
        }
        if (!validateUpiAddress(upiAddress)) {
            setError('Invalid UPI address format.');
            return;
        }
        // Clear any previous error messages
        setError('');
        onSubmit(upiAddress, upiName); // Pass values back to parent
    };

    if (!isOpen) return null; // Don't render if modal is closed

    return (
        <div className={`fixed inset-0 flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-800'} bg-opacity-75`}>
            <div className={`rounded-lg p-6 shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-green-50 text-gray-900'}`}>
                <h2 className="text-xl font-semibold mb-4">Enter UPI Details</h2>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <div className="mb-4">
                    <label className="block mb-1">UPI Address:</label>
                    <input
                        type="text"
                        value={upiAddress}
                        onChange={(e) => setUpiAddress(e.target.value)}
                        className={`w-full p-2 border rounded-md ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-1">UPI Name:</label>
                    <input
                        type="text"
                        value={upiName}
                        onChange={(e) => setUpiName(e.target.value)}
                        className={`w-full p-2 border rounded-md ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
                    />
                </div>
                <div className="flex justify-end">
                    <button onClick={onClose} className={`mr-2 p-2 ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-300'} rounded-md`}>Cancel</button>
                    <button onClick={handleSubmit} className="p-2 bg-blue-500 text-white rounded-md">Submit</button>
                </div>
            </div>
        </div>
    );
};

export default UpiDetailsModal;
