import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext';
import { translations } from '../translations';
import { Icon } from './shared/Icon';

interface BottomBarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const BottomBar: React.FC<BottomBarProps> = ({ activeView, setActiveView }) => {
  const { language, isDarkMode, userProfile } = useApp();
  const t = translations[language];
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    if (isMoreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreOpen]);

  // Bottom menu items
  const primaryItems = [
    { name: 'Dashboard', icon: 'dashboard', label: 'Dashboard' },
    { name: 'Paket & Penjualan', icon: 'package', label: language === 'id' ? 'Paket' : 'Packages' },
    { name: 'Jamaah', icon: 'users', label: language === 'id' ? 'Jamaah' : 'Pilgrims' },
    { name: 'Keuangan', icon: 'finance', label: language === 'id' ? 'Keuangan' : 'Finance' },
  ];

  const moreItems = [
    { name: 'Operasional', icon: 'ops', label: language === 'id' ? 'Operasional' : 'Operations' },
    { name: 'Visa & Dokumen', icon: 'visa', label: language === 'id' ? 'Visa & Dokumen' : 'Visa & Doc' },
    { name: 'Laporan', icon: 'report', label: language === 'id' ? 'Laporan' : 'Reports' },
    { name: 'Settings', icon: 'settings', label: language === 'id' ? 'Pengaturan' : 'Settings' },
    { name: 'Profile', icon: 'users', label: language === 'id' ? 'Profil Saya' : 'My Profile', isProfile: true },
  ];

  const getLabel = (name: string) => {
    return (t as any)[name] || name;
  };

  return (
    <>
      {/* Drawer Overlay backdrop */}
      {isMoreOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity animate-fade-in" onClick={() => setIsMoreOpen(false)} />
      )}

      {/* Drawer Panel for "Lainnya" */}
      <div
        ref={drawerRef}
        className={`fixed left-0 right-0 bottom-16 rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-2xl z-50 transform transition-all duration-300 ease-out border-t px-5 pt-4 pb-6 ${
          isMoreOpen ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0 pointer-events-none'
        } ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-500">
            {language === 'id' ? 'Menu Lainnya' : 'More Menu'}
          </h3>
          <button
            onClick={() => setIsMoreOpen(false)}
            className="p-1 rounded-full bg-slate-150 dark:bg-slate-800 hover:opacity-80 cursor-pointer"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {moreItems.map((item) => {
            const isActive = activeView === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveView(item.name);
                  setIsMoreOpen(false);
                }}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/40 border border-transparent text-slate-500 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.isProfile && userProfile?.photo ? (
                  <img
                    src={userProfile.photo}
                    alt="profile"
                    className={`h-6 w-6 rounded-full object-cover border ${
                      isActive ? 'border-emerald-500' : 'border-slate-300 dark:border-slate-600'
                    }`}
                  />
                ) : (
                  <Icon name={item.icon} className={`h-5 w-5 ${isActive ? 'text-emerald-500' : 'opacity-80'}`} />
                )}
                <span className="text-[10px] font-bold text-center leading-tight truncate w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Bottom Bar */}
      <nav
        className={`fixed bottom-0 left-0 right-0 h-16 grid grid-cols-5 border-t px-2 py-1 items-center justify-items-center select-none z-45 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] ${
          isDarkMode
            ? 'bg-[#090d1a] border-slate-900 text-slate-300'
            : 'bg-white border-slate-200 text-slate-600'
        }`}
      >
        {primaryItems.map((item) => {
          const isActive = activeView === item.name;
          return (
            <button
              key={item.name}
              onClick={() => {
                setActiveView(item.name);
                setIsMoreOpen(false);
              }}
              className={`flex flex-col items-center justify-center w-full h-full py-1 rounded-xl transition-all relative cursor-pointer ${
                isActive
                  ? 'text-emerald-500 font-bold scale-105'
                  : 'hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Icon name={item.icon} className={`h-5 w-5 mb-0.5 ${isActive ? 'text-emerald-500' : 'opacity-70'}`} />
              <span className="text-[9px] font-medium tracking-tight truncate leading-tight">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-1 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}

        {/* More items activator */}
        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={`flex flex-col items-center justify-center w-full h-full py-1 rounded-xl transition-all cursor-pointer ${
            isMoreOpen || moreItems.some((m) => activeView === m.name)
              ? 'text-emerald-500 font-bold'
              : 'hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-0.5 h-5 mb-0.5">
            <span className={`w-1 h-1 rounded-full ${isMoreOpen || moreItems.some((m) => activeView === m.name) ? 'bg-emerald-500' : 'bg-current opacity-70'}`} />
            <span className={`w-1 h-1 rounded-full ${isMoreOpen || moreItems.some((m) => activeView === m.name) ? 'bg-emerald-500' : 'bg-current opacity-70'}`} />
            <span className={`w-1 h-1 rounded-full ${isMoreOpen || moreItems.some((m) => activeView === m.name) ? 'bg-[#10b981]' : 'bg-current opacity-70'}`} />
          </div>
          <span className="text-[9px] font-medium tracking-tight truncate leading-tight">
            {language === 'id' ? 'Lainnya' : 'More'}
          </span>
          {!isMoreOpen && moreItems.some((m) => activeView === m.name) && (
            <span className="absolute bottom-0 w-8 h-1 rounded-full bg-emerald-500" />
          )}
        </button>
      </nav>
    </>
  );
};

export default BottomBar;
