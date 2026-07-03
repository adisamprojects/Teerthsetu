const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// In-Memory store for password reset tokens
const resetTokens = {};
const otpStore = {};

// Auto-copy splash image from brain storage to frontend assets
const fs = require('fs');
/*
const srcPath = 'C:\\Users\\sampr\\.gemini\\antigravity-ide\\brain\\ea77fc53-5cee-4e1f-8602-f04d987b847a\\media__1782462250710.jpg';
const destDir = path.join(__dirname, '..', 'frontend', 'public');
const destPath = path.join(destDir, 'splash_bg.jpg');

try {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log('Successfully copied new dark splash image to public folder!');
  } else {
    console.error('Source dark splash image not found at:', srcPath);
  }

  // Copy light splash background image
  const lightBgSrcPath = 'C:\\Users\\sampr\\.gemini\\antigravity-ide\\brain\\ea77fc53-5cee-4e1f-8602-f04d987b847a\\media__1782462013891.jpg';
  const lightBgDestPath = path.join(destDir, 'splash_bg_light.jpg');
  if (fs.existsSync(lightBgSrcPath)) {
    fs.copyFileSync(lightBgSrcPath, lightBgDestPath);
    console.log('Successfully copied light splash background image to public folder!');
  } else {
    console.error('Source light splash background image not found at:', lightBgSrcPath);
  }

  // Copy dark mode logo image
  const logoSrcPath = 'C:\\Users\\sampr\\.gemini\\antigravity-ide\\brain\\ea77fc53-5cee-4e1f-8602-f04d987b847a\\media__1782467672601.png';
  const logoDestPath = path.join(destDir, 'logo.png');
  if (fs.existsSync(logoSrcPath)) {
    fs.copyFileSync(logoSrcPath, logoDestPath);
    console.log('Successfully copied logo image to public folder!');
  } else {
    console.error('Source logo image not found at:', logoSrcPath);
  }

  // Copy light mode gold logo image
  const logoLightSrcPath = 'C:\\Users\\sampr\\.gemini\\antigravity-ide\\brain\\ea77fc53-5cee-4e1f-8602-f04d987b847a\\media__1782465706011.png';
  const logoLightDestPath = path.join(destDir, 'logo_light.png');
  if (fs.existsSync(logoLightSrcPath)) {
    fs.copyFileSync(logoLightSrcPath, logoLightDestPath);
    console.log('Successfully copied light mode logo image to public folder!');
  } else {
    console.error('Source light mode logo image not found at:', logoLightSrcPath);
  }

  // Copy tagline image
  const taglineSrcPath = 'C:\\Users\\sampr\\.gemini\\antigravity-ide\\brain\\d35519f3-ceb8-4564-96bb-bf9f5a7a60cf\\media__1782457447089.png';
  const taglineDestPath = path.join(destDir, 'tagline.png');
  if (fs.existsSync(taglineSrcPath)) {
    fs.copyFileSync(taglineSrcPath, taglineDestPath);
    console.log('Successfully copied tagline image to public folder!');
  } else {
    console.error('Source tagline image not found at:', taglineSrcPath);
  }
} catch (err) {
  console.error('Error copying assets:', err);
}
*/

// In-Memory Database
const temples = [
  { _id: '1', name: 'Tirupati Venkateswara', location: 'Andhra Pradesh', dailyLimit: 80000, currentCapacity: 75000, waitTime: 45, crowdLevel: 'High', image: 'https://images.unsplash.com/photo-1600100397608-f010e42edb7a?auto=format&fit=crop&w=600&q=80', history: 'An ancient hill temple dedicated to Lord Venkateswara, built around 300 AD.', timings: '3:00 AM - 11:00 PM', dressCode: 'Traditional Indian Wear (Dhoti/Saree)', facilities: ['Prasadam', 'Wheelchairs', 'Locker Room', 'Medical Camp'] },
  { _id: '2', name: 'Kedarnath Temple', location: 'Uttarakhand', dailyLimit: 20000, currentCapacity: 12000, waitTime: 20, crowdLevel: 'Moderate', image: 'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?auto=format&fit=crop&w=600&q=80', history: 'One of the twelve Jyotirlingas, located in the Himalayas and built by Pandavas.', timings: '6:00 AM - 7:00 PM', dressCode: 'Warm decent clothing', facilities: ['Medical Camp', 'Helipad', 'Shelter Camps'] },
  { _id: '3', name: 'Kashi Vishwanath', location: 'Uttar Pradesh', dailyLimit: 50000, currentCapacity: 48000, waitTime: 60, crowdLevel: 'High', image: 'https://images.unsplash.com/photo-1627664819818-e147d6221422?auto=format&fit=crop&w=600&q=80', history: 'Situated on the western bank of holy river Ganga, this Jyotirlinga is centuries old.', timings: '4:00 AM - 11:00 PM', dressCode: 'Decent casuals/traditional', facilities: ['Queue Shelters', 'Drinking Water', 'Wheelchairs'] },
  { _id: '4', name: 'Vaishno Devi', location: 'Jammu & Kashmir', dailyLimit: 40000, currentCapacity: 25000, waitTime: 15, crowdLevel: 'Low', image: 'https://images.unsplash.com/photo-1612438214708-f428a707dd4e?auto=format&fit=crop&w=600&q=80', history: 'A holy cave temple situated in Trikuta Hills, dedicated to Vaishno Devi Durga.', timings: '24 Hours Open', dressCode: 'Comfortable modest clothes', facilities: ['Bhojanalayas', 'Battery Cars', 'Cloak Rooms', 'Porters'] },
  { _id: '5', name: 'Sabarimala Temple', location: 'Kerala', dailyLimit: 90000, currentCapacity: 85000, waitTime: 90, crowdLevel: 'High', image: 'https://images.unsplash.com/photo-1545244197-a61f4fa9b6b7?auto=format&fit=crop&w=600&q=80', history: 'Dedicated to Lord Ayyappa, situated atop a hill surrounded by dense forests.', timings: '4:00 AM - 10:00 PM', dressCode: 'Black/Blue traditional attire', facilities: ['Prasadam', 'Rest Rooms', 'First Aid'] },
  { _id: '6', name: 'Somnath Temple', location: 'Gujarat', dailyLimit: 30000, currentCapacity: 10000, waitTime: 10, crowdLevel: 'Low', image: 'https://images.unsplash.com/photo-1569470451072-68314f596aec?auto=format&fit=crop&w=600&q=80', history: 'Reconstructed several times, this temple sits at the shore of the Arabian Sea.', timings: '6:00 AM - 9:30 PM', dressCode: 'Modest wear', facilities: ['Light & Sound Show', 'Museum', 'Guest Houses'] },
  { _id: '7', name: 'Dwarkadhish Temple', location: 'Gujarat', dailyLimit: 25000, currentCapacity: 22000, waitTime: 35, crowdLevel: 'Moderate', image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80', history: 'Dedicated to Lord Krishna, known as Jagat Mandir, built over 2000 years ago.', timings: '6:30 AM - 9:30 PM', dressCode: 'Traditional Indian', facilities: ['Locker facilities', 'Prasadam counter'] },
  { _id: '8', name: 'Jagannath Puri', location: 'Odisha', dailyLimit: 60000, currentCapacity: 50000, waitTime: 50, crowdLevel: 'High', image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=600&q=80', history: 'Famous for its annual Ratha Yatra, dedicated to Lord Jagannath, Balabhadra and Subhadra.', timings: '5:00 AM - 11:00 PM', dressCode: 'Traditional clothes', facilities: ['Ananda Bazar (Food)', 'Shoe Stand', 'Rest Areas'] },
  { _id: '9', name: 'Meenakshi Temple', location: 'Tamil Nadu', dailyLimit: 45000, currentCapacity: 20000, waitTime: 15, crowdLevel: 'Low', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80', history: 'A historic Hindu temple on the southern bank of Vaigai river in Madurai.', timings: '5:00 AM - 10:00 PM', dressCode: 'Full length covering apparel', facilities: ['Cloak Rooms', 'Guide services', 'Drinking Water'] },
  { _id: '10', name: 'Badrinath Temple', location: 'Uttarakhand', dailyLimit: 15000, currentCapacity: 14000, waitTime: 40, crowdLevel: 'High', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80', history: 'Part of Char Dham pilgrimage, dedicated to Lord Vishnu along the Alaknanda river.', timings: '4:30 AM - 9:00 PM', dressCode: 'Warm modest clothing', facilities: ['Thermal Springs Bath', 'Medical Station'] }
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

let bookings = [
  {
    bookingId: 'TS-16800100-3482',
    templeId: '1',
    templeName: 'Tirupati Venkateswara',
    date: '2026-06-27',
    timeSlot: '09:00 AM (Available)',
    visitors: 3,
    specialDarshan: 'VVIP',
    wheelchair: true,
    volunteer: true,
    medical: false,
    status: 'Upcoming',
    waitlistPosition: 0
  },
  {
    bookingId: 'TS-16800100-8812',
    templeId: '3',
    templeName: 'Kashi Vishwanath',
    date: '2026-06-22',
    timeSlot: '11:00 AM (Available)',
    visitors: 2,
    specialDarshan: 'General',
    wheelchair: false,
    volunteer: false,
    medical: false,
    status: 'Completed',
    waitlistPosition: 0
  }
];

let notifications = [
  { id: 1, type: 'Booking Alert', message: 'Your Darshan booking at Tirupati Venkateswara is confirmed for tomorrow.', date: 'Just now', unread: true },
  { id: 2, type: 'Crowd Alert', message: 'Heavy crowd surge at Kashi Vishwanath. Wait time extended by 40 minutes.', date: '30 mins ago', unread: true },
  { id: 3, type: 'Festival Update', message: 'Special Brahmotsavam decorations begin tonight at Sabarimala.', date: '2 hours ago', unread: false },
  { id: 4, type: 'Emergency Broadcast', message: 'All routes to Badrinath cleared. Operations running normally.', date: '1 day ago', unread: false }
];

let hotels = [
  { id: '1', name: 'Mayura Residency', type: 'Hotel', rating: 4.6, price: 2500, distance: '0.8 km', amenities: ['Free Wi-Fi', 'AC', 'Vegetarian Restaurant'] },
  { id: '2', name: 'Balaji Dharamshala', type: 'Dharamshala', rating: 4.1, price: 400, distance: '1.2 km', amenities: ['Drinking Water', 'Common Hall', 'Locker'] },
  { id: '3', name: 'Srinivas Guest House', type: 'Temple Guest House', rating: 4.4, price: 800, distance: '0.3 km', amenities: ['Near Gate 1', 'AC Option', 'Parking'] },
  { id: '4', name: 'Grand Tirupati Palace', type: 'Hotel', rating: 4.8, price: 4500, distance: '2.5 km', amenities: ['Swimming Pool', 'Buffet', 'AC', 'Cab Service'] },
  { id: '5', name: 'Kedarnath Pilgrim Shelters', type: 'Lodge', rating: 3.9, price: 600, distance: '0.1 km', amenities: ['Hot Water', 'Blankets Provided'] }
];

// --- ROUTES ---

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'TeerthSethu API is running' }));

// Auth Module
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  const token = crypto.randomBytes(32).toString('hex');
  resetTokens[token] = { email, expires: Date.now() + 3600000 };

  try {
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER || 'apikey',
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;

    let info = await transporter.sendMail({
      from: '"TeerthSetu" <' + (process.env.SMTP_FROM_EMAIL || 'noreply@yourdomain.com') + '>',
      to: email,
      subject: "Password Reset Request",
      text: `Please click the following link to reset your password: ${resetUrl}`,
      html: `<p>Please click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
    });

    console.log("Password reset email actually sent to: %s", email);
    res.json({ success: true, message: 'Reset link sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

app.post('/api/auth/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  const resetData = resetTokens[token];

  if (!resetData || resetData.expires < Date.now()) {
    return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  }

  console.log(`Password for ${resetData.email} has been updated to ${newPassword}`);
  delete resetTokens[token];
  res.json({ success: true, message: 'Password updated successfully' });
});

// Authorized admin emails set by management/developers
const authorizedAdmins = [
  'admin@teerthsetu.com',
  'developer@teerthsetu.com',
  'management@teerthsetu.com'
];

app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  
  if (role === 'admin') {
    if (!authorizedAdmins.includes(email)) {
      return res.status(403).json({ success: false, message: 'Access Denied: Account not authorized for admin portal. Contact management.' });
    }
  }

  res.json({
    token: `mock-jwt-${role}-${Date.now()}`,
    user: {
      email,
      role,
      name: role === 'admin' ? 'Pandit Shastri' : 'Devendra Kumar',
      phone: '+91 9876543210',
      address: 'Sector 4, Dwarka, New Delhi',
      aadhaar: 'XXXX-XXXX-4920',
      emergencyContact: 'Amit Kumar (+91 9876543211)'
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const userData = req.body;
  res.json({
    success: true,
    token: `mock-jwt-devotee-${Date.now()}`,
    user: {
      ...userData,
      role: 'devotee'
    }
  });
});

app.post('/api/auth/google-login', (req, res) => {
  const { idToken, role } = req.body;
  const mockEmail = 'google-user@example.com';
  
  if (role === 'admin') {
    if (!authorizedAdmins.includes(mockEmail)) {
      return res.status(403).json({ success: false, message: 'Access Denied: Google Account not authorized for admin portal. Contact management.' });
    }
  }

  res.json({
    success: true,
    token: `mock-jwt-google-${Date.now()}`,
    user: {
      email: mockEmail,
      name: 'Google User',
      role: role || 'devotee',
      phone: '+91 9999999999',
      address: 'New Delhi',
      aadhaar: 'XXXX-XXXX-0000',
      emergencyContact: 'Family (+91 9999999998)'
    }
  });
});

// Devotee Module
app.post('/api/devotee/send-otp', async (req, res) => {
  const { email, phone } = req.body;
  const identifier = email || phone;
  if (!identifier) return res.status(400).json({ success: false, message: 'Email or phone required' });

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[identifier] = { otp, expires: Date.now() + 5 * 60000 }; // 5 mins

  if (email) {
    try {
      let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
        port: process.env.SMTP_PORT || 587,
        auth: {
          user: process.env.SMTP_USER || 'apikey',
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      await transporter.sendMail({
        from: '"TeerthSetu" <' + (process.env.SMTP_FROM_EMAIL || 'noreply@yourdomain.com') + '>',
        to: email,
        subject: "Your TeerthSetu Login OTP",
        text: `Your login OTP is: ${otp}. It will expire in 5 minutes.`,
        html: `<h3>Your TeerthSetu Login OTP is:</h3><h1 style="color:#e85a28; letter-spacing: 5px;">${otp}</h1><p>It will expire in 5 minutes.</p>`,
      });

      console.log("OTP actually sent to: %s", email);
      res.json({ success: true, message: 'OTP sent successfully' });
    } catch (err) {
      console.error("OTP email error:", err);
      res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
  } else if (phone) {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const twilio = require('twilio');
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: `Your TeerthSetu Login OTP is: ${otp}. It will expire in 5 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone.startsWith('+') ? phone : `+91${phone}`
        });
        console.log("Real SMS OTP sent to: %s", phone);
        res.json({ success: true, message: 'SMS OTP sent successfully' });
      } catch (err) {
        console.error("Twilio SMS error:", err);
        res.status(500).json({ success: false, message: 'Failed to send SMS OTP' });
      }
    } else {
      console.log(`[SIMULATED SMS] to ${phone}: Your TeerthSetu Login OTP is ${otp}`);
      res.json({ success: true, message: 'OTP sent to phone (Check terminal console)' });
    }
  }
});

app.post('/api/devotee/verify-otp', (req, res) => {
  const { email, phone, otp } = req.body;
  const identifier = email || phone;
  const record = otpStore[identifier];

  if (!record || record.expires < Date.now()) {
    return res.status(400).json({ success: false, message: 'OTP expired or invalid' });
  }
  
  if (record.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Incorrect OTP' });
  }

  delete otpStore[identifier];

  res.json({ 
    success: true, 
    token: `mock-jwt-devotee-${Date.now()}`,
    user: {
      email: email || `${phone}@temple.com`,
      role: 'devotee',
      name: 'Devendra Kumar',
      phone: phone || '+91 9876543210'
    }
  });
});

app.get('/api/temples', (req, res) => res.json(temples));

// Bookings
app.get('/api/bookings', (req, res) => res.json(bookings));

app.post('/api/bookings', (req, res) => {
  const { templeId, date, timeSlot, visitors, specialDarshan, wheelchair, volunteer, medical } = req.body;
  const targetTemple = temples.find(t => t._id === templeId) || { name: 'Unknown Temple' };

  const bookingId = `TS-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Decide waitlist based on capacity
  const isHighCrowd = targetTemple.crowdLevel === 'High';
  const waitlistPosition = isHighCrowd && Math.random() > 0.6 ? Math.floor(15 + Math.random() * 30) : 0;

  const newBooking = {
    bookingId,
    templeId,
    templeName: targetTemple.name,
    date: date || new Date().toISOString().split('T')[0],
    timeSlot: timeSlot || '09:00 AM (Available)',
    visitors: parseInt(visitors) || 1,
    specialDarshan: specialDarshan || 'General',
    wheelchair: !!wheelchair,
    volunteer: !!volunteer,
    medical: !!medical,
    status: 'Upcoming',
    waitlistPosition
  };

  bookings.unshift(newBooking);

  // Update admin stats
  globalState.activeVisitors += parseInt(visitors) || 1;
  globalState.todayRevenue += (specialDarshan === 'VVIP' ? 500 : 0) * (parseInt(visitors) || 1);

  res.json({ success: true, ...newBooking });
});

// Reschedule Booking
app.post('/api/bookings/reschedule', (req, res) => {
  const { bookingId, date, timeSlot } = req.body;
  const booking = bookings.find(b => b.bookingId === bookingId);
  if (booking) {
    booking.date = date;
    booking.timeSlot = timeSlot;
    return res.json({ success: true, booking });
  }
  res.status(404).json({ success: false, message: 'Booking not found' });
});

// Cancel Booking
app.delete('/api/bookings/:id', (req, res) => {
  const bookingId = req.params.id;
  const index = bookings.findIndex(b => b.bookingId === bookingId);
  if (index !== -1) {
    bookings[index].status = 'Cancelled';
    res.json({ success: true, booking: bookings[index] });
  } else {
    res.status(404).json({ success: false, message: 'Booking not found' });
  }
});

// Accommodation
app.get('/api/hotels', (req, res) => res.json(hotels));

// Notifications
app.get('/api/notifications', (req, res) => res.json(notifications));

app.post('/api/notifications/read-all', (req, res) => {
  notifications = notifications.map(n => ({ ...n, unread: false }));
  res.json({ success: true });
});

// Journey Route Planner
app.post('/api/planner', (req, res) => {
  const { startingCity, templeId, days, budget } = req.body;

  // Mock logic to recommend route
  const start = startingCity || 'Delhi';
  const daysNum = parseInt(days) || 3;
  const costPerDay = budget === 'Economy' ? 1200 : 3500;

  res.json({
    route: [
      { name: start, type: 'Origin' },
      { name: 'Tirupati Venkateswara', type: 'Primary Destination', stay: 'Srinivas Guest House', transit: 'Train / Air' },
      { name: 'Sri Kalahasti Temple', type: 'Excursion', stay: 'Day trip', transit: 'Local Taxi (36 km)' },
      { name: 'Padmavathi Temple', type: 'Excursion', stay: 'Day trip', transit: 'Auto Rickshaw (5 km)' }
    ],
    hotels: [
      { name: 'Srinivas Guest House', price: budget === 'Economy' ? 800 : 2500, rating: 4.4 },
      { name: 'Balaji Dharamshala', price: 400, rating: 4.1 }
    ],
    transport: {
      mode: budget === 'Economy' ? 'Public Train' : 'Private SUV',
      distance: '135 km total route',
      estTime: `${daysNum} Days Itinerary`,
      estFuel: budget === 'Economy' ? '₹900 tickets' : '₹3,500 fuel & tolls',
      budgetEstimate: `₹${daysNum * costPerDay + (budget === 'Economy' ? 1500 : 6000)}`
    }
  });
});

// Admin Module
app.get('/api/admin/stats', (req, res) => {
  // Update stats based on actual booking counts
  const upcomingCount = bookings.filter(b => b.status === 'Upcoming').length;
  res.json({
    ...globalState,
    activeTickets: upcomingCount,
  });
});

app.get('/api/admin/analytics', (req, res) => res.json(attendanceHistory));

app.post('/api/admin/config', (req, res) => {
  if (req.body.emergencyMode !== undefined) globalState.emergencyMode = req.body.emergencyMode;
  if (req.body.onlineRatio !== undefined) globalState.onlineRatio = req.body.onlineRatio;
  res.json({ success: true, state: globalState });
});

app.post('/api/admin/scan', (req, res) => {
  const { qrCode } = req.body;

  if (!qrCode) {
    return res.status(400).json({ valid: false, message: 'NO CODE PROVIDED' });
  }

  // If already used
  if (qrCode.includes("USED") || qrCode === 'TS-EXPIRED') {
    return res.json({ valid: false, message: 'ALREADY USED / EXPIRED' });
  }

  // Find in bookings
  const booking = bookings.find(b => b.bookingId === qrCode);
  if (booking) {
    if (booking.status === 'Completed') {
      return res.json({ valid: false, message: 'ALREADY CHECKED IN' });
    }
    if (booking.status === 'Cancelled') {
      return res.json({ valid: false, message: 'BOOKING CANCELLED' });
    }
    booking.status = 'Completed';
    globalState.activeVisitors += 1;
    return res.json({ valid: true, message: `VALID DARSHAN - ${booking.visitors} GUESTS` });
  }

  // Random check for simulated values
  if (qrCode.startsWith('TS-')) {
    globalState.activeVisitors += 1;
    return res.json({ valid: true, message: 'VALID TICKET - ENTRY MARKED' });
  }

  res.json({ valid: false, message: 'INVALID PASS CODE' });
});

// AI Prediction Module
app.get('/api/ai/forecast', (req, res) => {
  const { weather, isWeekend, isFestival } = req.query;
  let mult = 1.0;
  if (weather === 'Rain') mult = 0.7;
  if (isWeekend === 'true') mult = 1.3;
  if (isFestival === 'true') mult = 2.2;

  const expected = Math.floor(45000 * mult);
  res.json({
    expectedCrowd: expected,
    volunteersNeeded: Math.floor(120 * mult),
    securityNeeded: Math.floor(200 * mult),
    wheelchairs: Math.floor(50 * mult),
    prasadamLakhs: (1.5 * mult).toFixed(1),
    parkingOccupancy: Math.min(100, Math.floor(60 * mult)),
    queueLengthMeters: Math.floor(350 * mult),
    overflowVehicles: Math.max(0, Math.floor((60 * mult - 90) * 15))
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TeerthSethu Backend Server running on port ${PORT}`));
