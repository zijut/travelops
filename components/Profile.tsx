import React, { useState, useRef } from 'react';
import { useApp } from '../AppContext';
import { Card } from './shared/Card';
import { Icon } from './shared/Icon';

const TRANSLATIONS = {
  id: {
    title: 'Profil Saya',
    subtitle: 'Kelola informasi identitas akun personal, kata sandi, dan detail agensi operasional Anda.',
    photoLabel: 'Foto Profil',
    uploadBtn: 'Unggah Foto Baru',
    uploadHint: 'Format JPG, PNG maksimal 2MB. Diunggah secara lokal.',
    saveBtn: 'Simpan Perubahan',
    saving: 'Menyimpan...',
    toastSuccess: 'Berhasil menyimpan perubahan profil akun!',
    errSize: 'Ukuran file terlalu besar! Maksimal 2MB.',
    
    // Fields
    fullName: 'Nama Lengkap',
    email: 'Alamat Email',
    phone: 'Nomor Telepon',
    password: 'Kata Sandi Baru',
    passwordConfirm: 'Konfirmasi Kata Sandi Baru',
    agency: 'Nama Agensi Travel',
    role: 'Jabatan / Role Kerja',
    region: 'Sektor / Wilayah Kerja',
    address: 'Alamat Kantor Pusat',
    
    // Placeholders
    phName: 'Masukkan nama lengkap...',
    phEmail: 'contoh@alharamain.id',
    phPhone: '+62 812...',
    phPassword: 'Ketik kata sandi baru...',
    phAgency: 'Nama travel agensi...',
    phRole: 'Role Anda di agensi...',
    phRegion: 'Contoh: Jakarta & Saudi Arabia',
    phAddress: 'Alamat lengkap kantor cabang...',
    
    // Extra labels
    required: 'Wajib diisi',
    optional: 'Opsional',
    agencyBadge: 'Detail Agensi Kerja',
    securityBadge: 'Kredensial Keamanan'
  },
  en: {
    title: 'My Profile',
    subtitle: 'Manage your personal identity information, password credentials, and operational agency details.',
    photoLabel: 'Profile Picture',
    uploadBtn: 'Upload New Photo',
    uploadHint: 'JPG, PNG format max 2MB. Uploaded locally.',
    saveBtn: 'Save Changes',
    saving: 'Saving...',
    toastSuccess: 'Profile changes saved successfully!',
    errSize: 'File size too large! Max 2MB.',
    
    // Fields
    fullName: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    password: 'New Password',
    passwordConfirm: 'Confirm New Password',
    agency: 'Travel Agency Name',
    role: 'Job Role / Title',
    region: 'Operational Region',
    address: 'Headquarters Address',
    
    // Placeholders
    phName: 'Enter your full name...',
    phEmail: 'example@alharamain.id',
    phPhone: '+62 812...',
    phPassword: 'Type a new password...',
    phAgency: 'Travel agency name...',
    phRole: 'Your role at agency...',
    phRegion: 'E.g. Jakarta & Saudi Arabia',
    phAddress: 'Branch office address...',
    
    // Extra labels
    required: 'Required',
    optional: 'Optional',
    agencyBadge: 'Agency Details',
    securityBadge: 'Security Credentials'
  }
};

const Profile: React.FC = () => {
  const { isDarkMode, language, triggerToast, userProfile, setUserProfile } = useApp();
  const t = TRANSLATIONS[language];

  // Local Form state
  const [formData, setFormData] = useState({
    name: userProfile.name,
    email: userProfile.email,
    phone: userProfile.phone,
    password: userProfile.password || '',
    passwordConfirm: userProfile.password || '',
    agency: userProfile.agency || '',
    role: userProfile.role || '',
    region: userProfile.region || '',
    address: userProfile.address || '',
    photo: userProfile.photo
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Upload Photo File Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      triggerToast(t.errSize, 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({ ...prev, photo: base64String }));
      triggerToast(
        language === 'id' ? 'Foto berhasil diunggah!' : 'Photo uploaded successfully!',
        'success'
      );
    };
    reader.readAsDataURL(file);
  };

  // Submit Profile Changes
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      triggerToast(
        language === 'id' 
          ? 'Konfirmasi kata sandi baru tidak cocok!' 
          : 'New password confirmation does not match!',
        'error'
      );
      return;
    }
    setIsSaving(true);

    setTimeout(() => {
      setUserProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        photo: formData.photo,
        agency: formData.agency,
        role: formData.role,
        region: formData.region,
        address: formData.address,
        shortName: formData.name.split(' ')[0]
      });
      setIsSaving(false);
      triggerToast(t.toastSuccess, 'success');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in pb-12">
      {/* Dynamic Header Panel */}
      <div className="text-left">
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
          {t.title}
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {t.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card & Photo Uploader */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
          <div className="relative group">
            <img
              src={formData.photo}
              alt="Profile"
              className="h-28 w-28 rounded-full object-cover border-4 border-emerald-500/20 shadow-lg shrink-0"
            />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          <div className="text-center md:text-left flex-1 space-y-2">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-widest">
              {t.photoLabel}
            </h3>
            <p className="text-[11px] text-slate-405 dark:text-slate-400 leading-relaxed max-w-sm">
              {t.uploadHint}
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 inline-flex items-center space-x-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all text-slate-700 dark:text-slate-200 cursor-pointer shadow-xs"
            >
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>{t.uploadBtn}</span>
            </button>
          </div>
        </Card>

        {/* Input fields grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Account Info */}
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-left">
            <h3 className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2.5 flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Kredensial Profil Utama</span>
            </h3>

            {/* Nama Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{t.fullName}</label>
                <span className="text-[9px] font-bold text-red-500 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">{t.required}</span>
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t.phName}
                required
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-xs"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{t.email}</label>
                <span className="text-[9px] font-bold text-red-500 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">{t.required}</span>
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t.phEmail}
                required
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-xs"
              />
            </div>

            {/* No Telepon Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{t.phone}</label>
                <span className="text-[9px] font-bold text-red-500 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">{t.required}</span>
              </div>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t.phPhone}
                required
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-xs"
              />
            </div>

            {/* Password Input with show/hide eyes toggle */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{t.password}</label>
                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{t.optional}</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t.phPassword}
                  className="w-full text-xs pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
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

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{t.passwordConfirm}</label>
                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{t.optional}</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  placeholder={language === 'id' ? 'Ulangi kata sandi baru...' : 'Retype new password...'}
                  className="w-full text-xs pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
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
          </Card>

          {/* Agency & Role Info - 4 extra relevant fields */}
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-left">
            <h3 className="text-xs font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2.5 flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>{t.agencyBadge}</span>
            </h3>

            {/* Agency Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{t.agency}</label>
              <input
                type="text"
                name="agency"
                value={formData.agency}
                onChange={handleChange}
                placeholder={t.phAgency}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-xs"
              />
            </div>

            {/* Role Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{t.role}</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder={t.phRole}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-xs"
              />
            </div>

            {/* Sector / Region Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{t.region}</label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                placeholder={t.phRegion}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-xs"
              />
            </div>

            {/* Alamat Input (Textarea) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{t.address}</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                placeholder={t.phAddress}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white transition-all resize-none shadow-xs"
              />
            </div>
          </Card>
        </div>

        {/* Save button panel */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{t.saving}</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4 text-emerald-250" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{t.saveBtn}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
