
import RootLayout from './RootLayout';
import MainLayout from './MainLayout';
import { ThemeProvider } from './providers/ThemeContext';
// Main App component
function App() {
  return (
    <ThemeProvider>
      <RootLayout>
        <MainLayout>
          <div className="content">
            <h2>Welcome to the React App</h2>
            <p>Your content goes here.</p>
          </div>
        </MainLayout>
      </RootLayout>
    </ThemeProvider>
  );
}



export default App;
