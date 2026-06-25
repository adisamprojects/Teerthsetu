const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Fake database - Seeded with 10 major temples
const temples = [
  { _id: '1', name: 'Tirupati Venkateswara', location: 'Andhra Pradesh', dailyLimit: 80000, currentCapacity: 75000, waitTime: 45, crowdLevel: 'High' },
  { _id: '2', name: 'Kedarnath Temple', location: 'Uttarakhand', dailyLimit: 20000, currentCapacity: 12000, waitTime: 20, crowdLevel: 'Moderate' },
  { _id: '3', name: 'Kashi Vishwanath', location: 'Uttar Pradesh', dailyLimit: 50000, currentCapacity: 48000, waitTime: 60, crowdLevel: 'High' },
  { _id: '4', name: 'Vaishno Devi', location: 'Jammu & Kashmir', dailyLimit: 40000, currentCapacity: 25000, waitTime: 15, crowdLevel: 'Low' },
  { _id: '5', name: 'Sabarimala Temple', location: 'Kerala', dailyLimit: 90000, currentCapacity: 85000, waitTime: 90, crowdLevel: 'High' },
  { _id: '6', name: 'Somnath Temple', location: 'Gujarat', dailyLimit: 30000, currentCapacity: 10000, waitTime: 10, crowdLevel: 'Low' },
  { _id: '7', name: 'Dwarkadhish Temple', location: 'Gujarat', dailyLimit: 25000, currentCapacity: 22000, waitTime: 35, crowdLevel: 'Moderate' },
  { _id: '8', name: 'Jagannath Puri', location: 'Odisha', dailyLimit: 60000, currentCapacity: 50000, waitTime: 50, crowdLevel: 'High' },
  { _id: '9', name: 'Meenakshi Temple', location: 'Tamil Nadu', dailyLimit: 45000, currentCapacity: 20000, waitTime: 15, crowdLevel: 'Low' },
  { _id: '10', name: 'Badrinath Temple', location: 'Uttarakhand', dailyLimit: 15000, currentCapacity: 14000, waitTime: 40, crowdLevel: 'High' }
];

let globalState = {
  activeVisitors: 12450,
  exitedVisitors: 32000,
  emergencyMode: false,
  onlineRatio: 70,
  todayRevenue: 120000,
  avgWaitMins: 22
};

const attendanceHistory = [
  { time: '08:00', visitors: 1200 },
  { time: '10:00', visitors: 3500 },
  { time: '12:00', visitors: 4800 },
  { time: '14:00', visitors: 4100 },
  { time: '16:00', visitors: 5200 },
  { time: '18:00', visitors: 3800 },
];

// --- ROUTES ---

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Divya Yatra API is running' }));

// Auth Module
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  // Mock JWT response
  res.json({ token: `mock-jwt-${role}-${Date.now()}`, user: { email, role } });
});

// Devotee Module
app.get('/api/temples', (req, res) => res.json(temples));

app.post('/api/bookings', (req, res) => {
  const { templeId, date, members, needWheelchair, needVolunteer } = req.body;
  const qrCode = `DY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  res.json({ success: true, bookingId: qrCode, qrCode, members, needWheelchair, needVolunteer });
});

app.post('/api/planner', (req, res) => {
  res.json({
    route: ['Tirupati', 'Sri Kalahasti Temple', 'Padmavathi Temple'],
    hotels: ['Taj Tirupati', 'Marasa Sarovar Premiere'],
    transport: { mode: 'Private Car', distance: '45 km', estTime: '1h 15m', estFuel: '₹400' }
  });
});

// Admin Module
app.get('/api/admin/stats', (req, res) => res.json(globalState));

app.get('/api/admin/analytics', (req, res) => res.json(attendanceHistory));

app.post('/api/admin/config', (req, res) => {
  if (req.body.emergencyMode !== undefined) globalState.emergencyMode = req.body.emergencyMode;
  if (req.body.onlineRatio !== undefined) globalState.onlineRatio = req.body.onlineRatio;
  res.json({ success: true, state: globalState });
});

app.post('/api/admin/scan', (req, res) => {
  const { qrCode } = req.body;
  // Mock logic
  if(qrCode.includes("USED")) return res.json({ valid: false, message: 'ALREADY USED' });
  
  globalState.activeVisitors += 1;
  res.json({ valid: true, message: 'VALID ENTRY' });
});

// AI Prediction Module
/**
 * AI Prediction Logic:
 * In a real production environment, this would run a Python/TensorFlow microservice 
 * executing a multiple regression model over historical attendance, festival calendars, 
 * and localized weather APIs.
 * 
 * Here, we use a heuristic multiplier model for the MVP:
 * - Base logic assumes normal crowd bounds.
 * - 'Rain' weather applies a 0.7x reducer (discourages travel).
 * - 'Weekend' applies a 1.3x multiplier (standard work week off).
 * - 'Festival' applies a massive 2.0x multiplier.
 * 
 * These multipliers cascade linearly into resource optimization equations:
 * - Security = Base (200) * Multiplier
 * - Prasadam = Base (1.5 Lakh units) * Multiplier
 */
app.get('/api/ai/forecast', (req, res) => {
  const { weather, isWeekend, isFestival } = req.query;
  let mult = 1;
  if (weather === 'Rain') mult = 0.7;
  if (isWeekend === 'true') mult = 1.3;
  if (isFestival === 'true') mult = 2.0;

  res.json({
    expectedCrowd: Math.floor(45000 * mult),
    volunteersNeeded: Math.floor(120 * mult),
    securityNeeded: Math.floor(200 * mult),
    wheelchairs: Math.floor(50 * mult),
    prasadamLakhs: (1.5 * mult).toFixed(1),
    parkingOccupancy: Math.min(100, Math.floor(60 * mult))
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Divya Yatra Backend Server running on port ${PORT}`));
