import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { MOCK_DOA_LIST, MOCK_LUGGAGE_CHECKLIST } from '../../constants';

export const UserManasik: React.FC = () => {
  const { isDarkMode, language, triggerToast } = useApp();

  const [activeTab, setActiveTab] = useState<'doa' | 'packing'>('doa');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [playingDoaId, setPlayingDoaId] = useState<string | null>(null);

  // Packing checklist state
  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem('travelops_user_luggage_checklist');
    if (saved) return JSON.parse(saved);
    return MOCK_LUGGAGE_CHECKLIST;
  });

  const toggleCheck = (id: string) => {
    const updated = checklist.map((item: any) =>
      item.id === id ? { ...item, defaultChecked: !item.defaultChecked } : item
    );
    setChecklist(updated);
    localStorage.setItem('travelops_user_luggage_checklist', JSON.stringify(updated));
  };

  const handlePlayAudio = (doaId: string, title: string) => {
    if (playingDoaId === doaId) {
      setPlayingDoaId(null);
      triggerToast(`Audio ${title} dihentikan`, 'info');
    } else {
      setPlayingDoaId(doaId);
      triggerToast(`Memutar audio lantunan ${title}...`, 'success');
      setTimeout(() => {
        setPlayingDoaId(null);
      }, 5000);
    }
  };

  const t = {
    id: {
      title: 'Buku Doa & Panduan Manasik',
      subtitle: 'Kumpulan doa sahih ibadah Umrah & Haji lengkap dengan audio dan checklist koper',
      tabDoa: 'Buku Saku Doa Digital',
      tabLuggage: 'Checklist Perlengkapan Koper',
      catAll: 'Semua Doa',
      catIhram: 'Ihram & Miqat',
      catThawaf: 'Thawaf Ka\'bah',
      catSai: 'Sa\'i Shofa Marwah',
      tipsLabel: 'Petunjuk Pelaksanaan:',
      playAudio: 'Dengarkan Audio',
      playingAudio: 'Sedang Memutar Audio...'
    },
    en: {
      title: 'Prayer Book & Manasik Guide',
      subtitle: 'Authentic Umrah & Hajj supplications with audio recitations and luggage checklist',
      tabDoa: 'Digital Prayer Book',
      tabLuggage: 'Luggage Gear Checklist',
      catAll: 'All Prayers',
      catIhram: 'Ihram & Miqat',
      catThawaf: 'Tawaf (Kaaba)',
      catSai: 'Sa\'i (Safa & Marwah)',
      tipsLabel: 'Practical Instruction:',
      playAudio: 'Play Audio',
      playingAudio: 'Playing Audio...'
    }
  }[language];

  const filteredDoa = selectedCategory === 'all' 
    ? MOCK_DOA_LIST 
    : MOCK_DOA_LIST.filter(d => d.category === selectedCategory);

  const completedCount = checklist.filter((c: any) => c.defaultChecked).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

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

        {/* Tab switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('doa')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'doa'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📖 {t.tabDoa}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('packing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'packing'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🧳 {t.tabLuggage} ({completedCount}/{checklist.length})
          </button>
        </div>
      </div>

      {activeTab === 'doa' ? (
        /* 1. DIGITAL PRAYER GUIDE TAB */
        <div className="space-y-5">
          
          {/* Category Pill Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: t.catAll },
              { id: 'ihram', label: t.catIhram },
              { id: 'thawaf', label: t.catThawaf },
              { id: 'sai', label: t.catSai }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Doa Cards List */}
          <div className="space-y-4">
            {filteredDoa.map((doa) => {
              const isPlaying = playingDoaId === doa.id;
              return (
                <div
                  key={doa.id}
                  className={`p-6 sm:p-8 rounded-3xl border space-y-4 transition-all ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
                      {doa.category.toUpperCase()}
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(doa.id, doa.title)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                        isPlaying
                          ? 'bg-amber-500 text-slate-950 animate-pulse'
                          : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                      }`}
                    >
                      <span>{isPlaying ? '⏸️' : '🔊'}</span>
                      <span>{isPlaying ? t.playingAudio : t.playAudio}</span>
                    </button>
                  </div>

                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {doa.title}
                  </h2>

                  {/* Arabic text with high aesthetic styling */}
                  <div className="p-4 sm:p-6 rounded-2xl bg-emerald-50/40 dark:bg-slate-950 border border-emerald-100 dark:border-slate-800 text-right">
                    <p className="text-xl sm:text-2xl leading-loose font-arabic text-emerald-900 dark:text-emerald-300 font-bold" dir="rtl">
                      {doa.arabic}
                    </p>
                  </div>

                  {/* Latin Transliteration */}
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Transliterasi Latin:
                    </p>
                    <p className="text-xs sm:text-sm font-semibold italic text-slate-700 dark:text-slate-300 leading-relaxed">
                      "{doa.latin}"
                    </p>
                  </div>

                  {/* Translation */}
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Arti / Terjemahan:
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {doa.translation}
                    </p>
                  </div>

                  {/* Tips info box */}
                  {doa.tips && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center space-x-2 text-amber-800 dark:text-amber-200">
                      <span>💡</span>
                      <span className="text-[11px] font-medium">{doa.tips}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 2. LUGGAGE PACKING CHECKLIST TAB */
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">
                Kemajuan Pengepakan Koper ({completedCount} dari {checklist.length} Siap)
              </h2>
              <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
                {progressPercent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2.5">
            {checklist.map((item: any) => (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  item.defaultChecked
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500/30 text-slate-800 dark:text-white'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-emerald-500/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`h-5 w-5 rounded-lg border flex items-center justify-center text-xs font-bold transition-all ${
                    item.defaultChecked
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                  }`}>
                    {item.defaultChecked && '✓'}
                  </div>
                  <span className={`text-xs font-bold ${item.defaultChecked ? 'line-through text-slate-400' : ''}`}>
                    {item.title}
                  </span>
                </div>

                <span className="text-[9px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded font-mono font-bold text-slate-600 dark:text-slate-300">
                  {item.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
