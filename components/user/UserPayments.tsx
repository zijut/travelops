import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { JAMAAH_MOCK, MOCK_USER_PAYMENTS } from '../../constants';

export const UserPayments: React.FC = () => {
  const { isDarkMode, language, activeJamaah, triggerToast } = useApp();

  const jamaah = activeJamaah || JAMAAH_MOCK[0];

  const userEmail = jamaah.email || 'ahmad.subagja@gmail.com';
  const initialPayments = MOCK_USER_PAYMENTS[userEmail] || [
    {
      id: 'PAY-001',
      date: '10 Jan 2026',
      description: 'Setoran Uang Muka (DP) Umroh Berkah Ramadhan',
      amount: 15000000,
      status: 'VERIFIED',
      receiptNumber: 'REC-2026-00192',
      paymentMethod: 'Transfer Bank Mandiri Virtual Account'
    },
    {
      id: 'PAY-002',
      date: '20 Feb 2026',
      description: 'Pelunasan Biaya Paket Umroh Berkah Ramadhan (Kloter A)',
      amount: 20000000,
      status: 'VERIFIED',
      receiptNumber: 'REC-2026-00341',
      paymentMethod: 'Transfer Bank Syariah Indonesia (BSI)'
    }
  ];

  const [paymentList, setPaymentList] = useState(initialPayments);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [bankDestination, setBankDestination] = useState('BSI');

  const totalPrice = jamaah.totalPrice || 35000000;
  const paidAmount = jamaah.paidAmount !== undefined ? jamaah.paidAmount : 35000000;
  const remaining = Math.max(0, totalPrice - paidAmount);

  const t = {
    id: {
      title: 'Tagihan & Riwayat Pembayaran',
      subtitle: 'Kwitansi resmi, rincian biaya paket ibadah, dan konfirmasi transfer',
      totalBill: 'Total Biaya Paket',
      totalPaid: 'Total Telah Dibayar',
      remainingBill: 'Sisa Tagihan',
      statusLunas: 'LUNAS (Verified)',
      statusDp: 'DP Diterima',
      statusUnpaid: 'Belum Lunas',
      uploadProofBtn: 'Upload Bukti Pembayaran Baru',
      historyTitle: 'Riwayat Transaksi & Kwitansi Resmi',
      receiptNo: 'No. Kwitansi',
      bankDestTitle: 'Rekening Resmi Travel untuk Pembayaran',
      downloadReceipt: 'Unduh Kwitansi (PDF)',
      toastReceipt: 'Kwitansi resmi telah diunduh ke perangkat Anda!',
      toastProofSent: 'Bukti transfer berhasil dikirim! Tim finance akan memverifikasi dalam 2 jam kerja.'
    },
    en: {
      title: 'Billing & Payment Records',
      subtitle: 'Official receipts, package fee breakdown, and bank transfer confirmation',
      totalBill: 'Total Package Fee',
      totalPaid: 'Total Amount Paid',
      remainingBill: 'Remaining Balance',
      statusLunas: 'PAID IN FULL',
      statusDp: 'DOWNPAYMENT PAID',
      statusUnpaid: 'UNPAID',
      uploadProofBtn: 'Upload New Payment Proof',
      historyTitle: 'Official Transactions & Receipts',
      receiptNo: 'Receipt No',
      bankDestTitle: 'Official Agency Bank Accounts',
      downloadReceipt: 'Download Receipt (PDF)',
      toastReceipt: 'Official payment receipt downloaded successfully!',
      toastProofSent: 'Payment proof submitted! Finance team will verify within 2 hours.'
    }
  }[language];

  const handleUploadProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) {
      triggerToast('Mohon masukkan nominal transfer yang valid!', 'error');
      return;
    }

    const newTx = {
      id: 'PAY-' + Math.floor(100 + Math.random() * 900),
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      description: `Pembayaran via ${bankDestination} - ${jamaah.name}`,
      amount: Number(payAmount),
      status: 'PENDING' as const,
      receiptNumber: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      paymentMethod: `Transfer Bank ${bankDestination}`
    };

    setPaymentList([newTx, ...paymentList]);
    triggerToast(t.toastProofSent, 'success');
    setShowUploadModal(false);
    setPayAmount('');
  };

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
          onClick={() => setShowUploadModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center space-x-2"
        >
          <span>📤</span>
          <span>{t.uploadProofBtn}</span>
        </button>
      </div>

      {/* 1. FINANCIAL SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Total Cost */}
        <div className={`p-5 rounded-2xl border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
            <span>{t.totalBill}</span>
            <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">🏷️</span>
          </div>
          <p className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            Rp {totalPrice.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            Paket: {jamaah.package}
          </p>
        </div>

        {/* Total Paid */}
        <div className={`p-5 rounded-2xl border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-2">
            <span>{t.totalPaid}</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10">✓</span>
          </div>
          <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            Rp {paidAmount.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            Status: {remaining === 0 ? t.statusLunas : t.statusDp}
          </p>
        </div>

        {/* Remaining Balance */}
        <div className={`p-5 rounded-2xl border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-bold mb-2">
            <span>{t.remainingBill}</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10">⏳</span>
          </div>
          <p className={`text-2xl font-black font-mono ${remaining === 0 ? 'text-slate-400' : 'text-amber-500'}`}>
            Rp {remaining.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            {remaining === 0 ? 'Semua tagihan telah lunas' : 'Batas pelunasan: H-14 Keberangkatan'}
          </p>
        </div>
      </div>

      {/* 2. OFFICIAL BANK ACCOUNTS CARD */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/30 text-white space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🏦</span>
            <h2 className="text-sm font-black uppercase tracking-wider text-emerald-300">
              {t.bankDestTitle}
            </h2>
          </div>
          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
            Aman & Terdaftar OJK
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <p className="text-[10px] text-emerald-300 font-bold">Bank Syariah Indonesia (BSI)</p>
            <p className="text-base font-black font-mono text-white tracking-wider">719-0022-8819</p>
            <p className="text-[10px] text-slate-400">a.n. PT Al Haramain Travel Utama</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <p className="text-[10px] text-emerald-300 font-bold">Bank Mandiri (Virtual Account)</p>
            <p className="text-base font-black font-mono text-white tracking-wider">8890-0812-1111-2222</p>
            <p className="text-[10px] text-slate-400">a.n. VA UMROH - AHMAD SUBAGJA</p>
          </div>
        </div>
      </div>

      {/* 3. TRANSACTION HISTORY & OFFICIAL RECEIPTS */}
      <div className={`p-6 sm:p-8 rounded-3xl border space-y-4 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">
          📜 {t.historyTitle}
        </h2>

        <div className="space-y-3">
          {paymentList.map((tx) => (
            <div
              key={tx.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-500/40 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    {tx.receiptNumber}
                  </span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                    tx.status === 'VERIFIED'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  }`}>
                    {tx.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                  {tx.description}
                </p>
                <p className="text-[10px] text-slate-400">
                  {tx.date} • {tx.paymentMethod}
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                <p className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                  Rp {tx.amount.toLocaleString('id-ID')}
                </p>
                <button
                  type="button"
                  onClick={() => triggerToast(t.toastReceipt, 'success')}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1"
                >
                  <span>🧾</span>
                  <span>{t.downloadReceipt}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UPLOAD PAYMENT PROOF MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Upload Bukti Transfer Bank
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadProof} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Bank Tujuan Transfer
                </label>
                <select
                  value={bankDestination}
                  onChange={(e) => setBankDestination(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                >
                  <option value="BSI">Bank Syariah Indonesia (BSI) - 71900228819</option>
                  <option value="Mandiri">Bank Mandiri VA - 8890081211112222</option>
                  <option value="BCA">Bank Central Asia (BCA) - 0129988771</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Nominal Transfer (IDR)
                </label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="Contoh: 15000000"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-bold"
                />
              </div>

              {/* Upload Box */}
              <div className="border-2 border-dashed border-emerald-500/40 rounded-2xl p-4 text-center space-y-1 bg-emerald-50/30 dark:bg-emerald-950/20">
                <span className="text-2xl block">📸</span>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Lampirkan Foto Struk / Screenshot Bukti Transfer
                </p>
                <input type="file" className="hidden" id="file-proof" />
                <label
                  htmlFor="file-proof"
                  className="inline-block px-3 py-1.5 bg-emerald-600 text-white font-bold text-[11px] rounded-xl cursor-pointer shadow-xs mt-1"
                >
                  Pilih Berkas
                </label>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  Kirim Bukti Pembayaran
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
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
