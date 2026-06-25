import { CheckCircle2, Shield, AlertTriangle, Users, Map, Mic, Search } from 'lucide-react';

export default function PitchRoadmap() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="card" style={{ textAlign: 'center', padding: 40, borderTop: '4px solid var(--accent-gold)' }}>
        <h1 style={{ fontSize: 48, marginBottom: 16 }}>Divya Yatra</h1>
        <p style={{ fontSize: 20, color: 'var(--text-muted)' }}>Transforming Temple Operations into a Predictive Management Ecosystem</p>
      </div>

      <h2 style={{ margin: '40px 0 24px', textAlign: 'center' }}>Vision & Core Architecture</h2>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ color: 'var(--accent-gold)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Users size={20}/> Devotee App</h3>
          <ul style={{ listStyle: 'none', fontSize: 14, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>• Temple Discovery</li>
            <li>• AI Crowd Intelligence</li>
            <li>• Smart Darshan Booking</li>
            <li>• Family QR Tickets</li>
            <li>• Multi-Temple Trip Planner</li>
            <li>• Hotel & Travel Booking</li>
            <li>• Elderly Support</li>
          </ul>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--accent-green)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={20}/> Admin Dashboard</h3>
          <ul style={{ listStyle: 'none', fontSize: 14, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>• Crowd Monitoring Dash</li>
            <li>• Walk-in Ticket Counter POS</li>
            <li>• Dynamic Slot Balancing</li>
            <li>• Emergency Protocol System</li>
            <li>• Resource Forecasting</li>
            <li>• Lost & Found Database</li>
            <li>• Parking Prediction</li>
          </ul>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--accent-orange)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Search size={20}/> Core AI Engines</h3>
          <ul style={{ listStyle: 'none', fontSize: 14, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>• Wait-Time Predicton</li>
            <li>• Crowd Forecasting Engine</li>
            <li>• Smart Itinerary Routing</li>
            <li>• Resource Optimization Engine</li>
            <li>• Transport Simulation</li>
          </ul>
        </div>
      </div>

      <h2 style={{ margin: '40px 0 24px', textAlign: 'center' }}>Problem vs Solution</h2>
      
      <div className="grid-2" style={{ marginBottom: 40 }}>
        <div className="card" style={{ borderLeft: '4px solid var(--accent-orange)' }}>
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle color="var(--accent-orange)" size={20}/> Current Challenges</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>
            Major temples experience intense overcrowding and long waiting times. Administrations react to crowds rather than predicting them, leading to parking congestion, wasted prasadam resources, and severe logistical bottlenecks.
          </p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--accent-green)' }}>
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 color="var(--accent-green)" size={20}/> Divya Yatra Solution</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>
            We predict demand before devotees arrive. Utilizing AI to forecast crowds, dynamically allocate walking vs online slots, optimize routes, and manage parking - reducing waiting times and drastically cutting administrative costs.
          </p>
        </div>
      </div>
      
      <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
        <h3 style={{ marginBottom: 16, fontSize: 24, color: 'var(--accent-gold)' }}>Social Impact Focus</h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: 16, lineHeight: 1.6 }}>
          A safer pilgrimage experience with better accessibility for the elderly, improved efficiency for temple staff, and increased economic and transport utilization for local municipal communities.
        </p>
      </div>
    </div>
  );
}
