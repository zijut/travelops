import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { packagesApi } from '../services/api';
import { translations } from '../translations';
import { PackageStatus, Package } from '../types';
import { Icon } from './shared/Icon';
import { Card } from './shared/Card';

const getStatusClass = (status: PackageStatus) => {
  switch (status) {
    case PackageStatus.PUBLISHED:
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 dark:bg-emerald-500/15';
    case PackageStatus.DRAFT:
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 dark:bg-amber-500/15';
    case PackageStatus.SOLD_OUT:
      return 'bg-rose-500/10 text-rose-500 border-rose-500/30 dark:bg-rose-500/15';
    default:
      return 'bg-slate-500/10 text-slate-500 border-slate-500/30';
  }
};

const PackageList: React.FC = () => {
  const { isDarkMode, language, packages, setPackages, triggerToast } = useApp();
  const t = translations[language];

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal control states
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

  // Deletion confirm modal state
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDuration, setFormDuration] = useState(12);
  const [formPrice, setFormPrice] = useState(35000000);
  const [formAirline, setFormAirline] = useState('Saudia Airlines');
  const [formHotel, setFormHotel] = useState('5 Bintang');
  const [formQuota, setFormQuota] = useState(50);
  const [formBooked, setFormBooked] = useState(0);
  const [formStatus, setFormStatus] = useState<PackageStatus>(PackageStatus.PUBLISHED);

  const resetForm = () => {
    setFormName('');
    setFormDuration(12);
    setFormPrice(35000000);
    setFormAirline('Saudia Airlines');
    setFormHotel('5 Bintang');
    setFormQuota(50);
    setFormBooked(0);
    setFormStatus(PackageStatus.PUBLISHED);
    setEditingPackage(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormName(pkg.name);
    setFormDuration(pkg.duration);
    setFormPrice(pkg.price);
    setFormAirline(pkg.airline);
    setFormHotel(pkg.hotel);
    setFormQuota(pkg.quota);
    setFormBooked(pkg.booked);
    setFormStatus(pkg.status);
    setIsAddEditOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      triggerToast(language === 'id' ? 'Nama paket tidak boleh kosong!' : 'Package name is required!', 'error');
      return;
    }

    const pkgData = {
      name: formName,
      duration: formDuration,
      price: Number(formPrice),
      airline: formAirline,
      hotel: formHotel,
      quota: Number(formQuota),
      booked: Number(formBooked),
      status: formStatus
    };

    if (editingPackage) {
      // Edit logic
      try {
        const res = await packagesApi.update(editingPackage.id, pkgData);
        if (res.success && res.package) {
          setPackages(packages.map(p => p.id === editingPackage.id ? res.package : p));
        } else {
          setPackages(packages.map(p => p.id === editingPackage.id ? { ...p, ...pkgData } : p));
        }
      } catch (err) {
        setPackages(packages.map(p => p.id === editingPackage.id ? { ...p, ...pkgData } : p));
      }
      triggerToast(t.toastEditPkg.replace('{name}', formName), 'success');
    } else {
      // Add logic
      try {
        const res = await packagesApi.create(pkgData);
        if (res.success && res.package) {
          setPackages([res.package, ...packages]);
        } else {
          const newId = `PKG${String(packages.length + 1).padStart(2, '0')}`;
          setPackages([{ id: newId, ...pkgData }, ...packages]);
        }
      } catch (err) {
        const newId = `PKG${String(packages.length + 1).padStart(2, '0')}`;
        setPackages([{ id: newId, ...pkgData }, ...packages]);
      }
      triggerToast(t.toastAddPkg.replace('{name}', formName), 'success');
    }
    setIsAddEditOpen(false);
    resetForm();
  };

  // Copy Package Logic
  const handleCopy = async (pkg: Package) => {
    const copyData = {
      ...pkg,
      name: `${pkg.name} (${language === 'id' ? 'Salinan' : 'Copy'})`,
      booked: 0,
      status: PackageStatus.DRAFT
    };

    try {
      const res = await packagesApi.create(copyData);
      if (res.success && res.package) {
        setPackages([res.package, ...packages]);
      } else {
        const newId = `PKG${String(packages.length + 1).padStart(2, '0')}`;
        setPackages([{ ...copyData, id: newId }, ...packages]);
      }
    } catch (err) {
      const newId = `PKG${String(packages.length + 1).padStart(2, '0')}`;
      setPackages([{ ...copyData, id: newId }, ...packages]);
    }
    triggerToast(t.toastCopyPkg.replace('{name}', pkg.name), 'success');
  };

  // Delete Package logic
  const handleConfirmDelete = (pkg: Package) => {
    setDeletingPackage(pkg);
  };

  const executeDelete = async () => {
    if (!deletingPackage) return;
    try {
      await packagesApi.delete(deletingPackage.id);
    } catch (err) {}
    setPackages(packages.filter(p => p.id !== deletingPackage.id));
    triggerToast(t.toastDelPkg, 'success');
    setDeletingPackage(null);
  };

  const filteredPackages = packages.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.hotel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 font-sans animate-fade-in text-left">
      
      <Card className={`p-5 border transition-colors duration-200 ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
      }`}>
        {/* Search Header and Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h2 className={`text-base font-extrabold uppercase tracking-wide flex items-center ${
              isDarkMode ? 'text-emerald-450' : 'text-emerald-800'
            }`}>
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              {t.packageTitle}
            </h2>
            <p className="text-[11px] text-gray-400 mt-1">
              {t.totalPackageLabel}: <span className="font-semibold text-emerald-500">{packages.length}</span> | {t.resultsLabel}: {filteredPackages.length}
            </p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors flex items-center self-start sm:self-auto shadow-md shadow-emerald-600/10"
          >
            <Icon name="add" className="h-4 w-4 mr-1.5" />
            {t.buatPaketBaru}
          </button>
        </div>

        {/* Filter Options Bar */}
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
              placeholder={t.cariPaketPlace}
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
              <option value="ALL">{t.semuaPaket}</option>
              {Object.values(PackageStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Catalog Responsive Layout */}
        <div className="hidden md:block overflow-x-auto rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'bg-slate-950/20 border-slate-800 text-slate-400' : 'bg-slate-100/80 border-slate-200 text-slate-600'}`}>
                <th className="px-4 py-3 font-extrabold uppercase tracking-tight">{t.namaPaketDurasi}</th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-tight text-right">{t.hargaPaket}</th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-tight">{t.kapasitasQuota}</th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-tight">{t.maskapaiFlight}</th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-tight text-center">{t.statusPaket}</th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-tight text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400 italic">
                    {language === 'id' ? 'Tidak ada paket yang cocok.' : 'No packages match the criteria.'}
                  </td>
                </tr>
              ) : (
                filteredPackages.map((pkg) => {
                  const percentBooked = Math.min(100, Math.round((pkg.booked / pkg.quota) * 100));
                  return (
                    <tr key={pkg.id} className={`hover:bg-emerald-500/5 transition-all duration-150 ${
                      isDarkMode ? 'hover:bg-slate-850' : 'hover:bg-slate-50/50'
                    }`}>
                      <td className="px-4 py-3.5 font-bold">
                        <span className="block text-slate-950 dark:text-slate-100 font-bold">{pkg.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium mt-1 block">
                          {pkg.duration} {t.durationDays} • Hotel: {pkg.hotel}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-extrabold text-emerald-500 dark:text-emerald-450">
                        Rp {pkg.price.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3.5 min-w-[130px]">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-slate-750 dark:text-slate-300">{pkg.booked}/{pkg.quota} {t.pax}</span>
                            <span className="text-gray-400">{percentBooked}%</span>
                          </div>
                          <div className={`w-24 rounded-full h-1.5 shrink-0 overflow-hidden ${
                            isDarkMode ? 'bg-slate-800' : 'bg-slate-100'
                          }`}>
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${percentBooked}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-3.5 font-semibold ${isDarkMode ? 'text-slate-350' : 'text-slate-600'}`}>{pkg.airline}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black tracking-wide rounded-full border uppercase ${getStatusClass(pkg.status)}`}>
                          {pkg.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex space-x-1.5">
                          <button 
                            onClick={() => handleOpenEdit(pkg)}
                            title={language === 'id' ? 'Ubah' : 'Edit'} 
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isDarkMode ? 'text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-emerald-450' : 'text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-emerald-700'
                            }`}
                          >
                            <Icon name="edit" className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleCopy(pkg)}
                            title={language === 'id' ? 'Salin' : 'Duplicate'} 
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isDarkMode ? 'text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-emerald-450' : 'text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-emerald-700'
                            }`}
                          >
                            <Icon name="copy" className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleConfirmDelete(pkg)}
                            title={language === 'id' ? 'Hapus' : 'Delete'} 
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isDarkMode ? 'text-rose-400 border-rose-950/20 hover:bg-rose-500/10' : 'text-rose-500 border-rose-100 hover:bg-rose-50'
                            }`}
                          >
                            <Icon name="delete" className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Catalog Card Layout for Mobile */}
        <div className="block md:hidden space-y-3">
          {filteredPackages.length === 0 ? (
            <div className="p-10 text-center text-gray-400 italic">
              {language === 'id' ? 'Tidak ada paket yang cocok.' : 'No packages match the criteria.'}
            </div>
          ) : (
            filteredPackages.map((pkg) => {
              const percentBooked = Math.min(100, Math.round((pkg.booked / pkg.quota) * 100));
              return (
                <div key={pkg.id} className={`p-4 rounded-xl border space-y-3 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150 shadow-xs'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="block text-slate-900 dark:text-slate-100 font-bold text-sm leading-tight">{pkg.name}</span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {pkg.duration} {t.durationDays} • Hotel: {pkg.hotel}
                      </span>
                    </div>
                    <span className={`inline-block px-2 py-0.5 text-[9px] font-black tracking-wide rounded-full border uppercase ${getStatusClass(pkg.status)}`}>
                      {pkg.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-450 font-medium">{t.hargaPaket}</span>
                    <span className="font-extrabold text-emerald-500 dark:text-emerald-450">
                      Rp {pkg.price.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-450 font-medium">{t.maskapaiFlight}</span>
                    <span className={`font-semibold ${isDarkMode ? 'text-slate-350' : 'text-slate-600'}`}>{pkg.airline}</span>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-700 dark:text-slate-305">{pkg.booked}/{pkg.quota} {t.pax}</span>
                      <span className="text-gray-400">{percentBooked}%</span>
                    </div>
                    <div className={`w-full rounded-full h-1.5 overflow-hidden bg-slate-100 dark:bg-slate-800`}>
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${percentBooked}%` }}></div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <button 
                      onClick={() => handleOpenEdit(pkg)}
                      className={`p-1.5 px-3 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        isDarkMode ? 'text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-emerald-410' : 'text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-emerald-700'
                      }`}
                    >
                      <Icon name="edit" className="h-3.5 w-3.5" />
                      <span>{language === 'id' ? 'Ubah' : 'Edit'}</span>
                    </button>
                    <button 
                      onClick={() => handleCopy(pkg)}
                      className={`p-1.5 px-3 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        isDarkMode ? 'text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-emerald-410' : 'text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-emerald-700'
                      }`}
                    >
                      <Icon name="copy" className="h-3.5 w-3.5" />
                      <span>{language === 'id' ? 'Salin' : 'Copy'}</span>
                    </button>
                    <button 
                      onClick={() => handleConfirmDelete(pkg)}
                      className={`p-1.5 px-3 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        isDarkMode ? 'text-rose-410 border-rose-950/20 hover:bg-rose-500/10' : 'text-rose-500 border-rose-100 hover:bg-rose-50'
                      }`}
                    >
                      <Icon name="delete" className="h-3.5 w-3.5" />
                      <span>{language === 'id' ? 'Hapus' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* --- ADD/EDIT MODAL --- */}
      {isAddEditOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl border transition-colors duration-250 animate-scale-up ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-850'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 mb-4 dark:border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-500">
                {editingPackage ? t.editFormTitle : t.tambahFormTitle}
              </h3>
              <button 
                onClick={() => setIsAddEditOpen(false)}
                className="text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-gray-400 uppercase tracking-wide">{t.inputNamaPaket}</label>
                <input 
                  type="text" 
                  value={formName} 
                  onChange={(e) => setFormName(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                  placeholder="E.g., Umroh Berkah Ramadhan"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-400 uppercase tracking-wide">{t.inputDurasi}</label>
                  <input 
                    type="number" 
                    value={formDuration} 
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className={`w-full rounded-xl border px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-400 uppercase tracking-wide">{t.inputHarga}</label>
                  <input 
                    type="number" 
                    value={formPrice} 
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className={`w-full rounded-xl border px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-400 uppercase tracking-wide">{t.inputMaskapai}</label>
                  <input 
                    type="text" 
                    value={formAirline} 
                    onChange={(e) => setFormAirline(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                    placeholder="E.g. Saudia"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-400 uppercase tracking-wide">{t.inputHotel}</label>
                  <input 
                    type="text" 
                    value={formHotel} 
                    onChange={(e) => setFormHotel(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-[10px] text-gray-400 uppercase tracking-wide">{t.inputKuota}</label>
                  <input 
                    type="number" 
                    value={formQuota} 
                    onChange={(e) => setFormQuota(Number(e.target.value))}
                    className={`w-full rounded-xl border px-3 h-9 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-[10px] text-gray-400 uppercase tracking-wide">{t.inputBooked}</label>
                  <input 
                    type="number" 
                    value={formBooked} 
                    onChange={(e) => setFormBooked(Number(e.target.value))}
                    className={`w-full rounded-xl border px-3 h-9 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-[10px] text-gray-400 uppercase tracking-wide">{t.inputStatus}</label>
                  <select 
                    value={formStatus} 
                    onChange={(e) => setFormStatus(e.target.value as PackageStatus)}
                    className={`w-full rounded-xl border px-3 h-9 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
                    }`}
                  >
                    <option value={PackageStatus.PUBLISHED} className="bg-slate-900 text-white">{t.published}</option>
                    <option value={PackageStatus.DRAFT} className="bg-slate-900 text-white">{t.draft}</option>
                    <option value={PackageStatus.SOLD_OUT} className="bg-slate-900 text-white">{t.sold_out}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsAddEditOpen(false)}
                  className={`px-4 py-2 rounded-xl border transition-all ${
                    isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
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

      {/* --- CONFIRM DELETE POPUP --- */}
      {deletingPackage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl border text-center transition-colors duration-200 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-150 text-slate-850'
          }`}>
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-rose-500/10 rounded-full flex items-center justify-center text-red-600 mb-4 animate-bounce">
              <Icon name="delete" className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 dark:text-gray-100">
              {t.confirmDeleteTitle}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">
              {t.confirmDeleteDesc.replace('{name}', deletingPackage.name)}
            </p>
            <div className="flex items-center justify-center space-x-3 mt-5">
              <button 
                onClick={() => setDeletingPackage(null)}
                className={`px-4 py-2 rounded-xl border text-xs font-semibold ${
                  isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-gray-300' : 'border-slate-200 hover:bg-slate-100 text-gray-700'
                }`}
              >
                {t.cancel}
              </button>
              <button 
                onClick={executeDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 text-xs font-bold rounded-xl shadow-lg shadow-red-500/10"
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

export default PackageList;
