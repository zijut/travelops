import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../AppContext';

type RegisterType = 'agency' | 'jamaah';

const Register: React.FC = () => {
  const { isDarkMode, toggleDarkMode, language, setLanguage, registerUser, users, triggerToast } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [registerType, setRegisterType] = useState<RegisterType>(
    searchParams.get('type') === 'jamaah' ? 'jamaah' : 'agency'
  );

  // Input states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password hide/show toggle
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const t = {
    id: {
      back: 'Kembali ke Beranda',
      tabAgency: 'Agensi Travel (Admin)',
      tabJamaah: 'Jemaah Haji/Umrah (User)',
      agencyTitle: 'Registrasi Agensi Baru',
      agencySub: 'Daftarkan travel Anda untuk akses sistem operasi haji & umrah terpadu',
      jamaahTitle: 'Pendaftaran Akun Jemaah',
      jamaahSub: 'Buat akun jemaah mandiri untuk memantau visa, hotel, dan jadwal manasik',
      nameLabel: 'Nama Lengkap',
      phoneLabel: 'Nomor WhatsApp Aktif',
      emailLabel: 'Alamat Email',
      passportLabel: 'Nomor Paspor RI (Opsional)',
      agencyNameLabel: 'Nama Agensi Travel',
      cityLabel: 'Kota / Domisili',
      passLabel: 'Kata Sandi Baru',
      confirmPassLabel: 'Konfirmasi Kata Sandi',
      
      namePl: 'Masukkan nama lengkap sesuai KTP/Paspor...',
      phonePl: 'Contoh: +62 812-3456-7890...',
      emailPl: 'Contoh: nama@domain.com...',
      passportPl: 'Contoh: A1234567...',
      agencyNamePl: 'Contoh: Al-Haramain Tour & Travel...',
      cityPl: 'Contoh: Jakarta Selatan, Surabaya, Bandung...',
      passPl: 'Buat kata sandi minimal 6 karakter...',
      confirmPassPl: 'Ulangi kata sandi...',
      
      btnAgencySubmit: 'Daftarkan Agensi & Buka Workspace',
      btnJamaahSubmit: 'Daftar Akun Jemaah Sekarang',
      loginText: 'Sudah memiliki akun terdaftar?',
      loginLink: 'Masuk ke Portal Login',
      
      toastEmpty: 'Mohon lengkapi semua kolom input wajib!',
      toastMismatch: 'Konfirmasi kata sandi tidak cocok!',
      toastExists: 'Alamat email ini sudah terdaftar! Silakan login.',
      toastSuccess: 'Registrasi berhasil! Silakan masuk dengan akun baru Anda.',
      visualHeader: 'Ekosistem Digital Haji & Umroh',
      visualSub: 'Platform terintegrasi untuk ribuan agen travel dan jemaah di seluruh Indonesia.'
    },
    en: {
      back: 'Back to Home',
      tabAgency: 'Travel Agency (Admin)',
      tabJamaah: 'Pilgrim Account (User)',
      agencyTitle: 'Agency Registration',
      agencySub: 'Register your travel agency to deploy your dedicated operations system',
      jamaahTitle: 'Pilgrim Registration',
      jamaahSub: 'Create your pilgrim account to track your visa, hotel, and live itinerary',
      nameLabel: 'Full Name',
      phoneLabel: 'WhatsApp / Phone Number',
      emailLabel: 'Email Address',
      passportLabel: 'Passport Number (Optional)',
      agencyNameLabel: 'Travel Agency Name',
      cityLabel: 'City / Domicile',
      passLabel: 'New Password',
      confirmPassLabel: 'Confirm Password',
      
      namePl: 'Enter your full legal name...',
      phonePl: 'e.g. +62 812-3456-7890...',
      emailPl: 'e.g. name@domain.com...',
      passportPl: 'e.g. A1234567...',
      agencyNamePl: 'e.g. Al-Haramain Tour & Travel...',
      cityPl: 'e.g. Jakarta, Surabaya, Bandung...',
      passPl: 'Create password (min. 6 characters)...',
      confirmPassPl: 'Retype password...',
      
      btnAgencySubmit: 'Register Agency & Deploy Workspace',
      btnJamaahSubmit: 'Create Pilgrim Account',
      loginText: 'Already registered?',
      loginLink: 'Sign in to Portal',
      
      toastEmpty: 'Please fill in all required fields!',
      toastMismatch: 'Passwords do not match!',
      toastExists: 'This email is already registered! Please sign in.',
      toastSuccess: 'Registration successful! Please sign in with your new account.',
      visualHeader: 'Unified Digital Hajj & Umrah',
      visualSub: 'Connected platform for agencies and pilgrims across flight and transit.'
    }
  }[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Validation
    if (!name.trim() || !phone.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      triggerToast(t.toastEmpty, 'error');
      return;
    }

    if (registerType === 'agency' && !agencyName.trim()) {
      triggerToast(t.toastEmpty, 'error');
      return;
    }

    if (password !== confirmPassword) {
      triggerToast(t.toastMismatch, 'error');
      return;
    }

    if (password.length < 6) {
      triggerToast(language === 'id' ? 'Kata sandi minimal 6 karakter!' : 'Password must be at least 6 characters!', 'error');
      return;
    }

    // Check duplicate email
    const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      triggerToast(t.toastExists, 'error');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (registerType === 'agency') {
        const newProfile = {
          name,
          email,
          phone,
          password,
          photo: 'https://picsum.photos/seed/' + encodeURIComponent(name) + '/100/100',
          agency: agencyName || `${name} Group Travel`,
          role: 'Travel Admin',
          region: city || 'Indonesia & Saudi Arabia',
          address: 'Kantor Pusat ' + (agencyName || name)
        };
        registerUser(newProfile);
      } else {
        const newJamaahProfile = {
          name,
          email,
          phone,
          password,
          photo: 'https://picsum.photos/seed/' + encodeURIComponent(name) + '/100/100',
          agency: 'Al-Haramain Travel',
          role: 'Jamaah',
          region: city || 'Indonesia',
          address: 'Alamat Jemaah ' + name,
          passportNumber: passportNumber.trim().toUpperCase() || undefined,
          jamaahId: 'JMH' + Math.floor(100 + Math.random() * 900)
        };
        registerUser(newJamaahProfile);
      }

      triggerToast(t.toastSuccess, 'success');
      setIsLoading(false);
      navigate(registerType === 'agency' ? '/login?portal=admin' : '/login?portal=jamaah');
    }, 850);
  };

  return (
    <div className={`min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 overflow-hidden ${
      isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Background patterns */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50 dark:opacity-80">
        <div className="absolute top-[-10%] left-[-10%] w-[420px] h-[420px] bg-emerald-500/15 rounded-full blur-[110px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[420px] h-[420px] bg-amber-500/15 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl relative z-10 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* Left column: SignUp Form (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          
          {/* Header Controls: Back button, Language, and Theme switches */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors cursor-pointer"
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
                  type="button"
                  onClick={() => setLanguage('id')}
                  className={`px-2.5 py-1 rounded text-[10px] font-black transition-all cursor-pointer ${
                    language === 'id' ? 'bg-emerald-600 text-white' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  ID
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 rounded text-[10px] font-black transition-all cursor-pointer ${
                    language === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  EN
                </button>
              </div>

              <button
                type="button"
                onClick={toggleDarkMode}
                className="p-2 border rounded-lg bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-all cursor-pointer"
              >
                {isDarkMode ? '🌞' : '🌙'}
              </button>
            </div>
          </div>

          {/* Account Type Selector Tabs */}
          <div className="mb-5">
            <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 gap-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => setRegisterType('agency')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  registerType === 'agency'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>🏢</span>
                <span>{t.tabAgency}</span>
              </button>

              <button
                type="button"
                onClick={() => setRegisterType('jamaah')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  registerType === 'jamaah'
                    ? 'bg-gradient-to-r from-amber-600 to-emerald-600 text-white shadow-md shadow-amber-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>🕋</span>
                <span>{t.tabJamaah}</span>
              </button>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-1 mb-4 text-left">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              {registerType === 'agency' ? t.agencyTitle : t.jamaahTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {registerType === 'agency' ? t.agencySub : t.jamaahSub}
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-3 text-left">
            
            {/* Grid 1: Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t.nameLabel} *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePl}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-xs"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t.phoneLabel} *
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.phonePl}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-xs"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Grid 2: Email & (Agency Name / Passport) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t.emailLabel} *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPl}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-xs"
                  disabled={isLoading}
                />
              </div>

              {registerType === 'agency' ? (
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t.agencyNameLabel} *
                  </label>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder={t.agencyNamePl}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-xs"
                    disabled={isLoading}
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t.passportLabel}
                  </label>
                  <input
                    type="text"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    placeholder={t.passportPl}
                    className="w-full text-xs uppercase px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800 dark:text-white transition-all shadow-xs"
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>

            {/* City / Domisili */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t.cityLabel}
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t.cityPl}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-xs"
                disabled={isLoading}
              />
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t.passLabel} *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passPl}
                    className="w-full text-xs pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-xs"
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

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t.confirmPassLabel} *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.confirmPassPl}
                    className="w-full text-xs pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-xs"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-heavy text-xs uppercase tracking-widest py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 font-extrabold cursor-pointer mt-3 ${
                registerType === 'agency'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-700 hover:to-emerald-700 shadow-amber-600/20'
              }`}
            >
              {isLoading ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{registerType === 'agency' ? t.btnAgencySubmit : t.btnJamaahSubmit}</span>
              )}
            </button>
          </form>

          {/* Login switch info footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 text-center text-xs">
            <span className="text-slate-400 mr-1.5">{t.loginText}</span>
            <button
              type="button"
              onClick={() => navigate(registerType === 'agency' ? '/login?portal=admin' : '/login?portal=jamaah')}
              className="text-emerald-600 dark:text-emerald-400 font-extrabold hover:underline cursor-pointer"
            >
              {t.loginLink}
            </button>
          </div>
        </div>

        {/* Right column: Visual Roadmap */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-tr from-emerald-950 via-slate-950 to-slate-950 p-8 text-left flex-col justify-between relative overflow-hidden border-l border-emerald-800/30">
          
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute bottom-[20%] right-[10%] w-[180px] h-[180px] bg-white rounded-full blur-[80px]" />
            <div className="absolute inset-0 bg-[radial-gradient(#10b9811c_1px,transparent_1px)] [background-size:12px_12px]" />
          </div>

          <div className="relative z-10 flex justify-between items-center border-b border-emerald-800/30 pb-3">
            <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">
              {registerType === 'agency' ? 'Agency Workspace' : 'Pilgrim Journey Companion'}
            </span>
            <span className="text-[8px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded uppercase font-black">
              Verified
            </span>
          </div>

          <div className="my-auto space-y-5 relative z-10">
            <div>
              <p className="text-lg font-bold text-white uppercase tracking-wider leading-tight">
                {t.visualHeader}
              </p>
              <p className="text-[11px] text-emerald-250 mt-1.5 leading-relaxed text-slate-300">
                {t.visualSub}
              </p>
            </div>

            {/* Timeline cards */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3 bg-slate-950/60 p-3 rounded-xl border border-emerald-500/20">
                <div className="h-6 w-6 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-black flex items-center justify-center text-[10px] shrink-0">
                  01
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    {registerType === 'agency' ? 'Buat Workspace Agensi' : 'Akses Portal Pribadi Jemaah'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {registerType === 'agency' 
                      ? 'Dapatkan database independen untuk mengelola kuota dan manifes jamaah.'
                      : 'Pantau tiket penerbangan, barcode e-visa, dan nomor kamar hotel Anda.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-slate-950/60 p-3 rounded-xl border border-emerald-500/20">
                <div className="h-6 w-6 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-black flex items-center justify-center text-[10px] shrink-0">
                  02
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    {registerType === 'agency' ? 'Sinkronisasi Visa Muqeem' : 'Buku Doa & Manasik Digital'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {registerType === 'agency'
                      ? 'Otomatisasi pengajuan e-visa haji dan umrah langsung ke portal Saudi.'
                      : 'Bimbingan doa Thawaf dan Sa\'i lengkap dengan transliterasi dan audio.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-slate-950/60 p-3 rounded-xl border border-emerald-500/20">
                <div className="h-6 w-6 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-black flex items-center justify-center text-[10px] shrink-0">
                  03
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    {registerType === 'agency' ? 'Distribusi Kamar & Bus' : 'Layanan Darurat & Mutawwif'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {registerType === 'agency'
                      ? 'Visualisasikan alokasi tempat duduk bus pariwisata dan kamar Makkah-Madinah.'
                      : 'Hubungi mutawwif dan tour leader langsung melalui WhatsApp 24 jam.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-emerald-800/30 pt-3 text-[9px] text-emerald-400 font-mono font-bold">
            <span>DATA ENCRYPTION TLS v1.3</span>
            <span>REST API v2.8</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
