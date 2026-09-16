import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { JAMAAH_MOCK } from '../../constants';

export const UserDocuments: React.FC = () => {
  const { isDarkMode, language, activeJamaah, triggerToast } = useApp();

  const jamaah = activeJamaah || JAMAAH_MOCK[0];

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('Paspor RI');
  const [showVisaPdfModal, setShowVisaPdfModal] = useState(false);

  const t = {
    id: {
      title: 'Dokumen & Visa Jemaah',
      subtitle: 'Pusat verifikasi berkas resmi perjalanan ibadah Haji & Umrah Anda',
      passportTitle: 'Paspor Republik Indonesia',
      passportNo: 'Nomor Paspor',
      passportExp: 'Masa Berlaku s.d.',
      passportStatus: 'Status Verifikasi',
      visaTitle: 'E-Visa Umroh Kerajaan Arab Saudi',
      visaNo: 'Nomor Visa Muqeem',
      visaType: 'Jenis Visa',
      visaIssue: 'Tanggal Terbit',
      visaExp: 'Berlaku Hingga',
      vaccineTitle: 'Sertifikat Vaksin Meningitis Kemenkes',
      ktpTitle: 'Kartu Tanda Penduduk (e-KTP)',
      uploadBtn: 'Upload / Perbarui Berkas',
      downloadVisaBtn: 'Unduh E-Visa Resmi (PDF)',
      verifiedBadge: 'Terverifikasi Resmi',
      pendingBadge: 'Sedang Diverifikasi',
      submittedBadge: 'Berkas Diunggah',
      toastUploaded: 'Berkas berhasil diunggah! Tim operasional akan memverifikasi dalam 1x24 jam.'
    },
    en: {
      title: 'Pilgrim Documents & Visa',
      subtitle: 'Official travel documents verification hub for your pilgrimage',
      passportTitle: 'Republic of Indonesia Passport',
      passportNo: 'Passport Number',
      passportExp: 'Valid Until',
      passportStatus: 'Verification Status',
      visaTitle: 'Kingdom of Saudi Arabia Umrah E-Visa',
      visaNo: 'Muqeem Visa Number',
      visaType: 'Visa Type',
      visaIssue: 'Issue Date',
      visaExp: 'Expiry Date',
      vaccineTitle: 'Meningitis Vaccine Certificate',
      ktpTitle: 'National Identity Card (KTP)',
      uploadBtn: 'Upload / Update Document',
      downloadVisaBtn: 'Download Official E-Visa (PDF)',
      verifiedBadge: 'Officially Verified',
      pendingBadge: 'Pending Verification',
      submittedBadge: 'Document Uploaded',
      toastUploaded: 'Document uploaded successfully! Ops team will verify within 24h.'
    }
  }[language];

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-10">
      
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

        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center space-x-2"
        >
          <span>📤</span>
          <span>{t.uploadBtn}</span>
        </button>
      </div>

      {/* 1. OFFICIAL E-VISA HIGHLIGHT BANNER */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                Official Ministry of Hajj & Umrah KSA
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded text-[10px] font-black uppercase">
                Muqeem Verified
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {t.visaTitle}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">{t.visaNo}</p>
                <p className="font-mono font-bold text-amber-300 text-sm">{jamaah.visaNumber || 'EV-SA-9982410'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">{t.visaType}</p>
                <p className="font-bold text-white">Umrah Multiple Entry</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">{t.visaExp}</p>
                <p className="font-bold text-white">28 Mei 2026</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-2xl border border-white/10 space-y-3">
            {/* Barcode representation */}
            <div className="bg-white p-2 rounded-lg text-center w-full">
              <div className="h-10 w-full bg-[repeating-linear-gradient(90deg,#000,#000_2px,#fff_2px,#fff_4px)] rounded-xs mb-1"></div>
              <p className="text-[8px] font-mono text-slate-800 font-bold tracking-widest">{jamaah.visaNumber || 'EV-SA-9982410'}</p>
            </div>

            <button
              type="button"
              onClick={() => setShowVisaPdfModal(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <span>📄</span>
              <span>{t.downloadVisaBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. THREE CORE DOCUMENTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Document 1: PASPOR RI */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xl">
                📘
              </div>
              <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/20">
                ✓ {t.verifiedBadge}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.passportTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pemegang: <strong>{jamaah.name}</strong>
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">{t.passportNo}:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">{jamaah.passportNumber || 'A1234500'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.passportExp}:</span>
                <span className="font-bold text-slate-800 dark:text-white">{jamaah.passportExpiry || '15 Agustus 2031'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fisik Paspor:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Tersimpan di Kantor Travel</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedDocType('Paspor RI');
              setShowUploadModal(true);
            }}
            className="mt-4 w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
          >
            Lihat / Unggah Ulang Scan
          </button>
        </div>

        {/* Document 2: VAKSIN MENINGITIS */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center text-xl">
                💉
              </div>
              <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/20">
                ✓ {t.verifiedBadge}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.vaccineTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sertifikat Vaksin Internasional (ICV)
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Jenis Vaksin:</span>
                <span className="font-bold text-slate-800 dark:text-white">Meningitis Meningokokus</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Integrasi:</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">SatuSehat Kemenkes RI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Masa Berlaku:</span>
                <span className="font-bold text-slate-800 dark:text-white">Aktif (3 Tahun)</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedDocType('Sertifikat Vaksin');
              setShowUploadModal(true);
            }}
            className="mt-4 w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors cursor-pointer"
          >
            Lihat / Unggah Bukti Vaksin
          </button>
        </div>

        {/* Document 3: KTP & KK */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-xl">
                🪪
              </div>
              <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/20">
                ✓ {t.verifiedBadge}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.ktpTitle} & Kartu Keluarga
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Identitas Kependudukan Resmi
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">NIK KTP:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">{jamaah.ktpNumber || '3171021405820003'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Domisili:</span>
                <span className="font-bold text-slate-800 dark:text-white">{jamaah.city || 'Jakarta Selatan'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kesesuaian Data:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Cocok 100% dengan Paspor</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedDocType('KTP & KK');
              setShowUploadModal(true);
            }}
            className="mt-4 w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
          >
            Lihat Berkas Identitas
          </button>
        </div>
      </div>

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Upload Dokumen: {selectedDocType}
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Pilih Tipe Dokumen
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
              >
                <option value="Paspor RI">Paspor RI (Halaman Depan / Biodata)</option>
                <option value="Sertifikat Vaksin">Sertifikat Vaksin Meningitis (Buku Kuning / SatuSehat)</option>
                <option value="KTP & KK">e-KTP & Kartu Keluarga</option>
                <option value="Foto Buku Nikah / Akta">Buku Nikah / Akta Lahir (Bagi Pasutri & Anak)</option>
              </select>

              {/* Drag & Drop simulated box */}
              <div className="border-2 border-dashed border-emerald-500/40 rounded-2xl p-6 text-center space-y-2 bg-emerald-50/30 dark:bg-emerald-950/20">
                <span className="text-3xl block">📁</span>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Tarik file foto/PDF dokumen ke sini
                </p>
                <p className="text-[10px] text-slate-400">
                  Format JPG, PNG, atau PDF (Maksimal 10 MB per file)
                </p>
                <input type="file" className="hidden" id="file-doc-upload" />
                <label
                  htmlFor="file-doc-upload"
                  className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm mt-2"
                >
                  Pilih Dari Galeri / Kamera
                </label>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  triggerToast(t.toastUploaded, 'success');
                  setShowUploadModal(false);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/20"
              >
                Kirim Dokumen
              </button>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VISA PDF PREVIEW MODAL */}
      {showVisaPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/30 text-left">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider">
                  KSA Electronic Visa Clearance
                </h3>
                <p className="text-[10px] text-emerald-200 font-mono">Muqeem Gateway Ref: {jamaah.visaNumber || 'EV-SA-9982410'}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowVisaPdfModal(false)}
                className="text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Document Content */}
            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="text-center border-b pb-3 space-y-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">المملكة العربية السعودية • وزارة الحج والعمرة</p>
                <p className="text-[10px] text-slate-500">Kingdom of Saudi Arabia • Ministry of Hajj & Umrah</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Pilgrim Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">{jamaah.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Nationality</span>
                  <span className="font-bold text-slate-900 dark:text-white">INDONESIAN (IDN)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Passport No</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{jamaah.passportNumber || 'A1234500'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Visa Status</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">ISSUED & VALID</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerToast('File E-Visa PDF berhasil diunduh ke perangkat!', 'success');
                    setShowVisaPdfModal(false);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Download E-Visa PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowVisaPdfModal(false)}
                  className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
