// localStorageUtils.js

class LocalStorageUtils {
  // Function to set an item in localStorage
  static setItem(key, value) {
    if (typeof value === 'object') {
      localStorage.setItem(key, JSON.stringify(value)); // Store object as JSON string
    } else {
      localStorage.setItem(key, value); // Store as string
    }
  }

  // Function to get an item from localStorage
  static getItem(key) {
    const value = localStorage.getItem(key);
    if (!value) return null; // Return null if item doesn't exist
    try {
      return JSON.parse(value); // Parse JSON string back to object
    } catch {
      return value; // Return as is if not an object
    }
  }

  // Function to update an item in localStorage
  static updateItem(key, value) {
    const existingValue = LocalStorageUtils.getItem(key);
    if (typeof existingValue === 'object' && typeof value === 'object') {
      const updatedValue = { ...existingValue, ...value }; // Merge existing and new values
      LocalStorageUtils.setItem(key, updatedValue);
    } else {
      console.error(`Unable to update. Value for key "${key}" is not an object.`);
    }
  }

  // Function to remove an item from localStorage
  static removeItem(key) {
    localStorage.removeItem(key);
  }

  // Function to clear all localStorage items
  static clearAll() {
    localStorage.clear();
  }
}

export default LocalStorageUtils; // Default export for the class
