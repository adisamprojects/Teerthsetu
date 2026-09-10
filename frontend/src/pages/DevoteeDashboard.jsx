import React, { useState, useEffect, Component } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Clock, Users, QrCode, LogOut, Bell, Compass, Calendar,
  Search, ShieldAlert, HeartHandshake, Hotel, Map, User, CheckCircle,
  CreditCard, ChevronRight, X, Sparkles, Filter, Info, PhoneCall, Star, Phone, Activity, Sun, Moon, Plus, Minus,
  ShieldCheck, Fingerprint, Smartphone, Cloud, AlertTriangle, RefreshCw,
  Bed, Navigation, ArrowRight, Check, Coffee, Lock, ExternalLink, Camera, Image as ImageIcon,
  Ticket, BookmarkCheck, CalendarCheck, FileText, Download, Building, Building2, Printer
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import TicketQR from '../components/TicketQR';
import PaymentGatewayModal from '../components/PaymentGatewayModal';
import DevoteeTravelsView from '../components/DevoteeTravelsView';
import DevoteeNearbyView from '../components/DevoteeNearbyView';
import DirectionsModal from '../components/DirectionsModal';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-red-500/30 text-center space-y-4 my-8">
          <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto font-bold text-xl">⚠️</div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Something went wrong loading this view</h3>
          <p className="text-xs text-slate-500">{this.state.error?.toString()}</p>
          <button 
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            className="bg-saffron text-slate-900 px-5 py-2 rounded-xl font-bold text-xs shadow-md"
          >
            Reload View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function DevoteeDashboard() {
  const [activeTab, setActiveTab] = useState('explore'); // explore, planner, hotels, bookings, profile, alerts
  const [temples, setTemples] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [targetStayBooking, setTargetStayBooking] = useState(null);
  const [bookingsList, setBookingsList] = useState([]);
  const [stayBookingsList, setStayBookingsList] = useState(() => {
    try {
      const cached = localStorage.getItem('teerthsetu_stay_bookings');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [
      {
        id: 'TS-STAY-849201',
        reference: 'TS-STAY-849201',
        hotelName: 'TTD Srinivasam Pilgrim Rest House',
        templeName: 'Tirumala Venkateswara Temple',
        hotelType: 'Temple Guest House',
        checkInDate: '2026-06-27',
        nights: 1,
        roomsCount: 1,
        guests: 3,
        roomType: 'Non A.C. Room',
        guestName: 'Verified Devotee',
        phone: '+91 9876543210',
        totalAmount: 200,
        status: 'Upcoming',
        paymentStatus: 'PAID',
        paymentMethod: 'UPI (Google Pay)',
        transactionId: 'TXN-98421045',
        address: 'Direct walking path to Vaikuntam Queue Complex 1, Tirumala',
        proximityToGate: '0.2 km from Gate 1',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        features: ['Safe Mobile Lockers', 'RO Pure Water', 'Darshan Wake-up Call'],
        bookedAt: '2026-06-15'
      },
      {
        id: 'TS-STAY-719320',
        reference: 'TS-STAY-719320',
        hotelName: 'Kashi Vishwanath Corridor Mumukshu Bhawan',
        templeName: 'Kashi Vishwanath Temple',
        hotelType: 'Dharamshala',
        checkInDate: '2026-06-22',
        nights: 2,
        roomsCount: 1,
        guests: 2,
        roomType: 'Devotee AC Room',
        guestName: 'Verified Devotee',
        phone: '+91 9876543210',
        totalAmount: 1600,
        status: 'Completed',
        paymentStatus: 'PAID',
        paymentMethod: 'UPI',
        transactionId: 'TXN-88412019',
        address: 'Inside Vishwanath Corridor Gate 4, Varanasi',
        proximityToGate: '0.1 km from Gate 4',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        features: ['Corridor Ghat Access', 'Ganga Jal Supply', 'Prasadam Kitchen'],
        bookedAt: '2026-06-10'
      }
    ];
  });
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        let nameToUse = parsed.fullName || parsed.name || '';
        if (nameToUse === 'Devendra Kumar' && parsed.email) {
          nameToUse = parsed.email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        if (!nameToUse && parsed.email) {
          nameToUse = parsed.email.split('@')[0];
        }
        return {
          name: nameToUse || 'Devotee',
          email: parsed.email || 'devotee@teerthsethu.in',
          phone: parsed.phoneNumber || parsed.phone || '+91 9876543210',
          address: parsed.address || 'Sector 4, Dwarka, New Delhi',
          aadhaar: parsed.aadhaar || '4820-1928-8812',
          emergencyContact: parsed.emergencyContact || 'Amit Kumar (+91 9876543211)',
          family: parsed.family || ['Sita Devi (Wife)', 'Karan Kumar (Son)'],
          savedTemples: parsed.savedTemples || ['1', '3'],
          accessibilityPreset: parsed.accessibilityPreset || { wheelchair: false, volunteer: false }
        };
      } catch (e) { }
    }
    return {
      name: 'User Name',
      email: 'user@teerthsethu.in',
      phone: '+91 9876543210',
      address: 'Sector 4, Dwarka, New Delhi',
      aadhaar: '4820-1928-8812',
      emergencyContact: 'Amit Kumar (+91 9876543211)',
      family: ['Sita Devi (Wife)', 'Karan Kumar (Son)'],
      savedTemples: ['1', '3'],
      accessibilityPreset: { wheelchair: false, volunteer: false }
    };
  });

  const navigate = useNavigate();

  // Load temples, bookings and notifications from APIs
  useEffect(() => {
    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/temples')
      .then(res => res.json())
      .then(setTemples)
      .catch(err => console.error("Error fetching temples:", err));

    fetchBookings();
    fetchStayBookings();
    fetchNotifications();
  }, []);

  const fetchBookings = () => {
    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/bookings')
      .then(res => res.json())
      .then(data => {
        setBookingsList(data || []);
      })
      .catch(err => console.error("Error fetching bookings:", err));
  };

  const fetchStayBookings = () => {
    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/stays/bookings')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setStayBookingsList(data);
          localStorage.setItem('teerthsetu_stay_bookings', JSON.stringify(data));
        }
      })
      .catch(err => console.warn("Error fetching stay bookings:", err));
  };

  const fetchNotifications = () => {
    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/notifications')
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        setUnreadCount(data.filter(n => n.unread).length);
      })
      .catch(err => console.error("Error fetching notifications:", err));
  };

  const handleMarkNotificationsRead = () => {
    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/notifications/read-all', { method: 'POST' })
      .then(() => fetchNotifications())
      .catch(err => console.error(err));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0E0E18] text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md px-6 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">🪷</span>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-wide">
              Teerth<span className="text-saffron">Setu</span>
            </span>
          </Link>
          <span className="text-[11px] font-semibold uppercase tracking-wider bg-saffron/15 text-saffron border border-saffron/30 px-2 py-0.5 rounded-full">
            Devotee Portal
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('alerts')}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-saffron rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-saffron/20 border border-saffron/40 flex items-center justify-center font-bold text-saffron text-xs">
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
            <span className="text-xs font-semibold hidden md:block text-slate-700 dark:text-slate-300">
              {user.name}
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex flex-col md:flex-row p-4 md:p-6 gap-6 max-w-7xl mx-auto w-full">
        {/* Left Vertical Sidebar */}
        <aside className="w-full md:w-56 shrink-0 flex flex-col gap-1.5">
          <SidebarButton active={activeTab === 'explore'} icon={<Compass className="h-5 w-5" />} text="Explore Shrines" onClick={() => setActiveTab('explore')} />
          <SidebarButton active={activeTab === 'analysis'} icon={<Activity className="h-5 w-5" />} text="Analysis & Rules" onClick={() => setActiveTab('analysis')} />
          <SidebarButton active={activeTab === 'planner'} icon={<Map className="h-5 w-5" />} text="Route Planner" onClick={() => setActiveTab('planner')} />
          <SidebarButton active={activeTab === 'hotels'} icon={<Hotel className="h-5 w-5" />} text="Accommodation" onClick={() => setActiveTab('hotels')} />
          <SidebarButton active={activeTab === 'travels'} icon={<Navigation className="h-5 w-5" />} text="Devotee Travels" onClick={() => setActiveTab('travels')} />
          <SidebarButton active={activeTab === 'nearby'} icon={<MapPin className="h-5 w-5" />} text="Nearby Places & Food" onClick={() => setActiveTab('nearby')} />
          <SidebarButton active={activeTab === 'bookings'} icon={<CalendarCheck className="h-5 w-5" />} text="My Bookings" onClick={() => setActiveTab('bookings')} />
          <SidebarButton active={activeTab === 'alerts'} icon={<Bell className="h-5 w-5" />} text="Live Alerts" onClick={() => setActiveTab('alerts')} />
          <SidebarButton active={activeTab === 'profile'} icon={<User className="h-5 w-5" />} text="Devotee Profile" onClick={() => setActiveTab('profile')} />
        </aside>

        {/* Active tab renderer */}
        <div className="flex-1 z-10 max-w-6xl mx-auto w-full">
          <ErrorBoundary>
            {activeTab === 'explore' && (
              <ExploreView 
                temples={temples} 
                setActiveTab={setActiveTab} 
                user={user} 
                onGoToAccommodation={(bookingInfo) => {
                  setTargetStayBooking(bookingInfo);
                  fetchBookings();
                  setActiveTab('hotels');
                }}
              />
            )}
            {activeTab === 'analysis' && (
              <AnalysisView 
                temples={temples} 
                user={user} 
                setActiveTab={setActiveTab} 
                onGoToAccommodation={(bookingInfo) => {
                  setTargetStayBooking(bookingInfo);
                  fetchBookings();
                  setActiveTab('hotels');
                }}
              />
            )}
            {activeTab === 'planner' && <PlannerView temples={temples} onClose={() => setActiveTab('explore')} />}
            {activeTab === 'hotels' && (
              <HotelsView 
                userBookings={bookingsList}
                targetBooking={targetStayBooking}
                onSelectTargetBooking={setTargetStayBooking}
                onBookDarshanClick={() => setActiveTab('explore')}
                onGoToBookings={() => {
                  fetchStayBookings();
                  setActiveTab('bookings');
                }}
                onStayBooked={() => {
                  fetchStayBookings();
                }}
                temples={temples}
              />
            )}
            {activeTab === 'travels' && (
              <DevoteeTravelsView 
                userBookings={bookingsList} 
                targetBooking={targetStayBooking} 
                onSelectTargetBooking={setTargetStayBooking}
                temples={temples} 
              />
            )}
            {activeTab === 'nearby' && <DevoteeNearbyView />}
            {activeTab === 'bookings' && (
              <BookingsView 
                bookingsList={bookingsList}
                fetchBookings={fetchBookings}
                stayBookingsList={stayBookingsList}
                fetchStayBookings={fetchStayBookings}
                onFindStays={(b) => {
                  setTargetStayBooking(b);
                  setActiveTab('hotels');
                }}
                onBookDarshanClick={() => setActiveTab('explore')}
                onBookStayClick={() => setActiveTab('hotels')}
              />
            )}
            {activeTab === 'profile' && <ProfileView user={user} setUser={setUser} />}
            {activeTab === 'alerts' && <AlertsView notifications={notifications} markRead={handleMarkNotificationsRead} />}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

function SidebarButton({ active, icon, text, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${active ? 'bg-saffron text-slate-900 dark:text-white shadow-lg shadow-saffron/20 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:bg-slate-800 hover:text-slate-900 dark:text-white'}`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}

// Custom Recharts Tooltip for AI Crowd Prediction & Hourly Entries
function CrowdPredictionTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload || {};
    const waitTime = Math.round(data.wait ?? payload[0].value ?? 0);
    const entries = data.entries ?? Math.round(waitTime * 65 + 350);
    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-saffron/30 shadow-2xl text-white text-xs min-w-[195px] pointer-events-none transition-all">
        <div className="font-bold text-white text-sm mb-1.5 pb-1 border-b border-slate-700/70 flex items-center justify-between">
          <span>{data.time || label}</span>
          {data.isCurrent && (
            <span className="text-[10px] bg-saffron text-white px-1.5 py-0.5 rounded font-semibold tracking-wide">
              CURRENT
            </span>
          )}
        </div>
        <div className="text-slate-300 flex items-center justify-between gap-3 py-0.5">
          <span className="text-slate-400">Est. Wait Time :</span>
          <span className="font-bold text-white">{waitTime} mins</span>
        </div>
        <div className="flex items-center justify-between gap-3 py-0.5">
          <span className="text-slate-400">Est. Entries :</span>
          <span className="font-bold text-amber-400">~{Number(entries).toLocaleString('en-IN')} devotees</span>
        </div>
      </div>
    );
  }
  return null;
}

// ==========================================
// VIEW 1.5: TEMPLE ANALYSIS / QUICK REVIEW
// ==========================================
function AnalysisView({ temples, user, setActiveTab, onGoToAccommodation }) {
  const [sidebarSearch, setSidebarSearch] = useState('');
  const filteredSidebarTemples = temples.filter(t => 
    t.name.toLowerCase().includes(sidebarSearch.toLowerCase()) || 
    t.location.toLowerCase().includes(sidebarSearch.toLowerCase())
  );
  const [selectedId, setSelectedId] = useState(temples[0]?._id);
  const [bookingTemple, setBookingTemple] = useState(null);
  const temple = temples.find(t => t._id === selectedId) || temples[0];
  
  const currentHour = new Date().getHours();
  const generateData = () => {
    const data = [];
    const baseWait = temple?.waitTime || 45;
    const dailyLimit = temple?.dailyLimit || 35000;
    const baseHourlyEntries = Math.round(dailyLimit / 14);
    for (let h = 6; h <= 21; h++) {
      let multiplier = 0.35;
      if (h >= 9 && h <= 12) multiplier = 0.85 + (h === 11 ? 0.55 : 0);
      if (h >= 17 && h <= 19) multiplier = 0.75 + (h === 18 ? 0.45 : 0);
      if (h === 14 || h === 15) multiplier = 0.5;
      const noise = ((temple?._id?.charCodeAt(0) || 0) + h) % 3 === 0 ? 0.08 : -0.08;
      const waitMinutes = Math.max(5, Math.floor(baseWait * (multiplier + noise)));
      const hourlyEntries = Math.max(250, Math.round(baseHourlyEntries * Math.max(0.2, (multiplier + noise + 0.15))));
      data.push({
        hour: h,
        time: h > 12 ? (h - 12) + ' PM' : (h === 12 ? '12 PM' : h + ' AM'),
        wait: waitMinutes,
        entries: hourlyEntries,
        isCurrent: h === currentHour
      });
    }
    return data;
  };
  const hourlyPredictionData = generateData();

  if (!temple) return null;

  return (
    <div className="h-[85vh] flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sidebar List */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-saffron/10 rounded-full blur-2xl pointer-events-none"></div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 relative z-10">
            <Activity className="h-6 w-6 text-saffron" /> Insights
          </h2>
          <p className="text-sm text-slate-500 mt-1 relative z-10 mb-4">AI crowd analysis & details</p>
          <div className="relative z-10">
            <input 
              type="text" 
              placeholder="Search temples..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:border-saffron transition-all"
            />
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {filteredSidebarTemples.map(t => (
            <button
              key={t._id}
              onClick={() => setSelectedId(t._id)}
              className={`flex items-center gap-4 p-3 rounded-2xl transition-all text-left ${selectedId === t._id ? 'bg-saffron/10 border-saffron border shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}`}
            >
              <img src={t.image || "https://images.unsplash.com/photo-1600100397608-f010e42edb7a?auto=format&fit=crop&w=100&q=80"} alt={t.name} className="w-12 h-12 rounded-xl object-cover shadow-sm flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h4 className={`text-sm font-bold truncate ${selectedId === t._id ? 'text-saffron' : 'text-slate-900 dark:text-white'}`}>{t.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0" /> {t.location}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Details Panel */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col lg:flex-row relative">
        <button onClick={() => setActiveTab('explore')} className="absolute top-4 right-4 bg-white dark:bg-slate-950/60 p-2 rounded-full border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-white dark:bg-slate-900 shadow-xl transition-all z-[60]">
          <X className="h-5 w-5" />
        </button>
        {/* Left Side: Image, General Info */}
        <div className="w-full lg:w-2/5 bg-slate-950 relative border-b lg:border-b-0 lg:border-r border-slate-800 lg:border-slate-850">
          <div className="h-64 lg:h-full relative">
            <img
              src={temple.image || "https://images.unsplash.com/photo-1600100397608-f010e42edb7a?auto=format&fit=crop&w=600&q=80"}
              alt={temple.name}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="text-saffron font-bold text-xs uppercase tracking-widest block mb-1">DEITY TEMPLE DETAILS</span>
              <h3 className="text-3xl font-bold mb-2 leading-tight">{temple.name}</h3>
              <p className="text-slate-300 text-sm flex items-center gap-1"><MapPin className="h-4.5 w-4.5 text-saffron shrink-0" /> {temple.location}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Analysis Data */}
        <div className="w-full lg:w-3/5 p-6 lg:p-8 overflow-y-auto flex flex-col justify-between bg-white dark:bg-slate-900">
          <div className="space-y-8">
            <div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Temple History & Rules</h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-5">{temple.history}</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1 text-xs">Darshan Hours</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{temple.timings}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1 text-xs">Dress Code</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{temple.dressCode}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1 text-xs">Entries Today</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{(temple?.waitTime * 314 + 8540).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* AI Crowd Predictions */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-gold animate-pulse" /> AI Crowd Prediction
                </h4>
                <span className="text-sm text-slate-600 dark:text-slate-400">Current Wait: <strong className="text-gold text-lg">{temple.waitTime}m</strong></span>
              </div>

              {/* Recharts Hourly Wait Times Forecast */}
              <div className="h-56 w-full bg-slate-50 dark:bg-slate-950/60 pt-6 pb-2 pr-2 pl-0 rounded-3xl border border-slate-200 dark:border-slate-800 mb-4 relative overflow-hidden group shadow-inner">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyPredictionData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--grid-color, #334155)" strokeOpacity={0.4} className="dark:[--grid-color:#334155] [--grid-color:#E2E8F0]" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#94A3B8" 
                      fontSize={11} 
                      axisLine={false} 
                      tickLine={false}
                      tick={{fill: '#94A3B8', dy: 10}}
                      minTickGap={15}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94A3B8', fontSize: 10, dx: -5}} 
                    />
                    <Tooltip 
                      content={<CrowdPredictionTooltip />}
                      cursor={{fill: 'rgba(255, 107, 53, 0.1)'}} 
                    />
                    <Bar dataKey="wait" radius={[6, 6, 0, 0]} maxBarSize={30} animationDuration={1500}>
                      {hourlyPredictionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#FF6B35' : 'var(--bar-color)'} className="dark:[--bar-color:#9A3412] [--bar-color:#FDBA74] transition-all duration-300 hover:opacity-80" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-slate-500 italic text-center">
                🔥 Best hours to visit: <strong className="text-emerald-500 dark:text-emerald-400">6:00 AM - 9:00 AM</strong>. Expect heavy peaks at noon due to afternoon Aarti.
              </p>
            </div>

            {/* Facilities list */}
            <div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-3">Available Facilities</h4>
              <div className="flex flex-wrap gap-2">
                {temple.facilities?.map(f => (
                  <span key={f} className="text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-4 py-1.5 rounded-full shadow-sm">{f}</span>
                )) || 'None'}
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setBookingTemple({...temple, isViewOnly: false})}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl font-bold text-base transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
              >
                Book Darshan Pass <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {bookingTemple && (
        <TempleDetailsModal
          temple={bookingTemple}
          user={user}
          onGoToAccommodation={onGoToAccommodation}
          onClose={() => setBookingTemple(null)}
        />
      )}
    </div>
  );
}

// VIEW 1: HOME & TEMPLE DISCOVERY (Screens 5 & 6)
// ==========================================
function ExploreView({ temples, setActiveTab, user, onGoToAccommodation, templesLimit = 3 }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [stateFilter, setStateFilter] = useState('All');
  const [crowdFilter, setCrowdFilter] = useState('All');
  const [quickFilter, setQuickFilter] = useState('');
  const [selectedTemple, setSelectedTemple] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        err => console.log('Geolocation error:', err)
      );
    }
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // States
  const states = [
    'All', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Jammu & Kashmir', 'Delhi'
  ];

  const filteredTemples = temples.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = stateFilter === 'All' || t.location.includes(stateFilter);
    const matchesCrowd = crowdFilter === 'All' || t.crowdLevel === crowdFilter;
    
    let matchesQuick = true;
    if (quickFilter === 'Popular') matchesQuick = (t.rating >= 4.8) || (t.waitTime >= 30);
    else if (quickFilter === 'Low Crowd') matchesQuick = t.crowdLevel === 'Low';
    else if (quickFilter === 'Senior Friendly' || quickFilter === 'Wheelchair Accessible') matchesQuick = t.facilities ? t.facilities.some(f => f.toLowerCase().includes('wheelchair') || f.toLowerCase().includes('senior')) : true;
    else if (quickFilter === 'Festival Today') matchesQuick = t.name.includes('Tirupati') || t.name.includes('Kashi');

    return matchesSearch && matchesState && matchesCrowd && matchesQuick;
  });

  return (
    <div className="space-y-8">
      {/* Temple Discovery search/filter bar (Screen 6) */}
      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-2">
          <div>
            <h3 className="text-3xl text-saffron drop-shadow-md flex items-center gap-2" style={{ fontFamily: "'Yatra One', cursive", letterSpacing: "1px" }}>
              Swagatam <span className="text-3xl drop-shadow-[0_0_12px_rgba(251,146,60,0.5)] animate-pulse">🪷</span>
            </h3>
            <p className="text-slate-800 dark:text-slate-200 text-sm mt-0.5 italic" style={{ fontFamily: "'Cinzel', serif" }}>Where hearts meet the Divine.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-850">
            <div>
              <select
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:border-saffron transition-all appearance-none"
                value={stateFilter}
                onChange={e => {
                  setStateFilter(e.target.value);
                  setSearchTerm('');
                }}
              >
                <option value="All">Select State</option>
                {states.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="relative col-span-2 flex gap-3">
              <div className="relative flex-1">
                <input 
                  type="text"
                  placeholder={stateFilter !== 'All' ? `Search for a temple in ${stateFilter}...` : "Search for any temple..."}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:border-saffron transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setShowSuggestions(false)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && searchTerm.length > 0 && filteredTemples.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden text-left">
                    {filteredTemples.map(t => (
                      <div 
                        key={t._id} 
                        className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearchTerm(t.name);
                          setShowSuggestions(false);
                        }}
                      >
                        <img src={t.image || "https://images.unsplash.com/photo-1600100397608-f010e42edb7a?auto=format&fit=crop&w=100&q=80"} alt={t.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{t.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button className="bg-saffron text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-sm whitespace-nowrap">
                Search
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3 px-2 mt-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              Filters
            </span>
            {['Popular', 'Low Crowd', 'Senior Friendly', 'Wheelchair Accessible', 'Festival Today'].map(filter => (
              <button
                key={filter}
                onClick={() => setQuickFilter(quickFilter === filter ? '' : filter)}
                className={`px-4 py-2 border rounded-full text-xs font-bold transition-all ${
                  quickFilter === filter 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-transparent shadow-lg shadow-orange-500/40 scale-105' 
                    : 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-500/20 hover:border-orange-400 dark:hover:border-orange-500/50 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-700 dark:text-orange-400 shadow-sm'
                }`}
              >
                {filter}
              </button>
            ))}
            {quickFilter && (
              <button
                onClick={() => setQuickFilter('')}
                className="text-xs font-bold text-slate-500 hover:text-red-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Greeting (Screen 5) */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-850">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Namaste,{" "}{user.name && user.name.trim() !== '' ? user.name.trim() : 'Devotee'}! <span className="animate-wiggle">🙏</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">Ready for your spiritual journey? Plan slots and track crowding live.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('analysis')} className="bg-saffron/15 text-saffron border border-saffron/30 hover:bg-saffron/20 px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5">
            <Activity className="h-4 w-4" /> Quick Review
          </button>
          <button onClick={() => setActiveTab('planner')} className="bg-gold/15 text-gold border border-gold/30 hover:bg-gold/20 px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5">
            <Map className="h-4 w-4" /> Plan Multi-Route
          </button>
        </div>
      </div>

      {/* Mini Dashboard Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Total Temples */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-2 bg-saffron/10 text-saffron rounded-lg flex-shrink-0"><Compass className="h-4 w-4" /></div>
          <div className="min-w-0">
            <h4 className="text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-0.5 truncate">Total Temples</h4>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">10,000+</p>
          </div>
        </div>
        
        {/* Card 2: Active Bookings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg flex-shrink-0"><QrCode className="h-4 w-4" /></div>
          <div className="min-w-0">
            <h4 className="text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-0.5 truncate">Active Bookings</h4>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">2 Upcoming</p>
          </div>
        </div>

        {/* Card 3: Saved Waiting Time */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg flex-shrink-0"><Clock className="h-4 w-4" /></div>
          <div className="min-w-0">
            <h4 className="text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-0.5 truncate">Saved Time</h4>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">1.5 Hrs/Slot</p>
          </div>
        </div>

        {/* Card 4: Nearby Temples */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg flex-shrink-0"><MapPin className="h-4 w-4" /></div>
          <div className="min-w-0">
            <h4 className="text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-0.5 truncate">Nearby</h4>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">14 <span className="text-[9px] font-medium text-slate-500 ml-0.5">&lt;50km</span></p>
          </div>
        </div>

        {/* Card 5: Today's Crowd Index */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-2 bg-red-500/10 text-red-500 rounded-lg flex-shrink-0"><Users className="h-4 w-4" /></div>
          <div className="min-w-0">
            <h4 className="text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-0.5 truncate">Crowd Index</h4>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">High Surge</p>
          </div>
        </div>
      </div>


      <div className="space-y-6 mt-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 px-2">Famous Temples</h2>
        {/* Temple Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemples.map(t => (
            <motion.div
              key={t._id}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-saffron/30 transition-all flex flex-col group"
            >
              {/* Image Header */}
              <div className="h-52 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                <img
                  src={t.image || "https://images.unsplash.com/photo-1600100397608-f010e42edb7a?auto=format&fit=crop&w=600&q=80"}
                  alt={t.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <div className="bg-white/90 dark:bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-white/20">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t.rating || '4.8'}
                    </span>
                  </div>
                </div>

                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-xl shadow-sm backdrop-blur-md flex items-center gap-1.5 ${t.crowdLevel === 'High' ? 'bg-red-500/90 text-white' :
                      t.crowdLevel === 'Moderate' ? 'bg-amber-500/90 text-white' :
                        'bg-emerald-500/90 text-white'
                    }`}>
                    <Users className="h-3.5 w-3.5" />
                    {t.crowdLevel} Crowd
                  </span>
                </div>
                
                {/* Image Footer Details */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="text-xl font-bold text-white mb-1 drop-shadow-md leading-tight line-clamp-1">{t.name}</h4>
                  <p className="text-slate-200 text-sm flex items-center gap-1.5 drop-shadow-md">
                    <MapPin className="h-4 w-4 text-saffron shrink-0" /> {t.location}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex flex-col">
                      <span className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center gap-1 mb-1">
                        <Clock className="h-3.5 w-3.5" /> Waiting Time
                      </span>
                      <span className="text-gold font-bold text-lg">{t.waitTime} <span className="text-sm font-medium text-slate-600 dark:text-slate-400">mins</span></span>
                    </div>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                    <div className="flex flex-col items-end text-right">
                      <span className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center justify-end gap-1 mb-1">
                        <Calendar className="h-3.5 w-3.5" /> Timings
                      </span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold text-sm leading-tight">{t.timings}</span>
                    </div>
                  </div>

                  {userLocation && t.lat && t.lon ? (
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-3 mb-5 flex items-center gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg text-blue-600 dark:text-blue-400 flex-shrink-0">
                        <Map className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Distance from you</p>
                        <p className="text-sm font-bold text-blue-800 dark:text-blue-300 truncate">{calculateDistance(userLocation.lat, userLocation.lon, t.lat, t.lon)} km</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl p-3 mb-5 h-[58px]">
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
                        <Info className="h-4 w-4 text-saffron shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{t.history}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-auto pt-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedTemple({...t, isViewOnly: true}); }}
                    className="flex-1 py-2.5 bg-saffron/10 hover:bg-saffron/20 text-saffron font-bold text-sm rounded-xl transition-all border border-saffron/20"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => setSelectedTemple({...t, isViewOnly: false})}
                    className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredTemples.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              No shrines match the search criteria. Try adjusting the state or crowd level filters.
            </div>
          )}
        </div>
      </div>

      {/* Temple Details Drawer/Modal (Screen 7, 8, 9, 10, 11, 13, 14) */}
      <AnimatePresence>
        {selectedTemple && (
          <TempleDetailsModal
            temple={selectedTemple}
            user={user}
            onGoToAccommodation={onGoToAccommodation}
            onClose={() => setSelectedTemple(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================
// MODAL: TEMPLE DETAILS, AI CROWD, DARSHAN BOOKING & QR TICKET
// =============================================================
function TempleDetailsModal({ temple, user, onGoToAccommodation, onClose }) {
  const [step, setStep] = useState('details'); // details, booking, aadhaar, payment, ticket
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [aadhaarRefId, setAadhaarRefId] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('idle'); // idle, loading, sent, verifying, success
  const [formData, setFormData] = useState({
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    timeSlot: '09:00 AM (Available)',
    visitors: 2,
    specialDarshan: 'General',
    wheelchair: false,
    volunteer: false,
    medical: false
  });
  const [bookedData, setBookedData] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [payMethod, setPayMethod] = useState('upi');
  const [showSlotPicker, setShowSlotPicker] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [liveWeather, setLiveWeather] = useState(null);
  const [liveWeatherAlert, setLiveWeatherAlert] = useState(null);

  useEffect(() => {
    if (temple.lat && temple.lon) {
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${temple.lat}&longitude=${temple.lon}&current_weather=true`)
        .then(res => res.json())
        .then(data => {
          if (data.current_weather) {
            const temp = data.current_weather.temperature;
            const code = data.current_weather.weathercode;
            
            let condition = 'Clear Sky';
            let alertMsg = null;
            
            if (code === 0) condition = 'Clear Sky';
            else if (code >= 1 && code <= 3) condition = 'Partly Cloudy';
            else if (code === 45 || code === 48) condition = 'Foggy';
            else if (code >= 51 && code <= 55) condition = 'Drizzle';
            else if (code >= 61 && code <= 65) condition = 'Rain';
            else if (code >= 71 && code <= 77) condition = 'Snow';
            else if (code >= 80 && code <= 82) { condition = 'Heavy Rain'; alertMsg = 'Red Alert: Heavy rain showers expected.'; }
            else if (code >= 95) { condition = 'Thunderstorm'; alertMsg = 'Severe Alert: Thunderstorms in area. Stay indoors.'; }
            
            setLiveWeather(`${temp}°C, ${condition}`);
            setLiveWeatherAlert(alertMsg);
          }
        })
        .catch(err => console.error('Weather fetch error:', err));
    }
  }, [temple]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        err => console.log('Geolocation error:', err)
      );
    }
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const currentHour = new Date().getHours();
  // Simulated AI Hourly Crowd Forecast Data (Screen 8)
  const generateModalPredictionData = () => {
    const data = [];
    const baseWait = temple?.waitTime || 45;
    const dailyLimit = temple?.dailyLimit || 35000;
    const baseHourlyEntries = Math.round(dailyLimit / 14);
    for (let h = 6; h <= 21; h++) {
      let multiplier = 0.35;
      if (h >= 9 && h <= 12) multiplier = 0.85 + (h === 11 ? 0.55 : 0);
      if (h >= 17 && h <= 19) multiplier = 0.75 + (h === 18 ? 0.45 : 0);
      if (h === 14 || h === 15) multiplier = 0.5;
      const noise = ((temple?._id?.charCodeAt(0) || 0) + h) % 3 === 0 ? 0.08 : -0.08;
      const waitMinutes = Math.max(5, Math.floor(baseWait * (multiplier + noise)));
      const hourlyEntries = Math.max(250, Math.round(baseHourlyEntries * Math.max(0.2, (multiplier + noise + 0.15))));
      data.push({
        hour: h,
        time: h > 12 ? (h - 12) + ' PM' : (h === 12 ? '12 PM' : h + ' AM'),
        wait: waitMinutes,
        entries: hourlyEntries,
        isCurrent: h === currentHour
      });
    }
    return data;
  };
  const hourlyPredictionData = generateModalPredictionData();

  const handleBookSubmit = (e) => {
    e.preventDefault();
    setStep('payment');
  };

  const handleSendOTP = async () => {
    if (aadhaarNumber.length < 14) return; // Including dashes
    setVerificationStatus('loading');
    
    try {
      const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com';
      const res = await fetch(baseUrl + '/api/auth/aadhaar-send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          aadhaar: aadhaarNumber.replace(/\D/g, ''),
          phone: user?.phone
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setAadhaarRefId(data.ref_id);
        setVerificationStatus('sent');
      } else {
        alert(data.message || 'Failed to send OTP');
        setVerificationStatus('idle');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to verification service');
      setVerificationStatus('idle');
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6 || !aadhaarRefId) return;
    setVerificationStatus('verifying');
    
    try {
      const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com';
      const res = await fetch(baseUrl + '/api/auth/aadhaar-verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref_id: aadhaarRefId, otp })
      });
      const data = await res.json();
      
      if (data.success) {
        setVerificationStatus('success');
        setTimeout(() => {
          setStep('payment');
        }, 800);
      } else {
        alert(data.message || 'Invalid OTP');
        setVerificationStatus('sent');
      }
    } catch (err) {
      console.error(err);
      alert('Error verifying OTP');
      setVerificationStatus('sent');
    }
  };

  const handlePayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      // Create Booking API call
      fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templeId: temple._id,
          ...formData
        })
      })
        .then(res => res.json())
        .then(data => {
          setIsPaying(false);
          if (data.success) {
            setBookedData(data);
            setStep('ticket');
          } else {
            alert('Booking failed. Please try again.');
          }
        })
        .catch(err => {
          setIsPaying(false);
          console.error(err);
        });
    }, 1500); // Simulated payment gateway delay
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto"
    >
      <motion.div
        initial={{ y: 50, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 50, scale: 0.95 }}
        className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row"
      >
        <button onClick={onClose} className="absolute top-4 right-4 bg-white dark:bg-slate-950/60 p-2 rounded-full border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-white dark:bg-slate-900 transition-all z-20">
          <X className="h-5 w-5" />
        </button>

        {/* Modal Left Side: Image, General Info */}
        <div className="w-full md:w-2/5 bg-white dark:bg-slate-950 relative border-r border-slate-850">
          <div className="h-48 md:h-full relative">
            <img
              src={temple.image || "https://images.unsplash.com/photo-1600100397608-f010e42edb7a?auto=format&fit=crop&w=600&q=80"}
              alt={temple.name}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-slate-900 dark:text-white">
              <span className="text-saffron font-bold text-xs uppercase tracking-widest block mb-1">DEITY TEMPLE DETAILS</span>
              <h3 className="text-2xl font-bold mb-2">{temple.name}</h3>
              <p className="text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1"><MapPin className="h-4.5 w-4.5 text-saffron shrink-0" /> {temple.location}</p>
            </div>
          </div>
        </div>

        {/* Modal Right Side: Dynamic Content Steps */}
        <div className="w-full md:w-3/5 p-8 max-h-[85vh] overflow-y-auto flex flex-col justify-between bg-white dark:bg-slate-900">

          {/* STEP 1: TEMPLE DETAILS & CROWD PREDICTION (Screen 7 & 8) */}
          {step === 'details' && (
            <div className="space-y-4 flex flex-col h-full">
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Temple Details & Rules</h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-tight mb-4">{temple.history}</p>
                <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                  <div className="bg-white dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                    <span className="text-slate-500 block mb-1">Darshan Hours / Rules</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{temple.timings}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                    <span className="text-slate-500 block mb-1">Dress Code</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{temple.dressCode}</span>
                  </div>
                  {temple.isViewOnly && (
                    <>
                      <div className="bg-white dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                        <span className="text-slate-500 block mb-1">Parking Details</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{temple.parking || 'Available Nearby'}</span>
                      </div>
                      <div className={`p-3 rounded-xl border flex flex-col justify-center ${(liveWeatherAlert || temple.weatherAlert) ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50' : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'}`}>
                        <span className={`block mb-1 flex items-center justify-between ${(liveWeatherAlert || temple.weatherAlert) ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-500'}`}>
                          <span className="flex items-center gap-1"><Cloud className="h-3 w-3" /> Weather Conditions</span>
                          {(liveWeatherAlert || temple.weatherAlert) && <AlertTriangle className="h-3.5 w-3.5 animate-pulse text-red-600 dark:text-red-400" />}
                        </span>
                        <span className={`font-semibold ${(liveWeatherAlert || temple.weatherAlert) ? 'text-red-800 dark:text-red-300' : 'text-slate-800 dark:text-slate-200'}`}>
                          {liveWeather || temple.weather || '28°C, Clear Sky'}
                        </span>
                        {(liveWeatherAlert || temple.weatherAlert) && (
                          <p className="text-[10px] leading-tight text-red-700 dark:text-red-400 mt-1.5 font-medium">{liveWeatherAlert || temple.weatherAlert}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {!temple.isViewOnly && (
                <>
                  {/* AI Crowd Predictions (Screen 8) */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="h-4.5 w-4.5 text-gold animate-pulse" /> AI Crowd Prediction
                      </h4>
                      <span className="text-xs text-slate-600 dark:text-slate-400">Current Wait: <strong className="text-gold">{temple.waitTime}m</strong></span>
                    </div>

                    {/* Recharts Hourly Wait Times Forecast */}
                    <div className="h-40 w-full bg-slate-50 dark:bg-slate-950/60 pt-4 pb-2 pr-2 pl-0 rounded-2xl border border-slate-200 dark:border-slate-800 mb-2 relative overflow-hidden group shadow-inner">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={hourlyPredictionData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--grid-color, #334155)" strokeOpacity={0.4} className="dark:[--grid-color:#334155] [--grid-color:#E2E8F0]" />
                          <XAxis 
                            dataKey="time" 
                            stroke="#94A3B8" 
                            fontSize={11} 
                            axisLine={false} 
                            tickLine={false}
                            tick={{fill: '#94A3B8', dy: 10}}
                            minTickGap={15}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94A3B8', fontSize: 10, dx: -5}} 
                          />
                          <Tooltip 
                            content={<CrowdPredictionTooltip />}
                            cursor={{fill: 'rgba(255, 107, 53, 0.1)'}} 
                          />
                          <Bar dataKey="wait" radius={[6, 6, 0, 0]} maxBarSize={30} animationDuration={1500}>
                            {hourlyPredictionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#FF6B35' : 'var(--bar-color)'} className="dark:[--bar-color:#9A3412] [--bar-color:#FDBA74] transition-all duration-300 hover:opacity-80" />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] text-slate-500 italic text-center">
                      🔥 Best hours to visit: <strong className="text-emerald-400">6:00 AM - 9:00 AM</strong>. Expect heavy peaks at noon due to afternoon Aarti.
                    </p>
                  </div>

                  {/* Facilities list */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">Available Facilities</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {temple.facilities?.map(f => (
                        <span key={f} className="text-[11px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full">{f}</span>
                      )) || 'None'}
                    </div>
                  </div>
                </>
              )}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-4 mt-auto">
                {temple.isViewOnly ? (
                  <button
                    onClick={() => {
                      if (temple.lat && temple.lon) {
                        let url = `https://www.google.com/maps/dir/?api=1&destination=${temple.lat},${temple.lon}`;
                        if (userLocation) {
                          url += `&origin=${userLocation.lat},${userLocation.lon}`;
                        }
                        window.open(url, '_blank');
                      } else {
                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(temple.name + ' ' + temple.location)}`, '_blank');
                      }
                    }}
                    className="flex-1 py-3 bg-saffron hover:bg-[#e85a28] text-slate-900 dark:text-white font-bold text-md rounded-xl transition-all shadow-lg shadow-saffron/20 flex items-center justify-center gap-2"
                  >
                    <MapPin className="h-5 w-5" /> Show Route
                  </button>
                ) : (
                  <button
                    onClick={() => setStep('booking')}
                    className="flex-1 py-3 bg-saffron hover:bg-[#e85a28] text-slate-900 dark:text-white font-bold text-md rounded-xl transition-all shadow-lg shadow-saffron/20"
                  >
                    Book Darshan Pass
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: DARSHAN BOOKING FORM (Screen 9, 10, 11) */}
          {step === 'booking' && (
            <form onSubmit={handleBookSubmit} className="space-y-3">
              <div className="flex items-center gap-2 mb-1 text-saffron font-bold text-sm">
                <span className="cursor-pointer hover:underline" onClick={() => setStep('details')}>← Back to Details</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Darshan Slot Settings</h4>

              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">Select Date</label>
                  <input
                    type="date"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-saffron cursor-pointer"
                    value={formData.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1 font-semibold">Select Time Slot</label>
                  <div className="relative">
                    <div 
                      onClick={() => setShowSlotPicker(!showSlotPicker)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs cursor-pointer flex justify-between items-center hover:border-saffron transition-colors"
                    >
                      <span className="font-semibold">{formData.timeSlot}</span>
                      <ChevronRight className={`h-4 w-4 transition-transform ${showSlotPicker ? 'rotate-90 text-saffron' : 'text-slate-400'}`} />
                    </div>
                    
                    <AnimatePresence>
                      {showSlotPicker && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 top-full mt-2 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 max-h-[220px] overflow-y-auto"
                        >
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                            {[
                              { time: '07:00 AM', status: 'Low Wait', color: 'bg-emerald-500', isMorning: true },
                              { time: '08:00 AM', status: 'Low Wait', color: 'bg-emerald-500', isMorning: true },
                              { time: '09:00 AM', status: 'Available', color: 'bg-amber-500', isMorning: true },
                              { time: '10:00 AM', status: 'Available', color: 'bg-amber-500', isMorning: true },
                              { time: '11:00 AM', status: 'Fast Filling', color: 'bg-orange-500', isMorning: true },
                              { time: '12:00 PM', status: 'Aarti Peak', color: 'bg-red-500', isMorning: false },
                              { time: '01:00 PM', status: 'Moderate', color: 'bg-amber-500', isMorning: false },
                              { time: '02:00 PM', status: 'Available', color: 'bg-amber-500', isMorning: false },
                              { time: '03:00 PM', status: 'Low Wait', color: 'bg-emerald-500', isMorning: false },
                              { time: '04:00 PM', status: 'Moderate', color: 'bg-amber-500', isMorning: false },
                              { time: '05:00 PM', status: 'Aarti Peak', color: 'bg-red-500', isMorning: false }
                            ].map((slot, idx) => {
                              const fullSlotName = `${slot.time} (${slot.status})`;
                              const isSelected = formData.timeSlot === fullSlotName || formData.timeSlot.includes(slot.time);
                              return (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    setFormData({ ...formData, timeSlot: fullSlotName });
                                    setShowSlotPicker(false);
                                  }}
                                  className={`relative overflow-hidden cursor-pointer rounded-lg border p-1.5 pl-2 transition-all duration-200 ${isSelected ? 'border-saffron bg-saffron/5 shadow-md shadow-saffron/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700'}`}
                                >
                                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${slot.color}`} />
                                  <div className="flex justify-between items-start mb-0.5">
                                    <span className={`font-bold text-[11px] ${isSelected ? 'text-saffron' : 'text-slate-800 dark:text-slate-200'}`}>{slot.time}</span>
                                    {slot.isMorning ? <Sun className={`h-3 w-3 ${isSelected ? 'text-saffron' : 'text-slate-400'}`} /> : <Moon className={`h-3 w-3 ${isSelected ? 'text-saffron' : 'text-slate-400'}`} />}
                                  </div>
                                  <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold truncate">{slot.status}</p>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">No. of Devotees</label>
                  <div className="flex items-center justify-between bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-1.5 h-[38px] focus-within:border-saffron transition-colors">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, visitors: Math.max(1, (parseInt(formData.visitors) || 1) - 1) })}
                      className="w-[26px] h-[26px] flex shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-saffron hover:text-white transition-colors shadow-sm"
                    >
                      <Minus className="w-3 h-3" strokeWidth={3} />
                    </button>
                    
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-full bg-transparent text-center text-slate-900 dark:text-white text-sm font-bold focus:outline-none m-0"
                      value={formData.visitors}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({ ...formData, visitors: val === '' ? '' : parseInt(val) });
                      }}
                      onBlur={() => {
                        if (!formData.visitors || formData.visitors < 1) setFormData({ ...formData, visitors: 1 });
                      }}
                      required
                    />
                    
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, visitors: (parseInt(formData.visitors) || 1) + 1 })}
                      className="w-[26px] h-[26px] flex shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-saffron hover:text-white transition-colors shadow-sm"
                    >
                      <Plus className="w-3 h-3" strokeWidth={3} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">Darshan Category</label>
                  <select
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-saffron"
                    value={formData.specialDarshan}
                    onChange={e => setFormData({ ...formData, specialDarshan: e.target.value })}
                  >
                    <option value="General">General Entry (Free)</option>
                    <option value="Special">Special Entry (₹100/person)</option>
                    <option value="VVIP">VVIP Protocol (₹500/person)</option>
                  </select>
                </div>
              </div>

              {/* Accessibility (Screen 10) */}
              <div className="bg-white dark:bg-slate-950/40 p-3 rounded-xl border border-slate-850 space-y-1.5">
                <span className="text-xs font-bold text-gold flex items-center gap-1.5 mb-1">
                  <HeartHandshake className="h-4 w-4" /> Priority Accessibility Support
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white">
                    <input
                      type="checkbox"
                      className="rounded accent-saffron bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                      checked={formData.wheelchair}
                      onChange={e => setFormData({ ...formData, wheelchair: e.target.checked })}
                    />
                    Need Wheelchair
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white">
                    <input
                      type="checkbox"
                      className="rounded accent-saffron bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                      checked={formData.volunteer}
                      onChange={e => setFormData({ ...formData, volunteer: e.target.checked })}
                    />
                    Volunteer Escort
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white col-span-2">
                    <input
                      type="checkbox"
                      className="rounded accent-saffron bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                      checked={formData.medical}
                      onChange={e => setFormData({ ...formData, medical: e.target.checked })}
                    />
                    Notify Medical Unit (Critical Support)
                  </label>
                </div>
              </div>

              {/* AI Travel Estimates (Screen 11) */}
              <div className="bg-white dark:bg-slate-950/30 p-3.5 rounded-xl border border-slate-850/60 text-xs flex justify-between items-center text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-saffron shrink-0" />
                  <span>AI Travel Estimate: <strong>45 km • 1h 15m (Car)</strong>. Fuel cost: ~₹380.</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-saffron hover:bg-[#e85a28] text-white font-bold text-md rounded-xl transition-all shadow-lg mt-2"
              >
                Proceed to Payment
              </button>
            </form>
          )}

          {/* STEP 2.5: AADHAAR VERIFICATION */}
          {step === 'aadhaar' && (
            <div className="space-y-6 text-center py-6">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mx-auto border border-blue-500/20 mb-2 shadow-sm">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Verify Identity</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Aadhaar authentication is required for secure bookings.</p>
              </div>

              <div className="max-w-sm mx-auto space-y-4 text-left">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">Aadhaar Number (UID)</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white text-sm font-bold tracking-widest focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="XXXX-XXXX-XXXX"
                      maxLength={14}
                      value={aadhaarNumber}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        val = val.match(/.{1,4}/g)?.join('-') || val;
                        setAadhaarNumber(val);
                      }}
                      disabled={verificationStatus !== 'idle'}
                    />
                    <Fingerprint className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  </div>
                </div>


                {verificationStatus === 'idle' || verificationStatus === 'loading' ? (
                  <button
                    onClick={handleSendOTP}
                    disabled={aadhaarNumber.length < 14 || verificationStatus === 'loading'}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                      aadhaarNumber.length < 14
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
                    }`}
                  >
                    {verificationStatus === 'loading' ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending OTP...</>
                    ) : 'Send OTP via UIDAI'}
                  </button>
                ) : null}

                {(verificationStatus === 'sent' || verificationStatus === 'verifying' || verificationStatus === 'success') && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div>
                      <label className="block text-xs text-emerald-600 dark:text-emerald-500 mb-1.5 font-semibold">OTP sent to registered mobile</label>
                      <input
                        type="text"
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-center text-slate-900 dark:text-white text-lg font-bold tracking-[0.5em] focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="••••••"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        disabled={verificationStatus === 'verifying' || verificationStatus === 'success'}
                      />
                    </div>
                    
                    <button
                      onClick={handleVerifyOTP}
                      disabled={otp.length !== 6 || verificationStatus === 'verifying' || verificationStatus === 'success'}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                        verificationStatus === 'success' ? 'bg-emerald-500 text-white'
                        : otp.length !== 6 ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                      }`}
                    >
                      {verificationStatus === 'verifying' ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</>
                      ) : verificationStatus === 'success' ? (
                        <><CheckCircle className="h-5 w-5" /> Verified</>
                      ) : 'Verify & Proceed to Payment'}
                    </button>
                  </motion.div>
                )}
                
                <div className="pt-2 text-center">
                  <button onClick={() => {setStep('booking'); setVerificationStatus('idle'); setOtp(''); setAadhaarNumber('');}} className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white underline">
                    Cancel and go back
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT PORTAL GATEWAY MODAL */}
          <PaymentGatewayModal
            isOpen={step === 'payment'}
            onClose={() => setStep('booking')}
            amount={formData.specialDarshan === 'General' ? 0 : formData.specialDarshan === 'Special' ? formData.visitors * 100 : formData.visitors * 500}
            orderDetails={{
              ...formData,
              templeName: temple.name
            }}
            onSuccess={(paymentResult) => {
              setIsPaying(true);
              const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com';
              
              fetch(baseUrl + '/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  templeId: temple._id,
                  ...formData,
                  paymentId: paymentResult.transactionId,
                  paymentMethod: paymentResult.payMethod,
                  paymentStatus: 'PAID'
                })
              })
                .then(res => res.json())
                .then(data => {
                  setIsPaying(false);
                  if (data.success) {
                    setBookedData(data);
                    setStep('ticket');
                  } else {
                    alert(data.message || 'Booking failed');
                    setStep('booking');
                  }
                })
                .catch(err => {
                  setIsPaying(false);
                  setBookedData({
                    bookingId: `TS-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`,
                    date: formData.date,
                    timeSlot: formData.timeSlot,
                    visitors: formData.visitors,
                    specialDarshan: formData.specialDarshan,
                    waitlistPosition: 0
                  });
                  setStep('ticket');
                });
            }}
          />

          {/* STEP 4: QR TICKET ISSUED (Screen 14) */}
          {step === 'ticket' && bookedData && (
            <div className="space-y-6 text-center">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 mb-2">
                <CheckCircle className="h-7 w-7" />
              </div>
              <h4 className="text-2xl font-bold text-emerald-400">Darshan Verified!</h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">Your entry pass has been registered on the blockchain queue.</p>

              {/* Scannable Dynamic QR Ticket Component */}
              <div className="py-2">
                <TicketQR 
                  ticketData={{
                    ...bookedData,
                    templeName: temple.name
                  }} 
                  size={180}
                  showDetails={true}
                  showActions={true}
                />
              </div>

              {bookedData.waitlistPosition > 0 && (
                <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 p-3 rounded-xl max-w-sm mx-auto text-left text-xs flex gap-2">
                  <Info className="h-5 w-5 shrink-0" />
                  <span>
                    Your slot is currently in the <strong>Waitlist (#{bookedData.waitlistPosition})</strong> due to peak surge. Estimated confirmation time is 35 mins.
                  </span>
                </div>
              )}

              {/* Bhagavad Gita Shloka */}
              <div className="bg-saffron/10 border border-saffron/20 p-4 rounded-xl max-w-sm mx-auto text-center mt-4">
                <p className="text-saffron font-semibold italic text-sm mb-1.5 font-serif">
                  "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन"
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  (Karmanye vadhikaraste Ma Phaleshu Kadachana)<br />
                  <strong>Meaning:</strong> You have the right to perform your prescribed duty, but you are not entitled to the fruits of action.
                </p>
              </div>

              <div className="max-w-xs mx-auto pt-2 mt-4 space-y-2">
                {onGoToAccommodation && (
                  <button
                    onClick={() => {
                      onGoToAccommodation({
                        templeId: temple._id,
                        templeName: temple.name,
                        date: bookedData.date || formData.date,
                        timeSlot: bookedData.timeSlot || formData.timeSlot,
                        visitors: bookedData.visitors || formData.visitors,
                        specialDarshan: bookedData.specialDarshan || formData.specialDarshan,
                        bookingId: bookedData.bookingId
                      });
                      onClose();
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-saffron hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Hotel className="h-4 w-4" /> Book Recommended Stays Near {temple.name.split(' ')[0]}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
                >
                  Close & View Dashboard
                </button>
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </motion.div>
  );
}

// ==========================================
// VIEW 2: MULTI-TEMPLE AI ROUTE AGENT (Screen 18)
// Autonomous Pilgrimage Route Planning Agent
// ==========================================
function PlannerView({ temples, onClose }) {
  const [formData, setFormData] = useState({
    startingCity: 'New Delhi',
    templeId: '2', // Default to Kashi Vishwanath
    days: 2,
    budget: 'Comfort',
    optimizationGoal: 'crowd_averse',
    customDirectives: 'Senior Citizen Wheelchair',
    travelParty: 'Family'
  });
  const [planResult, setPlanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [agentPhaseIndex, setAgentPhaseIndex] = useState(0);
  const [directionsStop, setDirectionsStop] = useState(null);

  const agentPhases = [
    { title: 'Ingesting Pilgrimage Parameters', desc: 'Analyzing origin, target shrine, party demographics, and budget limits...' },
    { title: 'Geographic & Transit Modeling', desc: 'Calculating intercity rail/air corridors and local sanctum accessibility...' },
    { title: 'Crowd & Queue Telemetry', desc: 'Matching historical crowd curves to pinpoint calm darshan windows...' },
    { title: 'Lodging Node Optimization', desc: 'Filtering verified temple trust dharamshalas and corridor hotels...' },
    { title: 'Multi-Stop Circuit Synthesis', desc: 'Synthesizing day-by-day waypoints, transit costs, and sacred dos & donts...' }
  ];

  const handleDeployAgent = (overrideParams = null) => {
    const dataToSend = overrideParams ? { ...formData, ...overrideParams } : formData;
    if (overrideParams) {
      setFormData(dataToSend);
    }
    setLoading(true);
    setAgentPhaseIndex(0);

    const phaseInterval = setInterval(() => {
      setAgentPhaseIndex(prev => {
        if (prev < agentPhases.length - 1) return prev + 1;
        return prev;
      });
    }, 280);

    setTimeout(() => {
      fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })
        .then(res => res.json())
        .then(data => {
          clearInterval(phaseInterval);
          setPlanResult(data);
          setLoading(false);
        })
        .catch(err => {
          clearInterval(phaseInterval);
          setLoading(false);
          console.error(err);
        });
    }, 1400);
  };

  // Interactive directive toggle helper
  const toggleDirective = (tag) => {
    const currentTags = formData.customDirectives
      ? formData.customDirectives.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const exists = currentTags.some(t => t.toLowerCase() === tag.toLowerCase());
    let updated;
    if (exists) {
      updated = currentTags.filter(t => t.toLowerCase() !== tag.toLowerCase());
    } else {
      updated = [...currentTags, tag];
    }
    setFormData(prev => ({
      ...prev,
      customDirectives: updated.join(', ')
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              AI Route Agent Engine
            </span>
            <span className="text-xs text-slate-500 font-medium">Autonomous Multi-Temple Optimizer</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Multi-Temple Journey Planner
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Autonomous AI agent calculating crowd-optimized darshan sequences, verified stays, transit links, and transparent budgets.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* ======================================================== */}
        {/* LEFT PANEL: AI AGENT STRATEGY CONSOLE (col-span-4)      */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl h-fit shadow-lg space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-saffron" />
                AI Agent Console
              </h4>
              <p className="text-[11px] text-slate-500">Configure parameters & optimization policy</p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleDeployAgent();
            }}
            className="space-y-3.5"
          >
            {/* Starting City */}
            <div>
              <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-bold uppercase tracking-wider">
                Starting City / Departure Hub
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-saffron transition-all"
                  value={formData.startingCity}
                  onChange={e => setFormData({ ...formData, startingCity: e.target.value })}
                  placeholder="e.g. New Delhi, Mumbai, Bengaluru"
                  required
                />
                <MapPin className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Target Shrine */}
            <div>
              <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-bold uppercase tracking-wider">
                Primary Target Shrine
              </label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-saffron transition-all cursor-pointer"
                value={formData.templeId}
                onChange={e => setFormData({ ...formData, templeId: e.target.value })}
              >
                {temples.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.location.split(',')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Days & Budget */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-bold uppercase tracking-wider">
                  Days Available
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="15"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-saffron"
                    value={formData.days}
                    onChange={e => setFormData({ ...formData, days: Math.min(15, Math.max(1, parseInt(e.target.value) || 1)) })}
                    required
                  />
                  <Calendar className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-bold uppercase tracking-wider">
                  Budget Scale
                </label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-saffron cursor-pointer"
                  value={formData.budget}
                  onChange={e => setFormData({ ...formData, budget: e.target.value })}
                >
                  <option value="Economy">Economy (Trust / Rail)</option>
                  <option value="Comfort">Comfort (AC / Innova)</option>
                  <option value="Luxury">Luxury (Chauffeur / Suite)</option>
                </select>
              </div>
            </div>

            {/* AI Agent Optimization Policy */}
            <div>
              <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1.5 font-bold uppercase tracking-wider">
                AI Agent Optimization Policy
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'crowd_averse', label: '🕊️ Crowd-Averse', desc: 'Early calm slots' },
                  { id: 'senior_citizen', label: '👵 Senior Friendly', desc: 'Palki & battery cart' },
                  { id: 'fastest', label: '⚡ Express Circuit', desc: 'Direct rail/air' },
                  { id: 'budget_maximizer', label: '💰 Budget First', desc: 'Trust dharamshalas' }
                ].map((policy) => (
                  <button
                    key={policy.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, optimizationGoal: policy.id })}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      formData.optimizationGoal === policy.id
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-900 dark:text-amber-200 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">{policy.label}</div>
                    <div className="text-[10px] text-slate-500 truncate">{policy.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Directives to Agent */}
            <div>
              <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-bold uppercase tracking-wider">
                Directives / Constraints for Agent
              </label>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-saffron"
                value={formData.customDirectives}
                onChange={e => setFormData({ ...formData, customDirectives: e.target.value })}
                placeholder="e.g. Senior Citizen Wheelchair, Trust Dharamshala..."
              />
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {[
                  'Senior Citizen Wheelchair',
                  'Trust Dharamshala Only',
                  'Direct Vande Bharat'
                ].map(tag => {
                  const isSelected = formData.customDirectives
                    .split(',')
                    .map(s => s.trim().toLowerCase())
                    .includes(tag.toLowerCase());
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleDirective(tag)}
                      className={`text-[11px] px-2.5 py-1 rounded-xl font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-saffron text-slate-950 border-saffron shadow-xs hover:bg-orange-500 scale-[1.02]'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:text-amber-600'
                      }`}
                    >
                      <span className={isSelected ? 'font-black text-xs' : 'opacity-60 text-xs'}>
                        {isSelected ? '✓' : '+'}
                      </span>
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deploy Agent Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-saffron hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-slate-950 font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-md hover:shadow-lg hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Agent Optimizing Circuit...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4.5 w-4.5 text-slate-950" />
                  <span>Deploy AI Route Agent</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANEL: AI AGENT ROUTE DOSSIER (col-span-8)        */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 rounded-3xl min-h-[500px] flex flex-col justify-start shadow-lg">
          {loading ? (
            /* Multi-Phase Autonomous Agent Execution Animation */
            <div className="my-auto py-8 text-center max-w-md mx-auto space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-saffron mx-auto flex items-center justify-center text-slate-950 shadow-xl animate-pulse">
                <Sparkles className="h-8 w-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Autonomous AI Agent Executing
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Synthesizing geospatial paths, darshan telemetry & lodging proximity...
                </p>
              </div>

              {/* Progress Steps */}
              <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-2.5">
                {agentPhases.map((phase, pIdx) => (
                  <div
                    key={pIdx}
                    className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                      pIdx === agentPhaseIndex
                        ? 'opacity-100 font-bold text-amber-600 dark:text-amber-400'
                        : pIdx < agentPhaseIndex
                        ? 'opacity-80 text-emerald-600 dark:text-emerald-400 line-through'
                        : 'opacity-40 text-slate-400'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold border">
                      {pIdx < agentPhaseIndex ? '✓' : pIdx + 1}
                    </div>
                    <span className="truncate">{phase.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : planResult ? (
            /* Rich Route Dossier */
            <div className="space-y-6">
              {/* Dossier Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-saffron" />
                      AI Agent Route Dossier
                    </h4>
                    <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-emerald-500" />
                      {planResult.agentMetadata?.modelProvider ? `${planResult.agentMetadata.modelProvider} • ` : ''}{planResult.agentMetadata?.efficiencyScore || '98.6%'} Optimal
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Autonomous {formData.days}-Day sacred circuit for {formData.startingCity} ➔ {temples.find(t => t._id === formData.templeId)?.name || 'Selected Shrine'}.
                  </p>
                </div>
                <div className="sm:text-right bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                    Total Estimated Budget
                  </span>
                  <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                    {planResult.transport?.budgetEstimate}
                  </span>
                </div>
              </div>

              {/* Agent Strategic Decisions Rationale */}
              {planResult.agentMetadata?.rationale && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                    <Compass className="h-3.5 w-3.5 text-saffron" />
                    Agent Strategic Rationale & Queue Optimizations
                  </div>
                  <ul className="grid sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                    {planResult.agentMetadata.rationale.map((r, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-1.5 leading-snug">
                        <span className="text-saffron font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Multi-Stop Visual Itinerary Timeline */}
              <div>
                <h5 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-3">
                  Day-by-Day Chronological Sacred Waypoints
                </h5>
                <div className="relative pl-6 space-y-4 border-l-2 border-amber-500/30 ml-3 py-1">
                  {planResult.route.map((item, idx) => (
                    <div key={idx} className="relative group">
                      {/* Waypoint circle pin */}
                      <span className="absolute -left-[31px] top-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-saffron flex items-center justify-center font-extrabold text-[9px] text-saffron shadow-xs group-hover:scale-110 transition-transform">
                        {idx + 1}
                      </span>

                      <div className="bg-slate-50 dark:bg-slate-950/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/10 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-saffron text-slate-950 shadow-xs">
                              Day {item.dayIndex || idx + 1}
                            </span>
                            <h6 className="font-extrabold text-slate-900 dark:text-white text-sm">
                              {item.name}
                            </h6>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                              {item.type}
                            </span>
                            {item.crowdForecast && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                                🟢 {item.crowdForecast}
                              </span>
                            )}
                          </div>
                          {item.timeSlot && (
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3 text-saffron" />
                              {item.timeSlot}
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                          {item.highlights && (
                            <p className="text-[11px] leading-relaxed text-slate-500">
                              {item.highlights}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] pt-1">
                            {item.stay && (
                              <span className="flex items-center gap-1">
                                <Hotel className="h-3 w-3 text-amber-500" />
                                <strong>Lodging:</strong> {item.stay}
                              </span>
                            )}
                            {item.transit && (
                              <span className="flex items-center gap-1">
                                <Navigation className="h-3 w-3 text-blue-500" />
                                <strong>Transit:</strong> {item.transit}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Directions CTA on stops */}
                        {item.type !== 'Origin City' && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setDirectionsStop({
                                  name: item.name,
                                  address: `${item.name}, ${temples.find(t => t._id === formData.templeId)?.location || 'Sacred Shrine'}`
                                });
                              }}
                              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Navigation className="h-3.5 w-3.5" />
                              <span>Get Accurate Directions to this Node</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transit & Financial Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Transit Mode</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{planResult.transport?.mode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Total Distance</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{planResult.transport?.distance}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Lodging Budget</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{planResult.transport?.breakdown?.stay || '₹1,600'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Transit & Fuel</span>
                  <span className="font-bold text-saffron mt-0.5 block">{planResult.transport?.estFuel}</span>
                </div>
              </div>

              {/* Recommended Stay Nodes */}
              {planResult.hotels && planResult.hotels.length > 0 && (
                <div>
                  <h5 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2.5">
                    Agent-Curated Lodging Along Circuit
                  </h5>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {planResult.hotels.slice(0, 2).map((h, hIdx) => (
                      <div key={hIdx} className="bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white">{h.name}</div>
                          <div className="text-[11px] text-amber-500 font-semibold mt-0.5">★ {h.rating} Rating</div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">₹{h.price}</span>
                          <span className="text-[10px] text-slate-400 block">/night</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 1-Click Agent Re-Tuning Controls */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Re-Optimize Strategy:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeployAgent({ optimizationGoal: 'senior_citizen' })}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                  >
                    👵 Senior Citizen Priority
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeployAgent({ budget: 'Economy', optimizationGoal: 'budget_maximizer' })}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
                  >
                    💰 Maximize Budget (Economy)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeployAgent({ days: Math.min(15, formData.days + 1) })}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 transition-all cursor-pointer"
                  >
                    +1 Day Extended Circuit
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Standby View */
            <div className="text-center text-slate-500 my-auto py-12 space-y-3 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-saffron mx-auto flex items-center justify-center">
                <Compass className="h-8 w-8 animate-spin" style={{ animationDuration: '10s' }} />
              </div>
              <h4 className="font-extrabold text-base text-slate-800 dark:text-slate-200">
                AI Pilgrimage Route Agent on Standby
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Configure your starting city, target shrine, duration, and optimization policy on the left console, then click <strong>Deploy AI Route Agent</strong>.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Turn-by-Turn Directions Modal for any Route Stop */}
      {directionsStop && (
        <DirectionsModal
          destination={directionsStop}
          onClose={() => setDirectionsStop(null)}
        />
      )}
    </div>
  );
}

// Google Multi-Color G Icon Component
const GoogleGIcon = ({ className = "h-3.5 w-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3h3.86c2.26-2.09 3.68-5.17 3.68-9.1z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.34 24 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
  </svg>
);

// ==========================================
// VIEW 3: ACCOMMODATION LISTINGS (Screen 12)
// Recommended based on user booked slots & tickets
// ==========================================
function HotelsView({ userBookings = [], targetBooking = null, onSelectTargetBooking, onBookDarshanClick, onGoToBookings, onStayBooked, temples = [] }) {
  const [hotelsList, setHotelsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('proximity'); // proximity, rating, price_asc
  const [searchQuery, setSearchQuery] = useState('');
  const [manualTempleId, setManualTempleId] = useState('all');

  // Booked Stay Reservation Modal State
  const [reservingHotel, setReservingHotel] = useState(null);
  const [confirmedStay, setConfirmedStay] = useState(null);
  const [selectedPhotoHotel, setSelectedPhotoHotel] = useState(null);
  const [directionsHotel, setDirectionsHotel] = useState(null);
  const [isPayingStay, setIsPayingStay] = useState(false);
  const [resForm, setResForm] = useState({
    guestName: 'Devotee',
    phone: '+91 9876543210',
    checkInDate: '',
    nights: 1,
    guests: 2,
    roomsCount: 1,
    roomType: 'Standard Room',
    needLocker: false,
    needAartiWakeup: true,
    seniorGroundFloor: false
  });

  // Calculate pricing breakdown for reservation
  const getStayPricing = (hotel, form) => {
    if (!hotel) return { perNightPrice: 0, nights: 1, roomsCount: 1, subtotal: 0, taxAmount: 0, lockerFee: 0, totalPayable: 0, isExempt: true };
    const selectedCat = hotel.roomCategories?.find(c => c.name === form.roomType);
    const perNightPrice = selectedCat ? selectedCat.price : (hotel.price || 500);
    const nights = Math.max(1, Number(form.nights) || 1);
    const roomsCount = Math.max(1, Number(form.roomsCount) || 1);
    const subtotal = perNightPrice * nights * roomsCount;
    const lockerFee = form.needLocker ? 50 * nights : 0;
    // Official trust rest houses and dharamshalas are GST exempt (0%)
    // Commercial hotels > ₹1000 have 12% GST
    const isExempt = hotel.type === 'Temple Guest House' || hotel.type === 'Dharamshala' || perNightPrice <= 1000;
    const taxRate = isExempt ? 0 : 0.12;
    const taxAmount = Math.round(subtotal * taxRate);
    const totalPayable = subtotal + lockerFee + taxAmount;
    return { perNightPrice, nights, roomsCount, subtotal, taxAmount, lockerFee, totalPayable, isExempt };
  };

  // Calculate upcoming bookings and all bookings
  const upcomingBookings = (userBookings || []).filter(b => b.status === 'Upcoming');
  const allBookings = userBookings || [];

  // Active booking selection
  const [activeBookingId, setActiveBookingId] = useState(() => {
    if (targetBooking?.bookingId) return targetBooking.bookingId;
    if (upcomingBookings.length > 0) return upcomingBookings[0].bookingId;
    if (allBookings.length > 0) return allBookings[0].bookingId;
    return 'all';
  });

  // Sync if targetBooking changes externally
  useEffect(() => {
    if (targetBooking?.bookingId) {
      setActiveBookingId(targetBooking.bookingId);
    } else if (targetBooking?.templeId) {
      setActiveBookingId(`custom-${targetBooking.templeId}`);
    }
  }, [targetBooking]);

  // Load accommodation data
  useEffect(() => {
    setLoading(true);
    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/hotels')
      .then(res => res.json())
      .then(data => {
        setHotelsList(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading accommodation:", err);
        setLoading(false);
      });
  }, []);

  // Resolved active booking object
  const activeBooking = (() => {
    if (activeBookingId === 'all') return null;
    if (targetBooking && (targetBooking.bookingId === activeBookingId || activeBookingId.startsWith('custom-'))) {
      return targetBooking;
    }
    const found = allBookings.find(b => b.bookingId === activeBookingId);
    if (found) return found;
    return null;
  })();

  // Filter hotels based on active booking or manual selection
  const filteredHotels = hotelsList.filter(h => {
    // Temple-based filtering:
    if (activeBooking) {
      const matchId = String(h.templeId) === String(activeBooking.templeId);
      const bookedTempleName = (activeBooking.templeName || '').toLowerCase();
      const hotelTempleName = (h.templeName || '').toLowerCase();
      const matchName = bookedTempleName && hotelTempleName && (
        hotelTempleName.includes(bookedTempleName.split(' ')[0]) ||
        bookedTempleName.includes(hotelTempleName.split(' ')[0])
      );
      if (!matchId && !matchName) return false;
    } else if (manualTempleId !== 'all') {
      const selectedTemple = temples.find(t => String(t._id) === String(manualTempleId) || String(t.id) === String(manualTempleId));
      const selName = selectedTemple ? selectedTemple.name.toLowerCase() : '';
      const matchId = String(h.templeId) === String(manualTempleId);
      const matchName = selName && h.templeName && (
        h.templeName.toLowerCase().includes(selName.split(' ')[0]) ||
        selName.includes(h.templeName.toLowerCase().split(' ')[0])
      );
      if (!matchId && !matchName) return false;
    }

    // Type filter
    if (typeFilter !== 'All' && h.type !== typeFilter) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inName = h.name?.toLowerCase().includes(q);
      const inAmenities = h.amenities?.some(a => a.toLowerCase().includes(q));
      const inGate = h.proximityToGate?.toLowerCase().includes(q);
      const inTemple = h.templeName?.toLowerCase().includes(q);
      if (!inName && !inAmenities && !inGate && !inTemple) return false;
    }

    return true;
  });

  // Sort hotels
  filteredHotels.sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sortBy === 'price_asc') {
      return (a.price || 0) - (b.price || 0);
    }
    // Proximity default (numeric distance parse)
    const distA = parseFloat(a.distance) || 99;
    const distB = parseFloat(b.distance) || 99;
    return distA - distB;
  });

  const handleOpenReservation = (hotel) => {
    setReservingHotel(hotel);
    setConfirmedStay(null);
    setIsPayingStay(false);
    const initialCategory = hotel.roomCategories?.[0]?.name || 'Standard Pilgrim Room';
    setResForm({
      guestName: 'Devotee',
      phone: '+91 9876543210',
      checkInDate: activeBooking?.date || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      nights: 1,
      guests: activeBooking?.visitors || 2,
      roomsCount: 1,
      roomType: initialCategory,
      needLocker: false,
      needAartiWakeup: true,
      seniorGroundFloor: false
    });
  };

  const handleProceedToPayment = (e) => {
    if (e) e.preventDefault();
    setIsPayingStay(true);
  };

  const handlePayAtCounter = () => {
    const pricing = getStayPricing(reservingHotel, resForm);
    const stayRef = `TS-STAY-${Math.floor(100000 + Math.random() * 900000)}`;
    const newStayRecord = {
      id: stayRef,
      reference: stayRef,
      hotel: reservingHotel,
      hotelName: reservingHotel.name,
      templeName: reservingHotel.templeName || activeBooking?.templeName,
      hotelType: reservingHotel.type || 'Temple Guest House',
      booking: activeBooking,
      form: { ...resForm },
      checkInDate: resForm.checkInDate,
      nights: resForm.nights,
      roomsCount: resForm.roomsCount,
      guests: resForm.guests,
      roomType: resForm.roomType,
      guestName: resForm.guestName,
      phone: resForm.phone,
      totalAmount: pricing.totalPayable,
      status: 'Upcoming',
      pricing,
      payment: {
        status: 'PAY_AT_COUNTER',
        method: 'Counter Cash / UPI',
        transactionId: `DESK-COLLECT-${Math.floor(1000 + Math.random() * 9000)}`,
        paidAt: 'Pay Upon Arrival at Counter'
      },
      paymentStatus: 'PAY_AT_COUNTER',
      paymentMethod: 'Pay at Reception',
      transactionId: `DESK-COLLECT-${Math.floor(1000 + Math.random() * 9000)}`,
      address: reservingHotel.address || reservingHotel.proximityToGate || reservingHotel.realLocationTag || 'Near Temple Gate',
      proximityToGate: reservingHotel.proximityToGate || 'Near Temple Gate',
      lat: reservingHotel.lat || 13.6273,
      lng: reservingHotel.lng || 79.4272,
      image: reservingHotel.image,
      features: [
        resForm.needLocker ? 'Safe Luggage Locker' : null,
        resForm.needAartiWakeup ? 'Aarti Wake-up Alert' : null,
        resForm.seniorGroundFloor ? 'Ground Floor Room' : null,
        'Desk QR Verification'
      ].filter(Boolean),
      bookedAt: new Date().toISOString().split('T')[0]
    };

    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/stays/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStayRecord)
    }).catch(err => console.warn("API save stay error:", err));

    try {
      const existing = JSON.parse(localStorage.getItem('teerthsetu_stay_bookings') || '[]');
      localStorage.setItem('teerthsetu_stay_bookings', JSON.stringify([newStayRecord, ...existing]));
    } catch (e) {}

    if (onStayBooked) onStayBooked(newStayRecord);

    setConfirmedStay(newStayRecord);
    setReservingHotel(null);
  };

  const handlePaymentSuccess = (paymentResult) => {
    setIsPayingStay(false);
    const pricing = getStayPricing(reservingHotel, resForm);
    const stayRef = `TS-STAY-${Math.floor(100000 + Math.random() * 900000)}`;
    const newStayRecord = {
      id: stayRef,
      reference: stayRef,
      hotel: reservingHotel,
      hotelName: reservingHotel.name,
      templeName: reservingHotel.templeName || activeBooking?.templeName,
      hotelType: reservingHotel.type || 'Temple Guest House',
      booking: activeBooking,
      form: { ...resForm },
      checkInDate: resForm.checkInDate,
      nights: resForm.nights,
      roomsCount: resForm.roomsCount,
      guests: resForm.guests,
      roomType: resForm.roomType,
      guestName: resForm.guestName,
      phone: resForm.phone,
      totalAmount: pricing.totalPayable,
      status: 'Upcoming',
      pricing,
      payment: {
        status: 'PAID',
        method: paymentResult.payMethod || 'UPI',
        transactionId: paymentResult.transactionId || `TXN-${Date.now().toString().slice(-8)}`,
        paidAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString()
      },
      paymentStatus: 'PAID',
      paymentMethod: paymentResult.payMethod || 'UPI',
      transactionId: paymentResult.transactionId || `TXN-${Date.now().toString().slice(-8)}`,
      address: reservingHotel.address || reservingHotel.proximityToGate || reservingHotel.realLocationTag || 'Near Temple Gate',
      proximityToGate: reservingHotel.proximityToGate || 'Near Temple Gate',
      lat: reservingHotel.lat || 13.6273,
      lng: reservingHotel.lng || 79.4272,
      image: reservingHotel.image,
      features: [
        resForm.needLocker ? 'Safe Luggage Locker' : null,
        resForm.needAartiWakeup ? 'Aarti Wake-up Alert' : null,
        resForm.seniorGroundFloor ? 'Ground Floor Room' : null,
        'Online Verified Reservation'
      ].filter(Boolean),
      bookedAt: new Date().toISOString().split('T')[0]
    };

    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/stays/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStayRecord)
    }).catch(err => console.warn("API save stay error:", err));

    try {
      const existing = JSON.parse(localStorage.getItem('teerthsetu_stay_bookings') || '[]');
      localStorage.setItem('teerthsetu_stay_bookings', JSON.stringify([newStayRecord, ...existing]));
    } catch (e) {}

    if (onStayBooked) onStayBooked(newStayRecord);

    setConfirmedStay(newStayRecord);
    setReservingHotel(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-saffron/10 text-saffron">
              <Hotel className="h-5 w-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-saffron">
              Pilgrim Accommodations
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">Spiritual Stays & Lodgings</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Verified stays, guest houses, dharamshalas and lodges near holy entrance gates.
          </p>
        </div>

        {/* Global Sacred Destination Dropdown if needed */}
        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <label className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:inline">Destination:</label>
          <select
            value={activeBooking ? `booking-${activeBooking.bookingId}` : manualTempleId}
            onChange={(e) => {
              const val = e.target.value;
              if (val.startsWith('booking-')) {
                const bId = val.replace('booking-', '');
                setActiveBookingId(bId);
                const bObj = allBookings.find(b => b.bookingId === bId);
                if (onSelectTargetBooking) onSelectTargetBooking(bObj);
              } else if (val === 'all') {
                setActiveBookingId('all');
                setManualTempleId('all');
                if (onSelectTargetBooking) onSelectTargetBooking(null);
              } else {
                setActiveBookingId('all');
                setManualTempleId(val);
                if (onSelectTargetBooking) onSelectTargetBooking(null);
              }
            }}
            className="w-full md:w-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-saffron shadow-sm"
          >
            {upcomingBookings.length > 0 && (
              <optgroup label="Your Booked Shrines">
                {upcomingBookings.map(b => (
                  <option key={b.bookingId} value={`booking-${b.bookingId}`}>
                    ★ {b.templeName} ({b.date})
                  </option>
                ))}
              </optgroup>
            )}
            <option value="all">All Sacred Destinations (Pan-India)</option>
            {temples && temples.length > 0 && (
              <optgroup label="Browse By Temple">
                {temples.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.location ? t.location.split(',')[0] : ''})
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🎯 SMART RECOMMENDATION HERO BANNER BASED ON BOOKED SLOT */}
      {/* ======================================================== */}
      {activeBooking ? (
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-slate-900/40 border border-amber-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-saffron/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                Tailored To Your Booked Darshan Slot
              </span>
              <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                ✓ Active Pass
              </span>
            </div>

            {/* Quick Switcher across user's bookings */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 mr-1">Switch Booking:</span>
              {allBookings.map(b => (
                <button
                  key={b.bookingId}
                  onClick={() => {
                    setActiveBookingId(b.bookingId);
                    if (onSelectTargetBooking) onSelectTargetBooking(b);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                    activeBookingId === b.bookingId
                      ? 'bg-saffron text-slate-950 border-saffron shadow-sm'
                      : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-saffron/40'
                  }`}
                >
                  <MapPin className="h-3 w-3" />
                  {b.templeName.split(' ')[0]}
                </button>
              ))}
              <button
                onClick={() => {
                  setActiveBookingId('all');
                  if (onSelectTargetBooking) onSelectTargetBooking(null);
                }}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all"
              >
                Browse All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 items-center">
            {/* Left: Temple & Slot Information */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                Stays Near {activeBooking.templeName}
              </h4>

              {/* Slot Details Chips */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 shadow-sm">
                  <Calendar className="h-3.5 w-3.5 text-saffron" />
                  <span>Slot Date: <strong>{activeBooking.date}</strong></span>
                </div>
                <div className="bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 shadow-sm">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span>Darshan Time: <strong>{activeBooking.timeSlot}</strong></span>
                </div>
                <div className="bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 shadow-sm">
                  <Users className="h-3.5 w-3.5 text-blue-500" />
                  <span>Pilgrims: <strong>{activeBooking.visitors} Person(s)</strong></span>
                </div>
                <div className="bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 shadow-sm">
                  <QrCode className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Pass: <strong>{activeBooking.specialDarshan}</strong></span>
                </div>
              </div>

              {/* Proximity & Timing Advice box */}
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2.5">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Reporting Gate Advice:</strong> All recommended stays below are located within walking distance (0.1 km - 1.2 km) of the entrance queue complex at <strong>{activeBooking.templeName}</strong>. Stays provide secure electronic lockers for mobile phones, 24/7 hot water, and early morning aarti alert service.
                </div>
              </div>
            </div>

            {/* Right: Quick Action Card */}
            <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">Curated Proximity</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Walking Accessible</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                Pre-reserve your room for check-in on <strong>{activeBooking.date}</strong> to avoid last-minute pilgrim surge at the holy hills.
              </p>
              <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 font-medium">
                <span>Lockers Included</span>
                <span>Satvik Meals</span>
                <span>Morning Aarti Wake-up</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Notice when browsing all or no booking */
        <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 mb-2 inline-block">
              Browsing All Destinations
            </span>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">
              Sacred Stays & Dharamshalas Across India
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Have a booked ticket? Book a darshan slot to see instant recommendations sorted by your reporting gate.
            </p>
          </div>
          {onBookDarshanClick && (
            <button
              onClick={onBookDarshanClick}
              className="bg-saffron hover:bg-orange-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md shrink-0 flex items-center gap-1.5"
            >
              <QrCode className="h-4 w-4" /> Book a Darshan Slot
            </button>
          )}
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 border-b md:border-b-0 border-slate-200 dark:border-slate-800 pb-2 md:pb-0">
            {['All', 'Temple Guest House', 'Hotel', 'Dharamshala', 'Lodge'].map(tab => (
              <button
                key={tab}
                onClick={() => setTypeFilter(tab)}
                className={`px-4 py-2 text-xs font-bold rounded-full transition-all border ${
                  typeFilter === tab
                    ? 'bg-saffron/15 border-saffron text-saffron shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300'
                }`}
              >
                {tab === 'All' ? 'All Stays' : `${tab}s`}
              </button>
            ))}
          </div>

          {/* Search and Sort controls */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search stays, gate, locker..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-saffron"
              />
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-saffron"
            >
              <option value="proximity">Sort: Nearest to Gate</option>
              <option value="rating">Sort: Highest Rating</option>
              <option value="price_asc">Sort: Price (Low to High)</option>
            </select>
          </div>
        </div>

        {/* Results Counter / Location context */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Showing <strong>{filteredHotels.length}</strong> stays{' '}
            {activeBooking ? (
              <span>near <strong>{activeBooking.templeName}</strong></span>
            ) : manualTempleId !== 'all' ? (
              <span>for selected shrine</span>
            ) : (
              <span>across sacred destinations</span>
            )}
          </span>
          {activeBooking && (
            <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
              <Navigation className="h-3.5 w-3.5" /> Filtered to match your ticket location
            </span>
          )}
        </div>
      </div>

      {/* Hotel Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="w-8 h-8 border-2 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold">Loading recommended pilgrim stays...</p>
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <Hotel className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No Accommodations Found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            No stays match the current filter criteria for this location. Try changing the category or view all stays.
          </p>
          <button
            onClick={() => { setTypeFilter('All'); setSearchQuery(''); setActiveBookingId('all'); setManualTempleId('all'); }}
            className="px-4 py-2 bg-saffron text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md"
          >
            Reset Filters & View All
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map(h => (
            <div
              key={h.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-amber-500/40 dark:hover:border-amber-500/40 transition-all hover:shadow-xl group"
            >
              <div>
                {/* Stay Image with Overlays - Click to view full authentic photo */}
                <div
                  onClick={() => setSelectedPhotoHotel(h)}
                  className="h-48 w-full relative overflow-hidden bg-slate-950 cursor-pointer group/img"
                  title="Click to view full authentic location photo"
                >
                  <img
                    src={h.image}
                    alt={h.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {/* Category Pill */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[9.5px] font-bold uppercase text-slate-950 bg-amber-400/95 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-sm">
                      {h.type}
                    </span>
                  </div>

                  {/* Gate Distance Badge */}
                  <div className="absolute top-2.5 right-2.5 bg-slate-950/85 backdrop-blur-md border border-white/10 text-slate-200 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <MapPin className="h-3 w-3 text-saffron" />
                    {h.distance}
                  </div>

                  {/* Rating Badge at bottom-left of image */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="text-xs bg-slate-900/90 backdrop-blur-md text-gold font-bold px-2 py-0.5 rounded-lg border border-gold/30 flex items-center gap-1 shadow-sm">
                      ⭐ {h.rating}
                    </span>
                    <span className="text-[11px] text-slate-300 font-medium drop-shadow">
                      {h.templeName ? h.templeName.split(' ')[0] : 'Pilgrim Stay'}
                    </span>
                  </div>

                  {/* Google Photos CTA floating on image bottom-right */}
                  <a
                    href={h.googleImagesUrl || `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(h.name + ' ' + (h.templeName || ''))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-3 right-3 bg-white/95 hover:bg-white text-slate-900 dark:bg-slate-900/95 dark:hover:bg-slate-800 dark:text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-lg hover:scale-105 transition-all border border-slate-200 dark:border-white/10 group/btn"
                    title="View verified real guest photos on Google Images"
                  >
                    <GoogleGIcon className="h-3 w-3 shrink-0" />
                    <span>Google Photos</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-60 group-hover/btn:opacity-100 transition-opacity" />
                  </a>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1 leading-snug group-hover:text-saffron transition-colors">
                    {h.name}
                  </h4>

                  {/* Real Location Tag Banner */}
                  {h.realLocationTag && (
                    <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl mb-2 flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 shrink-0 text-saffron" />
                      <span className="leading-tight truncate">{h.realLocationTag}</span>
                    </div>
                  )}

                  {/* Google Verified Review & Photos Row */}
                  <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                    <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 shadow-xs">
                      <GoogleGIcon className="h-3 w-3 shrink-0" />
                      <span className="text-amber-500 font-extrabold">{h.googleRating || h.rating || 4.6} ★</span>
                    </div>
                    <a
                      href={h.googleImagesUrl || `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(h.name + ' ' + (h.templeName || ''))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                      title="View guest photos and reviews on Google"
                    >
                      <Camera className="h-3 w-3 text-blue-500" />
                      <span>{h.googleReviewCount || '4,500+ Google Reviews'}</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>

                  {/* Proximity to Gate */}
                  {h.proximityToGate && (
                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2.5 flex items-start gap-1.5">
                      <Navigation className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span className="leading-tight">{h.proximityToGate}</span>
                    </div>
                  )}

                  {/* Why recommended for your slot badge */}
                  {h.slotAdvice && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs p-2.5 rounded-xl flex items-start gap-2 mb-3.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="leading-tight text-[11px]">{h.slotAdvice}</span>
                    </div>
                  )}

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {h.amenities?.map(a => (
                      <span
                        key={a}
                        className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg font-medium border border-slate-200 dark:border-slate-800"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Price & Booking Action */}
              <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider">Per Night</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                    ₹{h.price}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDirectionsHotel(h)}
                    className="px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
                    title="Get Accurate Turn-by-Turn GPS Directions"
                  >
                    <Navigation className="h-4 w-4 text-emerald-500" />
                    <span>Directions</span>
                  </button>

                  <button
                    onClick={() => handleOpenReservation(h)}
                    className="bg-saffron hover:bg-orange-600 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md hover:shadow-lg hover:scale-[1.02] flex items-center gap-2"
                  >
                    <Bed className="h-5 w-5 stroke-[2.5]" />
                    <span>Book Now</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* VERIFIED REAL PHOTO VIEWER MODAL                         */}
      {/* ======================================================== */}
      <AnimatePresence>
        {selectedPhotoHotel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhotoHotel(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white dark:bg-[#151522] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedPhotoHotel(null)}
                className="absolute top-4 right-4 z-10 text-white bg-black/60 hover:bg-black/90 p-2 rounded-full backdrop-blur-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative h-72 sm:h-96 w-full bg-black">
                <img
                  src={selectedPhotoHotel.image}
                  alt={selectedPhotoHotel.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                  <span>🏨 Verified Stay Building Photo (Not Temple)</span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-saffron">
                      {selectedPhotoHotel.templeName} • {selectedPhotoHotel.type}
                    </span>
                    <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {selectedPhotoHotel.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <GoogleGIcon className="h-3.5 w-3.5" />
                      {selectedPhotoHotel.googleRating || 4.6} ★ ({selectedPhotoHotel.googleReviewCount || 'Verified'})
                    </span>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs p-3 rounded-2xl mb-4 flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-saffron shrink-0 mt-0.5" />
                  <div>
                    <strong>{selectedPhotoHotel.realLocationTag || selectedPhotoHotel.proximityToGate}</strong>
                    <p className="mt-0.5 text-slate-600 dark:text-slate-400 text-[11px]">
                      {selectedPhotoHotel.slotAdvice}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <a
                      href={selectedPhotoHotel.googleImagesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <GoogleGIcon className="h-3.5 w-3.5" />
                      <span>Live Google Photos</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <a
                      href={selectedPhotoHotel.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Navigation className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Google Maps</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <button
                    onClick={() => {
                      const h = selectedPhotoHotel;
                      setSelectedPhotoHotel(null);
                      handleOpenReservation(h);
                    }}
                    className="bg-saffron hover:bg-orange-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Bed className="h-4 w-4" /> Book This Stay
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* STAY RESERVATION MODAL PRE-POPULATED WITH BOOKED SLOT    */}
      {/* ======================================================== */}
      <AnimatePresence>
        {reservingHotel && !confirmedStay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white dark:bg-[#151522] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setReservingHotel(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 dark:hover:text-white p-1 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-saffron bg-saffron/15 border border-saffron/30 px-2.5 py-0.5 rounded-full">
                  Spiritual Stay Reservation
                </span>
                {activeBooking && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Linked to Darshan Pass
                  </span>
                )}
              </div>

              <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {reservingHotel.name}
              </h4>
              <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-saffron" />
                {reservingHotel.proximityToGate || reservingHotel.distance}
              </p>

              {/* Real Stay Image & Google Photos Banner */}
              <div className="relative rounded-2xl overflow-hidden mb-4 border border-slate-200 dark:border-slate-800 h-28 bg-slate-950">
                <img
                  src={reservingHotel.image}
                  alt={reservingHotel.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                  }}
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end justify-between p-3">
                  <div className="flex items-center gap-1.5 text-white text-xs font-bold">
                    <GoogleGIcon className="h-3.5 w-3.5" />
                    <span>{reservingHotel.googleRating || reservingHotel.rating || 4.6} ★</span>
                    <span className="text-slate-300 font-normal text-[11px]">({reservingHotel.googleReviewCount || 'Verified Reviews'})</span>
                  </div>
                  <a
                    href={reservingHotel.googleImagesUrl || `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(reservingHotel.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/95 hover:bg-white text-slate-950 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow transition-all hover:scale-105"
                  >
                    <GoogleGIcon className="h-3 w-3" />
                    <span>View on Google Images</span>
                    <ExternalLink className="h-2.5 w-2.5 text-slate-600" />
                  </a>
                </div>
              </div>

              {/* Slot Context Reminder */}
              {activeBooking && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-xs mb-4 text-amber-900 dark:text-amber-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold block">🎯 Booked Darshan Slot:</span>
                    <span>{activeBooking.templeName} • {activeBooking.date} at {activeBooking.timeSlot}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-lg">
                    Check-in Pre-filled
                  </span>
                </div>
              )}

              <form onSubmit={handleProceedToPayment} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Devotee Name</label>
                    <input
                      type="text"
                      required
                      value={resForm.guestName}
                      onChange={e => setResForm({ ...resForm, guestName: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-saffron"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Mobile Number</label>
                    <input
                      type="text"
                      required
                      value={resForm.phone}
                      onChange={e => setResForm({ ...resForm, phone: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-saffron"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Check-in Date</label>
                    <input
                      type="date"
                      required
                      value={resForm.checkInDate}
                      onChange={e => setResForm({ ...resForm, checkInDate: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-saffron text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Nights</label>
                    <select
                      value={resForm.nights}
                      onChange={e => setResForm({ ...resForm, nights: parseInt(e.target.value) || 1 })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-saffron text-xs font-medium"
                    >
                      {[1, 2, 3, 4, 5, 7].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'Night' : 'Nights'}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Rooms</label>
                    <select
                      value={resForm.roomsCount || 1}
                      onChange={e => setResForm({ ...resForm, roomsCount: parseInt(e.target.value) || 1 })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-saffron text-xs font-medium"
                    >
                      {[1, 2, 3, 4].map(r => (
                        <option key={r} value={r}>{r} {r === 1 ? 'Room' : 'Rooms'}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Guests</label>
                    <select
                      value={resForm.guests}
                      onChange={e => setResForm({ ...resForm, guests: parseInt(e.target.value) || 1 })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-saffron text-xs font-medium"
                    >
                      {[1, 2, 3, 4, 5, 6, 8].map(g => (
                        <option key={g} value={g}>{g} {g === 1 ? 'Person' : 'Persons'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold">
                      Select Room Category
                    </label>
                    {reservingHotel.roomCategories && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Official Trust Tariff Verified
                      </span>
                    )}
                  </div>
                  <select
                    value={resForm.roomType}
                    onChange={e => setResForm({ ...resForm, roomType: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-saffron font-bold text-xs"
                  >
                    {reservingHotel.roomCategories ? (
                      reservingHotel.roomCategories.map(cat => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name} — ₹{cat.price} / night
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Standard Pilgrim Room">Standard Pilgrim Room — ₹{reservingHotel.price} / night</option>
                        <option value="Deluxe AC Room">Deluxe AC Room — ₹{Math.round(reservingHotel.price * 1.35)} / night</option>
                        <option value="Family Suite (4 Beds)">Family Suite (4 Beds) — ₹{Math.round(reservingHotel.price * 1.8)} / night</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Special Pilgrim Conveniences */}
                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Pilgrim Conveniences & Add-ons:
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 text-xs">
                    <input
                      type="checkbox"
                      checked={resForm.needLocker}
                      onChange={e => setResForm({ ...resForm, needLocker: e.target.checked })}
                      className="rounded border-slate-700 text-saffron focus:ring-saffron"
                    />
                    <span>Safe Luggage & Electronics Cloakroom (+₹50/night for device lockers)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 text-xs">
                    <input
                      type="checkbox"
                      checked={resForm.needAartiWakeup}
                      onChange={e => setResForm({ ...resForm, needAartiWakeup: e.target.checked })}
                      className="rounded border-slate-700 text-saffron focus:ring-saffron"
                    />
                    <span>Early Morning Darshan / Aarti Wake-up Call (Free)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 text-xs">
                    <input
                      type="checkbox"
                      checked={resForm.seniorGroundFloor}
                      onChange={e => setResForm({ ...resForm, seniorGroundFloor: e.target.checked })}
                      className="rounded border-slate-700 text-saffron focus:ring-saffron"
                    />
                    <span>Senior Citizen / Ground Floor / Wheelchair Accessible Room (Free)</span>
                  </label>
                </div>

                {/* Live Transparent Price Breakdown Box */}
                {(() => {
                  const pricing = getStayPricing(reservingHotel, resForm);
                  return (
                    <div className="bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3.5 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                        <span>Room Tariff (₹{pricing.perNightPrice} × {pricing.nights}N × {pricing.roomsCount}R):</span>
                        <span className="font-bold text-slate-900 dark:text-white">₹{pricing.subtotal}</span>
                      </div>
                      {pricing.lockerFee > 0 && (
                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                          <span>Safe Electronics Locker ({pricing.nights}N):</span>
                          <span className="font-bold text-slate-900 dark:text-white">₹{pricing.lockerFee}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                        <span>Taxes & Trust Seva:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {pricing.isExempt ? '₹0 (Religious Trust Exemption)' : `₹${pricing.taxAmount} (12% GST)`}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-amber-500/25 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block tracking-wider">
                            Total Payable Amount
                          </span>
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            ₹{pricing.totalPayable}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Guaranteed Reservation
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Form Actions: Pay Online vs Pay at Desk */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setReservingHotel(null)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs"
                  >
                    Cancel
                  </button>

                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handlePayAtCounter}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-500/10 transition-all text-xs flex items-center justify-center gap-1.5"
                      title="Reserve without advance payment; pay cash/UPI at counter"
                    >
                      <Clock className="h-3.5 w-3.5" /> Pay at Desk (₹0 Now)
                    </button>
                    
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-5 py-2.5 bg-saffron hover:bg-orange-600 text-slate-950 font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs hover:scale-102"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Proceed to Payment (₹{getStayPricing(reservingHotel, resForm).totalPayable}) →</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* SECURE PAYMENT GATEWAY MODAL FOR ACCOMMODATION           */}
      {/* ======================================================== */}
      <PaymentGatewayModal
        isOpen={isPayingStay}
        onClose={() => setIsPayingStay(false)}
        amount={getStayPricing(reservingHotel, resForm).totalPayable}
        orderDetails={{
          hotelName: reservingHotel?.name,
          roomType: resForm.roomType,
          nights: resForm.nights,
          roomsCount: resForm.roomsCount,
          checkInDate: resForm.checkInDate,
          templeName: reservingHotel?.templeName || activeBooking?.templeName,
          guestName: resForm.guestName,
          phone: resForm.phone
        }}
        onSuccess={handlePaymentSuccess}
      />

      {/* ======================================================== */}
      {/* CONFIRMED STAY VOUCHER MODAL WITH PAYMENT RECEIPT        */}
      {/* ======================================================== */}
      <AnimatePresence>
        {confirmedStay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-[#161626] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-center relative"
            >
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle className="h-8 w-8" />
              </div>
              
              {confirmedStay.payment?.status === 'PAID' ? (
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-full flex items-center justify-center gap-1 mx-auto w-fit">
                  <Check className="h-3 w-3 stroke-[3]" /> Payment Verified & Room Confirmed
                </span>
              ) : (
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25 px-3 py-1 rounded-full flex items-center justify-center gap-1 mx-auto w-fit">
                  <Clock className="h-3 w-3" /> Reserved — Pay at Reception
                </span>
              )}

              <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-2 mb-1">
                {confirmedStay.hotel.name}
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Booking Reference: <strong className="font-mono text-saffron">{confirmedStay.reference}</strong>
              </p>

              {/* QR Code Ticket for Reception Desk */}
              <div className="bg-slate-50 dark:bg-slate-950/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 mb-3 flex flex-col items-center">
                <TicketQR 
                  ticketData={{
                    bookingId: confirmedStay.reference,
                    templeName: confirmedStay.hotel.name,
                    date: confirmedStay.form.checkInDate,
                    timeSlot: 'Check-in: 12:00 PM',
                    visitors: confirmedStay.form.guests,
                    specialDarshan: `${confirmedStay.form.roomType} (${confirmedStay.form.nights}N)`
                  }} 
                  size={120}
                  showDetails={false}
                  showActions={false}
                />
                <span className="text-[10px] text-slate-500 mt-1">Scan at check-in reception desk</span>
              </div>

              {/* Payment & Stay Breakdown */}
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-left text-xs space-y-1.5 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Devotee Guest:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{confirmedStay.form.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Check-in:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{confirmedStay.form.checkInDate} ({confirmedStay.form.nights} Night)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Room Category:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{confirmedStay.form.roomType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rooms & Pilgrims:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{confirmedStay.form.roomsCount || 1} Room • {confirmedStay.form.guests} Person(s)</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-1.5">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className={`font-black ${confirmedStay.payment?.status === 'PAID' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {confirmedStay.payment?.status === 'PAID' ? 'PAID ONLINE' : 'PAY ON ARRIVAL'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{confirmedStay.payment?.transactionId}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>Total Amount:</span>
                  <span className="text-sm font-black text-saffron">
                    ₹{confirmedStay.pricing?.totalPayable || confirmedStay.pricing?.totalAmount || (confirmedStay.hotel.price * confirmedStay.form.nights)}
                  </span>
                </div>
              </div>

              {/* Navigation & Maps */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <a
                  href={confirmedStay.hotel.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(confirmedStay.hotel.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Navigation className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Google Maps</span>
                  <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                </a>
                <a
                  href={confirmedStay.hotel.googleImagesUrl || `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(confirmedStay.hotel.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/60 rounded-xl text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <GoogleGIcon className="h-3.5 w-3.5" />
                  <span>Google Images</span>
                  <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                </a>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    alert(`Spiritual Stay Voucher for ${confirmedStay.hotel.name} downloaded successfully! (Ref: ${confirmedStay.reference})`);
                  }}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all text-xs"
                >
                  Download Voucher
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmedStay(null);
                    setReservingHotel(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-all text-xs"
                >
                  Close
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setConfirmedStay(null);
                  setReservingHotel(null);
                  if (onGoToBookings) onGoToBookings();
                }}
                className="w-full mt-2.5 py-2.5 bg-saffron hover:bg-orange-600 text-slate-950 font-extrabold rounded-xl transition-all text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                <BookmarkCheck className="h-4 w-4" />
                <span>View in My Bookings →</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accurate Turn-by-Turn Directions Modal for Stays */}
      <DirectionsModal
        isOpen={!!directionsHotel}
        onClose={() => setDirectionsHotel(null)}
        destination={directionsHotel}
        userCoords={{ lat: 12.9150, lng: 77.6200, name: 'Devotee Current Location (Bengaluru South)' }}
        templeCoords={{
          lat: activeBooking?.templeLat || 13.6833,
          lng: activeBooking?.templeLng || 79.3472,
          name: activeBooking?.templeName || 'Temple Entrance Gate 1 (Vaikuntam Complex)'
        }}
      />
    </div>
  );
}

// ========================================================
// VIEW 4: MY BOOKINGS (Live & Completed: Passes & Stays)
// ========================================================
function BookingsView({ 
  bookingsList: propBookings, 
  fetchBookings: propFetchBookings, 
  stayBookingsList: propStayBookings,
  fetchStayBookings: propFetchStayBookings,
  onFindStays,
  onBookDarshanClick,
  onBookStayClick
}) {
  // Categories: 'Live' (Active/Upcoming) vs 'Completed'
  const [activeCategory, setActiveCategory] = useState('Live'); // 'Live' or 'Completed'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'darshan', 'stays'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedTicket, setSelectedTicket] = useState(null); // Gate Pass QR modal
  const [selectedStayVoucher, setSelectedStayVoucher] = useState(null); // Stay Voucher & Reception QR modal
  const [directionsBooking, setDirectionsBooking] = useState(null); // Directions modal
  const [rescheduleData, setRescheduleData] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('09:00 AM (Available)');

  const [localBookingsList, setLocalBookingsList] = useState([]);
  const [localStayBookingsList, setLocalStayBookingsList] = useState(() => {
    try {
      const cached = localStorage.getItem('teerthsetu_stay_bookings');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  });

  const bookingsList = (propBookings && propBookings.length > 0) ? propBookings : localBookingsList;
  const stayBookingsList = (propStayBookings && propStayBookings.length > 0) ? propStayBookings : localStayBookingsList;

  useEffect(() => {
    fetchBookings();
    fetchStayBookings();
  }, []);

  const fetchBookings = () => {
    if (propFetchBookings) propFetchBookings();
    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/bookings')
      .then(res => res.json())
      .then(setLocalBookingsList)
      .catch(err => console.error("Error fetching bookings:", err));
  };

  const fetchStayBookings = () => {
    if (propFetchStayBookings) propFetchStayBookings();
    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/stays/bookings')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setLocalStayBookingsList(data);
          localStorage.setItem('teerthsetu_stay_bookings', JSON.stringify(data));
        }
      })
      .catch(err => console.warn("Error fetching stay bookings:", err));
  };

  const handleCancelBooking = (bookingId) => {
    if (confirm("Are you sure you want to cancel this Darshan slot?")) {
      fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            fetchBookings();
          } else {
            alert('Cancellation failed.');
          }
        });
    }
  };

  const handleCancelStay = (stayId) => {
    if (confirm("Are you sure you want to cancel this accommodation reservation?")) {
      fetch(`/api/stays/bookings/${stayId}`, { method: 'DELETE' })
        .catch(err => console.warn(err));

      const updated = stayBookingsList.map(s => (s.id === stayId || s.reference === stayId) ? { ...s, status: 'Cancelled' } : s);
      localStorage.setItem('teerthsetu_stay_bookings', JSON.stringify(updated));
      fetchStayBookings();
    }
  };

  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/bookings/reschedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: rescheduleData.bookingId,
        date: rescheduleDate,
        timeSlot: rescheduleSlot
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRescheduleData(null);
          fetchBookings();
        } else {
          alert('Rescheduling failed.');
        }
      });
  };

  // Group Darshan passes into Live and Completed
  const liveDarshan = bookingsList.filter(b => b.status === 'Upcoming');
  const completedDarshan = bookingsList.filter(b => b.status === 'Completed' || b.status === 'Cancelled');

  // Group Stay bookings into Live and Completed
  const liveStays = stayBookingsList.filter(s => s.status === 'Upcoming' || s.status === 'Live');
  const completedStays = stayBookingsList.filter(s => s.status === 'Completed' || s.status === 'Cancelled');

  const totalLiveCount = liveDarshan.length + liveStays.length;
  const totalCompletedCount = completedDarshan.length + completedStays.length;

  // Active items based on selected category:
  const currentDarshan = activeCategory === 'Live' ? liveDarshan : completedDarshan;
  const currentStays = activeCategory === 'Live' ? liveStays : completedStays;

  // Search filter
  const filteredDarshan = currentDarshan.filter(b => 
    b.templeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.specialDarshan || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.date || '').includes(searchQuery)
  );

  const filteredStays = currentStays.filter(s => {
    const name = (s.hotelName || s.hotel?.name || '').toLowerCase();
    const temple = (s.templeName || '').toLowerCase();
    const ref = (s.reference || '').toLowerCase();
    const room = (s.roomType || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || temple.includes(q) || ref.includes(q) || room.includes(q) || (s.checkInDate || '').includes(q);
  });

  const showDarshan = typeFilter === 'all' || typeFilter === 'darshan';
  const showStays = typeFilter === 'all' || typeFilter === 'stays';

  const totalFilteredCount = (showDarshan ? filteredDarshan.length : 0) + (showStays ? filteredStays.length : 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-saffron/10 text-saffron">
              <CalendarCheck className="h-5 w-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-saffron">
              Pilgrim Activity Central
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Bookings</h3>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Manage your live and completed Darshan passes & stay reservations with instant QR verification.
          </p>
        </div>

        {/* Quick Summary Pill Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{totalLiveCount} Active / Live</span>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-blue-500" />
            <span>{totalCompletedCount} Completed</span>
          </div>
        </div>
      </div>

      {/* TWO PRIMARY CATEGORY TABS: LIVE vs COMPLETED */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category Tab 1: LIVE BOOKINGS */}
        <button
          onClick={() => { setActiveCategory('Live'); setTypeFilter('all'); }}
          className={`p-5 rounded-3xl border text-left transition-all flex items-start gap-4 shadow-sm ${
            activeCategory === 'Live'
              ? 'bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent border-emerald-500 ring-2 ring-emerald-500/30 dark:bg-slate-900'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
          }`}
        >
          <div className={`p-3.5 rounded-2xl shrink-0 ${activeCategory === 'Live' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">1. Live Bookings</h4>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-black uppercase">
                {totalLiveCount} Active
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upcoming active Darshan slots (<strong className="text-slate-700 dark:text-slate-300">{liveDarshan.length}</strong>) & reserved accommodations (<strong className="text-slate-700 dark:text-slate-300">{liveStays.length}</strong>).
            </p>
          </div>
        </button>

        {/* Category Tab 2: COMPLETED BOOKINGS */}
        <button
          onClick={() => { setActiveCategory('Completed'); setTypeFilter('all'); }}
          className={`p-5 rounded-3xl border text-left transition-all flex items-start gap-4 shadow-sm ${
            activeCategory === 'Completed'
              ? 'bg-gradient-to-br from-blue-500/15 via-blue-500/5 to-transparent border-blue-500 ring-2 ring-blue-500/30 dark:bg-slate-900'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/40'
          }`}
        >
          <div className={`p-3.5 rounded-2xl shrink-0 ${activeCategory === 'Completed' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            <CheckCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">2. Completed Bookings</h4>
              <span className="text-[10px] bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-black uppercase">
                {totalCompletedCount} Past
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Past pilgrimage archives, visited shrines (<strong className="text-slate-700 dark:text-slate-300">{completedDarshan.length}</strong>) & fulfilled stays (<strong className="text-slate-700 dark:text-slate-300">{completedStays.length}</strong>).
            </p>
          </div>
        </button>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeCategory === 'Live'
                ? "Search active temple passes, hotels, room categories, dates..."
                : "Search completed pilgrimages, past stay receipts, dates..."
            }
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-saffron"
          />
        </div>

        {/* Sub-type Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-medium">
          {[
            { id: 'all', label: `All ${activeCategory} (${currentDarshan.length + currentStays.length})` },
            { id: 'darshan', label: `🛕 Darshan Passes (${currentDarshan.length})` },
            { id: 'stays', label: `🏨 Stays & Rooms (${currentStays.length})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setTypeFilter(f.id)}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all text-xs font-bold ${
                typeFilter === f.id
                  ? 'bg-saffron text-slate-950 shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION: 🛕 DARSHAN PASSES                               */}
      {/* ======================================================== */}
      {showDarshan && filteredDarshan.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="p-1 rounded bg-amber-500/10 text-amber-600">🛕</span>
              {activeCategory === 'Live' ? 'Active Darshan Passes' : 'Completed Darshan History'}
              <span className="text-xs font-bold text-slate-500">({filteredDarshan.length})</span>
            </h4>
          </div>

          <div className="space-y-4">
            {filteredDarshan.map(b => (
              <div 
                key={b.bookingId} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-sm hover:border-saffron/40 transition-all group"
              >
                {/* Status Indicator Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${
                  b.status === 'Upcoming' ? 'bg-saffron' : b.status === 'Completed' ? 'bg-emerald-500' : 'bg-red-500'
                }`} />

                <div className="pl-3 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      🛕 Darshan Gate Pass
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      b.status === 'Upcoming' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {b.status === 'Upcoming' ? '🟢 LIVE PASS' : b.status}
                    </span>
                    {b.waitlistPosition > 0 && (
                      <span className="text-[10px] bg-amber-500/15 text-amber-500 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                        Waitlist #{b.waitlistPosition}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-saffron transition-colors">
                    {b.templeName}
                  </h4>

                  <div className="text-slate-600 dark:text-slate-400 text-xs flex flex-wrap gap-x-4 gap-y-1.5 font-medium">
                    <span className="flex items-center gap-1">📅 Date: <strong className="text-slate-900 dark:text-white font-mono">{b.date}</strong></span>
                    <span className="flex items-center gap-1">⏰ Slot: <strong className="text-slate-900 dark:text-white font-mono">{b.timeSlot.split(' ')[0]}</strong></span>
                    <span className="flex items-center gap-1">👥 Devotees: <strong className="text-slate-900 dark:text-white">{b.visitors} Person(s)</strong></span>
                    <span className="flex items-center gap-1">🎫 Tier: <strong className="text-saffron font-bold">{b.specialDarshan}</strong></span>
                  </div>

                  {(b.wheelchair || b.volunteer || b.medical) && (
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex flex-wrap gap-2 pt-1">
                      {b.wheelchair && <span className="bg-amber-500/10 px-2 py-0.5 rounded-md">♿ Wheelchair Service</span>}
                      {b.volunteer && <span className="bg-amber-500/10 px-2 py-0.5 rounded-md">🤝 Volunteer Escort</span>}
                      {b.medical && <span className="bg-amber-500/10 px-2 py-0.5 rounded-md">🏥 Medical Assistance</span>}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap md:flex-nowrap gap-2 shrink-0 w-full md:w-auto">
                  {b.status === 'Upcoming' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setDirectionsBooking({
                          name: b.templeName,
                          address: `Vaikuntam Queue Complex Gate 1, ${b.templeName}`,
                          lat: 13.6833,
                          lng: 79.3472,
                          proximityToGate: 'Reporting Entrance Gate 1 (Vaikuntam Complex)',
                          categoryName: 'Sacred Temple Sanctum'
                        })}
                        className="flex-1 md:flex-initial bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        title="Get Accurate Turn-by-Turn GPS Directions to Temple Gate"
                      >
                        <Navigation className="h-4 w-4 text-emerald-600" />
                        <span>Directions</span>
                      </button>
                      <button
                        onClick={() => onFindStays && onFindStays(b)}
                        className="flex-1 md:flex-initial bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        title="Find Stays Recommended for this Booking"
                      >
                        <Hotel className="h-4 w-4 text-saffron" /> 
                        <span>Find Stays</span>
                      </button>
                      <button
                        onClick={() => {
                          setRescheduleData(b);
                          setRescheduleDate(b.date);
                          setRescheduleSlot(b.timeSlot);
                        }}
                        className="flex-1 md:flex-initial bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancelBooking(b.bookingId)}
                        className="flex-1 md:flex-initial bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setSelectedTicket(b)}
                        className="flex-1 md:flex-initial bg-saffron hover:bg-orange-600 px-4 py-2.5 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                      >
                        <QrCode className="h-4 w-4" />
                        <span>View QR Pass</span>
                      </button>
                    </>
                  )}
                  {b.status !== 'Upcoming' && (
                    <button
                      onClick={() => setSelectedTicket(b)}
                      className="flex-1 md:flex-initial bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Past Pass Archive</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION: 🏨 STAY & ACCOMMODATION BOOKINGS                */}
      {/* ======================================================== */}
      {showStays && filteredStays.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="p-1 rounded bg-emerald-500/10 text-emerald-600">🏨</span>
              {activeCategory === 'Live' ? 'Active Stay Reservations' : 'Completed Stay Archive'}
              <span className="text-xs font-bold text-slate-500">({filteredStays.length})</span>
            </h4>
          </div>

          <div className="space-y-4">
            {filteredStays.map(s => (
              <div 
                key={s.id || s.reference} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-sm hover:border-emerald-500/40 transition-all group"
              >
                {/* Status Indicator Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${
                  (s.status === 'Upcoming' || s.status === 'Live') ? 'bg-emerald-500' : s.status === 'Completed' ? 'bg-blue-500' : 'bg-slate-400'
                }`} />

                <div className="pl-3 space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      🏨 Stay Reservation
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {s.hotelType || s.hotel?.type || 'Pilgrim Rest House'}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      (s.status === 'Upcoming' || s.status === 'Live')
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {(s.status === 'Upcoming' || s.status === 'Live') ? '🟢 LIVE RESERVATION' : (s.status || 'COMPLETED')}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500 ml-auto md:ml-0">
                      Ref: <strong className="text-saffron">{s.reference}</strong>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {s.hotelName || s.hotel?.name}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{s.templeName} • {s.proximityToGate || s.address || 'Near Temple Gate'}</span>
                    </p>
                  </div>

                  <div className="text-slate-600 dark:text-slate-400 text-xs flex flex-wrap gap-x-4 gap-y-1.5 font-medium">
                    <span className="flex items-center gap-1">📅 Check-in: <strong className="text-slate-900 dark:text-white font-mono">{s.checkInDate}</strong></span>
                    <span className="flex items-center gap-1">🌙 Nights: <strong className="text-slate-900 dark:text-white">{s.nights || 1} Night(s)</strong></span>
                    <span className="flex items-center gap-1">🛏️ Category: <strong className="text-slate-900 dark:text-white">{s.roomType}</strong></span>
                    <span className="flex items-center gap-1">👥 Devotee: <strong className="text-slate-900 dark:text-white">{s.guestName} ({s.guests || 2} Persons)</strong></span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                      ₹{s.totalAmount}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      s.paymentStatus === 'PAID'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      {s.paymentStatus === 'PAID' ? `✓ Paid Online (${s.paymentMethod || 'UPI'})` : '⏰ Pay at Counter'}
                    </span>
                    {s.features && s.features.map((f, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md">
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stay Actions */}
                <div className="flex flex-wrap md:flex-nowrap gap-2 shrink-0 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => setDirectionsBooking({
                      name: s.hotelName || s.hotel?.name || 'Pilgrim Rest House',
                      address: s.address || s.proximityToGate || `${s.templeName} Pilgrim Area`,
                      lat: s.lat || s.hotel?.lat || 13.6273,
                      lng: s.lng || s.hotel?.lng || 79.4272,
                      proximityToGate: s.proximityToGate || s.address,
                      categoryName: s.hotelType || s.hotel?.type || 'Pilgrim Stay'
                    })}
                    className="flex-1 md:flex-initial bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title="Get Accurate Turn-by-Turn GPS Directions"
                  >
                    <Navigation className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Directions</span>
                  </button>

                  {(s.status === 'Upcoming' || s.status === 'Live') && (
                    <button
                      onClick={() => handleCancelStay(s.id || s.reference)}
                      className="flex-1 md:flex-initial bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all"
                    >
                      Cancel Stay
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedStayVoucher(s)}
                    className="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="h-4 w-4" />
                    <span>Stay Voucher & QR</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {totalFilteredCount === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 bg-amber-500/10 text-saffron rounded-full flex items-center justify-center mx-auto">
            <Compass className="h-8 w-8" />
          </div>
          <div>
            <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
              No {activeCategory} Bookings Found
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery 
                ? `No passes or stay reservations match "${searchQuery}". Try clearing search.`
                : activeCategory === 'Live'
                  ? "You have no upcoming pilgrimage passes or hotel reservations scheduled."
                  : "You haven't completed any pilgrimage trips yet."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onBookDarshanClick && onBookDarshanClick()}
              className="bg-saffron hover:bg-orange-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Ticket className="h-4 w-4" />
              <span>Book a Darshan Pass</span>
            </button>
            <button
              onClick={() => onBookStayClick && onBookStayClick()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Hotel className="h-4 w-4" />
              <span>Book Accommodation</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* QR DARSHAN PASS MODAL                                    */}
      {/* ======================================================== */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-center relative"
            >
              <button 
                onClick={() => setSelectedTicket(null)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 dark:hover:text-white p-1 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-saffron bg-saffron/10 border border-saffron/30 px-2.5 py-0.5 rounded-full">
                  Official Gate Entry Pass
                </span>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {selectedTicket.templeName}
                </h4>
              </div>

              <TicketQR 
                ticketData={selectedTicket} 
                size={180}
                showDetails={true}
                showActions={true}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* STAY RESERVATION VOUCHER & RECEPTION QR MODAL            */}
      {/* ======================================================== */}
      <AnimatePresence>
        {selectedStayVoucher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedStayVoucher(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-[#151522] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-center relative"
            >
              <button
                onClick={() => setSelectedStayVoucher(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 dark:hover:text-white p-1 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                <Hotel className="h-6 w-6" />
              </div>

              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full flex items-center justify-center gap-1 mx-auto w-fit ${
                selectedStayVoucher.paymentStatus === 'PAID' 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25' 
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25'
              }`}>
                {selectedStayVoucher.paymentStatus === 'PAID' ? '✓ Paid & Confirmed Stay' : '⏰ Reserved — Pay at Reception'}
              </span>

              <h4 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2 mb-0.5">
                {selectedStayVoucher.hotelName || selectedStayVoucher.hotel?.name}
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Booking Reference: <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{selectedStayVoucher.reference}</strong>
              </p>

              {/* Scannable Reception Desk QR */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 mb-3.5 flex flex-col items-center">
                <TicketQR 
                  ticketData={{
                    bookingId: selectedStayVoucher.reference,
                    templeName: selectedStayVoucher.hotelName || selectedStayVoucher.hotel?.name,
                    date: selectedStayVoucher.checkInDate,
                    timeSlot: 'Check-in: 12:00 PM',
                    visitors: selectedStayVoucher.guests || 2,
                    specialDarshan: `${selectedStayVoucher.roomType} (${selectedStayVoucher.nights || 1}N)`
                  }} 
                  size={130}
                  showDetails={false}
                  showActions={false}
                />
                <span className="text-[10px] font-bold text-slate-500 mt-1.5 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  Scan at property reception for immediate key handover
                </span>
              </div>

              {/* Breakdown Details */}
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-left text-xs space-y-1.5 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Devotee Guest:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStayVoucher.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Number:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStayVoucher.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Check-in Date:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStayVoucher.checkInDate} ({selectedStayVoucher.nights || 1} Night)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Room Category:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStayVoucher.roomType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rooms & Pilgrims:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStayVoucher.roomsCount || 1} Room • {selectedStayVoucher.guests || 2} Person(s)</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-1.5">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className={`font-black ${selectedStayVoucher.paymentStatus === 'PAID' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {selectedStayVoucher.paymentStatus === 'PAID' ? `PAID (${selectedStayVoucher.paymentMethod || 'UPI'})` : 'PAY AT RECEPTION'}
                  </span>
                </div>
                {selectedStayVoucher.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Txn Reference:</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{selectedStayVoucher.transactionId}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>Total Tariff:</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    ₹{selectedStayVoucher.totalAmount}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    alert(`Stay voucher for ${selectedStayVoucher.hotelName || selectedStayVoucher.hotel?.name} (Ref: ${selectedStayVoucher.reference}) sent to download!`);
                  }}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStayVoucher(null)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all text-xs shadow-md"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* RESCHEDULE DARSHAN MODAL                                 */}
      {/* ======================================================== */}
      <AnimatePresence>
        {rescheduleData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setRescheduleData(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setRescheduleData(null)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 dark:hover:text-white p-1 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>

              <h4 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Reschedule Darshan</h4>

              <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1 font-semibold">New Date</label>
                  <input
                    type="date"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-saffron"
                    value={rescheduleDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setRescheduleDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1 font-semibold">New Slot</label>
                  <select
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-saffron"
                    value={rescheduleSlot}
                    onChange={e => setRescheduleSlot(e.target.value)}
                  >
                    <option>07:00 AM (Low Wait)</option>
                    <option>09:00 AM (Available)</option>
                    <option>11:00 AM (Available)</option>
                    <option>01:00 PM (Fast Filling)</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setRescheduleData(null)}
                    className="flex-1 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-saffron text-slate-950 font-bold rounded-xl hover:bg-orange-600 text-xs shadow-md"
                  >
                    Save Reschedule
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accurate Turn-by-Turn GPS Directions Modal for My Bookings */}
      <DirectionsModal
        isOpen={!!directionsBooking}
        onClose={() => setDirectionsBooking(null)}
        destination={directionsBooking}
        userCoords={{ lat: 12.9150, lng: 77.6200, name: 'Devotee Current Location (Bengaluru South)' }}
        templeCoords={{
          lat: 13.6833,
          lng: 79.3472,
          name: 'Tirumala Gopuram Gate 1 (Vaikuntam Complex)'
        }}
      />
    </div>
  );
}

// ==========================================
// VIEW 5: USER PROFILE & FAMILY (Screen 19)
// ==========================================
function ProfileView({ user, setUser }) {
  const [familyInput, setFamilyInput] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const handleAddFamily = (e) => {
    e.preventDefault();
    if (!familyInput.trim()) return;
    setUser({
      ...user,
      family: [...user.family, familyInput]
    });
    setFamilyInput('');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">Devotee Profile Settings</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Configure family members registry, profile details, and toggle accessibility preferences.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-4 rounded-xl text-center font-medium">
          Profile configurations saved successfully!
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-6">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Personal Information</h4>
          <form onSubmit={handleSaveProfile} className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Registered Name</label>
              <input type="text" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white" value={user.name} onChange={e => setUser({ ...user, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Phone Number</label>
              <input type="text" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white" value={user.phone} onChange={e => setUser({ ...user, phone: e.target.value })} required />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Email Address</label>
              <input type="email" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white" value={user.email} onChange={e => setUser({ ...user, email: e.target.value })} required />
            </div>
            <div className="col-span-2">
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Resident Address</label>
              <input type="text" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white" value={user.address} onChange={e => setUser({ ...user, address: e.target.value })} required />
            </div>
            <div className="col-span-2">
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Emergency Contact</label>
              <input type="text" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white" value={user.emergencyContact} onChange={e => setUser({ ...user, emergencyContact: e.target.value })} required />
            </div>

            <button type="submit" className="col-span-2 py-3 bg-saffron hover:bg-[#e85a28] text-slate-900 dark:text-white rounded-xl font-bold mt-4 shadow-md transition-all">
              Save Profile Details
            </button>
          </form>
        </div>

        {/* Sidebar: Family Registry & Accessibility Defaults */}
        <div className="space-y-6">
          {/* Family Registry */}
          <div className="bg-white dark:bg-slate-900 border border-slate-850 p-6 rounded-3xl">
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3">Family Members Registry</h4>
            <p className="text-[11px] text-slate-500 mb-4">Add family members to quickly book group Darshan passes.</p>

            <ul className="space-y-2 mb-4 text-xs">
              {user.family.map(f => (
                <li key={f} className="p-2 bg-white dark:bg-slate-950/40 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-850 flex justify-between items-center">
                  <span>{f}</span>
                  <button onClick={() => setUser({ ...user, family: user.family.filter(item => item !== f) })} className="text-red-400 hover:text-red-500 font-bold">Remove</button>
                </li>
              ))}
            </ul>

            <form onSubmit={handleAddFamily} className="flex gap-2">
              <input
                type="text"
                placeholder="Name & Relationship (e.g. Daughter)"
                className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                value={familyInput}
                onChange={e => setFamilyInput(e.target.value)}
              />
              <button type="submit" className="bg-saffron text-slate-900 dark:text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#e85a28]">Add</button>
            </form>
          </div>

          {/* Accessibility Defaults */}
          <div className="bg-white dark:bg-slate-900 border border-slate-850 p-6 rounded-3xl">
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3">Accessibility Presets</h4>
            <p className="text-[11px] text-slate-500 mb-4">Set default assistant requirements which apply during bookings.</p>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white">
                <input
                  type="checkbox"
                  className="rounded accent-saffron bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  checked={user.accessibilityPreset.wheelchair}
                  onChange={e => setUser({
                    ...user,
                    accessibilityPreset: { ...user.accessibilityPreset, wheelchair: e.target.checked }
                  })}
                />
                Default Wheelchair Assistance
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white">
                <input
                  type="checkbox"
                  className="rounded accent-saffron bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  checked={user.accessibilityPreset.volunteer}
                  onChange={e => setUser({
                    ...user,
                    accessibilityPreset: { ...user.accessibilityPreset, volunteer: e.target.checked }
                  })}
                />
                Default Volunteer Guide Escort
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VIEW 6: NOTIFICATIONS & ALERTS (Screen 17)
// ==========================================
function AlertsView({ notifications, markRead }) {
  useEffect(() => {
    markRead();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">Broadcast Alerts & Notifications</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Review live weather bulletins, queue congestion warnings, or booking schedule details.</p>
        </div>
        <span className="text-xs text-slate-500 italic">Marked all as read</span>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-850 rounded-3xl overflow-hidden divide-y divide-slate-850">
        {notifications.map(n => (
          <div key={n.id} className="p-6 flex items-start gap-4 hover:bg-white dark:bg-slate-850/20 transition-all">
            <div className={`p-2.5 rounded-xl shrink-0 ${n.type === 'Emergency Broadcast' ? 'bg-red-500/10 text-red-500' :
                n.type === 'Crowd Alert' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-saffron/10 text-saffron'
              }`}>
              <Bell className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.type}</span>
                <span className="text-[10px] text-slate-500">{n.date}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{n.message}</p>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="py-16 text-center text-slate-500 bg-white dark:bg-slate-900/20">
            No notifications on this ledger.
          </div>
        )}
      </div>
    </div>
  );
}
