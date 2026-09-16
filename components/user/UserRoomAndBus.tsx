import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { JAMAAH_MOCK } from '../../constants';

export const UserRoomAndBus: React.FC = () => {
  const { isDarkMode, language, activeJamaah, triggerToast } = useApp();

  const jamaah = activeJamaah || JAMAAH_MOCK[0];

  const t = {
    id: {
      title: 'Kamar Hotel & Kursi Bus Saya',
      subtitle: 'Informasi alokasi akomodasi hotel di Makkah & Madinah serta denah kursi bus pariwisata',
      makkahHotel: 'Hotel Makkah Al-Mukarramah',
      madinahHotel: 'Hotel Madinah Al-Munawwarah',
      roomNumber: 'Nomor Kamar',
      roomType: 'Tipe Kamar',
      roommates: 'Teman Sekamar',
      busTitle: 'Alokasi Bus Pariwisata VIP',
      busNo: 'Nomor Armada Bus',
      mySeatNumber: 'Nomor Kursi Anda',
      seatMapTitle: 'Denah Posisi Tempat Duduk Bus',
      driverInfo: 'Supir & Mutawwif Bus',
      seatLegendMine: 'Kursi Anda',
      seatLegendOccupied: 'Jemaah Lain',
      seatLegendEmpty: 'Kosong',
      toastChangeRequest: 'Permintaan penyesuaian kamar/kursi telah dikirim ke tim operasional!'
    },
    en: {
      title: 'My Hotel Room & Bus Seat',
      subtitle: 'Accommodation details in Makkah & Madinah plus live bus seating map',
      makkahHotel: 'Makkah Hotel',
      madinahHotel: 'Madinah Hotel',
      roomNumber: 'Room Number',
      roomType: 'Room Type',
      roommates: 'Roommates',
      busTitle: 'VIP Tour Bus Allocation',
      busNo: 'Fleet / Bus Number',
      mySeatNumber: 'Your Seat Number',
      seatMapTitle: 'Bus Seating Layout Map',
      driverInfo: 'Driver & Bus Mutawwif',
      seatLegendMine: 'Your Seat',
      seatLegendOccupied: 'Other Pilgrim',
      seatLegendEmpty: 'Empty',
      toastChangeRequest: 'Adjustment request sent to operations team!'
    }
  }[language];

  // Roommates simulation for Ahmad Subagja in Room 101 Quad
  const roommates = [
    { name: 'Ahmad Subagja (Anda)', id: 'JMH001', seat: 1, avatar: 'https://picsum.photos/seed/man1/100/100', phone: '+62 812-1111-2222' },
    { name: 'Budi Santoso', id: 'JMH003', seat: 2, avatar: 'https://picsum.photos/seed/man2/100/100', phone: '+62 812-5555-6666' },
    { name: 'H. Ridwan Kamil', id: 'JMH007', seat: 3, avatar: 'https://picsum.photos/seed/man4/100/100', phone: '+62 811-9988-1122' },
    { name: 'Moch. Rafly', id: 'JMH008', seat: 4, avatar: 'https://picsum.photos/seed/man5/100/100', phone: '+62 813-8877-3344' }
  ];

  const mySeat = jamaah.busSeatNumber || 1;

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
          onClick={() => triggerToast(t.toastChangeRequest, 'info')}
          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-bold transition-all cursor-pointer"
        >
          🔄 Request Tukar Kamar / Kursi
        </button>
      </div>

      {/* 1. HOTEL ACCOMMODATIONS (MAKKAH & MADINAH) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Makkah Hotel Card */}
        <div className={`p-6 rounded-3xl border space-y-4 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🕋</span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {t.makkahHotel}
                </span>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  {jamaah.hotelMakkah || 'Anjum Hotel Makkah (5★)'}
                </h2>
              </div>
            </div>
            <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-black px-2.5 py-1 rounded-xl">
              50m ke Masjidil Haram
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">{t.roomNumber}</p>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                {jamaah.roomMakkah || 'Room 101'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">{t.roomType}</p>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
                {jamaah.roomType || 'Quad'} (Sekamar Ber-4)
              </p>
            </div>
          </div>

          {/* Roommates List */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              {t.roommates} ({roommates.length} Orang):
            </p>
            <div className="space-y-2">
              {roommates.map((rm, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center space-x-2.5">
                    <img src={rm.avatar} alt={rm.name} className="h-8 w-8 rounded-full object-cover border" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {rm.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">{rm.id} • Kursi #{rm.seat}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    {rm.phone}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Madinah Hotel Card */}
        <div className={`p-6 rounded-3xl border space-y-4 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🕌</span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  {t.madinahHotel}
                </span>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  {jamaah.hotelMadinah || 'Pullman Zamzam Madinah (5★)'}
                </h2>
              </div>
            </div>
            <span className="bg-teal-500/15 text-teal-600 dark:text-teal-400 text-xs font-black px-2.5 py-1 rounded-xl">
              Depan Pelataran Nabawi
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">{t.roomNumber}</p>
              <p className="text-lg font-black text-teal-600 dark:text-teal-400 font-mono mt-0.5">
                {jamaah.roomMadinah || 'Room 304'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">{t.roomType}</p>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
                {jamaah.roomType || 'Quad'} (Sekamar Ber-4)
              </p>
            </div>
          </div>

          {/* Hotel Facilities & Meal Info */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <p className="font-bold text-slate-800 dark:text-slate-200">🍽️ Paket Makan & Fasilitas Hotel:</p>
            <ul className="text-slate-500 dark:text-slate-400 space-y-1 list-disc pl-4 text-[11px]">
              <li>Makan 3x Sehari Prasmanan Menu Masakan Indonesia (Fullboard).</li>
              <li>Free Wi-Fi berkecepatan tinggi di seluruh area kamar dan lobi hotel.</li>
              <li>Layanan laundry 4 potong pakaian per hari disediakan travel.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. BUS PARIWISATA & INTERACTIVE SEAT MAP */}
      <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
              {t.busTitle}
            </span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {jamaah.busNumber || 'Bus VIP 01 (Al-Haramain Travelops)'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Mutawwif: <strong>Ustadz Syakir</strong> • Driver: <strong>Syekh Tariq (Saudi Saptco VIP)</strong>
            </p>
          </div>

          <div className="bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-center shadow-md">
            <span className="block text-[9px] uppercase font-bold text-emerald-100">{t.mySeatNumber}</span>
            <span className="text-2xl font-black font-mono">Kursi #{mySeat}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded bg-emerald-500 border border-emerald-600 shadow-xs" />
            <span className="font-bold text-slate-700 dark:text-slate-200">{t.seatLegendMine}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded bg-slate-300 dark:bg-slate-700 border" />
            <span className="text-slate-500 dark:text-slate-400">{t.seatLegendOccupied}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded bg-slate-100 dark:bg-slate-900 border border-dashed" />
            <span className="text-slate-400">{t.seatLegendEmpty}</span>
          </div>
        </div>

        {/* Visual Interactive 45-Seat Bus Layout */}
        <div className="max-w-xl mx-auto p-6 rounded-3xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 relative">
          
          {/* Front of the Bus indicator */}
          <div className="text-center border-b-2 border-dashed border-slate-300 dark:border-slate-800 pb-3 mb-5 flex items-center justify-between text-xs font-bold text-slate-400">
            <span>🚪 Pintu Masuk Depan</span>
            <span className="bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full text-[10px]">DEPAN BUS (DRIVER & MUTAWWIF)</span>
            <span>💺 Supir</span>
          </div>

          {/* Seating Grid (2 Seats Left - Aisle - 2 Seats Right) */}
          <div className="space-y-3">
            {[1, 5, 9, 13, 17, 21, 25, 29, 33, 37].map((rowStart) => (
              <div key={rowStart} className="flex items-center justify-between">
                
                {/* Left 2 seats */}
                <div className="flex space-x-2">
                  {[rowStart, rowStart + 1].map((seatNo) => {
                    const isMySeat = seatNo === mySeat;
                    return (
                      <div
                        key={seatNo}
                        className={`h-11 w-11 rounded-xl flex flex-col items-center justify-center font-bold text-xs transition-all shadow-xs ${
                          isMySeat
                            ? 'bg-emerald-500 text-white ring-4 ring-emerald-400/40 scale-110 font-black z-10'
                            : seatNo <= 36
                              ? 'bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-400/30'
                              : 'bg-white dark:bg-slate-900 text-slate-400 border border-dashed border-slate-300 dark:border-slate-700'
                        }`}
                        title={isMySeat ? 'Kursi Anda' : `Kursi #${seatNo}`}
                      >
                        <span className="text-[10px] font-mono">#{seatNo}</span>
                        <span className="text-[8px]">{isMySeat ? 'ANDA' : 'Pax'}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Center Aisle */}
                <div className="w-10 text-center text-[9px] text-slate-300 dark:text-slate-700 font-mono select-none">
                  LORONG
                </div>

                {/* Right 2 seats */}
                <div className="flex space-x-2">
                  {[rowStart + 2, rowStart + 3].map((seatNo) => {
                    const isMySeat = seatNo === mySeat;
                    return (
                      <div
                        key={seatNo}
                        className={`h-11 w-11 rounded-xl flex flex-col items-center justify-center font-bold text-xs transition-all shadow-xs ${
                          isMySeat
                            ? 'bg-emerald-500 text-white ring-4 ring-emerald-400/40 scale-110 font-black z-10'
                            : seatNo <= 36
                              ? 'bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-400/30'
                              : 'bg-white dark:bg-slate-900 text-slate-400 border border-dashed border-slate-300 dark:border-slate-700'
                        }`}
                        title={isMySeat ? 'Kursi Anda' : `Kursi #${seatNo}`}
                      >
                        <span className="text-[10px] font-mono">#{seatNo}</span>
                        <span className="text-[8px]">{isMySeat ? 'ANDA' : 'Pax'}</span>
                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>

          {/* Back of the Bus */}
          <div className="text-center border-t-2 border-dashed border-slate-300 dark:border-slate-800 pt-3 mt-5 text-[10px] font-bold text-slate-400">
            BELAKANG BUS (BAGASI KABIN & TOILET DARURAT)
          </div>
        </div>
      </div>
    </div>
  );
};
