import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { MOCK_ITINERARY } from '../../constants';

export const UserItinerary: React.FC = () => {
  const { isDarkMode, language } = useApp();

  const [selectedDay, setSelectedDay] = useState<number>(1);

  const t = {
    id: {
      title: 'Jadwal & Itinerary Perjalanan',
      subtitle: 'Panduan waktu, agenda ibadah, dan kegiatan harian selama di Tanah Suci',
      dayTab: 'Hari ke-',
      dressCode: 'Ketentuan Busana / Dress Code',
      importantNotes: 'Catatan & Perlengkapan Penting',
      prayerTimesTitle: 'Waktu Sholat Hari Ini (Waktu Arab Saudi - AST)',
      fajr: 'Subuh',
      dhuhr: 'Dzuhur',
      asr: 'Ashar',
      maghrib: 'Maghrib',
      isha: 'Isya'
    },
    en: {
      title: 'Journey Schedule & Itinerary',
      subtitle: 'Timetable, prayer routines, and daily activities in the Holy Land',
      dayTab: 'Day ',
      dressCode: 'Dress Code Guidelines',
      importantNotes: 'Important Notes & Gear',
      prayerTimesTitle: 'Today Prayer Times (Saudi Arabia Standard Time - AST)',
      fajr: 'Fajr',
      dhuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha'
    }
  }[language];

  const currentDayData = MOCK_ITINERARY.find(d => d.day === selectedDay) || MOCK_ITINERARY[0];

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

      {/* 1. LIVE PRAYER TIMES WIDGET (MAKKAH / MADINAH) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 border border-emerald-500/30 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🕌</span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
              {t.prayerTimesTitle}
            </span>
          </div>
          <span className="text-[10px] font-mono bg-white/10 px-2.5 py-1 rounded-full text-slate-200">
            Zona Waktu: Makkah (UTC+3)
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[9px] uppercase text-emerald-200 font-bold">{t.fajr}</p>
            <p className="text-sm sm:text-base font-black font-mono text-white mt-0.5">05:18</p>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[9px] uppercase text-emerald-200 font-bold">{t.dhuhr}</p>
            <p className="text-sm sm:text-base font-black font-mono text-white mt-0.5">12:32</p>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[9px] uppercase text-emerald-200 font-bold">{t.asr}</p>
            <p className="text-sm sm:text-base font-black font-mono text-white mt-0.5">15:54</p>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[9px] uppercase text-emerald-200 font-bold">{t.maghrib}</p>
            <p className="text-sm sm:text-base font-black font-mono text-white mt-0.5">18:29</p>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[9px] uppercase text-emerald-200 font-bold">{t.isha}</p>
            <p className="text-sm sm:text-base font-black font-mono text-white mt-0.5">19:59</p>
          </div>
        </div>
      </div>

      {/* 2. DAY SELECTOR BUTTONS STRIP */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {MOCK_ITINERARY.map((dayItem) => {
          const isActive = dayItem.day === selectedDay;
          return (
            <button
              key={dayItem.day}
              type="button"
              onClick={() => setSelectedDay(dayItem.day)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black shrink-0 transition-all cursor-pointer ${isActive
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 scale-[1.03]'
                  : isDarkMode
                    ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
                }`}
            >
              <span>{t.dayTab} {dayItem.day}</span>
              <span className={`block text-[9px] font-normal ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                {dayItem.date}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. SELECTED DAY DETAILS & TIMELINE */}
      <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>

        {/* Day Headline */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md">
              Hari ke-{currentDayData.day}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {currentDayData.date}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
            {currentDayData.title}
          </h2>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center space-x-1">
            <span>📍</span>
            <span>{currentDayData.location}</span>
          </p>
        </div>

        {/* Dress code & Important notes cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-1">
            <p className="text-[10px] uppercase font-black tracking-wider text-amber-700 dark:text-amber-300">
              👔 {t.dressCode}
            </p>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {currentDayData.dressCode || 'Pakaian Sopan Bebas Rapi'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-1">
            <p className="text-[10px] uppercase font-black tracking-wider text-emerald-700 dark:text-emerald-300">
              📌 {t.importantNotes}
            </p>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {currentDayData.notes || 'Selalu jaga wudhu dan tetap bersama rombongan kloter.'}
            </p>
          </div>
        </div>

        {/* Chronological Schedule Activities */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Rundown Kegiatan Lengkap:
          </h3>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-500/30">
            {currentDayData.activities.map((activity, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline Dot */}
                <span className="absolute -left-6 top-1.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 group-hover:scale-125 transition-transform" />

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1 hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {activity.time}
                    </span>
                    <span className="text-[10px] text-slate-400">Tahap #{idx + 1}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
