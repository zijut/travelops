import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Package, Jamaah, NotificationItem, JamaahStatus } from './types';
import { PACKAGES_MOCK, JAMAAH_MOCK, MOCK_TASKS } from './constants';
import { authApi, packagesApi, jamaahApi, tasksApi, notificationsApi, financeApi } from './services/api';

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
  jamaahId?: string;
  passportNumber?: string;
}

export interface AppSettings {
  enableBell: boolean;
  enableToast: boolean;
}

export type LoginResult = {
  success: boolean;
  reason?: 'NOT_FOUND' | 'WRONG_PASSWORD' | 'SUSPENDED' | 'FAILED';
  message?: string;
};

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
  login: (email: string, password?: string) => Promise<LoginResult>;
  loginJamaahByPassport: (passportOrBooking: string, passwordOrPin?: string) => Promise<LoginResult>;
  registerUser: (newUser: UserProfile) => void | Promise<void>;
  logout: () => void;
  activeJamaah: Jamaah | null;
  updateActiveJamaah: (updated: Partial<Jamaah>) => void;
  bookPackageAsUser: (packageId: string, paxCount: number, notes?: string, customName?: string) => boolean | Promise<boolean>;
  isAdmin: boolean;
  isJamaah: boolean;
  previewMode: boolean;
  setPreviewMode: (val: boolean) => void;
  refreshData: () => Promise<void>;
}

const DEFAULT_USERS: UserProfile[] = [
  {
    name: 'Abdullah Al-Habsyi',
    email: 'abdullah@alharamain.id',
    phone: '+62 812-3456-7890',
    password: 'AlHaramain2026!',
    photo: 'https://picsum.photos/seed/admin/100/100',
    agency: 'Al-Haramain Travel',
    role: 'Travel Admin',
    region: 'Jakarta & Saudi Arabia',
    address: 'Jl. Jenderal Sudirman No. 21, Jakarta Selatan'
  },
  {
    name: 'Ahmad Subagja',
    email: 'ahmad.subagja@gmail.com',
    phone: '+62 812-1111-2222',
    password: 'Jamaah2026!',
    photo: 'https://picsum.photos/seed/man1/100/100',
    agency: 'Al-Haramain Travel',
    role: 'Jamaah',
    region: 'Jakarta Selatan',
    address: 'Jl. Tebet Barat Dalam No. 15, Jakarta Selatan',
    jamaahId: 'JMH001',
    passportNumber: 'A1234500'
  },
  {
    name: 'Siti Aminah',
    email: 'siti.aminah@gmail.com',
    phone: '+62 812-3333-4444',
    password: 'Jamaah2026!',
    photo: 'https://picsum.photos/seed/woman1/100/100',
    agency: 'Al-Haramain Travel',
    role: 'Jamaah',
    region: 'Bandung',
    address: 'Jl. Dago Asri No. 8, Bandung',
    jamaahId: 'JMH002',
    passportNumber: 'A1234501'
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load current user
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('travelops_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [previewMode, setPreviewMode] = useState<boolean>(false);

  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('travelops_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const updated = [...parsed];
          DEFAULT_USERS.forEach(defUser => {
            const idx = updated.findIndex(u => u.email?.toLowerCase() === defUser.email.toLowerCase());
            if (idx === -1) {
              updated.push(defUser);
            } else if (!updated[idx].password) {
              updated[idx].password = defUser.password;
            }
          });
          return updated;
        }
      }
    } catch (e) {}
    return DEFAULT_USERS;
  });

  const currentEmail = currentUser?.email || '';
  const isAdmin = currentUser?.role === 'Travel Admin' || currentUser?.role === 'Super Admin' || currentUser?.role === 'Ops Staff';
  const isJamaah = currentUser?.role === 'Jamaah' || currentUser?.role === 'User';

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
  const [packages, setPackages] = useState<Package[]>(PACKAGES_MOCK);
  // Jamaah list state
  const [jamaahList, setJamaahList] = useState<Jamaah[]>(JAMAAH_MOCK);
  // Active Jamaah Record
  const [activeJamaah, setActiveJamaah] = useState<Jamaah | null>(null);
  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // User Profile state
  const [userProfile, setUserProfileState] = useState<UserProfile>(() => {
    const savedUser = localStorage.getItem('travelops_current_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {}
    }
    if (currentUser) return currentUser;
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
  });

  // Wrapper for setUserProfile that updates currentUser, users list, localStorage, and backend
  const setUserProfile = useCallback((profileOrUpdater: React.SetStateAction<UserProfile>) => {
    setUserProfileState(prev => {
      const updated = typeof profileOrUpdater === 'function' ? profileOrUpdater(prev) : profileOrUpdater;
      
      if (updated && updated.email) {
        setCurrentUser(updated);
        localStorage.setItem('travelops_current_user', JSON.stringify(updated));
      }

      setUsers(prevUsers => {
        if (!updated || !updated.email) return prevUsers;
        const cleanEmail = updated.email.toLowerCase();
        const idx = prevUsers.findIndex(u => u.email?.toLowerCase() === cleanEmail);
        let updatedList;
        if (idx !== -1) {
          updatedList = [...prevUsers];
          updatedList[idx] = { ...updatedList[idx], ...updated };
        } else {
          updatedList = [...prevUsers, updated];
        }
        localStorage.setItem('travelops_users', JSON.stringify(updatedList));
        return updatedList;
      });

      if (localStorage.getItem('travelops_token') && updated?.email) {
        authApi.updateProfile(updated).catch(console.error);
      }

      return updated;
    });
  }, []);

  // Sync userProfile state whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      setUserProfileState(currentUser);
    }
  }, [currentUser]);

  // Sync activeJamaah whenever currentUser or jamaahList changes
  useEffect(() => {
    if (!currentUser) {
      setActiveJamaah(null);
      return;
    }

    const cleanEmail = currentUser.email?.toLowerCase();
    const found = jamaahList.find((j: Jamaah) => 
      (currentUser.jamaahId && j.id === currentUser.jamaahId) ||
      (cleanEmail && j.email?.toLowerCase() === cleanEmail) ||
      (currentUser.passportNumber && j.passportNumber === currentUser.passportNumber)
    );

    if (found) {
      setActiveJamaah(found);
    } else if (currentUser.role === 'Jamaah' || currentUser.role === 'User') {
      const userJamaah: Jamaah = {
        id: currentUser.jamaahId || `JMH_${String(Date.now()).slice(-4)}`,
        name: currentUser.name || 'Jemaah TravelOps',
        email: currentUser.email,
        phone: currentUser.phone || '+62 812-0000-0000',
        avatarUrl: currentUser.photo || `https://picsum.photos/seed/${currentUser.email}/100/100`,
        package: 'Umroh Regular (Terdaftar)',
        departureDate: '2026-06-15',
        status: JamaahStatus.BOOKED,
        kloter: 'Kloter Mandiri',
        gender: 'L',
        city: currentUser.region || currentUser.address || 'Indonesia',
        passportNumber: currentUser.passportNumber || 'A' + Math.floor(1000000 + Math.random() * 9000000),
        paymentStatus: 'DP',
        totalPrice: 35000000,
        paidAmount: 15000000
      };
      setActiveJamaah(userJamaah);
    } else {
      setActiveJamaah(null);
    }
  }, [currentUser, jamaahList]);

  // App Settings state
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    if (!currentEmail) return { enableBell: true, enableToast: true };
    const saved = localStorage.getItem(`travelops_app_settings_${currentEmail}`);
    return saved ? JSON.parse(saved) : { enableBell: true, enableToast: true };
  });

  // Fetch all backend API data safely
  const refreshData = useCallback(async () => {
    try {
      if (localStorage.getItem('travelops_token')) {
        const meRes = await authApi.getMe().catch(() => null);
        if (meRes?.success && meRes.user) {
          setCurrentUser(meRes.user);
          setUserProfileState(meRes.user);
          localStorage.setItem('travelops_current_user', JSON.stringify(meRes.user));
        }
      }

      // Packages
      const pkgRes = await packagesApi.getAll().catch(() => null);
      if (pkgRes?.success && Array.isArray(pkgRes.packages)) {
        setPackages(pkgRes.packages);
      }

      // Jamaah
      const jmRes = await jamaahApi.getAll().catch(() => null);
      if (jmRes?.success && Array.isArray(jmRes.jamaah)) {
        setJamaahList(jmRes.jamaah);
      }

      // Notifications
      const notifRes = await notificationsApi.getAll().catch(() => null);
      if (notifRes?.success && Array.isArray(notifRes.notifications)) {
        setNotifications(notifRes.notifications);
      }
    } catch (err) {
      console.warn('API sync fallback to local cache:', err);
    }
  }, [currentUser?.email]);

  useEffect(() => {
    refreshData();
  }, []);

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

  const updateActiveJamaah = (updated: Partial<Jamaah>) => {
    if (!activeJamaah) return;
    const newRecord = { ...activeJamaah, ...updated };
    setActiveJamaah(newRecord);
    setJamaahList(prev => prev.map(j => j.id === newRecord.id ? newRecord : j));
    jamaahApi.update(newRecord.id, updated).catch(console.error);
  };

  // Auth Functions
  const login = async (email: string, password?: string): Promise<LoginResult> => {
    const cleanEmail = email.trim().toLowerCase();
    
    let apiErrorReason: 'NOT_FOUND' | 'WRONG_PASSWORD' | 'SUSPENDED' | 'FAILED' | undefined;
    let apiErrorMessage: string | undefined;

    try {
      const res = await authApi.login({ email: cleanEmail, password });
      if (res.success && res.user && res.token) {
        setCurrentUser(res.user);
        setUserProfile(res.user);
        setPreviewMode(false);
        localStorage.setItem('travelops_current_user', JSON.stringify(res.user));
        await refreshData();
        return { success: true };
      }
    } catch (err: any) {
      const errMsg = err?.message || '';
      if (errMsg.toLowerCase().includes('not found') || errMsg.toLowerCase().includes('tidak ditemukan')) {
        apiErrorReason = 'NOT_FOUND';
        apiErrorMessage = language === 'id' ? 'Email tidak terdaftar dalam database kami.' : 'Email address not found in our database.';
      } else if (errMsg.toLowerCase().includes('incorrect password') || errMsg.toLowerCase().includes('salah')) {
        apiErrorReason = 'WRONG_PASSWORD';
        apiErrorMessage = language === 'id' ? 'Kata sandi yang Anda masukkan salah.' : 'Incorrect password.';
      } else if (errMsg.toLowerCase().includes('suspended')) {
        apiErrorReason = 'SUSPENDED';
        apiErrorMessage = language === 'id' ? 'Akun Anda telah ditangguhkan oleh Administrator.' : 'Your account has been suspended by an Administrator.';
      }
    }

    // Fallback to local default users if server API connection is down or returned error
    let userList: UserProfile[] = [...users];
    DEFAULT_USERS.forEach(def => {
      if (!userList.some(u => u.email.toLowerCase() === def.email.toLowerCase())) {
        userList.push(def);
      }
    });

    const matched = userList.find(u => u.email?.toLowerCase() === cleanEmail);
    if (!matched) {
      return {
        success: false,
        reason: apiErrorReason || 'NOT_FOUND',
        message: apiErrorMessage || (language === 'id' ? 'Akun belum terdaftar dalam sistem.' : 'Account is not registered in our system.')
      };
    }
    if (password && matched.password && matched.password !== password) {
      return {
        success: false,
        reason: 'WRONG_PASSWORD',
        message: language === 'id' ? 'Kata sandi yang Anda masukkan salah.' : 'Incorrect password.'
      };
    }

    setCurrentUser(matched);
    setUserProfile(matched);
    setPreviewMode(false);
    localStorage.setItem('travelops_current_user', JSON.stringify(matched));
    return { success: true };
  };

  const loginJamaahByPassport = async (passportOrBooking: string, passwordOrPin?: string): Promise<LoginResult> => {
    const query = passportOrBooking.trim().toUpperCase();
    if (!query) {
      return { success: false, reason: 'FAILED', message: 'Input tidak boleh kosong.' };
    }

    const matchedJamaah = jamaahList.find(j => 
      (j.passportNumber && j.passportNumber.toUpperCase() === query) ||
      (j.id && j.id.toUpperCase() === query)
    ) || JAMAAH_MOCK.find(j => 
      (j.passportNumber && j.passportNumber.toUpperCase() === query) ||
      (j.id && j.id.toUpperCase() === query)
    );

    if (!matchedJamaah) {
      return {
        success: false,
        reason: 'NOT_FOUND',
        message: language === 'id' ? 'Nomor Paspor / Kode Booking tidak terdaftar!' : 'Passport / Booking ID is not registered!'
      };
    }

    let userRecord = users.find(u => u.email?.toLowerCase() === matchedJamaah.email?.toLowerCase());
    
    if (!userRecord) {
      userRecord = {
        name: matchedJamaah.name,
        email: matchedJamaah.email || `${matchedJamaah.id.toLowerCase()}@jamaah.travelops.com`,
        phone: matchedJamaah.phone || '+62 812-0000-0000',
        password: passwordOrPin || 'Jamaah2026!',
        photo: matchedJamaah.avatarUrl,
        agency: 'Al-Haramain Travel',
        role: 'Jamaah',
        region: matchedJamaah.city || 'Indonesia',
        address: 'Alamat Jemaah ' + matchedJamaah.name,
        jamaahId: matchedJamaah.id,
        passportNumber: matchedJamaah.passportNumber
      };
    }

    // Try backend login first
    try {
      const res = await authApi.login({ email: userRecord.email, password: passwordOrPin || 'Jamaah2026!' });
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setUserProfile(res.user);
        setActiveJamaah(matchedJamaah);
        setPreviewMode(false);
        return { success: true };
      }
    } catch (e) {}

    setCurrentUser(userRecord);
    setUserProfile(userRecord);
    setActiveJamaah(matchedJamaah);
    setPreviewMode(false);
    localStorage.setItem('travelops_current_user', JSON.stringify(userRecord));
    return { success: true };
  };

  const registerUser = async (newUser: UserProfile) => {
    try {
      const res = await authApi.register({
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        password: newUser.password,
        agency: newUser.agency,
        role: newUser.role,
        region: newUser.region,
        address: newUser.address
      });
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setUserProfile(res.user);
        localStorage.setItem('travelops_current_user', JSON.stringify(res.user));
        await refreshData();
        return;
      }
    } catch (err) {
      console.warn('API Register error, writing to local users:', err);
    }

    const updated = [...users, newUser];
    setUsers(updated);
    localStorage.setItem('travelops_users', JSON.stringify(updated));
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    setCurrentUser(null);
    setActiveJamaah(null);
    setPreviewMode(false);
    localStorage.removeItem('travelops_current_user');
    localStorage.removeItem('travelops_token');
    setUserProfileState({
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

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

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
    notificationsApi.create({ titleEn, titleId, descEn, descId, type }).catch(console.error);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    notificationsApi.markRead(id).catch(console.error);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    notificationsApi.markAllRead().catch(console.error);
  };

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (appSettings.enableToast) {
      setToast({ message, type });
    }
  };

  const closeToast = () => setToast(null);

  const resetAllData = () => {
    setPackages([]);
    setJamaahList([]);
    setNotifications([]);
  };

  const restoreDefaultSeeds = async () => {
    try {
      await authApi.login({ email: 'superadmin@travelops.com', password: 'SuperAdmin2026!' }).catch(() => {});
      await refreshData();
    } catch (e) {}
    setPackages(PACKAGES_MOCK);
    setJamaahList(JAMAAH_MOCK);
  };

  const bookPackageAsUser = async (packageId: string, paxCount: number, notes?: string, customName?: string): Promise<boolean> => {
    const pkg = packages.find(p => p.id === packageId) || PACKAGES_MOCK.find(p => p.id === packageId);
    if (!pkg) return false;

    const bookerName = customName || currentUser?.name || activeJamaah?.name || 'Jemaah Online';
    const bookerEmail = currentUser?.email || 'jamaah@travelops.com';
    const bookerPhone = currentUser?.phone || '+62 812-0000-0000';
    const totalAmount = pkg.price * paxCount;

    const updatedPackages = packages.map(p => {
      if (p.id === packageId) {
        const newBooked = Math.min(p.quota, p.booked + paxCount);
        return {
          ...p,
          booked: newBooked,
          status: (newBooked >= p.quota ? 'Sold Out' : p.status) as Package['status']
        };
      }
      return p;
    });
    setPackages(updatedPackages);

    // Update package on server
    packagesApi.update(packageId, { booked: Math.min(pkg.quota, pkg.booked + paxCount) }).catch(console.error);

    const newJamaahId = `JMH${String(Date.now()).slice(-4)}`;
    const newBookingRecord: Jamaah = {
      id: newJamaahId,
      name: `${bookerName}${paxCount > 1 ? ` (+${paxCount - 1} Keluarga)` : ''}`,
      avatarUrl: currentUser?.photo || `https://picsum.photos/seed/${newJamaahId}/100/100`,
      package: pkg.name,
      departureDate: pkg.departureDate || '2026-06-15',
      status: JamaahStatus.BOOKED,
      kloter: 'Kloter B',
      gender: 'L',
      city: currentUser?.region || 'Jakarta',
      email: bookerEmail,
      phone: bookerPhone,
      passportNumber: activeJamaah?.passportNumber || `B${Math.floor(1000000 + Math.random() * 9000000)}`,
      paymentStatus: 'DP',
      totalPrice: totalAmount,
      paidAmount: Math.floor(totalAmount * 0.3)
    };

    setJamaahList(prev => [newBookingRecord, ...prev]);

    // Create Jamaah on server
    jamaahApi.create(newBookingRecord).catch(console.error);

    triggerToast(
      language === 'id' 
        ? `Sukses! Pendaftaran paket ${pkg.name} (${paxCount} Pax) telah dikirim ke Admin.` 
        : `Success! Booking for ${pkg.name} (${paxCount} Pax) has been submitted to Admin.`,
      'success'
    );

    return true;
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
      loginJamaahByPassport,
      registerUser,
      logout,
      activeJamaah,
      updateActiveJamaah,
      bookPackageAsUser,
      isAdmin,
      isJamaah,
      previewMode,
      setPreviewMode,
      refreshData
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
