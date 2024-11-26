import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { getAllSeats } from './db/api';
import SeatMap from './components/SeatMap';
import Dashboard from './components/Dashboard';
import type { Seat } from './types';

function App() {
  const [seats, setSeats] = useState<Record<string, Seat>>({});
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const loadSeats = async () => {
      try {
        const data = await getAllSeats();
        setSeats(data);
      } catch (error) {
        console.error('Failed to fetch seats:', error);
      }
    };

    loadSeats();
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sistema de Manutenção de Assentos
          </h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="space-y-6">
          <SeatMap seats={seats} setSeats={setSeats} />
        </div>

        <div className="mb-8">
          <Dashboard seats={seats} />
        </div>
      </div>
    </div>
  );
}

export default App;