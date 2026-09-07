import React, { useState, useEffect } from 'react';
import { Card } from './shared/Card';
import { Icon } from './shared/Icon';
import { useApp } from '../AppContext';
import { JamaahStatus, Jamaah } from '../types';

interface VisaDocumentState {
  passport: 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
  visa: 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
  ktp: 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
  vaccine: 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
  passportNumber: string;
}

const LOCAL_TRANSLATIONS = {
  id: {
    title: 'Pusat Manajemen Visa & Dokumen',
    subtitle: 'Pantau verifikasi paspor, pengajuan visa muassasah, identitas KTP, dan sertifikat vaksin meningitis.',
    searchPlaceholder: 'Cari nama jemaah, nomor paspor, atau paket...',
    filterGroup: 'Filter Kelompok (Kloter)',
    filterStatus: 'Fitur Status',
    totalVisa: 'Total Pengajuan',
    visaApproved: 'Visa Disetujui',
    visaPending: 'Visa Diproses',
    visaRejected: 'Visa Ditolak',
    noData: 'Tidak ada data pengajuan visa.',
    jamaahName: 'Nama Jemaah & Paspor',
    kloter: 'Kelompok / Paket',
    passport: 'Paspor',
    visa: 'Visa Umrah',
    ktp: 'KTP / ID',
    vaccine: 'Vaksin',
    action: 'Tindakan',
    autoClear: 'Clearance Muqeem',
    downloadEVisa: 'E-Visa PDF',
    uploadScan: 'Unggah Scan',
    verifyAll: 'Verifikasi Semua',
    toastCleared: 'Pengajuan visa untuk {name} berhasil disetujui di Portal Muqeem!',
    toastDocUploaded: 'Scan dokumen berhasil diunggah untuk {name}!',
    toastDownload: 'Mengunduh berkas E-Visa untuk {name}...',
    exportLabel: 'Ekspor Manifes',
    processing: 'Memproses...',
    statusCleared: 'Telah Bersih'
  },
  en: {
    title: 'Visa & Document Management Center',
    subtitle: 'Monitor passport verification, muassasah visa filings, ID cards, and meningitis vaccine verification status.',
    searchPlaceholder: 'Search pilgrim name, passport number, or package...',
    filterGroup: 'Filter Group (Kloter)',
    filterStatus: 'Status Filter',
    totalVisa: 'Total Applications',
    visaApproved: 'Visa Approved',
    visaPending: 'Visa Pending',
    visaRejected: 'Visa Rejected',
    noData: 'No visa files matching search criteria.',
    jamaahName: 'Pilgrim & Passport Info',
    kloter: 'Group / Package',
    passport: 'Passport',
    visa: 'Umrah Visa',
    ktp: 'ID Card (KTP)',
    vaccine: 'Vaccine',
    action: 'Actions',
    autoClear: 'Muqeem Clearance',
    downloadEVisa: 'E-Visa PDF',
    uploadScan: 'Upload Scan',
    verifyAll: 'Verify All',
    toastCleared: 'Visa application for {name} approved successfully on Muqeem Portal!',
    toastDocUploaded: 'Document scan uploaded successfully for {name}!',
    toastDownload: 'Downloading E-Visa document for {name}...',
    exportLabel: 'Export Manifest',
    processing: 'Processing...',
    statusCleared: 'Cleared'
  }
};

const VisaCenter: React.FC = () => {
  const { jamaahList, setJamaahList, isDarkMode, language, triggerToast, currentUser } = useApp();
  const t = LOCAL_TRANSLATIONS[language];
  const currentEmail = currentUser?.email || '';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKloter, setSelectedKloter] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Load document status registry from local storage or seed
  const [docRegistry, setDocRegistry] = useState<{ [id: string]: VisaDocumentState }>(() => {
    if (!currentEmail) return {};
    const saved = localStorage.getItem(`travelops_visa_documents_v2_${currentEmail}`);
    if (saved) return JSON.parse(saved);

    // Initial seeding based on existing jamaahList
    const initial: { [id: string]: VisaDocumentState } = {};
    if (currentEmail === 'abdullah@alharamain.id') {
      jamaahList.forEach((j, index) => {
        const isApproved = j.status === JamaahStatus.VISA_APPROVED || j.status === JamaahStatus.DEPARTED || j.status === JamaahStatus.RETURNED;
        initial[j.id] = {
          passport: isApproved ? 'VERIFIED' : (index % 3 === 0 ? 'SUBMITTED' : 'PENDING'),
          visa: isApproved ? 'VERIFIED' : 'PENDING',
          ktp: 'VERIFIED',
          vaccine: isApproved ? 'VERIFIED' : (index % 2 === 0 ? 'VERIFIED' : 'PENDING'),
          passportNumber: `A${1234500 + index}`
        };
      });
    }
    return initial;
  });

  // Reload registry when user changes
  useEffect(() => {
    if (currentEmail) {
      const saved = localStorage.getItem(`travelops_visa_documents_v2_${currentEmail}`);
      if (saved) {
        setDocRegistry(JSON.parse(saved));
      } else {
        const initial: { [id: string]: VisaDocumentState } = {};
        if (currentEmail === 'abdullah@alharamain.id') {
          jamaahList.forEach((j, index) => {
            const isApproved = j.status === JamaahStatus.VISA_APPROVED || j.status === JamaahStatus.DEPARTED || j.status === JamaahStatus.RETURNED;
            initial[j.id] = {
              passport: isApproved ? 'VERIFIED' : (index % 3 === 0 ? 'SUBMITTED' : 'PENDING'),
              visa: isApproved ? 'VERIFIED' : 'PENDING',
              ktp: 'VERIFIED',
              vaccine: isApproved ? 'VERIFIED' : (index % 2 === 0 ? 'VERIFIED' : 'PENDING'),
              passportNumber: `A${1234500 + index}`
            };
          });
        }
        setDocRegistry(initial);
      }
    } else {
      setDocRegistry({});
    }
  }, [currentEmail, jamaahList]);

  // Sync to local storage
  useEffect(() => {
    if (currentEmail) {
      localStorage.setItem(`travelops_visa_documents_v2_${currentEmail}`, JSON.stringify(docRegistry));
    }
  }, [docRegistry, currentEmail]);

  // Handle document state change
  const handleDocStatusChange = (
    jamaahId: string, 
    docType: 'passport' | 'visa' | 'ktp' | 'vaccine', 
    newStatus: 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED'
  ) => {
    setDocRegistry(prev => {
      const updated = {
        ...prev,
        [jamaahId]: {
          ...prev[jamaahId],
          [docType]: newStatus
        }
      };

      // Automatically sync JamaahStatus state if visa is verified
      if (docType === 'visa' && newStatus === 'VERIFIED') {
        const matchingJamaah = jamaahList.find(j => j.id === jamaahId);
        if (matchingJamaah && matchingJamaah.status !== JamaahStatus.VISA_APPROVED) {
          setJamaahList(prevJam => prevJam.map(pj => pj.id === jamaahId ? { ...pj, status: JamaahStatus.VISA_APPROVED } : pj));
        }
      } else if (docType === 'visa' && newStatus !== 'VERIFIED') {
        const matchingJamaah = jamaahList.find(j => j.id === jamaahId);
        if (matchingJamaah && matchingJamaah.status === JamaahStatus.VISA_APPROVED) {
          setJamaahList(prevJam => prevJam.map(pj => pj.id === jamaahId ? { ...pj, status: JamaahStatus.PAID } : pj));
        }
      }

      return updated;
    });
  };

  // Muqeem Portal Simulated Clearance
  const runMuqeemClearance = (jam: Jamaah) => {
    setProcessingId(jam.id);
    setTimeout(() => {
      setDocRegistry(prev => ({
        ...prev,
        [jam.id]: {
          ...prev[jam.id],
          passport: 'VERIFIED',
          visa: 'VERIFIED',
          vaccine: 'VERIFIED'
        }
      }));

      // Update global pilgrim list
      setJamaahList(prev => prev.map(pj => pj.id === jam.id ? { ...pj, status: JamaahStatus.VISA_APPROVED } : pj));
      
      triggerToast(t.toastCleared.replace('{name}', jam.name), 'success');
      setProcessingId(null);
    }, 1500);
  };

  // Upload scan trigger
  const triggerUploadDocs = (jam: Jamaah, type: 'passport' | 'ktp' | 'vaccine') => {
    triggerToast(t.toastDocUploaded.replace('{name}', jam.name), 'success');
    handleDocStatusChange(jam.id, type, 'SUBMITTED');
  };

  // Download EVisa Card
  const downloadEVisa = (jam: Jamaah) => {
    triggerToast(t.toastDownload.replace('{name}', jam.name), 'info');
    
    // Create clean formatted plain text file as E-Visa mock
    const content = `
=============================================
             KINGDOM OF SAUDI ARABIA
               UMRAH E-VISA RECORD
=============================================
VISA NUMBER: EV-${Date.now().toString().substring(5)}
ENTRY TYPE: SINGLE ENTRY (90 DAYS)
FILING PORTAL: MUQEEM DISPATCH

PILGRIM DETAILS:
- Full Name: ${jam.name.toUpperCase()}
- Passport ID: ${docRegistry[jam.id]?.passportNumber || 'A1234500'}
- Group flight: ${jam.kloter}
- Selected Package: ${jam.package}

SPONSORSHIP / ACCESS:
- Operator Name: AL-HARAMAIN TRAVELS
- Status Code: COMPLETED & CLEARED
=============================================
This electronic record serves as official certificate representation.
`;
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `EVisa_${jam.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Mass verify
  const massVerifyAll = () => {
    setDocRegistry(prev => {
      const updated = { ...prev };
      filteredPilgrims.forEach(jam => {
        updated[jam.id] = {
          ...updated[jam.id],
          passport: 'VERIFIED',
          visa: 'VERIFIED',
          ktp: 'VERIFIED',
          vaccine: 'VERIFIED'
        };
      });
      return updated;
    });

    setJamaahList(prev => prev.map(pj => {
      if (filteredPilgrims.some(fp => fp.id === pj.id)) {
        return { ...pj, status: JamaahStatus.VISA_APPROVED };
      }
      return pj;
    }));

    triggerToast(language === 'id' ? 'Seluruh jemaah diproses disetujui!' : 'All pilgrims documents verified & approved!', 'success');
  };

  // Filter lists
  const filteredPilgrims = jamaahList.filter(jam => {
    const registry = docRegistry[jam.id] || { passportNumber: '' };
    const passportNo = registry.passportNumber || '';
    
    const matchesSearch = 
      jam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jam.package.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passportNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesKloter = selectedKloter === 'ALL' || jam.kloter === selectedKloter;
    
    const visaStatusVal = docRegistry[jam.id]?.visa || 'PENDING';
    const matchesStatus = 
      selectedStatus === 'ALL' || 
      (selectedStatus === 'APPROVED' && visaStatusVal === 'VERIFIED') ||
      (selectedStatus === 'PENDING' && (visaStatusVal === 'PENDING' || visaStatusVal === 'SUBMITTED')) ||
      (selectedStatus === 'REJECTED' && visaStatusVal === 'REJECTED');

    return matchesSearch && matchesKloter && matchesStatus;
  });

  // Export Manifest Data to CSV
  const exportVisaManifestCSV = () => {
    let csvContent = "No,Full Name,Passport Number,flight Group (Kloter),Umrah Package,Passport,Umrah Visa,ID status,Vaccine Status\n";
    
    filteredPilgrims.forEach((jam, idx) => {
      const reg = docRegistry[jam.id] || { passportNumber: 'N/A', passport: 'PENDING', visa: 'PENDING', ktp: 'PENDING', vaccine: 'PENDING' };
      csvContent += `${idx + 1},"${jam.name}","${reg.passportNumber}","${jam.kloter}","${jam.package}",${reg.passport},${reg.visa},${reg.ktp},${reg.vaccine}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Visa_Manifest_${selectedKloter.replace(/\s+/g, '_')}.csv`;
    link.click();
    triggerToast(language === 'id' ? 'Manifest Visa berhasil diunduh!' : 'Visa manifest downloaded!', 'success');
  };

  // Analytics
  const totalCount = filteredPilgrims.length;
  const approvedCount = filteredPilgrims.filter(jam => docRegistry[jam.id]?.visa === 'VERIFIED').length;
  const pendingCount = filteredPilgrims.filter(jam => docRegistry[jam.id]?.visa === 'PENDING' || docRegistry[jam.id]?.visa === 'SUBMITTED').length;
  const rejectedCount = filteredPilgrims.filter(jam => docRegistry[jam.id]?.visa === 'REJECTED').length;

  const getStatusBadge = (status: 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED') => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30';
      case 'SUBMITTED':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/30';
      case 'REJECTED':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/30';
      default:
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/30';
    }
  };

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3.5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">{t.totalVisa}</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{totalCount}</span>
            <span className="text-xs text-slate-400 font-medium">pax total</span>
          </div>
        </Card>

        <Card className="p-3.5 bg-gradient-to-br from-emerald-50/20 to-white dark:from-emerald-950/10 dark:to-slate-950 border border-emerald-100 dark:border-emerald-950/30">
          <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider font-mono">{t.visaApproved}</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{approvedCount}</span>
            <span className="text-xs text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">
              {totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0}%
            </span>
          </div>
        </Card>

        <Card className="p-3.5 bg-gradient-to-br from-amber-50/20 to-white dark:from-amber-950/10 dark:to-slate-950 border border-amber-100 dark:border-amber-950/30">
          <p className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider font-mono">{t.visaPending}</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{pendingCount}</span>
            <span className="text-xs text-slate-400">awaiting</span>
          </div>
        </Card>

        <Card className="p-3.5 bg-gradient-to-br from-rose-50/10 to-white dark:from-rose-950/10 dark:to-slate-950 border border-rose-100 dark:border-rose-950/30">
          <p className="text-[10px] uppercase font-bold text-rose-500 tracking-wider font-mono">{t.visaRejected}</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-rose-500">{rejectedCount}</span>
            <span className="text-xs text-rose-400">requires fix</span>
          </div>
        </Card>
      </div>

      {/* Main Filter Panel */}
      <Card className="p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-green-900 dark:text-emerald-400 uppercase tracking-widest">{t.title}</h2>
            <p className="text-[11px] text-gray-400">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={massVerifyAll}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center shadow-sm cursor-pointer"
            >
              <Icon name="check" className="h-3.5 w-3.5 mr-1" />
              {t.verifyAll}
            </button>
            <button 
              onClick={exportVisaManifestCSV}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <Icon name="download" className="h-3.5 w-3.5 mr-1" />
              {t.exportLabel}
            </button>
          </div>
        </div>

        {/* Filter grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">{searchTerm ? 'Search' : t.searchPlaceholder.split('...')[0]}</label>
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full text-xs rounded-xl border px-3 h-9 focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">{t.filterGroup}</label>
            <select
              value={selectedKloter}
              onChange={(e) => setSelectedKloter(e.target.value)}
              className="w-full text-xs rounded-xl border px-3 h-9 focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white cursor-pointer"
            >
              <option value="ALL">Semua Kloter / All Groups</option>
              <option value="Kloter A">Kloter A - 15 Mar 2025</option>
              <option value="Kloter B">Kloter B - 20 Apr 2025</option>
              <option value="Kloter C">Kloter C - 10 Jun 2025</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">{t.filterStatus}</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs rounded-xl border px-3 h-9 focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white cursor-pointer"
            >
              <option value="ALL">Semua Dokumen / All Status</option>
              <option value="APPROVED">Visa Approved (Cleared)</option>
              <option value="PENDING">Visa Pending (Awaiting Submit)</option>
              <option value="REJECTED">Visa Rejected (Requires Action)</option>
            </select>
          </div>
        </div>

        {/* Pilgrims Table / Cards Layout */}
        <div className="mt-4 hidden md:block overflow-x-auto border dark:border-slate-800/80 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-3.5 py-2.5">{t.jamaahName}</th>
                <th className="px-3.5 py-2.5">{t.kloter}</th>
                <th className="px-3.5 py-2.5 text-center">{t.passport}</th>
                <th className="px-3.5 py-2.5 text-center">{t.visa}</th>
                <th className="px-3.5 py-2.5 text-center">{t.ktp}</th>
                <th className="px-3.5 py-2.5 text-center">{t.vaccine}</th>
                <th className="px-3.5 py-2.5 text-right">{t.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
              {filteredPilgrims.length === 0 ? (
                <tr>
                   <td colSpan={7} className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium">
                    <Icon name="document" className="h-9 w-9 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    {t.noData}
                  </td>
                </tr>
              ) : (
                filteredPilgrims.map((jam) => {
                  const reg = docRegistry[jam.id] || {
                    passport: 'PENDING',
                    visa: 'PENDING',
                    ktp: 'VERIFIED',
                    vaccine: 'PENDING',
                    passportNumber: 'A1234500'
                  };

                  const isVisaApproved = reg.visa === 'VERIFIED';
                  const isClearing = processingId === jam.id;

                  return (
                    <tr key={jam.id} className="hover:bg-emerald-50/10 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="px-3.5 py-3.5">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={jam.avatarUrl} 
                            alt={jam.name} 
                            className="h-8 w-8 rounded-full ring-2 ring-emerald-500/20"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100">{jam.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono">No. Paspor: {reg.passportNumber}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-3.5 py-3.5">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{jam.kloter}</p>
                        <span className="text-[10px] text-slate-400 font-medium line-clamp-1">{jam.package}</span>
                      </td>

                      {/* Passport Column Toggle */}
                      <td className="px-3.5 py-3.5 text-center">
                        <select
                          value={reg.passport}
                          onChange={(e) => handleDocStatusChange(jam.id, 'passport', e.target.value as any)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full outline-none border cursor-pointer ${getStatusBadge(reg.passport)}`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="SUBMITTED">SUBMITTED</option>
                          <option value="VERIFIED">VERIFIED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </td>

                      {/* Visa Column Toggle */}
                      <td className="px-3.5 py-3.5 text-center">
                        <select
                          value={reg.visa}
                          onChange={(e) => handleDocStatusChange(jam.id, 'visa', e.target.value as any)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full outline-none border cursor-pointer ${getStatusBadge(reg.visa)}`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="SUBMITTED">SUBMITTED</option>
                          <option value="VERIFIED">VERIFIED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </td>

                      {/* KTP Document Toggle */}
                      <td className="px-3.5 py-3.5 text-center">
                        <select
                          value={reg.ktp}
                          onChange={(e) => handleDocStatusChange(jam.id, 'ktp', e.target.value as any)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full outline-none border cursor-pointer ${getStatusBadge(reg.ktp)}`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="SUBMITTED">SUBMITTED</option>
                          <option value="VERIFIED">VERIFIED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </td>

                      {/* Vaccine Status Toggle */}
                      <td className="px-3.5 py-3.5 text-center">
                        <select
                          value={reg.vaccine}
                          onChange={(e) => handleDocStatusChange(jam.id, 'vaccine', e.target.value as any)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full outline-none border cursor-pointer ${getStatusBadge(reg.vaccine)}`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="SUBMITTED">SUBMITTED</option>
                          <option value="VERIFIED">VERIFIED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-3.5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex space-x-1.5">
                          {isVisaApproved ? (
                            <button
                              onClick={() => downloadEVisa(jam)}
                              className="bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-550 dark:text-emerald-400 font-bold px-2.5 h-7 rounded-lg text-[10px] transition-all cursor-pointer flex items-center"
                              title={t.downloadEVisa}
                            >
                              <Icon name="download" className="h-3 w-3 mr-1" />
                              {t.downloadEVisa}
                            </button>
                          ) : (
                            <button
                              onClick={() => runMuqeemClearance(jam)}
                              disabled={isClearing}
                              className={`bg-green-800 hover:bg-green-950 text-white font-bold px-2.5 h-7 rounded-lg text-[10px] transition-all cursor-pointer flex items-center shadow-xs ${isClearing ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                              {isClearing ? (
                                <span className="flex items-center">
                                  <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  {t.processing}
                                </span>
                              ) : (
                                <>
                                  <Icon name="plane" className="h-3 w-3 mr-1 text-emerald-300" />
                                  {t.autoClear}
                                </>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => triggerUploadDocs(jam, 'passport')}
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 font-medium px-2 h-7 rounded-lg text-[10px] transition-all cursor-pointer flex items-center"
                            title={t.uploadScan}
                          >
                            <span className="font-semibold">{t.uploadScan.split(' ')[0]}</span>
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
        <div className="mt-4 block md:hidden space-y-3.5 animate-fade-in">
          {filteredPilgrims.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium bg-white dark:bg-slate-900 border dark:border-slate-800/80 rounded-xl">
              <Icon name="document" className="h-9 w-9 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              {t.noData}
            </div>
          ) : (
            filteredPilgrims.map((jam) => {
              const reg = docRegistry[jam.id] || {
                passport: 'PENDING',
                visa: 'PENDING',
                ktp: 'VERIFIED',
                vaccine: 'PENDING',
                passportNumber: 'A1234500'
              };

              const isVisaApproved = reg.visa === 'VERIFIED';
              const isClearing = processingId === jam.id;

              return (
                <div key={jam.id} className={`p-4 rounded-xl border space-y-3.5 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150 shadow-xs'
                }`}>
                  {/* Card Header (Avatar, Name, Passport Number) */}
                  <div className="flex items-center space-x-3.5">
                    <img 
                      src={jam.avatarUrl} 
                      alt={jam.name} 
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/10 shrink-0 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-850 dark:text-slate-100 text-sm leading-tight">{jam.name}</p>
                      <span className="text-[10px] text-gray-400 font-mono">No. Paspor: {reg.passportNumber}</span>
                    </div>
                  </div>

                  {/* Flight Group Package Details */}
                  <div className="bg-slate-50 dark:bg-slate-850/45 p-2.5 rounded-lg grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">{t.kloter}</span>
                      <span className="font-extrabold text-slate-750 dark:text-slate-200 block">{jam.kloter}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">{language === 'id' ? 'Paket' : 'Package'}</span>
                      <span className="font-semibold text-slate-705 dark:text-slate-305 block truncate">{jam.package}</span>
                    </div>
                  </div>

                  {/* Document Selectors Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2 text-[11px]">
                    {/* Passport select */}
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-450 font-bold uppercase text-[9px] tracking-wider">{t.passport}</span>
                      <select
                        value={reg.passport}
                        onChange={(e) => handleDocStatusChange(jam.id, 'passport', e.target.value as any)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg outline-none border cursor-pointer w-full ${getStatusBadge(reg.passport)}`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="SUBMITTED">SUBMITTED</option>
                        <option value="VERIFIED">VERIFIED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </div>

                    {/* Visa select */}
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-450 font-bold uppercase text-[9px] tracking-wider">{t.visa}</span>
                      <select
                        value={reg.visa}
                        onChange={(e) => handleDocStatusChange(jam.id, 'visa', e.target.value as any)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg outline-none border cursor-pointer w-full ${getStatusBadge(reg.visa)}`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="SUBMITTED">SUBMITTED</option>
                        <option value="VERIFIED">VERIFIED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </div>

                    {/* KTP select */}
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-450 font-bold uppercase text-[9px] tracking-wider">{t.ktp}</span>
                      <select
                        value={reg.ktp}
                        onChange={(e) => handleDocStatusChange(jam.id, 'ktp', e.target.value as any)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg outline-none border cursor-pointer w-full ${getStatusBadge(reg.ktp)}`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="SUBMITTED">SUBMITTED</option>
                        <option value="VERIFIED">VERIFIED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </div>

                    {/* Vaccine select */}
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-455 font-bold uppercase text-[9px] tracking-wider">{t.vaccine}</span>
                      <select
                        value={reg.vaccine}
                        onChange={(e) => handleDocStatusChange(jam.id, 'vaccine', e.target.value as any)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg outline-none border cursor-pointer w-full ${getStatusBadge(reg.vaccine)}`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="SUBMITTED">SUBMITTED</option>
                        <option value="VERIFIED">VERIFIED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </div>
                  </div>

                  {/* Actions Block */}
                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                    {isVisaApproved ? (
                      <button
                        onClick={() => downloadEVisa(jam)}
                        className="bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-555 dark:text-emerald-400 font-extrabold px-3 py-1.5 rounded-lg text-[10px] transition-all cursor-pointer flex items-center justify-center flex-1"
                      >
                        <Icon name="download" className="h-3.5 w-3.5 mr-1" />
                        {t.downloadEVisa}
                      </button>
                    ) : (
                      <button
                        onClick={() => runMuqeemClearance(jam)}
                        disabled={isClearing}
                        className={`bg-green-800 hover:bg-green-950 text-white font-extrabold px-3 py-1.5 rounded-lg text-[10px] transition-all cursor-pointer flex items-center justify-center flex-1 shadow-xs ${isClearing ? 'opacity-65 cursor-not-allowed' : ''}`}
                      >
                        {isClearing ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t.processing}
                          </span>
                        ) : (
                          <>
                            <Icon name="plane" className="h-3.5 w-3.5 mr-1 text-emerald-300" />
                            {t.autoClear}
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => triggerUploadDocs(jam, 'passport')}
                      className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 font-bold px-3 py-1.5 rounded-lg text-[10px] transition-all cursor-pointer flex items-center justify-center animate-pulse"
                    >
                      <span>{t.uploadScan.split(' ')[0]} Scan</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};

export default VisaCenter;
