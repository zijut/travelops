import React, { useState, useEffect } from 'react';
import { Card } from './shared/Card';
import { Icon } from './shared/Icon';
import { OpsTask, TaskCategory, TaskPriority, SubTask } from '../types';
import { TEAM_MEMBERS } from '../constants';
import { useApp } from '../AppContext';
import { tasksApi } from '../services/api';

interface OpsCenterProps {
  tasks: OpsTask[];
  setTasks: React.Dispatch<React.SetStateAction<OpsTask[]>>;
  selectedKloter: string;
  setSelectedKloter: (kloter: string) => void;
  setActiveView?: (view: string) => void;
}

const OP_TRANSLATIONS = {
  id: {
    quickActions: 'Tindakan Cepat',
    roomingList: 'Daftar Kamar (Rooming List)',
    manifestPdf: 'Unduh Manifes (PDF/CSV)',
    visaStatus: 'Status Visa & Dokumen',
    itinerary: 'Jadwal Perjalanan (Itinerary)',
    recentActivity: 'Aktivitas Terbaru',
    createTask: 'Buat Tugas Baru',
    checklistTitle: 'Pusat Operasional & Logistik',
    checklistSubtitle: 'Manajemen alur kerja keberangkatan, visa, hotel, katering, dan asuransi grup.',
    activeGroup: 'Kloter Aktif',
    taskTitle: 'Judul Tugas',
    category: 'Kategori',
    priority: 'Prioritas',
    assignee: 'PJ',
    dueDate: 'Tenggat',
    description: 'Deskripsi',
    cancel: 'Batal',
    create: 'Buat',
    subtasks: 'Sub-tugas',
    noActivity: 'Belum ada aktivitas baru.',
    toastManifest: 'Manifest Penerbangan untuk {kloter} berhasil diunduh!',
    itineraryTitle: 'Jadwal Perjalanan {kloter}',
    viewItinerary: 'Rencana Perjalanan Detail & Ziarah',
    activityMarked: 'menandai tugas',
    activityDone: 'sebagai selesai.',
    activitySystem: 'Sistem',
    activityAhmad: 'menyelesaikan manifes Kloter A.',
    allTasks: 'Semua Tugas',
    statsCompleted: 'Tugas Selesai',
    sortTitle: 'Urutkan',
    date: 'Tanggal',
    subtaskText: 'Menambahkan Sub-tugas',
    roomingTitle: 'Manajemen Pembagian Kamar - {kloter}',
    roomingSubtitle: 'Kelompokkan jemaah ke dalam kamar hotel di Makkah (Anjum Makkah) dan Madinah (Grand Plaza).',
    addRoom: 'Buat Kamar Baru',
    selectPilgrim: 'Pilih Jemaah',
    assign: 'Masukkan',
    emptyRoom: 'Kamar Kosong'
  },
  en: {
    quickActions: 'Quick Actions',
    roomingList: 'Room Allocations',
    manifestPdf: 'Flight Manifest (PDF/CSV)',
    visaStatus: 'Visa Verification',
    itinerary: 'Itinerary Schedule',
    recentActivity: 'Recent Activity',
    createTask: 'Create Checklist Task',
    checklistTitle: 'Operations & Logistics Hub',
    checklistSubtitle: 'Manage pre-departure milestones, flight lists, hotel contracts, transport, and Saudi services.',
    activeGroup: 'Active Flight Group',
    taskTitle: 'Task Title',
    category: 'Category',
    priority: 'Priority',
    assignee: 'Assignee',
    dueDate: 'Due Date',
    description: 'Description',
    cancel: 'Cancel',
    create: 'Create',
    subtasks: 'Subtasks',
    noActivity: 'No recent action logs.',
    toastManifest: 'Flight Manifest for {kloter} has been successfully downloaded!',
    itineraryTitle: 'Itinerary Schedule for {kloter}',
    viewItinerary: 'Detailed Flight, Hotel, & Daily Itinerary',
    activityMarked: 'marked task',
    activityDone: 'as completed.',
    activitySystem: 'System',
    activityAhmad: 'generated flight manifest for Kloter A.',
    allTasks: 'All Tasks',
    statsCompleted: 'Completed',
    sortTitle: 'Sort By',
    date: 'Date',
    subtaskText: 'Add Subtask',
    roomingTitle: 'Hotel Room Allocations - {kloter}',
    roomingSubtitle: 'Group pilgrims into hotel rooms at Makkah (Anjum Hotel) and Madinah (Grand Plaza).',
    addRoom: 'Add New Room',
    selectPilgrim: 'Select pilgrim',
    assign: 'Assign',
    emptyRoom: 'Empty Room'
  }
};

interface RoomAllocation {
  id: string;
  roomName: string;
  type: 'Quad' | 'Triple' | 'Double' | 'Suite';
  pilgrimIds: string[];
}

const OpsCenter: React.FC<OpsCenterProps> = ({ 
  tasks, 
  setTasks, 
  selectedKloter, 
  setSelectedKloter,
  setActiveView
}) => {
  const { isDarkMode, language, triggerToast, jamaahList, currentUser, packages = [] } = useApp();
  const t = OP_TRANSLATIONS[language];
  const currentEmail = currentUser?.email || '';

  const [activeTab, setActiveTab] = useState<TaskCategory>('Pre-Departure');
  const [selectedTask, setSelectedTask] = useState<OpsTask | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Modals controller
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeActionModal, setActiveActionModal] = useState<'ROOMING' | 'ITINERARY' | null>(null);

  // Form check fields
  const [modalTaskTitle, setModalTaskTitle] = useState('');
  const [modalTaskCategory, setModalTaskCategory] = useState<TaskCategory>('Pre-Departure');
  const [modalTaskPriority, setModalTaskPriority] = useState<TaskPriority>('Medium');
  const [modalTaskAssignee, setModalTaskAssignee] = useState('Abdullah');
  const [modalTaskDueDate, setModalTaskDueDate] = useState('');
  const [modalTaskDescription, setModalTaskDescription] = useState('');

  // Interactive Rooming state loaded from storage or configured default
  const [roomAllocations, setRoomAllocations] = useState<RoomAllocation[]>(() => {
    if (!currentEmail) return [];
    const saved = localStorage.getItem(`travelops_rooming_allocations_${currentEmail}`);
    if (saved) return JSON.parse(saved);
    return currentEmail === 'abdullah@alharamain.id' ? [
      { id: 'R101', roomName: 'Room 101 (Medina Plaza)', type: 'Quad', pilgrimIds: [] },
      { id: 'R102', roomName: 'Room 102 (Medina Plaza)', type: 'Quad', pilgrimIds: [] },
      { id: 'R201', roomName: 'Room 201 (Anjum Makkah)', type: 'Triple', pilgrimIds: [] },
      { id: 'R202', roomName: 'Room 202 (Anjum Makkah)', type: 'Double', pilgrimIds: [] }
    ] : [];
  });

  // Reload room allocations when email changes
  useEffect(() => {
    if (currentEmail) {
      const saved = localStorage.getItem(`travelops_rooming_allocations_${currentEmail}`);
      setRoomAllocations(saved ? JSON.parse(saved) : (currentEmail === 'abdullah@alharamain.id' ? [
        { id: 'R101', roomName: 'Room 101 (Medina Plaza)', type: 'Quad', pilgrimIds: [] },
        { id: 'R102', roomName: 'Room 102 (Medina Plaza)', type: 'Quad', pilgrimIds: [] },
        { id: 'R201', roomName: 'Room 201 (Anjum Makkah)', type: 'Triple', pilgrimIds: [] },
        { id: 'R202', roomName: 'Room 202 (Anjum Makkah)', type: 'Double', pilgrimIds: [] }
      ] : []));
    } else {
      setRoomAllocations([]);
    }
  }, [currentEmail]);

  // Sync rooms data to local storage
  useEffect(() => {
    if (currentEmail) {
      localStorage.setItem(`travelops_rooming_allocations_${currentEmail}`, JSON.stringify(roomAllocations));
    }
  }, [roomAllocations, currentEmail]);

  const calculateProgress = (category: TaskCategory) => {
    const subset = tasks.filter(t => t.category === category);
    if (subset.length === 0) return 0;
    const completed = subset.filter(t => t.completed).length;
    return Math.round((completed / subset.length) * 100);
  };

  const openCreateModal = () => {
    setModalTaskCategory(activeTab);
    setModalTaskDueDate(new Date().toISOString().split('T')[0]);
    setModalTaskTitle('');
    setModalTaskDescription('');
    setModalTaskPriority('Medium');
    setModalTaskAssignee('Abdullah');
    setIsCreateModalOpen(true);
  };

  // Create task trigger
  const handleModalCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTaskTitle.trim()) return;

    const newTask: OpsTask = {
      id: Date.now().toString(),
      title: modalTaskTitle,
      category: modalTaskCategory,
      dueDate: modalTaskDueDate,
      completed: false,
      assignee: modalTaskAssignee,
      priority: modalTaskPriority,
      description: modalTaskDescription,
      subtasks: [],
      kloter: selectedKloter
    };

    setTasks(prev => [...prev, newTask]);
    setIsCreateModalOpen(false);
    triggerToast(language === 'id' ? 'Tugas checklist operasional ditambahkan!' : 'Checklist task added successfully!', 'success');
  };

  // Toggle tasks completetion
  const toggleTaskCompleted = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.completed;
        // Auto mark details
        return { 
          ...t, 
          completed: nextState,
          subtasks: t.subtasks.map(st => ({ ...st, completed: nextState }))
        };
      }
      return t;
    }));
  };

  // Toggle subtasks completion
  const toggleSubtaskCompleted = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSub = t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st);
        const allCompleted = updatedSub.every(st => st.completed);
        return {
          ...t,
          subtasks: updatedSub,
          completed: allCompleted
        };
      }
      return t;
    }));
  };

  // Add subtask
  const addSubtask = (taskId: string) => {
    if (!newSubtaskTitle.trim()) return;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: [
            ...t.subtasks,
            { id: Date.now().toString(), title: newSubtaskTitle, completed: false }
          ]
        };
      }
      return t;
    }));
    setNewSubtaskTitle('');
  };

  // Delete subtask
  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: t.subtasks.filter(st => st.id !== subtaskId)
        };
      }
      return t;
    }));
  };

  // Sorted and filtered task list
  const filteredTasks = tasks.filter(t => t.category === activeTab && (!t.kloter || t.kloter === selectedKloter));
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const pOrder: { [key in TaskPriority]: number } = { High: 3, Medium: 2, Low: 1 };
      return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  // Export Manifest Action Trigger
  const runExportFlightManifest = () => {
    const flightPilgrims = jamaahList.filter(j => 
      j.kloter === selectedKloter && 
      (selectedPackage === 'All' || j.package === selectedPackage)
    );
    let csvHeader = "ID,Pilgrim Name,Group,Umrah Package,Status,Date of departure\n";
    flightPilgrims.forEach(p => {
      csvHeader += `${p.id},"${p.name}","${p.kloter}","${p.package}","${p.status}","${p.departureDate}"\n`;
    });

    const blob = new Blob([csvHeader], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const safePkgLabel = selectedPackage.replace(/\s+/g, '_');
    link.download = `Manifest_Flight_${selectedKloter.replace(/\s+/g, '_')}_${safePkgLabel}.csv`;
    link.click();
    triggerToast(
      language === 'id' 
        ? `Manifest Penerbangan untuk ${selectedKloter} (${selectedPackage === 'All' ? 'Semua Paket' : selectedPackage}) berhasil diekspor!`
        : `Flight Manifest for ${selectedKloter} (${selectedPackage}) exported successfully!`, 
      'success'
    );
  };

  // Room Assignment logic
  const assignPilgrimToRoom = (roomId: string, pilgrimId: string) => {
    if (!pilgrimId) return;

    // Check if pilgrim is already allocated anywhere
    const isAllocated = roomAllocations.some(r => r.pilgrimIds.includes(pilgrimId));
    if (isAllocated) {
      triggerToast(language === 'id' ? 'Jemaah ini sudah terdaftar di kamar lain!' : 'This pilgrim is already assigned to a room!', 'error');
      return;
    }

    setRoomAllocations(prev => prev.map(r => {
      if (r.id === roomId) {
        // Enforce maximum capacity
        const capacityMap = { Quad: 4, Triple: 3, Double: 2, Suite: 8 };
        const max = capacityMap[r.type] || 4;
        if (r.pilgrimIds.length >= max) {
          triggerToast(language === 'id' ? `Kamar penuh! Maksimal ${max} jemaah.` : `Room full! Maximum is ${max} occupants.`, 'error');
          return r;
        }
        return {
          ...r,
          pilgrimIds: [...r.pilgrimIds, pilgrimId]
        };
      }
      return r;
    }));
  };

  // Remove Pilgrim from Room
  const removePilgrimFromRoom = (roomId: string, pilgrimId: string) => {
    setRoomAllocations(prev => prev.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          pilgrimIds: r.pilgrimIds.filter(id => id !== pilgrimId)
        };
      }
      return r;
    }));
  };

  // Add Room creator
  const addNewCustomRoom = () => {
    const nextRoomId = `R${Date.now().toString().substring(10)}`;
    const newRoom: RoomAllocation = {
      id: nextRoomId,
      roomName: `Kamar ${roomAllocations.length + 101} Custom`,
      type: 'Quad',
      pilgrimIds: []
    };
    setRoomAllocations([...roomAllocations, newRoom]);
    triggerToast(language === 'id' ? 'Kamar baru ditambahkan!' : 'New room added!', 'info');
  };

  // Delete Room
  const deleteCustomRoom = (roomId: string) => {
    setRoomAllocations(prev => prev.filter(r => r.id !== roomId));
    triggerToast(language === 'id' ? 'Kamar berhasil dihapus!' : 'Room deleted successfully!', 'info');
  };

  return (
    <div className="space-y-4">
      {/* Top action block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-md border border-slate-200 dark:border-slate-800 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] shrink-0">
        <div className="text-left">
          <h2 className="text-sm font-bold text-green-900 dark:text-emerald-400 uppercase tracking-wider">{t.checklistTitle}</h2>
          <p className="text-gray-400 text-[11px]">{t.checklistSubtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={openCreateModal}
            className="bg-green-800 hover:bg-green-950 text-white px-3 py-1.5 rounded-xl hover:scale-[1.01] transition-all flex items-center text-xs font-semibold whitespace-nowrap shadow-sm cursor-pointer"
          >
            <Icon name="add" className="h-3.5 w-3.5 mr-1 text-emerald-300" />
            {t.createTask}
          </button>
          
          <div className="flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 px-2 py-1">
            <Icon name="users" className="h-3.5 w-3.5 text-gray-500 mr-1.5" />
            <select 
              value={selectedKloter} 
              onChange={(e) => setSelectedKloter(e.target.value)}
              className="bg-transparent border-none text-slate-800 dark:text-slate-200 font-bold text-xs outline-none cursor-pointer p-0 focus:ring-0"
            >
              <option value="Kloter A" className="bg-slate-900 text-white">Kloter A - 15 Mar 2025</option>
              <option value="Kloter B" className="bg-slate-900 text-white">Kloter B - 20 Apr 2025</option>
              <option value="Kloter C" className="bg-slate-900 text-white">Kloter C - 10 Jun 2025</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 px-2 py-1">
            <Icon name="package" className="h-3.5 w-3.5 text-gray-500 mr-1.5" />
            <select 
              value={selectedPackage} 
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="bg-transparent border-none text-slate-800 dark:text-slate-200 font-bold text-xs outline-none cursor-pointer p-0 focus:ring-0"
            >
              <option value="All" className="bg-slate-900 text-white">
                {language === 'id' ? 'Semua Paket' : 'All Packages'}
              </option>
              {packages.map(p => (
                <option key={p.id} value={p.name} className="bg-slate-900 text-white">{p.name}</option>
              ))}
              {/* Fallback if list is unpopulated */}
              {!packages.some(p => p.name === 'Bronze') && (
                <>
                  <option value="VIP Premium" className="bg-slate-900 text-white">VIP Premium</option>
                  <option value="Gold Classic" className="bg-slate-900 text-white">Gold Classic</option>
                  <option value="Silver Saver" className="bg-slate-900 text-white">Silver Saver</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(['Pre-Departure', 'In-Saudi', 'Post-Return'] as TaskCategory[]).map(cat => {
          const progress = calculateProgress(cat);
          const isActive = activeTab === cat;
          return (
            <Card 
              key={cat} 
              className={`cursor-pointer transition-all hover:shadow-sm p-3.5 ${
                isActive 
                  ? 'ring-1 ring-emerald-500 bg-emerald-500/5 border-emerald-500/30' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 hover:border-slate-300'
              }`} 
            >
              <div onClick={() => setActiveTab(cat)} className="text-left">
                <div className="flex justify-between items-center mb-1.5">
                  <h3 className={`font-bold text-xs uppercase tracking-wider ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>{cat}</h3>
                  {isActive && <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>}
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-850 dark:text-slate-100 leading-tight">{progress}%</span>
                  <span className="text-[10px] text-slate-400">{t.statsCompleted}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1 mt-2.5">
                  <div className="bg-emerald-500 h-1 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Checklist Tasks List */}
      <Card className="p-4 bg-white dark:bg-slate-900/35 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="text-left">
            <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400">{t.allTasks} ({filteredTasks.length})</h4>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-gray-500 font-bold">{t.sortTitle}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'priority')}
              className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 outline-none text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="date" className="bg-slate-900 text-white">{t.date}</option>
              <option value="priority" className="bg-slate-900 text-white">{t.priority}</option>
            </select>
          </div>
        </div>

        {/* Dense Tasks List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sortedTasks.map(task => (
            <div 
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className={`p-3 border rounded-xl hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between text-left ${
                task.completed 
                  ? 'border-emerald-500/20 bg-emerald-500/[0.01]' 
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                    task.priority === 'High' 
                      ? 'bg-rose-500/15 text-rose-500' 
                      : task.priority === 'Medium' 
                        ? 'bg-amber-500/15 text-amber-500' 
                        : 'bg-slate-500/15 text-slate-500'
                  }`}>
                    {task.priority}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">{task.dueDate}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskCompleted(task.id);
                    }}
                    className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
                      task.completed 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-slate-350 dark:border-slate-700 hover:border-emerald-500 bg-white dark:bg-transparent'
                    }`}
                  >
                    {task.completed && <Icon name="check" className="h-3 w-3 text-white" />}
                  </button>
                  <div>
                    <h5 className={`text-xs font-bold ${task.completed ? 'line-through text-slate-400 dark:text-slate-550' : 'text-slate-800 dark:text-slate-100'}`}>
                      {task.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{task.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t dark:border-slate-800/60 pt-2 mt-3">
                <span className="text-[10px] text-slate-400 font-bold">PJ: {task.assignee}</span>
                <span className="text-[10px] text-emerald-500 font-extrabold font-mono">
                  {task.subtasks.length > 0 && `${task.subtasks.filter(st => st.completed).length}/${task.subtasks.length} Sub`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Task detail Drawer or Subtask checker */}
      {selectedTask && (() => {
        const activeTask = tasks.find(t => t.id === selectedTask.id) || selectedTask;
        return (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex justify-end">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full p-6 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto animate-slide-in-right text-left">
              <div>
                <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-slate-800">
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full">{activeTask.category}</span>
                  <button 
                    onClick={() => setSelectedTask(null)}
                    className="text-slate-400 hover:text-slate-500 cursor-pointer"
                  >
                    <Icon name="close" className="h-5 w-5" />
                  </button>
                </div>

                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mb-2 leading-snug">{activeTask.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed mb-4">{activeTask.description}</p>

                {/* Subtasks checklist */}
                <div className="space-y-2 mb-6">
                  <h4 className="font-bold text-[11px] text-slate-400 uppercase tracking-widest">{t.subtasks}</h4>
                  
                  {/* Add Subtask panel */}
                  <div className="flex items-center space-x-1 mb-2">
                    <input 
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addSubtask(activeTask.id)}
                      placeholder={t.subtaskText}
                      className="flex-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 h-8 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-800 dark:text-white"
                    />
                    <button 
                      onClick={() => addSubtask(activeTask.id)}
                      className="bg-emerald-600 text-white p-1 rounded-lg hover:bg-emerald-700 h-8 w-8 flex items-center justify-center cursor-pointer"
                    >
                      <Icon name="add" className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {(activeTask.subtasks || []).map(st => (
                      <div key={st.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border dark:border-slate-850">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleSubtaskCompleted(activeTask.id, st.id)}
                            className={`h-4 w-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
                              st.completed 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'border-slate-300 dark:border-slate-800 bg-white'
                            }`}
                          >
                            {st.completed && <Icon name="check" className="h-2.5 w-2.5 text-white" />}
                          </button>
                          <span className={`text-xs ${st.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {st.title}
                          </span>
                        </div>
                        <button 
                          onClick={() => deleteSubtask(activeTask.id, st.id)}
                          className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                        >
                          <Icon name="close" className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t dark:border-slate-800 pt-4 mt-6">
                <button 
                  onClick={() => {
                    toggleTaskCompleted(activeTask.id);
                    setSelectedTask(null);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {activeTask.completed ? 'Mark Awaiting Check' : 'Mark Task Accomplished'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Check/Create Task Main Modal popups */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col border dark:border-slate-800 text-left animate-scale-up">
            <div className="flex justify-between items-center p-3 border-b dark:border-slate-800">
              <h3 className="font-bold text-xs uppercase tracking-wide text-emerald-500">{t.createTask}</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-slate-600 cursor-pointer">
                <Icon name="close" className="h-5 w-5"/>
              </button>
            </div>
            
            <form onSubmit={handleModalCreateTask} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">{t.taskTitle}</label>
                <input 
                  type="text" 
                  required
                  placeholder="Booking transport, katering, dll" 
                  className="w-full border dark:border-slate-800 bg-slate-100 dark:bg-slate-950 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-800 dark:text-white"
                  value={modalTaskTitle}
                  onChange={(e) => setModalTaskTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">{t.category}</label>
                  <select 
                    value={modalTaskCategory}
                    onChange={(e) => setModalTaskCategory(e.target.value as TaskCategory)}
                    className="w-full border dark:border-slate-800 bg-slate-100 dark:bg-slate-950 rounded-lg px-2 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="Pre-Departure">Pre-Departure</option>
                    <option value="In-Saudi">In-Saudi</option>
                    <option value="Post-Return">Post-Return</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">{t.priority}</label>
                  <select 
                    value={modalTaskPriority}
                    onChange={(e) => setModalTaskPriority(e.target.value as TaskPriority)}
                    className="w-full border dark:border-slate-800 bg-slate-100 dark:bg-slate-950 rounded-lg px-2 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">{t.assignee}</label>
                  <select 
                    value={modalTaskAssignee}
                    onChange={(e) => setModalTaskAssignee(e.target.value)}
                    className="w-full border dark:border-slate-800 bg-slate-100 dark:bg-slate-950 rounded-lg px-2 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-800 dark:text-white cursor-pointer"
                  >
                    {TEAM_MEMBERS.map(member => (
                      <option key={member} value={member}>{member}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">{t.dueDate}</label>
                  <input 
                    type="date"
                    required
                    className="w-full border dark:border-slate-800 bg-slate-100 dark:bg-slate-950 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-800 dark:text-white"
                    value={modalTaskDueDate}
                    onChange={(e) => setModalTaskDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">{t.description}</label>
                <textarea
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 rounded-lg border dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[70px] resize-y"
                  value={modalTaskDescription}
                  onChange={(e) => setModalTaskDescription(e.target.value)}
                />
              </div>

              <div className="pt-2 border-t dark:border-slate-800 flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
                >
                  {t.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Actions Panel & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
          <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-400 dark:text-slate-400 mb-4 flex items-center">
            <Icon name="document" className="h-5 w-5 text-emerald-500 mr-2" /> 
            {t.quickActions}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {/* 1. ROOM ALLOCATIONS */}
            <button 
              onClick={() => setActiveActionModal('ROOMING')}
              className="p-4 border border-emerald-100/50 dark:border-slate-800 rounded-xl bg-gradient-to-br from-emerald-50/20 to-teal-50/[0.05] dark:from-slate-950 dark:to-slate-950 hover:from-emerald-500/10 hover:to-teal-500/10 transition-colors text-center group cursor-pointer"
            >
              <Icon name="users" className="h-6 w-6 mx-auto text-emerald-500 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform"/>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">{t.roomingList}</span>
            </button>

            {/* 2. MANIFEST ACTION */}
            <button 
              onClick={runExportFlightManifest}
              className="p-4 border border-emerald-100/50 dark:border-slate-800 rounded-xl bg-gradient-to-br from-emerald-50/20 to-teal-50/[0.05] dark:from-slate-950 dark:to-slate-950 hover:from-emerald-500/10 hover:to-teal-500/10 transition-colors text-center group cursor-pointer"
            >
              <Icon name="download" className="h-6 w-6 mx-auto text-emerald-500 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform"/>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">{t.manifestPdf}</span>
            </button>

            {/* 3. VISA STATUS CORNER (Redirection) */}
            <button 
              onClick={() => {
                if (setActiveView) {
                  setActiveView('Visa & Dokumen');
                  triggerToast(language === 'id' ? 'Membuka Pusat Visa & Dokumen...' : 'Navigating to Visa & Documents Hub...', 'success');
                } else {
                  triggerToast('Visa & Documents page available in direct sidebar.', 'info');
                }
              }}
              className="p-4 border border-emerald-100/50 dark:border-slate-800 rounded-xl bg-gradient-to-br from-emerald-50/20 to-teal-50/[0.05] dark:from-slate-950 dark:to-slate-950 hover:from-emerald-500/10 hover:to-teal-500/10 transition-colors text-center group cursor-pointer"
            >
              <Icon name="visa" className="h-6 w-6 mx-auto text-emerald-500 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform"/>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">{t.visaStatus}</span>
            </button>

            {/* 4. ITINERARY SCHEDULE */}
            <button 
              onClick={() => setActiveActionModal('ITINERARY')}
              className="p-4 border border-emerald-100/50 dark:border-slate-800 rounded-xl bg-gradient-to-br from-emerald-50/20 to-teal-50/[0.05] dark:from-slate-950 dark:to-slate-950 hover:from-emerald-500/10 hover:to-teal-500/10 transition-colors text-center group cursor-pointer"
            >
              <Icon name="package" className="h-6 w-6 mx-auto text-emerald-500 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform"/>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">{t.itinerary}</span>
            </button>
          </div>
        </Card>

        {/* Activity Feed */}
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
          <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-400 dark:text-slate-400 mb-4 flex items-center">
            <Icon name="alert" className="h-5 w-5 text-amber-500 mr-2" /> 
            {t.recentActivity}
          </h4>
          <ul className="space-y-4">
            <li className="flex gap-3 items-start text-left">
              <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 shrink-0"></div>
              <div>
                <p className="text-xs text-slate-700 dark:text-slate-300"><span className="font-bold">Abdullah</span> {t.activityMarked} <span className="italic">"Submit Visa Applications"</span> {t.activityDone}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">2 hours ago</p>
              </div>
            </li>
            <li className="flex gap-3 items-start text-left">
              <div className="h-2 w-2 mt-2 rounded-full bg-emerald-500 shrink-0"></div>
              <div>
                <p className="text-xs text-slate-700 dark:text-slate-300"><span className="font-bold">{t.activitySystem}</span> {t.activityAhmad}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">5 hours ago</p>
              </div>
            </li>
            <li className="flex gap-3 items-start text-left">
              <div className="h-2 w-2 mt-2 rounded-full bg-amber-500 shrink-0"></div>
              <div>
                <p className="text-xs text-slate-700 dark:text-slate-300"><span className="font-bold">Siti</span> added new task <span className="italic">"Check Batik Inventory"</span>.</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Yesterday</p>
              </div>
            </li>
          </ul>
        </Card>
      </div>

      {/* --- ROOM ALLOCATIONS INTERACTIVE MODAL --- */}
      {activeActionModal === 'ROOMING' && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col border dark:border-slate-800 text-left animate-scale-up overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 shrink-0">
              <div className="text-left">
                <h3 className="font-black text-sm text-green-900 dark:text-emerald-400 uppercase tracking-widest">
                  {t.roomingTitle.replace('{kloter}', selectedKloter)}
                </h3>
                <p className="text-[11px] text-slate-400">{t.roomingSubtitle}</p>
              </div>
              <button onClick={() => setActiveActionModal(null)} className="text-gray-400 hover:text-slate-600 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer">
                <Icon name="close" className="h-5 w-5"/>
              </button>
            </div>

            {/* Room Distribution Panels */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {roomAllocations.map(room => {
                const capacityMap = { Quad: 4, Triple: 3, Double: 2, Suite: 8 };
                const max = capacityMap[room.type] || 4;
                const availablePilgrims = jamaahList.filter(j => 
                  j.kloter === selectedKloter && 
                  (selectedPackage === 'All' || j.package === selectedPackage) && 
                  !roomAllocations.some(ra => ra.pilgrimIds.includes(j.id))
                );

                return (
                  <div key={room.id} className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">{room.roomName}</h4>
                          <span className="text-[10px] text-emerald-500 font-extrabold uppercase">{room.type} ({room.pilgrimIds.length}/{max})</span>
                        </div>
                        <div className="flex items-center space-x-1.5 shrink-0 animate-fade-in">
                          {/* Selector indicator to append occupants */}
                          {room.pilgrimIds.length < max && (
                            <select
                              onChange={(e) => {
                                assignPilgrimToRoom(room.id, e.target.value);
                                e.target.value = '';
                              }}
                              className="bg-white dark:bg-slate-950 border dark:border-slate-800 rounded-lg text-[10px] max-w-[130px] p-1 font-bold outline-none cursor-pointer focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                            >
                              <option value="">+ {t.assign.split(' ')[0]}</option>
                              {availablePilgrims.map(jam => (
                                <option key={jam.id} value={jam.id}>{jam.name}</option>
                              ))}
                            </select>
                          )}
                          <button
                            onClick={() => deleteCustomRoom(room.id)}
                            title={language === 'id' ? 'Hapus Kamar' : 'Delete Room'}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 p-1 rounded-lg border border-transparent hover:border-red-200 dark:hover:border-red-900 transition-colors cursor-pointer"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Occupant rows */}
                      <div className="space-y-1 mt-2">
                        {room.pilgrimIds.length === 0 ? (
                          <div className="text-center py-4 border border-dashed dark:border-slate-800 rounded-lg text-slate-400 dark:text-slate-500 text-[10px] font-medium font-mono uppercase bg-white/40 dark:bg-transparent">
                            {t.emptyRoom}
                          </div>
                        ) : (
                          room.pilgrimIds.map(pid => {
                            const pilgrimRecord = jamaahList.find(j => j.id === pid);
                            if (!pilgrimRecord) return null;
                            return (
                              <div key={pid} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border dark:border-slate-800 hover:shadow-xs transition-all">
                                <div className="flex items-center space-x-2">
                                  <img 
                                    src={pilgrimRecord.avatarUrl} 
                                    alt={pilgrimRecord.name} 
                                    className="h-6 w-6 rounded-full"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{pilgrimRecord.name}</span>
                                </div>
                                <button 
                                  onClick={() => removePilgrimFromRoom(room.id, pid)}
                                  className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                                >
                                  <Icon name="close" className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Bottom toolbar */}
            <div className="p-3 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 shrink-0 flex justify-between items-center">
              <button
                onClick={addNewCustomRoom}
                className="bg-emerald-600 hover:bg-emerald-705 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                + {t.addRoom}
              </button>
              <button
                onClick={() => setActiveActionModal(null)}
                className="bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-250 font-bold px-4 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ITINERARY SCHEDULE PRESENTATION --- */}
      {activeActionModal === 'ITINERARY' && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl h-[75vh] flex flex-col border dark:border-slate-800 text-left animate-scale-up overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 shrink-0">
              <div className="text-left">
                <h3 className="font-extrabold text-sm text-green-900 dark:text-emerald-400 uppercase tracking-widest">{t.itineraryTitle.replace('{kloter}', selectedKloter)}</h3>
                <p className="text-[11px] text-slate-400">{t.viewItinerary}</p>
              </div>
              <button onClick={() => setActiveActionModal(null)} className="text-gray-400 hover:text-slate-600 p-1 hover:bg-gray-100 rounded-full cursor-pointer">
                <Icon name="close" className="h-5 w-5"/>
              </button>
            </div>

            {/* Itinerary timeline scroll elements */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="relative border-l-2 border-emerald-500/20 dark:border-slate-800 ml-3 space-y-4">
                {/* Day 1 */}
                <div className="relative pl-6">
                  <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-emerald-500 shadow-sm" />
                  <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">HARI 1 - Keberangkatan</span>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-0.5">Penerbangan CGK - JED / MED</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Berkumpul di Terminal 3 Soekarno-Hatta 4 jam sebelum takeoff. Pembagian boarding pass, paspor asli, dan handling bagasi.</p>
                </div>

                {/* Day 2-5 */}
                <div className="relative pl-6">
                  <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-emerald-500 shadow-sm" />
                  <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">HARI 2 - 5 - Madinah Al-Munawwarah</span>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-0.5">Ibadah Arbain & Ziarah Raudhah</h4>
                  <p className="text-[11px] text-slate-450 mt-1">Check-in Hotel Grand Plaza Madinah (atau setaraf). Ibadah Arbain wajib, ziarah ke makam Rasulullah SAW, pemakaman Baqi, Masjid Quba, kebun kurma, dan Jabal Uhud.</p>
                </div>

                {/* Day 6-10 */}
                <div className="relative pl-6">
                  <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-emerald-500 shadow-sm" />
                  <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">HARI 6 - 10 - Makkah Al-Mukarramah</span>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-0.5">Pelaksanaan Umrah Wajib & Miqat</h4>
                  <p className="text-[11px] text-slate-450 mt-1">Pengambilan Miqat di Bir Ali, dilanjutkan perjalanan via Bus AC eksekutif ke Makkah. Check-in Hotel Anjum Makkah, tawaf, sai, tahallul dipimpin Mutawwif. Ziarah Jabal Nur, Padang Arafah, Muzdalifah, dan Mina.</p>
                </div>

                {/* Day 11-12 */}
                <div className="relative pl-6">
                  <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-slate-400 shadow-sm" />
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">HARI 11 - 12 - Kepulangan</span>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-0.5">Tawaf Wada & Kembali ke Tanah Air</h4>
                  <p className="text-[11px] text-slate-450 mt-1">Tawaf Wada di Masjidil Haram, dilanjutkan perjalanan darat ke Jeddah International Airport. Penerbangan JED - CGK membawa Zamzam.</p>
                </div>
              </div>
            </div>

            {/* Bottom toolbar */}
            <div className="p-3 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 shrink-0 text-right">
              <button
                onClick={() => setActiveActionModal(null)}
                className="bg-emerald-600 hover:bg-emerald-705 text-white font-bold px-4 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close Itinerary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpsCenter;
