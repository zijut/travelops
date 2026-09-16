import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { PACKAGES_MOCK } from '../../constants';
import { Package } from '../../types';

export const UserPackages: React.FC = () => {
  const { isDarkMode, language, packages, bookPackageAsUser } = useApp();

  const packageList = packages.length > 0 ? packages : PACKAGES_MOCK;

  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [bookingPaxes, setBookingPaxes] = useState(2);
  const [familyNote, setFamilyNote] = useState('');

  const t = {
    id: {
      title: 'Katalog Paket Ibadah Resmi',
      subtitle: 'Jelajahi paket Umroh & Haji Khusus untuk Anda dan keluarga tercinta',
      duration: 'Hari',
      quota: 'Sisa Kuota',
      bookFamilyBtn: 'Daftarkan Keluarga',
      detailBtn: 'Lihat Fasilitas',
      modalTitle: 'Pendaftaran Paket Baru untuk Keluarga',
      paxLabel: 'Jumlah Jamaah / Anggota Keluarga (Pax)',
      notesLabel: 'Catatan Tambahan (Kebutuhan Kamar, Kursi Roda, dll)',
      btnSubmitBooking: 'Kirim Permintaan Booking',
      toastBookingSent: 'Permintaan pendaftaran paket keluarga telah dikirim ke admin agensi!'
    },
    en: {
      title: 'Official Pilgrimage Catalog',
      subtitle: 'Explore authentic Umrah & Hajj packages for you and your family',
      duration: 'Days',
      quota: 'Remaining Quota',
      bookFamilyBtn: 'Book for Family',
      detailBtn: 'View Facilities',
      modalTitle: 'New Package Registration for Family',
      paxLabel: 'Number of Pilgrims / Family Members (Pax)',
      notesLabel: 'Special Requests (Rooming type, Wheelchair, etc.)',
      btnSubmitBooking: 'Submit Booking Request',
      toastBookingSent: 'Family booking request submitted to travel agency!'
    }
  }[language];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg) return;
    bookPackageAsUser(selectedPkg.id, bookingPaxes, familyNote);
    setSelectedPkg(null);
    setFamilyNote('');
  };

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-10">
      
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
          {t.title}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {t.subtitle}
        </p>
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packageList.map((pkg) => {
          const isSoldOut = pkg.status === 'Sold Out' || pkg.booked >= pkg.quota;
          const remainingQuota = Math.max(0, pkg.quota - pkg.booked);

          return (
            <div
              key={pkg.id}
              className={`rounded-3xl border overflow-hidden flex flex-col justify-between transition-all hover:scale-[1.01] ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div>
                {/* Header tag */}
                <div className="p-5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
                      {pkg.id}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      isSoldOut ? 'bg-rose-500 text-white' : 'bg-amber-400 text-slate-950'
                    }`}>
                      {isSoldOut ? 'Sold Out' : 'Tersedia'}
                    </span>
                  </div>

                  <h3 className="text-base font-black leading-tight text-white">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    Durasi {pkg.duration} {t.duration} • Penerbangan {pkg.airline}
                  </p>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Hotel Makkah / Madinah:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{pkg.hotel}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">{t.quota}:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{remainingQuota} Pax Tersisa</span>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Harga Paket Per Pax:</span>
                    <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                      Rp {pkg.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-5 pt-0">
                <button
                  type="button"
                  disabled={isSoldOut}
                  onClick={() => setSelectedPkg(pkg)}
                  className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    isSoldOut
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                  }`}
                >
                  {isSoldOut ? 'Kuota Penuh' : t.bookFamilyBtn}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOOKING MODAL */}
      {selectedPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {t.modalTitle}
                </h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{selectedPkg.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPkg(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {t.paxLabel}
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setBookingPaxes(Math.max(1, bookingPaxes - 1))}
                    className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-lg flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono font-black text-base w-12 text-center text-slate-900 dark:text-white">
                    {bookingPaxes} Pax
                  </span>
                  <button
                    type="button"
                    onClick={() => setBookingPaxes(bookingPaxes + 1)}
                    className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-lg flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border text-slate-600 dark:text-slate-300">
                <p className="text-[10px] text-slate-400">Estimasi Total Biaya:</p>
                <p className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                  Rp {(selectedPkg.price * bookingPaxes).toLocaleString('id-ID')}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {t.notesLabel}
                </label>
                <textarea
                  value={familyNote}
                  onChange={(e) => setFamilyNote(e.target.value)}
                  placeholder="Contoh: Tambah 1 pax untuk istri dan 1 pax untuk anak usia 12 tahun..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  {t.btnSubmitBooking}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPkg(null)}
                  className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
