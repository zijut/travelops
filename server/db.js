import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'travelops_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial mock & seed database structure
function getInitialSeeds() {
  const salt = bcrypt.genSaltSync(10);
  
  const superAdminPassword = bcrypt.hashSync('SuperAdmin2026!', salt);
  const travelAdminPassword = bcrypt.hashSync('AlHaramain2026!', salt);
  const staffPassword = bcrypt.hashSync('SitiStaff2026!', salt);
  const agentPassword = bcrypt.hashSync('BudiAgent2026!', salt);

  const users = [
    {
      id: 'usr_superadmin',
      name: 'Dr. Faisal Al-Mansoor',
      email: 'superadmin@travelops.com',
      phone: '+62 811-9988-7766',
      password: superAdminPassword,
      photo: 'https://picsum.photos/seed/superadmin/100/100',
      agency: 'TravelOps Global Headquarter',
      role: 'Super Admin',
      region: 'Jakarta, Riyadh & Jeddah',
      address: 'Sudirman Central Business District (SCBD) Lot 28, Jakarta',
      status: 'Active',
      createdAt: '2026-01-01T00:00:00.000Z',
      lastLogin: new Date().toISOString()
    },
    {
      id: 'usr_abdullah',
      name: 'Abdullah Al-Habsyi',
      email: 'abdullah@alharamain.id',
      phone: '+62 812-3456-7890',
      password: travelAdminPassword,
      photo: 'https://picsum.photos/seed/admin/100/100',
      agency: 'Al-Haramain Travel',
      role: 'Travel Admin',
      region: 'Jakarta & Saudi Arabia',
      address: 'Jl. Jenderal Sudirman No. 21, Jakarta Selatan',
      status: 'Active',
      createdAt: '2026-01-15T00:00:00.000Z',
      lastLogin: new Date().toISOString()
    },
    {
      id: 'usr_siti',
      name: 'Siti Aminah',
      email: 'siti@alharamain.id',
      phone: '+62 813-8877-6655',
      password: staffPassword,
      photo: 'https://picsum.photos/seed/siti/100/100',
      agency: 'Al-Haramain Travel',
      role: 'Ops Staff',
      region: 'Bandara Soekarno Hatta & Jeddah',
      address: 'Terminal 3 International, Soekarno-Hatta',
      status: 'Active',
      createdAt: '2026-02-01T00:00:00.000Z',
      lastLogin: new Date().toISOString()
    },
    {
      id: 'usr_budi',
      name: 'Budi Santoso',
      email: 'budi@partner.id',
      phone: '+62 815-4433-2211',
      password: agentPassword,
      photo: 'https://picsum.photos/seed/budi/100/100',
      agency: 'Barokah Tour & Travel',
      role: 'Field Agent',
      region: 'Surabaya & Jawa Timur',
      address: 'Jl. Basuki Rahmat No. 45, Surabaya',
      status: 'Active',
      createdAt: '2026-02-10T00:00:00.000Z',
      lastLogin: new Date().toISOString()
    }
  ];

  const packages = [
    { 
      id: 'PKG01', 
      name: 'Umroh Berkah Ramadhan', 
      duration: 12, 
      price: 35000000, 
      airline: 'Saudia Airlines', 
      hotel: '5 Bintang', 
      quota: 50, 
      booked: 45, 
      status: 'Published',
      agencyEmail: 'abdullah@alharamain.id',
      createdAt: '2026-01-10T10:00:00.000Z'
    },
    { 
      id: 'PKG02', 
      name: 'Umroh Plus Turki', 
      duration: 15, 
      price: 42000000, 
      airline: 'Turkish Airlines', 
      hotel: '5 Bintang', 
      quota: 40, 
      booked: 25, 
      status: 'Published',
      agencyEmail: 'abdullah@alharamain.id',
      createdAt: '2026-01-12T10:00:00.000Z'
    },
    { 
      id: 'PKG03', 
      name: 'Umroh Liburan Sekolah', 
      duration: 9, 
      price: 28000000, 
      airline: 'Garuda Indonesia', 
      hotel: '4 Bintang', 
      quota: 100, 
      booked: 100, 
      status: 'Sold Out',
      agencyEmail: 'abdullah@alharamain.id',
      createdAt: '2026-01-15T10:00:00.000Z'
    },
    { 
      id: 'PKG04', 
      name: 'Haji Khusus VIP', 
      duration: 25, 
      price: 250000000, 
      airline: 'Qatar Airways', 
      hotel: 'Hotel Depan Masjid', 
      quota: 20, 
      booked: 5, 
      status: 'Draft',
      agencyEmail: 'abdullah@alharamain.id',
      createdAt: '2026-02-01T10:00:00.000Z'
    }
  ];

  const jamaah = [
    { id: 'JMH001', name: 'Ahmad Subagja', phone: '+62 812-1111-2222', avatarUrl: 'https://picsum.photos/seed/man1/40/40', package: 'Umroh Berkah Ramadhan', departureDate: '15 Mar 2026', status: 'Visa Approved', kloter: 'Kloter A', agencyEmail: 'abdullah@alharamain.id' },
    { id: 'JMH002', name: 'Siti Aminah', phone: '+62 812-3333-4444', avatarUrl: 'https://picsum.photos/seed/woman1/40/40', package: 'Umroh Plus Turki', departureDate: '20 Apr 2026', status: 'Paid', kloter: 'Kloter B', agencyEmail: 'abdullah@alharamain.id' },
    { id: 'JMH003', name: 'Budi Santoso', phone: '+62 812-5555-6666', avatarUrl: 'https://picsum.photos/seed/man2/40/40', package: 'Umroh Berkah Ramadhan', departureDate: '15 Mar 2026', status: 'Booked', kloter: 'Kloter A', agencyEmail: 'abdullah@alharamain.id' },
    { id: 'JMH004', name: 'Dewi Lestari', phone: '+62 812-7777-8888', avatarUrl: 'https://picsum.photos/seed/woman2/40/40', package: 'Umroh Liburan Sekolah', departureDate: '10 Jun 2026', status: 'Departed', kloter: 'Kloter C', agencyEmail: 'abdullah@alharamain.id' },
    { id: 'JMH005', name: 'Muhammad Yusuf', phone: '+62 812-9999-0000', avatarUrl: 'https://picsum.photos/seed/man3/40/40', package: 'Umroh Plus Turki', departureDate: '20 Apr 2026', status: 'Returned', kloter: 'Kloter B', agencyEmail: 'abdullah@alharamain.id' },
    { id: 'JMH006', name: 'Rina Fauziah', phone: '+62 813-1234-5678', avatarUrl: 'https://picsum.photos/seed/woman3/40/40', package: 'Umroh Berkah Ramadhan', departureDate: '15 Mar 2026', status: 'Cancelled', kloter: 'Kloter A', agencyEmail: 'abdullah@alharamain.id' }
  ];

  const tasks = [
    { 
      id: '1', 
      title: 'Submit Visa Applications', 
      category: 'Pre-Departure', 
      dueDate: '2026-03-01', 
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
      kloter: 'Kloter A',
      agencyEmail: 'abdullah@alharamain.id'
    },
    { 
      id: '2', 
      title: 'Finalize Rooming List', 
      category: 'Pre-Departure', 
      dueDate: '2026-03-10', 
      completed: false, 
      assignee: 'Siti', 
      priority: 'High', 
      description: 'Coordinate with hotel management in Makkah and Madinah. Group families together as requested by the sales team.',
      subtasks: [
        { id: 'st5', title: 'Get latest manifest', completed: true },
        { id: 'st6', title: 'Assign families', completed: false },
        { id: 'st7', title: 'Send to Hotel', completed: false }
      ],
      kloter: 'Kloter A',
      agencyEmail: 'abdullah@alharamain.id'
    },
    { 
      id: '3', 
      title: 'Distribute ID Cards & Batik', 
      category: 'Pre-Departure', 
      dueDate: '2026-03-12', 
      completed: false, 
      assignee: 'Budi', 
      priority: 'Medium', 
      description: 'Verify inventory of Batik uniforms against the manifest. ID Cards must be printed with emergency contact numbers.',
      subtasks: [],
      kloter: 'Kloter A',
      agencyEmail: 'abdullah@alharamain.id'
    },
    { 
      id: '4', 
      title: 'Check-in Hotel Makkah', 
      category: 'In-Saudi', 
      dueDate: '2026-03-16', 
      completed: false, 
      assignee: 'Mutawif', 
      priority: 'High', 
      description: 'Arrive 2 hours early to handle key distribution. Ensure luggage handling service is ready at the lobby.',
      subtasks: [],
      kloter: 'Kloter A',
      agencyEmail: 'abdullah@alharamain.id'
    },
    { 
      id: '5', 
      title: 'Collect Feedback Forms', 
      category: 'Post-Return', 
      dueDate: '2026-03-28', 
      completed: false, 
      assignee: 'Admin', 
      priority: 'Low', 
      description: 'Send digital feedback forms via WhatsApp to all group members and collect physical forms if distributed on the bus.',
      subtasks: [],
      kloter: 'Kloter A',
      agencyEmail: 'abdullah@alharamain.id'
    }
  ];

  const finance = [
    { id: 'TX-101', date: '2026-06-12', category: 'Ticket Flight', description: 'Downpayment Saudia Airlines Kloter A', amount: 450000000, type: 'EXPENSE', status: 'COMPLETED', agencyEmail: 'abdullah@alharamain.id' },
    { id: 'TX-102', date: '2026-06-11', category: 'Jamaah Payment', description: 'Pelunasan Umroh Mandiri - Bpk. Ahmad', amount: 35000000, type: 'INCOME', status: 'COMPLETED', agencyEmail: 'abdullah@alharamain.id' },
    { id: 'TX-103', date: '2026-06-10', category: 'Hotel Booking', description: 'Booking Hotel Anjum Makkah 10 Malam', amount: 180000000, type: 'EXPENSE', status: 'COMPLETED', agencyEmail: 'abdullah@alharamain.id' },
    { id: 'TX-104', date: '2026-06-09', category: 'Visa Processing', description: 'Biaya Visa 45 Pax Kloter B', amount: 67500000, type: 'EXPENSE', status: 'PENDING', agencyEmail: 'abdullah@alharamain.id' },
    { id: 'TX-105', date: '2026-06-08', category: 'Jamaah Payment', description: 'Uang Muka Umroh Keluarga Ibu Susi (5 Pax)', amount: 75000000, type: 'INCOME', status: 'COMPLETED', agencyEmail: 'abdullah@alharamain.id' }
  ];

  const visaRecords = {
    'JMH001': { passport: 'VERIFIED', visa: 'VERIFIED', ktp: 'VERIFIED', vaccine: 'VERIFIED', passportNumber: 'A1234500' },
    'JMH002': { passport: 'SUBMITTED', visa: 'PENDING', ktp: 'VERIFIED', vaccine: 'VERIFIED', passportNumber: 'A1234501' },
    'JMH003': { passport: 'PENDING', visa: 'PENDING', ktp: 'VERIFIED', vaccine: 'PENDING', passportNumber: 'A1234502' },
    'JMH004': { passport: 'VERIFIED', visa: 'VERIFIED', ktp: 'VERIFIED', vaccine: 'VERIFIED', passportNumber: 'A1234503' },
    'JMH005': { passport: 'VERIFIED', visa: 'VERIFIED', ktp: 'VERIFIED', vaccine: 'VERIFIED', passportNumber: 'A1234504' },
    'JMH006': { passport: 'PENDING', visa: 'PENDING', ktp: 'PENDING', vaccine: 'PENDING', passportNumber: 'A1234505' }
  };

  const notifications = [
    {
      id: '1',
      titleEn: 'Visa Approved: Ahmad Subagja',
      titleId: 'Visa Disetujui: Ahmad Subagja',
      descEn: 'Muqeem portal cleared the visa for pilgrim Ahmad Subagja (Kloter A).',
      descId: 'Portal Muqeem telah menyetujui visa untuk jamaah Ahmad Subagja (Kloter A).',
      timestamp: '10 mins ago',
      read: false,
      type: 'success',
      agencyEmail: 'abdullah@alharamain.id'
    },
    {
      id: '2',
      titleEn: 'Pending Room Allocation',
      titleId: 'Alokasi Kamar Tertunda',
      descEn: 'Please finalize the Makkah hotel rooming list for Kloter B before departures.',
      descId: 'Harap selesaikan daftar pembagian kamar hotel Makkah untuk Kloter B sebelum keberangkatan.',
      timestamp: '1 hour ago',
      read: false,
      type: 'warning',
      agencyEmail: 'abdullah@alharamain.id'
    },
    {
      id: '3',
      titleEn: 'New Package Registered',
      titleId: 'Paket Baru Terdaftar',
      descEn: '"Haji Khusus VIP" has been saved as a Draft.',
      descId: '"Haji Khusus VIP" telah disimpan sebagai Draf.',
      timestamp: '1 day ago',
      read: true,
      type: 'info',
      agencyEmail: 'abdullah@alharamain.id'
    }
  ];

  const auditLogs = [
    {
      id: 'log_001',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      userId: 'usr_superadmin',
      userName: 'Dr. Faisal Al-Mansoor',
      role: 'Super Admin',
      action: 'SYSTEM_AUDIT',
      details: 'Super Admin reviewed multi-agency operational status and system metrics.',
      ipAddress: '127.0.0.1',
      status: 'SUCCESS'
    },
    {
      id: 'log_002',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      userId: 'usr_abdullah',
      userName: 'Abdullah Al-Habsyi',
      role: 'Travel Admin',
      action: 'VISA_UPDATE',
      details: 'Updated visa verification for pilgrim Ahmad Subagja (JMH001).',
      ipAddress: '127.0.0.1',
      status: 'SUCCESS'
    },
    {
      id: 'log_003',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      userId: 'usr_siti',
      userName: 'Siti Aminah',
      role: 'Ops Staff',
      action: 'TASK_COMPLETE',
      details: 'Marked operational task "Submit Visa Applications" as completed.',
      ipAddress: '127.0.0.1',
      status: 'SUCCESS'
    }
  ];

  return {
    users,
    packages,
    jamaah,
    tasks,
    finance,
    visaRecords,
    notifications,
    auditLogs,
    settings: {
      serverStartTime: new Date().toISOString(),
      version: '2.5.0-production'
    }
  };
}

// Read database from file
export function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialSeeds();
      writeDB(initial);
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading DB, re-seeding:', error);
    const initial = getInitialSeeds();
    writeDB(initial);
    return initial;
  }
}

// Write database to file atomically
export function writeDB(data) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (error) {
    console.error('Error writing DB:', error);
  }
}

// Add an audit log entry helper
export function logAudit({ userId, userName, role, action, details, ipAddress = '127.0.0.1', status = 'SUCCESS' }) {
  const db = readDB();
  const newLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    userId: userId || 'system',
    userName: userName || 'System',
    role: role || 'System',
    action,
    details,
    ipAddress,
    status
  };
  db.auditLogs = [newLog, ...(db.auditLogs || [])].slice(0, 200); // keep last 200 logs
  writeDB(db);
  return newLog;
}

// User Helpers
export function getAllUsers() {
  const db = readDB();
  return db.users.map(u => {
    const { password, ...userWithoutPassword } = u;
    return userWithoutPassword;
  });
}

export function findUserByEmail(email) {
  if (!email) return null;
  const db = readDB();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function findUserById(id) {
  if (!id) return null;
  const db = readDB();
  return db.users.find(u => u.id === id) || null;
}

export function createUser(userData) {
  const db = readDB();
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(userData.password || 'TravelOps2026!', salt);

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    name: userData.name,
    email: userData.email.toLowerCase(),
    phone: userData.phone || '',
    password: hashedPassword,
    photo: userData.photo || `https://picsum.photos/seed/${Date.now()}/100/100`,
    agency: userData.agency || `${userData.name} Travel`,
    role: userData.role || 'Travel Admin',
    region: userData.region || 'Indonesia',
    address: userData.address || '',
    status: userData.status || 'Active',
    createdAt: new Date().toISOString(),
    lastLogin: null
  };

  db.users.push(newUser);
  writeDB(db);

  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

export function updateUser(id, updates) {
  const db = readDB();
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return null;

  const current = db.users[index];
  
  if (updates.password && updates.password.trim() !== '') {
    const salt = bcrypt.genSaltSync(10);
    updates.password = bcrypt.hashSync(updates.password, salt);
  } else {
    delete updates.password;
  }

  db.users[index] = { ...current, ...updates };
  writeDB(db);

  const { password, ...userWithoutPassword } = db.users[index];
  return userWithoutPassword;
}

export function deleteUser(id) {
  const db = readDB();
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return false;

  db.users.splice(index, 1);
  writeDB(db);
  return true;
}

// Entity Lookup Helpers
export function findPackageById(id) {
  const db = readDB();
  return (db.packages || []).find(p => p.id === id) || null;
}

export function findJamaahById(id) {
  const db = readDB();
  return (db.jamaah || []).find(j => j.id === id) || null;
}

export function findTaskById(id) {
  const db = readDB();
  return (db.tasks || []).find(t => t.id === id) || null;
}

export function findFinanceById(id) {
  const db = readDB();
  return (db.finance || []).find(f => f.id === id) || null;
}

// Reset database to initial seed
export function resetDB() {
  const initial = getInitialSeeds();
  writeDB(initial);
  return initial;
}

