import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { JAMAAH_MOCK, MOCK_ITINERARY } from '../../constants';

interface UserDashboardProps {
  setActiveView: (view: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ setActiveView }) => {
  const { isDarkMode, language, activeJamaah, userProfile, triggerToast } = useApp();

  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [showFlightModal, setShowFlightModal] = useState(false);

  // Fallback to Ahmad Subagja if activeJamaah not loaded yet
  const jamaah = activeJamaah || JAMAAH_MOCK[0];

  const t = {
    id: {
      welcome: 'Ahlan wa Sahlan,',
      subtitle: 'Semoga ibadah Umrah Anda mabrur dan penuh keberkahan.',
      departureCountdown: 'Hitung Mundur Keberangkatan',
      daysLeft: 'Hari Menuju Tanah Suci',
      departureDate: 'Tanggal Berangkat',
      kloterBadge: 'Kloter',
      activePackage: 'Paket Ibadah Anda',
      flightInfo: 'Penerbangan Langsung',
      hotelMakkah: 'Hotel Makkah (5★)',
      hotelMadinah: 'Hotel Madinah (5★)',
      visaStatus: 'Status Visa Umroh',
      roomAndSeat: 'Kamar & Kursi Bus',
      myRoom: 'Kamar',
      mySeat: 'Kursi Bus',
      quickActions: 'Akses Cepat Jemaah',
      btnIdCard: 'Kartu ID Digital',
      btnVisa: 'Cek E-Visa Resmi',
      btnItinerary: 'Jadwal & Rundown',
      btnRoomBus: 'Kamar & Bus Saya',
      btnPayments: 'Rincian Tagihan',
      btnDoa: 'Buku Doa Manasik',
      btnMutawwif: 'Chat Mutawwif (WA)',
      todaySchedule: 'Agenda Terdekat Perjalanan',
      downloadTicket: 'Unduh E-Ticket (PDF)',
      toastTicket: 'E-Ticket & Boarding Pass berhasil diunduh!'
    },
    en: {
      welcome: 'Welcome,',
      subtitle: 'May your Umrah pilgrimage be accepted and full of blessings.',
      departureCountdown: 'Departure Countdown',
      daysLeft: 'Days to Holy Land',
      departureDate: 'Departure Date',
      kloterBadge: 'Group',
      activePackage: 'Your Pilgrimage Package',
      flightInfo: 'Direct Flight',
      hotelMakkah: 'Makkah Hotel (5★)',
      hotelMadinah: 'Madinah Hotel (5★)',
      visaStatus: 'Umrah Visa Status',
      roomAndSeat: 'Room & Bus Seat',
      myRoom: 'Room',
      mySeat: 'Bus Seat',
      quickActions: 'Pilgrim Quick Actions',
      btnIdCard: 'Digital ID Card',
      btnVisa: 'Check Official E-Visa',
      btnItinerary: 'Daily Itinerary',
      btnRoomBus: 'My Room & Bus Seat',
      btnPayments: 'Invoice & Billing',
      btnDoa: 'Prayer & Manasik Book',
      btnMutawwif: 'WhatsApp Mutawwif',
      todaySchedule: 'Upcoming Itinerary Highlight',
      downloadTicket: 'Download E-Ticket (PDF)',
      toastTicket: 'E-Ticket & Boarding Pass downloaded successfully!'
    }
  }[language];

  // Calculate days remaining (assuming departure 15 Mar 2026)
  const targetDate = new Date('2026-03-15T08:00:00');
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-10">
      
      {/* 1. HERO BANNER: Welcome + Countdown Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 shadow-2xl border border-emerald-700/40">
        
        {/* Background Islamic Ornaments */}
        <div className="absolute inset-0 pointer-events-none opacity-15">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff20_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Hero: Greeting & Pilgrim Info (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 text-xs font-semibold text-emerald-200">
              <span>🕋</span>
              <span>{userProfile?.agency || 'Al-Haramain Travel'} • {jamaah.kloter}</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                {t.welcome} <span className="text-amber-300">{jamaah.name}</span>
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1.5 max-w-xl leading-relaxed">
                {t.subtitle}
              </p>
            </div>

            {/* Badges strip */}
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className="bg-emerald-500/25 border border-emerald-400/40 px-3 py-1 rounded-xl font-bold flex items-center space-x-1.5">
                <span>✓</span>
                <span>{jamaah.status}</span>
              </span>
              <span className="bg-amber-500/25 border border-amber-400/40 px-3 py-1 rounded-xl font-bold text-amber-200 flex items-center space-x-1.5">
                <span>🛂</span>
                <span>Paspor: {jamaah.passportNumber || 'A1234500'}</span>
              </span>
              <span className="bg-white/15 border border-white/20 px-3 py-1 rounded-xl font-bold text-white flex items-center space-x-1.5">
                <span>🏷️</span>
                <span>Booking ID: {jamaah.id}</span>
              </span>
            </div>
          </div>

          {/* Right Hero: Countdown Widget & Flight Ticker (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950/50 backdrop-blur-md border border-white/15 rounded-2xl p-5 text-center space-y-3 shadow-inner">
            <p className="text-[10px] uppercase font-black tracking-widest text-emerald-300">
              {t.departureCountdown}
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="bg-emerald-600/30 border border-emerald-400/40 rounded-2xl px-4 py-2 text-center">
                <span className="text-3xl sm:text-4xl font-black text-amber-300 font-mono">
                  {diffDays > 0 ? diffDays : '6'}
                </span>
                <span className="block text-[9px] uppercase font-bold text-emerald-200 mt-0.5">HARI LAGI</span>
              </div>
              <div className="text-left space-y-0.5 pl-2">
                <p className="text-xs font-bold text-white">15 Maret 2026</p>
                <p className="text-[11px] text-emerald-200">Penerbangan SV-821</p>
                <p className="text-[10px] text-slate-400">Terminal 3 Soekarno-Hatta (CGK)</p>
              </div>
            </div>

            {/* Quick Action in Banner */}
            <div className="pt-2 flex items-center justify-center space-x-2">
              <button
                type="button"
                onClick={() => setShowIdCardModal(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center space-x-1.5"
              >
                <span>🪪</span>
                <span>{t.btnIdCard}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerToast(t.toastTicket, 'success');
                }}
                className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all border border-white/20 cursor-pointer flex items-center space-x-1.5"
              >
                <span>🎫</span>
                <span>E-Ticket</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY CARDS GRID: Package, Hotel, Room & Bus, Visa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Package Info */}
        <div className={`p-4.5 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Paket Pilihan
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 text-sm">📦</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
            {jamaah.package}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Maskapai: <strong>Saudia Airlines</strong>
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Durasi: <strong>12 Hari</strong></span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">Rp {(jamaah.totalPrice || 35000000).toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Card 2: Visa Status */}
        <div className={`p-4.5 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              E-Visa Arab Saudi
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 text-sm">🛂</span>
          </div>
          <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-tight flex items-center space-x-1.5">
            <span>✓</span>
            <span>{jamaah.visaNumber || 'EV-SA-9982410'}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Status: <strong className="text-emerald-600 dark:text-emerald-400">Approved (Muqeem)</strong>
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Berlaku s.d:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">28 Mei 2026</span>
          </div>
        </div>

        {/* Card 3: Hotel Rooms */}
        <div className={`p-4.5 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Kamar Hotel Saya
            </span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 text-sm">🏨</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
            {jamaah.hotelMakkah || 'Anjum Hotel Makkah'}
          </h3>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-1">
            {jamaah.roomMakkah || 'Kamar 101'} • Tipe {jamaah.roomType || 'Quad'}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Madinah:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{jamaah.roomMadinah || 'Kamar 304'}</span>
          </div>
        </div>

        {/* Card 4: Bus Seat */}
        <div className={`p-4.5 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Alokasi Bus Pariwisata
            </span>
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-600 text-sm">🚌</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
            {jamaah.busNumber || 'Bus VIP 01 (Al-Haramain)'}
          </h3>
          <p className="text-xs text-teal-600 dark:text-teal-400 font-bold mt-1">
            Nomor Kursi: Kursi #{jamaah.busSeatNumber || 1}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Pembimbing:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">Ustadz Syakir</span>
          </div>
        </div>
      </div>

      {/* 3. QUICK ACTION SHORTCUTS */}
      <div className={`p-6 rounded-3xl border ${
        isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white mb-4">
          ⚡ {t.quickActions}
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <button
            type="button"
            onClick={() => setActiveView('Dokumen & Visa')}
            className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-left hover:scale-[1.02] transition-all cursor-pointer group"
          >
            <span className="text-2xl block mb-2 group-hover:rotate-6 transition-transform">🛂</span>
            <p className="text-xs font-black text-emerald-800 dark:text-emerald-300 leading-tight">
              {t.btnVisa}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Status & Unduh</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('Jadwal & Itinerary')}
            className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40 text-left hover:scale-[1.02] transition-all cursor-pointer group"
          >
            <span className="text-2xl block mb-2 group-hover:rotate-6 transition-transform">🗓️</span>
            <p className="text-xs font-black text-teal-800 dark:text-teal-300 leading-tight">
              {t.btnItinerary}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Hari 1 s/d 12</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('Kamar & Kursi Bus')}
            className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-left hover:scale-[1.02] transition-all cursor-pointer group"
          >
            <span className="text-2xl block mb-2 group-hover:rotate-6 transition-transform">🏨</span>
            <p className="text-xs font-black text-amber-800 dark:text-amber-300 leading-tight">
              {t.btnRoomBus}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Teman Sekamar</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('Buku Doa & Manasik')}
            className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 text-left hover:scale-[1.02] transition-all cursor-pointer group"
          >
            <span className="text-2xl block mb-2 group-hover:rotate-6 transition-transform">📖</span>
            <p className="text-xs font-black text-indigo-800 dark:text-indigo-300 leading-tight">
              {t.btnDoa}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Thawaf & Sa'i</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('Tagihan & Bukti Bayar')}
            className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 text-left hover:scale-[1.02] transition-all cursor-pointer group"
          >
            <span className="text-2xl block mb-2 group-hover:rotate-6 transition-transform">💳</span>
            <p className="text-xs font-black text-blue-800 dark:text-blue-300 leading-tight">
              {t.btnPayments}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Kwitansi & Bayar</p>
          </button>

          <a
            href="https://wa.me/6281234567890?text=Assalamualaikum%20Ustadz,%20saya%20jemaah%20Al-Haramain%20Kloter%20A"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-emerald-600 text-white text-left hover:bg-emerald-700 transition-all cursor-pointer group shadow-md shadow-emerald-600/20"
          >
            <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">💬</span>
            <p className="text-xs font-black leading-tight">
              {t.btnMutawwif}
            </p>
            <p className="text-[10px] text-emerald-200 mt-1">Bantuan 24 Jam</p>
          </a>

        </div>
      </div>

      {/* 4. UPCOMING ITINERARY TIMELINE PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Day 1 & Day 2 Schedule highlight (7 cols) */}
        <div className={`lg:col-span-7 p-6 rounded-3xl border ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">
                {t.todaySchedule}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hari ke-1: {MOCK_ITINERARY[0].title}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('Jadwal & Itinerary')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Lihat 12 Hari →
            </button>
          </div>

          <div className="space-y-3">
            {MOCK_ITINERARY[0].activities.slice(0, 4).map((act, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[10px] px-2.5 py-1 rounded-lg shrink-0">
                  {act.time}
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{act.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{act.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Emergency Contacts & Travel Leader Card (5 cols) */}
        <div className={`lg:col-span-5 p-6 rounded-3xl border flex flex-col justify-between ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white mb-3">
              📞 Tim Pendamping & Kontak Darurat
            </h2>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-sm shrink-0">
                  US
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Ustadz Syakir (Mutawwif Utama)</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">+966 50-123-4567 (Saudi)</p>
                </div>
                <a
                  href="https://wa.me/966501234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs font-bold"
                >
                  WA
                </a>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-full bg-teal-600 text-white font-black flex items-center justify-center text-sm shrink-0">
                  TL
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">H. Abdullah (Tour Leader / Direktur)</p>
                  <p className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">+62 812-3456-7890 (Indo)</p>
                </div>
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 text-xs font-bold"
                >
                  WA
                </a>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-xl">🏛️</span>
                <div>
                  <p className="text-xs font-bold text-amber-900 dark:text-amber-200">KJRI Jeddah (Hotline 24 Jam)</p>
                  <p className="text-[10px] text-amber-700 dark:text-amber-300 font-mono">+966 50-360-9667</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between mt-3">
            <span>Sistem Operasi TravelOps Jemaah v2.8</span>
            <span className="text-emerald-500 font-bold">● Terhubung</span>
          </div>
        </div>
      </div>

      {/* DIGITAL ID CARD MODAL */}
      {showIdCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-amber-500/30 text-left">
            
            {/* Modal Card Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white text-center relative">
              <button
                type="button"
                onClick={() => setShowIdCardModal(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
              
              <div className="h-16 w-16 mx-auto rounded-full bg-white/20 border-2 border-amber-300 p-1 mb-2 overflow-hidden">
                <img src={jamaah.avatarUrl} alt={jamaah.name} className="w-full h-full object-cover rounded-full" />
              </div>

              <h3 className="text-lg font-black text-white">{jamaah.name}</h3>
              <p className="text-xs text-amber-300 font-mono font-bold">{jamaah.id} • {jamaah.kloter}</p>
              <span className="inline-block bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-[9px] font-black px-2.5 py-0.5 rounded-full mt-1.5 uppercase">
                {userProfile?.agency || 'Al-Haramain Travel'}
              </span>
            </div>

            {/* Modal Card Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border dark:border-slate-800">
                  <p className="text-slate-400 text-[9px] uppercase font-bold">Nomor Paspor</p>
                  <p className="font-mono font-bold text-slate-800 dark:text-white text-sm">{jamaah.passportNumber || 'A1234500'}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border dark:border-slate-800">
                  <p className="text-slate-400 text-[9px] uppercase font-bold">Status Visa</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">✓ {jamaah.status}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border dark:border-slate-800">
                  <p className="text-slate-400 text-[9px] uppercase font-bold">Kamar Makkah</p>
                  <p className="font-bold text-slate-800 dark:text-white text-xs">{jamaah.roomMakkah || 'Room 101'} (Quad)</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border dark:border-slate-800">
                  <p className="text-slate-400 text-[9px] uppercase font-bold">Kursi Bus</p>
                  <p className="font-bold text-teal-600 dark:text-teal-400 text-xs">Kursi #{jamaah.busSeatNumber || 1}</p>
                </div>
              </div>

              {/* Simulated QR Code for Pilgrim verification */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <div className="h-32 w-32 mx-auto bg-white p-2 rounded-xl border flex items-center justify-center shadow-inner">
                  {/* Visual QR Code Representation */}
                  <div className="grid grid-cols-5 gap-1.5 w-full h-full p-1 bg-slate-900 rounded">
                    <div className="bg-white rounded-xs"></div>
                    <div className="bg-emerald-400 rounded-xs"></div>
                    <div className="bg-white rounded-xs"></div>
                    <div className="bg-white rounded-xs"></div>
                    <div className="bg-emerald-400 rounded-xs"></div>
                    <div className="bg-white rounded-xs"></div>
                    <div className="bg-white rounded-xs"></div>
                    <div className="bg-emerald-400 rounded-xs"></div>
                    <div className="bg-white rounded-xs"></div>
                    <div className="bg-white rounded-xs"></div>
                    <div className="bg-emerald-400 rounded-xs"></div>
                    <div className="bg-white rounded-xs"></div>
                    <div className="bg-white rounded-xs"></div>
                    <div className="bg-emerald-400 rounded-xs"></div>
                    <div className="bg-white rounded-xs"></div>
                    <div className="bg-white rounded-xs"></div>
                    <div className="bg-emerald-400 rounded-xs"></div>
                    <div className="bg-white rounded-xs"></div>
                    <div className="bg-white rounded-xs"></div>
                    <div className="bg-emerald-400 rounded-xs"></div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">Scan QR untuk Verifikasi Kemenag & Muqeem</p>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerToast('ID Card Digital disimpan ke galeri!', 'success');
                    setShowIdCardModal(false);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                >
                  Simpan Gambar ID Card
                </button>
                <button
                  type="button"
                  onClick={() => setShowIdCardModal(false)}
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
