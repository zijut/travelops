import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { useApp } from '../AppContext';
import { translations } from '../translations';
import { Icon } from './shared/Icon';
import { Card } from './shared/Card';
import { JamaahStatus } from '../types';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface RoomAllocation {
  id: string;
  roomName: string;
  type: string;
  pilgrimIds: string[];
}

const Dashboard: React.FC = () => {
  const { isDarkMode, language, jamaahList, packages, currentUser } = useApp();
  const t = translations[language];
  const email = currentUser?.email || '';

  // Helper translations for statuses
  const getStatusLabelText = (status: string) => {
    return status;
  };

  // --- Real-Time Statistics Calculation ---
  // Active Pilgrims (excluding Cancelled)
  const activeJamaahCount = jamaahList.filter(j => j.status !== JamaahStatus.CANCELLED).length;
  
  // Total Visa Approved
  const visaApprovedCount = jamaahList.filter(j => j.status === JamaahStatus.VISA_APPROVED).length;
  const visaApprovalRate = activeJamaahCount > 0 ? Math.round((visaApprovedCount / activeJamaahCount) * 100) : 0;

  // Active Kloters (Distinct groups of travelers in database)
  const activeKlotersSet = new Set(jamaahList.map(j => j.kloter));
  const activeKlotersCount = activeKlotersSet.has('') ? Math.max(1, activeKlotersSet.size - 1) : Math.max(1, activeKlotersSet.size);

  // Total Revenue & Profit simulated based on actual prices & registered bookings
  const dynamicTotalRevenue = packages.reduce((acc, p) => acc + (p.price * p.booked), 0);
  const totalBillion = (dynamicTotalRevenue / 1000000000).toFixed(1);

  // Recharts representation of Pilgrim Statuses based on ACTUAL list
  const statusCounts = jamaahList.reduce((acc: { [key: string]: number }, j) => {
    acc[j.status] = (acc[j.status] || 0) + 1;
    return acc;
  }, {});

  const jamaahStatusData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status]
  }));

  // Recharts monthly financial summary - DYNAMICALLY AGGREGATED FROM FINANCE LEDGER
  const transactions = (() => {
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
      { id: 'TX-103', date: '2026-06-10', category: 'Hotel Booking', description: 'Booking Hotel Anjum Makkah 10 Malam', amount: 180000000, type: 'EXPENSE', status: 'COMPLETED' },
      { id: 'TX-104', date: '2026-06-09', category: 'Visa Processing', description: 'Biaya Visa 45 Pax Kloter B', amount: 67500000, type: 'EXPENSE', status: 'PENDING' },
      { id: 'TX-105', date: '2026-06-08', category: 'Jamaah Payment', description: 'Uang Muka Umroh Keluarga Ibu Susi (5 Pax)', amount: 75000000, type: 'INCOME', status: 'COMPLETED' }
    ] : [];
  })();

  const monthNamesId = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const getMonthStr = (dateStr: string) => {
    if (!dateStr || !dateStr.includes('-')) return 'Lainnya';
    const parts = dateStr.split('-');
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${monthNamesId[monthIdx]} ${year}`;
    }
    return 'Lainnya';
  };

  const standardMonthsSet = new Set(['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'Mei 2026', 'Jun 2026']);
  const monthlyAggregates: { [month: string]: { revenue: number; expense: number } } = {};
  
  standardMonthsSet.forEach(m => {
    monthlyAggregates[m] = { revenue: 0, expense: 0 };
  });

  transactions.forEach((tx: any) => {
    const monthYear = getMonthStr(tx.date);
    if (!monthlyAggregates[monthYear]) {
      monthlyAggregates[monthYear] = { revenue: 0, expense: 0 };
    }
    const amt = Math.round(tx.amount / 1000000);
    if (tx.type === 'INCOME') {
      monthlyAggregates[monthYear].revenue += amt;
    } else if (tx.type === 'EXPENSE') {
      monthlyAggregates[monthYear].expense += amt;
    }
  });

  const dynamicFinancialData = Object.keys(monthlyAggregates)
    .sort((a, b) => {
      const getMonthIndex = (mStr: string) => {
        const parts = mStr.split(' ');
        const mIdx = monthNamesId.indexOf(parts[0]);
        const yr = parseInt(parts[1], 10) || 2026;
        return (yr * 12) + mIdx;
      };
      return getMonthIndex(a) - getMonthIndex(b);
    })
    .map(month => {
      const rev = monthlyAggregates[month].revenue;
      const exp = monthlyAggregates[month].expense;
      return {
        kloter: month,
        revenue: rev,
        expense: exp,
        profit: rev - exp
      };
    });

  // Dynamic Reminders listing (derived from database anomalies)
  const unpaidCount = jamaahList.filter(j => j.status === JamaahStatus.BOOKED).length;
  const inqCount = jamaahList.filter(j => j.status === JamaahStatus.INQUIRY).length;
  const dynamicReminders = [
    {
      id: 1,
      title: language === 'id' ? 'Pembayaran Belum Lunas' : 'Unpaid Balance Pending',
      description: language === 'id' ? `Terdapat ${unpaidCount} jamaah status booked belom lunas.` : `${unpaidCount} booked pilgrims require full payment audit.`,
      jamaahName: unpaidCount > 0 ? jamaahList.find(j => j.status === JamaahStatus.BOOKED)?.name || 'Admin check' : 'All Clear',
      dueDate: 'H-14'
    },
    {
      id: 2,
      title: language === 'id' ? 'Pengajuan Visa Kloter' : 'Group Visa Application',
      description: language === 'id' ? `Menunggu finalisasi paspor untuk ${activeKlotersCount} kloter.` : `Awaiting passport audit for ${activeKlotersCount} flight groups.`,
      jamaahName: visaApprovedCount < activeJamaahCount ? 'Urgent upload' : 'All verified',
      dueDate: 'H-10'
    },
    {
      id: 3,
      title: language === 'id' ? 'Inquiry Prospektif Baru' : 'New Prospective Inquiries',
      description: language === 'id' ? `Ada ${inqCount} calon jamaah dalam list penjajakan.` : `${inqCount} leads are currently in inquiry funnel.`,
      jamaahName: 'Sales Admin',
      dueDate: 'N/A'
    }
  ];

  // Load roomAllocations dynamically
  const roomAllocations: RoomAllocation[] = (() => {
    if (!email) return [];
    try {
      const saved = localStorage.getItem(`travelops_rooming_allocations_${email}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return email === 'abdullah@alharamain.id' ? [
      { id: 'R101', roomName: 'Room 101 (Medina Plaza)', type: 'Quad', pilgrimIds: ['1', '3'] },
      { id: 'R102', roomName: 'Room 102 (Medina Plaza)', type: 'Quad', pilgrimIds: [] },
      { id: 'R201', roomName: 'Room 201 (Anjum Makkah)', type: 'Triple', pilgrimIds: [] },
      { id: 'R211', roomName: 'Room 211 (Anjum Makkah)', type: 'Double', pilgrimIds: [] }
    ] : [];
  })();

  // --- NEW FEATURE STATE: tourist Bus & Rooming Manifest Simulator ---
  const [selectedSimKloter, setSelectedSimKloter] = useState('Kloter A');
  const [selectedSeatPilgrim, setSelectedSeatPilgrim] = useState<string | null>(null);
  
  // Simulated Bus Seats map (Seat ID is key 1-45, value is Pilgrim ID or null)
  const [busSeats, setBusSeats] = useState<{ [key: string]: { seatNo: number; pilgrimId: string | null } }>(() => {
    const saved = localStorage.getItem(`travelops_bus_seats_${email}`);
    if (saved) return JSON.parse(saved);

    const initialSeats: { [key: string]: { seatNo: number; pilgrimId: string | null } } = {};
    for (let i = 1; i <= 45; i++) {
      let initialPilgrim: string | null = null;
      if (email === 'abdullah@alharamain.id') {
        if (i === 1) initialPilgrim = '1'; // Ahmad Subagja has id '1' in constants
        if (i === 5) initialPilgrim = '3'; // Budi Santoso has id '3' in constants
      }
      initialSeats[i.toString()] = { seatNo: i, pilgrimId: initialPilgrim };
    }
    return initialSeats;
  });

  // Reload bus seats when email changes
  React.useEffect(() => {
    const saved = localStorage.getItem(`travelops_bus_seats_${email}`);
    if (saved) {
      setBusSeats(JSON.parse(saved));
    } else {
      const initialSeats: { [key: string]: { seatNo: number; pilgrimId: string | null } } = {};
      for (let i = 1; i <= 45; i++) {
        let initialPilgrim: string | null = null;
        if (email === 'abdullah@alharamain.id') {
          if (i === 1) initialPilgrim = '1';
          if (i === 5) initialPilgrim = '3';
        }
        initialSeats[i.toString()] = { seatNo: i, pilgrimId: initialPilgrim };
      }
      setBusSeats(initialSeats);
    }
  }, [email]);

  // Sync bus seats to local storage
  React.useEffect(() => {
    if (email) {
      localStorage.setItem(`travelops_bus_seats_${email}`, JSON.stringify(busSeats));
    }
  }, [busSeats, email]);

  const pilgrimsInKloter = jamaahList.filter(j => j.kloter === selectedSimKloter);
  
  // Calculate who is assigned to bus (either this selected kloter or all)
  const isAssigned = (pilgrimId: string) => {
    return Object.values(busSeats).some(seat => seat.pilgrimId === pilgrimId);
  };

  const unasignedPilgrims = pilgrimsInKloter.filter(p => !isAssigned(p.id));

  const handleSeatClick = (seatId: string) => {
    const currentSeat = busSeats[seatId];
    
    // If seat is occupied, free it
    if (currentSeat.pilgrimId) {
      const removedName = jamaahList.find(j => j.id === currentSeat.pilgrimId)?.name || 'Pilgrim';
      setBusSeats(prev => ({
        ...prev,
        [seatId]: { ...prev[seatId], pilgrimId: null }
      }));
      return;
    }

    // If an unassigned pilgrim is selected, assign them to this empty seat
    if (selectedSeatPilgrim) {
      setBusSeats(prev => ({
        ...prev,
        [seatId]: { ...prev[seatId], pilgrimId: selectedSeatPilgrim }
      }));
      setSelectedSeatPilgrim(null);
    }
  };

  const occupiedSeatsCount = Object.values(busSeats).filter(s => s.pilgrimId !== null).length;

  return (
    <div className="space-y-4 font-sans animate-fade-in">
      
      {/* Real-time Dynamic Statistics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`flex items-center justify-between p-4 transition-all hover:-translate-y-0.5 duration-200 border ${
          isDarkMode 
            ? 'bg-slate-900 border-slate-800 text-white shadow-xl' 
            : 'bg-white border-slate-200 text-slate-800 shadow-sm'
        }`}>
          <div className="flex items-center space-x-3.5">
            <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-emerald-950 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
              <Icon name="users" className="h-5 w-5" />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>{t.jamaahAktif}</p>
              <h4 className="text-xl font-extrabold leading-tight">{activeJamaahCount} <span className="text-[11px] font-medium text-gray-400">pax</span></h4>
            </div>
          </div>
          <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">{t.activeOffline}</span>
        </Card>

        <Card className={`flex items-center justify-between p-4 transition-all hover:-translate-y-0.5 duration-200 border ${
          isDarkMode 
            ? 'bg-slate-900 border-slate-800 text-white shadow-xl' 
            : 'bg-white border-slate-200 text-slate-800 shadow-sm'
        }`}>
          <div className="flex items-center space-x-3.5">
            <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-amber-950 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>
              <Icon name="plane" className="h-5 w-5" />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>{t.totalKeberangkatan}</p>
              <h4 className="text-xl font-extrabold leading-tight">{activeKlotersCount} <span className="text-[11px] text-gray-400">{t.kloter}</span></h4>
            </div>
          </div>
          <span className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{t.scheduled}</span>
        </Card>

        <Card className={`flex items-center justify-between p-4 transition-all hover:-translate-y-0.5 duration-200 border ${
          isDarkMode 
            ? 'bg-slate-900 border-slate-800 text-white shadow-xl' 
            : 'bg-white border-slate-200 text-slate-800 shadow-sm'
        }`}>
          <div className="flex items-center space-x-3.5">
            <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-blue-950 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
              <Icon name="visa" className="h-5 w-5" />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>{t.totalVisaApproved}</p>
              <h4 className="text-xl font-extrabold leading-tight">{visaApprovedCount} <span className="text-[10px] text-gray-400">({visaApprovalRate}%)</span></h4>
            </div>
          </div>
          <span className="text-[9px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">OK</span>
        </Card>

        <Card className={`flex items-center justify-between p-4 transition-all hover:-translate-y-0.5 duration-200 border ${
          isDarkMode 
            ? 'bg-slate-900 border-slate-800 text-white shadow-xl' 
            : 'bg-white border-slate-200 text-slate-800 shadow-sm'
        }`}>
          <div className="flex items-center space-x-3.5">
            <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-rose-950 text-rose-450' : 'bg-rose-50 text-rose-700'}`}>
              <Icon name="alert" className="h-5 w-5" />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>{t.tugasMendesak}</p>
              <h4 className="text-xl font-extrabold leading-tight">Rp {dynamicTotalRevenue > 0 ? totalBillion : '0'}M</h4>
            </div>
          </div>
          <span className="text-[9px] bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{t.urgent}</span>
        </Card>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Recharts BarChart model */}
        <Card className={`lg:col-span-2 p-4 border transition-colors duration-200 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>
                {t.financialReport}
              </h3>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">{t.financialTrend}</p>
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${isDarkMode ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-800'}`}>
              {language === 'id' ? 'Pendapatan Katalog: ' : 'Booked Catalogue: '} Rp {dynamicTotalRevenue.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="h-[210px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicFinancialData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155/30" : "#f1f5f9"} />
                <XAxis dataKey="kloter" tick={{ fontSize: 9, fill: isDarkMode ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: isDarkMode ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value: number) => `Rp ${value} Jt`} 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', 
                    borderColor: isDarkMode ? '#475569' : '#e2e8f0',
                    color: isDarkMode ? '#ffffff' : '#0f172a',
                    fontSize: '11px', 
                    borderRadius: '8px' 
                  }} 
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar dataKey="revenue" fill="#10b981" name={t.income} radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#f59e0b" name={t.expense} radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#3b82f6" name={t.netProfit} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recharts PieChart Status model */}
        <Card className={`p-4 border transition-colors duration-200 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
        }`}>
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>
            {t.statusBreakdown}
          </h3>
          <div className="h-[210px] relative flex flex-col justify-center">
            {jamaahStatusData.length === 0 ? (
              <p className="text-center text-xs italic text-gray-450">{language === 'id' ? 'No Data Jamaah' : 'No Pilgrims Data'}</p>
            ) : (
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie 
                    data={jamaahStatusData} 
                    cx="50%" 
                    cy="45%" 
                    labelLine={false} 
                    outerRadius={65} 
                    innerRadius={30}
                    dataKey="value" 
                    nameKey="name" 
                    label={({ name, percent }) => `${getStatusLabelText(name)} ${(percent * 100).toFixed(0)}%`}
                    style={{ fontSize: '8px', fontWeight: 'bold', fill: isDarkMode ? '#cbd5e1' : '#1e293b' }}
                  >
                    {jamaahStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', 
                      borderColor: isDarkMode ? '#475569' : '#e2e8f0', 
                      fontSize: '10px',
                      color: isDarkMode ? '#ffffff' : '#000000'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* NEW FUNCTIONAL FEATURE: Interactive Bus Seat Planner & Room occupancy list */}
      <Card className={`p-4 border transition-colors duration-200 ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-3 mb-4 gap-3 border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-500 text-white text-[9px] font-black uppercase rounded px-1.5 py-0.5">NEW FEATURE / FITUR BARU</span>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>
                {t.newFeatureTitle}
              </h3>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">{t.newFeatureSubtitle}</p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="font-semibold">{t.filterKloter}:</span>
            <select 
              value={selectedSimKloter}
              onChange={(e) => setSelectedSimKloter(e.target.value)}
              className={`p-1.5 rounded-lg border text-xs focus:ring-1 focus:ring-emerald-500 bg-transparent ${
                isDarkMode ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-800'
              }`}
            >
              <option value="Kloter A" className={isDarkMode ? 'bg-slate-900' : 'bg-white'}>Kloter A</option>
              <option value="Kloter B" className={isDarkMode ? 'bg-slate-900' : 'bg-white'}>Kloter B</option>
              <option value="Kloter C" className={isDarkMode ? 'bg-slate-900' : 'bg-white'}>Kloter C</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Room Allocation manifest summary */}
          <div className="lg:col-span-4 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider border-b pb-1 dark:border-slate-800 flex items-center text-slate-700 dark:text-slate-300">
              <svg className="h-4 w-4 mr-1.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {t.roomDistribution} ({selectedSimKloter})
            </h4>
            
            {(() => {
              const allocatedRoomsForKloter = roomAllocations.filter(room => {
                return room.pilgrimIds.some(pid => {
                  const pilgrim = jamaahList.find(j => j.id === pid);
                  return pilgrim && pilgrim.kloter === selectedSimKloter;
                });
              });

              const quadCount = allocatedRoomsForKloter.filter(r => r.type === 'Quad').length;
              const tripleCount = allocatedRoomsForKloter.filter(r => r.type === 'Triple').length;
              const doubleCount = allocatedRoomsForKloter.filter(r => r.type === 'Double').length;

              const capacityMap = { Quad: 4, Triple: 3, Double: 2, Suite: 8 };
              let totalBeds = 0;
              let occupiedBeds = 0;

              allocatedRoomsForKloter.forEach(r => {
                const cap = (capacityMap as any)[r.type] || 4;
                totalBeds += cap;
                const kloterPilgrimsCount = r.pilgrimIds.filter(pid => {
                  const pilgrim = jamaahList.find(j => j.id === pid);
                  return pilgrim && pilgrim.kloter === selectedSimKloter;
                }).length;
                occupiedBeds += kloterPilgrimsCount;
              });

              const occupancyRatePercent = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
              const paxInRooms = pilgrimsInKloter.filter(p => roomAllocations.some(room => room.pilgrimIds.includes(p.id))).length;

              return (
                <>
                  <div className="space-y-2">
                    {/* Quad rooms */}
                    <div className={`p-2.5 rounded-lg border ${
                      isDarkMode ? 'bg-slate-900/30 border-slate-800/80 text-white' : 'bg-slate-50/50 border-slate-100'
                    }`}>
                      <div className="flex justify-between text-xs font-bold">
                        <span>{t.roomQuad}</span>
                        <span className="text-emerald-500">
                          {quadCount} {language === 'id' ? 'Kamar' : 'Rooms'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">4 beds configured. Group family units prioritised.</p>
                    </div>

                    {/* Triple rooms */}
                    <div className={`p-2.5 rounded-lg border ${
                      isDarkMode ? 'bg-slate-900/30 border-slate-800/80 text-white' : 'bg-slate-50/50 border-slate-100'
                    }`}>
                      <div className="flex justify-between text-xs font-bold">
                        <span>{t.roomTriple}</span>
                        <span className="text-emerald-500">
                          {tripleCount} {language === 'id' ? 'Kamar' : 'Rooms'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">3 beds configured. Extra rolling bed on demand.</p>
                    </div>

                    {/* Double rooms */}
                    <div className={`p-2.5 rounded-lg border ${
                      isDarkMode ? 'bg-slate-900/30 border-slate-800/80 text-white' : 'bg-slate-50/50 border-slate-100'
                    }`}>
                      <div className="flex justify-between text-xs font-bold">
                        <span>{t.roomDouble}</span>
                        <span className="text-emerald-500">
                          {doubleCount} {language === 'id' ? 'Kamar' : 'Rooms'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">2 master beds perfect for couples & VIPs.</p>
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl flex items-center justify-between border ${
                    isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-emerald-50/30 border-emerald-100'
                  }`}>
                    <div className="text-left">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{t.occupancyRate}</span>
                      <p className="text-base font-black text-emerald-500">{occupancyRatePercent}%</p>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500">{paxInRooms} / {pilgrimsInKloter.length} {t.paxAllocated}</span>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Interactive Bus Seat Simulator */}
          <div className="lg:col-span-8 flex flex-col space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center text-slate-700 dark:text-slate-300">
                <svg className="h-4 w-4 mr-1.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-1.213 1.087q-.219.541-.219 1.087v.525" />
                </svg>
                {t.busSeatSimulator} (45 {language === 'id' ? 'Kursi' : 'Seats'})
              </h4>
              <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1 sm:mt-0">
                {occupiedSeatsCount} / 45 {language === 'id' ? 'Terisi' : 'Seats occupied'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left Side: List of Pilgrims needing a Seat */}
              <div className="md:col-span-4 bg-slate-50/50 dark:bg-slate-950/45 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-2 px-1">
                  {t.unassignedPilgrims}
                </p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {unasignedPilgrims.length === 0 ? (
                    <p className="text-[10px] text-center italic text-gray-400 p-4">
                      {language === 'id' ? 'Semua jamaah kloter ini sudah dapat kursi' : 'All pilgrims seated'}
                    </p>
                  ) : (
                    unasignedPilgrims.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedSeatPilgrim(selectedSeatPilgrim === p.id ? null : p.id)}
                        className={`w-full text-left p-1.5 rounded-lg text-[11px] flex items-center justify-between border transition-all cursor-pointer ${
                          selectedSeatPilgrim === p.id 
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 font-semibold' 
                            : isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{p.name}</span>
                        <span className="text-[9px] opacity-75 shrink-0 px-1 bg-slate-100 dark:bg-slate-800 rounded">
                          {t.assignSeat}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Right Side: Bus Seating Layout (Interactive grid) */}
              <div className="md:col-span-8 flex flex-col justify-center bg-slate-50/50 dark:bg-slate-950/30 p-4 rounded-2xl border border-slate-200/65 dark:border-slate-800 relative">
                {/* Windshield */}
                <div className="w-full h-2.5 bg-slate-300 dark:bg-slate-800 rounded-t-xl mb-4 flex items-center justify-center">
                  <div className="w-12 h-1 bg-slate-500 rounded" />
                </div>
                
                {/* Visual Seats Grid */}
                <div className="grid grid-cols-5 gap-1.5 select-none max-h-60 overflow-y-auto pr-1">
                  {Array.from({ length: 9 }).map((_, rowIndex) => {
                    return (
                      <React.Fragment key={rowIndex}>
                        {/* Seat 1 (Window Left) */}
                        {(() => {
                          const seatId = (rowIndex * 4 + 1).toString();
                          const seat = busSeats[seatId];
                          const occupant = seat ? jamaahList.find(j => j.id === seat.pilgrimId) : null;
                          return (
                            <button
                              onClick={() => seat && handleSeatClick(seatId)}
                              title={occupant ? occupant.name : `Seat ${seatId}`}
                              className={`h-7 rounded-sm flex items-center justify-center text-[10px] font-bold border transition-all ${
                                occupant 
                                  ? 'bg-emerald-500 text-white border-emerald-650' 
                                  : isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-400'
                              }`}
                            >
                              {occupant ? occupant.name.slice(0, 2).toUpperCase() : seatId}
                            </button>
                          );
                        })()}

                        {/* Seat 2 (Aisle Left) */}
                        {(() => {
                          const seatId = (rowIndex * 4 + 2).toString();
                          const seat = busSeats[seatId];
                          const occupant = seat ? jamaahList.find(j => j.id === seat.pilgrimId) : null;
                          return (
                            <button
                              onClick={() => seat && handleSeatClick(seatId)}
                              title={occupant ? occupant.name : `Seat ${seatId}`}
                              className={`h-7 rounded-sm flex items-center justify-center text-[10px] font-bold border transition-all mr-2 ${
                                occupant 
                                  ? 'bg-emerald-500 text-white border-emerald-650' 
                                  : isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-400'
                              }`}
                            >
                              {occupant ? occupant.name.slice(0, 2).toUpperCase() : seatId}
                            </button>
                          );
                        })()}

                        {/* Center Aisle Indicator */}
                        <div className="flex items-center justify-center text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
                          •
                        </div>

                        {/* Seat 3 (Aisle Right) */}
                        {(() => {
                          const seatId = (rowIndex * 4 + 3).toString();
                          const seat = busSeats[seatId];
                          const occupant = seat ? jamaahList.find(j => j.id === seat.pilgrimId) : null;
                          return (
                            <button
                              onClick={() => seat && handleSeatClick(seatId)}
                              title={occupant ? occupant.name : `Seat ${seatId}`}
                              className={`h-7 rounded-sm flex items-center justify-center text-[10px] font-bold border transition-all ml-2 ${
                                occupant 
                                  ? 'bg-emerald-500 text-white border-emerald-650' 
                                  : isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-400'
                              }`}
                            >
                              {occupant ? occupant.name.slice(0, 2).toUpperCase() : seatId}
                            </button>
                          );
                        })()}

                        {/* Seat 4 (Window Right) */}
                        {(() => {
                          const seatId = (rowIndex * 4 + 4).toString();
                          const seat = busSeats[seatId];
                          const occupant = seat ? jamaahList.find(j => j.id === seat.pilgrimId) : null;
                          return (
                            <button
                              onClick={() => seat && handleSeatClick(seatId)}
                              title={occupant ? occupant.name : `Seat ${seatId}`}
                              className={`h-7 rounded-sm flex items-center justify-center text-[10px] font-bold border transition-all ${
                                occupant 
                                  ? 'bg-emerald-500 text-white border-emerald-650' 
                                  : isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-400'
                              }`}
                            >
                              {occupant ? occupant.name.slice(0, 2).toUpperCase() : seatId}
                            </button>
                          );
                        })()}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      </Card>

      {/* Reminders list block */}
      <Card className={`p-4 border transition-colors duration-200 ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-3 border-b pb-2 dark:border-slate-800">
          <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center ${isDarkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>
            <Icon name="alert" className="h-5 w-5 shrink-0 text-amber-500 mr-2" /> {t.reminderTitle}
          </h3>
          <span className="text-[10px] text-amber-800 dark:text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-200/50">
            {dynamicReminders.length} {t.pendingLabel}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {dynamicReminders.map(reminder => (
            <div 
              key={reminder.id} 
              className={`flex items-center justify-between p-3 border rounded-xl hover:-translate-y-0.5 duration-200 transition-all text-left ${
                isDarkMode 
                  ? 'bg-slate-950/40 border-slate-800 hover:bg-slate-950 hover:border-slate-700' 
                  : 'bg-slate-50 border-slate-200 hover:bg-white hover:shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className={`p-2 rounded-lg shrink-0 ${isDarkMode ? 'bg-slate-800 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                  <Icon name="alert" className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate leading-tight">{reminder.title}</p>
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 truncate mt-1 leading-normal">
                    {reminder.description} • <span className="font-semibold text-emerald-500">{reminder.jamaahName}</span>
                  </p>
                </div>
              </div>
              <span className="text-[9px] text-rose-500 dark:text-rose-400 font-bold whitespace-nowrap bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full ml-2">
                {t.maxDeadline}: {reminder.dueDate}
              </span>
            </div>
          ))}
        </div>
      </Card>
      
    </div>
  );
};

export default Dashboard;
