import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { ChartBarIcon, PresentationChartLineIcon, QrCodeIcon, ExclamationTriangleIcon, ArrowLeftEndOnRectangleIcon, BellAlertIcon } from '@heroicons/react/24/outline';
import { Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ activeVisitors: 0, exitedVisitors: 0, emergencyMode: false, onlineRatio: 70 });
  const [analytics, setAnalytics] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/admin/stats').then(res => res.json()).then(setStats);
    fetch('/api/admin/analytics').then(res => res.json()).then(setAnalytics);
  }, []);

  const handleLogout = () => navigate('/auth');

  return (
    <div className="flex h-screen bg-dark">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-black/50 border-r border-white/10 flex flex-col p-6 z-10">
        <div className="text-emerald font-bold text-2xl mb-10 flex items-center gap-2">
          <Activity className="h-6 w-6" /> Divya Admin
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <SidebarLink to="/admin" icon={<ChartBarIcon className="h-5 w-5"/>} text="Live Telemetry" current={location.pathname === '/admin'} />
          <SidebarLink to="/admin/scanner" icon={<QrCodeIcon className="h-5 w-5"/>} text="QR Entry Scanner" current={location.pathname === '/admin/scanner'} />
          <SidebarLink to="/admin/forecast" icon={<PresentationChartLineIcon className="h-5 w-5"/>} text="AI Resource Forecast" current={location.pathname === '/admin/forecast'} />
          <SidebarLink to="/admin/emergency" icon={<ExclamationTriangleIcon className="h-5 w-5"/>} text="Emergency Protocol" current={location.pathname === '/admin/emergency'} />
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-white mt-auto p-3 transition-colors">
          <ArrowLeftEndOnRectangleIcon className="h-5 w-5" /> Secure Logout
        </button>
      </aside>

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <Routes>
          <Route path="/" element={<TelemetryView stats={stats} analytics={analytics} />} />
          <Route path="/scanner" element={<ScannerView stats={stats} setStats={setStats} />} />
          <Route path="/forecast" element={<ForecastView />} />
          <Route path="/emergency" element={<EmergencyView stats={stats} setStats={setStats} />} />
        </Routes>
      </main>
    </div>
  );
}

function SidebarLink({ to, icon, text, current }) {
  return (
    <Link to={to} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${current ? 'bg-emerald/10 text-emerald font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
      {icon} {text}
    </Link>
  );
}

function TelemetryView({ stats, analytics }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Temple Command Center</h2>
      
      {/* Top Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6">
          <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider">Live Inside</p>
          <p className="text-4xl font-bold text-white">{stats.activeVisitors.toLocaleString()}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider">Today's Revenue</p>
          <p className="text-4xl font-bold text-emerald">₹ {stats.todayRevenue?.toLocaleString() || '1,20,000'}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider">Avg Wait Time</p>
          <p className="text-4xl font-bold text-saffron">{stats.avgWaitMins || 22} mins</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider">Online Quota</p>
          <p className="text-4xl font-bold text-blue-400">{stats.onlineRatio}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 glass-card h-96 p-6">
          <h3 className="text-lg font-semibold mb-6">Today's Hourly Attendance Graph</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics}>
              <defs>
                <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="time" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155' }} />
              <Area type="monotone" dataKey="visitors" stroke="#10B981" fillOpacity={1} fill="url(#colorVis)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-4">Walk-in Ticketing Counter</h3>
            <p className="text-sm text-slate-400 mb-6">Generate tickets for rural pilgrims instantly to prevent unmanaged crowds.</p>
            <input type="number" placeholder="Visitor Count" className="input-field mb-4" defaultValue="4" />
          </div>
          <button className="btn-primary w-full" onClick={() => alert("Printing Walk-in Ticket...")}>Generate Walk-in Ticket</button>
        </div>
      </div>
    </div>
  );
}

function ScannerView({ stats, setStats }) {
  const [log, setLog] = useState([]);
  
  const handleScan = () => {
    fetch('/api/admin/scan', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({qrCode: 'DY-1234'})})
      .then(res => res.json())
      .then(data => {
        setLog([{ time: new Date().toLocaleTimeString(), msg: data.message, valid: data.valid }, ...log]);
        if(data.valid) setStats({...stats, activeVisitors: stats.activeVisitors + 1});
      });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">QR Security Scanner</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="glass-card text-center py-20 border-emerald/50">
          <QrCodeIcon className="w-32 h-32 mx-auto mb-6 text-emerald animate-pulse" />
          <button className="btn-primary text-lg px-8" onClick={handleScan}>Simulate Physical Scan</button>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4 text-emerald">Live Scanner Telemetry</h3>
          <div className="space-y-3 font-mono text-sm max-h-80 overflow-y-auto pr-2">
            {log.map((l, i) => (
              <div key={i} className={`p-3 rounded-lg flex justify-between ${l.valid ? 'bg-emerald/10 text-emerald' : 'bg-red-500/10 text-red-500'}`}>
                <span>{l.msg}</span>
                <span>{l.time}</span>
              </div>
            ))}
            {log.length === 0 && <div className="text-slate-500 text-center py-10">Awaiting scans...</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ForecastView() {
  const [weather, setWeather] = useState('Clear');
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    fetch(`/api/ai/forecast?weather=${weather}&isWeekend=true&isFestival=true`).then(res => res.json()).then(setForecast);
  }, [weather]);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">AI Resource Sizing Engine</h2>
      <div className="flex gap-4 mb-8">
        <select className="input-field w-64" value={weather} onChange={e => setWeather(e.target.value)}>
          <option value="Clear">Weather: Clear Sky</option>
          <option value="Rain">Weather: Heavy Rain</option>
        </select>
        <div className="input-field w-64 bg-black/40 text-saffron border-saffron/30">Auto: Festival Weekend Mode</div>
      </div>

      {forecast && (
        <div className="grid grid-cols-3 gap-6">
          <ForecastCard title="Predicted Footfall" value={forecast.expectedCrowd.toLocaleString()} subtitle="Expected visitors tomorrow" color="text-white" />
          <ForecastCard title="Security Deployment" value={forecast.securityNeeded} subtitle="Personnel required across 12 zones" color="text-red-400" />
          <ForecastCard title="Volunteer Shifts" value={forecast.volunteersNeeded} subtitle="Crowd management guides" color="text-blue-400" />
          <ForecastCard title="Wheelchair Logistics" value={forecast.wheelchairs} subtitle="Assets needed at Gate 1 & 4" color="text-purple-400" />
          <ForecastCard title="Prasadam Estimation" value={`${forecast.prasadamLakhs} Lakh`} subtitle="Units of Laddu preparation required" color="text-saffron" />
          <ForecastCard title="Parking Occupancy" value={`${forecast.parkingOccupancy}%`} subtitle="Expected saturation by 11:00 AM" color="text-emerald" />
        </div>
      )}
    </div>
  );
}

function ForecastCard({title, value, subtitle, color}) {
  return (
    <div className="glass-card p-6 border-t-4 border-t-white/10" style={{ borderTopColor: 'currentColor' }}>
      <h4 className="text-slate-400 text-sm mb-4">{title}</h4>
      <div className={`text-5xl font-bold mb-2 ${color}`}>{value}</div>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

function EmergencyView({ stats, setStats }) {
  const toggle = () => {
    const newState = !stats.emergencyMode;
    fetch('/api/admin/config', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({emergencyMode: newState})});
    setStats({...stats, emergencyMode: newState});
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className={`p-8 rounded-2xl border-2 transition-colors ${stats.emergencyMode ? 'bg-red-500/20 border-red-500 animate-pulse' : 'glass-card border-slate-700'}`}>
        <div className="flex items-center gap-6 mb-8">
          <BellAlertIcon className={`w-20 h-20 ${stats.emergencyMode ? 'text-red-500' : 'text-slate-500'}`} />
          <div>
            <h2 className={`text-3xl font-bold mb-2 ${stats.emergencyMode ? 'text-red-500' : 'text-white'}`}>Mega-Festival Security Override</h2>
            <p className="text-slate-400">Activates maximum crowd dispersion protocols. Halts all online bookings, freezes waitlists, and deploys emergency egress routing for massive events like Brahmotsavam.</p>
          </div>
        </div>
        <button onClick={toggle} className={`w-full py-6 text-xl font-bold rounded-xl transition-all ${stats.emergencyMode ? 'bg-red-600 text-white shadow-[0_0_40px_rgba(220,38,38,0.6)] hover:bg-red-700' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
          {stats.emergencyMode ? 'DEACTIVATE EMERGENCY MODE' : 'ENABLE EMERGENCY OVERRIDE'}
        </button>
      </div>
    </div>
  );
}
