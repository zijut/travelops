import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Globe, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ChevronRight, 
  AlertCircle, 
  DollarSign, 
  Users, 
  Sparkles, 
  Play, 
  Plus, 
  FileText, 
  ArrowRight,
  Shield,
  Briefcase,
  Check,
  Smartphone,
  Laptop,
  Pause,
  Volume2
} from 'lucide-react';

const Landing: React.FC = () => {
  const { isDarkMode, toggleDarkMode, language, setLanguage, currentUser } = useApp();
  const navigate = useNavigate();
  
  // Navbar states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Custom states for Interactive Simulator Demo
  const [demoTab, setDemoTab] = useState<'dashboard' | 'bus' | 'visa' | 'finance'>('bus');
  const [visaProgress, setVisaProgress] = useState(78);
  const [activePromoToast, setActivePromoToast] = useState<string | null>(null);
  const [priceBilling, setPriceBilling] = useState<'monthly' | 'yearly'>('yearly');
  
  // Mock live database state for Bus Simulator
  const [busSeats, setBusSeats] = useState<string[]>([
    'Haj. Ridwan', 'Haj. Maryam', 'Empty', 'H. Ahmad', 'Empty', 'Siti Aminah', 
    'Empty', 'Empty', 'Ustadz Yusuf', 'Hj. Fatimah', 'Empty', 'Empty'
  ]);
  const [unseatedPilgrims, setUnseatedPilgrims] = useState<string[]>([
    'Ahmad Subagja', 'Hj. Kartini', 'Moch. Rafly', 'Mutawwif Syakir'
  ]);
  const [selectedUnseated, setSelectedUnseated] = useState<number | null>(null);

  // Mock ledger live transactions
  const [ledgerLogs, setLedgerLogs] = useState([
    { id: 1, type: 'INCOME', amount: 45000000, desc: 'Ahmad Subagja - Pelunasan Akbar' },
    { id: 2, type: 'EXPENSE', amount: 15400000, desc: 'Pembayaran Hotel Anjum Makkah (Kloter A)' },
    { id: 3, type: 'INCOME', amount: 35000000, desc: 'Hj. Kartini - Setoran Awal Umrah VIP' }
  ]);

  // Legal Modals state
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | 'cookies' | null>(null);

  // For interactive walkthrough video demo player below simulator
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [videoWalkthroughMode, setVideoWalkthroughMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    let interval: any;
    if (isVideoPlaying) {
      interval = setInterval(() => {
        setVideoTime((prev) => {
          const maxSecs = videoWalkthroughMode === 'desktop' ? 225 : 135;
          return prev >= maxSecs ? 0 : prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVideoPlaying, videoWalkthroughMode]);

  const formatVideoTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Show a mini toast for dynamic user actions in demo
  const triggerDemoToast = (msg: string) => {
    setActivePromoToast(msg);
    setTimeout(() => setActivePromoToast(null), 3000);
  };

  // Assign pilgrim to a specific seat
  const handleSeatAllocation = (seatIdx: number) => {
    if (selectedUnseated === null) {
      triggerDemoToast(language === 'id' ? 'Silakan pilih nama jemaah terlebih dahulu!' : 'Please select a pilgrim from the desk first!');
      return;
    }
    const pilgrimName = unseatedPilgrims[selectedUnseated];
    const newSeats = [...busSeats];
    
    if (newSeats[seatIdx] !== 'Empty') {
      const replaced = newSeats[seatIdx];
      newSeats[seatIdx] = pilgrimName;
      const newUnseated = [...unseatedPilgrims];
      newUnseated[selectedUnseated] = replaced;
      setUnseatedPilgrims(newUnseated);
    } else {
      newSeats[seatIdx] = pilgrimName;
      setUnseatedPilgrims(unseatedPilgrims.filter((_, idx) => idx !== selectedUnseated));
    }
    
    setBusSeats(newSeats);
    setSelectedUnseated(null);
    triggerDemoToast(language === 'id' ? `${pilgrimName} berhasil didudukkan di Kursi #${seatIdx + 1}!` : `${pilgrimName} mapped to Seat #${seatIdx + 1}!`);
  };

  // Add mock cashflow entry
  const handleAddDemoTx = () => {
    const freshTx = {
      id: Date.now(),
      type: Math.random() > 0.45 ? 'INCOME' : 'EXPENSE',
      amount: Math.floor(Math.random() * 20 + 5) * 1000000,
      desc: language === 'id' ? 'Biaya Sewa Bus Saptco Madinah' : 'Saptco Madinah Transfer Fee Logged'
    };
    setLedgerLogs([freshTx, ...ledgerLogs]);
    triggerDemoToast(language === 'id' ? `Transaksi baru Rp ${freshTx.amount.toLocaleString()} berhasil masuk!` : `Logged transaction Rp ${freshTx.amount.toLocaleString()}`);
  };

  // Scroll to section helpers
  const handleScrollToSec = (elemId: string) => {
    const el = document.getElementById(elemId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  const t = {
    id: {
      navProblems: 'Masalah',
      navSolutions: 'Solusi',
      navDemo: 'Live Demo',
      navTestimonials: 'Testimoni',
      navPricing: 'Pilihan Harga',
      portalAccess: 'Portal Partner',
      workspaceTitle: 'TravelOps OS',
      tagline: 'Sistem Operasi Digital Terpadu Agen Umrah & Haji',
      heroTitleGrad: 'Optimalkan Operasional Haji & Umroh',
      heroTitleRest: 'Bebas dari Kerumitan File WhatsApp & Spreadsheet',
      heroSubtitle: 'Platform digital terintegrasi untuk mengelola manifes jemaah, simulator penataan kursi bus, pelacakan proses visa muqeem saudi, pembukuan kas per kloter, hingga checklist pergerakan lapangan mutawwif secara instan.',
      ctaRegister: 'Registrasi Akun Baru',
      ctaLogin: 'Masuk Portal',
      ctaDashboard: 'Buka Dashboard Saya',
      telemetryTitle: 'INFO TERKINI',
      telemetryItems: [
        'SYSTEM: Pemantau Paspor Kloter Ramadhan terhubung aman.',
        'KEUANGAN: Laba real-time kloter Syawal terdeteksi meningkat +18%.',
        'NOTIFIKASI: Visa KBSA atas jemaah Siti Barokah terbit instant.',
        'SIMULATOR: Pengamanan letak kursi Bus Kloter B tuntas.'
      ],
      problemsTitle: 'Mengapa 87% Agensi Mengalami Kebocoran Margin?',
      problemsSubtitle: 'Menggunakan spreadsheet terpisah menyebabkan hilangnya reputasi dan kebocoran dana operasional.',
      solutionsTitle: 'Satu Sistem Pintar Menata Seluruh Alur Operasional',
      solutionsSubtitle: 'Memandu agensi beralih ke digitalisasi steril secara instan, aman, dan bilingual.',
      demoTitle: 'Tampilan Interaktif TravelOps OS',
      demoSubtitle: 'Coba langsung fitur utama kami di bawah ini untuk melihat keandalan sistem sebelum mendaftar.',
      demoHelperText: '*Anda dapat mengeklik tombol, memilih nama jemaah, memplotting kursi bus, atau menambahkan kas keuangan di bawah ini.',
      testimonialTitle: 'Dipercaya Oleh Sektor Agensi Terkemuka',
      testimonialSubtitle: 'Bagaimana ratusan agensi penyelenggara ibadah di Indonesia berhasil memodernisasi layanan mereka.',
      pricingTitle: 'Investasi Efisiensi Tanpa Batas',
      pricingSubtitle: 'Pilih rentang paket berlangganan fleksibel yang sesuai dengan kebutuhan kuota kloter agensi Anda.',
      ctaBottomTitle: 'Siap Mengamankan Seluruh Pemberangkatan?',
      ctaBottomSubtitle: 'Tinggalkan cara-cara manual yang memakan waktu. Gabung bersama ekosistem travel modern terenkripsi sekarang.',
      footerTagline: 'Pemberdayaan digitalisasi travel secara presisi.',
      complianceTitle: 'Informasi Hukum & Privasi Partner',
      privacyBtn: 'Kebijakan Privasi',
      termsBtn: 'Syarat & Ketentuan',
      cookiesBtn: 'Kebijakan Keamanan',
      creatorText: 'Dibuat oleh',
      navRegistrasi: 'Registrasi Baru',
      demoBusTitle: 'Simulator Okupansi Kursi',
      demoBusInstructions: 'Atasi ricuh jemaah di Saudi. Plotting kursi bus pariwisata jemaah secara visual sebelum berangkat.',
      demoUnassignedList: 'Daftar Belum Duduk',
      demoAllSeated: 'Semua jemaah telah duduk!',
      demoAssignee: 'PLOT',
      demoBusCapacity: 'kursi terisi',
      demoVisaTitle: 'Pelacak Status Visa Muqeem',
      demoVisaApplicant: 'NAMA JEMAAH',
      demoVisaToast: 'Dokumen {name} berhasil diproses dan dikirim ke portal Saudi!',
      demoVisaApproveBtn: 'KIRIM PORTAL',
      demoFinanceTitle: 'Surgical Kas Ledger',
      demoFinanceAddBtn: 'Tambah Transaksi Kas',
      demoFinanceLatest: 'TRANSAKSI TERBARU GOLONGAN KLOTER',
      ctaActionRegister: 'Registrasikan Agensi Saya',
      privacyTitle: 'Kebijakan Privasi & Keamanan Data',
      termsTitle: 'Syarat & Ketentuan Lisensi Partner',
      cookiesTitle: 'Kebijakan Cookie & Sesi Keamanan',
      closeBtn: 'Saya Mengerti & Tutup',
      pricingYearly: 'Tahunan (Hemat 20%)',
      pricingPopularBadge: 'Paling Populer',
      pricingMonthly: 'per bulan',
      pricingCta: 'Daftar Sekarang',
      pricingChecklist: [
        'Database Jemaah Terpadu',
        'Visual Simulator Kursi Bus',
        'Pemantau Dokumen Muqeem',
        'Surgical Kas Ledger',
        'Asisten Chat Bot Operasional',
        'Multi-user Role & Akses',
        'Jaminan Bilingual SLA'
      ],
      plans: [
        {
          name: 'Starter Desk',
          desc: 'Cocok untuk agensi rintisan dengan kuota terbatas.',
          priceMonthly: 'Rp 450k',
          priceYearly: 'Rp 360k',
          recommended: false,
          features: [0, 1, 2]
        },
        {
          name: 'Ops Professional',
          desc: 'Sistem komplit untuk manajemen multi-kloter aktif.',
          priceMonthly: 'Rp 1.2M',
          priceYearly: 'Rp 960k',
          recommended: true,
          features: [0, 1, 2, 3, 4]
        },
        {
          name: 'Enterprise Hajj',
          desc: 'Kapasitas tanpa batas dengan dukungan Dedicated SLA.',
          priceMonthly: 'Rp 2.9M',
          priceYearly: 'Rp 2.3M',
          recommended: false,
          features: [0, 1, 2, 3, 4, 5, 6]
        }
      ],
      
      problemsList: [
        { title: 'Manifes Jemaah Berantakan', desc: 'WhatsApp jemaah tercecer antara admin, logistik perlengkapan, dan maktab, meningkatkan risiko visa tertinggal.' },
        { title: 'Simulator Duduk Bus Ghaib', desc: 'Membagikan posisi kursi bus pariwisata menggunakan memo kertas memicu kerusuhan jemaah yang ingin duduk berdekatan.' },
        { title: 'Status Visa Luput Dipantau', desc: 'Terlambat melacak status penerbitan visa Muqeem, masa berlaku paspor, dan vaksin meningitis berakibat fatal.' },
        { title: 'Kas Finansial Kloter Bocor', desc: 'Komisi mutawwif dan tagihan katering Makkah tercampur baur, membuat keuntungan per pemberangkatan sulit diaudit.' }
      ],
      solutionsList: [
        { title: 'Database Jemaah Terpadu', desc: 'Seluruh tim mengakses satu manifes induk yang sama. Bebas ekspor manifes maskapai penerbangan dengan sekali klik.' },
        { title: 'Visualisasi Seating Bus Riil', desc: 'Simulator interaktif drag-and-drop mandiri untuk plotting kursi secara presisi, mencegah tumpang tindih dan konflik jemaah.' },
        { title: 'Asisten Dokumen Otomatis', desc: 'Panel kendali pintar untuk melacak paspor, hasil verifikasi vaksin, hingga muassasah visa secara langsung.' },
        { title: 'Ledger Pembukuan Segmentis', desc: 'Pencatatan kas pengeluaran katering, akomodasi hotel saudi, dan setoran jamaah secara otomatis mendeteksi laba operasional.' }
      ],
      demoTabs: {
        bus: 'Plotting Seating Bus',
        visa: 'Pelacak Visa Saudi',
        finance: 'Surgical Kas Ledger'
      },
      testimonialsList: [
        { name: 'H. Ahmad Fauzi', role: 'Direktur Utama Al-Anshor Travel, Jakarta', val: '+240 Jemaah Terkelola Aman', text: 'Sebelum TravelOps, musim keberangkatan adalah mimpi buruk kertas kerja. Sekarang pendaftaran, seat bus, hingga manifes hotel semua terlacak 105% mulus.' },
        { name: 'Hj. Sofia Al-Munawwarah', role: 'Ops Lead Baiturrahman Mubarak', val: 'Audit Visa Selesai 95% Lebih Cepat', text: 'Sistem ini memangkas audit paspor berkas visa kami dari 4 hari menjadi hanya 15 menit saja. Benar-benar luar biasa!' },
        { name: 'Ustadz Ryan Syarifuddin', role: 'Founder Qafila Tour VIP', val: 'Kurangi Margin Bocor Hingga 18%', text: 'TravelOps memberi visibilitas mutlak pada pengeluaran SAR kami di Arab Saudi. Tidak ada lagi kebocoran margin tersembunyi pada hotel katering.' },
        { name: 'H. Muhammad Ridwan', role: 'Manager Ar-Raudhah Travel', val: 'Tingkat Kepuasan Jamaah 99%', text: 'Jamaah kami sangat menyukai fungsional kursi bus visual. Keberangkatan di bandara dan Saudi jauh lebih tertib karena posisi duduk sudah terencana sejak tanah air.' }
      ]
    },
    en: {
      navProblems: 'Problems',
      navSolutions: 'Solutions',
      navDemo: 'Live Preview',
      navTestimonials: 'Testimonials',
      navPricing: 'Pricing Plans',
      portalAccess: 'Partner Portal',
      workspaceTitle: 'TravelOps OS',
      tagline: 'ALL-IN-ONE DIGITAL OPERATING SYSTEM FOR HAJJ & UMRAH AGENCIES',
      heroTitleGrad: 'Streamline Hajj & Umrah Operations',
      heroTitleRest: 'Eradicate Chaotic WhatsApp Files & Messy Spreadsheets',
      heroSubtitle: 'A high-fidelity unified digital workspace to coordinate pilgrim manifests, visual bus seat simulation charts, Saudi muqeem visa tracking, group budgeting ledgers, and live field checklists seamlessly.',
      ctaRegister: 'Register New Account',
      ctaLogin: 'Access Portal',
      ctaDashboard: 'Go to My Dashboard',
      telemetryTitle: 'SYSTEM LIVE',
      telemetryItems: [
        'SYSTEM: Safe partition lock activated on pilgrim files.',
        'FINANCE: Ramadhan early bird sales profitability rose +18%.',
        'NOTIFICATIONS: Pilgrim Siti Barokah visa verified instantly.',
        'SIMULATOR: Seating allocation for Group B validated safely.'
      ],
      problemsTitle: 'Why Do 87% of Agencies Suffer Margin Leaks?',
      problemsSubtitle: 'Scattered files, manually edited books, and undocumented details bleed margin and compromise brand authority.',
      solutionsTitle: 'One Intelligent Platform Managing Every Sector',
      solutionsSubtitle: 'Drive your organization to error-free high performance with responsive bilingual frameworks.',
      demoTitle: 'TravelOps OS Real-time Interactive Simulator',
      demoSubtitle: 'Interact directly with our primary modules below to experience the layout precision of TravelOps OS.',
      demoHelperText: '*You can click on tabs, select names, assign unoccupied bus seats, or add cash transactions directly on this live preview widget.',
      testimonialTitle: 'Trusted by Prestigious Hajj & Umrah Brands',
      testimonialSubtitle: 'How pioneering travel companies revolutionized their operational accuracy and group speed.',
      pricingTitle: 'Optimized Investment Packages',
      pricingSubtitle: 'Choose the flexible subscription tier aligned perfectly with your active pilgrim volume.',
      ctaBottomTitle: 'Ready to Deploy Your Isolated Workspace?',
      ctaBottomSubtitle: 'Eliminate slow spreadsheet architectures today. Enter a professional realm with encrypted database operations.',
      footerTagline: 'Empowering pilgrimage operators with maximum fidelity.',
      complianceTitle: 'Legal Compliance Declarations',
      privacyBtn: 'Privacy Policy',
      termsBtn: 'Terms of Service',
      cookiesBtn: 'Cookie & Safety Charter',
      creatorText: 'Designed by',
      navRegistrasi: 'Register Now',
      demoBusTitle: 'Seating Occupancy Simulator',
      demoBusInstructions: 'Prevent transport seating disputes. Pre-assign and visualize tourist bus placements effortlessly.',
      demoUnassignedList: 'Waiting Assignment',
      demoAllSeated: 'Everyone successfully seated!',
      demoAssignee: 'ASSIGN',
      demoBusCapacity: 'seats filled',
      demoVisaTitle: 'Muqeem Saudi Visa Tracker',
      demoVisaApplicant: 'PILGRIM NAME',
      demoVisaToast: 'Documents for {name} successfully submitted and approved!',
      demoVisaApproveBtn: 'SUBMIT PORTAL',
      demoFinanceTitle: 'Surgical Audit Ledger',
      demoFinanceAddBtn: 'Add Cash Entry',
      demoFinanceLatest: 'RECENT GROUP TRANSACTIONS',
      ctaActionRegister: 'Register My Agency',
      privacyTitle: 'Privacy & Encryption Policy',
      termsTitle: 'Terms of Service & Licensing',
      cookiesTitle: 'Cookie Policy & Security Session',
      closeBtn: 'I Understand & Close',
      pricingYearly: 'Yearly (Save 20%)',
      pricingPopularBadge: 'Most Popular',
      pricingMonthly: 'per month',
      pricingCta: 'Sign Up Now',
      pricingChecklist: [
        'Unified Pilgrim Database',
        'Visual Bus Seating Simulator',
        'Saudi Muqeem Document Monitor',
        'Surgical Cashflow Ledger',
        'Operations Chat Room Bot',
        'Multi-user Role Permissions',
        'Bilingual SLA Guarantee'
      ],
      plans: [
        {
          name: 'Starter Desk',
          desc: 'Perfect for startup agencies with limited active groups.',
          priceMonthly: 'Rp 450k',
          priceYearly: 'Rp 360k',
          recommended: false,
          features: [0, 1, 2]
        },
        {
          name: 'Ops Professional',
          desc: 'Complete system for managing multiple active groups.',
          priceMonthly: 'Rp 1.2M',
          priceYearly: 'Rp 960k',
          recommended: true,
          features: [0, 1, 2, 3, 4]
        },
        {
          name: 'Enterprise Hajj',
          desc: 'Unlimited throughput capacity with Dedicated SLA support.',
          priceMonthly: 'Rp 2.9M',
          priceYearly: 'Rp 2.3M',
          recommended: false,
          features: [0, 1, 2, 3, 4, 5, 6]
        }
      ],
      
      problemsList: [
        { title: 'Chaotic Spreadsheet Clutter', desc: 'WhatsApp data gets lost between admins, logistic loaders, and mutawwifs, creating severe risks of passport omission.' },
        { title: '"Blind" Bus Seat Allocations', desc: 'Dividing Saudi tourism transport seats from memory or small notebook scribbles triggers major group friction and boarding stress.' },
        { title: 'Uncontrolled Muqeem Visa Filing', desc: 'Missing deadlines for portal Muqeem, passport validation warnings, and Meningitis certificates results in sudden flight blocks.' },
        { title: 'Tangled Ledger Allocations', desc: 'Unchecked Saudi SAR and IDR hotel block payments and airline deposits lead to untraceable book leaks per departure kloter.' }
      ],
      solutionsList: [
        { title: 'Single Unified Database', desc: 'Complete branches pool data in one secure database pipeline. Export compliant flight sheets with single-click command.' },
        { title: 'Tactile Visual Seating Charts', desc: 'Responsive simulator to slot families together, identify bus payload capacity, and ensure complete boarding ease.' },
        { title: 'Intelligent Document Pipeline', desc: 'Real-time indicators that showcase passport validity, meningitis vaccination clearances, and Muqeem approvals.' },
        { title: 'Automated Segment Ledger', desc: 'Instant group accounting calculating accommodation block downs, mutawwif cash, and ticketing balances effortlessly.' }
      ],
      demoTabs: {
        bus: 'Bus seating Plotter',
        visa: 'Saudi Muqeem Monitor',
        finance: 'Cashflow Ledger Desk'
      },
      testimonialsList: [
        { name: 'H. Ahmad Fauzi', role: 'President Al-Anshor Travel, Jakarta', val: '+240 Pilgrims Headcount Safe', text: 'Before TravelOps, high-season was absolute WhatsApp panic. Today, seating layouts, manifests, and hotel bills match 100% perfectly.' },
        { name: 'Hj. Sofia Al-Munawwarah', role: 'Operations Lead, Baiturrahman Mubarak', val: 'Visa Audit Speed Increased by 95%', text: 'This system minimized our document cycle times from 4 grueling days to only 15 minutes. High-speed precision!' },
        { name: 'Ustadz Ryan Syarifuddin', role: 'Founder Qafila Tour VIP', val: '18% Budget Loss Mitigated', text: 'TravelOps provides stellar visual feedback over our Saudi hotel commitments. No more undetected expenditure leaks on ground providers.' },
        { name: 'H. Muhammad Ridwan', role: 'Group Flight Manager, Ar-Raudhah', val: '99% Pilgrim Satisfaction Score', text: 'Our field teams love the visual boarding planners. Pilgrims know their exact seats before leaving the hotel, making operations highly professional.' }
      ]
    }
  };

  const curr = language === 'en' ? t.en : t.id;

  return (
    <div className={`min-h-screen w-full relative transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Dynamic Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
        <div className="absolute top-[8%] left-[6%] w-[380px] h-[380px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-[45%] right-[5%] w-[420px] h-[420px] bg-emerald-600/10 dark:bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      {/* FIXED NAVBAR */}
      <nav id="navbar_main" className="sticky top-0 z-50 backdrop-blur-md bg-white/95 dark:bg-slate-950/95 border-b border-slate-200/60 dark:border-slate-800/60 transition-all">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-sm shadow-md shadow-emerald-500/10">
              🕋
            </div>
            <div>
              <span className="font-extrabold text-xs sm:text-sm tracking-wider text-slate-800 dark:text-white uppercase">
                {curr.workspaceTitle}
              </span>
              <span className="ml-1.5 px-1 py-0.2 text-[7.5px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded border border-emerald-500/20">
                PRO v2.1
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-6">
            <button onClick={() => handleScrollToSec('section_problems')} className="text-xs font-bold text-slate-600 hover:text-emerald-600 dark:text-slate-350 dark:hover:text-emerald-400 transition-colors uppercase tracking-wider cursor-pointer">
              {curr.navProblems} & {curr.navSolutions}
            </button>
            <button onClick={() => handleScrollToSec('section_demo')} className="text-xs font-bold text-slate-600 hover:text-emerald-600 dark:text-slate-350 dark:hover:text-emerald-400 transition-colors uppercase tracking-wider cursor-pointer">
              {curr.navDemo}
            </button>
            <button onClick={() => handleScrollToSec('section_testimonials')} className="text-xs font-bold text-slate-600 hover:text-emerald-600 dark:text-slate-350 dark:hover:text-emerald-400 transition-colors uppercase tracking-wider cursor-pointer">
              {curr.navTestimonials}
            </button>
            <button onClick={() => handleScrollToSec('section_pricing')} className="text-xs font-bold text-slate-600 hover:text-emerald-600 dark:text-slate-350 dark:hover:text-emerald-400 transition-colors uppercase tracking-wider cursor-pointer">
              {curr.navPricing}
            </button>
          </div>

          {/* Utilities right */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {/* Bilingual Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 rounded-lg p-0.5 shadow-inner">
              <button
                onClick={() => setLanguage('id')}
                className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded text-[9.5px] sm:text-[10px] font-extrabold tracking-wider transition-all cursor-pointer ${
                  language === 'id' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                ID
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded text-[9.5px] sm:text-[10px] font-extrabold tracking-wider transition-all cursor-pointer ${
                  language === 'en' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                EN
              </button>
            </div>

            {/* Dark Mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 sm:p-2 border rounded-xl bg-slate-50 border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 shadow-xs transition-transform hover:scale-105 cursor-pointer"
            >
              {isDarkMode ? <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            </button>

            {/* Portal Action CTAs */}
            <div className="hidden sm:flex items-center space-x-2">
              {currentUser ? (
                <button
                  onClick={() => navigate(currentUser.role === 'Jamaah' ? '/user/dashboard' : '/dashboard')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-lg transition-all cursor-pointer shadow-xs"
                >
                  {curr.ctaDashboard}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login?portal=admin')}
                    className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-2 cursor-pointer flex items-center space-x-1"
                  >
                    <span>🏢</span>
                    <span>Portal Admin</span>
                  </button>
                  <button
                    onClick={() => navigate('/login?portal=jamaah')}
                    className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-extrabold text-[10px] uppercase tracking-wider px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center space-x-1"
                  >
                    <span>🕋</span>
                    <span>Portal Jemaah</span>
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-lg transition-all hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer"
                  >
                    {curr.navRegistrasi}
                  </button>
                </>
              )}
            </div>


            {/* Mobile menu burger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-emerald-600 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-4.8 w-4.8" /> : <Menu className="h-4.8 w-4.8" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown - Absolute Positioned, Solid Background, Clean Contrast */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 lg:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xl flex flex-col z-50 animate-fade-in select-none">
            <button 
              onClick={() => handleScrollToSec('section_problems')} 
              className="text-left py-2 px-1 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-350 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border-b border-slate-100 dark:border-slate-900/60"
            >
              {curr.navProblems} & {curr.navSolutions}
            </button>
            <button 
              onClick={() => handleScrollToSec('section_demo')} 
              className="text-left py-2 px-1 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-350 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border-b border-slate-100 dark:border-slate-900/60"
            >
              {curr.navDemo}
            </button>
            <button 
              onClick={() => handleScrollToSec('section_testimonials')} 
              className="text-left py-2 px-1 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-350 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border-b border-slate-100 dark:border-slate-900/60"
            >
              {curr.navTestimonials}
            </button>
            <button 
              onClick={() => handleScrollToSec('section_pricing')} 
              className="text-left py-2 px-1 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-350 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border-b border-slate-100 dark:border-slate-900/60"
            >
              {curr.navPricing}
            </button>
            
            <div className="flex gap-2.5 pt-2">
              {currentUser ? (
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
                  className="w-full bg-emerald-600 text-center py-3 rounded-xl text-xs font-black text-white cursor-pointer hover:bg-emerald-700 transition-colors uppercase tracking-widest"
                >
                  {curr.ctaDashboard}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                    className="w-1/2 border dark:border-slate-800 text-center py-3 rounded-xl text-xs font-black text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors uppercase tracking-widest"
                  >
                    {curr.ctaLogin}
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}
                    className="w-1/2 bg-emerald-600 text-center py-3 rounded-xl text-xs font-black text-white cursor-pointer hover:bg-emerald-700 transition-colors uppercase tracking-widest"
                  >
                    {curr.navRegistrasi}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* INFO TICKER - Live operational telemetry */}
      <div className="bg-slate-900 border-b border-emerald-900/40 py-2 overflow-hidden select-none">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="flex items-center space-x-1.5 shrink-0 bg-emerald-600 text-white px-2.5 py-1.5 rounded border border-emerald-500/30 text-[9.5px] font-black tracking-wider mr-4 shadow-sm">
            <span className="h-2 w-2 bg-rose-450 rounded-full animate-pulse mr-1" />
            <span>{curr.telemetryTitle}</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="flex space-x-12 whitespace-nowrap text-[11px] font-semibold font-mono text-emerald-200">
              {curr.telemetryItems.map((item, idx) => (
                <span key={idx} className="flex items-center space-x-1">
                  <span className="text-emerald-500">◆</span>
                  <span>{item}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 text-center">
        {/* Shiny Badge */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest shadow-xs">
            <span>✨</span>
            <span>{curr.tagline}</span>
          </div>
        </div>

        {/* Dynamic Titles */}
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-800 dark:text-white leading-tight tracking-tight uppercase">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400">
              {curr.heroTitleGrad}
            </span>
            <br />
            <span className="text-base sm:text-2xl lg:text-3xl block mt-2 font-black text-slate-400 dark:text-slate-400 tracking-wide">
              {curr.heroTitleRest}
            </span>
          </h1>
          <p className="mt-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
            {curr.heroSubtitle}
          </p>

          {/* Double Call to Actions */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3.5">
            {currentUser ? (
              <button
                onClick={() => navigate(currentUser.role === 'Jamaah' ? '/user/dashboard' : '/dashboard')}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-black text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-500/15 hover:scale-102 transition-all cursor-pointer"
              >
                {curr.ctaDashboard}
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login?portal=admin')}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider px-7 py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 hover:scale-102 transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <span>🏢</span>
                  <span>Masuk Portal Admin</span>
                </button>
                <button
                  onClick={() => navigate('/login?portal=jamaah')}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-700 hover:to-emerald-700 text-white font-black text-xs uppercase tracking-wider px-7 py-3.5 rounded-xl shadow-lg shadow-amber-600/20 hover:scale-102 transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <span>🕋</span>
                  <span>Masuk Portal Jemaah</span>
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto bg-slate-200 hover:bg-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 border border-slate-300/60 text-slate-800 dark:text-white font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all cursor-pointer"
                >
                  Daftar Akun Baru
                </button>
              </>
            )}
          </div>
        </div>


          {/* HIGH-FIDELITY LIVE MODULES TELEMETRY HUB */}
          <div className="mt-20 text-left relative max-w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-slate-200/65 dark:border-slate-800/80 pb-5 gap-4">
              <div>
                <span className="text-[9px] uppercase font-black tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/15">
                  🌐 INTEGRATED DIGITAL WORKFLOWS
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight mt-3">
                  {language === 'id' ? 'Ekosistem Pusat Kontrol Terpadu' : 'Unified Control Center Ecosystem'}
                </h3>
              </div>
              <div className="flex items-center space-x-2 text-[9px] font-mono text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 px-3 py-1.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>ALL CHANNELS SECURE • ACTIVE STATUS</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1: Saudi Muqeem Express Node */}
              <div className="bg-white/75 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/70 p-5 rounded-2xl shadow-xs relative overflow-hidden group hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all duration-350">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex justify-between items-start mb-3.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm">
                    ⚡
                  </div>
                  <span className="text-[8px] font-black tracking-widest text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15 uppercase">
                    SAUDI PORTAL
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wide">
                  {language === 'id' ? 'Sinkronisasi Visa Muqeem' : 'Saudi Muqeem Sync'}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1.5 leading-relaxed">
                  {language === 'id' ? 'Otomatisasi pencocokan status pendaftaran berkas visa jemaah langsung ke portal Saudi KBSA tanpa input manual berkali-kali.' : 'Automate visa tracking queries directly against the live KBSA database to ensure instant clearances.'}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center text-[9px] font-mono font-black text-emerald-600 dark:text-emerald-400">
                  <span>LATENCY: 1.1s</span>
                  <span>100% SUCCESS RATE</span>
                </div>
              </div>

              {/* Card 2: Visual Seating Grid Allocator */}
              <div className="bg-white/75 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/70 p-5 rounded-2xl shadow-xs relative overflow-hidden group hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all duration-350">
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex justify-between items-start mb-3.5">
                  <div className="h-8 w-8 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-600 dark:text-teal-400 text-sm">
                    🚌
                  </div>
                  <span className="text-[8px] font-black tracking-widest text-teal-600 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/15 uppercase">
                    VISUAL PLOT
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wide">
                  {language === 'id' ? 'Seat Planner Bus Pariwisata' : 'Visual Bus Seat Planner'}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1.5 leading-relaxed">
                  {language === 'id' ? 'Plotting kursi jemaah dan pembagian rombongan keluarga secara dinamis sebelum lepas landas demi ketertiban lapangan.' : 'Design visual bus seat blueprints. Keep families seated together and avoid hot-seat disputes in holy lands.'}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center text-[9px] font-mono">
                  <span className="text-slate-400">ENGINE v2.9</span>
                  <span className="font-bold text-teal-500 uppercase">NO CONFLICTS</span>
                </div>
              </div>

              {/* Card 3: Surgical Margin Audit Ledger */}
              <div className="bg-white/75 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/70 p-5 rounded-2xl shadow-xs relative overflow-hidden group hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all duration-350">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex justify-between items-start mb-3.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm">
                    💰
                  </div>
                  <span className="text-[8px] font-black tracking-widest text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15 uppercase">
                    Surgical Desk
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wide">
                  {language === 'id' ? 'Surgical Kas Ledger' : 'Surgical Ledger Desk'}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1.5 leading-relaxed">
                  {language === 'id' ? 'Lacak pembayaran SAR di Saudi, setoran pelunasan rupiah jemaah secara detail per kloter pembiayaan.' : 'Calculate multi-currency ledgers, lodging downpayments, and field mutawwif tips on one secure ledger spreadsheet.'}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center text-[9px] font-mono font-black text-emerald-600 dark:text-emerald-400">
                  <span>AUDITED</span>
                  <span>ZERO LEAKAGE</span>
                </div>
              </div>

              {/* Card 4: Mutawwif Dispatch Center */}
              <div className="bg-white/75 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/70 p-5 rounded-2xl shadow-xs relative overflow-hidden group hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all duration-350">
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex justify-between items-start mb-3.5">
                  <div className="h-8 w-8 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-600 dark:text-teal-400 text-sm">
                    🕋
                  </div>
                  <span className="text-[8px] font-black tracking-widest text-teal-600 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/15 uppercase">
                    GROUND TRACK
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wide">
                  {language === 'id' ? 'Aktivitas Lapangan Mutawwif' : 'On-Field Checklist'}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1.5 leading-relaxed">
                  {language === 'id' ? 'Akses langsung hand-over bagasi, distribusi kunci hotel, hingga update ziarah langsung dari Mutawwif di lapangan.' : 'Sync directly with the mutawwifs at mechanical checkpoints. Monitor airport checkins and hotel arrivals live.'}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center text-[9px] font-mono">
                  <span className="text-slate-400">DISPATCH V3.1</span>
                  <span className="font-bold text-teal-500 uppercase">ONLINE ACTIVE</span>
                </div>
              </div>

            </div>
          </div>
        </section>

      {/* SECTION MASALAH (Crimson Alert Theme) */}
      <section id="section_problems" className="py-20 border-t border-slate-200/40 dark:border-slate-800/40 bg-gradient-to-b from-rose-50/20 via-slate-50/50 to-white dark:from-rose-950/5 dark:via-slate-950/20 dark:to-slate-950">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-rose-500/10 rounded-full border border-rose-500/20 mb-4 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="text-[9px] uppercase font-bold tracking-widest text-rose-600 dark:text-rose-400">
                CRISIS MATRIX INFRASTRUCTURE
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              {curr.problemsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto font-medium leading-relaxed">
              {curr.problemsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {curr.problemsList.map((prob, idx) => {
              // Custom icon maps
              const getProblemIcon = (i: number) => {
                switch (i) {
                  case 0: return <AlertTriangle className="h-5 w-5 text-rose-500" />;
                  case 1: return <AlertCircle className="h-5 w-5 text-amber-500" />;
                  case 2: return <DollarSign className="h-5 w-5 text-red-500" />;
                  case 3: return <Users className="h-5 w-5 text-orange-500" />;
                  default: return <AlertTriangle className="h-5 w-5 text-rose-500" />;
                }
              };
              
              const getProblemStatusUnit = (i: number) => {
                switch (i) {
                  case 0: return 'RISK: SEVERE EXCEL';
                  case 1: return 'LOGISTICS: UNMANAGED';
                  case 2: return 'LOSS RATIO: ACCUMULATED';
                  case 3: return 'STATUS: DISPUTED SEATING';
                  default: return 'ALERT: RECURRENT';
                }
              };

              return (
                <div 
                  key={idx} 
                  className="bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-rose-950/30 rounded-3xl p-6 shadow-sm hover:shadow-xl dark:hover:shadow-rose-950/10 hover:border-rose-500/40 dark:hover:border-rose-500/30 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
                >
                  {/* Subtle red bottom-right light glow */}
                  <div className="absolute -bottom-10 -right-10 h-28 w-28 bg-rose-550/10 dark:bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors pointer-events-none" />
                  
                  <div>
                    {/* Index Counter Frame */}
                    <div className="flex justify-between items-center mb-5">
                      <div className="h-10 w-10 rounded-2xl bg-rose-50 dark:bg-rose-950/45 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center">
                        {getProblemIcon(idx)}
                      </div>
                      <span className="font-mono text-[11px] font-black tracking-widest text-rose-500/30 dark:text-rose-500/20 group-hover:text-rose-500/50 transition-colors">
                        0{idx + 1}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-black uppercase text-slate-800 dark:text-slate-100 tracking-wide mb-2.5">
                      {prob.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                      {prob.desc}
                    </p>
                  </div>

                  {/* Operational Danger Stamp */}
                  <div className="mt-6 pt-3.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[9px] font-mono tracking-wider">
                    <span className="text-rose-500 font-extrabold">{getProblemStatusUnit(idx)}</span>
                    <span className="text-slate-450 dark:text-slate-500">CRITICAL</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION SOLUSI (Emerald Secure Theme) */}
      <section id="section_solutions" className="py-20 border-t border-slate-250 dark:border-slate-850/80 bg-gradient-to-b from-white via-emerald-50/10 to-white dark:from-slate-950 dark:via-emerald-950/5 dark:to-slate-950">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400">
                INTELLIGENT SOLUTION
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              {curr.solutionsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto font-medium leading-relaxed">
              {curr.solutionsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {curr.solutionsList.map((sol, idx) => {
              // Custom solution icon map
              const getSolutionIcon = (i: number) => {
                switch (i) {
                  case 0: return <CheckCircle className="h-5 w-5 text-emerald-500" />;
                  case 1: return <Sparkles className="h-5 w-5 text-teal-500" />;
                  case 2: return <TrendingUp className="h-5 w-5 text-emerald-400" />;
                  case 3: return <Shield className="h-5 w-5 text-teal-400" />;
                  default: return <Check className="h-5 w-5 text-emerald-500" />;
                }
              };

              const getSolutionStatusUnit = (i: number) => {
                switch (i) {
                  case 0: return 'IMPACT: 100% UNIFIED';
                  case 1: return 'SPEED: SECONDS FLUID';
                  case 2: return 'SAUDI PORTAL: SYNCED';
                  case 3: return 'AUDITED: SECURE COSS';
                  default: return 'COMPLIANCE RESOLVED';
                }
              };

              return (
                <div 
                  key={idx} 
                  className="bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-emerald-950/30 rounded-3xl p-6 shadow-sm hover:shadow-xl dark:hover:shadow-emerald-950/10 hover:border-emerald-500/40 dark:hover:border-emerald-555/30 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
                >
                  {/* Subtle emerald bottom-right light glow */}
                  <div className="absolute -bottom-10 -right-10 h-28 w-28 bg-emerald-550/10 dark:bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
                  
                  <div>
                    {/* Index Counter Frame */}
                    <div className="flex justify-between items-center mb-5">
                      <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/45 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center">
                        {getSolutionIcon(idx)}
                      </div>
                      <span className="font-mono text-[11px] font-black tracking-widest text-emerald-500/30 dark:text-emerald-500/20 group-hover:text-emerald-500/50 transition-colors">
                        0{idx + 1}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-black uppercase text-slate-800 dark:text-slate-100 tracking-wide mb-2.5">
                      {sol.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                      {sol.desc}
                    </p>
                  </div>

                  {/* Operational Success Stamp */}
                  <div className="mt-6 pt-3.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[9px] font-mono tracking-wider">
                    <span className="text-emerald-500 font-extrabold">{getSolutionStatusUnit(idx)}</span>
                    <span className="text-slate-450 dark:text-slate-500 uppercase">SOLVED</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION VIDEO DEMO (Interactive Browser Model Preview) */}
      <section id="section_demo" className="py-16 border-t border-slate-250 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-[10px] uppercase font-black text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded tracking-wider">
              TACTICAL INTERACTIVE PORTAL
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight mt-3">
              {curr.demoTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              {curr.demoSubtitle}
            </p>
          </div>

          {/* Interactive Workbench Container */}
          <div className="mt-10 border border-slate-300 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 p-4 sm:p-5 rounded-3xl shadow-xl backdrop-blur-md relative overflow-hidden">
            
            {/* Top window dots */}
            <div className="flex justify-between items-center border-b pb-3.5 mb-5 border-slate-200 dark:border-slate-800/80">
              <div className="flex space-x-1.5 items-center">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block" />
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block" />
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" />
                <span className="ml-3 font-mono text-[9px] text-slate-400 tracking-wider hidden sm:inline">
                  https://travelops-os.built.com/ops-center
                </span>
              </div>
              <div className="flex items-center space-x-1.5 font-bold font-mono text-[9px] bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
                <Laptop className="h-3 w-3 mr-1" /> LIVE CONSOLE SIMULATOR
              </div>
            </div>

            {/* Quick selector Tabs */}
            <div className="flex flex-wrap gap-2.5 mb-5">
              <button 
                onClick={() => setDemoTab('bus')}
                className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  demoTab === 'bus' 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 border dark:border-slate-800 text-slate-500 dark:text-slate-300'
                }`}
              >
                🚍 {curr.demoTabs.bus}
              </button>
              <button 
                onClick={() => setDemoTab('visa')}
                className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  demoTab === 'visa' 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 border dark:border-slate-800 text-slate-500 dark:text-slate-300'
                }`}
              >
                📁 {curr.demoTabs.visa}
              </button>
              <button 
                onClick={() => setDemoTab('finance')}
                className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  demoTab === 'finance' 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 border dark:border-slate-800 text-slate-500 dark:text-slate-300'
                }`}
              >
                💳 {curr.demoTabs.finance}
              </button>
            </div>

            {/* Active Display Viewport */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 rounded-2xl border dark:border-slate-900 min-h-[340px] text-left flex flex-col justify-between relative shadow-inner">
              
              {/* TAB 1: BUS SEATING SELECTOR */}
              {demoTab === 'bus' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in">
                  <div className="lg:col-span-4 space-y-4">
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 rounded">
                      Occupancy Simulation
                    </span>
                    <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-200 mt-2">
                      {curr.demoBusTitle}
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      {curr.demoBusInstructions}
                    </p>

                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">{curr.demoUnassignedList}</span>
                      <div className="space-y-1 max-h-[140px] overflow-y-auto bg-white dark:bg-slate-900/60 p-2 rounded-lg border dark:border-slate-850">
                        {unseatedPilgrims.length === 0 ? (
                          <p className="text-[10px] italic text-emerald-500 font-bold p-2 text-center">🎉 {curr.demoAllSeated}</p>
                        ) : (
                          unseatedPilgrims.map((name, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedUnseated(selectedUnseated === idx ? null : idx)}
                              className={`w-full text-left p-1.5 rounded text-[10px] font-bold flex justify-between cursor-pointer border transition-colors ${
                                selectedUnseated === idx 
                                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 font-extrabold' 
                                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
                              }`}
                            >
                              <span>{name}</span>
                              <span className="text-[8px] bg-slate-200 dark:bg-slate-850 px-1 rounded uppercase tracking-wider">{curr.demoAssignee}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-8 bg-white dark:bg-slate-900/40 border dark:border-slate-800/80 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3.5 border-b dark:border-slate-800 pb-2">
                        <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">BUS #1 PARIWISATA SUTRA</span>
                        <span className="text-[10px] font-bold text-emerald-500">
                          {busSeats.filter(p => p !== 'Empty').length} / 12 {curr.demoBusCapacity}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {busSeats.map((v, i) => (
                          <button
                            key={i}
                            onClick={() => handleSeatAllocation(i)}
                            className={`p-2.5 rounded text-center text-[10px] font-bold border transition-all cursor-pointer ${
                              v !== 'Empty' 
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 font-extrabold' 
                                : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-emerald-500/10 hover:border-emerald-500 text-slate-400'
                            }`}
                          >
                            <span className="block text-[8px] font-bold opacity-60 uppercase mb-0.5">S-{i + 1}</span>
                            <span className="truncate block font-black max-w-[70px] mx-auto">{v === 'Empty' ? 'Empty' : v}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 text-[9px] text-slate-500 italic block">
                      *TIPS: Pilih nama jemaah di sebelah kiri lalu klik slot kursi kosong untuk mendudukinya.
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: VISA TRACKER BOARD */}
              {demoTab === 'visa' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in text-left">
                  <div className="space-y-4">
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded">
                      Muqeem Saudi Sync
                    </span>
                    <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-255 mt-2">
                      {curr.demoVisaTitle}
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Sistem kami secara berkala memverifikasi berkas paspor asli, sertifikat vaksin meningitis, hingga pencocokan kode moassasah visa secara langsung.
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-400">Total Kloter Completion</span>
                        <span className="text-emerald-500">{visaProgress}% Selesai</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${visaProgress}%` }} />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setVisaProgress(100); triggerDemoToast(language === 'id' ? 'Seluruh Visa disinkronisasi ke 100%!' : 'All visas completed successfully!'); }} 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] uppercase px-3 py-1.5 rounded cursor-pointer"
                        >
                          Auto Sync 100%
                        </button>
                        <button 
                          onClick={() => { setVisaProgress(75); }} 
                          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 text-[9px] font-bold uppercase px-2 py-1.5 rounded cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border dark:border-slate-800/80 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center border-b dark:border-slate-850 pb-1.5 text-[9px] font-black text-slate-450 tracking-wider">
                      <span>{curr.demoVisaApplicant}</span>
                      <span>STATUS VERIFIKASI</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2 rounded border dark:border-slate-800">
                        <div className="text-[10px]">
                          <p className="font-extrabold text-slate-800 dark:text-slate-200">Muhammad Hambali</p>
                          <p className="text-[8px] text-slate-400">PASSPORT ASLI VALID</p>
                        </div>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-550/20 px-1.5 py-0.5 rounded uppercase font-bold">✓ VERIFIED</span>
                      </div>

                      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2 rounded border dark:border-slate-800">
                        <div className="text-[10px]">
                          <p className="font-extrabold text-slate-800 dark:text-slate-200">Hajah Sofia Syarif</p>
                          <p className="text-[8px] text-slate-400">MENINGITIS OK</p>
                        </div>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-555/20 px-1.5 py-0.5 rounded uppercase font-bold">✓ MOASSASAH OK</span>
                      </div>

                      <div className="flex justify-between items-center bg-rose-500/5 dark:bg-rose-500/5 p-2 rounded border border-rose-500/20">
                        <div className="text-[10px]">
                          <p className="font-extrabold text-slate-800 dark:text-slate-200">Ahmad Subagja</p>
                          <p className="text-[8px] text-rose-500">AWAITING FILING</p>
                        </div>
                        <button 
                          onClick={() => { setVisaProgress(92); triggerDemoToast(curr.demoVisaToast.replace('{name}', 'Ahmad Subagja')); }}
                          className="text-[9px] bg-rose-500 text-white font-bold px-2 py-1 rounded cursor-pointer"
                        >
                          {curr.demoVisaApproveBtn}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: FINANCIAL CASH LEDGER */}
              {demoTab === 'finance' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in text-left">
                  <div className="lg:col-span-5 space-y-4">
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-555/20 rounded">
                      Audited Book Ledger
                    </span>
                    <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-200 mt-2">
                      {curr.demoFinanceTitle}
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Amankan cash flow dengan ledger khusus. Pantau saldo katering, panjar hotel Arab Saudi, hingga cicilan jamaah dalam hitungan detik.
                    </p>

                    <button 
                      onClick={handleAddDemoTx}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg cursor-pointer inline-flex items-center"
                    >
                      <Plus className="h-3 w-3 mr-1" /> {curr.demoFinanceAddBtn}
                    </button>
                  </div>

                  <div className="lg:col-span-7 bg-white dark:bg-slate-900/40 border dark:border-slate-800/80 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 tracking-wider block mb-2 uppercase">{curr.demoFinanceLatest}</span>
                      <div className="space-y-1 max-h-[140px] overflow-y-auto bg-slate-50 dark:bg-slate-950 p-2 rounded border dark:border-slate-900">
                        {ledgerLogs.map((log) => (
                          <div key={log.id} className="flex justify-between items-center text-[10px] py-1 border-b dark:border-slate-800/40 last:border-0">
                            <span className="truncate max-w-[170px] text-slate-600 dark:text-slate-400">{log.desc}</span>
                            <span className={`font-bold ${log.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {log.type === 'INCOME' ? '+' : '-'} Rp {log.amount.toLocaleString('id-ID')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-2 border-t dark:border-slate-800">
                      <div className="bg-emerald-500/10 p-2 rounded text-center">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">TOTAL REVENUE IN</span>
                        <span className="text-xs font-black text-emerald-500">Rp 1,42 Milyar</span>
                      </div>
                      <div className="bg-indigo-500/10 p-2 rounded text-center">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">NET SURPLUS ESTIMATION</span>
                        <span className="text-xs font-black text-indigo-500">Rp 769 Juta</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom decorative bar */}
              <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-450" />
            </div>

            {/* Simulated mini help tag */}
            <div className="mt-3.5 flex justify-between items-center text-[10px] text-slate-450 font-bold px-1 select-none">
              <span>{curr.demoHelperText}</span>
              <span className="text-emerald-500 font-bold uppercase tracking-widest">TLS 1.2 SAFE SECURE</span>
            </div>
          </div>

          {/* Dedicated Video Walkthrough Frame */}
          <div className="mt-16 border-t border-slate-200/50 dark:border-slate-800/80 pt-16">
            <div className="text-center max-w-3xl mx-auto mb-8">
              <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                🎬 PRODUCT TOUR VIDEO DEMO
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-3 uppercase tracking-tight">
                {language === 'id' ? 'Saksikan Sistem Kami Bekerja Secara Live' : 'Watch Our Digital OS in Real-time Action'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-505 dark:text-slate-400 mt-1.5 max-w-lg mx-auto leading-relaxed">
                {language === 'id' 
                  ? 'Temukan kemudahan otomatisasi muassasah visa, seat bus visual, dan koordinasi mutawwif di lapangan tanpa tumpang tindih berkas.' 
                  : 'Discover the power of automated visa audits, real-time bus seats coordinate charts, and ground-level mutawwif checklists.'}
              </p>
            </div>

            {/* Desktop & Mobile Walkthrough Switcher Menu */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-slate-200/60 dark:bg-slate-900 border dark:border-slate-800 p-1.5 rounded-2xl items-center select-none shadow-inner">
                <button
                  type="button"
                  onClick={() => { setVideoWalkthroughMode('desktop'); setIsVideoPlaying(false); }}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center space-x-2 ${
                    videoWalkthroughMode === 'desktop' 
                      ? 'bg-white dark:bg-slate-800 text-emerald-650 dark:text-emerald-400 shadow-md' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Laptop className="h-3.5 w-3.5 mr-1" />
                  <span>Desktop View</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setVideoWalkthroughMode('mobile'); setIsVideoPlaying(false); }}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center space-x-2 ${
                    videoWalkthroughMode === 'mobile' 
                      ? 'bg-white dark:bg-slate-800 text-emerald-650 dark:text-emerald-400 shadow-md' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5 mr-1" />
                  <span>Mobile View</span>
                </button>
              </div>
            </div>

            {/* Video Player Frame Shell */}
            <div className={`mx-auto bg-slate-950 shadow-2xl relative group overflow-hidden transition-all duration-500 select-none ${
              videoWalkthroughMode === 'desktop'
                ? 'max-w-4xl aspect-video rounded-3xl border border-slate-800'
                : 'max-w-[310px] w-full aspect-[9/19] rounded-[42px] border-[12px] border-slate-900 dark:border-slate-800 ring-4 ring-slate-950 shadow-emerald-500/5'
            }`}>
              
              {/* Physical phone trim and buttons when in mobile container mode */}
              {videoWalkthroughMode === 'mobile' && (
                <>
                  {/* Physical Bezel Trim Highlights */}
                  <div className="absolute top-[12%] -left-[12px] w-[3px] h-8 bg-slate-705/60 rounded-r z-50 pointer-events-none" />
                  <div className="absolute top-[18%] -left-[12px] w-[3px] h-10 bg-slate-705/60 rounded-r z-50 pointer-events-none" />
                  <div className="absolute top-[24%] -left-[12px] w-[3px] h-10 bg-slate-705/60 rounded-r z-50 pointer-events-none" />
                  <div className="absolute top-[18%] -right-[12px] w-[3px] h-12 bg-slate-705/60 rounded-l z-50 pointer-events-none" />
                  
                  {/* Modern Dynamic Island Notch */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4.5 bg-black rounded-full z-50 border border-slate-900 shadow-inner flex items-center justify-between px-2.5 pointer-events-none">
                    <span className="w-1 h-1 bg-sky-500 rounded-full animate-pulse" />
                    <span className="w-1 h-1 bg-slate-950 rounded-full border border-slate-900" />
                  </div>
                  
                  {/* iOS Home bottom indicator swipe gesture bar */}
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/40 rounded-full z-50 pointer-events-none" />
                </>
              )}

              {/* Background/Thumbnail Layer */}
              {!isVideoPlaying ? (
                <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 cursor-pointer" onClick={() => setIsVideoPlaying(true)}>
                  {/* Stunning Background Artwork representation */}
                  <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay transition-transform duration-700 group-hover:scale-105" 
                       style={{ backgroundImage: videoWalkthroughMode === 'desktop' ? `url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200')` : `url('https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=600')` }} />
                  
                  {/* Slate gradient dark wash overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />

                  {/* Top Row: System telemetry & Video title */}
                  {videoWalkthroughMode === 'mobile' ? (
                    <div className="relative z-20 flex justify-between items-center text-[8px] font-bold text-white/95 font-sans tracking-tight px-1 pt-3">
                      <span>09:41</span>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[7.5px]">📶 5G</span>
                        <span className="text-[7.5px]">🔋 88%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative z-20 flex justify-between items-center">
                      <span className="text-[8px] sm:text-[10px] font-mono font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/40 uppercase tracking-widest bg-emerald-900/40">
                        {videoWalkthroughMode === 'desktop' ? 'SYSTEM EXCURSION WALKTHROUGH' : 'MOBILE FIELD OPERATIONS SYNC'}
                      </span>
                      <span className="text-[9px] font-bold text-white/70 bg-black/40 px-2 py-0.5 rounded backdrop-blur">
                        {videoWalkthroughMode === 'desktop' ? '03:45' : '02:15'}
                      </span>
                    </div>
                  )}

                  {/* Middle Row: Play Pulsing Button */}
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsVideoPlaying(true); }}
                        className={`rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 hover:scale-115 transition-transform duration-300 pointer-events-auto cursor-pointer ${
                          videoWalkthroughMode === 'desktop' ? 'h-16 w-16 sm:h-20 sm:w-20' : 'h-14 w-14'
                        }`}
                      >
                        <Play className={`fill-current ml-1 ${videoWalkthroughMode === 'desktop' ? 'h-6 w-6 sm:h-8 sm:w-8' : 'h-5 w-5'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Row: Metadata title info */}
                  <div className={`relative z-20 text-left space-y-1 ${videoWalkthroughMode === 'mobile' ? 'pb-6 px-1' : ''}`}>
                    <h4 className={`${videoWalkthroughMode === 'mobile' ? 'text-xs line-clamp-2' : 'text-sm sm:text-base'} font-black text-white uppercase tracking-tight`}>
                      {videoWalkthroughMode === 'desktop' 
                        ? (language === 'id' ? 'TravelOps Umroh OS: Panduan Mulai Cepat Agensi' : 'TravelOps Umrah OS: Fast Walkthrough & Setup Guide')
                        : (language === 'id' ? 'TravelOps Lapangan: Alur Koordinasi Mutawwif Mobile' : 'TravelOps On-Field: Mobile Mutawwif Operations Guide')}
                    </h4>
                    <p className={`${videoWalkthroughMode === 'mobile' ? 'text-[8.5px] leading-relaxed line-clamp-3' : 'text-[10px] sm:text-[11px] text-slate-300 font-medium max-w-xl'}`}>
                      {videoWalkthroughMode === 'desktop'
                        ? (language === 'id' 
                          ? 'Dinarasikan langsung oleh Ops Director kami. Pelajari arsitektur database jemaah dan integrasi sistem kas kami.'
                          : 'Narrated by our Technical Lead. Learn best practices for managing multiple active cohorts, secure finances, and visa uploads.')
                        : (language === 'id'
                          ? 'Panduan lapangan mutawwif untuk check-in hotel, melawat makam bersejarah, dan pembagian gelang identitas jemaah.'
                          : 'Field guide for Mutawwifs on managing hotel check-ins, historic site visits, and instant pilgrim bracelet scan coordination.')}
                    </p>
                  </div>
                </div>
              ) : (
                /* Video Playing - Interactive Screencaster Simulation Simulation */
                <div className={`absolute inset-0 bg-slate-950 z-10 flex flex-col justify-between select-none font-mono ${
                  videoWalkthroughMode === 'mobile' ? 'p-3 pt-6 pb-6' : 'p-4 sm:p-6'
                }`}>
                  
                  {/* Top Panel: Live Sync Telemetries / Status Bar */}
                  {videoWalkthroughMode === 'mobile' ? (
                    <div className="flex justify-between items-center text-[7.5px] text-slate-400 border-b border-slate-900 pb-2 mb-2 font-sans">
                      <span>09:41</span>
                      <span className="text-emerald-400 font-bold tracking-widest animate-pulse">📶 5G Makkah</span>
                      <span>88% 🔋</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-[9px] text-slate-400 bg-slate-900/60 p-2 rounded-xl border border-slate-800/40">
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-emerald-400">
                          {videoWalkthroughMode === 'desktop' ? 'PLAYING DESKTOP WALKTHROUGH' : 'PLAYING MOBILE FIELD DESK'}
                        </span>
                      </div>
                      <span>PROJECTION: CH-{Math.floor(videoTime / 10 + 104)}</span>
                    </div>
                  )}

                  {/* Center Graphic: Futuristic Live Interactive Screencast Output */}
                  <div className="flex-1 flex flex-col justify-center items-center my-2 overflow-hidden relative">
                    
                    {videoWalkthroughMode === 'desktop' ? (
                      videoTime % 25 < 12 ? (
                        <div className="space-y-3.5 max-w-sm w-full text-center">
                          <span className="text-[10px] font-black text-emerald-400 bg-emerald-900/40 px-2 py-1 rounded-md border border-emerald-500/20 uppercase tracking-widest block mx-auto w-fit animate-pulse">
                            ⚡ SYNCHRONIZING WITH SAUDI PORTAL
                          </span>
                          
                          {/* Simulated connection lines */}
                          <div className="font-mono text-[9px] text-slate-400 space-y-1 bg-black/40 p-3 rounded-lg border border-slate-800/60 max-h-[140px] overflow-hidden text-left">
                            <p className="text-emerald-555 uppercase">✓ [PORT_MAIN] ESTABLISHED JWT TOKEN</p>
                            <p className="text-emerald-500">✓ SENT PLOT_BUS_SEATS: EN_ROUTE_JEDDAH</p>
                            <p className="text-slate-400">⏳ VERIFYING MUQEEM SYSTEM MATCH CODE: MA-{1000 + videoTime} ...</p>
                            <p className="text-emerald-400 font-extrabold animate-bounce">✓ 12 VISA FILES SUCCESSFULLY FILED & CLEARED</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 max-w-md w-full text-center">
                          <span className="text-[10px] font-black text-teal-400 bg-teal-900/40 px-2 py-1 rounded-md border border-teal-500/20 uppercase tracking-widest block mx-auto w-fit">
                            💰 UPDATING LIVE SURGICAL LEDGER
                          </span>
                          
                          {/* Mini graphical mock telemetry chart */}
                          <div className="flex items-end justify-center space-x-2 h-16 pt-2 border-b border-emerald-500/30 max-w-xs mx-auto">
                            <div className="w-4 bg-emerald-500/20 h-[30%] rounded-t" />
                            <div className="w-4 bg-emerald-500/40 h-[45%] rounded-t" />
                            <div className="w-4 bg-emerald-500/60 h-[75%] rounded-t" />
                            <div className="w-4 bg-emerald-500 h-[92%] rounded-t animate-bounce" />
                          </div>
                          <div className="flex justify-between text-[8px] text-slate-400 max-w-xs mx-auto font-bold uppercase tracking-wider mt-1">
                            <span>M-1</span>
                            <span>M-2</span>
                            <span>M-3</span>
                            <span>CURR_KLOTER</span>
                          </div>
                        </div>
                      )
                    ) : (
                      /* Mobile Walkthrough live visualization screen - FULL SCREEN inside bezel! */
                      <div className="w-full h-full flex flex-col justify-between text-left p-1 relative overflow-hidden">
                        
                        {/* Title of the App */}
                        <div className="mb-2">
                          <span className="text-[7.5px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">
                            MUTAWWIF PORTAL v3.1
                          </span>
                          <div className="mt-1 flex justify-between items-center">
                            <div>
                              <p className="text-[9.5px] font-black text-white uppercase truncate">Kloter Ramadhan IX</p>
                              <p className="text-[6.5px] text-slate-500">Makkah Al-Mukarramah Center</p>
                            </div>
                            <span className="text-[6.5px] bg-slate-900 border border-slate-800 text-slate-400 px-1 py-0.5 rounded">
                              BUS #4
                            </span>
                          </div>
                        </div>

                        {/* Interactive Checklist simulation on mobile */}
                        <div className="flex-1 space-y-2 overflow-hidden flex flex-col">
                          <p className="text-[6.5px] font-bold uppercase text-slate-400 tracking-wider">Ground Milestones</p>
                          <div className="space-y-1.5 bg-black/40 p-2 rounded-xl border border-slate-900 text-[7px] leading-normal flex-1 flex flex-col justify-center">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-emerald-400 text-[8px]">✓</span>
                              <span className="text-slate-400 line-through">Bagasi Jemaah Masuk Bus</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-emerald-400 text-[8px]">✓</span>
                              <span className="text-slate-350 line-through font-bold">Passport Check-in Safsaf</span>
                            </div>
                            <div className="flex items-center space-x-1.5 animate-pulse">
                              <span className="text-amber-400 text-[8px]">⏳</span>
                              <span className="text-emerald-400 font-bold">Kunci Hotel Makkah Tower</span>
                            </div>
                            <div className="flex items-center space-x-1.5 text-slate-500">
                              <span className="text-[5px]">○</span>
                              <span>Pelepasan Tawaf Selesai</span>
                            </div>
                          </div>

                          {/* Mini dynamic map radar coordinate log for ultimate immersive look */}
                          <div className="bg-emerald-950/20 border border-emerald-900/30 p-1.5 rounded-lg text-[6px]">
                            <div className="flex justify-between font-bold text-emerald-400">
                              <span>📍 GPS RADAR</span>
                              <span className="animate-pulse">ACTIVE TRACK</span>
                            </div>
                            <p className="text-slate-400 mt-0.5">21°25'21"N • 39°49'34"E</p>
                          </div>
                        </div>

                        {/* Mobile Footer controller */}
                        <div className="text-[6.5px] text-center text-slate-500 border-t border-slate-900 pt-1.5 mt-2 flex justify-between items-center">
                          <span>CLOUD SYNC: 100%</span>
                          <span className="text-emerald-450 blinking font-bold">● LIVE DATA</span>
                        </div>
                      </div>
                    )}

                    {/* Glowing watermarked background logo */}
                    {videoWalkthroughMode === 'desktop' && (
                      <div className="absolute text-emerald-500/10 font-bold text-4xl uppercase pointer-events-none tracking-widest">
                        TRAVELOPS_OS
                      </div>
                    )}
                  </div>

                  {/* Bottom Player Controller Panel */}
                  <div className={`border-t border-slate-850 bg-slate-900/40 rounded-xl ${
                    videoWalkthroughMode === 'mobile' ? 'p-1.5 space-y-1 mt-1' : 'p-2.5 space-y-2 mt-2'
                  }`}>
                    {/* Play progress slider bar */}
                    <div className="flex items-center space-x-2">
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-450">{formatVideoTime(videoTime)}</span>
                      <div className="flex-1 bg-slate-800 h-1 rounded-full relative cursor-pointer" 
                           onClick={(e) => {
                             const rect = e.currentTarget.getBoundingClientRect();
                             const pct = (e.clientX - rect.left) / rect.width;
                             const maxSecs = videoWalkthroughMode === 'desktop' ? 225 : 135;
                             setVideoTime(Math.floor(pct * maxSecs));
                           }}>
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-150 relative" style={{ width: `${(videoTime / (videoWalkthroughMode === 'desktop' ? 225 : 135)) * 100}%` }}>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white shadow" />
                        </div>
                      </div>
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-450">{videoWalkthroughMode === 'desktop' ? '03:45' : '02:15'}</span>
                    </div>

                    {/* Controller row buttons */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setIsVideoPlaying(false)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-white cursor-pointer transition-colors"
                        >
                          <Pause className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        </button>
                        {videoWalkthroughMode === 'desktop' && (
                          <div className="flex items-center space-x-1.5">
                            <Volume2 className="h-3.5 w-3.5 text-slate-400" />
                            <div className="w-12 bg-slate-800 h-1 rounded-full overflow-hidden">
                              <div className="bg-slate-400 h-full w-[80%]" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className={`${
                        videoWalkthroughMode === 'mobile' 
                          ? 'text-[6px] px-1 py-0.5' 
                          : 'text-[9px] px-2 py-0.5 border border-emerald-500/15'
                      } font-bold text-emerald-400 uppercase tracking-widest flex items-center bg-emerald-950/60 rounded`}>
                        <span className="w-1 h-1 bg-green-400 rounded-full animate-ping mr-1" /> 
                        {videoWalkthroughMode === 'desktop' ? 'LIVE DESKTOP VIDEO STREAM' : 'LIVE MOBILE STREAM'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION TESTIMONI (Exactly 4 Cards, High-Fidelity Bento Theme) */}
      <section id="section_testimonials" className="py-20 border-t border-slate-200/50 dark:border-slate-800/80 bg-gradient-to-b from-white via-slate-50/20 to-slate-100/40 dark:from-slate-950 dark:via-slate-900/10 dark:to-slate-950">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400">
                PARTNER ADOPTION SATISFACTION
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              {curr.testimonialTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto font-medium leading-relaxed">
              {curr.testimonialSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {curr.testimonialsList.map((test, idx) => (
              <div 
                key={idx} 
                className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-emerald-950/20 p-8 rounded-3xl shadow-md hover:shadow-xl dark:hover:shadow-emerald-900/10 hover:border-emerald-500/30 dark:hover:border-emerald-555/20 hover:-translate-y-1 transition-all duration-300 relative flex flex-col justify-between overflow-hidden group"
              >
                {/* Huge stylized double quote watermark back ornament */}
                <span className="absolute -top-6 -left-2 text-[150px] font-serif font-black text-slate-100 dark:text-slate-950/40 opacity-70 dark:opacity-50 pointer-events-none select-none">
                  “
                </span>
                
                <div className="relative z-10 space-y-4">
                  {/* Testimonial Star Score Line and val Tag */}
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] font-black tracking-widest text-emerald-700 dark:text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/15">
                      {test.val}
                    </span>
                    <div className="text-amber-500 text-xs tracking-wider font-extrabold flex items-center space-x-1">
                      <span>★★★★★</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-650 dark:text-slate-300 italic font-medium leading-relaxed">
                    "{test.text}"
                  </p>
                </div>

                {/* Avatar and user bio card */}
                <div className="relative z-10 flex items-center justify-between mt-8 pt-5 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center space-x-4">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/30 dark:from-emerald-900/40 dark:to-teal-900/30 flex items-center justify-center font-black text-sm text-emerald-600 dark:text-emerald-450 border border-emerald-555/20 dark:border-emerald-500/20 shadow-inner">
                      {test.name.slice(2, 4).toUpperCase() || test.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                        {test.name}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 font-bold dark:text-slate-450 mt-0.5">
                        {test.role}
                      </p>
                    </div>
                  </div>

                  {/* Certified badge stamp */}
                  <span className="hidden sm:inline-block text-[8px] font-extrabold text-emerald-500 tracking-widest uppercase bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                    VERIFIED PARTNER
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION PRICING & SUBSCRIPTION */}
      <section id="section_pricing" className="py-20 border-t border-slate-200/50 dark:border-slate-800/80 bg-gradient-to-b from-slate-100/40 via-white to-slate-50/10 dark:from-slate-950 dark:via-slate-900/5 dark:to-slate-950">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400">
                PREDICTABLE COST FRACTION
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              {curr.pricingTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto font-medium leading-relaxed">
              {curr.pricingSubtitle}
            </p>

            {/* Modern Indicator Badge - Monthly Billing Only */}
            <div className="mt-8 inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-550/20 rounded-2xl select-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
                {language === 'id' ? 'Sistem Pembayaran Bulanan Terjangkau' : 'Flexible Monthly Billing Tiers'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {curr.plans.map((plan, idx) => {
              const activePrice = plan.priceMonthly;
              return (
                <div 
                  key={idx} 
                  className={`bg-white/90 dark:bg-slate-900 border p-8 rounded-3xl relative flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] ${
                    plan.recommended 
                      ? 'border-emerald-500 ring-4 ring-emerald-500/10 md:-translate-y-2 lg:-translate-y-2' 
                      : 'border-slate-205 dark:border-slate-850 shadow-sm'
                  }`}
                >
                  {plan.recommended && (
                    <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[9px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full whitespace-nowrap shadow-md shadow-emerald-500/15">
                      {curr.pricingPopularBadge}
                    </span>
                  )}
                  
                  {/* Wrapping internal components with flex vertical spacer to keep all buttons aligned at exact bottom */}
                  <div className="flex-1 flex flex-col text-left justify-between mb-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-black uppercase text-slate-800 dark:text-white tracking-widest">
                          {plan.name}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-slate-450 dark:text-slate-400 mt-2 leading-relaxed font-semibold">
                          {plan.desc}
                        </p>
                      </div>

                      {/* Display Cost */}
                      <div className="py-4 border-y border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/30 px-4 rounded-2xl">
                        <div className="flex items-baseline space-x-1">
                          <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400">
                            {activePrice}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            / mo
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wider mt-1.5">
                          {language === 'id' ? 'Sesuai volume kloter aktif' : 'Calculated per group schedule'} • {curr.pricingMonthly}
                        </span>
                      </div>

                      {/* Checklist Features */}
                      <div className="space-y-3">
                        <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">AKSES MODUL UTAMA</span>
                        <div className="space-y-2">
                          {curr.pricingChecklist.map((feature, fIdx) => {
                            const isIncluded = plan.features.includes(fIdx);
                            return (
                              <div key={fIdx} className={`flex items-center space-x-2.5 text-xs font-semibold ${isIncluded ? 'text-slate-700 dark:text-slate-200' : 'text-slate-350 dark:text-slate-600 opacity-50'}`}>
                                <div className={`h-4 w-4 rounded-full flex items-center justify-center text-[9px] shrink-0 font-bold ${isIncluded ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-900'}`}>
                                  {isIncluded ? '✓' : '✗'}
                                </div>
                                <span className="truncate">{feature}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Action Button, perfectly sits horizontally aligned with other cards */}
                  <button 
                    onClick={() => navigate('/register')}
                    className={`w-full text-center py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-xs ${
                      plan.recommended 
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-xl shadow-emerald-500/15 hover:scale-[1.02]' 
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-250 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {curr.pricingCta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA CARD */}
      <section className="py-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 border border-emerald-500/30 p-6 sm:p-16 rounded-3xl text-center relative overflow-hidden shadow-2xl">
          
          {/* Elegant Ambient Glowing Backdrops */}
          <div className="absolute -top-12 -right-12 h-64 w-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 h-80 w-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Upper Micro Label */}
          <div className="relative z-10 mb-6">
            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] uppercase font-black tracking-widest text-white dark:text-white">
                TRANSFORM YOUR TRAVEL AGENCY TODAY
              </span>
            </span>
          </div>

          <h2 className="relative z-10 text-2xl sm:text-4xl font-black text-white uppercase tracking-tight max-w-3xl mx-auto leading-tight">
            {curr.ctaBottomTitle}
          </h2>
          
          <p className="relative z-10 mt-4 text-xs sm:text-sm text-emerald-200/80 max-w-2xl mx-auto leading-relaxed font-semibold">
            {curr.ctaBottomSubtitle}
          </p>

          {/* Button groups */}
          <div className="relative z-10 mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-black text-xs uppercase tracking-widest px-10 py-4.5 rounded-2xl transition-all duration-200 text-center cursor-pointer shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.03]"
            >
              {curr.ctaActionRegister}
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold text-xs uppercase tracking-widest px-10 py-4.5 rounded-2xl transition-all duration-200 text-center cursor-pointer"
            >
              {curr.ctaLogin}
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-205 dark:border-slate-805 bg-white dark:bg-slate-950/40 py-12 relative z-10 select-none">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-8 pb-8 border-b border-slate-200/60 dark:border-slate-800">
            {/* Column Brand */}
            <div className="md:col-span-5 text-left space-y-3.5">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
                  🕌
                </div>
                <span className="font-extrabold text-sm tracking-wider uppercase">{curr.workspaceTitle}</span>
              </div>
              <p className="text-xs text-slate-400 font-semibold max-w-sm">
                {curr.footerTagline}
              </p>
              <p className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                © 2026 TRAVELOPS OS. ALL RIGHTS RESERVED.
              </p>
            </div>

            {/* Column Link Navigation list */}
            <div className="md:col-span-4 text-left space-y-3">
              <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">COMPLIANCE & LEGAL PAPERS</span>
              <div className="flex flex-col space-y-2 text-xs">
                <button onClick={() => setActiveLegalModal('privacy')} className="text-left font-bold text-slate-500 hover:text-emerald-500 transition-colors cursor-pointer">
                  {curr.privacyBtn}
                </button>
                <button onClick={() => setActiveLegalModal('terms')} className="text-left font-bold text-slate-500 hover:text-emerald-500 transition-colors cursor-pointer">
                  {curr.termsBtn}
                </button>
                <button onClick={() => setActiveLegalModal('cookies')} className="text-left font-bold text-slate-500 hover:text-emerald-500 transition-colors cursor-pointer">
                  {curr.cookiesBtn}
                </button>
              </div>
            </div>

            {/* Social Media Area */}
            <div className="md:col-span-3 text-left space-y-3">
              <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">SOCIAL MEDIA CONTECH</span>
              <div className="flex flex-wrap gap-2.5">
                {/* Instagram */}
                <a href="https://www.instagram.com/contech.id/" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 rounded-lg text-slate-500 hover:text-emerald-500 transition-colors" title="Instagram">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                {/* Threads */}
                <a href="https://www.threads.com/@contech.id?hl=id" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 rounded-lg text-slate-500 hover:text-emerald-500 transition-colors" title="Threads">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.586 2.001c-5.838 0-10.586 4.793-10.586 10.665s4.748 10.666 10.586 10.666c3.12 0 5.922-1.391 7.828-3.585l-1.637-1.332c-1.464 1.687-3.618 2.753-6.191 2.753-4.636 0-8.423-3.805-8.423-8.502s3.787-8.503 8.423-8.503c4.27 0 7.818 3.224 8.358 7.375-1.025.295-2.074.453-3.151.453-3.616 0-6.551-1.683-6.551-4.996 0-2.316 1.83-4.004 4.549-4.004 2.85 0 5.093 1.839 5.093 5.371 0 5.632-4.57 9.873-10.233 9.873-1.688 0-3.32-.387-4.707-1.12l-1.066 1.84c1.724.914 3.754 1.398 5.773 1.398 6.942 0 12.342-5.32 12.342-12.115 0-6.529-5.187-11.666-11.665-11.666zm-.051 4.01c-1.579 0-2.549.969-2.549 2.115 0 1.637 1.572 2.748 3.861 2.748.749 0 1.48-.088 2.179-.247-.193-2.604-1.684-4.616-3.491-4.616z" />
                  </svg>
                </a>
                {/* X */}
                <a href="https://x.com/contechofficial" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 rounded-lg text-slate-500 hover:text-emerald-500 transition-colors" title="X">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                {/* Facebook */}
                <a href="https://web.facebook.com/contech.id." target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 rounded-lg text-slate-500 hover:text-emerald-500 transition-colors" title="Facebook">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                {/* TikTok */}
                <a href="https://www.tiktok.com/@contech.id" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 rounded-lg text-slate-500 hover:text-emerald-500 transition-colors" title="TikTok">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.59-1-.01 3.82.02 7.64-.02 11.46-.03 1.54-.37 3.12-1.21 4.41-1.22 1.88-3.4 3.08-5.67 3.09-2.73.01-5.4-1.34-6.75-3.71-1.39-2.4-1.35-5.54.1-7.89 1.34-2.18 3.81-3.5 6.4-3.5 1.09-.01 2.19.18 3.21.58V5.05c-1.01-.45-2.12-.61-3.21-.57-1.12.04-2.24.31-3.23.86V1.4c1.1-.48 2.29-.71 3.48-.73 1.25-.03 2.5.01 3.75-.02z" />
                  </svg>
                </a>
                {/* YouTube */}
                <a href="https://www.youtube.com/@contechid1288" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 rounded-lg text-slate-500 hover:text-emerald-500 transition-colors" title="YouTube">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.502a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.502 9.388.502 9.388.502s7.517 0 9.388-.502a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4 mt-4">
            <div className="flex items-center space-x-1.5">
              <span>{curr.creatorText}</span>
              <a href="https://contech.id" target="_blank" rel="noopener noreferrer" className="font-extrabold text-emerald-600 hover:text-emerald-500 underline transition-colors">
                Contech.id
              </a>
            </div>
            <div className="text-[10px] text-slate-500">
              TRAVELOPS ENGINE v2.1 • STABLE RELEASE PORTAL
            </div>
          </div>
        </div>
      </footer>

      {/* FLOAT POPUP TOAST NOTIFIER FOR LIVE DEMO INTERACTION */}
      {activePromoToast && (
        <div className="fixed bottom-5 right-5 bg-slate-900 dark:bg-emerald-900 border border-emerald-500/30 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2.5 z-50 animate-slide-in-up text-xs font-bold font-sans">
          <span className="text-emerald-400 font-extrabold">●</span>
          <span>{activePromoToast}</span>
        </div>
      )}

      {/* LEGAL DOCUMENT MODAL POPUP */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in text-left">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative flex flex-col justify-between max-h-[85vh]">
            
            <button 
              onClick={() => setActiveLegalModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="overflow-y-auto pr-2 mt-2 space-y-4">
              {activeLegalModal === 'privacy' && (
                <>
                  <div className="flex items-center space-x-2 border-b dark:border-slate-800 pb-3">
                    <Shield className="h-5 w-5 text-emerald-500" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{curr.privacyTitle}</h3>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-350 space-y-2 leading-relaxed font-semibold">
                    <p><strong>1. Pengumpulan Informasi (Information Gathering)</strong></p>
                    <p>Kami berkomitmen melindungi privasi data agensi dan detail manifes jemaah. Setiap log paspor, nomor seluler, dan sisa tagihan dienkripsi secara penuh di dalam sekat database terisolasi.</p>
                    <p><strong>2. Batasan Distribusi (Compliance Limits)</strong></p>
                    <p>TravelOps tidak pernah menjual atau mendistribusikan berkas paspor muassasah jemaah kepada pihak ketiga tanpa otorisasi formal mutlak pemegang izin Kemenag RI.</p>
                    <p><strong>3. Keamanan Tingkat Enkripsi (Defense Standard)</strong></p>
                    <p>Setiap manipulasi data bus simulator dan ledger akuntansi per kloter dilindungi sertifikat keamanan HTTPS TLS 1.2 serta cadangan JSON terenkripsi lokal.</p>
                  </div>
                </>
              )}

              {activeLegalModal === 'terms' && (
                <>
                  <div className="flex items-center space-x-2 border-b dark:border-slate-800 pb-3">
                    <Briefcase className="h-5 w-5 text-emerald-500" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{curr.termsTitle}</h3>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-350 space-y-2 leading-relaxed font-semibold">
                    <p><strong>1. Persetujuan Layanan (Portal Agreement)</strong></p>
                    <p>Dengan mendaftarkan agensi di TravelOps OS, Anda menyetujui hak administratif penuh untuk mengatur draf jemaah secara legal sesuai regulasi yang berlaku di Indonesia & Arab Saudi.</p>
                    <p><strong>2. Pembatasan Penggunaan (Volume Ceiling)</strong></p>
                    <p>Masing-masing tingkat lisensi (Lite, Pro, Enterprise) tunduk terhadap volume penampungan kloter aktif, terminal unit admin, dan dukungan white-label.</p>
                    <p><strong>3. Tanggung Jawab Operasional (Liability Limit)</strong></p>
                    <p>Fungsional simulator bus pariwisata adalah murni sarana bantu visual. Penolakan visa dari pihak KBSA Jakarta atau kementerian terkait sepenuhnya merupakan wewenang konsul luar negeri terkait.</p>
                  </div>
                </>
              )}

              {activeLegalModal === 'cookies' && (
                <>
                  <div className="flex items-center space-x-2 border-b dark:border-slate-800 pb-3">
                    <AlertCircle className="h-5 w-5 text-emerald-500" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{curr.cookiesTitle}</h3>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-350 space-y-2 leading-relaxed font-semibold">
                    <p><strong>1. Penggunaan Cookies Taktis (Security Cookie)</strong></p>
                    <p>Sistem menggunakan session cookies melayang untuk menyimpan data penikmat bahasa default (ID/EN) serta token otorisasi portal partner agar login tetap stabil selama operasional berjalan.</p>
                    <p><strong>2. Keamanan Sistem Partner</strong></p>
                    <p>Segala cookies terenkripsi otomatis hancur setiap kali pengguna menekan tombol "Logout" pada sidebar utama demi mencegah pencurian terminal akun.</p>
                    <p><strong>3. Kepatuhan Sandbox (Compliance Seal)</strong></p>
                    <p>Mematuhi peraturan keamanan digital internasional GDPR & UU Perlindungan Data Pribadi (UU PDP) Indonesia secara berkala.</p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveLegalModal(null)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl cursor-pointer"
              >
                {curr.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Landing;
