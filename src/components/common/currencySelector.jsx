import React from 'react';
import Card from './card';

// Define the list of available currencies and units
const availableCurrencies = [
    { symbol: '₹', name: 'Indian Rupee (₹)' },
    { symbol: '$', name: 'US Dollar ($)' },
    { symbol: '€', name: 'Euro (€)' },
    { symbol: '£', name: 'British Pound (£)' },
    { symbol: '¥', name: 'Japanese Yen (¥)' },
    { symbol: '₩', name: 'South Korean Won (₩)' },
    { symbol: '₱', name: 'Philippine Peso (₱)' },
    { symbol: 'A$', name: 'Australian Dollar (A$)' },
    { symbol: 'C$', name: 'Canadian Dollar (C$)' },
    { symbol: 'CHF', name: 'Swiss Franc (CHF)' },
    { symbol: 'NZ$', name: 'New Zealand Dollar (NZ$)' },
    { symbol: 'R$', name: 'Brazilian Real (R$)' },
    { symbol: '₺', name: 'Turkish Lira (₺)' },
    { symbol: '₽', name: 'Russian Ruble (₽)' },
    { symbol: 'HK$', name: 'Hong Kong Dollar (HK$)' },
    { symbol: 'SGD', name: 'Singapore Dollar (SGD)' },
    { symbol: 'ZAR', name: 'South African Rand (ZAR)' },
    { symbol: '฿', name: 'Thai Baht (฿)' },
    { symbol: '₦', name: 'Nigerian Naira (₦)' },
    { symbol: 'MX$', name: 'Mexican Peso (MX$)' },
    { symbol: 'SEK', name: 'Swedish Krona (SEK)' },
    { symbol: 'NOK', name: 'Norwegian Krone (NOK)' },
    { symbol: 'DKK', name: 'Danish Krone (DKK)' },
    { symbol: 'MYR', name: 'Malaysian Ringgit (MYR)' },
    { symbol: 'BHD', name: 'Bahraini Dinar (BHD)' },
    { symbol: 'KWD', name: 'Kuwaiti Dinar (KWD)' },
    { symbol: 'OMR', name: 'Omani Rial (OMR)' },
    { symbol: 'QAR', name: 'Qatari Rial (QAR)' },
    { symbol: 'AED', name: 'United Arab Emirates Dirham (AED)' },
    { symbol: 'BND', name: 'Brunei Dollar (BND)' },
    { symbol: 'JOD', name: 'Jordanian Dinar (JOD)' },
    { symbol: 'CNY', name: 'Chinese Yuan (CNY)' },
    { symbol: 'TWD', name: 'New Taiwan Dollar (TWD)' },
    { symbol: 'ISK', name: 'Icelandic Króna (ISK)' },
    { symbol: 'PEN', name: 'Peruvian Nuevo Sol (PEN)' },
    { symbol: 'COP', name: 'Colombian Peso (COP)' },
    { symbol: 'CLP', name: 'Chilean Peso (CLP)' },
    { symbol: 'VEF', name: 'Venezuelan Bolívar (VEF)' },
    { symbol: 'MUR', name: 'Mauritian Rupee (MUR)' },
    { symbol: 'SCR', name: 'Seychellois Rupee (SCR)' },
    { symbol: 'TND', name: 'Tunisian Dinar (TND)' },
    { symbol: 'KZT', name: 'Kazakhstani Tenge (KZT)' },
    { symbol: 'RUB', name: 'Russian Ruble (RUB)' },
    // Add more currencies as needed
  ];
  
  const sortedCurrencies = availableCurrencies.sort((a, b) => a.name.localeCompare(b.name));

const CurrencySelector = ({ localSettings, handleSettingChange, isDarkMode }) => (
  <Card title="Currency" isDarkMode={isDarkMode}>
    <label className="block mb-2">Currency Unit:</label>
    <select
      name="currencyUnit"
      value={localSettings.currencyUnit}
      onChange={(e) => handleSettingChange({ target: { name: undefined ,value:e.target.value} }, 'currencyUnit')}
      className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'}`}
    >
      {sortedCurrencies.map((currency) => (
        <option key={currency.symbol} value={currency.symbol}>
          {currency.name}
        </option>
      ))}
    </select>
  </Card>
);

export default CurrencySelector;
