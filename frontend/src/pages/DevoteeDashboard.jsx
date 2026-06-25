import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPinIcon, ClockIcon, UserGroupIcon, QrCodeIcon, ArrowLeftEndOnRectangleIcon } from '@heroicons/react/24/outline';
import { Sparkles } from 'lucide-react';

export default function DevoteeDashboard() {
  const [temples, setTemples] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/temples')
      .then(res => res.json())
      .then(data => setTemples(data));
  }, []);

  const handleLogout = () => navigate('/auth');

  return (
    <div className="flex h-screen bg-dark">
      {/* Devotee Sidebar */}
      <aside className="w-64 glass-card border-y-0 border-l-0 rounded-none flex flex-col p-6">
        <div className="text-gold font-bold text-2xl mb-10 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Divya Yatra
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <SidebarLink to="/devotee" icon={<MapPinIcon className="h-5 w-5"/>} text="Temple Discovery" current={location.pathname === '/devotee'} />
          <SidebarLink to="/devotee/planner" icon={<ClockIcon className="h-5 w-5"/>} text="Journey Planner" current={location.pathname === '/devotee/planner'} />
          <SidebarLink to="/devotee/passes" icon={<QrCodeIcon className="h-5 w-5"/>} text="My QR Passes" current={location.pathname === '/devotee/passes'} />
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-white mt-auto p-3 transition-colors">
          <ArrowLeftEndOnRectangleIcon className="h-5 w-5" /> Logout
        </button>
      </aside>

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
        
        <Routes>
          <Route path="/" element={<DiscoveryView temples={temples} />} />
          <Route path="/planner" element={<PlannerView />} />
          <Route path="/passes" element={<PassesView />} />
        </Routes>
      </main>
    </div>
  );
}

function SidebarLink({ to, icon, text, current }) {
  return (
    <Link to={to} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${current ? 'bg-gold/10 text-gold' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
      {icon} {text}
    </Link>
  );
}

function DiscoveryView({ temples }) {
  const [selectedTemple, setSelectedTemple] = useState(null);
  
  if(selectedTemple) return <BookingView temple={selectedTemple} onBack={() => setSelectedTemple(null)} />;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Temple Discovery</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {temples.map(t => (
          <div key={t._id} className="glass-card hover:border-gold/50 transition-colors cursor-pointer" onClick={() => setSelectedTemple(t)}>
            <div className="h-32 bg-slate-800 rounded-lg mb-4 flex items-center justify-center text-slate-500">
              [ Temple Image ]
            </div>
            <h3 className="text-xl font-bold mb-2">{t.name}</h3>
            <p className="text-sm text-slate-400 mb-4 flex items-center gap-1"><MapPinIcon className="h-4 w-4"/> {t.location}</p>
            
            <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg text-sm mb-4">
              <div className="flex flex-col"><span className="text-slate-400">Crowd Level</span><span className={t.crowdLevel === 'High' ? 'text-red-400' : 'text-emerald'}>{t.crowdLevel}</span></div>
              <div className="flex flex-col items-end"><span className="text-slate-400">Wait Time</span><span className="text-gold">{t.waitTime} min</span></div>
            </div>
            <button className="btn-primary w-full py-2">Book Darshan</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingView({ temple, onBack }) {
  const [booked, setBooked] = useState(null);
  const [formData, setFormData] = useState({ visitors: 1, wheelchair: false, volunteer: false, medical: false });

  const handleBook = (e) => {
    e.preventDefault();
    fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templeId: temple._id, date: 'Tomorrow', ...formData }) })
      .then(res => res.json())
      .then(data => setBooked(data));
  };

  if(booked) {
    return (
      <div className="max-w-md mx-auto mt-20 glass-card text-center border-emerald/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-emerald" />
        <h2 className="text-2xl font-bold text-emerald mb-2">Darshan Confirmed</h2>
        <p className="text-slate-400 mb-6">Your payment is successful & slot is reserved.</p>
        
        <div className="bg-white text-black p-8 rounded-xl inline-block mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <QrCodeIcon className="w-32 h-32 mx-auto mb-4" />
          <h3 className="text-xl font-bold">{booked.bookingId}</h3>
          <p className="text-sm mt-1">{temple.name}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-left bg-black/20 p-4 rounded-lg mb-6">
          <div><span className="text-slate-400 block">Date</span>Tomorrow</div>
          <div><span className="text-slate-400 block">Slot</span>11:00 AM</div>
          <div><span className="text-slate-400 block">Visitors</span>{booked.members}</div>
          <div><span className="text-slate-400 block">Assistance</span>{booked.needWheelchair ? 'Wheelchair' : 'None'}</div>
        </div>

        <button onClick={onBack} className="btn-secondary w-full">Back to Discovery</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2">← Back</button>
      <div className="glass-card">
        <h2 className="text-2xl font-bold mb-2">Book Darshan: {temple.name}</h2>
        <p className="text-slate-400 mb-8">AI Predicts moderate crowding tomorrow. Estimated wait time: {temple.waitTime} mins.</p>

        <form onSubmit={handleBook} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Date</label>
              <input type="date" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Time Slot</label>
              <select className="input-field" required>
                <option>09:00 AM (Available)</option>
                <option>11:00 AM (Available)</option>
                <option>01:00 PM (Fast Filling)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Number of Visitors</label>
            <input type="number" min="1" max="10" className="input-field" value={formData.visitors} onChange={e => setFormData({...formData, visitors: e.target.value})} required />
          </div>

          <div className="bg-black/20 p-4 rounded-lg border border-white/5 space-y-3">
            <h4 className="font-semibold text-gold mb-2">Accessibility & Support (Free)</h4>
            <label className="flex items-center gap-3 text-sm"><input type="checkbox" onChange={e => setFormData({...formData, wheelchair: e.target.checked})} className="w-4 h-4 accent-gold" /> Require Wheelchair</label>
            <label className="flex items-center gap-3 text-sm"><input type="checkbox" onChange={e => setFormData({...formData, volunteer: e.target.checked})} className="w-4 h-4 accent-gold" /> Require Volunteer Escort</label>
            <label className="flex items-center gap-3 text-sm"><input type="checkbox" onChange={e => setFormData({...formData, medical: e.target.checked})} className="w-4 h-4 accent-gold" /> Notify Medical Camp (Elderly)</label>
          </div>

          <button type="submit" className="btn-primary w-full mt-4">Proceed to Secure Payment</button>
        </form>
      </div>
    </div>
  );
}

function PlannerView() {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Multi-Temple Journey Planner</h2>
      <div className="glass-card mb-8">
        <p className="text-slate-400 mb-6">Enter your constraints. Our AI will generate an optimal end-to-end spiritual journey including hotels and transport.</p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <input type="text" placeholder="Starting City" className="input-field" defaultValue="Chennai" />
          <input type="text" placeholder="Primary Target Temple" className="input-field" defaultValue="Tirupati" />
          <input type="number" placeholder="Days Available" className="input-field" defaultValue="3" />
          <select className="input-field"><option>Budget: Economy</option><option>Budget: Comfort</option></select>
        </div>
        <button className="btn-primary w-full py-3" onClick={() => alert("Generating AI Route...")}>Generate AI Pilgrimage Route</button>
      </div>
      
      {/* Mock Generated Route */}
      <div className="glass-card border-gold/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-gold" />
        <h3 className="text-xl font-bold text-gold mb-4">Recommended AI Route</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-white/10 rounded-full w-8 h-8 flex items-center justify-center shrink-0">1</div>
            <div><h4 className="font-semibold">Tirupati Balaji Darshan</h4><p className="text-sm text-slate-400">Day 1 • Stay at Taj Tirupati</p></div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-white/10 rounded-full w-8 h-8 flex items-center justify-center shrink-0">2</div>
            <div><h4 className="font-semibold">Sri Kalahasti Temple</h4><p className="text-sm text-slate-400">Day 2 • Transit: 45km Private Cab (₹800)</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PassesView() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">My Active Passes</h2>
      <div className="flex items-center justify-center h-64 border border-dashed border-white/20 rounded-xl text-slate-500">
        No active passes found. Please book a Darshan slot.
      </div>
    </div>
  );
}
