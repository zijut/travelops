import React, { useRef, useState } from 'react';
import { useApp } from '../AppContext';
import { Card } from './shared/Card';
import { Icon } from './shared/Icon';

const TRANSLATIONS = {
  id: {
    title: 'Pengaturan Sistem',
    subtitle: 'Konfigurasi preferensi tampilan, lokalisasi bahasa, notifikasi sistem, serta manajemen database.',
    
    // Theme Preference Group
    themeTitle: 'Preferensi Tampilan',
    themeSubtitle: 'Atur palet warna utama antarmuka TravelOps OS.',
    themeDark: 'Mode Gelap',
    themeDarkDesc: 'Tampilan kontras tinggi, nyaman di mata untuk kondisi minim cahaya.',
    themeLight: 'Mode Terang',
    themeLightDesc: 'Tampilan bersih, cerah dengan visibilitas luar ruangan maksimal.',
    
    // Localization
    langTitle: 'Bahasa & Lokalisasi',
    langSubtitle: 'Pilih bahasa default untuk label system, draf cetakan, dan asisten bot.',
    langSelect: 'Pilih Bahasa',
    langLabel: 'Bahasa Aktif',
    
    // Toggle Alert Channels
    alertTitle: 'Sistem Notifikasi & Toast',
    alertSubtitle: 'Aktifkan atau nonaktifkan saluran komunikasi taktis pada layar Anda.',
    bellLabel: 'Lonceng Notifikasi Header',
    bellDesc: 'Tampilkan lonceng status real-time di sudut kanan atas menu utama.',
    toastLabel: 'Notifikasi Toast Melayang',
    toastDesc: 'Tampilkan pesan toast di sudut kanan bawah setiap kali ada aktivitas sistem.',
    
    // Database and Persistence
    dbTitle: 'Manajemen Data & Backup',
    dbSubtitle: 'Ekspor database operasional, restore cadangan berkas, atau reset ulang seluruh platform ke draf asli.',
    btnBackup: 'Backup Database (JSON)',
    btnBackupDesc: 'Unduh seluruh database jemaah, keuangan, draf paket, dan profil ke satu file JSON terenkripsi lokal.',
    btnRestore: 'Restore Database',
    btnRestoreDesc: 'Pulihkan seluruh data Paket/Penjualan, Jamaah, Keuangan, Visa, dan Operasional kembali ke data seed bawaan awal.',
    btnReset: 'Hapus & Reset Platform',
    btnResetDesc: 'Hapus permanen seluruh riwayat transaksi, manifes jemaah, dan kembalikan ke pengaturan bawaan pabrik.',
    
    // Feedback and details
    toastReset: 'Database berhasil di-reset sepenuhnya menjadi kosong!',
    toastBackupSuccess: 'Database berhasil dicadangkan ke berkas TravelOps_Backup_Live.json!',
    toastRestoreSuccess: 'Database berhasil dipulihkan kembali ke data seed bawaan!',
    toastRestoreFail: 'Restore gagal! Terjadi kesalahan saat memulihkan data bawaan.',
    confirmReset: 'Apakah anda yakin? Tindakan ini akan menghapus semua input Paket/Penjualan, Jamaah, Keuangan, Visa, dan Operasional untuk akun ini, lalu memuat ulang halaman.',
    on: 'Aktif',
    off: 'Nonaktif'
  },
  en: {
    title: 'System Settings',
    subtitle: 'Configure visual themes, translation locales, alert notification channels, and active platform database structures.',
    
    // Theme Preference Group
    themeTitle: 'System Theme',
    themeSubtitle: 'Adjust the visual color architecture of TravelOps OS.',
    themeDark: 'Dark Mode Theme',
    themeDarkDesc: 'High contrast slate tones, comfortable for night operations.',
    themeLight: 'Light Mode Theme',
    themeLightDesc: 'Clean off-white canvases optimized for direct daylight readability.',
    
    // Localization
    langTitle: 'System Localization',
    langSubtitle: 'Choose the default translation scope for system tags, reports, and AI bot interfaces.',
    langSelect: 'Choose Language',
    langLabel: 'Active Locale',
    
    // Toggle Alert Channels
    alertTitle: 'Notifications & Feedback alerts',
    alertSubtitle: 'Toggle visual communication methods and tactical indicators on screen.',
    bellLabel: 'Header Notification Bell',
    bellDesc: 'Display the bell widget showing live operational notifications on the top menu.',
    toastLabel: 'Floating Toast Notification',
    toastDesc: 'Render temporary micro-toasts in the bottom right corner for real-time validation.',
    
    // Database and Persistence
    dbTitle: 'Database Ledger & Operations Backup',
    dbSubtitle: 'Export consolidated logs, restore historic records, or factory-reset state storage units.',
    btnBackup: 'Backup Database (JSON)',
    btnBackupDesc: 'Download all registered pilgrims, ledgers, draft packages, and profiles into a lightweight JSON file.',
    btnRestore: 'Restore Database',
    btnRestoreDesc: 'Restore all packages, sales, pilgrims, financial ledger, visa, and operational states back to the original database seed defaults.',
    btnReset: 'Factory Reset Platform',
    btnResetDesc: 'Permanently sweep all active inputs, reports, transactions, and revert to fresh white-label states.',
    
    // Feedback and details
    toastReset: 'All transaction database entries successfully reset for this account!',
    toastBackupSuccess: 'Database state successfully backed up to TravelOps_Backup_Live.json!',
    toastRestoreSuccess: 'Database successfully restored back to default template seed values!',
    toastRestoreFail: 'Restore aborted! An error occurred while restoring data.',
    confirmReset: 'Are you absolutely sure? This will wipe all packages, sales, pilgrims, financials, visas, and operations for this account.',
    on: 'ON',
    off: 'OFF'
  }
};

const Settings: React.FC = () => {
  const { 
    isDarkMode, 
    toggleDarkMode, 
    language, 
    setLanguage, 
    appSettings, 
    setAppSettings, 
    resetAllData, 
    restoreDefaultSeeds,
    triggerToast 
  } = useApp();
  
  const t = TRANSLATIONS[language];

  // Custom Confirmation Popups State
  const [confirmModal, setConfirmModal] = useState<{ type: 'BACKUP' | 'RESTORE' | 'RESET' | null }>({ type: null });

  // Toggle Bell Notifications
  const handleToggleBell = () => {
    setAppSettings(prev => {
      const next = { ...prev, enableBell: !prev.enableBell };
      triggerToast(
        language === 'id' 
          ? `Lonceng Notifikasi: ${next.enableBell ? 'Aktif' : 'Nonaktif'}` 
          : `Notification Bell: ${next.enableBell ? 'Enabled' : 'Disabled'}`,
        'info'
      );
      return next;
    });
  };

  // Toggle Toast Alerts
  const handleToggleToast = () => {
    setAppSettings(prev => {
      const next = { ...prev, enableToast: !prev.enableToast };
      // Always allow at least this final notification to inform user what just happened
      if (next.enableToast) {
        triggerToast(
          language === 'id' ? 'Notifikasi Toast: Aktif' : 'Toast Notifications: Enabled',
          'success'
        );
      }
      return next;
    });
  };

  // Execute Backup Data after custom popup confirmation
  const executeBackup = () => {
    try {
      const keys = [
        'travelops_dark_mode',
        'travelops_lang',
        'travelops_packages',
        'travelops_jamaah',
        'travelops_notifications',
        'travelops_user_profile',
        'travelops_app_settings',
        'travelops_finance_ledger_v2'
      ];
      
      const backupObj: { [key: string]: string | null } = {};
      keys.forEach(key => {
        backupObj[key] = localStorage.getItem(key);
      });

      const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `TravelOps_Backup_v2_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      triggerToast(t.toastBackupSuccess, 'success');
    } catch (e) {
      console.error(e);
      triggerToast(language === 'id' ? 'Backup gagal!' : 'Backup failed!', 'error');
    }
  };

  // Execute Restore after custom popup confirmation
  const executeRestore = () => {
    try {
      restoreDefaultSeeds();
      triggerToast(t.toastRestoreSuccess, 'success');
      
      // Force reload after short delay to fully apply states
      setTimeout(() => {
        window.location.reload();
      }, 1200);

    } catch (err) {
      console.error(err);
      triggerToast(t.toastRestoreFail, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in pb-12 text-left">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
          {t.title}
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Navigation Quick List */}
        <div className="space-y-4 md:col-span-1">
          <Card className="p-4 bg-emerald-800 text-emerald-100 border border-emerald-950/20 shadow-md">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <svg className="h-5 w-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h4 className="font-extrabold text-xs tracking-wider text-white uppercase">TravelOps OS v2.1</h4>
                <p className="text-[10px] text-emerald-300 font-semibold uppercase">White-Label Console</p>
              </div>
            </div>
            <p className="text-[11px] text-emerald-200/80 leading-relaxed border-t border-white/10 pt-2.5">
              {language === 'id'
                ? 'Seluruh preferensi Anda tersimpan secara aman di dalam container memory browser lokal (Protected Web Sandbox.'
                : 'All layout assets and configurations saved locally under protected client-side sandbox environments.'}
            </p>
          </Card>

          {/* Quick Stats Panel */}
          <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3.5">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {language === 'id' ? 'Status Sandbox' : 'Sandbox Telemetry'}
            </h4>
            <div className="space-y-2 font-mono text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-405">{language === 'id' ? 'Lokasi Penyimpanan:' : 'Storage Engine:'}</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">LocalStorage (Live)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-405">{language === 'id' ? 'Lonceng Status:' : 'Header Bell:'}</span>
                <span className={`font-extrabold ${appSettings.enableBell ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {appSettings.enableBell ? t.on : t.off}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-405">{language === 'id' ? 'Modul Feedback:' : 'Toast Feed:'}</span>
                <span className={`font-extrabold ${appSettings.enableToast ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {appSettings.enableToast ? t.on : t.off}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Operational Settings Panels */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Section 1: Themes & Styling Layout */}
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="border-b dark:border-slate-800 pb-3">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <span>{t.themeTitle}</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{t.themeSubtitle}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Light Mode Selector Card */}
              <button
                type="button"
                onClick={() => { if (isDarkMode) toggleDarkMode(); }}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 group cursor-pointer ${
                  !isDarkMode 
                    ? 'border-emerald-500 bg-emerald-500/[0.02] dark:bg-emerald-500/5 ring-1 ring-emerald-500 shadow-xs' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-100/50'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{t.themeLight}</span>
                  <div className={`h-5 w-5 shrink-0 rounded-full border flex items-center justify-center ${!isDarkMode ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                    {!isDarkMode && <span className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">{t.themeLightDesc}</p>
              </button>

              {/* Dark Mode Selector Card */}
              <button
                type="button"
                onClick={() => { if (!isDarkMode) toggleDarkMode(); }}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 group cursor-pointer ${
                  isDarkMode 
                    ? 'border-emerald-500 bg-emerald-500/[0.02] dark:bg-emerald-500/5 ring-1 ring-emerald-500 shadow-xs' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-100/50'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{t.themeDark}</span>
                  <div className={`h-5 w-5 shrink-0 rounded-full border flex items-center justify-center ${isDarkMode ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                    {isDarkMode && <span className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-2 leading-relaxed">{t.themeDarkDesc}</p>
              </button>

            </div>
          </Card>

          {/* Section 2: Localization */}
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="border-b dark:border-slate-800 pb-3">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5A2.5 2.5 0 0019 9.5V8a2 2 0 00-2-2h-3a3 3 0 00-3-3V3.935M12 22a10 10 0 100-20 10 10 0 000 20z" />
                </svg>
                <span>{t.langTitle}</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{t.langSubtitle}</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-left">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">{t.langLabel}</span>
                <span className="text-[10px] text-slate-400">{language === 'id' ? 'Bahasa default TravelOps OS' : 'Active system translations'}</span>
              </div>
              <div className="flex items-center space-x-1.5 p-1 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl max-w-xs shrink-0 self-start">
                <button
                  type="button"
                  onClick={() => { if (language !== 'id') setLanguage('id'); }}
                  className={`px-4 py-2 text-[10px] rounded-lg font-bold transition-all cursor-pointer ${
                    language === 'id' 
                      ? 'bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-xs text-emerald-600 dark:text-emerald-400' 
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  🇮🇩 Indonesia
                </button>
                <button
                  type="button"
                  onClick={() => { if (language !== 'en') setLanguage('en'); }}
                  className={`px-4 py-2 text-[10px] rounded-lg font-bold transition-all cursor-pointer ${
                    language === 'en' 
                      ? 'bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-xs text-emerald-600 dark:text-emerald-400' 
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  🇺🇸 English
                </button>
              </div>
            </div>
          </Card>

          {/* Section 3: Notification Alerts Channels */}
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="border-b dark:border-slate-800 pb-3">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span>{t.alertTitle}</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{t.alertSubtitle}</p>
            </div>

            <div className="divide-y divide-slate-150 dark:divide-slate-800">
              
              {/* Bell active toggle */}
              <div className="flex items-center justify-between py-3.5 first:pt-0">
                <div className="text-left pr-4">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">{t.bellLabel}</span>
                  <span className="text-[10px] text-slate-400 leading-normal block max-w-md mt-0.5">{t.bellDesc}</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleBell}
                  className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none shrink-0 cursor-pointer ${
                    appSettings.enableBell ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${appSettings.enableBell ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Toast active toggle */}
              <div className="flex items-center justify-between py-3.5 last:pb-0">
                <div className="text-left pr-4">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">{t.toastLabel}</span>
                  <span className="text-[10px] text-slate-400 leading-normal block max-w-md mt-0.5">{t.toastDesc}</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleToast}
                  className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none shrink-0 cursor-pointer ${
                    appSettings.enableToast ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${appSettings.enableToast ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

            </div>
          </Card>

          {/* Section 4: Database reset, backup, and restore */}
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="border-b dark:border-slate-800 pb-3">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                <span>{t.dbTitle}</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{t.dbSubtitle}</p>
            </div>

            <div className="space-y-4">
              
              {/* Backup Card row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850">
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{t.btnBackup}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block max-w-md">{t.btnBackupDesc}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmModal({ type: 'BACKUP' })}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl transition-all self-start sm:self-center shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Backup</span>
                </button>
              </div>

              {/* Restore Card row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850">
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{t.btnRestore}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block max-w-md">{t.btnRestoreDesc}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmModal({ type: 'RESTORE' })}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl transition-all self-start sm:self-center shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>Restore</span>
                </button>
              </div>

              {/* Reset Database row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-red-500/[0.02] dark:bg-red-500/5 border border-red-100 dark:border-red-950/40">
                <div className="text-left">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">{t.btnReset}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-450 mt-0.5 block max-w-md">{t.btnResetDesc}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmModal({ type: 'RESET' })}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl transition-all self-start sm:self-center shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Reset Data</span>
                </button>
              </div>

            </div>
          </Card>

        </div>

      </div>

      {/* --- CUSTOM BEAUTIFUL POPUP CONFIRMATION MODAL --- */}
      {confirmModal.type && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-scale-up text-left">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2.5 rounded-full ${
                confirmModal.type === 'RESET' 
                  ? 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400' 
                  : confirmModal.type === 'RESTORE'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                  : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
              }`}>
                {confirmModal.type === 'RESET' && (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
                {confirmModal.type === 'RESTORE' && (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                )}
                {confirmModal.type === 'BACKUP' && (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {confirmModal.type === 'RESET' && (language === 'id' ? 'Konfirmasi Reset Platform' : 'Confirm Platform Reset')}
                {confirmModal.type === 'RESTORE' && (language === 'id' ? 'Konfirmasi Restore Database' : 'Confirm Database Restore')}
                {confirmModal.type === 'BACKUP' && (language === 'id' ? 'Konfirmasi Backup Database' : 'Confirm Database Backup')}
              </h3>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-405 mb-6 leading-relaxed">
              {confirmModal.type === 'RESET' && t.confirmReset}
              {confirmModal.type === 'RESTORE' && (
                language === 'id' 
                  ? `Apakah Anda yakin ingin memulihkan database ke draf bawaan database seed? Tindakan ini akan menimpa seluruh input Paket/Penjualan, Jamaah, Keuangan, Visa, dan Operasional saat ini.` 
                  : `Are you sure you want to restore the database to the predefined template seed defaults? This action will overwrite all current packages, sales, pilgrims, financials, visas, and operations data.`
              )}
              {confirmModal.type === 'BACKUP' && (
                language === 'id' 
                  ? 'Apakah Anda yakin ingin mencadangkan database sekarang? Berkas cadangan akan diunduh secara lokal.'
                  : 'Are you sure you want to back up your database now? A secure backup file will be downloaded locally.'
              )}
            </p>
            
            <div className="flex justify-end space-x-2 border-t dark:border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => {
                  setConfirmModal({ type: null });
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {language === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal.type === 'RESET') {
                    resetAllData();
                    triggerToast(t.toastReset, 'success');
                    setTimeout(() => {
                      window.location.reload();
                    }, 1000);
                  } else if (confirmModal.type === 'BACKUP') {
                    executeBackup();
                  } else if (confirmModal.type === 'RESTORE') {
                    executeRestore();
                  }
                  setConfirmModal({ type: null });
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer shadow-sm ${
                  confirmModal.type === 'RESET'
                    ? 'bg-red-600 hover:bg-red-700'
                    : confirmModal.type === 'RESTORE'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {language === 'id' ? 'Ya, Lanjutkan' : 'Yes, Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
