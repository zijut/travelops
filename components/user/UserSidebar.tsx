import React from 'react';
import { useApp } from '../../AppContext';
import { USER_NAVIGATION_LINKS } from '../../constants';

interface UserSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({ activeView, setActiveView }) => {
  const { language, triggerToast, logout, activeJamaah, userProfile, isAdmin, setPreviewMode } = useApp();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'dashboard': return '🕋';
      case 'visa': return '🛂';
      case 'clock': return '🗓️';
      case 'hotel': return '🏨';
      case 'finance': return '💳';
      case 'book': return '📖';
      case 'package': return '📦';
      case 'user': return '👤';
      default: return '📍';
    }
  };

  return (
    <aside className="w-64 border-r border-emerald-950/40 flex flex-col shrink-0 transition-all duration-250 bg-gradient-to-b from-emerald-950 to-slate-950 text-white h-screen overflow-hidden select-none">
      
      {/* Brand & Agency Header */}
      <div className="p-4 border-b border-white/10 flex items-center space-x-3 text-left">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 p-0.5 shadow-md flex items-center justify-center text-xl">
          🕋
        </div>
        <div className="leading-tight flex-1 min-w-0">
          <h1 className="text-sm font-black tracking-tight text-white truncate">
            {userProfile?.agency || 'Al-Haramain'}
          </h1>
          <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
            Portal Jemaah Haji & Umroh
          </p>
        </div>
      </div>

      {/* Pilgrim Profile Summary Widget */}
      <div className="p-3 mx-3 my-3 rounded-2xl bg-white/5 border border-white/10 text-left space-y-1">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
            Jemaah Aktif
          </span>
        </div>
        <p className="text-xs font-black text-white truncate">
          {activeJamaah?.name || userProfile?.name || 'Ahmad Subagja'}
        </p>
        <p className="text-[10px] text-slate-400 font-mono">
          Paspor: {activeJamaah?.passportNumber || 'A1234500'} • {activeJamaah?.kloter || 'Kloter A'}
        </p>
      </div>

      {/* Navigation Links List */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto text-left">
        <p className="px-3 mb-2 text-[9px] uppercase font-bold tracking-widest text-emerald-300/60">
          {language === 'id' ? 'Menu Ibadah & Layanan' : 'Pilgrim Menu'}
        </p>

        {USER_NAVIGATION_LINKS.map((item) => {
          const isActive = activeView === item.name;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => setActiveView(item.name)}
              className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer text-left ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="mr-3 text-base shrink-0">{getIcon(item.icon)}</span>
              <span className="truncate flex-1">{item.name}</span>
              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Switcher / Logout Utilities */}
      <div className="p-3 border-t border-white/10 space-y-1 text-left">
        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setPreviewMode(false);
              triggerToast('Kembali ke Dashboard Admin TravelOps OS', 'info');
              setActiveView('Dashboard');
            }}
            className="w-full flex items-center px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all cursor-pointer"
          >
            <span className="mr-2.5 text-sm">🏢</span>
            <span className="truncate">Kembali ke Panel Admin</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            triggerToast(language === 'id' ? 'Berhasil keluar dari akun jemaah!' : 'Logged out successfully!', 'info');
            logout();
          }}
          className="w-full flex items-center px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-500/20 hover:text-white transition-all cursor-pointer"
        >
          <span className="mr-2.5 text-sm">🚪</span>
          <span>{language === 'id' ? 'Keluar Portal Jemaah' : 'Sign Out'}</span>
        </button>
      </div>

    </aside>
  );
};

export default UserSidebar;
