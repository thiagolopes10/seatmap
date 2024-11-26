import React, { useEffect } from 'react';
import SeatMap from './components/SeatMap';
import MaintenanceCountdown from './components/MaintenanceCountdown';

function App() {
  useEffect(() => {
    // Verifica a preferência de tema salva ou do sistema
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-900">
      <MaintenanceCountdown />
      <SeatMap />
    </div>
  );
}

export default App;