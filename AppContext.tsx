import React, { createContext, useContext, useState, useEffect } from 'react';
import { Package, Jamaah, NotificationItem } from './types';
import { PACKAGES_MOCK, JAMAAH_MOCK, MOCK_TASKS } from './constants';

// Add missing types if they aren't fully defined
export interface AppNotification {
  id: string;
  titleEn: string;
  titleId: string;
  descEn: string;
  descId: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

export type LanguageType = 'id' | 'en';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  password?: string;
  photo: string;
  agency: string;
  role: string;
  region: string;
  address: string;
}

export interface AppSettings {
  enableBell: boolean;
  enableToast: boolean;
}

interface AppContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  packages: Package[];
  setPackages: React.Dispatch<React.SetStateAction<Package[]>>;
  jamaahList: Jamaah[];
  setJamaahList: React.Dispatch<React.SetStateAction<Jamaah[]>>;
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  addNotification: (titleEn: string, titleId: string, descEn: string, descId: string, type?: 'info' | 'warning' | 'success') => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  triggerToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  closeToast: () => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  appSettings: AppSettings;
  setAppSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  resetAllData: () => void;
  restoreDefaultSeeds: () => void;
  currentUser: UserProfile | null;
  users: UserProfile[];
  login: (email: string, password?: string) => boolean;
  registerUser: (newUser: UserProfile) => void;
  logout: () => void;
}

const DEFAULT_USERS: UserProfile[] = [
  {
    name: 'Abdullah Al-Habsyi',
    email: 'abdullah@alharamain.id',
    phone: '+62 812-3456-7890',
    password: 'AlHaramain2026!',
    photo: 'https://picsum.photos/seed/admin/40/40',
    agency: 'Al-Haramain Travel',
    role: 'Travel Admin',
    region: 'Jakarta & Saudi Arabia',
    address: 'Jl. Jenderal Sudirman No. 21, Jakarta Selatan'
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load current user
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('travelops_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('travelops_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasAbdullah = parsed.find(u => u.email?.toLowerCase() === 'abdullah@alharamain.id');
          if (!hasAbdullah) {
            return [...parsed, DEFAULT_USERS[0]];
          } else if (!hasAbdullah.password) {
            hasAbdullah.password = 'AlHaramain2026!';
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading initial users:', e);
    }
    return DEFAULT_USERS;
  });

  // Safe email getter
  const currentEmail = currentUser?.email || '';

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('travelops_dark_mode');
    return saved ? saved === 'true' : false;
  });

  // Language state
  const [language, setLanguage] = useState<LanguageType>(() => {
    const saved = localStorage.getItem('travelops_lang');
    return (saved as LanguageType) || 'id';
  });

  // Packages state
  const [packages, setPackages] = useState<Package[]>(() => {
    if (!currentEmail) return [];
    const saved = localStorage.getItem(`travelops_packages_${currentEmail}`);
    if (saved) return JSON.parse(saved);
    return currentEmail === 'abdullah@alharamain.id' ? PACKAGES_MOCK : [];
  });

  // Jamaah list state
  const [jamaahList, setJamaahList] = useState<Jamaah[]>(() => {
    if (!currentEmail) return [];
    const saved = localStorage.getItem(`travelops_jamaah_${currentEmail}`);
    if (saved) return JSON.parse(saved);
    return currentEmail === 'abdullah@alharamain.id' ? JAMAAH_MOCK : [];
  });

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    if (!currentEmail) return [];
    const saved = localStorage.getItem(`travelops_notifications_${currentEmail}`);
    if (saved) return JSON.parse(saved);
    if (currentEmail === 'abdullah@alharamain.id') {
      return [
        {
          id: '1',
          titleEn: 'Visa Approved: Ahmad Subagja',
          titleId: 'Visa Disetujui: Ahmad Subagja',
          descEn: 'Muqeem portal cleared the visa for pilgrim Ahmad Subagja (Kloter A).',
          descId: 'Portal Muqeem telah menyetujui visa untuk jamaah Ahmad Subagja (Kloter A).',
          timestamp: '10 mins ago',
          read: false,
          type: 'success'
        },
        {
          id: '2',
          titleEn: 'Pending Room Allocation',
          titleId: 'Alokasi Kamar Tertunda',
          descEn: 'Please finalize the Makkah hotel rooming list for Kloter B before departures.',
          descId: 'Harap selesaikan daftar pembagian kamar hotel Makkah untuk Kloter B sebelum keberangkatan.',
          timestamp: '1 hour ago',
          read: false,
          type: 'warning'
        },
        {
          id: '3',
          titleEn: 'New Package Registered',
          titleId: 'Paket Baru Terdaftar',
          descEn: '"Haji Khusus VIP" has been saved as a Draft.',
          descId: '"Haji Khusus VIP" telah disimpan sebagai Draf.',
          timestamp: '1 day ago',
          read: true,
          type: 'info'
        }
      ];
    }
    return [];
  });

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // User Profile state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    if (!currentEmail) {
      return {
        name: '',
        email: '',
        phone: '',
        password: '',
        photo: 'https://picsum.photos/seed/admin/40/40',
        agency: '',
        role: '',
        region: '',
        address: ''
      };
    }
    const saved = localStorage.getItem(`travelops_user_profile_${currentEmail}`);
    if (saved) return JSON.parse(saved);
    
    const matched = users.find(u => u.email.toLowerCase() === currentEmail.toLowerCase());
    return matched || DEFAULT_USERS[0];
  });

  // App Settings state
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    if (!currentEmail) return { enableBell: true, enableToast: true };
    const saved = localStorage.getItem(`travelops_app_settings_${currentEmail}`);
    return saved ? JSON.parse(saved) : {
      enableBell: true,
      enableToast: true
    };
  });

  // Multi-user explicit state synchronization
  useEffect(() => {
    if (!currentUser) return;
    const email = currentUser.email;

    const pkgSaved = localStorage.getItem(`travelops_packages_${email}`);
    setPackages(pkgSaved ? JSON.parse(pkgSaved) : (email === 'abdullah@alharamain.id' ? PACKAGES_MOCK : []));

    const jmSaved = localStorage.getItem(`travelops_jamaah_${email}`);
    setJamaahList(jmSaved ? JSON.parse(jmSaved) : (email === 'abdullah@alharamain.id' ? JAMAAH_MOCK : []));

    const notifSaved = localStorage.getItem(`travelops_notifications_${email}`);
    if (notifSaved) {
      setNotifications(JSON.parse(notifSaved));
    } else {
      setNotifications(email === 'abdullah@alharamain.id' ? [
        {
          id: '1',
          titleEn: 'Visa Approved: Ahmad Subagja',
          titleId: 'Visa Disetujui: Ahmad Subagja',
          descEn: 'Muqeem portal cleared the visa for pilgrim Ahmad Subagja (Kloter A).',
          descId: 'Portal Muqeem telah menyetujui visa untuk jamaah Ahmad Subagja (Kloter A).',
          timestamp: '10 mins ago',
          read: false,
          type: 'success'
        },
        {
          id: '2',
          titleEn: 'Pending Room Allocation',
          titleId: 'Alokasi Kamar Tertunda',
          descEn: 'Please finalize the Makkah hotel rooming list for Kloter B before departures.',
          descId: 'Harap selesaikan daftar pembagian kamar hotel Makkah untuk Kloter B sebelum keberangkatan.',
          timestamp: '1 hour ago',
          read: false,
          type: 'warning'
        },
        {
          id: '3',
          titleEn: 'New Package Registered',
          titleId: 'Paket Baru Terdaftar',
          descEn: '"Haji Khusus VIP" has been saved as a Draft.',
          descId: '"Haji Khusus VIP" telah disimpan sebagai Draf.',
          timestamp: '1 day ago',
          read: true,
          type: 'info'
        }
      ] : []);
    }

    const profileSaved = localStorage.getItem(`travelops_user_profile_${email}`);
    setUserProfile(profileSaved ? JSON.parse(profileSaved) : currentUser);

    const settingsSaved = localStorage.getItem(`travelops_app_settings_${email}`);
    setAppSettings(settingsSaved ? JSON.parse(settingsSaved) : { enableBell: true, enableToast: true });
  }, [currentUser?.email]);

  // Sync back to local storage
  useEffect(() => {
    localStorage.setItem('travelops_dark_mode', String(isDarkMode));
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('travelops_lang', language);
  }, [language]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`travelops_packages_${currentUser.email}`, JSON.stringify(packages));
    }
  }, [packages, currentUser?.email]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`travelops_jamaah_${currentUser.email}`, JSON.stringify(jamaahList));
    }
  }, [jamaahList, currentUser?.email]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`travelops_notifications_${currentUser.email}`, JSON.stringify(notifications));
    }
  }, [notifications, currentUser?.email]);

  useEffect(() => {
    if (currentUser && userProfile && userProfile.email && userProfile.name) {
      // Only sync if userProfile matches active currentUser
      if (userProfile.email.toLowerCase() === currentUser.email.toLowerCase()) {
        localStorage.setItem(`travelops_user_profile_${currentUser.email}`, JSON.stringify(userProfile));
        
        // Update entry in users list while safely preserving password
        setUsers(prev => {
          const index = prev.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
          if (index !== -1) {
            const updated = [...prev];
            const existingPassword = updated[index].password || (updated[index].email.toLowerCase() === 'abdullah@alharamain.id' ? 'AlHaramain2026!' : '');
            updated[index] = {
              ...updated[index],
              ...userProfile,
              password: userProfile.password || existingPassword
            };
            localStorage.setItem('travelops_users', JSON.stringify(updated));
            return updated;
          }
          return prev;
        });
      }
    }
  }, [userProfile, currentUser?.email]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`travelops_app_settings_${currentUser.email}`, JSON.stringify(appSettings));
    }
  }, [appSettings, currentUser?.email]);

  // Auth Functions
  const login = (email: string, password?: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Read directly from storage to prevent stale closure
    let userList: UserProfile[] = [...users];
    try {
      const savedStr = localStorage.getItem('travelops_users');
      if (savedStr) {
        const parsed = JSON.parse(savedStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          userList = parsed;
        }
      }
    } catch (e) {}

    let matched = userList.find(u => u.email?.toLowerCase() === cleanEmail);

    // Fallback for default demo account if missing or if password was corrupted
    if (cleanEmail === 'abdullah@alharamain.id') {
      if (!matched) {
        matched = { ...DEFAULT_USERS[0] };
        userList.push(matched);
      } else if (!matched.password) {
        matched.password = 'AlHaramain2026!';
      }
      setUsers(userList);
      localStorage.setItem('travelops_users', JSON.stringify(userList));
    }

    if (!matched) return false;

    // Password verification
    if (password && matched.password && matched.password !== password) {
      return false;
    }

    // Set active user session
    setCurrentUser(matched);
    setUserProfile(matched);
    localStorage.setItem('travelops_current_user', JSON.stringify(matched));
    localStorage.setItem(`travelops_user_profile_${matched.email}`, JSON.stringify(matched));
    return true;
  };

  const registerUser = (newUser: UserProfile) => {
    let currentList: UserProfile[] = [...users];
    try {
      const savedStr = localStorage.getItem('travelops_users');
      if (savedStr) {
        const parsed = JSON.parse(savedStr);
        if (Array.isArray(parsed)) {
          currentList = parsed;
        }
      }
    } catch (e) {}

    const index = currentList.findIndex(u => u.email.toLowerCase() === newUser.email.toLowerCase());
    if (index !== -1) {
      currentList[index] = newUser;
    } else {
      currentList.push(newUser);
    }
    setUsers(currentList);
    localStorage.setItem('travelops_users', JSON.stringify(currentList));
    localStorage.setItem(`travelops_user_profile_${newUser.email}`, JSON.stringify(newUser));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('travelops_current_user');
    setUserProfile({
      name: '',
      email: '',
      phone: '',
      password: '',
      photo: 'https://picsum.photos/seed/admin/40/40',
      agency: '',
      role: '',
      region: '',
      address: ''
    });
  };

  // Dark mode toggle
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Notification helper
  const addNotification = (titleEn: string, titleId: string, descEn: string, descId: string, type: 'info' | 'warning' | 'success' = 'info') => {
    const newNotif: AppNotification = {
      id: Date.now().toString(),
      titleEn,
      titleId,
      descEn,
      descId,
      timestamp: language === 'id' ? 'Baru saja' : 'Just now',
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Toast Helpers
  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (appSettings.enableToast) {
      setToast({ message, type });
    }
  };

  const closeToast = () => setToast(null);

  const resetAllData = () => {
    if (currentUser) {
      const email = currentUser.email;
      
      // Store empty database representations to prevent default mock seed fallbacks
      localStorage.setItem(`travelops_packages_${email}`, JSON.stringify([]));
      localStorage.setItem(`travelops_jamaah_${email}`, JSON.stringify([]));
      localStorage.setItem(`travelops_notifications_${email}`, JSON.stringify([]));
      localStorage.setItem(`travelops_finance_ledger_v2_${email}`, JSON.stringify([]));
      localStorage.setItem(`travelops_visa_documents_v2_${email}`, JSON.stringify({}));
      localStorage.setItem(`travelops_ops_tasks_${email}`, JSON.stringify([]));
      localStorage.setItem(`travelops_rooming_allocations_${email}`, JSON.stringify([]));
      localStorage.setItem(`travelops_bus_seats_${email}`, JSON.stringify({}));

      // Reset active states instantly
      setPackages([]);
      setJamaahList([]);
      setNotifications([]);
    }
  };

  const restoreDefaultSeeds = () => {
    if (currentUser) {
      const email = currentUser.email;

      // Restores precisely back to original defaults matching initial seeds
      localStorage.setItem(`travelops_packages_${email}`, JSON.stringify(PACKAGES_MOCK));
      localStorage.setItem(`travelops_jamaah_${email}`, JSON.stringify(JAMAAH_MOCK));

      const defaultNotifications: AppNotification[] = [
        {
          id: '1',
          titleEn: 'Visa Approved: Ahmad Subagja',
          titleId: 'Visa Disetujui: Ahmad Subagja',
          descEn: 'Muqeem portal cleared the visa for pilgrim Ahmad Subagja (Kloter A).',
          descId: 'Portal Muqeem telah menyetujui visa untuk jamaah Ahmad Subagja (Kloter A).',
          timestamp: '10 mins ago',
          read: false,
          type: 'success'
        },
        {
          id: '2',
          titleEn: 'Pending Room Allocation',
          titleId: 'Alokasi Kamar Tertunda',
          descEn: 'Please finalize the Makkah hotel rooming list for Kloter B before departures.',
          descId: 'Harap selesaikan daftar pembagian kamar hotel Makkah untuk Kloter B sebelum keberangkatan.',
          timestamp: '1 hour ago',
          read: false,
          type: 'warning'
        },
        {
          id: '3',
          titleEn: 'New Package Registered',
          titleId: 'Paket Baru Terdaftar',
          descEn: 'VIP Premium package added successfully with 50 slots available.',
          descId: 'Paket VIP Premium sukses terdaftar dengan ketersediaan kuota sebanyak 50 pax.',
          timestamp: '3 hours ago',
          read: true,
          type: 'info'
        }
      ];
      localStorage.setItem(`travelops_notifications_${email}`, JSON.stringify(defaultNotifications));

      const defaultFinance = [
        { id: 'TX-101', date: '2026-06-12', category: 'Ticket Flight', description: 'Downpayment Saudia Airlines Kloter A', amount: 450000000, type: 'EXPENSE', status: 'COMPLETED' },
        { id: 'TX-102', date: '2026-06-11', category: 'Jamaah Payment', description: 'Pelunasan Umroh Mandiri - Bpk. Ahmad', amount: 35000000, type: 'INCOME', status: 'COMPLETED' },
        { id: 'TX-103', date: '2026-06-10', category: 'Hotel Booking', description: 'Booking Hotel Anjum Makkah 10 Malam', amount: 180000000, type: 'EXPENSE', status: 'COMPLETED' },
        { id: 'TX-104', date: '2026-06-09', category: 'Visa Processing', description: 'Biaya Visa 45 Pax Kloter B', amount: 67500000, type: 'EXPENSE', status: 'PENDING' },
        { id: 'TX-105', date: '2026-06-08', category: 'Jamaah Payment', description: 'Uang Muka Umroh Keluarga Ibu Susi (5 Pax)', amount: 75000000, type: 'INCOME', status: 'COMPLETED' }
      ];
      localStorage.setItem(`travelops_finance_ledger_v2_${email}`, JSON.stringify(defaultFinance));

      const defaultVisa: { [key: string]: any } = {};
      JAMAAH_MOCK.forEach((j, index) => {
        const isApproved = j.status === 'Visa Approved' || j.status === 'Departed' || j.status === 'Returned';
        defaultVisa[j.id] = {
          passport: isApproved ? 'VERIFIED' : (index % 3 === 0 ? 'SUBMITTED' : 'PENDING'),
          visa: isApproved ? 'VERIFIED' : 'PENDING',
          ktp: 'VERIFIED',
          vaccine: isApproved ? 'VERIFIED' : (index % 2 === 0 ? 'VERIFIED' : 'PENDING'),
          passportNumber: `A${1234500 + index}`
        };
      });
      localStorage.setItem(`travelops_visa_documents_v2_${email}`, JSON.stringify(defaultVisa));

      localStorage.setItem(`travelops_ops_tasks_${email}`, JSON.stringify(MOCK_TASKS));

      const defaultRooms = [
        { id: 'R101', roomName: 'Room 101 (Medina Plaza)', type: 'Quad', pilgrimIds: [] },
        { id: 'R102', roomName: 'Room 102 (Medina Plaza)', type: 'Quad', pilgrimIds: [] },
        { id: 'R201', roomName: 'Room 201 (Anjum Makkah)', type: 'Triple', pilgrimIds: [] },
        { id: 'R202', roomName: 'Room 202 (Anjum Makkah)', type: 'Double', pilgrimIds: [] }
      ];
      localStorage.setItem(`travelops_rooming_allocations_${email}`, JSON.stringify(defaultRooms));

      const defaultBusSeats: { [key: string]: any } = {};
      for (let i = 1; i <= 45; i++) {
        let initialPilgrim: string | null = null;
        if (i === 1) initialPilgrim = 'JMH001';
        if (i === 5) initialPilgrim = 'JMH003';
        defaultBusSeats[i.toString()] = { seatNo: i, pilgrimId: initialPilgrim };
      }
      localStorage.setItem(`travelops_bus_seats_${email}`, JSON.stringify(defaultBusSeats));

      // Reset react states instantly
      setPackages(PACKAGES_MOCK);
      setJamaahList(JAMAAH_MOCK);
      setNotifications(defaultNotifications);
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <AppContext.Provider value={{
      isDarkMode,
      toggleDarkMode,
      language,
      setLanguage,
      packages,
      setPackages,
      jamaahList,
      setJamaahList,
      notifications,
      setNotifications,
      addNotification,
      markNotificationAsRead,
      markAllNotificationsRead,
      toast,
      triggerToast,
      closeToast,
      userProfile,
      setUserProfile,
      appSettings,
      setAppSettings,
      resetAllData,
      restoreDefaultSeeds,
      currentUser,
      users,
      login,
      registerUser,
      logout,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
