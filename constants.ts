
import { Jamaah, Package, Reminder, FinancialSummary, JamaahStatus, PackageStatus, OpsTask } from './types';

export const NAVIGATION_LINKS = [
  { name: 'Dashboard', icon: 'dashboard' },
  { name: 'Paket & Penjualan', icon: 'package' },
  { name: 'Jamaah', icon: 'users' },
  { name: 'Operasional', icon: 'ops' },
  { name: 'Visa & Dokumen', icon: 'visa' },
  { name: 'Keuangan', icon: 'finance' },
  { name: 'Laporan', icon: 'report' },
];

export const JAMAah_STATS = {
    active: 128,
    departures: 8,
    visaApproved: 110,
    booked: 75,
    confirmed: 128,
    cancelled: 5,
    departed: 60,
};

export const JAMAAH_MOCK: Jamaah[] = [
  { id: 'JMH001', name: 'Ahmad Subagja', avatarUrl: 'https://picsum.photos/seed/man1/40/40', package: 'Umroh Berkah Ramadhan', departureDate: '15 Mar 2025', status: JamaahStatus.VISA_APPROVED, kloter: 'Kloter A' },
  { id: 'JMH002', name: 'Siti Aminah', avatarUrl: 'https://picsum.photos/seed/woman1/40/40', package: 'Umroh Plus Turki', departureDate: '20 Apr 2025', status: JamaahStatus.PAID, kloter: 'Kloter B' },
  { id: 'JMH003', name: 'Budi Santoso', avatarUrl: 'https://picsum.photos/seed/man2/40/40', package: 'Umroh Berkah Ramadhan', departureDate: '15 Mar 2025', status: JamaahStatus.BOOKED, kloter: 'Kloter A' },
  { id: 'JMH004', name: 'Dewi Lestari', avatarUrl: 'https://picsum.photos/seed/woman2/40/40', package: 'Umroh Liburan Sekolah', departureDate: '10 Jun 2025', status: JamaahStatus.DEPARTED, kloter: 'Kloter C' },
  { id: 'JMH005', name: 'Muhammad Yusuf', avatarUrl: 'https://picsum.photos/seed/man3/40/40', package: 'Umroh Plus Turki', departureDate: '20 Apr 2025', status: JamaahStatus.RETURNED, kloter: 'Kloter B' },
  { id: 'JMH006', name: 'Rina Fauziah', avatarUrl: 'https://picsum.photos/seed/woman3/40/40', package: 'Umroh Berkah Ramadhan', departureDate: '15 Mar 2025', status: JamaahStatus.CANCELLED, kloter: 'Kloter A' },
];

export const PACKAGES_MOCK: Package[] = [
    { id: 'PKG01', name: 'Umroh Berkah Ramadhan', duration: 12, price: 35000000, airline: 'Saudia Airlines', hotel: '5 Bintang', quota: 50, booked: 45, status: PackageStatus.PUBLISHED },
    { id: 'PKG02', name: 'Umroh Plus Turki', duration: 15, price: 42000000, airline: 'Turkish Airlines', hotel: '5 Bintang', quota: 40, booked: 25, status: PackageStatus.PUBLISHED },
    { id: 'PKG03', name: 'Umroh Liburan Sekolah', duration: 9, price: 28000000, airline: 'Garuda Indonesia', hotel: '4 Bintang', quota: 100, booked: 100, status: PackageStatus.SOLD_OUT },
    { id: 'PKG04', name: 'Haji Khusus VIP', duration: 25, price: 250000000, airline: 'Qatar Airways', hotel: 'Hotel Depan Masjid', quota: 20, booked: 5, status: PackageStatus.DRAFT },
];

export const REMINDERS_MOCK: Reminder[] = [
    { id: 1, title: 'Pembayaran Belum Lunas', description: 'Pelunasan paket Umroh Plus Turki', jamaahName: 'Budi Santoso', dueDate: '10 Mar 2025' },
    { id: 2, title: 'Paspor Belum Diupload', description: 'Dokumen paspor belum lengkap', jamaahName: 'Siti Aminah', dueDate: '12 Mar 2025' },
    { id: 3, title: 'Visa Pending', description: 'Pengajuan visa masih dalam proses', jamaahName: 'Ahmad Subagja', dueDate: 'N/A' },
];

export const FINANCIAL_SUMMARY_MOCK: FinancialSummary[] = [
    { kloter: 'Jan 2025', revenue: 800, expense: 650, profit: 150 },
    { kloter: 'Feb 2025', revenue: 1200, expense: 950, profit: 250 },
    { kloter: 'Mar 2025', revenue: 1500, expense: 1100, profit: 400 },
    { kloter: 'Apr 2025', revenue: 950, expense: 700, profit: 250 },
    { kloter: 'Mei 2025', revenue: 1100, expense: 850, profit: 250 },
];

export const MOCK_TASKS: OpsTask[] = [
  // --- Kloter A ---
  { 
    id: '1', 
    title: 'Submit Visa Applications', 
    category: 'Pre-Departure', 
    dueDate: '2025-03-01', 
    completed: true, 
    assignee: 'Abdullah', 
    priority: 'High', 
    description: 'Ensure all passports are valid for at least 6 months. Submit via Muqeem portal and verify approval status daily.',
    subtasks: [
        { id: 'st1', title: 'Collect physical passports', completed: true },
        { id: 'st2', title: 'Scan documents', completed: true },
        { id: 'st3', title: 'Upload to Muqeem', completed: true },
        { id: 'st4', title: 'Verify approval', completed: true }
    ],
    kloter: 'Kloter A'
  },
  { 
    id: '2', 
    title: 'Finalize Rooming List', 
    category: 'Pre-Departure', 
    dueDate: '2025-03-10', 
    completed: false, 
    assignee: 'Siti', 
    priority: 'High', 
    description: 'Coordinate with hotel management in Makkah and Madinah. Group families together as requested by the sales team.',
    subtasks: [
        { id: 'st5', title: 'Get latest manifest', completed: true },
        { id: 'st6', title: 'Assign families', completed: false },
        { id: 'st7', title: 'Send to Hotel', completed: false }
    ],
    kloter: 'Kloter A'
  },
  { 
    id: '3', 
    title: 'Distribute ID Cards & Batik', 
    category: 'Pre-Departure', 
    dueDate: '2025-03-12', 
    completed: false, 
    assignee: 'Budi', 
    priority: 'Medium', 
    description: 'Verify inventory of Batik uniforms against the manifest. ID Cards must be printed with emergency contact numbers.',
    subtasks: [],
    kloter: 'Kloter A'
  },
  { 
    id: '4', 
    title: 'Check-in Hotel Makkah', 
    category: 'In-Saudi', 
    dueDate: '2025-03-16', 
    completed: false, 
    assignee: 'Mutawif', 
    priority: 'High', 
    description: 'Arrive 2 hours early to handle key distribution. Ensure luggage handling service is ready at the lobby.',
    subtasks: [],
    kloter: 'Kloter A'
  },
  { 
    id: '5', 
    title: 'Collect Feedback Forms', 
    category: 'Post-Return', 
    dueDate: '2025-03-28', 
    completed: false, 
    assignee: 'Admin', 
    priority: 'Low', 
    description: 'Send digital feedback forms via WhatsApp to all group members and collect physical forms if distributed on the bus.',
    subtasks: [],
    kloter: 'Kloter A'
  },

  // --- Kloter B ---
  { 
    id: '6', 
    title: 'Verify Flights & Schedule Info', 
    category: 'Pre-Departure', 
    dueDate: '2025-04-05', 
    completed: false, 
    assignee: 'Abdullah', 
    priority: 'High', 
    description: 'Double check with Saudi Airlines regarding flight time deviations or seat map assignments for Kloter B.',
    subtasks: [
        { id: 'st8', title: 'Confirm booking status PNR', completed: true },
        { id: 'st9', title: 'Generate group seat maps', completed: false }
    ],
    kloter: 'Kloter B'
  },
  { 
    id: '12', 
    title: 'Briefing Manifes & Boarding Passes', 
    category: 'Pre-Departure', 
    dueDate: '2025-04-12', 
    completed: false, 
    assignee: 'Siti', 
    priority: 'Medium', 
    description: 'Produce updated flight manifest PDF/CSV and verify passports expiry are over six months.',
    subtasks: [],
    kloter: 'Kloter B'
  },
  { 
    id: '7', 
    title: 'Coordinate Madinah Hotel Team', 
    category: 'In-Saudi', 
    dueDate: '2025-04-22', 
    completed: false, 
    assignee: 'Mutawif', 
    priority: 'Medium', 
    description: 'Align with Pullman Zamzam Madinah for meal coupons and luggage services upon arrival.',
    subtasks: [],
    kloter: 'Kloter B'
  },
  { 
    id: '8', 
    title: 'Compile Pilgrim Evaluation', 
    category: 'Post-Return', 
    dueDate: '2025-05-05', 
    completed: false, 
    assignee: 'Siti', 
    priority: 'Low', 
    description: 'Initiate post-trip survey on WhatsApp and compile feedback report for operational enhancement.',
    subtasks: [],
    kloter: 'Kloter B'
  },

  // --- Kloter C ---
  { 
    id: '9', 
    title: 'Meningitis Vaccine Check', 
    category: 'Pre-Departure', 
    dueDate: '2025-05-25', 
    completed: false, 
    assignee: 'Admin', 
    priority: 'High', 
    description: 'Log and crosscheck immunization documents for all pilgrims registered in Kloter C to prevent visa rejection.',
    subtasks: [
        { id: 'st10', title: 'Check digital Kemenkes book', completed: false },
        { id: 'st11', title: 'Upload proof to Saudi Portal', completed: false }
    ],
    kloter: 'Kloter C'
  },
  { 
    id: '10', 
    title: 'Bus Transport Booking Saudi', 
    category: 'In-Saudi', 
    dueDate: '2025-06-12', 
    completed: false, 
    assignee: 'Siti', 
    priority: 'High', 
    description: 'Coordinate with Dallah Transport company for VIP bus tracking from Jeddah Airport to Mecca.',
    subtasks: [],
    kloter: 'Kloter C'
  },
  { 
    id: '11', 
    title: 'Reconciliation of Cash Advance', 
    category: 'Post-Return', 
    dueDate: '2025-06-25', 
    completed: false, 
    assignee: 'Budi', 
    priority: 'Medium', 
    description: 'Inspect receipts for tips, secondary transports and snacks spent during Kloter C journey.',
    subtasks: [],
    kloter: 'Kloter C'
  }
];

export const TEAM_MEMBERS = ['Abdullah', 'Siti', 'Budi', 'Mutawif', 'Admin', 'Unassigned'];
