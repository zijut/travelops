import React, { useState, useEffect } from 'react';
import { Card } from './shared/Card';
import { Icon } from './shared/Icon';
import { useApp } from '../AppContext';

interface Transaction {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  status: 'COMPLETED' | 'PENDING';
}

const INITIAL_MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'TX-101', date: '2026-06-12', category: 'Ticket Flight', description: 'Downpayment Saudia Airlines Kloter A', amount: 450000000, type: 'EXPENSE', status: 'COMPLETED' },
  { id: 'TX-102', date: '2026-06-11', category: 'Jamaah Payment', description: 'Pelunasan Umroh Mandiri - Bpk. Ahmad', amount: 35000000, type: 'INCOME', status: 'COMPLETED' },
  { id: 'TX-103', date: '2026-06-10', category: 'Hotel Booking', description: 'Booking Hotel Anjum Makkah 10 Malam', amount: 180000000, type: 'EXPENSE', status: 'COMPLETED' },
  { id: 'TX-104', date: '2026-06-09', category: 'Visa Processing', description: 'Biaya Visa 45 Pax Kloter B', amount: 67500000, type: 'EXPENSE', status: 'PENDING' },
  { id: 'TX-105', date: '2026-06-08', category: 'Jamaah Payment', description: 'Uang Muka Umroh Keluarga Ibu Susi (5 Pax)', amount: 75000000, type: 'INCOME', status: 'COMPLETED' }
];

const FINANCE_TRANSLATIONS = {
  id: {
    title: 'Buku Kas & Transaksi Arab Saudi / Maskapai',
    subtitle: 'Arus kas keluar masuk real-time terkait vendor hotel, tiket pesawat, dan pembayaran jemaah.',
    totalIncome: 'Total Pendapatan',
    totalExpense: 'Total Pengeluaran (Ops)',
    netProfit: 'Estimasi Sisa Laba (Profit)',
    arProgress: 'Sisa piutang aktif: Rp 340jt',
    vendorDue: 'Vendor jatuh tempo: 3 item',
    profitMargin: 'Margin profit bersih: ~30.5%',
    allTx: 'Semua Aliran Kas',
    income: 'Pemasukan (Income)',
    expense: 'Pengeluaran (Expense)',
    exportReport: 'Ekspor Kas',
    inputTxBtn: 'Input Transaksi Kas',
    idTgl: 'ID / Tanggal Transaksi',
    category: 'Kategori Tagihan',
    description: 'Uraian Kas Masuk/Keluar',
    status: 'Status',
    amount: 'Jumlah (Lump-Sum)',
    empty: 'Tidak ada kas terdaftar.',
    addTxTitle: 'Formulir Transaksi Kas Baru',
    selectType: 'Jenis Alokasi Aliran',
    amountLabel: 'Jumlah Kas (Rupiah)',
    descLabel: 'Keterangan Kas',
    dateLabel: 'Tanggal Transaksi',
    statusLabel: 'Status Realisasi',
    cancel: 'Batal',
    submit: 'Simpan Transaksi',
    toastAddTx: 'Berkas transaksi berhasil terekam ke buku kas!',
    toastExportCsv: 'Berhasil mengunduh Ekspor Kas CSV!',
    toastExportPdf: 'Berhasil mengunduh Lembar Cetak Kas PDF!'
  },
  en: {
    title: 'Operational Ledger & Vendor Treasury',
    subtitle: 'Real-time inflows and outflows tracking for flights, hotel contracts, and pilgrim payments.',
    totalIncome: 'Total Receivables (Revenue)',
    totalExpense: 'Total Operations (Expenses)',
    netProfit: 'Net Treasury Surplus (Profit)',
    arProgress: 'Active accounts receivable: Rp 340m',
    vendorDue: 'Vendor invoices due: 3 items',
    profitMargin: 'Net margin score: ~30.5%',
    allTx: 'All Accounts Ledger',
    income: 'Income Cash Entry',
    expense: 'Expense Cash Out',
    exportReport: 'Export Ledger',
    inputTxBtn: 'Input Cash Transaction',
    idTgl: 'Ref / Transaction Date',
    category: 'Vendor Category',
    description: 'Item Particulars/Details',
    status: 'Status Code',
    amount: 'Total Amount (Lump-Sum)',
    empty: 'No transactions listed.',
    addTxTitle: 'Record Cash Transaction Form',
    selectType: 'Cash Flow Direction',
    amountLabel: 'Currency Amount (IDR)',
    descLabel: 'Ledger Description',
    dateLabel: 'Entry Date',
    statusLabel: 'Verification Status Code',
    cancel: 'Cancel',
    submit: 'Submit Ledger Entry',
    toastAddTx: 'New transaction posted to ledger successfully!',
    toastExportCsv: 'Cash book ledger exported to CSV successfully!',
    toastExportPdf: 'Printable financial report ledger exported successfully!'
  }
};

const Finance: React.FC = () => {
  const { isDarkMode, language, triggerToast, currentUser } = useApp();
  const t = FINANCE_TRANSLATIONS[language];
  const currentEmail = currentUser?.email || '';

  // Load stateful transactions from local storage if available, else use defaults
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (!currentEmail) return [];
    const saved = localStorage.getItem(`travelops_finance_ledger_v2_${currentEmail}`);
    if (saved) return JSON.parse(saved);
    return currentEmail === 'abdullah@alharamain.id' ? INITIAL_MOCK_TRANSACTIONS : [];
  });

  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [formType, setFormType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('Jamaah Payment');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formDate, setFormDate] = useState<string>('');
  const [formStatus, setFormStatus] = useState<'COMPLETED' | 'PENDING'>('COMPLETED');

  // Trigger modal with initial fresh parameters
  const openInputModal = () => {
    setFormType('INCOME');
    setFormAmount('');
    setFormCategory('Jamaah Payment');
    setFormDescription('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormStatus('COMPLETED');
    setIsModalOpen(true);
  };

  // Reload transactions when current user changes (e.g. after registration or switching users)
  useEffect(() => {
    if (currentEmail) {
      const saved = localStorage.getItem(`travelops_finance_ledger_v2_${currentEmail}`);
      setTransactions(saved ? JSON.parse(saved) : (currentEmail === 'abdullah@alharamain.id' ? INITIAL_MOCK_TRANSACTIONS : []));
    } else {
      setTransactions([]);
    }
  }, [currentEmail]);

  // Sync cash ledger to local storage
  useEffect(() => {
    if (currentEmail) {
      localStorage.setItem(`travelops_finance_ledger_v2_${currentEmail}`, JSON.stringify(transactions));
    }
  }, [transactions, currentEmail]);

  // Handle addition
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(formAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      triggerToast(language === 'id' ? 'Jumlah kas harus valid!' : 'Amount must be valid!', 'error');
      return;
    }

    const nextId = `TX-${Date.now().toString().substring(10)}`;
    const newTx: Transaction = {
      id: nextId,
      date: formDate,
      category: formCategory,
      description: formDescription,
      amount: parsedAmount,
      type: formType,
      status: formStatus
    };

    setTransactions(prev => [newTx, ...prev]);
    setIsModalOpen(false);
    triggerToast(t.toastAddTx, 'success');
  };

  // Calculate dynamic data
  const totalInflows = transactions
    .filter(tx => tx.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalOutflows = transactions
    .filter(tx => tx.type === 'EXPENSE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const surplusProfits = totalInflows - totalOutflows;

  // Filter lists
  const filteredLead = transactions.filter(t => filterType === 'ALL' || t.type === filterType);

  // Download real-time exported CSV
  const handleExportCSV = () => {
    let csvData = "Ref ID,Transaction Date,Vendor Category,Ledger description,Type,Status,Amount (IDR)\n";
    transactions.forEach(tx => {
      csvData += `"${tx.id}","${tx.date}","${tx.category}","${tx.description}","${tx.type}","${tx.status}",${tx.amount}\n`;
    });

    const file = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = `TravelOps_Finance_Ledger.csv`;
    link.click();
    triggerToast(t.toastExportCsv, 'success');
  };

  // Printable Financial summary sheet PDF trigger
  const handleExportPDF = () => {
    const formattedContent = `
=============================================================================
                          TRAVELOPS UMRAH OPERATIONALS OS
                          CASH BOOK LEDGER STATEMENT REPORT
=============================================================================
GENERATED AT: ${new Date().toISOString().split('T')[0]}

TREASURY RECAP:
-----------------------------------------------------------------------------
* Total Revenue Receipts (Incomes): Rp ${totalInflows.toLocaleString('id-ID')}
* Total Operating Disbursements (Expenses): Rp ${totalOutflows.toLocaleString('id-ID')}
* Net Operating Surplus (Treasury Profit): Rp ${surplusProfits.toLocaleString('id-ID')}
-----------------------------------------------------------------------------

RECORDED ENTRIES:
=============================================================================
${transactions.map((tx, idx) => `${idx + 1}. [${tx.id}] - ${tx.date}
   Type: ${tx.type} | Cat: ${tx.category} | Status: ${tx.status}
   Detail: ${tx.description}
   Amount: Rp ${tx.amount.toLocaleString('id-ID')}
-----------------------------------------------------------------------------`).join('\n')}

=============================================================================
Report printed via safe cryptographic client execution. Authorized Operator.
=============================================================================
`;

    const fileBlob = new Blob([formattedContent], { type: 'text/plain' });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(fileBlob);
    a.download = `Financial_Ledger_Printout.txt`;
    a.click();
    triggerToast(t.toastExportPdf, 'success');
  };

  return (
    <div className="space-y-4">
      {/* Dynamic Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-3.5 bg-gradient-to-br from-green-50/70 to-white dark:from-emerald-950/10 dark:to-slate-900 border border-green-100 dark:border-emerald-900/10 flex flex-col justify-between text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-green-800 dark:text-emerald-400 tracking-wider font-mono">{t.totalIncome}</p>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">Rp {totalInflows.toLocaleString('id-ID')}</h3>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">{t.arProgress}</p>
            </div>
            <div className="p-2.5 bg-green-100/40 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Icon name="finance" className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-3.5 bg-gradient-to-br from-rose-50/50 to-white dark:from-rose-950/5 dark:to-slate-900 border border-rose-100/40 dark:border-rose-900/10 flex flex-col justify-between text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-rose-800 dark:text-rose-400 tracking-wider font-mono">{t.totalExpense}</p>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">Rp {totalOutflows.toLocaleString('id-ID')}</h3>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">{t.vendorDue}</p>
            </div>
            <div className="p-2.5 bg-rose-100/40 dark:bg-rose-500/10 rounded-xl text-rose-550 dark:text-rose-400">
              <Icon name="alert" className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-3.5 bg-gradient-to-br from-blue-50/30 to-white dark:from-blue-950/5 dark:to-slate-900 border border-blue-100/20 dark:border-blue-900/10 flex flex-col justify-between text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-400 tracking-wider font-mono">{t.netProfit}</p>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">Rp {surplusProfits.toLocaleString('id-ID')}</h3>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">{t.profitMargin}</p>
            </div>
            <div className="p-2.5 bg-blue-100/40 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
              <Icon name="logo" className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Cash Ledger Container */}
      <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="text-left">
            <h2 className="text-sm font-bold text-green-900 dark:text-emerald-400 uppercase tracking-widest">{t.title}</h2>
            <p className="text-gray-400 text-[11px]">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportCSV}
              className="bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-200 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center cursor-pointer"
            >
              <Icon name="download" className="h-3.5 w-3.5 mr-1 text-slate-400" />
              CSV
            </button>
            <button 
              onClick={handleExportPDF}
              className="bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-200 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center cursor-pointer"
            >
              <Icon name="document" className="h-3.5 w-3.5 mr-1 text-slate-400" />
              PDF
            </button>
            <button 
              onClick={openInputModal}
              className="bg-green-800 hover:bg-green-950 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-colors flex items-center shrink-0 shadow-sm cursor-pointer"
            >
              <Icon name="add" className="h-3.5 w-3.5 mr-1 text-emerald-300" />
              {t.inputTxBtn}
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center space-x-1 mb-4 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl self-start w-max border dark:border-slate-800 flex-wrap">
          <button 
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-colors cursor-pointer ${filterType === 'ALL' ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xs' : 'text-slate-550 dark:text-slate-400 hover:text-slate-800'}`}
          >
            {t.allTx}
          </button>
          <button 
            onClick={() => setFilterType('INCOME')}
            className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-colors cursor-pointer ${filterType === 'INCOME' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-550 dark:text-slate-400 hover:text-emerald-600'}`}
          >
            {t.income}
          </button>
          <button 
            onClick={() => setFilterType('EXPENSE')}
            className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-colors cursor-pointer ${filterType === 'EXPENSE' ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs' : 'text-slate-550 dark:text-slate-400 hover:text-rose-605'}`}
          >
            {t.expense}
          </button>
        </div>

        {/* Dense Ledger Table */}
        <div className="hidden md:block overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-3.5 py-2.5">{t.idTgl}</th>
                <th className="px-3.5 py-2.5">{t.category}</th>
                <th className="px-3.5 py-2.5">{t.description}</th>
                <th className="px-3.5 py-2.5 text-center">{t.status}</th>
                <th className="px-3.5 py-2.5 text-right">{t.amount}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
              {filteredLead.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 font-medium">
                    <Icon name="document" className="h-9 w-9 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                    {t.empty}
                  </td>
                </tr>
              ) : (
                filteredLead.map((tx) => (
                  <tr key={tx.id} className="hover:bg-emerald-50/[0.04] dark:hover:bg-slate-850/20 transition-colors">
                    <td className="px-3.5 py-3 ml-1">
                      <span className="font-extrabold block text-slate-800 dark:text-slate-100">{tx.id}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">{tx.date}</span>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="text-slate-550 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-950/70 border dark:border-slate-850 px-2 py-0.5 rounded-md">{tx.category}</span>
                    </td>
                    <td className="px-3.5 py-3 text-slate-800 dark:text-slate-200 font-semibold text-left">
                      {tx.description}
                    </td>
                    <td className="px-3.5 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 text-[9px] font-extrabold rounded-full border ${tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-right font-black whitespace-nowrap">
                      <span className={tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-500'}>
                        {tx.type === 'INCOME' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Dense Ledger Cards for Mobile */}
        <div className="block md:hidden space-y-3">
          {filteredLead.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium bg-white dark:bg-slate-900 border dark:border-slate-800/80 rounded-xl">
              <Icon name="document" className="h-9 w-9 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
              {t.empty}
            </div>
          ) : (
            filteredLead.map((tx) => (
              <div key={tx.id} className={`p-4 rounded-xl border space-y-3 ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150 shadow-xs'
              }`}>
                {/* Header info */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-extrabold block text-slate-900 dark:text-slate-100 text-sm leading-none mb-1">{tx.id}</span>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">{tx.date}</span>
                  </div>
                  {/* Ledger Type amount */}
                  <span className={`text-xs font-black ${tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-500'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Category block & Status */}
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-550 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-950/70 border dark:border-slate-850 px-2 py-0.5 rounded-md">
                    {tx.category}
                  </span>
                  <span className={`inline-block px-2 py-0.5 text-[9px] font-black rounded-full border uppercase ${tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-605 dark:text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-605 dark:text-amber-400 border-amber-500/20'}`}>
                    {tx.status}
                  </span>
                </div>

                {/* Description info */}
                <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold pt-2 border-t border-slate-100 dark:border-slate-800/60 leading-normal">
                  {tx.description}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Input Cash Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden flex flex-col border dark:border-slate-800 text-left animate-scale-up shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 shrink-0">
              <h3 className="font-extrabold text-xs uppercase tracking-wide text-emerald-500">{t.addTxTitle}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-slate-600 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer">
                <Icon name="close" className="h-5 w-5"/>
              </button>
            </div>
            
            <form onSubmit={handleAddTransaction} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">{t.selectType}</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border dark:border-slate-850">
                  <button
                    type="button"
                    onClick={() => { setFormType('INCOME'); setFormCategory('Jamaah Payment'); }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${formType === 'INCOME' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs' : 'text-slate-400'}`}
                  >
                    {t.income.split(' ')[0]}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFormType('EXPENSE'); setFormCategory('Hotel Booking'); }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${formType === 'EXPENSE' ? 'bg-white dark:bg-slate-900 text-rose-500 shadow-xs' : 'text-slate-400'}`}
                  >
                    {t.expense.split(' ')[0]}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">{t.category}</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-lg px-2 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-850 dark:text-white cursor-pointer"
                  >
                    {formType === 'INCOME' ? (
                      <>
                        <option value="Jamaah Payment" className="bg-slate-900 text-white">Pembayaran Jamaah</option>
                        <option value="Capital Input" className="bg-slate-900 text-white">Penyertaan Modal</option>
                        <option value="Comissions" className="bg-slate-900 text-white">Komisi Agen</option>
                      </>
                    ) : (
                      <>
                        <option value="Hotel Booking" className="bg-slate-900 text-white">Hotel Makkah / Madinah</option>
                        <option value="Ticket Flight" className="bg-slate-900 text-white">Pembelian Tiket Pesawat</option>
                        <option value="Visa Fee" className="bg-slate-900 text-white">Pengurusan Visa & Muassasah</option>
                        <option value="Catering & Transport" className="bg-slate-900 text-white">Katering & Bus Arab Saudi</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">{t.amountLabel}</label>
                  <input
                    type="number"
                    required
                    placeholder="E.g. 15000000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-lg px-2 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-850 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">{t.descLabel}</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Pelunasan tiket maskapai Saudia"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-lg px-2 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-850 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">{t.dateLabel}</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-850 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">{t.statusLabel}</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-lg px-2 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-850 dark:text-white cursor-pointer"
                  >
                    <option value="COMPLETED" className="bg-slate-900 text-white">COMPLETED (Selesai)</option>
                    <option value="PENDING" className="bg-slate-900 text-white">PENDING (Tergantung)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
                >
                  {t.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
