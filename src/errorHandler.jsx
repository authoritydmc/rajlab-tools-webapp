import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './themeContext'; // Import useTheme

const ErrorBoundary = () => {
  const [countdown, setCountdown] = useState(15000);
  const navigate = useNavigate();

  // Get the current theme mode (isDarkMode) from the theme context
  const { isDarkMode } = useTheme();

  // List of Harry Potter-themed error messages
  const errorMessages = [
    "Looks like you’ve been hit with a Confundus Charm! This page doesn’t exist.",
    "Uh oh, it seems like you've taken a wrong turn at Platform 9¾.",
    "This page must have been hidden under an Invisibility Cloak.",
    "Accio Page! Oh wait… this page cannot be summoned.",
    "It seems like the Marauder’s Map doesn’t show this path.",
    "A Basilisk must have petrified this page. Try again later!",
    "You’re trying to access the Room of Requirement, but it’s not appearing right now.",
    "Even Dobby couldn’t find this page!",
    "This page is as elusive as a Golden Snitch. Try searching again!",
    "The Triwizard Tournament might have hidden this page. Try something else.",
    "It appears that Hogwarts' anti-Muggle defenses have hidden this page from you."
  ];

  // List of Harry Potter-related GIFs
  const harryPotterGIFs = [
    "https://media1.tenor.com/m/CUNm8n1xS_kAAAAC/what-seriously.gif", 
    "https://media1.tenor.com/m/R7m2W1cD-UkAAAAC/harry-potter-hogwarts.gif",
    "https://media1.tenor.com/m/ImxiGgipE7gAAAAC/harrypotter-i-solemnly-swear.gif"
  ];

  // Select a random Harry Potter error message and GIF
  const randomErrorMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];
  const randomGif = harryPotterGIFs[Math.floor(Math.random() * harryPotterGIFs.length)];

  // Update the countdown and redirect to the homepage after 15 seconds
  useEffect(() => {
    if (countdown === 0) {
      navigate('/');
    }

    const interval = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown, navigate]);

  // Handle immediate redirect to homepage
  const handleRedirectNow = () => {
    navigate('/');
  };

  // Define theme-specific styles (light and dark themes)
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: isDarkMode ? '#212121' : '#f5f5f5', // Neutral gray for light mode
      textAlign: 'center',
      padding: '20px',
    },
    header: {
      fontSize: '3rem',
      color: isDarkMode ? '#f44336' : '#333', // Dark red for dark mode, neutral for light
      marginBottom: '20px',
    },
    text: {
      fontSize: '1.5rem',
      color: isDarkMode ? '#f5f5f5' : '#333', // Light or dark text color
    },
    puppyImage: {
      width: '300px',
      height: 'auto',
      marginTop: '20px',
      borderRadius: '15px',
    },
    button: {
      marginTop: '20px',
      padding: '10px 20px',
      backgroundColor: isDarkMode ? '#4caf50' : '#1976d2', // Green for dark mode, blue for light mode
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '1rem',
    },
    buttonHover: {
      backgroundColor: isDarkMode ? '#388e3c' : '#1565c0', // Darker color on hover
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>404 - Page Not Found</h1>
      <p style={styles.text}>
        {randomErrorMessage}
      </p>
     
      <img
        src={randomGif}
        alt="Harry Potter themed gif"
        style={styles.puppyImage}
      />
      <button
        style={styles.button}
        onClick={handleRedirectNow}
        onMouseEnter={(e) => e.target.style.backgroundColor = styles.buttonHover.backgroundColor}
        onMouseLeave={(e) => e.target.style.backgroundColor = styles.button.backgroundColor}
      >
        Redirect to Home Now
      </button>
      <p style={styles.text}>
        Redirecting to the homepage in <strong>{countdown}</strong> seconds...
      </p>
    </div>
  );
};

export default ErrorBoundary;
