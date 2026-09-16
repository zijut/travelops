import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../AppContext';

type PortalMode = 'admin' | 'jamaah';
type JamaahLoginMethod = 'email' | 'passport';

const Login: React.FC = () => {
  const { isDarkMode, toggleDarkMode, language, setLanguage, login, loginJamaahByPassport, triggerToast } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Active portal mode (admin or jamaah)
  const [portalMode, setPortalMode] = useState<PortalMode>(
    searchParams.get('portal') === 'jamaah' ? 'jamaah' : 'admin'
  );

  // Jamaah login method
  const [jamaahMethod, setJamaahMethod] = useState<JamaahLoginMethod>('email');

  // Input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passportOrBooking, setPassportOrBooking] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const t = {
    id: {
      back: 'Kembali ke Beranda',
      adminPortalTab: 'Portal Admin & Staf',
      jamaahPortalTab: 'Portal Jemaah / User',
      adminTitle: 'Portal Pengelola Travel',
      adminSub: 'Masuk ke sistem operasi & manajemen haji-umroh terpadu',
      jamaahTitle: 'Portal Jemaah & Keluarga',
      jamaahSub: 'Pantau status visa, itinerary, nomor kamar, kursi bus, dan doa manasik',
      emailLabel: 'Alamat Email Terdaftar',
      passLabel: 'Kata Sandi',
      passportLabel: 'Nomor Paspor / Kode Booking Jemaah',
      emailPl: 'Contoh: info@agensi.com atau jemaah@gmail.com',
      passPl: 'Masukkan kata sandi akun...',
      passportPl: 'Contoh: A1234500 atau JMH001',
      btnAdminSubmit: 'Masuk Dashboard Admin',
      btnJamaahSubmit: 'Buka Portal Jemaah Saya',
      methodEmail: 'Masuk dengan Email',
      methodPassport: 'Masuk dengan No. Paspor / Booking',
      adminDemoBtn: 'Demo Admin: Abdullah (Al-Haramain)',
      jamaahDemo1Btn: 'Demo Jemaah 1: Ahmad Subagja (Kloter A)',
      jamaahDemo2Btn: 'Demo Jemaah 2: Siti Aminah (Kloter B)',
      noAccountText: 'Belum memiliki akun?',
      registerAgency: 'Daftarkan Agensi Baru',
      registerJamaah: 'Daftar Sebagai Jemaah Baru',
      toastEmpty: 'Mohon isi semua kolom input!',
      toastSuccess: 'Selamat Datang! Mengalihkan ke panel Anda...',
      toastFailed: 'Autentikasi gagal! Periksa kembali data login Anda.'
    },
    en: {
      back: 'Back to Home',
      adminPortalTab: 'Admin & Staff Portal',
      jamaahPortalTab: 'Pilgrim / User Portal',
      adminTitle: 'Travel Operations Portal',
      adminSub: 'Sign in to unified Hajj & Umrah operations system',
      jamaahTitle: 'Pilgrim & Family Portal',
      jamaahSub: 'Track visa status, daily itinerary, hotel room, bus seat, and prayers',
      emailLabel: 'Registered Email Address',
      passLabel: 'Password',
      passportLabel: 'Passport Number / Pilgrim Booking Code',
      emailPl: 'e.g. admin@agency.com or pilgrim@gmail.com',
      passPl: 'Enter your password...',
      passportPl: 'e.g. A1234500 or JMH001',
      btnAdminSubmit: 'Access Admin Dashboard',
      btnJamaahSubmit: 'Open My Pilgrim Portal',
      methodEmail: 'Sign in with Email',
      methodPassport: 'Sign in with Passport / Booking ID',
      adminDemoBtn: 'Demo Admin: Abdullah (Al-Haramain)',
      jamaahDemo1Btn: 'Demo Pilgrim 1: Ahmad Subagja (Kloter A)',
      jamaahDemo2Btn: 'Demo Pilgrim 2: Siti Aminah (Kloter B)',
      noAccountText: 'Don\'t have an account?',
      registerAgency: 'Register New Travel Agency',
      registerJamaah: 'Register as New Pilgrim',
      toastEmpty: 'Please fill in all inputs!',
      toastSuccess: 'Welcome! Redirecting to your dashboard...',
      toastFailed: 'Authentication failed! Please verify your credentials.'
    }
  }[language];

  // Error notification states
  const [unregisteredQuery, setUnregisteredQuery] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Quick autofill demo logins
  const handleDemoAdmin = async () => {
    setIsLoading(true);
    setUnregisteredQuery(null);
    setLoginError(null);
    setEmail('abdullah@alharamain.id');
    setPassword('AlHaramain2026!');

    const res = await login('abdullah@alharamain.id', 'AlHaramain2026!');
    setIsLoading(false);
    if (res.success) {
      triggerToast(t.toastSuccess, 'success');
      navigate('/dashboard');
    } else {
      triggerToast(t.toastFailed, 'error');
    }
  };

  const handleDemoJamaah1 = async () => {
    setIsLoading(true);
    setUnregisteredQuery(null);
    setLoginError(null);
    setEmail('ahmad.subagja@gmail.com');
    setPassword('Jamaah2026!');

    const res = await login('ahmad.subagja@gmail.com', 'Jamaah2026!');
    setIsLoading(false);
    if (res.success) {
      triggerToast(t.toastSuccess, 'success');
      navigate('/user/dashboard');
    } else {
      triggerToast(t.toastFailed, 'error');
    }
  };

  const handleDemoJamaah2 = async () => {
    setIsLoading(true);
    setUnregisteredQuery(null);
    setLoginError(null);
    setEmail('siti.aminah@gmail.com');
    setPassword('Jamaah2026!');

    const res = await login('siti.aminah@gmail.com', 'Jamaah2026!');
    setIsLoading(false);
    if (res.success) {
      triggerToast(t.toastSuccess, 'success');
      navigate('/user/dashboard');
    } else {
      triggerToast(t.toastFailed, 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnregisteredQuery(null);
    setLoginError(null);

    if (portalMode === 'admin') {
      if (!email.trim() || !password.trim()) {
        triggerToast(t.toastEmpty, 'error');
        return;
      }
      setIsLoading(true);

      const res = await login(email.trim(), password);
      setIsLoading(false);
      if (res.success) {
        triggerToast(t.toastSuccess, 'success');
        navigate('/dashboard');
      } else if (res.reason === 'NOT_FOUND') {
        setUnregisteredQuery(email.trim());
        triggerToast(
          language === 'id' 
            ? `Akun (${email.trim()}) belum terdaftar! Silakan mendaftar terlebih dahulu.` 
            : `Account (${email.trim()}) is not registered! Please sign up first.`,
          'error'
        );
      } else if (res.reason === 'WRONG_PASSWORD') {
        setLoginError(language === 'id' ? 'Kata sandi yang Anda masukkan salah.' : 'Incorrect password.');
        triggerToast(language === 'id' ? 'Kata sandi salah!' : 'Incorrect password!', 'error');
      } else {
        setLoginError(res.message || t.toastFailed);
        triggerToast(t.toastFailed, 'error');
      }
    } else {
      // Jamaah login
      if (jamaahMethod === 'email') {
        if (!email.trim() || !password.trim()) {
          triggerToast(t.toastEmpty, 'error');
          return;
        }
        setIsLoading(true);

        const res = await login(email.trim(), password);
        setIsLoading(false);
        if (res.success) {
          triggerToast(t.toastSuccess, 'success');
          navigate('/user/dashboard');
        } else if (res.reason === 'NOT_FOUND') {
          setUnregisteredQuery(email.trim());
          triggerToast(
            language === 'id' 
              ? `Akun (${email.trim()}) belum terdaftar! Silakan mendaftar terlebih dahulu.` 
              : `Account (${email.trim()}) is not registered! Please sign up first.`,
            'error'
          );
        } else if (res.reason === 'WRONG_PASSWORD') {
          setLoginError(language === 'id' ? 'Kata sandi yang Anda masukkan salah.' : 'Incorrect password.');
          triggerToast(language === 'id' ? 'Kata sandi salah!' : 'Incorrect password!', 'error');
        } else {
          setLoginError(res.message || t.toastFailed);
          triggerToast(t.toastFailed, 'error');
        }
      } else {
        // Passport / Booking Code login
        if (!passportOrBooking.trim()) {
          triggerToast(t.toastEmpty, 'error');
          return;
        }
        setIsLoading(true);

        const res = await loginJamaahByPassport(passportOrBooking.trim(), password);
        setIsLoading(false);
        if (res.success) {
          triggerToast(t.toastSuccess, 'success');
          navigate('/user/dashboard');
        } else if (res.reason === 'NOT_FOUND') {
          setUnregisteredQuery(passportOrBooking.trim());
          triggerToast(
            language === 'id' 
              ? `Paspor / Kode Booking (${passportOrBooking.trim()}) belum terdaftar!` 
              : `Passport / Booking ID (${passportOrBooking.trim()}) is not registered!`,
            'error'
          );
        } else {
          const msg = res.message || (language === 'id' ? 'Nomor Paspor / Kode Booking tidak ditemukan!' : 'Passport Number or Booking ID not found!');
          setLoginError(msg);
          triggerToast(msg, 'error');
        }
      }
    }
  };

  return (
    <div className={`min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 overflow-hidden ${
      isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50 dark:opacity-80">
        <div className={`absolute top-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full blur-[120px] transition-colors duration-700 ${
          portalMode === 'admin' ? 'bg-emerald-500/15' : 'bg-amber-500/15'
        }`} />
        <div className={`absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full blur-[130px] transition-colors duration-700 ${
          portalMode === 'admin' ? 'bg-teal-500/15' : 'bg-emerald-500/15'
        }`} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      {/* Main Glassmorphic Container */}
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl relative z-10 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* Left column: Login Controls (7 cols on desktop) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          
          {/* Top Bar Navigation & Language */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span>{t.back}</span>
            </button>

            {/* Quick selectors: Language & Theme */}
            <div className="flex items-center space-x-3">
              <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setLanguage('id')}
                  className={`px-2.5 py-1 rounded text-[10px] font-black transition-all cursor-pointer ${
                    language === 'id' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  ID
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 rounded text-[10px] font-black transition-all cursor-pointer ${
                    language === 'en' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  EN
                </button>
              </div>

              <button
                type="button"
                onClick={toggleDarkMode}
                className="p-2 border rounded-lg bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-all cursor-pointer"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? '🌞' : '🌙'}
              </button>
            </div>
          </div>

          {/* DUAL PORTAL SWITCHER TABS */}
          <div className="mb-6">
            <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 gap-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => setPortalMode('admin')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  portalMode === 'admin'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-[1.01]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>🏢</span>
                <span>{t.adminPortalTab}</span>
              </button>

              <button
                type="button"
                onClick={() => setPortalMode('jamaah')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  portalMode === 'jamaah'
                    ? 'bg-gradient-to-r from-amber-600 to-emerald-600 text-white shadow-md shadow-amber-600/25 scale-[1.01]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>🕋</span>
                <span>{t.jamaahPortalTab}</span>
              </button>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-1 mb-5 text-left">
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                portalMode === 'admin' 
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              }`}>
                {portalMode === 'admin' ? 'Travel Agent Management OS' : 'Pilgrim & Family Gateway'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              {portalMode === 'admin' ? t.adminTitle : t.jamaahTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {portalMode === 'admin' ? t.adminSub : t.jamaahSub}
            </p>
          </div>

          {/* Jamaah Sub-Method Selector (Email vs Passport) */}
          {portalMode === 'jamaah' && (
            <div className="flex items-center space-x-2 mb-4">
              <button
                type="button"
                onClick={() => setJamaahMethod('email')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  jamaahMethod === 'email'
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                ✉️ {t.methodEmail}
              </button>
              <button
                type="button"
                onClick={() => setJamaahMethod('passport')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  jamaahMethod === 'passport'
                    ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                🛂 {t.methodPassport}
              </button>
            </div>
          )}

          {/* Unregistered Account Warning Banner */}
          {unregisteredQuery && (
            <div className="mb-4 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-left space-y-2.5 animate-fade-in shadow-xs">
              <div className="flex items-start space-x-2.5">
                <span className="text-xl leading-none">⚠️</span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                    {language === 'id' ? 'Akun Belum Terdaftar' : 'Account Not Registered'}
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {language === 'id'
                      ? `Email/Paspor "${unregisteredQuery}" tidak ditemukan dalam sistem TravelOps.`
                      : `The email/passport "${unregisteredQuery}" was not found in TravelOps.`}
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                  {language === 'id' ? 'Ingin mendaftar akun baru?' : 'Want to create a new account?'}
                </span>
                <button
                  type="button"
                  onClick={() => navigate(portalMode === 'admin' ? '/register?type=agency' : '/register?type=jamaah')}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] uppercase px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer flex items-center space-x-1"
                >
                  <span>{portalMode === 'admin' ? '➕ Daftar Agensi Baru' : '➕ Daftar Jemaah Baru'}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* General Login Error Banner */}
          {loginError && !unregisteredQuery && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-left flex items-center space-x-2.5 text-xs text-rose-600 dark:text-rose-400 font-bold animate-fade-in">
              <span className="text-base">❌</span>
              <span>{loginError}</span>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
            {portalMode === 'admin' || (portalMode === 'jamaah' && jamaahMethod === 'email') ? (
              <>
                {/* Email input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t.emailLabel}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.emailPl}
                      className="w-full text-xs px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-xs"
                      disabled={isLoading}
                    />
                    <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-400">
                      ✉
                    </span>
                  </div>
                </div>

                {/* Password input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t.passLabel}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.passPl}
                      className="w-full text-xs pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-xs"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      {showPassword ? '🫣' : '👁️'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Passport / Booking Code Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t.passportLabel}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={passportOrBooking}
                      onChange={(e) => setPassportOrBooking(e.target.value)}
                      placeholder={t.passportPl}
                      className="w-full text-xs uppercase px-4 py-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800 dark:text-white transition-all font-mono font-bold tracking-wider"
                      disabled={isLoading}
                    />
                    <span className="absolute inset-y-0 right-3.5 flex items-center text-amber-500">
                      🛂
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Masukkan Nomor Paspor RI Anda (misal: <strong className="text-emerald-600 dark:text-emerald-400">A1234500</strong>) atau Kode Booking (<strong className="text-emerald-600 dark:text-emerald-400">JMH001</strong>)
                  </p>
                </div>

                {/* Optional PIN / Password */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Kata Sandi Akun (Opsional)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kosongkan jika belum membuat PIN khusus..."
                    className="w-full text-xs px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-xs"
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-heavy text-xs uppercase tracking-widest py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 font-extrabold cursor-pointer mt-2 ${
                portalMode === 'admin'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 hover:scale-[1.01]'
                  : 'bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-700 hover:to-emerald-700 shadow-amber-600/20 hover:scale-[1.01]'
              }`}
            >
              {isLoading ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{portalMode === 'admin' ? t.btnAdminSubmit : t.btnJamaahSubmit}</span>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Seeds */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 text-left">
              🚀 1-Click Demo Credentials:
            </p>

            {portalMode === 'admin' ? (
              <button
                type="button"
                onClick={handleDemoAdmin}
                className="w-full bg-slate-100 hover:bg-emerald-50 dark:bg-slate-950 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/50 text-emerald-700 dark:text-emerald-400 font-extrabold text-[11px] py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-between"
              >
                <span>🧪 {t.adminDemoBtn}</span>
                <span className="text-[9px] bg-emerald-600/15 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">Auto-Login</span>
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleDemoJamaah1}
                  className="w-full bg-slate-100 hover:bg-amber-50 dark:bg-slate-950 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-800/80 hover:border-amber-500/50 text-amber-700 dark:text-amber-400 font-extrabold text-[11px] py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-between"
                >
                  <span>🕋 {t.jamaahDemo1Btn}</span>
                  <span className="text-[9px] bg-amber-600/15 text-amber-600 dark:text-amber-300 px-2 py-0.5 rounded font-mono font-bold">Paspor A1234500</span>
                </button>
                <button
                  type="button"
                  onClick={handleDemoJamaah2}
                  className="w-full bg-slate-100 hover:bg-teal-50 dark:bg-slate-950 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-800/80 hover:border-teal-500/50 text-teal-700 dark:text-teal-400 font-extrabold text-[11px] py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-between"
                >
                  <span>🕋 {t.jamaahDemo2Btn}</span>
                  <span className="text-[9px] bg-teal-600/15 text-teal-600 dark:text-teal-300 px-2 py-0.5 rounded font-mono font-bold">Paspor A1234501</span>
                </button>
              </div>
            )}
          </div>

          {/* Registration Redirect Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 text-center text-xs">
            <span className="text-slate-400 mr-1.5">{t.noAccountText}</span>
            <button
              type="button"
              onClick={() => navigate(portalMode === 'admin' ? '/register?type=agency' : '/register?type=jamaah')}
              className="text-emerald-600 dark:text-emerald-400 font-extrabold hover:underline cursor-pointer"
            >
              {portalMode === 'admin' ? t.registerAgency : t.registerJamaah}
            </button>
          </div>
        </div>

        {/* Right column: Dynamic Showcase (5 cols on desktop) */}
        <div className={`hidden lg:flex lg:col-span-5 p-8 text-left flex-col justify-between relative overflow-hidden border-l transition-all duration-500 ${
          portalMode === 'admin'
            ? 'bg-gradient-to-tr from-emerald-950 via-slate-950 to-slate-950 border-emerald-800/30'
            : 'bg-gradient-to-tr from-amber-950 via-slate-950 to-emerald-950 border-amber-800/30'
        }`}>
          
          {/* Subtle Ambient Shapes */}
          <div className="absolute inset-0 pointer-events-none opacity-25">
            <div className="absolute top-[20%] right-[10%] w-[180px] h-[180px] bg-white rounded-full blur-[90px]" />
            <div className="absolute inset-0 bg-[radial-gradient(#10b98125_1px,transparent_1px)] [background-size:14px_14px]" />
          </div>

          {/* Top Header info */}
          <div className="relative z-10 flex justify-between items-center border-b border-white/10 pb-3">
            <span className={`text-[10px] font-black uppercase tracking-widest ${
              portalMode === 'admin' ? 'text-emerald-300' : 'text-amber-300'
            }`}>
              {portalMode === 'admin' ? '⚡ TravelOps Enterprise OS' : '🕋 Digital Pilgrim Companion'}
            </span>
            <span className="text-[8px] bg-white/10 text-white border border-white/20 px-2 py-0.5 rounded uppercase font-black">
              v2.8 Live
            </span>
          </div>

          {/* Dynamic Interactive Cards Content */}
          <div className="my-auto space-y-5 relative z-10">
            {portalMode === 'admin' ? (
              /* ADMIN SHOWCASE */
              <>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider leading-tight">
                    Pusat Komando Operasional
                  </h3>
                  <p className="text-xs text-emerald-200/80 mt-1.5 leading-relaxed">
                    Pantau manifes jemaah, perizinan visa Muqeem, alokasi hotel, dan pembagian kursi bus secara real-time.
                  </p>
                </div>

                {/* Flight Status card */}
                <div className="bg-slate-950/80 border border-emerald-500/20 rounded-2xl p-4 space-y-2.5 shadow-xl">
                  <div className="flex justify-between text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                    <span>Flight SV-821 • Kloter A</span>
                    <span className="text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded">ON SCHEDULE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-black text-white">CGK</p>
                      <p className="text-[9px] text-slate-400">Jakarta (T3)</p>
                    </div>
                    <div className="flex-1 px-4 text-center">
                      <div className="text-[9px] font-mono text-emerald-300 font-bold mb-0.5">Saudia Airlines</div>
                      <div className="w-full relative h-[2px] bg-emerald-500/30">
                        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs">✈</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-white">JED</p>
                      <p className="text-[9px] text-slate-400">Jeddah</p>
                    </div>
                  </div>
                </div>

                {/* Muqeem & Manifest clearance mini list */}
                <div className="bg-slate-950/80 border border-emerald-500/20 rounded-2xl p-4 space-y-2 text-xs">
                  <p className="text-[9px] font-black uppercase tracking-wider text-emerald-300">Clearing Status Kloter</p>
                  <div className="space-y-1.5 text-slate-200">
                    <div className="flex justify-between items-center text-[11px]">
                      <span>✓ Paspor Asli & Visa Terbit</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-black">100% Selesai</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span>✓ Rooming List Hotel Anjum</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-black">45/45 Pax</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span>✓ Alokasi Bus Pariwisata</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-black">Bus 01 & 02</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* JAMAAH SHOWCASE */
              <>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider leading-tight">
                    Kartu Digital Jemaah
                  </h3>
                  <p className="text-xs text-amber-200/80 mt-1.5 leading-relaxed">
                    Akses jadwal keberangkatan, E-Visa resmi, nomor kamar Makkah-Madinah, dan panduan doa langsung dari genggaman.
                  </p>
                </div>

                {/* Pilgrim E-Badge Card */}
                <div className="bg-gradient-to-br from-slate-900/90 to-emerald-950/90 border border-amber-500/30 rounded-2xl p-4 space-y-3 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
                    <div className="flex items-center space-x-2.5">
                      <div className="h-10 w-10 rounded-full bg-emerald-600/30 border border-amber-400/40 overflow-hidden flex items-center justify-center font-bold text-amber-300">
                        🕋
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">Ahmad Subagja</p>
                        <p className="text-[9px] text-amber-300 font-mono">Paspor: A1234500 • Kloter A</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-black px-2 py-0.5 rounded border border-emerald-500/30">
                      VISA APPROVED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-slate-950/60 p-2 rounded-lg border border-white/5">
                      <p className="text-slate-400 text-[8px] uppercase">Hotel Makkah</p>
                      <p className="font-bold text-white">Anjum Hotel (5★)</p>
                      <p className="text-amber-300 text-[9px]">Kamar 101 (Quad)</p>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-lg border border-white/5">
                      <p className="text-slate-400 text-[8px] uppercase">Bus Pariwisata</p>
                      <p className="font-bold text-white">Bus VIP 01</p>
                      <p className="text-emerald-300 text-[9px]">Kursi Nomor #1</p>
                    </div>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2 flex items-center justify-between text-[10px]">
                    <span className="text-amber-200">🗓️ Sisa 6 Hari Menuju Keberangkatan</span>
                    <span className="font-black text-white">15 Mar 2026</span>
                  </div>
                </div>

                {/* Emergency & Mutawwif hotline */}
                <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-400 text-sm">💬</span>
                    <div>
                      <p className="text-[10px] font-bold text-white">Hotline Mutawwif Saudi</p>
                      <p className="text-[8px] text-slate-400">Ustadz Syakir (+966 50-123-4567)</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded font-bold">24 Jam</span>
                </div>
              </>
            )}
          </div>

          {/* Bottom Security Badge */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3 text-[9px] text-slate-400 font-mono font-bold">
            <span>TLS v1.3 SECURE ENCRYPTION</span>
            <span>KEMENAG & MUQEEM SYNC</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
