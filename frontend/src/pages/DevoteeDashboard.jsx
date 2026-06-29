import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Clock, Users, QrCode, LogOut, Bell, Compass, Calendar, 
  Search, ShieldAlert, HeartHandshake, Hotel, Map, User, CheckCircle, 
  CreditCard, ChevronRight, X, Sparkles, Filter, Info, PhoneCall, Star, Phone, Activity, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function DevoteeDashboard() {
  const [activeTab, setActiveTab] = useState('explore'); // explore, planner, hotels, bookings, profile, alerts
  const [temples, setTemples] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState({
    name: 'Devendra Kumar',
    email: 'devendra@teerthsethu.in',
    phone: '+91 9876543210',
    address: 'Sector 4, Dwarka, New Delhi',
    aadhaar: '4820-1928-8812',
    emergencyContact: 'Amit Kumar (+91 9876543211)',
    family: ['Sita Devi (Wife)', 'Karan Kumar (Son)'],
    savedTemples: ['1', '3'],
    accessibilityPreset: { wheelchair: false, volunteer: false }
  });

  const navigate = useNavigate();

  // Load temples and notifications from APIs
  useEffect(() => {
    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/temples')
      .then(res => res.json())
      .then(setTemples)
      .catch(err => console.error("Error fetching temples:", err));

    fetchNotifications();
  }, []);

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
  const finalLogo = isDarkMode ? "/logo_dark_mode.png" : "/logo_light_mode.png";

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-300">
      
      {/* Devotee Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-6 z-20 shrink-0">
        <div className="mb-8 flex items-center justify-center w-full">
          <img 
            src={finalLogo} 
            alt="TeerthSetu Logo" 
            className="h-16 w-auto object-contain"
            style={!isDarkMode ? { mixBlendMode: 'multiply' } : {}}
          />
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex flex-col gap-2 flex-1">
          <SidebarButton active={activeTab === 'explore'} icon={<Compass className="h-5 w-5"/>} text="Shrines & Booking" onClick={() => setActiveTab('explore')} />
          <SidebarButton active={activeTab === 'planner'} icon={<Map className="h-5 w-5"/>} text="Journey Planner" onClick={() => setActiveTab('planner')} />
          <SidebarButton active={activeTab === 'hotels'} icon={<Hotel className="h-5 w-5"/>} text="Accommodations" onClick={() => setActiveTab('hotels')} />
          <SidebarButton active={activeTab === 'bookings'} icon={<QrCode className="h-5 w-5"/>} text="My Tickets" onClick={() => setActiveTab('bookings')} />
          <SidebarButton active={activeTab === 'profile'} icon={<User className="h-5 w-5"/>} text="My Profile" onClick={() => setActiveTab('profile')} />
          
          <button 
            onClick={() => setActiveTab('alerts')} 
            className={`flex items-center justify-between p-3 rounded-xl transition-all ${activeTab === 'alerts' ? 'bg-saffron text-slate-900 dark:text-white shadow-lg shadow-saffron/20 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:bg-slate-800 hover:text-slate-900 dark:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5" />
              <span>Alerts</span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-slate-900 dark:text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </nav>

        {/* User Card & Logout */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4 mt-auto">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-2 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-white transition-colors text-left"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="font-medium text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-saffron/10 border border-saffron/40 flex items-center justify-center font-bold text-saffron">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.phone}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-red-400 p-3 rounded-xl hover:bg-red-500/5 transition-all text-sm font-medium">
            <LogOut className="h-5 w-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 relative flex flex-col">
        {/* Glow backdrop */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-saffron/5 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Active tab renderer */}
        <div className="flex-1 z-10 max-w-6xl mx-auto w-full">
          {activeTab === 'explore' && <ExploreView temples={temples} setActiveTab={setActiveTab} user={user} />}
          {activeTab === 'planner' && <PlannerView temples={temples} />}
          {activeTab === 'hotels' && <HotelsView />}
          {activeTab === 'bookings' && <BookingsView />}
          {activeTab === 'profile' && <ProfileView user={user} setUser={setUser} />}
          {activeTab === 'alerts' && <AlertsView notifications={notifications} markRead={handleMarkNotificationsRead} />}
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

// ==========================================
// VIEW 1: HOME & TEMPLE DISCOVERY (Screens 5 & 6)
// ==========================================
function ExploreView({ temples, setActiveTab, user, templesLimit = 3 }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('All');
  const [crowdFilter, setCrowdFilter] = useState('All');
  const [selectedTemple, setSelectedTemple] = useState(null);

  // States
  const states = ['All', 'Andhra Pradesh', 'Uttarakhand', 'Uttar Pradesh', 'Jammu & Kashmir', 'Kerala', 'Gujarat', 'Odisha', 'Tamil Nadu'];

  const filteredTemples = temples.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = stateFilter === 'All' || t.location.includes(stateFilter);
    const matchesCrowd = crowdFilter === 'All' || t.crowdLevel === crowdFilter;
    return matchesSearch && matchesState && matchesCrowd;
  });

  return (
    <div className="space-y-8">
      {/* Greeting (Screen 5) */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-850">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            Hello, {user.name.split(' ')[0]}! <span className="animate-wiggle">🙏</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Ready for your spiritual journey? Plan slots and track crowding live.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setSelectedTemple(temples[0])} className="bg-saffron/15 text-saffron border border-saffron/30 hover:bg-saffron/20 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Book Quick Darshan
          </button>
          <button onClick={() => setActiveTab('planner')} className="bg-gold/15 text-gold border border-gold/30 hover:bg-gold/20 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
            <Map className="h-4 w-4" /> Plan Multi-Route
          </button>
        </div>
      </div>

      {/* Mini Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-saffron/10 text-saffron rounded-xl"><Users className="h-6 w-6"/></div>
          <div>
            <h4 className="text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Crowd Status Today</h4>
            <p className="text-lg font-bold text-slate-900 dark:text-white">Moderate Surge</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><Clock className="h-6 w-6"/></div>
          <div>
            <h4 className="text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Avg Waiting Hours Saved</h4>
            <p className="text-lg font-bold text-slate-900 dark:text-white">1.5 Hrs / Slot</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><Calendar className="h-6 w-6"/></div>
          <div>
            <h4 className="text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Upcoming Festival Alert</h4>
            <p className="text-lg font-bold text-slate-900 dark:text-white">Brahmotsavam (Tirupati)</p>
          </div>
        </div>
      </div>

      {/* Temple Discovery search/filter bar (Screen 6) */}
      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Shrine Discovery</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">Explore popular shrines, forecast queues, and secure Darshan passes.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-850">
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search temple name, deity, city..." 
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-saffron transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <select 
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:border-saffron transition-all"
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
            >
              <option value="All">Filter: All States</option>
              {states.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <select 
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:border-saffron transition-all"
              value={crowdFilter}
              onChange={e => setCrowdFilter(e.target.value)}
            >
              <option value="All">Filter: Crowd Level</option>
              <option value="Low">Low Crowds</option>
              <option value="Moderate">Moderate Crowds</option>
              <option value="High">High Crowds</option>
            </select>
          </div>
        </div>

        {/* Temple Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemples.map(t => (
            <motion.div 
              key={t._id} 
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-lg hover:border-gold/30 transition-all flex flex-col"
            >
              <div className="h-44 bg-white dark:bg-slate-800 relative">
                <img 
                  src={t.image || "https://images.unsplash.com/photo-1600100397608-f010e42edb7a?auto=format&fit=crop&w=600&q=80"} 
                  alt={t.name}
                  className="w-full h-full object-cover"
                />
                <span className={`absolute top-4 right-4 px-3 py-1 text-xs font-extrabold rounded-full ${
                  t.crowdLevel === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  t.crowdLevel === 'Moderate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {t.crowdLevel} Crowd
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">{t.name}</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-1.5 mb-4"><MapPin className="h-4 w-4 text-saffron"/> {t.location}</p>
                  
                  <div className="grid grid-cols-2 gap-4 bg-white dark:bg-slate-950/40 p-3 rounded-xl text-xs mb-4">
                    <div>
                      <span className="text-slate-500 block mb-0.5">Wait Time</span>
                      <span className="text-gold font-bold text-sm">{t.waitTime} mins</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Hourly Limit</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold text-sm">{Math.floor(t.dailyLimit / 12).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTemple(t)}
                  className="w-full py-2.5 bg-saffron hover:bg-[#e85a28] text-slate-900 dark:text-white font-bold text-sm rounded-xl transition-all"
                >
                  View Details & Book
                </button>
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
function TempleDetailsModal({ temple, user, onClose }) {
  const [step, setStep] = useState('details'); // details, booking, payment, ticket
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

  // Simulated AI Hourly Crowd Forecast Data (Screen 8)
  const hourlyPredictionData = [
    { time: '6 AM', wait: 20, limit: 2000, crowd: 'Low' },
    { time: '8 AM', wait: temple.waitTime * 0.8, limit: 3000, crowd: 'Moderate' },
    { time: '10 AM', wait: temple.waitTime, limit: 4500, crowd: 'High' },
    { time: '12 PM', wait: temple.waitTime * 1.5, limit: 5000, crowd: 'Peak' },
    { time: '2 PM', wait: temple.waitTime * 0.9, limit: 4000, crowd: 'High' },
    { time: '4 PM', wait: temple.waitTime * 0.7, limit: 3500, crowd: 'Moderate' },
    { time: '6 PM', wait: temple.waitTime * 1.1, limit: 4500, crowd: 'High' },
    { time: '8 PM', wait: 25, limit: 2500, crowd: 'Low' }
  ];

  const handleBookSubmit = (e) => {
    e.preventDefault();
    setStep('payment');
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
              <p className="text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1"><MapPin className="h-4.5 w-4.5 text-saffron shrink-0"/> {temple.location}</p>
            </div>
          </div>
        </div>

        {/* Modal Right Side: Dynamic Content Steps */}
        <div className="w-full md:w-3/5 p-8 max-h-[85vh] overflow-y-auto flex flex-col justify-between bg-white dark:bg-slate-900">
          
          {/* STEP 1: TEMPLE DETAILS & CROWD PREDICTION (Screen 7 & 8) */}
          {step === 'details' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Temple History & Rules</h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-4">{temple.history}</p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-white dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block mb-0.5">Darshan Hours</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{temple.timings}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block mb-0.5">Dress Code</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{temple.dressCode}</span>
                  </div>
                </div>
              </div>

              {/* AI Crowd Predictions (Screen 8) */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-gold animate-pulse" /> AI Crowd Prediction
                  </h4>
                  <span className="text-xs text-slate-600 dark:text-slate-400">Current Wait: <strong className="text-gold">{temple.waitTime}m</strong></span>
                </div>
                
                {/* Recharts Hourly Wait Times Forecast */}
                <div className="h-36 w-full bg-white dark:bg-slate-950/40 p-2 rounded-xl border border-slate-200 dark:border-slate-800 mb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hourlyPredictionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="time" stroke="#94A3B8" fontSize={9} />
                      <YAxis stroke="#94A3B8" fontSize={9} width={15} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', fontSize: 10 }} />
                      <Area type="monotone" dataKey="wait" stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.15} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-slate-500 italic text-center">
                  🔥 Best hours to visit: <strong className="text-emerald-400">6:00 AM - 9:00 AM</strong>. Expect heavy peaks at noon due to afternoon Aarti.
                </p>
              </div>

              {/* Facilities list */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Available Facilities</h4>
                <div className="flex flex-wrap gap-2">
                  {temple.facilities?.map(f => (
                    <span key={f} className="text-[11px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-700 px-3 py-1 rounded-full">{f}</span>
                  )) || 'None'}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-4">
                <button 
                  onClick={() => setStep('booking')}
                  className="flex-1 py-3 bg-saffron hover:bg-[#e85a28] text-slate-900 dark:text-white font-bold text-md rounded-xl transition-all shadow-lg shadow-saffron/20"
                >
                  Book Darshan Pass
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DARSHAN BOOKING FORM (Screen 9, 10, 11) */}
          {step === 'booking' && (
            <form onSubmit={handleBookSubmit} className="space-y-5">
              <div className="flex items-center gap-2 mb-2 text-saffron font-bold text-sm">
                <span className="cursor-pointer hover:underline" onClick={() => setStep('details')}>← Back to Details</span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Darshan Slot Settings</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">Select Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-saffron"
                    value={formData.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">Time Slot</label>
                  <select 
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-saffron"
                    value={formData.timeSlot}
                    onChange={e => setFormData({ ...formData, timeSlot: e.target.value })}
                  >
                    <option>07:00 AM (Low Wait)</option>
                    <option>09:00 AM (Available)</option>
                    <option>11:00 AM (Available)</option>
                    <option>01:00 PM (Fast Filling)</option>
                    <option>03:00 PM (Moderate Crowds)</option>
                    <option>05:00 PM (Aarti Peak)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">No. of Devotees</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-saffron"
                    value={formData.visitors}
                    onChange={e => setFormData({ ...formData, visitors: parseInt(e.target.value) || 1 })}
                    required
                  />
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
              <div className="bg-white dark:bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-2.5">
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
                className="w-full py-3.5 bg-saffron hover:bg-[#e85a28] text-slate-900 dark:text-white font-bold text-md rounded-xl transition-all shadow-lg"
              >
                Proceed to Secure Payment
              </button>
            </form>
          )}

          {/* STEP 3: PAYMENT PORTAL (Screen 13) */}
          {step === 'payment' && (
            <div className="space-y-6 text-center py-6">
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Secure Gateway</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">TeerthSethu Payment Portal - Sandbox Mode</p>

              <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 max-w-xs mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formData.specialDarshan} Darshan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Devotees</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formData.visitors} Persons</span>
                </div>
                <div className="flex justify-between border-t border-slate-850 pt-2 text-sm">
                  <span className="text-slate-700 dark:text-slate-300 font-bold">Total Payable</span>
                  <span className="font-extrabold text-gold">
                    ₹ {formData.specialDarshan === 'General' ? 0 : formData.specialDarshan === 'Special' ? formData.visitors * 100 : formData.visitors * 500}
                  </span>
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
                <button 
                  type="button" 
                  onClick={() => setPayMethod('upi')}
                  className={`p-3 border rounded-xl flex flex-col items-center justify-center text-xs font-semibold gap-1 transition-all ${payMethod === 'upi' ? 'border-saffron bg-saffron/10 text-saffron' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white'}`}
                >
                  <CreditCard className="h-4.5 w-4.5" /> UPI Apps
                </button>
                <button 
                  type="button" 
                  onClick={() => setPayMethod('card')}
                  className={`p-3 border rounded-xl flex flex-col items-center justify-center text-xs font-semibold gap-1 transition-all ${payMethod === 'card' ? 'border-saffron bg-saffron/10 text-saffron' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white'}`}
                >
                  <CreditCard className="h-4.5 w-4.5" /> Card Pay
                </button>
                <button 
                  type="button" 
                  onClick={() => setPayMethod('wallet')}
                  className={`p-3 border rounded-xl flex flex-col items-center justify-center text-xs font-semibold gap-1 transition-all ${payMethod === 'wallet' ? 'border-saffron bg-saffron/10 text-saffron' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white'}`}
                >
                  <CreditCard className="h-4.5 w-4.5" /> Wallets
                </button>
              </div>

              {isPaying ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-saffron border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-600 dark:text-slate-400 animate-pulse">Contacting payment servers...</span>
                </div>
              ) : (
                <div className="flex gap-4 max-w-sm mx-auto">
                  <button 
                    onClick={() => setStep('booking')}
                    className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-white dark:bg-slate-800 rounded-xl font-bold text-sm"
                  >
                    Go Back
                  </button>
                  <button 
                    onClick={handlePayment}
                    className="flex-1 py-2.5 bg-saffron hover:bg-[#e85a28] text-slate-900 dark:text-white rounded-xl font-extrabold text-sm shadow-md"
                  >
                    Confirm & Pay
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: QR TICKET ISSUED (Screen 14) */}
          {step === 'ticket' && bookedData && (
            <div className="space-y-6 text-center">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 mb-2">
                <CheckCircle className="h-7 w-7" />
              </div>
              <h4 className="text-2xl font-bold text-emerald-400">Darshan Verified!</h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">Your entry pass has been registered on the blockchain queue.</p>

              {/* QR Block */}
              <div className="bg-white text-slate-950 p-6 rounded-2xl inline-block shadow-xl relative max-w-xs mx-auto">
                <div className="absolute top-0 left-0 w-full h-2 bg-saffron rounded-t-2xl" />
                <div className="p-3 bg-slate-100 rounded-lg inline-block mb-3 border border-slate-200">
                  <QrCode className="h-28 w-28 text-slate-900 animate-pulse" />
                </div>
                <h5 className="font-mono font-bold text-sm tracking-wider text-slate-700">{bookedData.bookingId}</h5>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{temple.name}</p>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 pt-3 border-t border-slate-200 text-left text-[10px] text-slate-650">
                  <div><strong className="block text-slate-600 dark:text-slate-400 text-[8px] uppercase">Date</strong>{bookedData.date}</div>
                  <div><strong className="block text-slate-600 dark:text-slate-400 text-[8px] uppercase">Slot</strong>{bookedData.timeSlot.split(' ')[0]}</div>
                  <div><strong className="block text-slate-600 dark:text-slate-400 text-[8px] uppercase">Devotees</strong>{bookedData.visitors} Guests</div>
                  <div><strong className="block text-slate-600 dark:text-slate-400 text-[8px] uppercase">Waitlist</strong>{bookedData.waitlistPosition > 0 ? `#${bookedData.waitlistPosition}` : 'Confirmed'}</div>
                </div>
              </div>

              {bookedData.waitlistPosition > 0 && (
                <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 p-3 rounded-xl max-w-sm mx-auto text-left text-xs flex gap-2">
                  <Info className="h-5 w-5 shrink-0" />
                  <span>
                    Your slot is currently in the <strong>Waitlist (#{bookedData.waitlistPosition})</strong> due to peak surge. Estimated confirmation time is 35 mins.
                  </span>
                </div>
              )}

              <div className="flex gap-4 max-w-xs mx-auto pt-2">
                <button 
                  onClick={() => {
                    alert("Ticket downloaded to PDF!");
                  }}
                  className="flex-1 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-bold transition-all"
                >
                  Download Pass
                </button>
                <button 
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-saffron hover:bg-[#e85a28] text-slate-900 dark:text-white rounded-xl text-xs font-bold transition-all"
                >
                  Back to Board
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
// VIEW 2: MULTI-TEMPLE PLANNER (Screen 18)
// ==========================================
function PlannerView({ temples }) {
  const [formData, setFormData] = useState({
    startingCity: 'New Delhi',
    templeId: '1',
    days: 3,
    budget: 'Comfort'
  });
  const [planResult, setPlanResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      .then(res => res.json())
      .then(data => {
        setPlanResult(data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        console.error(err);
      });
    }, 1200);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">Multi-Temple Journey Planner</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">AI-Powered route, accommodation, and budget calculation across multiple shrine stops.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Planner Inputs Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-850 p-6 rounded-3xl h-fit">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Planner Inputs</h4>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">Starting City</label>
              <input 
                type="text" 
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-saffron"
                value={formData.startingCity}
                onChange={e => setFormData({ ...formData, startingCity: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">Primary Target Shrine</label>
              <select 
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-saffron"
                value={formData.templeId}
                onChange={e => setFormData({ ...formData, templeId: e.target.value })}
              >
                {temples.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">Days Available</label>
                <input 
                  type="number" 
                  min="1" 
                  max="14"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-saffron"
                  value={formData.days}
                  onChange={e => setFormData({ ...formData, days: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">Budget Scale</label>
                <select 
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-saffron"
                  value={formData.budget}
                  onChange={e => setFormData({ ...formData, budget: e.target.value })}
                >
                  <option value="Economy">Economy</option>
                  <option value="Comfort">Comfort</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-saffron hover:bg-[#e85a28] disabled:bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm rounded-xl transition-all shadow-lg mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing constraints...
                </>
              ) : (
                <>
                  <Sparkles className="h-4.5 w-4.5 text-gold" /> Generate AI Route
                </>
              )}
            </button>
          </form>
        </div>

        {/* Planner Output Results */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-850 p-8 rounded-3xl min-h-[400px] flex flex-col justify-center">
          {planResult ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h4 className="text-xl font-extrabold text-gold flex items-center gap-2"><Sparkles className="h-5 w-5 text-saffron" /> Recommended AI Route</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Multi-city transit nodes customized for {formData.days} days.</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">EST BUDGET</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{planResult.transport.budgetEstimate}</span>
                </div>
              </div>

              {/* Visual Timeline Route */}
              <div className="relative pl-6 space-y-6 border-l border-slate-850 ml-3 py-2">
                {planResult.route.map((item, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-saffron flex items-center justify-center font-bold text-[8px] text-saffron">
                      {idx + 1}
                    </span>
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{item.type} {item.stay && `• Lodging: ${item.stay}`} {item.transit && `• Transit: ${item.transit}`}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Transit cost details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-850 text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5">Mode</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{planResult.transport.mode}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Total distance</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{planResult.transport.distance}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Duration</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{planResult.transport.estTime}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Fuel/Ticket cost</span>
                  <span className="font-semibold text-saffron">{planResult.transport.estFuel}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-12 space-y-2">
              <Compass className="h-16 w-16 mx-auto text-slate-700 animate-spin" style={{ animationDuration: '6s' }} />
              <h4 className="font-bold text-slate-600 dark:text-slate-400">No Pilgrimage Route Generated</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Fill in the constraints on the left panel and click generate to let the AI calculate your itinerary.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VIEW 3: ACCOMMODATION LISTINGS (Screen 12)
// ==========================================
function HotelsView() {
  const [hotelsList, setHotelsList] = useState([]);
  const [typeFilter, setTypeFilter] = useState('All');
  const [bookedHotel, setBookedHotel] = useState(null);

  useEffect(() => {
    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/hotels')
      .then(res => res.json())
      .then(setHotelsList)
      .catch(err => console.error("Error loading accommodation:", err));
  }, []);

  const filteredHotels = hotelsList.filter(h => {
    return typeFilter === 'All' || h.type === typeFilter;
  });

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">Spiritual Stays & Accommodations</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Book hotels, dharamshalas, lodges, and temple guest houses near holy gates.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        {['All', 'Hotel', 'Dharamshala', 'Temple Guest House', 'Lodge'].map(tab => (
          <button 
            key={tab}
            onClick={() => setTypeFilter(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all border ${typeFilter === tab ? 'bg-saffron/10 border-saffron text-saffron' : 'border-slate-850 hover:bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white'}`}
          >
            {tab}s
          </button>
        ))}
      </div>

      {/* Hotel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredHotels.map(h => (
          <div key={h.id} className="bg-white dark:bg-slate-900 border border-slate-850 rounded-2xl p-6 flex flex-col justify-between hover:border-gold/30 transition-all">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold uppercase text-saffron bg-saffron/10 border border-saffron/20 px-2.5 py-0.5 rounded-full">{h.type}</span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Proximity: <strong>{h.distance}</strong></span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{h.name}</h4>
              <div className="flex items-center gap-1.5 mb-4">
                <span className="text-xs bg-gold/10 text-gold font-bold px-2 py-0.5 rounded">⭐ {h.rating}</span>
                <span className="text-[11px] text-slate-500">Guest Score</span>
              </div>
              
              <div className="flex flex-wrap gap-1.5 mb-6">
                {h.amenities?.map(a => (
                  <span key={a} className="text-[10px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950/40 px-2.5 py-1 rounded-md">{a}</span>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-850 pt-4 mt-4">
              <div>
                <span className="text-[9px] text-slate-500 block">PRICE/NIGHT</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">₹{h.price}</span>
              </div>
              <button 
                onClick={() => setBookedHotel(h)}
                className="bg-saffron hover:bg-[#e85a28] px-5 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white transition-all shadow-md"
              >
                Secure Stay
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Book Success Modal */}
      <AnimatePresence>
        {bookedHotel && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-[#1F1F35] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl text-center"
            >
              <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
              <h4 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Accommodation Secured</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">Your room at <strong>{bookedHotel.name}</strong> is reserved successfully. Payment is due at the check-in desk.</p>
              
              <button 
                type="button" 
                onClick={() => setBookedHotel(null)}
                className="w-full py-2.5 bg-saffron text-slate-900 dark:text-white font-bold rounded-xl hover:bg-[#e85a28] transition-all text-xs"
              >
                Back to Stays
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ========================================================
// VIEW 4: MY BOOKINGS & WAITLISTS (Screens 15 & 16)
// ========================================================
function BookingsView() {
  const [activeSubTab, setActiveSubTab] = useState('Upcoming'); // Upcoming, Completed, Cancelled
  const [bookingsList, setBookingsList] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [rescheduleData, setRescheduleData] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('09:00 AM (Available)');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/bookings')
      .then(res => res.json())
      .then(setBookingsList)
      .catch(err => console.error("Error fetching bookings:", err));
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

  const filteredBookings = bookingsList.filter(b => b.status === activeSubTab);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Booked Passes</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Manage active slots, download QR passes, check waitlists, or reschedule bookings.</p>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        {['Upcoming', 'Completed', 'Cancelled'].map(t => (
          <button 
            key={t}
            onClick={() => setActiveSubTab(t)}
            className={`pb-2 border-b-2 font-bold text-sm transition-all ${activeSubTab === t ? 'border-saffron text-saffron' : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-white'}`}
          >
            {t} Slots
          </button>
        ))}
      </div>

      {/* Booking list */}
      <div className="space-y-4">
        {filteredBookings.map(b => (
          <div key={b.bookingId} className="bg-white dark:bg-slate-900 border border-slate-850 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
            {/* Status vertical bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-2 ${
              b.status === 'Upcoming' ? 'bg-saffron' :
              b.status === 'Completed' ? 'bg-emerald-500' : 'bg-red-500'
            }`} />

            <div className="pl-2 space-y-2">
              <div className="flex items-center gap-3">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{b.templeName}</h4>
                {b.waitlistPosition > 0 && (
                  <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                    Waitlist #{b.waitlistPosition}
                  </span>
                )}
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs flex flex-wrap gap-x-4 gap-y-1">
                <span>📅 Date: <strong>{b.date}</strong></span>
                <span>⏰ Slot: <strong>{b.timeSlot.split(' ')[0]}</strong></span>
                <span>👥 visitors: <strong>{b.visitors} Person(s)</strong></span>
                <span>🎫 Category: <strong>{b.specialDarshan}</strong></span>
              </p>
              
              {(b.wheelchair || b.volunteer || b.medical) && (
                <div className="text-[10px] text-gold font-bold flex gap-3 pt-1">
                  {b.wheelchair && <span>♿ Wheelchair Required</span>}
                  {b.volunteer && <span>🤝 Volunteer Escort</span>}
                  {b.medical && <span>🏥 Medical Camp Alert</span>}
                </div>
              )}
            </div>

            <div className="flex gap-3 shrink-0 w-full md:w-auto">
              {b.status === 'Upcoming' && (
                <>
                  <button 
                    onClick={() => {
                      setRescheduleData(b);
                      setRescheduleDate(b.date);
                      setRescheduleSlot(b.timeSlot);
                    }}
                    className="flex-1 md:flex-initial bg-white dark:bg-slate-800 hover:bg-slate-750 px-4 py-2 border border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg transition-all"
                  >
                    Reschedule
                  </button>
                  <button 
                    onClick={() => handleCancelBooking(b.bookingId)}
                    className="flex-1 md:flex-initial bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-4 py-2 text-xs font-bold rounded-lg transition-all"
                  >
                    Cancel Slot
                  </button>
                  <button 
                    onClick={() => setSelectedTicket(b)}
                    className="flex-1 md:flex-initial bg-saffron hover:bg-[#e85a28] px-4 py-2 text-slate-900 dark:text-white text-xs font-bold rounded-lg transition-all shadow-md"
                  >
                    View QR Pass
                  </button>
                </>
              )}
              {b.status !== 'Upcoming' && (
                <span className="text-slate-500 text-xs italic">No actions available</span>
              )}
            </div>
          </div>
        ))}

        {filteredBookings.length === 0 && (
          <div className="py-12 text-center text-slate-500 bg-white dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            No bookings found under "{activeSubTab}".
          </div>
        )}
      </div>

      {/* QR Ticket View Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-center relative"
            >
              <button onClick={() => setSelectedTicket(null)} className="absolute top-4 right-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white">
                <X className="h-5 w-5" />
              </button>
              
              <h4 className="text-xl font-bold mb-4">Gate Pass QR Ticket</h4>
              
              <div className="bg-white text-slate-950 p-6 rounded-2xl inline-block shadow-lg mb-4">
                <QrCode className="h-28 w-28 mx-auto text-slate-900 mb-2" />
                <span className="font-mono font-bold text-xs tracking-wider text-slate-700 block">{selectedTicket.bookingId}</span>
                <span className="text-[10px] font-bold uppercase text-saffron">{selectedTicket.templeName}</span>
              </div>

              <div className="bg-white dark:bg-slate-950 p-4 rounded-xl text-left text-xs mb-6 space-y-2 border border-slate-850">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{selectedTicket.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Slot</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{selectedTicket.timeSlot.split(' ')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">visitors</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{selectedTicket.visitors} Persons</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assist</span>
                  <span className="text-gold font-semibold">
                    {selectedTicket.wheelchair ? 'Wheelchair ' : ''}
                    {selectedTicket.volunteer ? 'Volunteer ' : ''}
                    {!selectedTicket.wheelchair && !selectedTicket.volunteer && 'None'}
                  </span>
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => {
                  alert("PDF Download trigger");
                  setSelectedTicket(null);
                }}
                className="w-full py-2.5 bg-saffron text-slate-900 dark:text-white font-bold rounded-xl hover:bg-[#e85a28] transition-all text-xs"
              >
                Download PDF QR Pass
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {rescheduleData && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-2xl relative"
            >
              <button onClick={() => setRescheduleData(null)} className="absolute top-4 right-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white">
                <X className="h-5 w-5" />
              </button>
              
              <h4 className="text-xl font-bold mb-4">Reschedule Darshan</h4>
              
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
                    className="flex-1 py-2.5 bg-white dark:bg-slate-800 border border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 bg-saffron text-slate-900 dark:text-white font-bold rounded-xl hover:bg-[#e85a28] text-xs shadow-md"
                  >
                    Save Reschedule
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Configure family members registry, verify Aadhaar settings, and toggle accessibility preferences.</p>
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
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Aadhaar Card (Optional)</label>
              <input type="text" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white" value={user.aadhaar} onChange={e => setUser({ ...user, aadhaar: e.target.value })} />
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
            <div className={`p-2.5 rounded-xl shrink-0 ${
              n.type === 'Emergency Broadcast' ? 'bg-red-500/10 text-red-500' :
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
