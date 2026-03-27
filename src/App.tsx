import { useState, useEffect } from 'react';
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
    <div className={`min-h-screen transition-colors duration-500 overflow-hidden ${isDarkMode ? 'bg_dark text-white' :'text-black'}`}>
      
      {/* Theme Toggle Button */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed top-4 left-4 z-50 p-3 rounded-full backdrop-blur-md bg-white/10 dark:bg-black/20 border border-gray-200 dark:border-white/20 hover:scale-110 transition-all cursor-pointer shadow-lg"
        title="Toggle Theme"
      >
        {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-800" />}
      </button>

      {/* Leva Controls container - Positioning in Bottom Left */}
      <div className="absolute bottom-4 left-4 z-50">
         <Leva theme={{
            colors: {
              elevation1: isDarkMode ? '#1e1e1e' : '#ffffff',
              elevation2: isDarkMode ? '#2d2d2d' : '#f4f4f5',
              elevation3: isDarkMode ? '#3f3f46' : '#e4e4e7',
              accent1: isDarkMode ? '#00d2ff' : '#000000',
              accent2: isDarkMode ? '#00d2ff' : '#000000',
              accent3: isDarkMode ? '#00d2ff' : '#000000',
              highlight1: isDarkMode ? '#52525b' : '#d4d4d8',
              highlight2: isDarkMode ? '#71717a' : '#a1a1aa',
              highlight3: isDarkMode ? '#a1a1aa' : '#71717a',
              vivid1: '#ffcc00',
              folderWidgetColor: isDarkMode ? '#71717a' : '#a1a1aa',
              folderTextColor: isDarkMode ? '#ffffff' : '#000000',
              toolTipBackground: isDarkMode ? '#1e1e1e' : '#ffffff',
              toolTipText: isDarkMode ? '#ffffff' : '#000000',
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