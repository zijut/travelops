import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';

const Register: React.FC = () => {
  const { isDarkMode, toggleDarkMode, language, setLanguage, registerUser, users, triggerToast } = useApp();
  const navigate = useNavigate();

  // Input states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password hide/show toggle
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const t = {
    id: {
      back: 'Kembali ke Beranda',
      title: 'Registrasi Agensi Baru',
      subtitle: 'Daftarkan travel Anda untuk akses sistem terpadu',
      nameLabel: 'Nama Lengkap Administrator',
      phoneLabel: 'Nomor Telepon Agensi',
      emailLabel: 'Alamat Email Agensi',
      passLabel: 'Kata Sandi',
      confirmPassLabel: 'Konfirmasi Kata Sandi',
      
      namePl: 'Masukkan nama lengkap...',
      phonePl: 'Contoh: +62 812-3456-7890...',
      emailPl: 'Contoh: info@agensitravel.com...',
      passPl: 'Buat kata sandi baru...',
      confirmPassPl: 'Ulangi kata sandi baru...',
      
      btnSubmit: 'Registrasi Agensi Sekarang',
      loginText: 'Sudah terdaftar sebagai partner?',
      loginLink: 'Masuk Portal Partner',
      
      toastEmpty: 'Mohon isi semua kolom input secara lengkap!',
      toastMismatch: 'Konfirmasi kata sandi tidak cocok!',
      toastExists: 'Alamat email ini sudah terdaftar! Sila masuk.',
      toastSuccess: 'Registrasi berhasil! Sila login dengan akun baru Anda.',
      visualHeader: 'Langkah Awal Agensi Baru',
      visualSub: 'Setelah registrasi, Anda akan mendapatkan database bersih terisolasi secara aman.'
    },
    en: {
      back: 'Back to Landing Page',
      title: 'Partner Registration',
      subtitle: 'Register your agency to deploy your isolated travel OS database',
      nameLabel: 'Administrator Full Name',
      phoneLabel: 'Agency Phone Number',
      emailLabel: 'Agency Email Address',
      passLabel: 'Password',
      confirmPassLabel: 'Confirm Password',
      
      namePl: 'Enter your full name...',
      phonePl: 'Example: +62 812-3456-7890...',
      emailPl: 'Example: info@youragency.com...',
      passPl: 'Create secure password...',
      confirmPassPl: 'Retype secure password...',
      
      btnSubmit: 'Register Agency Now',
      loginText: 'Already registered as a partner?',
      loginLink: 'Portal Partner Access',
      
      toastEmpty: 'Please fill in all input fields!',
      toastMismatch: 'Passwords do not match!',
      toastExists: 'This email is already registered! Please log in.',
      toastSuccess: 'Registration successful! You may now sign in.',
      visualHeader: 'Agency Onboarding Milestones',
      visualSub: 'After signup, you receive a clean, isolated database workspace.'
    }
  }[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Validation
    if (!name.trim() || !phone.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      triggerToast(t.toastEmpty, 'error');
      return;
    }

    if (password !== confirmPassword) {
      triggerToast(t.toastMismatch, 'error');
      return;
    }

    // Check duplicate
    const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      triggerToast(t.toastExists, 'error');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Create new clean profile
      const newProfile = {
        name,
        email,
        phone,
        password,
        photo: 'https://picsum.photos/seed/agency/40/40',
        agency: name + ' Group Travel',
        role: 'Travel Director',
        region: 'Indonesia & Saudi Arabia',
        address: 'Kantor Utama ' + name
      };

      registerUser(newProfile);
      triggerToast(t.toastSuccess, 'success');
      setIsLoading(false);
      navigate('/login');
    }, 900);
  };

  return (
    <div className={`min-h-screen w-full relative flex items-center justify-center p-4 overflow-hidden ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Background patterns */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-55 dark:opacity-85">
        <div className="absolute top-[-10%] left-[-10%] w-[380px] h-[380px] bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[110px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:16px_16px]" />
      </div>

      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl relative z-10 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[620px]">
        
        {/* Left column: SignUp Form (7 cols) */}
        <div className="md:col-span-7 p-4 sm:p-10 flex flex-col justify-between">
          
          {/* Header Controls: Back button, Language, and Theme switches */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span>{t.back}</span>
            </button>

            {/* Language & Theme Selectors */}
            <div className="flex items-center space-x-3">
              <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border dark:border-slate-800">
                <button
                  onClick={() => setLanguage('id')}
                  className={`px-2 py-0.5 rounded text-[10px] font-black transition-all cursor-pointer ${language === 'id' ? 'bg-emerald-600 text-white' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  ID
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-0.5 rounded text-[10px] font-black transition-all cursor-pointer ${language === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  EN
                </button>
              </div>

              <button
                onClick={toggleDarkMode}
                className="p-1.5 border rounded-lg bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-all cursor-pointer"
              >
                {isDarkMode ? '🌞' : '🌙'}
              </button>
            </div>
          </div>

          {/* Form Content layout */}
          <div className="my-auto space-y-4 text-left">
            <div>
              <div className="h-8 w-8 rounded-lg bg-emerald-650 flex items-center justify-center text-white text-sm font-bold shadow shadow-emerald-500/25 mb-3">
                🌐
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                {t.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                {t.subtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Full Name field */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  {t.nameLabel}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePl}
                  className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-xs"
                  disabled={isLoading}
                />
              </div>

              {/* Phone field */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  {t.phoneLabel}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.phonePl}
                  className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-xs"
                  disabled={isLoading}
                />
              </div>

              {/* Email Address field */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPl}
                  className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-xs"
                  disabled={isLoading}
                />
              </div>

              {/* Grid block for Password & Confirm Password side-by-side on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Password field */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {t.passLabel}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.passPl}
                      className="w-full text-xs pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-xs"
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

                {/* Confirm Password field */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {t.confirmPassLabel}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t.confirmPassPl}
                      className="w-full text-xs pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-xs"
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
              </div>

              {/* Submit signup Button */}
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
          </div>

          {/* Login switch info footer */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 text-center text-xs">
            <span className="text-slate-400 mr-1">{t.loginText}</span>
            <button
              onClick={() => navigate('/login')}
              className="text-emerald-650 dark:text-emerald-400 font-extrabold hover:underline cursor-pointer"
            >
              {t.loginLink}
            </button>
          </div>
        </div>

        {/* Right column: Starters Visual Map (5 cols) - "Lebih ramai" requirement */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-tr from-emerald-950 to-slate-950 p-8 text-left flex-col justify-between relative overflow-hidden border-l border-emerald-800/30">
          
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute bottom-[20%] right-[10%] w-[180px] h-[180px] bg-white rounded-full blur-[80px]" />
            <div className="absolute inset-0 bg-[radial-gradient(#10b9811c_1px,transparent_1px)] [background-size:12px_12px]" />
          </div>

          <div className="relative z-10 flex justify-between items-center border-b border-emerald-800/30 pb-3">
            <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">
              TravelOps Starter Roadmap
            </span>
            <span className="text-[8px] bg-emerald-500/20 text-emerald-350 border border-emerald-500/30 px-2 py-0.5 rounded uppercase font-black text-white">
              Provisioning
            </span>
          </div>

          {/* Onboarding milestones */}
          <div className="my-auto space-y-6 relative z-10">
            <div>
              <p className="text-lg font-bold text-white uppercase tracking-wider leading-tight">
                {t.visualHeader}
              </p>
              <p className="text-[11px] text-emerald-250 mt-1.5 leading-relaxed text-white">
                {t.visualSub}
              </p>
            </div>

            {/* Starters Milestones timeline cards */}
            <div className="space-y-3.5">
              
              {/* Step 1 */}
              <div className="flex items-start space-x-3 bg-slate-950/40 p-2.5 rounded-xl border border-emerald-500/10">
                <div className="h-6 w-6 rounded bg-emerald-550/20 border border-emerald-500/30 text-emerald-350 font-black flex items-center justify-center text-[10px] shrink-0 text-white">
                  01
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white">Verification & Setup</p>
                  <p className="text-[9px] text-slate-400 mt-0.5 text-white">Membentuk workspace agensi dan database yang terisolasi secara independen.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start space-x-3 bg-slate-950/40 p-2.5 rounded-xl border border-dashed border-emerald-500/10 opacity-75">
                <div className="h-6 w-6 rounded bg-slate-900 border border-slate-800 text-slate-400 font-black flex items-center justify-center text-[10px] shrink-0 text-white">
                  02
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-350 text-white">Import Pilgrim Manifests</p>
                  <p className="text-[9px] text-slate-500 mt-0.5 text-white">Sila unggah dokumen, paspor, nomor HP jamaah secara digital tanpa limit.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start space-x-3 bg-slate-950/40 p-2.5 rounded-xl border border-dashed border-emerald-500/10 opacity-75">
                <div className="h-6 w-6 rounded bg-slate-900 border border-slate-800 text-slate-400 font-black flex items-center justify-center text-[10px] shrink-0 text-white">
                  03
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-350 text-white">Setup Bus Seat Simulators</p>
                  <p className="text-[9px] text-slate-500 mt-0.5 text-white">Konfigurasikan tempat duduk bus pariwisata umroh Makkah secepat kilat.</p>
                </div>
              </div>

            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-emerald-800/30 pt-3 text-[9px] text-emerald-450 font-mono font-bold">
            <span>DEDICATED DB PARTITION</span>
            <span>TLS ENCRYPTION</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
