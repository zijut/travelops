import React, { useState, useEffect } from 'react';
import { useApp } from '../../AppContext';
import { JAMAAH_MOCK } from '../../constants';

export const UserProfileView: React.FC = () => {
  const { isDarkMode, language, activeJamaah, updateActiveJamaah, triggerToast } = useApp();

  const jamaah = activeJamaah || JAMAAH_MOCK[0];

  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(jamaah.phone || '');
  const [city, setCity] = useState(jamaah.city || '');
  const [emergencyName, setEmergencyName] = useState(jamaah.emergencyContactName || '');
  const [emergencyPhone, setEmergencyPhone] = useState(jamaah.emergencyContactPhone || '');
  const [bloodType, setBloodType] = useState(jamaah.bloodType || 'O+');

  useEffect(() => {
    if (jamaah) {
      setPhone(jamaah.phone || '');
      setCity(jamaah.city || '');
      setEmergencyName(jamaah.emergencyContactName || '');
      setEmergencyPhone(jamaah.emergencyContactPhone || '');
      setBloodType(jamaah.bloodType || 'O+');
    }
  }, [jamaah]);

  const t = {
    id: {
      title: 'Profil Pribadi Jemaah',
      subtitle: 'Data biodata resmi, nomor paspor, kontak darurat keluarga di Indonesia, dan riwayat kesehatan',
      editBtn: 'Ubah Data Kontak',
      saveBtn: 'Simpan Perubahan',
      cancelBtn: 'Batal',
      sectionPersonal: 'Biodata Diri Jemaah',
      sectionPassport: 'Dokumen Paspor & Identitas',
      sectionEmergency: 'Kontak Darurat Keluarga di Tanah Air',
      sectionMedical: 'Informasi Kesehatan',
      nameLabel: 'Nama Lengkap (Sesuai Paspor)',
      nikLabel: 'Nomor Induk Kependudukan (NIK)',
      passportLabel: 'Nomor Paspor RI',
      phoneLabel: 'Nomor WhatsApp / HP',
      cityLabel: 'Kota Domisili',
      birthLabel: 'Tanggal Lahir',
      genderLabel: 'Jenis Kelamin',
      emergencyNameLabel: 'Nama Kontak Darurat & Hubungan',
      emergencyPhoneLabel: 'Nomor Telepon Kontak Darurat',
      bloodTypeLabel: 'Golongan Darah',
      toastSaved: 'Perubahan profil jemaah berhasil disimpan!'
    },
    en: {
      title: 'Pilgrim Personal Profile',
      subtitle: 'Official biodata, passport number, emergency contact in Indonesia, and medical details',
      editBtn: 'Edit Contact Details',
      saveBtn: 'Save Changes',
      cancelBtn: 'Cancel',
      sectionPersonal: 'Personal Biodata',
      sectionPassport: 'Passport & Identity Details',
      sectionEmergency: 'Emergency Contacts in Homeland',
      sectionMedical: 'Medical Information',
      nameLabel: 'Full Legal Name',
      nikLabel: 'National Identity Number (NIK)',
      passportLabel: 'Passport Number',
      phoneLabel: 'WhatsApp / Phone Number',
      cityLabel: 'City of Residence',
      birthLabel: 'Date of Birth',
      genderLabel: 'Gender',
      emergencyNameLabel: 'Emergency Contact Person & Relation',
      emergencyPhoneLabel: 'Emergency Contact Phone Number',
      bloodTypeLabel: 'Blood Type',
      toastSaved: 'Profile changes saved successfully!'
    }
  }[language];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateActiveJamaah({
      phone,
      city,
      emergencyContactName: emergencyName,
      emergencyContactPhone: emergencyPhone,
      bloodType
    });
    setIsEditing(false);
    triggerToast(t.toastSaved, 'success');
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto pb-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
            {t.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.subtitle}
          </p>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center space-x-2"
          >
            <span>✏️</span>
            <span>{t.editBtn}</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              {t.saveBtn}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
            >
              {t.cancelBtn}
            </button>
          </div>
        )}
      </div>

      {/* Profile Card Header */}
      <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <img
          src={jamaah.avatarUrl}
          alt={jamaah.name}
          className="h-20 w-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
        />
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {jamaah.name}
            </h2>
            <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-black px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              {jamaah.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Booking ID: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{jamaah.id}</strong> • {jamaah.package} ({jamaah.kloter})
          </p>
          <p className="text-xs text-slate-400">
            Terdaftar di: <strong>Al-Haramain Tour & Travel</strong>
          </p>
        </div>
      </div>

      {/* Profile Form / Display */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Personal Biodata */}
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-4 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
            <span>👤</span>
            <span>{t.sectionPersonal}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] uppercase font-bold">{t.nameLabel}</label>
              <input
                type="text"
                disabled
                value={jamaah.name}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 font-bold text-slate-600 dark:text-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] uppercase font-bold">{t.nikLabel}</label>
              <input
                type="text"
                disabled
                value={jamaah.ktpNumber || '3171021405820003'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 font-mono font-bold text-slate-600 dark:text-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] uppercase font-bold">{t.phoneLabel} *</label>
              <input
                type="text"
                disabled={!isEditing}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  isEditing 
                    ? 'border-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 font-bold'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] uppercase font-bold">{t.cityLabel} *</label>
              <input
                type="text"
                disabled={!isEditing}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  isEditing 
                    ? 'border-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 font-bold'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Passport Details */}
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-4 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
            <span>🛂</span>
            <span>{t.sectionPassport}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] uppercase font-bold">{t.passportLabel}</label>
              <input
                type="text"
                disabled
                value={jamaah.passportNumber || 'A1234500'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 font-mono font-bold text-slate-600 dark:text-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] uppercase font-bold">Masa Berlaku Paspor</label>
              <input
                type="text"
                disabled
                value={jamaah.passportExpiry || '15 Agustus 2031'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 font-bold text-slate-600 dark:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Emergency Contacts & Medical */}
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-4 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center space-x-2">
            <span>📞</span>
            <span>{t.sectionEmergency}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] uppercase font-bold">{t.emergencyNameLabel} *</label>
              <input
                type="text"
                disabled={!isEditing}
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  isEditing 
                    ? 'border-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 font-bold'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] uppercase font-bold">{t.emergencyPhoneLabel} *</label>
              <input
                type="text"
                disabled={!isEditing}
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  isEditing 
                    ? 'border-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 font-bold'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] uppercase font-bold">{t.bloodTypeLabel}</label>
              <input
                type="text"
                disabled={!isEditing}
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  isEditing 
                    ? 'border-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 font-bold'
                }`}
              />
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
