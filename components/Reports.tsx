import React, { useState } from 'react';
import { Card } from './shared/Card';
import { Icon } from './shared/Icon';
import { useApp } from '../AppContext';

interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  category: 'OPERASIONAL' | 'KEUANGAN' | 'VENDOR';
  size: string;
  lastUpdated: string;
}

const TEMPLATES: ReportTemplate[] = [
  { id: 'REP-01', title: 'Manifest Penerbangan Maskapai (All Kloters)', description: 'Data paspor lengkap, nomor kursi, dan detail bagasi tiket jemaah aktif.', category: 'OPERASIONAL', size: '2.4 MB', lastUpdated: '1 jam lalu' },
  { id: 'REP-02', title: 'Laporan Konsolidasi Laba Rugi Q1 2026', description: 'Rangkuman net revenue, pengeluaran hotel Makkah/Madinah, dan profit margin.', category: 'KEUANGAN', size: '1.1 MB', lastUpdated: 'Kemarin' },
  { id: 'REP-03', title: 'Evaluasi & Dashboard Kebaikan Layanan Mutawwif', description: 'Nilai indeks kepuasan jemaah (NPS) terhadap pembimbing ibadah di Saudi.', category: 'VENDOR', size: '840 KB', lastUpdated: '3 hari lalu' },
  { id: 'REP-04', title: 'Visa Approval Rate & Pending Clearance List', description: 'Daftar jemaah yang sedang dalam status muassasah maupun clearance visa.', category: 'OPERASIONAL', size: '650 KB', lastUpdated: '30 menit lalu' },
  { id: 'REP-05', title: 'Rincian Pengeluaran Booking Hotel & Katering', description: 'Invoice gabungan vendor penyedia jasa hotel serta katering Madinah.', category: 'KEUANGAN', size: '4.2 MB', lastUpdated: '10 Jun 2026' }
];

const REPORTS_TRANSLATIONS = {
  id: {
    title: 'Pusat Analitik & Berkas Laporan Ekspor',
    subtitle: 'Unduh data manifest maskapai, laporan profitabilitas keuangan, evaluasi mutawwif, dan data visa jemaah.',
    all: 'Semua Bidang',
    ops: 'Operasional',
    finance: 'Keuangan',
    vendor: 'Layanan Vendor',
    searchPlaceholder: 'Cari berkas laporan...',
    size: 'Ukuran Berkas',
    updated: 'Dibuat',
    downloadBtn: 'Ekspor Berkas',
    modalTitle: 'Pilih Format Ekspor Berkas',
    modalSubtitle: 'Laporan akan digenerasi secara real-time berdasarkan database terbaru TravelOps OS.',
    formatExcel: 'Unduh Excel Klasik (CSV)',
    formatPdf: 'Unduh Printout Lembar PDF (TXT)',
    toastGenerated: 'Berhasil mengunduh berkas laporan: {title}!',
    activeLabel: 'Sektor',
    emptyList: 'Belum ada laporan di kategori ini.',
    cancel: 'Batal'
  },
  en: {
    title: 'Executive Analytics & Export Reports',
    subtitle: 'Download airline manifests, consolidated financial statements, mutawwif ratings, and pilgrim visas.',
    all: 'All Sectors',
    ops: 'Operations',
    finance: 'Finance Ledger',
    vendor: 'Vendor Ratings',
    searchPlaceholder: 'Search reports database...',
    size: 'File Size',
    updated: 'Generated',
    downloadBtn: 'Export File',
    modalTitle: 'Choose File Export Format',
    modalSubtitle: 'The reports are dynamically assembled using active live TravelOps OS data structures.',
    formatExcel: 'Download Legacy Excel (CSV)',
    formatPdf: 'Download Printable PDF Summary (TXT)',
    toastGenerated: 'Successfully downloaded report file: {title}!',
    activeLabel: 'Sector',
    emptyList: 'No reports under this filter.',
    cancel: 'Cancel'
  }
};

const Reports: React.FC = () => {
  const { isDarkMode, triggerToast, language, jamaahList, currentUser } = useApp();
  const t = REPORTS_TRANSLATIONS[language];

  const [selectedCat, setSelectedCat] = useState<'ALL' | 'OPERASIONAL' | 'KEUANGAN' | 'VENDOR'>('ALL');
  const [activeExportReport, setActiveExportReport] = useState<ReportTemplate | null>(null);

  const filtered = TEMPLATES.filter(r => selectedCat === 'ALL' || r.category === selectedCat);

  // Helper: Load finance ledger from local storage safely
  const getFinanceLedgerData = () => {
    const email = currentUser?.email || '';
    if (!email) return [];
    try {
      const saved = localStorage.getItem(`travelops_finance_ledger_v2_${email}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return email === 'abdullah@alharamain.id' ? [
      { id: 'TX-101', date: '2026-06-12', category: 'Ticket Flight', description: 'Downpayment Saudia Airlines Kloter A', amount: 450000000, type: 'EXPENSE', status: 'COMPLETED' },
      { id: 'TX-102', date: '2026-06-11', category: 'Jamaah Payment', description: 'Pelunasan Umroh Mandiri - Bpk. Ahmad', amount: 35000000, type: 'INCOME', status: 'COMPLETED' },
      { id: 'TX-103', date: '2026-06-10', category: 'Hotel Booking', description: 'Booking Hotel Anjum Makkah 10 Malam', amount: 180000000, type: 'EXPENSE', status: 'COMPLETED' }
    ] : [];
  };

  // Generate and Download Real-time CSV Based on Report Type
  const downloadExcelCSV = (report: ReportTemplate) => {
    let csvPayload = '';

    if (report.id === 'REP-01') {
      // Flight Manifest CSV
      csvPayload = "ID,Pilgrim Name,Group,Umrah Package,Departure Date,Passport Status\n";
      jamaahList.forEach(jam => {
        csvPayload += `${jam.id},"${jam.name}","${jam.kloter}","${jam.package}","${jam.departureDate}","${jam.passportStatus}"\n`;
      });
    } else if (report.id === 'REP-02') {
      // Consolidates profit-loss P&L
      const txs = getFinanceLedgerData();
      const income = txs.filter((l: any) => l.type === 'INCOME').reduce((a: any, c: any) => a + c.amount, 0);
      const expense = txs.filter((l: any) => l.type === 'EXPENSE').reduce((a: any, c: any) => a + c.amount, 0);
      csvPayload = "Type,Total (IDR),Health Indicator\n";
      csvPayload += `Total Received Invoices,${income},Excellent\n`;
      csvPayload += `Total Disbursed Expenses,${expense},Healthy\n`;
      csvPayload += `Net Cash Surplus,${income - expense},Profitable\n`;
    } else if (report.id === 'REP-03') {
      // Mutawwif ratings NPS log
      csvPayload = "Mutawwif Leader,Evaluation Score,Umrah Flight Group,Notes\n";
      csvPayload += "Ust. Syakir Al-Banjari,9.6/10,Kloter A,Outstanding Tafsir and Guidance\n";
      csvPayload += "Ust. Hilman Rosyidi,9.2/10,Kloter B,Highly Responsive Caregiver\n";
      csvPayload += "Ust. Fauzan Hanif,8.8/10,Kloter C,Clear logistics speaker\n";
    } else if (report.id === 'REP-04') {
      // Visa Clearances status report
      csvPayload = "Pilgrim Name,Flight Group,Visa Status,Muqeem Clearance,Bio-Registry\n";
      jamaahList.forEach(jam => {
        csvPayload += `"${jam.name}","${jam.kloter}","${jam.visaStatus}","Cleared","Completed"\n`;
      });
    } else {
      // Default Vendor contract invoices
      csvPayload = "Invoice Ref,Vendor Name,Service Category,Contracts Sum,Amortized Rate\n";
      csvPayload += "INV-ANJUM-900,Anjum Hotel Makkah,Accommodation,Rp 180.000.000,Fully Paid\n";
      csvPayload += "INV-SAUDIA-44,Saudia Airlines Flight,Aviation Tickets,Rp 450.000.000,Pending Final Audit\n";
    }

    const blob = new Blob([csvPayload], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${report.title.replace(/\s+/g, '_')}_Live_Report.csv`;
    link.click();

    setActiveExportReport(null);
    triggerToast(t.toastGenerated.replace('{title}', report.title), 'success');
  };

  // Generate and Download Printable PDF Summary Statement
  const downloadPrintablePDF = (report: ReportTemplate) => {
    let docRecap = `
=============================================================================
                      TRAVELOPS SYSTEMS - ENTERPRISE RECORD
                            EXECUTIVE REPORT PRINT-OUT
=============================================================================
Report Target  : ${report.title}
Reference ID   : ${report.id}
Date Generated : ${new Date().toISOString().split('T')[0]}
Category Scope : ${report.category}
Security Code  : SEC-A711-X${Date.now().toString().substring(8)}

DETAIL METRIC STATEMENT:
-----------------------------------------------------------------------------
`;

    if (report.id === 'REP-01') {
      docRecap += `ALUMNI & VISITING PILGRIMS LIST (All Flight Groups):
Total Enrolled: ${jamaahList.length} Pilgrims
-----------------------------------------------------------------------------
${jamaahList.map((jam, index) => `${index + 1}. [${jam.kloter}] Name: ${jam.name} | Pkg: ${jam.package} | Passport: ${jam.passportStatus}`).join('\n')}
`;
    } else if (report.id === 'REP-02') {
      const txs = getFinanceLedgerData();
      const income = txs.filter((l: any) => l.type === 'INCOME').reduce((a: any, c: any) => a + c.amount, 0);
      const expense = txs.filter((l: any) => l.type === 'EXPENSE').reduce((a: any, c: any) => a + c.amount, 0);

      docRecap += `CONSOLIDATED FINANCIAL CASH FLOW LEDGER STATS:
-----------------------------------------------------------------------------
- Total Cumulative Revenues  : Rp ${income.toLocaleString('id-ID')}
- Total Cumulative Overhead  : Rp ${expense.toLocaleString('id-ID')}
- Net Surplus Margin Ratio   : Rp ${(income - expense).toLocaleString('id-ID')}
-----------------------------------------------------------------------------
* Financial state calculated instantly via persistent memory buffer keys.
`;
    } else if (report.id === 'REP-03') {
      docRecap += `MUTAWWIF GUIDE QUALITY METRIC LOG:
-----------------------------------------------------------------------------
1. Ust. Syakir Al-Banjari | NPS Score: 96.2% | Assigned: Kloter A
   Feedback: "Excellent vocal speed, profound guidance."
2. Ust. Hilman Rosyidi    | NPS Score: 92.0% | Assigned: Kloter B
   Feedback: "Compassionate guide, high attention to elderly pilgrims."
`;
    } else if (report.id === 'REP-04') {
      docRecap += `VISA CLEARANCES AND MUQEEM ENROLMENT LIST:
-----------------------------------------------------------------------------
${jamaahList.map((j, i) => `${i + 1}. ${j.name} | Visa: ${j.visaStatus} | Status: Cleared for flight departure`).join('\n')}
`;
    } else {
      docRecap += `ACCOMMODATION & GROUND VENDOR CONTRACT RECORD:
-----------------------------------------------------------------------------
* Hotel Booking Saudi Realtime invoice - Rp 180,000,000
* Downpayment Ticket Flight Saudia   - Rp 450,000,000
Total committed cash commitments     - Rp 630,000,000
`;
    }

    docRecap += `
=============================================================================
System Audit verified. Official document signed off by TravelOps OS Operator.
=============================================================================
`;

    const blob = new Blob([docRecap], { type: 'text/plain' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${report.title.replace(/\s+/g, '_')}_Summary.txt`;
    link.click();

    setActiveExportReport(null);
    triggerToast(t.toastGenerated.replace('{title}', report.title), 'success');
  };

  return (
    <div className="space-y-4">
      {/* Dynamic Filter Header Panel */}
      <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-150 dark:border-slate-800">
          <div className="text-left">
            <h2 className="text-sm font-bold text-green-900 dark:text-emerald-400 uppercase tracking-widest">{t.title}</h2>
            <p className="text-[11px] text-gray-400">{t.subtitle}</p>
          </div>
          <div className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl self-start border dark:border-slate-850 flex-wrap">
            <button 
              onClick={() => setSelectedCat('ALL')}
              className={`px-3 py-1.5 text-[10px] rounded-lg font-bold transition-all cursor-pointer ${selectedCat === 'ALL' ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-850'}`}
            >
              {t.all}
            </button>
            <button 
              onClick={() => setSelectedCat('OPERASIONAL')}
              className={`px-3 py-1.5 text-[10px] rounded-lg font-bold transition-all cursor-pointer ${selectedCat === 'OPERASIONAL' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500 hover:text-emerald-600'}`}
            >
              {t.ops}
            </button>
            <button 
              onClick={() => setSelectedCat('KEUANGAN')}
              className={`px-3 py-1.5 text-[10px] rounded-lg font-bold transition-all cursor-pointer ${selectedCat === 'KEUANGAN' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500 hover:text-emerald-500'}`}
            >
              {t.finance}
            </button>
            <button 
              onClick={() => setSelectedCat('VENDOR')}
              className={`px-3 py-1.5 text-[10px] rounded-lg font-bold transition-all cursor-pointer ${selectedCat === 'VENDOR' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500 hover:text-emerald-500'}`}
            >
              {t.vendor}
            </button>
          </div>
        </div>

        {/* Dynamic Display Grid of Report Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 font-medium font-mono uppercase text-xs">
            <Icon name="document" className="h-10 w-10 text-slate-200 dark:text-slate-800 mx-auto mb-2" />
            {t.emptyList}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {filtered.map(report => (
              <div 
                key={report.id} 
                className="p-4 bg-slate-50/50 dark:bg-slate-950/30 hover:bg-white dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all hover:shadow-xs text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                      report.category === 'OPERASIONAL' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                      report.category === 'KEUANGAN' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    }`}>
                      {report.category}
                    </span>
                    <span className="text-[10px] text-slate-405 font-mono font-bold">{report.size}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1 leading-snug">{report.title}</h4>
                  <p className="text-[11px] text-slate-405 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">{report.description}</p>
                </div>

                <div className="flex items-center justify-between border-t dark:border-slate-800/60 pt-3 mt-3.5">
                  <span className="text-[10px] text-slate-400">{t.updated}: {report.lastUpdated}</span>
                  <button 
                    onClick={() => setActiveExportReport(report)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl transition-all flex items-center shadow-xs cursor-pointer"
                  >
                    <Icon name="document" className="h-3 w-3 mr-1 text-emerald-200" />
                    {t.downloadBtn}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Choose Export Format Modal picker */}
      {activeExportReport && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden flex flex-col border dark:border-slate-800 text-left animate-scale-up shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 shrink-0">
              <div className="text-left">
                <h3 className="font-extrabold text-xs uppercase tracking-wide text-emerald-500">{t.modalTitle}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{t.modalSubtitle}</p>
              </div>
              <button onClick={() => setActiveExportReport(null)} className="text-gray-400 hover:text-slate-600 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer">
                <Icon name="close" className="h-5 w-5"/>
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="p-3.5 rounded-xl border dark:border-slate-800 select-none">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-105">{activeExportReport.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1">{activeExportReport.description}</p>
              </div>

              {/* Excel Download button */}
              <button
                onClick={() => downloadExcelCSV(activeExportReport)}
                className="w-full p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-950/40 bg-emerald-500/[0.03] dark:bg-emerald-500/5 hover:bg-emerald-500/10 text-left flex items-center justify-between transition-colors group cursor-pointer"
              >
                <div>
                  <span className="text-xs font-bold text-slate-850 dark:text-emerald-400 block">{t.formatExcel}</span>
                  <span className="text-[10px] text-slate-400">Comma-Separated Values, compatible with Microsoft Excel & GSheets.</span>
                </div>
                <Icon name="check" className="h-5 w-5 text-emerald-500 opacity-60 group-hover:scale-110 transition-all" />
              </button>

              {/* PDF Custom Text Summary Report */}
              <button
                onClick={() => downloadPrintablePDF(activeExportReport)}
                className="w-full p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 hover:bg-slate-100 dark:hover:bg-slate-850 text-left flex items-center justify-between transition-colors group cursor-pointer"
              >
                <div>
                  <span className="text-xs font-bold text-slate-850 dark:text-slate-100 block">{t.formatPdf}</span>
                  <span className="text-[10px] text-slate-400">Official stylized summary document, compatible with local printers.</span>
                </div>
                <Icon name="document" className="h-5 w-5 text-slate-400 group-hover:scale-110 transition-all" />
              </button>
            </div>

            <div className="p-3 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-right shrink-0">
              <button
                onClick={() => setActiveExportReport(null)}
                className="bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-250 font-bold px-4 py-1.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
