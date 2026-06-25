import { LayoutDashboard, Users, BrainCircuit, Rocket, Activity } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <Activity size={32} color="var(--accent-gold)" />
        Divya Yatra
      </div>
      
      <nav className="nav-menu">
        <div 
          className={`nav-item ${activeTab === 'devotee' ? 'active' : ''}`}
          onClick={() => setActiveTab('devotee')}
        >
          <Users size={20} />
          <span>Devotee Portal</span>
        </div>
        
        <div 
          className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          <LayoutDashboard size={20} />
          <span>Admin Controls</span>
        </div>

        <div 
          className={`nav-item ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          <BrainCircuit size={20} />
          <span>AI Console</span>
        </div>

        <div 
          className={`nav-item ${activeTab === 'roadmap' ? 'active' : ''}`}
          onClick={() => setActiveTab('roadmap')}
        >
          <Rocket size={20} />
          <span>Roadmap</span>
        </div>
      </nav>

      <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
        Version 1.0 (Feature Freeze)
      </div>
    </aside>
  );
}
