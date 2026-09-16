
import { Jamaah, Package, Reminder, FinancialSummary, JamaahStatus, PackageStatus, OpsTask, ItineraryDay, ManasikDoa, UserPaymentRecord } from './types';

export const NAVIGATION_LINKS = [
  { name: 'Dashboard', icon: 'dashboard' },
  { name: 'Paket & Penjualan', icon: 'package' },
  { name: 'Jamaah', icon: 'users' },
  { name: 'Operasional', icon: 'ops' },
  { name: 'Visa & Dokumen', icon: 'visa' },
  { name: 'Keuangan', icon: 'finance' },
  { name: 'Laporan', icon: 'report' },
];

export const USER_NAVIGATION_LINKS = [
  { name: 'Ringkasan Perjalanan', path: '/user/dashboard', icon: 'dashboard' },
  { name: 'Dokumen & Visa', path: '/user/dokumen', icon: 'visa' },
  { name: 'Jadwal & Itinerary', path: '/user/itinerary', icon: 'clock' },
  { name: 'Kamar & Kursi Bus', path: '/user/kamar-bus', icon: 'hotel' },
  { name: 'Tagihan & Bukti Bayar', path: '/user/pembayaran', icon: 'finance' },
  { name: 'Buku Doa & Manasik', path: '/user/manasik', icon: 'book' },
  { name: 'Katalog Paket', path: '/user/paket', icon: 'package' },
  { name: 'Profil Jemaah', path: '/user/profil', icon: 'user' },
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
  { 
    id: 'JMH001', 
    name: 'Ahmad Subagja', 
    avatarUrl: 'https://picsum.photos/seed/man1/100/100', 
    package: 'Umroh Berkah Ramadhan', 
    departureDate: '15 Mar 2026', 
    status: JamaahStatus.VISA_APPROVED, 
    kloter: 'Kloter A',
    email: 'ahmad.subagja@gmail.com',
    phone: '+62 812-1111-2222',
    passportNumber: 'A1234500',
    passportExpiry: '2031-08-15',
    ktpNumber: '3171021405820003',
    birthDate: '1982-05-14',
    gender: 'L',
    bloodType: 'O+',
    city: 'Jakarta Selatan',
    emergencyContactName: 'Hj. Siti Rohmah (Istri)',
    emergencyContactPhone: '+62 812-9988-7711',
    emergencyRelation: 'Istri',
    hotelMakkah: 'Anjum Makkah (Bintang 5)',
    roomMakkah: 'Room 101',
    hotelMadinah: 'Pullman Zamzam Madinah (Bintang 5)',
    roomMadinah: 'Room 304',
    roomType: 'Quad',
    busNumber: 'Bus VIP 01 (Al-Haramain)',
    busSeatNumber: 1,
    totalPrice: 35000000,
    paidAmount: 35000000,
    paymentStatus: 'Lunas',
    visaNumber: 'EV-SA-9982410',
    visaIssueDate: '2026-02-28',
    visaExpiryDate: '2026-05-28',
    vaccineStatus: 'Verified'
  },
  { 
    id: 'JMH002', 
    name: 'Siti Aminah', 
    avatarUrl: 'https://picsum.photos/seed/woman1/100/100', 
    package: 'Umroh Plus Turki', 
    departureDate: '20 Apr 2026', 
    status: JamaahStatus.PAID, 
    kloter: 'Kloter B',
    email: 'siti.aminah@gmail.com',
    phone: '+62 812-3333-4444',
    passportNumber: 'A1234501',
    passportExpiry: '2030-11-20',
    ktpNumber: '3273014508850002',
    birthDate: '1985-08-15',
    gender: 'P',
    bloodType: 'A+',
    city: 'Bandung',
    emergencyContactName: 'H. Irfan Maulana (Suami)',
    emergencyContactPhone: '+62 813-2211-9988',
    emergencyRelation: 'Suami',
    hotelMakkah: 'Mövenpick Hajar Tower Makkah',
    roomMakkah: 'Room 201',
    hotelMadinah: 'Dar Al Taqwa Madinah',
    roomMadinah: 'Room 102',
    roomType: 'Triple',
    busNumber: 'Bus VIP 02 (Al-Haramain)',
    busSeatNumber: 5,
    totalPrice: 42000000,
    paidAmount: 42000000,
    paymentStatus: 'Lunas',
    visaNumber: 'EV-SA-7782190',
    visaIssueDate: '2026-03-01',
    visaExpiryDate: '2026-06-01',
    vaccineStatus: 'Verified'
  },
  { 
    id: 'JMH003', 
    name: 'Budi Santoso', 
    avatarUrl: 'https://picsum.photos/seed/man2/100/100', 
    package: 'Umroh Berkah Ramadhan', 
    departureDate: '15 Mar 2026', 
    status: JamaahStatus.BOOKED, 
    kloter: 'Kloter A',
    email: 'budi.santoso@gmail.com',
    phone: '+62 812-5555-6666',
    passportNumber: 'A1234502',
    passportExpiry: '2029-06-10',
    ktpNumber: '3578011202790001',
    birthDate: '1979-02-12',
    gender: 'L',
    bloodType: 'B+',
    city: 'Surabaya',
    emergencyContactName: 'Endah Sulistyowati (Adik)',
    emergencyContactPhone: '+62 815-5544-3322',
    emergencyRelation: 'Adik',
    hotelMakkah: 'Anjum Makkah (Bintang 5)',
    roomMakkah: 'Room 101',
    hotelMadinah: 'Pullman Zamzam Madinah (Bintang 5)',
    roomMadinah: 'Room 304',
    roomType: 'Quad',
    busNumber: 'Bus VIP 01 (Al-Haramain)',
    busSeatNumber: 2,
    totalPrice: 35000000,
    paidAmount: 15000000,
    paymentStatus: 'DP',
    visaNumber: 'Pending Processing',
    vaccineStatus: 'Verified'
  },
  { 
    id: 'JMH004', 
    name: 'Dewi Lestari', 
    avatarUrl: 'https://picsum.photos/seed/woman2/100/100', 
    package: 'Umroh Liburan Sekolah', 
    departureDate: '10 Jun 2026', 
    status: JamaahStatus.DEPARTED, 
    kloter: 'Kloter C',
    email: 'dewi.lestari@gmail.com',
    phone: '+62 812-7777-8888',
    passportNumber: 'A1234503',
    passportExpiry: '2032-01-25',
    ktpNumber: '3174055509900004',
    birthDate: '1990-09-15',
    gender: 'P',
    bloodType: 'AB+',
    city: 'Jakarta Barat',
    emergencyContactName: 'Rahmat Hidayat (Ayah)',
    emergencyContactPhone: '+62 811-3322-1100',
    emergencyRelation: 'Ayah',
    hotelMakkah: 'Swissotel Makkah',
    roomMakkah: 'Room 502',
    hotelMadinah: 'Dallah Taibah',
    roomMadinah: 'Room 401',
    roomType: 'Double',
    busNumber: 'Bus VIP 03',
    busSeatNumber: 8,
    totalPrice: 28000000,
    paidAmount: 28000000,
    paymentStatus: 'Lunas',
    visaNumber: 'EV-SA-4451092',
    vaccineStatus: 'Verified'
  },
  { 
    id: 'JMH005', 
    name: 'Muhammad Yusuf', 
    avatarUrl: 'https://picsum.photos/seed/man3/100/100', 
    package: 'Umroh Plus Turki', 
    departureDate: '20 Apr 2026', 
    status: JamaahStatus.RETURNED, 
    kloter: 'Kloter B',
    email: 'muhammad.yusuf@gmail.com',
    phone: '+62 812-9999-0000',
    passportNumber: 'A1234504',
    passportExpiry: '2028-10-18',
    gender: 'L',
    bloodType: 'O+',
    city: 'Yogyakarta',
    emergencyContactName: 'Nur Hasanah (Ibu)',
    emergencyContactPhone: '+62 817-4433-2211',
    emergencyRelation: 'Ibu',
    hotelMakkah: 'Mövenpick Hajar Tower Makkah',
    roomMakkah: 'Room 201',
    hotelMadinah: 'Dar Al Taqwa Madinah',
    roomMadinah: 'Room 102',
    roomType: 'Triple',
    busNumber: 'Bus VIP 02 (Al-Haramain)',
    busSeatNumber: 6,
    totalPrice: 42000000,
    paidAmount: 42000000,
    paymentStatus: 'Lunas',
    visaNumber: 'EV-SA-1109483',
    vaccineStatus: 'Verified'
  },
  { 
    id: 'JMH006', 
    name: 'Rina Fauziah', 
    avatarUrl: 'https://picsum.photos/seed/woman3/100/100', 
    package: 'Umroh Berkah Ramadhan', 
    departureDate: '15 Mar 2026', 
    status: JamaahStatus.CANCELLED, 
    kloter: 'Kloter A',
    email: 'rina.fauziah@gmail.com',
    phone: '+62 813-1234-5678',
    passportNumber: 'A1234505',
    gender: 'P',
    bloodType: 'A+',
    city: 'Semarang',
    totalPrice: 35000000,
    paidAmount: 0,
    paymentStatus: 'Belum Bayar'
  },
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

export const MOCK_ITINERARY: ItineraryDay[] = [
  {
    day: 1,
    date: '15 Mar 2026',
    title: 'Keberangkatan Jakarta (CGK) Menuju Jeddah (JED)',
    location: 'Bandara Soekarno Hatta - Bandara King Abdulaziz Jeddah',
    dressCode: 'Batik Resmi Travel / Baju Bebas Rapi',
    notes: 'Koper bagasi wajib dikumpulkan H-4 jam sebelum take-off di Lounge Zukafia T3.',
    activities: [
      { time: '08:00 WIB', title: 'Berkumpul di Lounge Terminal 3 Bandara Soetta', description: 'Pembagian paspor, visa asli, boarding pass, & snack box keberangkatan.' },
      { time: '10:30 WIB', title: 'Briefing Manasik Singkat & Doa Bersama', description: 'Pengarahan oleh Ustadz Pembimbing / Mutawwif Al-Haramain.' },
      { time: '13:00 WIB', title: 'Take Off dengan Saudia Airlines SV-821', description: 'Penerbangan langsung Jakarta ke Jeddah (estimasi 9 jam 30 menit).' },
      { time: '19:30 AST', title: 'Tiba di Bandara King Abdulaziz Jeddah', description: 'Proses Imigrasi, klaim bagasi, dan berganti kain Ihram bagi jemaah pria.' },
      { time: '21:30 AST', title: 'Perjalanan Bus Menuju Hotel Makkah', description: 'Niat Umroh di Miqat Bandara/Yalamlam, Talbiyah bersama sepanjang perjalanan.' },
      { time: '23:30 AST', title: 'Check-in Hotel Anjum Makkah', description: 'Pembagian kunci kamar, istirahat sejenak, dan makan malam prasmanan.' }
    ]
  },
  {
    day: 2,
    date: '16 Mar 2026',
    title: 'Pelaksanaan Ibadah Umrah Wajib (Thawaf, Sa\'i, Tahallul)',
    location: 'Masjidil Haram, Makkah Al-Mukarramah',
    dressCode: 'Kain Ihram (Pria) / Busana Muslimah Putih (Wanita)',
    notes: 'Tetap bersama rombongan mutawwif dan bawa tas sandal masing-masing.',
    activities: [
      { time: '01:30 AST', title: 'Kumpul di Lobby Hotel Anjum', description: 'Berwudhu sempurna dan persiapan menuju Masjidil Haram dipandu Mutawwif.' },
      { time: '02:00 AST', title: 'Thawaf Umroh 7 Putaran', description: 'Mengelilingi Ka\'bah dimulai dari Hajar Aswad dengan bimbingan doa.' },
      { time: '03:15 AST', title: 'Sholat Sunnah Thawaf & Minum Air Zamzam', description: 'Sholat di belakang Maqam Ibrahim dan berdoa di Multazam.' },
      { time: '03:45 AST', title: 'Sa\'i antara Shofa dan Marwah', description: 'Berjalan 7 putaran dari Bukit Shofa ke Marwah.' },
      { time: '05:00 AST', title: 'Tahallul (Gunting Rambut)', description: 'Selesai prosesi Umrah pertama! Jamaah kembali ke hotel untuk sarapan.' },
      { time: '12:30 AST', title: 'Sholat Dzuhur & Memperbanyak Ibadah Mandiri', description: 'Ibadah sunnah, tadarus Al-Quran di Masjidil Haram.' }
    ]
  },
  {
    day: 3,
    date: '17 Mar 2026',
    title: 'Ziarah Kota Makkah & Napak Tilas Sejarah Islam',
    location: 'Jabal Tsur, Jabal Rahmah, Arafah, Muzdalifah, Mina, Jabal Nur',
    dressCode: 'Pakaian Bebas Rapi & Alas Kaki Nyaman',
    notes: 'Bawa payung, kacamata hitam, dan botol minum semprot untuk hidrasi.',
    activities: [
      { time: '07:30 AST', title: 'Kumpul di Lobby & Naik Bus VIP', description: 'Ziarah napak tilas rute Hajj dan situs bersejarah kenabian.' },
      { time: '08:30 AST', title: 'Ziarah Jabal Tsur & Padang Arafah', description: 'Melihat Gua Tsur tempat hijrah Rasulullah & berdoa di Jabal Rahmah.' },
      { time: '10:00 AST', title: 'Melintasi Muzdalifah & Mina (Jamarat)', description: 'Tadabbur kisah keteladanan Nabi Ibrahim AS.' },
      { time: '11:30 AST', title: 'Melewati Jabal Nur (Gua Hira)', description: 'Melihat gunung tempat turunnya wahyu pertama Surat Al-Alaq.' },
      { time: '12:00 AST', title: 'Kembali ke Hotel & Sholat Dzuhur', description: 'Waktu luang untuk istirahat dan memperbanyak sholat di Masjidil Haram.' }
    ]
  },
  {
    day: 4,
    date: '18 Mar 2026',
    title: 'Ibadah Mandiri & Umrah Kedua (Miqat Ji\'ranah)',
    location: 'Masjid Ji\'ranah & Masjidil Haram',
    dressCode: 'Kain Ihram bagi yang berniat Umrah Ba\'dal',
    notes: 'Bagi yang ingin badal umroh untuk orang tua/keluarga dapat mendaftar mutawwif.',
    activities: [
      { time: '09:00 AST', title: 'Keberangkatan ke Miqat Ji\'ranah', description: 'Mengambil niat umrah kedua bagi yang menghendaki.' },
      { time: '11:00 AST', title: 'Pelaksanaan Thawaf & Sa\'i Kedua', description: 'Prosesi umrah kedua dipandu tim mutawwif pendamping.' },
      { time: '20:00 AST', title: 'Kajian Malam: Fiqih Ibadah & Muhasabah', description: 'Tausiyah di Musholla Hotel Anjum Makkah.' }
    ]
  },
  {
    day: 5,
    date: '19 Mar 2026',
    title: 'Thawaf Wada\' & Perjalanan Kereta Cepat Haramain ke Madinah',
    location: 'Makkah ke Madinah Al-Munawwarah',
    dressCode: 'Pakaian Rapi & Nyaman Perjalanan',
    notes: 'Koper besar disiapkan di depan kamar jam 06:00 AST untuk dimuat ke truk bagasi.',
    activities: [
      { time: '07:00 AST', title: 'Pelaksanaan Thawaf Wada\' (Perpisahan)', description: 'Thawaf wada\' mengitari Ka\'bah sebelum meninggalkan Kota Makkah.' },
      { time: '11:00 AST', title: 'Menuju Stasiun Kereta Cepat Haramain (HHR)', description: 'Perjalanan cepat Makkah ke Madinah hanya 2 jam 15 menit.' },
      { time: '15:30 AST', title: 'Tiba di Madinah & Check-in Pullman Zamzam', description: 'Hotel bintang 5 di depan pelataran Masjid Nabawi pintu utama.' },
      { time: '17:00 AST', title: 'Ziarah Salam ke Makam Rasulullah SAW & Baqi', description: 'Mengucapkan salam kepada Nabi SAW, Abu Bakar RA, & Umar RA.' }
    ]
  },
  {
    day: 6,
    date: '20 Mar 2026',
    title: 'Ziarah Raudhah As-Syarifah (Taman Surga) & Masjid Nabawi',
    location: 'Raudhah, Masjid Nabawi',
    dressCode: 'Pakaian Sopan Bersih & Membawa Tasrat Nusuk',
    notes: 'Jadwal masuk Raudhah dipastikan sesuai QR Code aplikasi Nusuk.',
    activities: [
      { time: '08:00 AST', title: 'Masuk Raudhah Sesi Jamaah Pria', description: 'Sholat sunnah 2 rakaat di Raudhah, berdoa di depan Mimbar & Mihrab Nabi.' },
      { time: '14:00 AST', title: 'Masuk Raudhah Sesi Jamaah Wanita', description: 'Didampingi Ustadzah pembimbing khusus wanita.' },
      { time: '16:00 AST', title: 'Perbanyak Ibadah di Masjid Nabawi', description: 'Sholat berjamaah, bershalawat, dan i\'tikaf.' }
    ]
  }
];

export const MOCK_DOA_LIST: ManasikDoa[] = [
  {
    id: 'doa_ihram',
    category: 'ihram',
    title: 'Niat Umroh di Miqat',
    arabic: 'لَبَّيْكَ اللَّهُمَّ عُمْرَةً',
    latin: 'Labbaikallahumma \'Umratan',
    translation: 'Aku penuhi panggilan-Mu ya Allah untuk melaksanakan Umroh.',
    tips: 'Dibaca saat berada di Miqat setelah sholat sunnah ihram 2 rakaat.'
  },
  {
    id: 'doa_talbiyah',
    category: 'ihram',
    title: 'Bacaan Talbiyah',
    arabic: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لاَ شَرِيكَ لَكَ',
    latin: 'Labbaika Allahumma labbaik, labbaika laa syariika laka labbaik, innal hamda wan ni\'mata laka wal mulk, laa syariika lak.',
    translation: 'Aku penuhi panggilan-Mu ya Allah, aku penuhi panggilan-Mu. Tiada sekutu bagi-Mu, aku penuhi panggilan-Mu. Sesungguhnya segala puji, nikmat, dan kerajaan adalah milik-Mu, tiada sekutu bagi-Mu.',
    tips: 'Dianjurkan dibaca berulang-ulang sejak miqat hingga mulai Thawaf.'
  },
  {
    id: 'doa_masuk_masjidilharam',
    category: 'thawaf',
    title: 'Doa Masuk Masjidil Haram',
    arabic: 'اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ، فَحَيِّنَا رَبَّنَا بِالسَّلاَمِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    latin: 'Allahumma antas salaam wa minkas salaam, fa hayyinaa rabbanaa bis salaam, Allahummaftah lii abwaaba rahmatik.',
    translation: 'Ya Allah, Engkaulah sumber keselamatan dan dari-Mu lah keselamatan, maka hidupkanlah kami wahai Tuhan kami dalam keselamatan. Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.',
    tips: 'Dahulukan kaki kanan ketika melangkah masuk ke pintu Masjid.'
  },
  {
    id: 'doa_melihat_kabah',
    category: 'thawaf',
    title: 'Doa Saat Pertama Kali Melihat Ka\'bah',
    arabic: 'اللَّهُمَّ زِدْ هَذَا الْبَيْتَ تَشْرِيفًا وَتَعْظِيمًا وَتَكْرِيمًا وَمَهَابَةً، وَزِدْ مَنْ شَرَّفَهُ وَعَظَّمَهُ مِمَّنْ حَجَّهُ أَوِ اعْتَمَرَهُ تَشْرِيفًا وَتَكْرِيمًا وَتَعْظِيمًا وَبِرًّا',
    latin: 'Allahumma zid haadzal baita tasyriifan wa ta\'zhiiman wa takriiman wa mahaabatan, wa zid man syarrafahu wa \'azzhamahu mimman hajjahu awi\'tamarahu tasyriifan wa takriiman wa ta\'zhiiman wa birran.',
    translation: 'Ya Allah, tambahkanlah kemuliaan, keagungan, kehormatan, dan wibawa pada rumah ini (Ka\'bah). Dan tambahkanlah pula kemuliaan, kehormatan, keagungan, dan kebaikan bagi orang yang memuliakan dan mengagungkannya dari mereka yang berhaji atau berumroh.',
    tips: 'Berdoalah apa saja saat melihat Ka\'bah karena saat ini termasuk waktu mustajab.'
  },
  {
    id: 'doa_antara_rukun_yamani',
    category: 'thawaf',
    title: 'Doa Sapujagad (Antara Rukun Yamani & Hajar Aswad)',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    latin: 'Rabbanaa aatinaa fid dunyaa hasanah, wa fil aakhirati hasanah, wa qinaa \'adzaaban naar.',
    translation: 'Wahai Tuhan kami, berikanlah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari siksa api neraka.',
    tips: 'Dibaca di setiap putaran thawaf saat melintasi Rukun Yamani menuju Hajar Aswad.'
  },
  {
    id: 'doa_naik_shofa',
    category: 'sai',
    title: 'Doa Naik Bukit Shofa Menghadap Ka\'bah',
    arabic: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ، أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ. اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    latin: 'Innas shofaa wal marwata min sya\'aa\'irillaah. Abda\'u bimaa bada\'allaahu bih. Allaahu akbar, Allaahu akbar, Allaahu akbar. Laa ilaaha illallaahu wahdahu laa syariika lah, lahul mulku wa lahul hamdu yuhyii wa yumiitu wa huwa \'alaa kulli syai\'in qadiir.',
    translation: 'Sesungguhnya Shofa dan Marwah adalah sebagian dari syiar-syiar Allah. Aku memulai dengan apa yang dimulai oleh Allah. Allah Maha Besar (3x). Tiada Tuhan selain Allah semata, tiada sekutu bagi-Nya, milik-Nya segala kerajaan dan segala puji, Dia Yang menghidupkan dan mematikan, dan Dia Maha Kuasa atas segala sesuatu.',
    tips: 'Menghadap Ka\'bah, angkat kedua tangan dan ulangi zikir ini 3 kali lalu berdoa hajat.'
  }
];

export const MOCK_USER_PAYMENTS: Record<string, UserPaymentRecord[]> = {
  'ahmad.subagja@gmail.com': [
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
  ],
  'siti.aminah@gmail.com': [
    {
      id: 'PAY-003',
      date: '15 Jan 2026',
      description: 'Pelunasan Penuh Umroh Plus Turki (Kloter B)',
      amount: 42000000,
      status: 'VERIFIED',
      receiptNumber: 'REC-2026-00205',
      paymentMethod: 'Transfer Bank BCA'
    }
  ],
  'budi.santoso@gmail.com': [
    {
      id: 'PAY-004',
      date: '12 Feb 2026',
      description: 'Setoran Awal (DP) Umroh Berkah Ramadhan',
      amount: 15000000,
      status: 'VERIFIED',
      receiptNumber: 'REC-2026-00298',
      paymentMethod: 'Transfer Bank Mandiri'
    }
  ]
};

export const MOCK_LUGGAGE_CHECKLIST = [
  { id: 'c1', title: 'Paspor Asli & Buku Kuning Vaksin', category: 'Dokumen', defaultChecked: true },
  { id: 'c2', title: 'Buku Saku Doa & ID Card Jemaah', category: 'Dokumen', defaultChecked: true },
  { id: 'c3', title: '2 Set Kain Ihram & Sabuk Haji (Pria)', category: 'Pakaian', defaultChecked: false },
  { id: 'c4', title: 'Busana Muslimah / Mukena Putih & Hitam (Wanita)', category: 'Pakaian', defaultChecked: false },
  { id: 'c5', title: 'Sandal Jepit / Sandal Haji Nyaman & Tas Sandal', category: 'Pakaian', defaultChecked: false },
  { id: 'c6', title: 'Obat Pribadi (Flu, Maag, Vitamin, Minyak Angin)', category: 'Kesehatan', defaultChecked: false },
  { id: 'c7', title: 'Gunting Lipat untuk Tahallul (Simpan di Bagasi!)', category: 'Perlengkapan', defaultChecked: false },
  { id: 'c8', title: 'Powerbank & Charger Colokan Kaki 3 (Saudi Standard)', category: 'Elektronik', defaultChecked: false },
  { id: 'c9', title: 'Botol Semprot Wajah untuk Cuaca Panas', category: 'Perlengkapan', defaultChecked: false },
  { id: 'c10', title: 'Uang Riyal Pecahan Kecil untuk Sedekah', category: 'Keuangan', defaultChecked: false }
];

