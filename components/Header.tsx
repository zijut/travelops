import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext';
import { translations } from '../translations';
import { Icon } from './shared/Icon';

interface HeaderProps {
  travelName: string;
  setActiveView?: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ travelName, setActiveView }) => {
  const { 
    isDarkMode, 
    toggleDarkMode, 
    language, 
    setLanguage, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsRead,
    triggerToast,
    userProfile,
    appSettings,
    logout
  } = useApp();

  const t = translations[language];

  // UI state
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className={`px-5 py-3 flex items-center justify-between border-b transition-colors duration-250 z-30 shrink-0 ${
      isDarkMode 
        ? 'bg-[#020617] border-slate-900 text-slate-100' 
        : 'bg-white border-slate-200 text-slate-800 shadow-sm'
    }`}>
      {/* Travel Title info */}
      <div className="flex items-center space-x-2 md:space-x-3">
        <div className={`p-1.5 rounded-lg hidden sm:flex ${isDarkMode ? 'bg-emerald-950/40 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div className="leading-tight text-left">
          <h2 className={`text-xs md:text-sm font-bold tracking-tight uppercase ${isDarkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>
            {travelName}
          </h2>
          <span className={`text-[10px] md:text-[11px] font-medium tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            | {t.terminal}
          </span>
        </div>
      </div>

      {/* Navigation and interactive tools */}
      <div className="flex items-center space-x-2 md:space-x-4">
        
        {/* Language Selection menu */}
        <div className="relative" ref={langRef}>
          <button 
            id="lang-menu-btn"
            onClick={() => setIsLangOpen(!isLangOpen)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-900/60 border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800' 
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-slate-100'
            }`}
          >
            {/* Modern Globe Icon */}
            <svg className="h-4 w-4 shrink-0 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: '16px', height: '16px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.5 3a17 17 0 000 18M12.5 3a17 17 0 000 18" />
            </svg>
            <span>{language === 'id' ? 'ID' : 'EN'}</span>
            <svg className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isLangOpen && (
            <div className={`absolute right-0 mt-1.5 w-32 rounded-xl shadow-xl py-1 border text-xs z-50 transition-all ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <button 
                id="lang-btn-id"
                onClick={() => {
                  setLanguage('id');
                  setIsLangOpen(false);
                  triggerToast('Bahasa diubah ke Indonesia 🇮🇩', 'info');
                }}
                className={`w-full text-left px-3 py-2 flex items-center space-x-2 ${
                  language === 'id' 
                    ? 'font-bold bg-emerald-500/10 text-emerald-500' 
                    : isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                }`}
              >
                <span>🇮🇩</span> <span>Indonesia</span>
              </button>
              <button 
                id="lang-btn-en"
                onClick={() => {
                  setLanguage('en');
                  setIsLangOpen(false);
                  triggerToast('Language changed to English 🇺🇸', 'info');
                }}
                className={`w-full text-left px-3 py-2 flex items-center space-x-2 ${
                  language === 'en' 
                    ? 'font-bold bg-emerald-500/10 text-emerald-500' 
                    : isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                }`}
              >
                <span>🇺🇸</span> <span>English</span>
              </button>
            </div>
          )}
        </div>

        {/* Dark / Light Toggle Switch */}
        <button 
          id="theme-toggle-btn"
          onClick={toggleDarkMode}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className={`p-2 rounded-xl transition-all duration-200 cursor-pointer border ${
            isDarkMode 
              ? 'bg-slate-900/60 border-slate-800 text-amber-400 hover:text-amber-300 hover:bg-slate-800' 
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-slate-100'
          }`}
        >
          {isDarkMode ? (
            // Modern Sun Icon
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: '18px', height: '18px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            // Modern Moon Icon
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: '18px', height: '18px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Notifications Icon and Dropdown */}
        {appSettings.enableBell !== false && (
          <div className="relative" ref={notifRef}>
            <button 
              id="notif-menu-btn"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`relative p-2 rounded-xl transition-all border cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-slate-100'
              }`}
            >
              <Icon name="notification" className="h-5 w-5 shrink-0 hover:scale-105 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border text-xs z-50 overflow-hidden transition-all duration-150 ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="p-3 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between font-bold text-xs uppercase tracking-wider bg-slate-50 dark:bg-slate-950/50">
                  <span className={isDarkMode ? 'text-emerald-400' : 'text-emerald-800'}>{t.notifTitle}</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => {
                        markAllNotificationsRead();
                        triggerToast(language === 'id' ? 'Semua notifikasi dibaca' : 'All notifications read', 'info');
                      }}
                      className="text-[10px] text-emerald-500 hover:underline cursor-pointer"
                    >
                      {t.markAllRead}
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-5 text-center text-gray-400 italic">
                       {t.noNotif}
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer relative ${
                          !notif.read ? 'bg-emerald-500/5 font-medium' : ''
                        }`}
                      >
                        {!notif.read && (
                          <div className="absolute top-3.5 left-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        )}
                        <div className="pl-2">
                          <div className="flex items-center justify-between font-semibold">
                            <span className={`${!notif.read ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-350'}`}>
                              {language === 'id' ? notif.titleId : notif.titleEn}
                            </span>
                            <span className="text-[9px] text-gray-400 whitespace-nowrap ml-2 font-normal">
                              {notif.timestamp}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 leading-normal">
                            {language === 'id' ? notif.descId : notif.descEn}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className={`h-5 w-px ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`} />

        {/* Profile Avatar Trigger and Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            id="profile-menu-btn"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-left cursor-pointer"
          >
            <div className="relative">
              <img
                src={userProfile.photo}
                alt="Admin"
                className="h-9 w-9 rounded-full object-cover ring-2 ring-emerald-500/40 shrink-0"
              />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-white dark:border-[#020617] rounded-full" />
            </div>
            <div className="leading-tight text-left hidden md:block">
              <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{userProfile.name.split(' ')[0] || userProfile.name}</p>
              <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>{userProfile.role || t.adminRole}</p>
            </div>
            <svg className="h-3 w-3 opacity-50 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isProfileOpen && (
            <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl border text-xs z-50 overflow-hidden transition-all duration-150 ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              {/* Account details */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200/50 dark:border-slate-800 flex items-center space-x-2.5">
                <img
                  src={userProfile.photo}
                  alt="Admin"
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{userProfile.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{userProfile.email}</p>
                </div>
              </div>

              <div className="p-1 divide-y divide-slate-100 dark:divide-slate-800">
                <div className="py-1">
                  <button 
                    onClick={() => {
                      if (setActiveView) {
                        setActiveView('Profile');
                      } else {
                        triggerToast(language === 'id' ? 'Membuka Profile...' : 'Opening Profile...', 'info');
                      }
                      setIsProfileOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center space-x-2 rounded-lg ${
                      isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <svg className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{t.profileMenu}</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (setActiveView) {
                        setActiveView('Settings');
                      } else {
                        triggerToast(language === 'id' ? 'Membuka Pengaturan...' : 'Opening Settings...', 'info');
                      }
                      setIsProfileOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center space-x-2 rounded-lg ${
                      isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <svg className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    </svg>
                    <span>{t.settingsMenu}</span>
                  </button>
                </div>

                <div className="py-1">
                  <button 
                    onClick={() => {
                      triggerToast(language === 'id' ? 'Berhasil keluar' : 'Logged out', 'success');
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center space-x-2 rounded-lg text-rose-500 ${
                      isDarkMode ? 'hover:bg-rose-500/10' : 'hover:bg-rose-50'
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>{t.logoutMenu}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
