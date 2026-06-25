import { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Users, Calendar, QrCode } from 'lucide-react';

export default function DevoteePortal() {
  const [temples, setTemples] = useState([]);
  const [selectedTemple, setSelectedTemple] = useState('');
  const [bookingStatus, setBookingStatus] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch('/api/temples')
      .then(res => res.json())
      .then(data => {
        setTemples(data);
        if(data.length > 0) setSelectedTemple(data[0]._id);
      })
      .catch(console.error);
  }, []);

  const handleBooking = (e) => {
    e.preventDefault();
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templeId: selectedTemple, members: 2 })
    })
      .then(res => res.json())
      .then(data => {
        setBookingStatus(data);
        showToast('Darshan Slot Successfully Booked!');
      });
  };

  const handleCancel = () => {
    setBookingStatus(null);
    showToast('Booking Cancelled. Waitlisted pilgrim automatically promoted!');
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  return (
    <div className="grid-2">
      <div className="card">
        <h2 className="card-title">Temple Discovery & Booking</h2>
        <div style={{ marginBottom: 16 }}>
          <Search size={16} style={{ position: 'absolute', margin: '14px' }} color="var(--text-muted)" />
          <input type="text" placeholder="Search major temples..." style={{ paddingLeft: 40 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {temples.map(t => (
            <div 
              key={t._id} 
              style={{ 
                padding: 16, 
                border: selectedTemple === t._id ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)', 
                borderRadius: 8,
                cursor: 'pointer',
                background: selectedTemple === t._id ? 'rgba(245, 158, 11, 0.1)' : 'transparent'
              }}
              onClick={() => setSelectedTemple(t._id)}
            >
              <div style={{ fontWeight: 600, fontSize: 18 }}>{t.name}</div>
              <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 14, color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14}/> {t.location}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={14}/> {t.currentCapacity}/{t.dailyLimit}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-orange)' }}><Clock size={14}/> {t.waitTime} min wait</span>
              </div>
            </div>
          ))}
        </div>

        {!bookingStatus ? (
          <form onSubmit={handleBooking}>
            <div className="grid-2">
              <input type="date" required />
              <select required>
                <option value="1">1 Pilgrim</option>
                <option value="2">2 Pilgrims</option>
                <option value="4">Family (4)</option>
              </select>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 14 }}>
              <input type="checkbox" style={{ width: 'auto', marginBottom: 0 }} /> Request Wheelchair / Elder Support
            </label>
            <div style={{ display: 'flex', gap: 16 }}>
              <button type="submit" style={{ flex: 1 }}>Book Darshan Slot</button>
              <button type="button" className="secondary" onClick={() => alert("Launching Travel Planner...")} style={{ flex: 1 }}>
                Smart Travel Planner
              </button>
            </div>
          </form>
        ) : (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: 16, borderRadius: 8, border: '1px solid var(--accent-green)' }}>
            <h3 style={{ color: 'var(--accent-green)', marginBottom: 8 }}>Booking Confirmed!</h3>
            <p style={{ marginBottom: 16 }}>Your slot has been reserved dynamically.</p>
            <button className="secondary" onClick={handleCancel} style={{ color: 'var(--accent-orange)', borderColor: 'var(--accent-orange)' }}>
              Cancel Booking (Simulate Waitlist Promotion)
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="card-title">My Digital Passes</h2>
        {bookingStatus ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', color: 'black', borderRadius: 12 }}>
            <QrCode size={120} />
            <h2 style={{ marginTop: 16 }}>{bookingStatus.qrCode}</h2>
            <p style={{ color: '#666', marginTop: 8, fontWeight: 'bold' }}>Master Family QR System Pass</p>
            <p style={{ color: '#666', marginTop: 4 }}>Valid for {bookingStatus.members} Pilgrims • One scan access</p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <Calendar size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
            <p>No active bookings found.</p>
          </div>
        )}
      </div>

      {toast && (
        <div className="alert-toast">
          {toast}
        </div>
      )}
    </div>
  );
}
