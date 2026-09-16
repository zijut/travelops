import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomBar from './components/BottomBar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import PackageList from './components/PackageList';
import JamaahList from './components/JamaahList';
import OpsCenter from './components/OpsCenter';
import VisaCenter from './components/VisaCenter';
import Finance from './components/Finance';
import Reports from './components/Reports';
import OpsBot from './components/OpsBot';
import Profile from './components/Profile';
import Settings from './components/Settings';
import Landing from './components/Landing';
import Login from './components/Login';
import Register from './components/Register';

// User / Pilgrim Portal Components
import { UserDashboard } from './components/user/UserDashboard';
import { UserDocuments } from './components/user/UserDocuments';
import { UserItinerary } from './components/user/UserItinerary';
import { UserRoomAndBus } from './components/user/UserRoomAndBus';
import { UserPayments } from './components/user/UserPayments';
import { UserManasik } from './components/user/UserManasik';
import { UserPackages } from './components/user/UserPackages';
import { UserProfileView } from './components/user/UserProfileView';
import { UserSidebar } from './components/user/UserSidebar';
import { UserHeader } from './components/user/UserHeader';
import { UserBottomBar } from './components/user/UserBottomBar';

import { OpsTask } from './types';
import { MOCK_TASKS } from './constants';
import { useApp } from './AppContext';

const pathToView: Record<string, string> = {
  // Admin routes
  '/dashboard': 'Dashboard',
  '/paket': 'Paket & Penjualan',
  '/jamaah': 'Jamaah',
  '/operasional': 'Operasional',
  '/visa': 'Visa & Dokumen',
  '/keuangan': 'Keuangan',
  '/laporan': 'Laporan',
  '/profile': 'Profile',
  '/settings': 'Settings',

  // User / Pilgrim routes
  '/user/dashboard': 'Ringkasan Perjalanan',
  '/user/dokumen': 'Dokumen & Visa',
  '/user/itinerary': 'Jadwal & Itinerary',
  '/user/kamar-bus': 'Kamar & Kursi Bus',
  '/user/pembayaran': 'Tagihan & Bukti Bayar',
  '/user/manasik': 'Buku Doa & Manasik',
  '/user/paket': 'Katalog Paket',
  '/user/profil': 'Profil Jemaah',
};

const viewToPath: Record<string, string> = {
  // Admin views
  'Dashboard': '/dashboard',
  'Paket & Penjualan': '/paket',
  'Jamaah': '/jamaah',
  'Operasional': '/operasional',
  'Visa & Dokumen': '/visa',
  'Keuangan': '/keuangan',
  'Laporan': '/laporan',
  'Profile': '/profile',
  'Settings': '/settings',

  // User views
  'Ringkasan Perjalanan': '/user/dashboard',
  'Dokumen & Visa': '/user/dokumen',
  'Jadwal & Itinerary': '/user/itinerary',
  'Kamar & Kursi Bus': '/user/kamar-bus',
  'Tagihan & Bukti Bayar': '/user/pembayaran',
  'Buku Doa & Manasik': '/user/manasik',
  'Katalog Paket': '/user/paket',
  'Profil Jemaah': '/user/profil',
};

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // AppContext values
  const { isDarkMode, toast, closeToast, currentUser, userProfile, isAdmin, isJamaah, previewMode, setPreviewMode } = useApp();

  const activeView = pathToView[location.pathname] || (isJamaah ? 'Ringkasan Perjalanan' : 'Dashboard');

  const setActiveView = (view: string) => {
    const path = viewToPath[view] || (isJamaah ? '/user/dashboard' : '/dashboard');
    navigate(path);
  };

  // Route Guarding based on authentication and user roles
  useEffect(() => {
    const isPublicPath = ['/', '/login', '/register'].includes(location.pathname);
    
    if (!currentUser) {
      if (!isPublicPath) {
        navigate('/', { replace: true });
      }
    } else {
      // Authenticated User Routing
      if (isPublicPath) {
        if (isJamaah) {
          navigate('/user/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else if (isJamaah) {
        // If logged in as Jamaah but tries to access Admin route, redirect to User dashboard
        if (!location.pathname.startsWith('/user/')) {
          navigate('/user/dashboard', { replace: true });
        }
      } else if (isAdmin) {
        // Admin user can navigate to admin routes or user preview routes
        if (!pathToView[location.pathname]) {
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [location.pathname, currentUser, isJamaah, isAdmin, navigate]);

  const [isBotOpen, setIsBotOpen] = useState(false);

  const currentEmail = currentUser?.email || '';

  // OpsCenter State (Admin isolated)
  const [opsTasks, setOpsTasks] = useState<OpsTask[]>(() => {
    if (!currentEmail) return [];
    const saved = localStorage.getItem(`travelops_ops_tasks_${currentEmail}`);
    if (saved) return JSON.parse(saved);
    return currentEmail === 'abdullah@alharamain.id' ? MOCK_TASKS : [];
  });

  useEffect(() => {
    if (currentEmail) {
      const saved = localStorage.getItem(`travelops_ops_tasks_${currentEmail}`);
      setOpsTasks(saved ? JSON.parse(saved) : (currentEmail === 'abdullah@alharamain.id' ? MOCK_TASKS : []));
    } else {
      setOpsTasks([]);
    }
  }, [currentEmail]);

  useEffect(() => {
    if (currentEmail) {
      localStorage.setItem(`travelops_ops_tasks_${currentEmail}`, JSON.stringify(opsTasks));
    }
  }, [opsTasks, currentEmail]);

  const [opsKloter, setOpsKloter] = useState('Kloter A');

  // Scroll to main top on activeView transition
  const mainScrollRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
  }, [activeView]);

  // Bot Command Handler (Admin)
  const handleBotCommand = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.startsWith('add task') || lowerText.startsWith('create task')) {
      const title = text.replace(/add task|create task/i, '').trim();
      if (!title) return "Please specify a task title. E.g., 'Add task Buy Zamzam water'";
      
      const newTask: OpsTask = {
        id: Date.now().toString(),
        title: title,
        category: 'Pre-Departure',
        dueDate: new Date().toISOString().split('T')[0],
        completed: false,
        assignee: 'Bot',
        priority: 'Medium',
        description: 'Created via OpsBot command.',
        subtasks: [],
        kloter: opsKloter
      };
      
      setOpsTasks(prev => [...prev, newTask]);
      if (activeView !== 'Operasional') setActiveView('Operasional');
      return `Task "${title}" added successfully to Pre-Departure checklist.`;
    }

    if (lowerText.startsWith('complete') || lowerText.startsWith('finish') || lowerText.startsWith('mark done')) {
      const search = text.replace(/complete|finish|mark done/i, '').trim();
      const taskIndex = opsTasks.findIndex(t => t.title.toLowerCase().includes(search.toLowerCase()));
      
      if (taskIndex >= 0) {
        const task = opsTasks[taskIndex];
        const updatedTasks = [...opsTasks];
        updatedTasks[taskIndex] = { ...task, completed: true };
        setOpsTasks(updatedTasks);
        return `Task "${task.title}" has been marked as completed.`;
      }
      return `I couldn't find a task matching "${search}".`;
    }

    if (lowerText.includes('switch to kloter') || lowerText.includes('show kloter')) {
      if (lowerText.includes('kloter a')) {
        setOpsKloter('Kloter A');
        setActiveView('Operasional');
        return "Switched view to Kloter A.";
      }
      if (lowerText.includes('kloter b')) {
        setOpsKloter('Kloter B');
        setActiveView('Operasional');
        return "Switched view to Kloter B.";
      }
      if (lowerText.includes('kloter c')) {
        setOpsKloter('Kloter C');
        setActiveView('Operasional');
        return "Switched view to Kloter C.";
      }
      return "Please specify Kloter A, B, or C.";
    }

    if (lowerText.includes('status') || lowerText.includes('report')) {
      const total = opsTasks.length;
      const completed = opsTasks.filter(t => t.completed).length;
      return `Current Operations Status for ${opsKloter}: ${completed}/${total} tasks completed.`;
    }
    
    if (lowerText.includes('hello') || lowerText.includes('hi')) {
      return "Assalamualaikum! I can help you manage operations. Try 'Add task [name]', 'Complete [task]', or 'Show Kloter A'.";
    }

    return "I didn't quite get that. You can ask me to 'Add task', 'Complete task', or 'Switch to Kloter'.";
  };

  // Render view based on activeView
  const renderView = () => {
    switch (activeView) {
      // User / Pilgrim Views
      case 'Ringkasan Perjalanan':
        return <UserDashboard setActiveView={setActiveView} />;
      case 'Dokumen & Visa':
        return <UserDocuments />;
      case 'Jadwal & Itinerary':
        return <UserItinerary />;
      case 'Kamar & Kursi Bus':
        return <UserRoomAndBus />;
      case 'Tagihan & Bukti Bayar':
        return <UserPayments />;
      case 'Buku Doa & Manasik':
        return <UserManasik />;
      case 'Katalog Paket':
        return <UserPackages />;
      case 'Profil Jemaah':
        return <UserProfileView />;

      // Admin Views
      case 'Dashboard':
        return <Dashboard />;
      case 'Paket & Penjualan':
        return <PackageList />;
      case 'Jamaah':
        return <JamaahList />;
      case 'Operasional':
        return (
          <OpsCenter 
            tasks={opsTasks} 
            setTasks={setOpsTasks} 
            selectedKloter={opsKloter} 
            setSelectedKloter={setOpsKloter} 
            setActiveView={setActiveView}
          />
        );
      case 'Visa & Dokumen':
        return <VisaCenter />;
      case 'Keuangan':
        return <Finance />;
      case 'Laporan':
        return <Reports />;
      case 'Profile':
        return <Profile />;
      case 'Settings':
        return <Settings />;
      default:
        return isJamaah ? <UserDashboard setActiveView={setActiveView} /> : <Dashboard />;
    }
  };

  // Render public landing / login / register views if not authenticated
  if (!currentUser) {
    return (
      <div className={`min-h-screen w-full max-w-full overflow-x-hidden transition-colors duration-250 ${
        isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}>
        {location.pathname === '/login' ? (
          <Login />
        ) : location.pathname === '/register' ? (
          <Register />
        ) : (
          <Landing />
        )}

        {/* Floating Toast Notification */}
        {toast && (
          <div className={`fixed bottom-5 right-6 sm:right-10 p-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 max-w-sm border z-50 transition-all transform animate-slide-in-up ${
            toast.type === 'error' 
              ? 'bg-rose-500 border-rose-600 text-white shadow-rose-500/15' 
              : toast.type === 'info'
                ? 'bg-blue-600 border-blue-700 text-white shadow-blue-500/15'
                : 'bg-emerald-600 border-emerald-700 text-white shadow-emerald-500/15'
          }`}>
            {toast.type === 'error' ? (
              <span className="text-base shrink-0">⚠️</span>
            ) : (
              <span className="text-base shrink-0">✓</span>
            )}
            <span className="text-xs font-bold leading-tight">{toast.message}</span>
            <button onClick={closeToast} className="text-white/85 hover:text-white pl-2 shrink-0 cursor-pointer font-bold">
              ✕
            </button>
          </div>
        )}
      </div>
    );
  }

  // Determine if User / Pilgrim Layout or Admin Layout should be shown
  const isUserView = isJamaah || location.pathname.startsWith('/user/');

  // 1. USER / PILGRIM PORTAL LAYOUT
  if (isUserView) {
    return (
      <div className={`h-screen w-full max-w-full overflow-hidden flex flex-col md:flex-row transition-colors duration-250 ${
        isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}>
        {/* User Sidebar for Desktop */}
        <div className="hidden md:flex h-screen shrink-0">
          <UserSidebar activeView={activeView} setActiveView={setActiveView} />
        </div>

        {/* Main User Viewport */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden pb-16 md:pb-0">
          <UserHeader travelName={userProfile?.agency || 'Al-Haramain Travel'} setActiveView={setActiveView} />
          <main ref={mainScrollRef} className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto overflow-x-hidden">
            {renderView()}
          </main>
        </div>

        {/* User Bottom Bar for Mobile */}
        <div className="block md:hidden">
          <UserBottomBar activeView={activeView} setActiveView={setActiveView} />
        </div>

        {/* Floating Toast Notification */}
        {toast && (
          <div className={`fixed bottom-5 right-6 sm:right-10 p-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 max-w-sm border z-50 transition-all transform animate-slide-in-up ${
            toast.type === 'error' 
              ? 'bg-rose-500 border-rose-600 text-white shadow-rose-500/15' 
              : toast.type === 'info'
                ? 'bg-blue-600 border-blue-700 text-white shadow-blue-500/15'
                : 'bg-emerald-600 border-emerald-700 text-white shadow-emerald-500/15'
          }`}>
            {toast.type === 'error' ? (
              <span className="text-base shrink-0">⚠️</span>
            ) : (
              <span className="text-base shrink-0">✓</span>
            )}
            <span className="text-xs font-bold leading-tight">{toast.message}</span>
            <button onClick={closeToast} className="text-white/85 hover:text-white pl-2 shrink-0 cursor-pointer font-bold">
              ✕
            </button>
          </div>
        )}
      </div>
    );
  }

  // 2. ADMIN / OPERATIONAL OS LAYOUT
  return (
    <div className={`h-screen w-full max-w-full overflow-hidden flex flex-col md:flex-row transition-colors duration-250 ${
      isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Sidebar navigation for desktop */}
      <div className="hidden md:flex h-screen shrink-0">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
      </div>
      
      {/* Main viewport area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden pb-16 md:pb-0">
        <Header travelName={userProfile?.agency || 'Al-Haramain Travel'} setActiveView={setActiveView} />
        <main ref={mainScrollRef} className="p-4 lg:p-6 flex-1 overflow-y-auto overflow-x-hidden">
          {renderView()}
        </main>
      </div>

      {/* Bottom bar navigation for mobile */}
      <div className="block md:hidden">
        <BottomBar activeView={activeView} setActiveView={setActiveView} />
      </div>

      {/* Operations chat assistant */}
      <OpsBot 
        isOpen={isBotOpen} 
        setIsOpen={setIsBotOpen} 
        onCommand={handleBotCommand}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-6 sm:right-24 p-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 max-w-sm border z-50 transition-all transform animate-slide-in-up ${
          toast.type === 'error' 
            ? 'bg-rose-500 border-rose-600 text-white shadow-rose-500/15' 
            : toast.type === 'info'
              ? 'bg-blue-600 border-blue-700 text-white shadow-blue-500/15'
              : 'bg-emerald-600 border-emerald-700 text-white shadow-emerald-500/15'
        }`}>
          {toast.type === 'error' ? (
            <span className="text-base shrink-0">⚠️</span>
          ) : (
            <span className="text-base shrink-0">✓</span>
          )}
          <span className="text-xs font-bold leading-tight">{toast.message}</span>
          <button onClick={closeToast} className="text-white/85 hover:text-white pl-2 shrink-0 cursor-pointer font-bold">
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
