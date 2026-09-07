import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';

const Login: React.FC = () => {
  const { isDarkMode, toggleDarkMode, language, setLanguage, login, triggerToast } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const t = {
    id: {
      back: 'Kembali ke Beranda',
      title: 'Portal Partner',
      subtitle: 'Masuk ke sistem operasional terpadu Anda',
      emailLabel: 'Alamat Email',
      passLabel: 'Kata Sandi',
      emailPl: 'Masukkan alamat email terdaftar...',
      passPl: 'Masukkan kata sandi...',
      btnSubmit: 'Masuk Dashboard',
      btnDemo: 'Gunakan Akun Demo (Auto Seed)',
      registerText: 'Belum memiliki akun?',
      registerLink: 'Registrasi Agensi Baru',
      toastEmpty: 'Mohon isi semua kolom input!',
      toastNotFound: 'Alamat email ini belum terdaftar di sistem kami!',
      toastWrong: 'Kata sandi tidak tepat! Hubungi admin jika lupa.',
      toastSuccess: 'Selamat Datang Kembali! Memuat data Anda...',
      cardTitle: 'Peralihan Status Digitalisasi',
      cardSub: 'Sistem TravelOps memantau 18,480+ pax jamaah aktif musim ini secara aman.'
    },
    en: {
      back: 'Back to Landing Page',
      title: 'Partner Portal Login',
      subtitle: 'Sign in to access your unified operations dashboard',
      emailLabel: 'Email Address',
      passLabel: 'Password',
      emailPl: 'Enter registered email...',
      passPl: 'Enter password...',
      btnSubmit: 'Access Dashboard',
      btnDemo: 'Use Demo Credentials (Auto Seed)',
      registerText: 'Don\'t have an account?',
      registerLink: 'Register New Agency',
      toastEmpty: 'Please fill in all inputs!',
      toastNotFound: 'This email is not registered in our database!',
      toastWrong: 'Incorrect password! Please try again.',
      toastSuccess: 'Welcome back! Synced user session successfully.',
      cardTitle: 'Operations Digitalization Room',
      cardSub: 'TravelOps actively secure 18,480+ live pilgrims across flight and transit.'
    }
  }[language];

  // Autofill Demo account and log in immediately
  const handleAutofillDemo = () => {
    const demoEmail = 'abdullah@alharamain.id';
    const demoPassword = 'AlHaramain2026!';
    
    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsLoading(true);
    
    triggerToast(
      language === 'id' 
        ? 'Selamat Datang Kembali! Memuat data Anda...' 
        : 'Welcome back! Synced user session successfully.',
      'success'
    );

    setTimeout(() => {
      const success = login(demoEmail, demoPassword);
      if (success) {
        setIsLoading(false);
        navigate('/dashboard');
      } else {
        setIsLoading(false);
        triggerToast(
          language === 'id'
            ? 'Gagal masuk dengan akun demo.'
            : 'Failed to login with demo credentials.',
          'error'
        );
      }
    }, 850);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanEmail = email.trim();
    if (!cleanEmail || !password.trim()) {
      triggerToast(t.toastEmpty, 'error');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Execute multi-user login check
      const success = login(cleanEmail, password);
      
      if (!success) {
        setIsLoading(false);
        let userList: any[] = [];
        try {
          const raw = localStorage.getItem('travelops_users');
          if (raw) userList = JSON.parse(raw);
        } catch (e) {}

        const hasEmail = userList.some((u: any) => u.email?.toLowerCase() === cleanEmail.toLowerCase())
          || (cleanEmail.toLowerCase() === 'abdullah@alharamain.id');
        
        if (!hasEmail) {
          triggerToast(t.toastNotFound, 'error');
        } else {
          triggerToast(t.toastWrong, 'error');
        }
        return;
      }

      triggerToast(t.toastSuccess, 'success');
      setIsLoading(false);
      navigate('/dashboard');
    }, 500);
  };

  return (
    <div className={`min-h-screen w-full relative flex items-center justify-center p-4 overflow-hidden ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Decorative rich pattern objects consistent with Landing */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-55 dark:opacity-85">
        <div className="absolute top-[-10%] right-[-10%] w-[380px] h-[380px] bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[110px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:16px_16px]" />
      </div>

      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl relative z-10 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
        
        {/* Left pane: Login Form (7 cols on large screens) */}
        <div className="md:col-span-7 p-4 sm:p-10 flex flex-col justify-between">
          
          {/* Header Action Row: Back to Home, Language, and Theme toggles */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span>{t.back}</span>
            </button>

            {/* Quick selectors */}
            <div className="flex items-center space-x-3">
              {/* Language toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border dark:border-slate-800">
                <button
                  onClick={() => setLanguage('id')}
                  className={`px-2 py-0.5 rounded text-[10px] font-black transition-all cursor-pointer ${language === 'id' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  ID
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-0.5 rounded text-[10px] font-black transition-all cursor-pointer ${language === 'en' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  EN
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-1.5 border rounded-lg bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-all cursor-pointer"
              >
                {isDarkMode ? '🌞' : '🌙'}
              </button>
            </div>
          </div>

          {/* Form Content body */}
          <div className="my-auto space-y-6 text-left">
            <div>
              <div className="h-8 w-8 rounded-lg bg-emerald-600 mb-4 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-emerald-500/20">
                🕋
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                {t.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t.subtitle}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
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

              {/* Password Input with show/hide eye switch */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {t.passLabel}
                  </label>
                </div>
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
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-heavy text-xs uppercase tracking-widest py-3 px-4 rounded-xl shadow-md shadow-emerald-500/15 transition-all flex items-center justify-center space-x-2 font-extrabold cursor-pointer mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>{t.btnSubmit}</span>
                )}
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-4 text-[9px] font-sans font-black uppercase text-slate-400 tracking-wider">ATAU</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            {/* Quick Demo Credentials autofill helper */}
            <button
              onClick={handleAutofillDemo}
              className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-emerald-650 dark:text-emerald-400 font-extrabold text-[10px] uppercase tracking-widest py-3 px-4 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              🧪 {t.btnDemo}
            </button>
          </div>

          {/* Registration Redirect info footer */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 text-center text-xs">
            <span className="text-slate-400 mr-1">{t.registerText}</span>
            <button
              onClick={() => navigate('/register')}
              className="text-emerald-650 dark:text-emerald-400 font-extrabold hover:underline cursor-pointer"
            >
              {t.registerLink}
            </button>
          </div>
        </div>

        {/* Right pane: Operational Achievements Showcase (5 cols on large screens) */}
        {/* Dynamic graphics, live airport status trackers, etc. Fits "lebih ramai jangan clean" perfectly */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-tr from-emerald-950 to-slate-950 p-8 text-left flex-col justify-between relative overflow-hidden border-l border-emerald-800/30">
          
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-[30%] left-[10%] w-[150px] h-[150px] bg-white rounded-full blur-[80px]" />
            <div className="absolute inset-0 bg-[radial-gradient(#10b9811c_1px,transparent_1px)] [background-size:12px_12px]" />
          </div>

          {/* Top visual brand bar */}
          <div className="relative z-10 flex justify-between items-center border-b border-emerald-800/30 pb-3">
            <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">
              Live OS Monitor
            </span>
            <span className="text-[8px] bg-emerald-500/20 text-emerald-350 border border-emerald-500/30 px-2 py-0.5 rounded uppercase font-black text-white">
              Online
            </span>
          </div>

          {/* Simulated airport Flight status panel */}
          <div className="my-auto space-y-6 relative z-10">
            <div>
              <p className="text-xl font-bold text-white uppercase tracking-wider leading-tight">
                {t.cardTitle}
              </p>
              <p className="text-[11px] text-emerald-200 mt-2">
                {t.cardSub}
              </p>
            </div>

            {/* Flight 1 Display */}
            <div className="bg-slate-950/70 border border-emerald-700/20 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between text-[8px] font-bold text-emerald-400 tracking-wider">
                <span>AKTIVITAS PENERBANGAN</span>
                <span className="text-amber-400">DELAY 0 MINS</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-black text-white leading-none">CGK</p>
                  <p className="text-[8px] text-slate-400">Jakarta</p>
                </div>
                <div className="flex-1 flex flex-col items-center px-4">
                  <div className="text-[9px] font-mono text-emerald-400 font-bold mb-0.5">SV-821</div>
                  <div className="w-full relative h-[1px] bg-emerald-600/30">
                    <span className="absolute top-1/2 left-1/3 transform -translate-y-1/2 text-xs">✈</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-white leading-none">JED</p>
                  <p className="text-[8px] text-slate-400">Jeddah</p>
                </div>
              </div>
            </div>

            {/* Simulated mini Manifest checkpoint checklist list */}
            <div className="bg-slate-950/70 border border-emerald-700/20 rounded-xl p-3.5 space-y-2 text-xs">
              <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">Verifikasi Kelompok Jamaah</span>
              <div className="space-y-1.5 font-sans">
                <div className="flex justify-between items-center text-slate-350 text-white">
                  <span>✓ 1,280 Jamaah Paspor Asli Terkumpul</span>
                  <span className="text-[8px] bg-emerald-500/20 text-emerald-300 font-black px-1.5 py-0.2 rounded">100%</span>
                </div>
                <div className="flex justify-between items-center text-slate-350 text-white">
                  <span>✓ Upload Manifest ke Portal Muqeem</span>
                  <span className="text-[8px] bg-emerald-500/20 text-emerald-300 font-black px-1.5 py-0.2 rounded">100%</span>
                </div>
                <div className="flex justify-between items-center text-slate-350 text-white">
                  <span>✓ Penerbitan Visa Umroh KBSA</span>
                  <span className="text-[8px] bg-amber-500/20 text-amber-300 font-black px-1.5 py-0.2 rounded">Waiting</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer of the right sidebar showcase */}
          <div className="relative z-10 flex items-center justify-between border-t border-emerald-800/30 pt-3 text-[9px] text-emerald-450 font-mono font-bold">
            <span>SECURE SYSTEM TLS v1.3</span>
            <span>OS ver 2.6.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
