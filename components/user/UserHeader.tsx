import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../AppContext';

interface UserHeaderProps {
  travelName: string;
  setActiveView: (view: string) => void;
}

export const UserHeader: React.FC<UserHeaderProps> = ({ travelName, setActiveView }) => {
  const {
    isDarkMode,
    toggleDarkMode,
    language,
    setLanguage,
    notifications,
    markNotificationAsRead,
    markAllNotificationsRead,
    activeJamaah,
    userProfile,
    isAdmin,
    setPreviewMode,
    logout,
    triggerToast
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const jamaahName = activeJamaah?.name || userProfile?.name || 'Ahmad Subagja';
  const jamaahPassport = activeJamaah?.passportNumber || 'A1234500';

  return (
    <header className={`px-5 py-3 flex items-center justify-between border-b transition-colors duration-250 z-30 shrink-0 ${
      isDarkMode 
        ? 'bg-slate-950 border-slate-800 text-slate-100' 
        : 'bg-white border-slate-200 text-slate-800 shadow-xs'
    }`}>
      {/* Travel & Pilgrim Portal Badge */}
      <div className="flex items-center space-x-3 text-left">
        <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-sm">
          🕋
        </div>
        <div className="leading-tight">
          <div className="flex items-center space-x-2">
            <h2 className="text-xs md:text-sm font-black tracking-tight uppercase text-slate-900 dark:text-white">
              {travelName}
            </h2>
            <span className="bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[9px] font-black px-2 py-0.2 rounded uppercase">
              Portal Jemaah
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Jemaah: <strong className="text-emerald-600 dark:text-emerald-400">{jamaahName}</strong> (Paspor {jamaahPassport})
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 md:space-x-3">
        
        {/* Admin Preview Mode Switcher Notice */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setPreviewMode(false);
              triggerToast('Beralih kembali ke Panel Operasional Admin', 'info');
              setActiveView('Dashboard');
            }}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
          >
            <span>🏢</span>
            <span>Mode Admin</span>
          </button>
        )}

        {/* Language selector */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border dark:border-slate-800">
          <button
            type="button"
            onClick={() => setLanguage('id')}
            className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
              language === 'id' ? 'bg-emerald-600 text-white' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            ID
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
              language === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            EN
          </button>
        </div>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="p-2 border rounded-xl bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-all cursor-pointer"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? '🌞' : '🌙'}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 border rounded-xl bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 relative transition-all cursor-pointer"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 text-left space-y-3">
              <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
                <span className="text-xs font-black uppercase text-slate-800 dark:text-white">Notifikasi Jemaah</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Tandai Semua Dibaca
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Tidak ada notifikasi baru</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        n.read
                          ? 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-400'
                          : 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-500/20 text-slate-800 dark:text-slate-200 font-semibold'
                      }`}
                    >
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                        {language === 'id' ? n.titleId : n.titleEn}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {language === 'id' ? n.descId : n.descEn}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar / Menu */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <img
              src={activeJamaah?.avatarUrl || userProfile?.photo || 'https://picsum.photos/seed/man1/100/100'}
              alt={jamaahName}
              className="h-8 w-8 rounded-full object-cover border border-emerald-500"
            />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 text-left space-y-1">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-black text-slate-900 dark:text-white truncate">{jamaahName}</p>
                <p className="text-[10px] text-slate-400 font-mono">Paspor: {jamaahPassport}</p>
                <span className="inline-block mt-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded">
                  Jemaah Haji & Umrah
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveView('Profil Jemaah');
                  setIsProfileOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center space-x-2"
              >
                <span>👤</span>
                <span>Profil Saya</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveView('Buku Doa & Manasik');
                  setIsProfileOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center space-x-2"
              >
                <span>📖</span>
                <span>Panduan Doa</span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewMode(false);
                    setIsProfileOpen(false);
                    triggerToast('Kembali ke Dashboard Admin TravelOps', 'info');
                    setActiveView('Dashboard');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer flex items-center space-x-2"
                >
                  <span>🏢</span>
                  <span>Buka Panel Admin</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  logout();
                  setIsProfileOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer flex items-center space-x-2"
              >
                <span>🚪</span>
                <span>Keluar Akun</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default UserHeader;
