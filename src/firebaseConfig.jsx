// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported,logEvent } from "firebase/analytics";
import firebaseConfigData from './firebaseConfig.json'; // Import JSON config




const firebaseApp = initializeApp(firebaseConfigData);

const analytics =getAnalytics(firebaseApp) 
// console.log(firebaseApp)


const logFirebaseEvent = (eventName, eventParams = {}) => {
  // Check if analytics is initialized
  if (analytics) {
    // console.log("Logging to firebase",eventName)
    logEvent(analytics, eventName, eventParams);
  } else {
    console.warn("Analytics is not supported or not initialized");
  }
};



// Exporting analytics and logEvent function
export { analytics, logFirebaseEvent };