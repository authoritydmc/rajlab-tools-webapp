// Root layout component for global structure
function RootLayout({ children }) {
    return (
      <div className="app-container">
        <main className="main-content">
          {children}
        </main>
      </div>
    );
  }
  
  export default RootLayout;