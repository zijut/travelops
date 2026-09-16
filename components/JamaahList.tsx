import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { jamaahApi } from '../services/api';
import { translations } from '../translations';
import { JamaahStatus, Jamaah } from '../types';
import { Icon } from './shared/Icon';
import { Card } from './shared/Card';

const getStatusClass = (status: JamaahStatus) => {
  switch (status) {
    case JamaahStatus.PAID:
    case JamaahStatus.VISA_APPROVED:
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/35 dark:bg-emerald-500/15';
    case JamaahStatus.BOOKED:
      return 'bg-blue-500/10 text-blue-500 border-blue-500/35 dark:bg-blue-500/15';
    case JamaahStatus.DEPARTED:
      return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/35 dark:bg-indigo-500/15';
    case JamaahStatus.RETURNED:
      return 'bg-purple-500/10 text-purple-500 border-purple-500/35 dark:bg-purple-500/15';
    case JamaahStatus.CANCELLED:
      return 'bg-rose-500/10 text-rose-500 border-rose-500/25 dark:bg-rose-500/15';
    default:
      return 'bg-slate-500/10 text-slate-500 border-slate-500/35';
  }
};

const JamaahList: React.FC = () => {
  const { isDarkMode, language, jamaahList, setJamaahList, packages, triggerToast } = useApp();
  const t = translations[language];

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal controls
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingJamaah, setEditingJamaah] = useState<Jamaah | null>(null);

  // Document Tray control state
  const [inspectingJamaah, setInspectingJamaah] = useState<Jamaah | null>(null);
  
  // Simulated document verification states inside inspecting container
  const [docPassport, setDocPassport] = useState(true);
  const [docVisa, setDocVisa] = useState(false);
  const [docKtp, setDocKtp] = useState(true);
  const [docVaccine, setDocVaccine] = useState(false);

  // Deletion overlay controls
  const [deletingJamaah, setDeletingJamaah] = useState<Jamaah | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPackage, setFormPackage] = useState('');
  const [formKloter, setFormKloter] = useState('Kloter A');
  const [formDeparture, setFormDeparture] = useState('15 Mar 2026');
  const [formStatus, setFormStatus] = useState<JamaahStatus>(JamaahStatus.BOOKED);

  const resetForm = () => {
    setFormName('');
    setFormPackage(packages[0]?.name || 'Umroh Berkah Ramadhan');
    setFormKloter('Kloter A');
    setFormDeparture('15 Mar 2026');
    setFormStatus(JamaahStatus.BOOKED);
    setEditingJamaah(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (jam: Jamaah) => {
    setEditingJamaah(jam);
    setFormName(jam.name);
    setFormPackage(jam.package);
    setFormKloter(jam.kloter);
    setFormDeparture(jam.departureDate);
    setFormStatus(jam.status);
    setIsAddEditOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      triggerToast(language === 'id' ? 'Nama jamaah tidak boleh kosong!' : 'Pilgrim name is required!', 'error');
      return;
    }

    const jamData = {
      name: formName,
      package: formPackage,
      kloter: formKloter,
      departureDate: formDeparture,
      status: formStatus
    };

    if (editingJamaah) {
      // Edit Logic
      try {
        const res = await jamaahApi.update(editingJamaah.id, jamData);
        if (res.success && res.jamaah) {
          setJamaahList(jamaahList.map(j => j.id === editingJamaah.id ? res.jamaah : j));
        } else {
          setJamaahList(jamaahList.map(j => j.id === editingJamaah.id ? { ...j, ...jamData } : j));
        }
      } catch (err) {
        setJamaahList(jamaahList.map(j => j.id === editingJamaah.id ? { ...j, ...jamData } : j));
      }
      triggerToast(t.toastEditJam.replace('{name}', formName), 'success');
    } else {
      // Add Logic
      try {
        const res = await jamaahApi.create(jamData);
        if (res.success && res.jamaah) {
          setJamaahList([res.jamaah, ...jamaahList]);
        } else {
          const newId = `JMH${String(jamaahList.length + 1).padStart(3, '0')}`;
          const randomSeed = Math.floor(Math.random() * 100);
          const gender = randomSeed % 2 === 0 ? 'man' : 'woman';
          setJamaahList([{ id: newId, avatarUrl: `https://picsum.photos/seed/${gender}${randomSeed}/40/40`, ...jamData }, ...jamaahList]);
        }
      } catch (err) {
        const newId = `JMH${String(jamaahList.length + 1).padStart(3, '0')}`;
        const randomSeed = Math.floor(Math.random() * 100);
        const gender = randomSeed % 2 === 0 ? 'man' : 'woman';
        setJamaahList([{ id: newId, avatarUrl: `https://picsum.photos/seed/${gender}${randomSeed}/40/40`, ...jamData }, ...jamaahList]);
      }
      triggerToast(t.toastAddJam.replace('{name}', formName), 'success');
    }
    setIsAddEditOpen(false);
    resetForm();
  };

  // Document Tray Open Helper
  const handleOpenDockInspect = (jam: Jamaah) => {
    setInspectingJamaah(jam);
    // Seed checklist elements dynamically
    setDocPassport(jam.status === JamaahStatus.VISA_APPROVED || jam.status === JamaahStatus.DEPARTED || jam.status === JamaahStatus.RETURNED);
    setDocVisa(jam.status === JamaahStatus.VISA_APPROVED || jam.status === JamaahStatus.DEPARTED || jam.status === JamaahStatus.RETURNED);
    setDocKtp(true);
    setDocVaccine(jam.status === JamaahStatus.DEPARTED || jam.status === JamaahStatus.RETURNED);
  };

  const saveInspectDocs = () => {
    if (!inspectingJamaah) return;
    triggerToast(t.toastDocVerified.replace('{name}', inspectingJamaah.name), 'success');
    setInspectingJamaah(null);
  };

  // Delete Pilgrim overlays
  const handleConfirmDelete = (jam: Jamaah) => {
    setDeletingJamaah(jam);
  };

  const executeDelete = async () => {
    if (!deletingJamaah) return;
    try {
      await jamaahApi.delete(deletingJamaah.id);
    } catch (err) {}
    setJamaahList(jamaahList.filter(j => j.id !== deletingJamaah.id));
    triggerToast(t.toastDelJam, 'success');
    setDeletingJamaah(null);
  };

  const filteredJamaah = jamaahList.filter(j => {
    const matchesSearch = j.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          j.package.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          j.kloter.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 font-sans animate-fade-in text-left">
      
      <Card className={`p-4.5 border transition-colors duration-200 ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
      }`}>
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h2 className={`text-base font-extrabold uppercase tracking-wide flex items-center ${
              isDarkMode ? 'text-emerald-450' : 'text-emerald-800'
            }`}>
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t.jamaahTitle}
            </h2>
            <p className="text-[11px] text-gray-400 mt-1">
              {t.totalJamaahLabel}: <span className="font-semibold text-emerald-500">{jamaahList.length}</span> | {t.resultsLabel}: {filteredJamaah.length}
            </p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors flex items-center self-start sm:self-auto shadow-md shadow-emerald-600/10"
          >
            <Icon name="add" className="h-4 w-4 mr-1.5" />
            {t.tambahJamaahBaru}
          </button>
        </div>

        {/* Dynamic Navigation Filter Bar */}
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 p-3 rounded-xl border ${
          isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <svg className="h-4 w-4 opacity-55" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder={t.cariJamaahPlace}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full border rounded-xl px-3 py-1.5 pl-9 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-850'
              }`}
            />
          </div>
          <div className="flex items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`border rounded-xl px-3 py-1.5 text-xs cursor-pointer focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-850'
              }`}
            >
              <option value="ALL">{t.semuaStatusJamaah}</option>
              {Object.values(JamaahStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Database Responsive Layout */}
        <div className="hidden md:block overflow-x-auto rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'bg-slate-950/25 border-slate-800 text-slate-400' : 'bg-slate-100/80 border-slate-200 text-slate-600'}`}>
                <th className="px-4 py-3 font-extrabold uppercase tracking-tight">{t.namaJamaah}</th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-tight">{t.paketUmroh}</th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-tight">{t.kloterKeberangkatan}</th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-tight text-center">{t.statusJamaah}</th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-tight text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredJamaah.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400 italic">
                    {language === 'id' ? 'Tidak ada jamaah terdaftar dengan kriteria ini.' : 'No registered pilgrims found matching your criteria.'}
                  </td>
                </tr>
              ) : (
                filteredJamaah.map((jamaah) => (
                  <tr key={jamaah.id} className={`hover:bg-emerald-500/5 transition-all duration-150 ${
                    isDarkMode ? 'hover:bg-slate-850' : 'hover:bg-slate-50/50'
                  }`}>
                    {/* User profile with avatar and details */}
                    <td className="px-4 py-3 flex items-center space-x-3">
                      <img 
                        referrerPolicy="no-referrer"
                        src={jamaah.avatarUrl} 
                        alt={jamaah.name} 
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-emerald-500/20 shrink-0 shadow-sm" 
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-950 dark:text-slate-100 block truncate">{jamaah.name}</span>
                        <span className="text-[9px] text-gray-400 font-semibold tracking-wider">ID: {jamaah.id}</span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-650'}`}>
                      {jamaah.package}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold block ${isDarkMode ? 'text-slate-200' : 'text-slate-755'}`}>{jamaah.kloter}</span>
                      <span className="text-[10px] text-gray-400 mt-0.5 block">{jamaah.departureDate}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black tracking-wide rounded-full border uppercase ${getStatusClass(jamaah.status)}`}>
                        {jamaah.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex space-x-1.5">
                        <button 
                          onClick={() => handleOpenEdit(jamaah)}
                          title={language === 'id' ? 'Ubah' : 'Edit'} 
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isDarkMode ? 'text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-emerald-450' : 'text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-emerald-700'
                          }`}
                        >
                          <Icon name="edit" className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenDockInspect(jamaah)}
                          title={t.lihatDokumen} 
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isDarkMode ? 'text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-emerald-450' : 'text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-emerald-700'
                          }`}
                        >
                          <Icon name="document" className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleConfirmDelete(jamaah)}
                          title={language === 'id' ? 'Hapus' : 'Delete'} 
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isDarkMode ? 'text-rose-450 border-rose-950/20 hover:bg-rose-500/10' : 'text-rose-500 border-rose-100 hover:bg-rose-50'
                          }`}
                        >
                          <Icon name="delete" className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Database Card Layout for Mobile */}
        <div className="block md:hidden space-y-3">
          {filteredJamaah.length === 0 ? (
            <div className="p-10 text-center text-gray-400 italic">
              {language === 'id' ? 'Tidak ada jamaah terdaftar dengan kriteria ini.' : 'No registered pilgrims found matching your criteria.'}
            </div>
          ) : (
            filteredJamaah.map((jamaah) => (
              <div key={jamaah.id} className={`p-4 rounded-xl border space-y-3.5 ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150 shadow-xs'
              }`}>
                {/* Visual Header */}
                <div className="flex items-center space-x-3">
                  <img 
                    referrerPolicy="no-referrer"
                    src={jamaah.avatarUrl} 
                    alt={jamaah.name} 
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/10 shrink-0 shadow-sm" 
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block truncate text-sm">{jamaah.name}</span>
                    <span className="text-[10px] text-gray-400 font-semibold tracking-wider">ID: {jamaah.id}</span>
                  </div>
                  <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black tracking-wide rounded-full border uppercase ${getStatusClass(jamaah.status)}`}>
                    {jamaah.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 dark:border-slate-800/60 pt-2.5">
                  <div>
                    <span className="text-gray-450 block text-[10px] uppercase font-bold tracking-wider">{t.paketUmroh}</span>
                    <span className={`font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-full`}>{jamaah.package}</span>
                  </div>
                  <div>
                    <span className="text-gray-450 block text-[10px] uppercase font-bold tracking-wider">{t.kloterKeberangkatan}</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 block">{jamaah.kloter}</span>
                    <span className="text-[10px] text-gray-400 font-medium block">{jamaah.departureDate}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <button 
                    onClick={() => handleOpenEdit(jamaah)}
                    className={`p-1.5 px-3 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      isDarkMode ? 'text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-emerald-410' : 'text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-emerald-700'
                    }`}
                  >
                    <Icon name="edit" className="h-3.5 w-3.5" />
                    <span>{language === 'id' ? 'Ubah' : 'Edit'}</span>
                  </button>
                  <button 
                    onClick={() => handleOpenDockInspect(jamaah)}
                    className={`p-1.5 px-3 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      isDarkMode ? 'text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-emerald-410' : 'text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-emerald-700'
                    }`}
                  >
                    <Icon name="document" className="h-3.5 w-3.5" />
                    <span>{language === 'id' ? 'Dokumen' : 'Doc'}</span>
                  </button>
                  <button 
                    onClick={() => handleConfirmDelete(jamaah)}
                    className={`p-1.5 px-3 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      isDarkMode ? 'text-rose-410 border-rose-950/20 hover:bg-rose-500/10' : 'text-rose-500 border-rose-100 hover:bg-rose-50'
                    }`}
                  >
                    <Icon name="delete" className="h-3.5 w-3.5" />
                    <span>{language === 'id' ? 'Hapus' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* --- ADD/EDIT PILGRIM FORMS --- */}
      {isAddEditOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border transition-colors duration-200 animate-scale-up ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-150 text-slate-850'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 mb-4 dark:border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-500">
                {editingJamaah ? t.editJamTitle.replace('{name}', editingJamaah.name) : t.tambahJamTitle}
              </h3>
              <button onClick={() => setIsAddEditOpen(false)} className="text-gray-400 hover:text-rose-500 transition-colors">
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-gray-400 uppercase tracking-wide">{t.inputNamaJam}</label>
                <input 
                  type="text" 
                  value={formName} 
                  onChange={(e) => setFormName(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                  placeholder="E.g. Nurul Izzah"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-400 uppercase tracking-wide">{t.inputPaketJam}</label>
                <select 
                  value={formPackage} 
                  onChange={(e) => setFormPackage(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {packages.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-400 uppercase tracking-wide">{t.inputKloterJam}</label>
                  <select 
                    value={formKloter} 
                    onChange={(e) => setFormKloter(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="Kloter A">Kloter A</option>
                    <option value="Kloter B">Kloter B</option>
                    <option value="Kloter C">Kloter C</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="block font-bold text-gray-400 uppercase tracking-wide">{t.inputTglJam}</label>
                  <input 
                    type="text" 
                    value={formDeparture} 
                    onChange={(e) => setFormDeparture(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                    placeholder="E.g., 15 Mar 2026"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-400 uppercase tracking-wide">{t.inputStatusJam}</label>
                <select 
                  value={formStatus} 
                  onChange={(e) => setFormStatus(e.target.value as JamaahStatus)}
                  className={`w-full rounded-xl border px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {Object.values(JamaahStatus).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsAddEditOpen(false)}
                  className={`px-4 py-2 rounded-xl border ${
                    isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-350' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 font-bold rounded-xl shadow-md transition-colors"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LIHAT DOKUMEN (DOCUMENT AUDIT TRAY) --- */}
      {inspectingJamaah && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl border transition-colors duration-200 animate-scale-up ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-150 text-slate-850'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 mb-4 dark:border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-500">
                {t.dokumenTitle.replace('{name}', inspectingJamaah.name)}
              </h3>
              <button onClick={() => setInspectingJamaah(null)} className="text-gray-400 hover:text-rose-500 cursor-pointer">
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>

            <p className="text-[11px] text-gray-400 mb-4">{t.dokumenLabel}</p>

            <div className="space-y-3.5 text-xs">
              
              {/* Passport */}
              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 cursor-pointer hover:bg-emerald-500/5">
                <div className="flex items-center space-x-2.5">
                  <input 
                    type="checkbox" 
                    checked={docPassport} 
                    onChange={(e) => setDocPassport(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="font-semibold text-slate-750 dark:text-slate-200">{t.pasporStatus}</span>
                </div>
                <span className={`text-[10px] font-bold ${docPassport ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {docPassport ? t.statusSesuai : t.statusBelum}
                </span>
              </label>

              {/* Visa */}
              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 cursor-pointer hover:bg-emerald-500/5">
                <div className="flex items-center space-x-2.5">
                  <input 
                    type="checkbox" 
                    checked={docVisa} 
                    onChange={(e) => setDocVisa(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="font-semibold text-slate-750 dark:text-slate-200">{t.visaStatus}</span>
                </div>
                <span className={`text-[10px] font-bold ${docVisa ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {docVisa ? t.statusSesuai : t.statusBelum}
                </span>
              </label>

              {/* Identity Card */}
              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 cursor-pointer hover:bg-emerald-500/5">
                <div className="flex items-center space-x-2.5">
                  <input 
                    type="checkbox" 
                    checked={docKtp} 
                    onChange={(e) => setDocKtp(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="font-semibold text-slate-750 dark:text-slate-200">{t.ktpStatus}</span>
                </div>
                <span className={`text-[10px] font-bold ${docKtp ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {docKtp ? t.statusSesuai : t.statusBelum}
                </span>
              </label>

              {/* Meningitis Vaccine */}
              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 cursor-pointer hover:bg-emerald-500/5">
                <div className="flex items-center space-x-2.5">
                  <input 
                    type="checkbox" 
                    checked={docVaccine} 
                    onChange={(e) => setDocVaccine(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="font-semibold text-slate-750 dark:text-slate-200">{t.vaksinStatus}</span>
                </div>
                <span className={`text-[10px] font-bold ${docVaccine ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {docVaccine ? t.statusSesuai : t.statusBelum}
                </span>
              </label>

            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t dark:border-slate-800 mt-5">
              <button 
                onClick={() => setInspectingJamaah(null)}
                className={`px-4 py-2 rounded-xl border ${
                  isDarkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                }`}
              >
                {t.close}
              </button>
              <button 
                onClick={saveInspectDocs}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 font-bold rounded-xl shadow-md transition-colors"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRM DELETE OVERLAY --- */}
      {deletingJamaah && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl border text-center transition-colors duration-200 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-150 text-slate-850'
          }`}>
            <div className="mx-auto w-12 h-12 bg-rose-100 dark:bg-rose-500/10 rounded-full flex items-center justify-center text-rose-650 mb-4 animate-bounce">
              <Icon name="delete" className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 dark:text-gray-100">
              {t.confirmDeleteTitle}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">
              {t.confirmDeleteJamDesc.replace('{name}', deletingJamaah.name)}
            </p>
            <div className="flex items-center justify-center space-x-3 mt-5">
              <button 
                onClick={() => setDeletingJamaah(null)}
                className={`px-4 py-2 rounded-xl border text-xs font-semibold ${
                  isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-gray-300' : 'border-slate-200 hover:bg-slate-100 text-gray-700'
                }`}
              >
                {t.cancel}
              </button>
              <button 
                onClick={executeDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 text-xs font-bold rounded-xl shadow-lg shadow-rose-500/10"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default JamaahList;
