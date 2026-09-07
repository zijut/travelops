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
import { OpsTask } from './types';
import { MOCK_TASKS } from './constants';
import { useApp } from './AppContext';

const pathToView: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/paket': 'Paket & Penjualan',
  '/jamaah': 'Jamaah',
  '/operasional': 'Operasional',
  '/visa': 'Visa & Dokumen',
  '/keuangan': 'Keuangan',
  '/laporan': 'Laporan',
  '/profile': 'Profile',
  '/settings': 'Settings',
};

const viewToPath: Record<string, string> = {
  'Dashboard': '/dashboard',
  'Paket & Penjualan': '/paket',
  'Jamaah': '/jamaah',
  'Operasional': '/operasional',
  'Visa & Dokumen': '/visa',
  'Keuangan': '/keuangan',
  'Laporan': '/laporan',
  'Profile': '/profile',
  'Settings': '/settings',
};

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // AppContext values
  const { isDarkMode, toast, closeToast, currentUser, userProfile } = useApp();

  const activeView = pathToView[location.pathname] || 'Dashboard';

  const setActiveView = (view: string) => {
    const path = viewToPath[view] || '/dashboard';
    navigate(path);
  };

  // Redirect and route guarding
  useEffect(() => {
    const isPublicPath = ['/', '/login', '/register'].includes(location.pathname);
    
    if (!currentUser) {
      if (!isPublicPath) {
        navigate('/', { replace: true });
      }
    } else {
      if (isPublicPath) {
        navigate('/dashboard', { replace: true });
      } else if (!pathToView[location.pathname]) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [location.pathname, currentUser, navigate]);

  const [isBotOpen, setIsBotOpen] = useState(false);

  const currentEmail = currentUser?.email || '';

  // OpsCenter State (Lifted, user isolated)
  const [opsTasks, setOpsTasks] = useState<OpsTask[]>(() => {
    if (!currentEmail) return [];
    const saved = localStorage.getItem(`travelops_ops_tasks_${currentEmail}`);
    if (saved) return JSON.parse(saved);
    return currentEmail === 'abdullah@alharamain.id' ? MOCK_TASKS : [];
  });

  // Reload tasks when current user changes (e.g. after registration or logging in)
  useEffect(() => {
    if (currentEmail) {
      const saved = localStorage.getItem(`travelops_ops_tasks_${currentEmail}`);
      setOpsTasks(saved ? JSON.parse(saved) : (currentEmail === 'abdullah@alharamain.id' ? MOCK_TASKS : []));
    } else {
      setOpsTasks([]);
    }
  }, [currentEmail]);

  // Sync tasks to local storage
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

  // Bot Command Handler
  const handleBotCommand = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    // Command: Add Task
    if (lowerText.startsWith('add task') || lowerText.startsWith('create task')) {
      const title = text.replace(/add task|create task/i, '').trim();
      if (!title) return "Please specify a task title. E.g., 'Add task Buy Zamzam water'";
      
      const newTask: OpsTask = {
        id: Date.now().toString(),
        title: title,
        category: 'Pre-Departure', // Default category
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

    // Command: Complete Task
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

    // Command: Switch Kloter
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

    // Command: Status Report
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

  const renderView = () => {
    switch (activeView) {
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
        return <Dashboard />;
    }
  };

  // Render public views if not authenticated
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

        {/* Bilingual micro-feedback float toast */}
        {toast && (
          <div className={`fixed bottom-5 right-24 p-3 rounded-2xl shadow-2xl flex items-center space-x-3 max-w-sm border z-50 transition-all transform animate-slide-in-up ${
            toast.type === 'error' 
              ? 'bg-rose-500 border-rose-600 text-white shadow-rose-500/15' 
              : toast.type === 'info'
                ? 'bg-blue-600 border-blue-700 text-white shadow-blue-500/15'
                : 'bg-emerald-600 border-emerald-700 text-white shadow-emerald-500/15'
          }`}>
            {toast.type === 'error' ? (
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ width: '20px', height: '20px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ width: '20px', height: '20px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="text-xs font-bold leading-tight">{toast.message}</span>
            <button onClick={closeToast} className="text-white/85 hover:text-white hover:opacity-100 transition-opacity pl-1.5 shrink-0 cursor-pointer">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} style={{ width: '16px', height: '16px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`h-screen w-full max-w-full overflow-hidden flex flex-col md:flex-row transition-colors duration-250 ${
      isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Sidebar navigation for desktop */}
      <div className="hidden md:flex h-screen shrink-0">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
      </div>
      
      {/* Main viewport area with bottom padding on mobile for footer */}
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

      {/* Bilingual micro-feedback float toast */}
      {toast && (
        <div className={`fixed bottom-5 right-24 p-3 rounded-2xl shadow-2xl flex items-center space-x-3 max-w-sm border z-50 transition-all transform animate-slide-in-up ${
          toast.type === 'error' 
            ? 'bg-rose-500 border-rose-600 text-white shadow-rose-500/15' 
            : toast.type === 'info'
              ? 'bg-blue-600 border-blue-700 text-white shadow-blue-500/15'
              : 'bg-emerald-600 border-emerald-700 text-white shadow-emerald-500/15'
        }`}>
          {toast.type === 'error' ? (
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className="text-xs font-bold leading-tight">{toast.message}</span>
          <button onClick={closeToast} className="text-white/85 hover:text-white hover:opacity-100 transition-opacity pl-1.5 shrink-0 cursor-pointer">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} style={{ width: '16px', height: '16px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
