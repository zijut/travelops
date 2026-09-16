import React from 'react';
import { useApp } from '../../AppContext';

interface UserBottomBarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const UserBottomBar: React.FC<UserBottomBarProps> = ({ activeView, setActiveView }) => {
  const { isDarkMode } = useApp();

  const mobileNavItems = [
    { name: 'Ringkasan Perjalanan', shortLabel: 'Beranda', icon: '🕋' },
    { name: 'Dokumen & Visa', shortLabel: 'Visa', icon: '🛂' },
    { name: 'Jadwal & Itinerary', shortLabel: 'Jadwal', icon: '🗓️' },
    { name: 'Kamar & Kursi Bus', shortLabel: 'Kamar/Bus', icon: '🏨' },
    { name: 'Buku Doa & Manasik', shortLabel: 'Doa', icon: '📖' },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-40 border-t flex items-center justify-around px-2 py-2 md:hidden ${
      isDarkMode ? 'bg-slate-950/95 border-slate-800 text-slate-100 backdrop-blur-md' : 'bg-white/95 border-slate-200 text-slate-800 backdrop-blur-md shadow-lg'
    }`}>
      {mobileNavItems.map((item) => {
        const isActive = activeView === item.name;
        return (
          <button
            key={item.name}
            type="button"
            onClick={() => setActiveView(item.name)}
            className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-[9px] mt-0.5 tracking-tight font-medium">
              {item.shortLabel}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default UserBottomBar;
