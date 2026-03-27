import React, { useState, useEffect } from 'react';
import ParticleSphere from './three/ParticleSphere';
import { Leva } from 'leva';
import { Sun, Moon } from 'lucide-react';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Theme Toggle Button */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed top-4 left-4 z-50 p-2 rounded-full backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
        title="Toggle Theme"
      >
        {isDarkMode ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-slate-800" />}
      </button>

      {/* Leva Controls container - we can position it here or let it default */}
      <div className="absolute top-0 right-0 z-50">
         <Leva theme={{
            colors: {
              elevation1: isDarkMode ? '#111' : '#fff',
              elevation2: isDarkMode ? '#222' : '#f0f0f0',
              elevation3: isDarkMode ? '#333' : '#e0e0e0',
              accent1: '#11dddd',
              accent2: '#11dddd',
              accent3: '#11dddd',
              highlight1: isDarkMode ? '#444' : '#ccc',
              highlight2: isDarkMode ? '#555' : '#bbb',
              highlight3: isDarkMode ? '#666' : '#aaa',
              vivid1: '#ffcc00',
              folderWidgetColor: isDarkMode ? '#555' : '#aaa',
              folderTextColor: isDarkMode ? '#fff' : '#000',
              toolTipBackground: isDarkMode ? '#222' : '#fff',
              toolTipText: isDarkMode ? '#fff' : '#000',
            }
         }} />
      </div>

      {/* Main 3D Scene */}
      <div className="w-full h-screen">
        <ParticleSphere isDarkMode={isDarkMode} />
      </div>

    </div>
  );
}

export default App;