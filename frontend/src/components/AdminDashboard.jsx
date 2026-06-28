import { useState, useEffect } from 'react';
import { AlertTriangle, Activity, ScanLine, Printer } from 'lucide-react';

export default function AdminDashboard({ globalState, setGlobalState }) {
  const [stats, setStats] = useState({ activeVisitors: 0, exitedVisitors: 0 });

  useEffect(() => {
    fetch('https://teerthsetu.onrender.com/api/admin/stats')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  const toggleEmergency = () => {
    const newState = !globalState.emergencyMode;
    fetch('https://teerthsetu.onrender.com/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emergencyMode: newState })
    });
    setGlobalState(prev => ({ ...prev, emergencyMode: newState }));
  };

  const scanWalkin = () => {
    setStats(prev => ({ ...prev, activeVisitors: prev.activeVisitors + 1 }));
  };

  return (
    <div>
      <div className="grid-3">
        <div className="card stat-box">
          <div className="stat-value">{stats.activeVisitors.toLocaleString()}</div>
          <div className="stat-label">Live Active Inside</div>
        </div>
        <div className="card stat-box">
          <div className="stat-value text-green">{(globalState.onlineRatio)}%</div>
          <div className="stat-label">Online Booking Ratio</div>
        </div>
        <div className="card stat-box">
          <div className="stat-value text-orange">24 min</div>
          <div className="stat-label">Current Avg Wait Time</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 className="card-title">Temple Configuration Panel</h2>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Online vs Walk-in Inventory Ratio</span>
              <span className="text-gold">{globalState.onlineRatio}% Online</span>
            </label>
            <input 
              type="range" 
              min="0" max="100" 
              value={globalState.onlineRatio} 
              onChange={(e) => setGlobalState({...globalState, onlineRatio: e.target.value})} 
            />
          </div>

          <div style={{ padding: 20, background: globalState.emergencyMode ? 'rgba(239,68,68,0.2)' : 'rgba(0,0,0,0.2)', borderRadius: 8, border: `1px solid ${globalState.emergencyMode ? 'var(--accent-orange)' : 'var(--border-color)'}`, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <AlertTriangle color={globalState.emergencyMode ? "var(--accent-orange)" : "var(--text-muted)"} />
              <div>
                <h3 style={{ color: globalState.emergencyMode ? 'var(--accent-orange)' : 'white' }}>Festival Emergency Mode</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Overrides capacity limits and deploys maximum security footprint.</p>
              </div>
            </div>
            <button 
              onClick={toggleEmergency}
              style={{ background: globalState.emergencyMode ? 'var(--accent-orange)' : 'var(--bg-card)', color: 'white' }}
            >
              {globalState.emergencyMode ? 'DEACTIVATE EMERGENCY MODE' : 'ENABLE EMERGENCY MODE'}
            </button>
          </div>

          <div style={{ padding: 20, background: 'rgba(0,0,0,0.2)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: 16 }}>Lost & Found Logistics</h3>
            <div className="grid-2">
              <button className="secondary" onClick={() => alert("Reporting Missing Person...")} style={{ borderColor: 'var(--accent-orange)' }}>Report Missing Person</button>
              <button className="secondary" onClick={() => alert("Logging Found Item...")}>Log Found Item</button>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Walk-in Counter POS & Scanner</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Simulate walk-in counter ticket generation and physical gate scanning.</p>
          
          <div className="grid-2">
            <button className="secondary" onClick={() => alert("Printing Walk-in Receipt...")}>
              <Printer size={18} /> Print Walk-in Ticket
            </button>
            <button onClick={scanWalkin}>
              <ScanLine size={18} /> Scan Gate Pass
            </button>
          </div>
          
          <div style={{ marginTop: 24, padding: 16, background: 'rgba(0,0,0,0.3)', borderRadius: 8 }}>
            <h4 style={{ marginBottom: 12, color: 'var(--accent-green)' }}>Scanner Live Log</h4>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.activeVisitors > 12450 && <span>[{new Date().toLocaleTimeString()}] SUCCESS - Walk-in Registered</span>}
              <span>[10:42 AM] SUCCESS - Ticket DY-4892 scanned</span>
              <span>[10:41 AM] SUCCESS - Ticket DY-9213 scanned</span>
              <span style={{ color: 'var(--accent-orange)' }}>[10:39 AM] FAILED - Duplicate Ticket Detected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
