import React from 'react';
import { useApp } from '../AppContext';
import { translations } from '../translations';
import { Icon } from './shared/Icon';
import { NAVIGATION_LINKS } from '../constants';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const { language, triggerToast, logout } = useApp();
  const t = translations[language];

  // Helper to translate navigation label
  const getLabel = (linkName: string) => {
    // Falls back to direct name if key not present
    return (t as any)[linkName] || linkName;
  };

  return (
    <aside className="w-64 border-r border-emerald-950/40 flex flex-col shrink-0 transition-all duration-250 bg-emerald-900 text-white h-screen overflow-hidden select-none">
      {/* Brand area */}
      <div className="p-4 flex items-center space-x-3 border-b border-white/10 transition-colors duration-250">
        <div className="p-2 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:rotate-6 bg-white/10 text-emerald-300">
          {/* Islamic-futuristic emblem */}
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21l-8-4 8-4 8 4-8 4zm0 0v-6M4 17V9l8-4 8 4v8l-8 4z" />
          </svg>
        </div>
        <div className="leading-tight text-left">
          <h1 className="text-sm font-black tracking-tight text-white">
            TravelOps <span className="text-emerald-400">OS</span>
          </h1>
          <p className="text-[10px] text-emerald-200/60 font-semibold tracking-widest uppercase">
            v2.1 White-Label
          </p>
        </div>
      </div>

      {/* Navigationlinks */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[9px] uppercase font-bold tracking-widest text-emerald-200/50">
          {language === 'id' ? 'Menu Utama' : 'Main Menu'}
        </p>
        {NAVIGATION_LINKS.map((item) => {
          const isActive = activeView === item.name;
          return (
            <a
              key={item.name}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveView(item.name);
              }}
              className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group relative ${
                isActive
                  ? 'bg-white/15 text-white font-bold border-l-4 border-emerald-400 pl-3 shadow-[0_4px_12px_rgba(255,255,255,0.05)]'
                  : 'text-emerald-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className={`mr-3 transition-colors shrink-0 ${
                isActive 
                  ? 'text-emerald-300' 
                  : 'text-emerald-250/70 group-hover:text-emerald-100'
              }`}>
                <Icon name={item.icon} className="h-5 w-5 shrink-0" />
              </div>
              <span className="truncate">{getLabel(item.name)}</span>
              {isActive && (
                <span className="absolute right-3 flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </a>
          );
        })}
      </nav>

      {/* Bottom utilities */}
      <div className="p-3 border-t border-white/10 transition-colors duration-250">
        <button
          onClick={() => setActiveView('Settings')}
          className={`w-full flex items-center px-4 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeView === 'Settings'
              ? 'bg-white/15 text-white font-bold border-l-4 border-emerald-400 pl-3 shadow-[0_4px_12px_rgba(255,255,255,0.05)]'
              : 'text-emerald-100 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Icon name="settings" className="h-5 w-5 shrink-0 mr-3 text-emerald-300 animate-hover-spin" />
          <span>{t.Settings}</span>
        </button>
        <button
          onClick={() => {
            triggerToast(language === 'id' ? 'Berhasil keluar!' : 'Logged out successfully!', 'info');
            logout();
          }}
          className="w-full flex items-center px-4 py-2.5 rounded-xl text-xs font-medium mt-1 transition-all text-rose-300 hover:bg-rose-500/20 hover:text-white cursor-pointer"
        >
          <Icon name="logout" className="h-5 w-5 shrink-0 mr-3 text-rose-400" />
          <span>{t.Logout}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
