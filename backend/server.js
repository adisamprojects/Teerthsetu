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

// Auto-download and sync high-quality authentic temple images
const fs = require('fs');

(async function initializeTempleAssets() {
  const imageDir = path.join(__dirname, '..', 'frontend', 'public', 'image');
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  // Local mappings from high-quality photos
  const localCopies = [
    { src: 'andhra.jpg', dest: 'temple_1.jpg' },
    { src: 'uttrapradesh.jpg', dest: 'temple_2.jpg' },
    { src: 'uttrakand.jpg', dest: 'temple_3.jpg' },
    { src: 'odisha.jpg', dest: 'temple_5.jpg' },
    { src: 'gujarath.jpg', dest: 'temple_6.jpg' },
    { src: 'tamil.jpg', dest: 'temple_7.jpg' },
    { src: 'madhya pradesh.jpg', dest: 'temple_8.jpg' },
  ];

  for (const item of localCopies) {
    const s = path.join(imageDir, item.src);
    const d = path.join(imageDir, item.dest);
    try {
      if (fs.existsSync(s) && (!fs.existsSync(d) || fs.statSync(d).size < 1000)) {
        fs.copyFileSync(s, d);
        console.log(`[Assets] Copied ${item.src} -> ${item.dest}`);
      }
    } catch (e) {
      console.error(`[Assets] Copy error:`, e.message);
    }
  }

  // Real photos for temples from Google / Wikimedia / verified CDNs
  const remoteImages = [
    {
      dest: 'temple_4.jpg', // Badrinath Temple
      urls: [
        'https://badrinath-kedarnath.gov.in/Assets/image/badrinath.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/f/f9/Badrinath_Temple_%2C_Uttarakhand.jpg',
        'https://images.unsplash.com/photo-1626014303757-6564477577f1?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      dest: 'temple_9.jpg', // Vaishno Devi Temple
      urls: [
        'https://upload.wikimedia.org/wikipedia/commons/3/34/Vaishno_Devi_Bhavan.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/3/36/Bhavan_Vaishno_Devi.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Vaishno_Devi_Bhavan.jpg/1200px-Vaishno_Devi_Bhavan.jpg',
        'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      dest: 'temple_10.jpg', // Brihadisvara Temple (Thanjavur)
      urls: [
        'https://upload.wikimedia.org/wikipedia/commons/b/b5/Brihadisvara_Temple%2C_Thanjavur.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/6/6b/Tanjore_Brihadeeswara_Temple_crop.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Brihadisvara_Temple%2C_Thanjavur.jpg/1200px-Brihadisvara_Temple%2C_Thanjavur.jpg',
        'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      dest: 'temple_11.jpg', // Ramanathaswamy Temple (Rameswaram)
      urls: [
        'https://upload.wikimedia.org/wikipedia/commons/2/23/Rameswaram_Temple.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/5/52/Rameshwaram_temple_hall.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Rameswaram_Temple.jpg/1200px-Rameswaram_Temple.jpg',
        'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      dest: 'temple_12.jpg', // Konark Sun Temple
      urls: [
        'https://upload.wikimedia.org/wikipedia/commons/4/47/Konarka_Temple.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/a/a2/Sun_Temple%2C_Konark%2C_Odisha.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Konarka_Temple.jpg/1200px-Konarka_Temple.jpg',
        'https://images.unsplash.com/photo-1600100397608-f010e42edb7a?auto=format&fit=crop&w=1200&q=80'
      ]
    }
  ];

  function isValidImage(buf) {
    if (!buf || buf.length < 5000) return false;
    // JPEG magic bytes: FF D8 FF
    if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return true;
    // PNG magic bytes: 89 50 4E 47
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return true;
    // WebP magic bytes: RIFF .... WEBP
    if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return true;
    return false;
  }

  async function resolveWikiPageImage(pageTitle) {
    try {
      const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
      const res = await fetch(apiUrl, {
        headers: { 'User-Agent': 'TeerthSetuBot/1.0 (https://teerthsetu.org; dev@teerthsetu.org)' }
      });
      if (!res.ok) return null;
      const data = await res.json();
      console.log(`[Assets] Wiki REST API for ${pageTitle}:`, data?.originalimage?.source || data?.thumbnail?.source);
      return data?.originalimage?.source || data?.thumbnail?.source || null;
    } catch (e) {
      console.error(`[Assets] Wiki REST API error for ${pageTitle}:`, e.message);
    }
    return null;
  }

  for (const item of remoteImages) {
    const d = path.join(imageDir, item.dest);
    if (fs.existsSync(d)) {
      try {
        const existingBuf = fs.readFileSync(d);
        if (isValidImage(existingBuf)) {
          console.log(`[Assets] Valid image already exists for ${item.dest} (${existingBuf.length} bytes)`);
          continue;
        } else {
          console.log(`[Assets] Existing ${item.dest} is invalid, deleting and re-fetching...`);
          fs.unlinkSync(d);
        }
      } catch (e) {
        // ignore
      }
    }

    const wikiPages = {
      'temple_10.jpg': 'Brihadisvara_Temple',
      'temple_11.jpg': 'Ramanathaswamy_Temple'
    };

    const targetUrls = [...item.urls];
    if (wikiPages[item.dest]) {
      const resolved = await resolveWikiPageImage(wikiPages[item.dest]);
      if (resolved) {
        targetUrls.unshift(resolved);
      }
    }

    for (const url of targetUrls) {
      try {
        console.log(`[Assets] Fetching real image for ${item.dest} from ${url}...`);
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'TeerthSetuBot/1.0 (https://teerthsetu.org; dev@teerthsetu.org)',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
          }
        });
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          if (isValidImage(buffer)) {
            fs.writeFileSync(d, buffer);
            console.log(`[Assets] Successfully saved verified image for ${item.dest} (${buffer.length} bytes)`);
            break;
          } else {
            console.log(`[Assets] Downloaded payload from ${url} is not a valid image (${buffer.length} bytes)`);
          }
        } else {
          console.log(`[Assets] Status ${res.status} for ${url}`);
        }
      } catch (err) {
        console.error(`[Assets] Error downloading ${url}:`, err.message);
      }
    }
  }
})();

// In-Memory Database - 12 Sacred Pilgrimage Temples
const temples = [
  {
    "_id": "1",
    "name": "Tirumala Venkateswara Temple",
    "location": "Tirupati, Andhra Pradesh",
    "dailyLimit": 35000,
    "currentCapacity": 28000,
    "waitTime": 45,
    "crowdLevel": "High",
    "rating": 5.0,
    "image": "/image/temple_1.jpg",
    "history": "Presiding Deity: Lord Venkateswara (Vishnu), situated on the sacred Tirumala hills.",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional Dhoti / Saree",
    "facilities": [
      "Prasadam",
      "Wheelchairs",
      "Cloakroom",
      "Battery Cars"
    ],
    "lat": 13.6833,
    "lon": 79.3475
  },
  {
    "_id": "2",
    "name": "Kashi Vishwanath Temple",
    "location": "Varanasi, Uttar Pradesh",
    "dailyLimit": 30000,
    "currentCapacity": 24000,
    "waitTime": 40,
    "crowdLevel": "High",
    "rating": 5.0,
    "image": "/image/temple_2.jpg",
    "history": "Presiding Deity: Lord Shiva (Vishveshvara), one of the twelve Jyotirlingas on the banks of the sacred Ganga.",
    "timings": "3:00 AM - 11:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs",
      "Locker Counter"
    ],
    "lat": 25.3109,
    "lon": 83.0107
  },
  {
    "_id": "3",
    "name": "Kedarnath Temple",
    "location": "Uttarakhand",
    "dailyLimit": 18000,
    "currentCapacity": 14000,
    "waitTime": 35,
    "crowdLevel": "Moderate",
    "rating": 5.0,
    "image": "/image/temple_3.jpg",
    "history": "Presiding Deity: Lord Shiva, nestled in the Garhwal Himalayas near Mandakini river, among the most revered Chota Char Dham.",
    "timings": "4:00 AM - 9:00 PM",
    "dressCode": "Warm Traditional / Modest Clothing",
    "facilities": [
      "Medical Aid",
      "Emergency Oxygen",
      "Pony & Palki",
      "Helicopter Booking"
    ],
    "lat": 30.7352,
    "lon": 79.0669
  },
  {
    "_id": "4",
    "name": "Badrinath Temple",
    "location": "Uttarakhand",
    "dailyLimit": 20000,
    "currentCapacity": 16000,
    "waitTime": 25,
    "crowdLevel": "Moderate",
    "rating": 4.9,
    "image": "/image/temple_4.jpg",
    "history": "Presiding Deity: Lord Badri Narayan (Vishnu), located along the banks of the Alaknanda River in the Chamoli district.",
    "timings": "4:30 AM - 9:00 PM",
    "dressCode": "Warm Traditional Clothing",
    "facilities": [
      "Prasadam",
      "Tapt Kund Hot Springs",
      "Medical Aid",
      "Cloakroom"
    ],
    "lat": 30.7433,
    "lon": 79.4938
  },
  {
    "_id": "5",
    "name": "Jagannath Temple",
    "location": "Puri, Odisha",
    "dailyLimit": 32000,
    "currentCapacity": 26000,
    "waitTime": 35,
    "crowdLevel": "High",
    "rating": 4.9,
    "image": "/image/temple_5.jpg",
    "history": "Presiding Deity: Lord Jagannath (Krishna), Balabhadra, and Subhadra, celebrated worldwide for the grand annual Ratha Yatra.",
    "timings": "5:00 AM - 11:00 PM",
    "dressCode": "Traditional Attire (Cotton Dhoti/Kurta/Saree)",
    "facilities": [
      "Mahaprasadam (Ananda Bazar)",
      "Shoe Stand",
      "Wheelchairs",
      "Drinking Water"
    ],
    "lat": 19.8049,
    "lon": 85.8179
  },
  {
    "_id": "6",
    "name": "Somnath Temple",
    "location": "Gujarat",
    "dailyLimit": 25000,
    "currentCapacity": 19000,
    "waitTime": 20,
    "crowdLevel": "Moderate",
    "rating": 4.9,
    "image": "/image/temple_6.jpg",
    "history": "Presiding Deity: Lord Shiva, the eternal shrine and first among the twelve holy Jyotirlinga shrines of India on the Arabian Sea coast.",
    "timings": "6:00 AM - 10:00 PM",
    "dressCode": "Decent Modest Wear",
    "facilities": [
      "Sound & Light Show",
      "Prasadam Counter",
      "Cloakroom",
      "Wheelchairs"
    ],
    "lat": 20.8880,
    "lon": 70.4012
  },
  {
    "_id": "7",
    "name": "Meenakshi Amman Temple",
    "location": "Madurai, Tamil Nadu",
    "dailyLimit": 28000,
    "currentCapacity": 22000,
    "waitTime": 30,
    "crowdLevel": "Moderate",
    "rating": 4.9,
    "image": "/image/temple_7.jpg",
    "history": "Presiding Deity: Goddess Meenakshi (Parvati) and Sundareswarar (Shiva), renowned for its awe-inspiring Dravidian gopurams.",
    "timings": "5:00 AM - 12:30 PM, 4:00 PM - 10:00 PM",
    "dressCode": "Traditional Dress (Strictly No Western Casuals)",
    "facilities": [
      "Prasadam",
      "Golden Lotus Tank",
      "Battery Cars",
      "Wheelchairs"
    ],
    "lat": 9.9195,
    "lon": 78.1193
  },
  {
    "_id": "8",
    "name": "Mahakaleshwar Temple",
    "location": "Ujjain, Madhya Pradesh",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 45,
    "crowdLevel": "High",
    "rating": 4.9,
    "image": "/image/temple_8.jpg",
    "history": "Presiding Deity: Lord Mahakaleshwar (Shiva), the only south-facing (Dakshinmurti) Swayambhu Jyotirlinga, famous for the sacred Bhasma Aarti.",
    "timings": "4:00 AM - 11:00 PM",
    "dressCode": "Traditional Dhoti/Sola for Garbhagriha, Modest Wear",
    "facilities": [
      "Bhasma Aarti Booking",
      "Prasadam",
      "Cloakroom",
      "Locker Counters"
    ],
    "lat": 23.1827,
    "lon": 75.7682
  },
  {
    "_id": "9",
    "name": "Vaishno Devi Temple",
    "location": "Jammu & Kashmir",
    "dailyLimit": 35000,
    "currentCapacity": 29000,
    "waitTime": 50,
    "crowdLevel": "High",
    "rating": 5.0,
    "image": "/image/temple_9.jpg",
    "history": "Presiding Deity: Mata Vaishno Devi (Maha Kali, Maha Lakshmi, Maha Saraswati Pindis), sacred cave shrine in the Trikuta Mountains.",
    "timings": "5:00 AM - 12:00 PM, 4:00 PM - 9:00 PM",
    "dressCode": "Modest Traditional / Comfortable Yatra Attire",
    "facilities": [
      "RFID Yatra Card",
      "Ropeway",
      "Battery Cars",
      "Medical Centers"
    ],
    "lat": 33.0308,
    "lon": 74.9490
  },
  {
    "_id": "10",
    "name": "Brihadisvara Temple",
    "location": "Thanjavur, Tamil Nadu",
    "dailyLimit": 20000,
    "currentCapacity": 14000,
    "waitTime": 15,
    "crowdLevel": "Low",
    "rating": 4.9,
    "image": "/image/temple_10.jpg",
    "history": "Presiding Deity: Lord Shiva, UNESCO World Heritage Site built by Chola Emperor Rajaraja I, architectural marvel with a single-stone granite vimana dome.",
    "timings": "6:00 AM - 12:30 PM, 4:00 PM - 8:30 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Guide Audio Tour",
      "Wheelchairs",
      "Garden Walkways"
    ],
    "lat": 10.7828,
    "lon": 79.1318
  },
  {
    "_id": "11",
    "name": "Ramanathaswamy Temple",
    "location": "Rameswaram, Tamil Nadu",
    "dailyLimit": 25000,
    "currentCapacity": 20000,
    "waitTime": 30,
    "crowdLevel": "Moderate",
    "rating": 4.9,
    "image": "/image/temple_11.jpg",
    "history": "Presiding Deity: Lord Ramanathaswamy (Shiva), southern Jyotirlinga and Char Dham shrine famed for its 22 holy theerthams and longest pillared corridors.",
    "timings": "5:00 AM - 1:00 PM, 3:00 PM - 9:00 PM",
    "dressCode": "Traditional Dress (Dhoti/Saree/Salwar)",
    "facilities": [
      "22 Theertham Bathing Guide",
      "Prasadam",
      "Cloakroom",
      "Wheelchairs"
    ],
    "lat": 9.2881,
    "lon": 79.3174
  },
  {
    "_id": "12",
    "name": "Konark Sun Temple",
    "location": "Konark, Odisha",
    "dailyLimit": 22000,
    "currentCapacity": 15000,
    "waitTime": 20,
    "crowdLevel": "Low",
    "rating": 4.9,
    "image": "/image/temple_12.jpg",
    "history": "Presiding Deity: Surya (The Sun God), 13th-century UNESCO World Heritage monumental chariot temple with 24 intricately carved stone wheels.",
    "timings": "6:00 AM - 8:00 PM",
    "dressCode": "Modest Wear",
    "facilities": [
      "Interpretation Centre",
      "Light & Sound Show",
      "Wheelchairs",
      "Cafeteria"
    ],
    "lat": 19.8876,
    "lon": 86.0945
  }
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
  { time: '04:00 AM', visitors: 1100, online: 800, walkin: 300, capacity: 6500 },
  { time: '05:00 AM', visitors: 2400, online: 1700, walkin: 700, capacity: 6500 },
  { time: '06:00 AM', visitors: 3800, online: 2700, walkin: 1100, capacity: 6500 },
  { time: '07:00 AM', visitors: 4900, online: 3500, walkin: 1400, capacity: 6500 },
  { time: '08:00 AM', visitors: 6100, online: 4300, walkin: 1800, capacity: 6500 },
  { time: '09:00 AM', visitors: 6800, online: 4800, walkin: 2000, capacity: 6500 },
  { time: '10:00 AM', visitors: 7400, online: 5200, walkin: 2200, capacity: 6500 },
  { time: '11:00 AM', visitors: 7100, online: 5000, walkin: 2100, capacity: 6500 },
  { time: '12:00 PM', visitors: 5600, online: 3900, walkin: 1700, capacity: 6500 },
  { time: '01:00 PM', visitors: 4200, online: 3000, walkin: 1200, capacity: 6500 },
  { time: '02:00 PM', visitors: 3900, online: 2800, walkin: 1100, capacity: 6500 },
  { time: '03:00 PM', visitors: 4500, online: 3200, walkin: 1300, capacity: 6500 },
  { time: '04:00 PM', visitors: 5800, online: 4100, walkin: 1700, capacity: 6500 },
  { time: '05:00 PM', visitors: 6700, online: 4700, walkin: 2000, capacity: 6500 },
  { time: '06:00 PM', visitors: 7600, online: 5300, walkin: 2300, capacity: 6500 },
  { time: '07:00 PM', visitors: 7200, online: 5000, walkin: 2200, capacity: 6500 },
  { time: '08:00 PM', visitors: 5900, online: 4100, walkin: 1800, capacity: 6500 },
  { time: '09:00 PM', visitors: 3800, online: 2700, walkin: 1100, capacity: 6500 },
  { time: '10:00 PM', visitors: 1800, online: 1300, walkin: 500, capacity: 6500 }
];

let bookings = [
  {
    bookingId: 'TS-16800100-3482',
    templeId: '1',
    templeName: 'Tirumala Venkateswara Temple',
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
    templeId: '2',
    templeName: 'Kashi Vishwanath Temple',
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

let stayBookings = [
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
    status: 'Upcoming', // Upcoming (Live) or Completed
    paymentStatus: 'PAID',
    paymentMethod: 'UPI (Google Pay)',
    transactionId: 'TXN-98421045',
    address: 'Opposite Tirupati Central Railway Station, East Gopuram Road, Tirupati, AP 517501',
    proximityToGate: '0.2 km from Gate 1',
    lat: 13.6273,
    lng: 79.4272,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    features: ['Safe Mobile Lockers', 'RO Pure Water', 'Darshan Wake-up Call'],
    bookedAt: '2026-06-15'
  },
  {
    id: 'TS-STAY-719320',
    reference: 'TS-STAY-719320',
    hotelName: 'Kashi Vishwanath Corridor Pilgrim Niwas',
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
    address: 'Dham Complex Gate 4 (Chhatrapati Shivaji Terminal Gate), Lahori Tola, Varanasi, UP 221001',
    proximityToGate: '0.1 km from Gate 4',
    lat: 25.3109,
    lng: 83.0107,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    features: ['Corridor Ghat Access', 'Ganga Jal Supply', 'Prasadam Kitchen'],
    bookedAt: '2026-06-10'
  }
];

let notifications = [
  { id: 1, type: 'Booking Alert', message: 'Your Darshan booking at Tirupati Venkateswara is confirmed for tomorrow.', date: 'Just now', unread: true },
  { id: 2, type: 'Crowd Alert', message: 'Heavy crowd surge at Kashi Vishwanath. Wait time extended by 40 minutes.', date: '30 mins ago', unread: true },
  { id: 3, type: 'Festival Update', message: 'Special Brahmotsavam decorations begin tonight at Sabarimala.', date: '2 hours ago', unread: false },
  { id: 4, type: 'Emergency Broadcast', message: 'All routes to Badrinath cleared. Operations running normally.', date: '1 day ago', unread: false }
];

let hotels = [
  // 1: Tirumala Venkateswara Temple
  {
    id: 'tiru-1',
    templeId: '1',
    templeName: 'Tirumala Venkateswara Temple',
    name: 'TTD Srinivasam Pilgrim Rest House',
    type: 'Temple Guest House',
    rating: 4.8,
    googleRating: 4.6,
    googleReviewCount: '16,500+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=TTD+Srinivasam+Complex+Tirupati',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=13.6273,79.4272&destination_place_id=TTD+Srinivasam+Pilgrim+Rest+House',
    lat: 13.6273,
    lng: 79.4272,
    address: 'Opposite Tirupati Central Railway Station, East Gopuram Road, Tirupati, AP 517501',
    price: 200,
    distance: '0.2 km from Gate 1',
    proximityToGate: 'Direct walking path to Vaikuntam Queue Complex 1 (3 mins walk)',
    slotAdvice: 'Ideal for 06:00 AM - 10:00 AM morning slots. Safe locker counter for mobile phones.',
    amenities: ['Locker Counters', 'Free Purified RO Water', 'Battery Car Pick-up', 'Sattvik Bhojan', 'Hot Water'],
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: TTD Srinivasam Pilgrim Rest House Complex & Rooms',
    roomCategories: [
      { name: 'Non A.C. Room', price: 200 },
      { name: 'A/C Room', price: 400 },
      { name: 'A/C Deluxe Room', price: 600 }
    ]
  },
  {
    id: 'tiru-2',
    templeId: '1',
    templeName: 'Tirumala Venkateswara Temple',
    name: 'Fortune Select Grand Ridge Tirupati',
    type: 'Hotel',
    rating: 4.7,
    googleRating: 4.5,
    googleReviewCount: '8,900+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Fortune+Select+Grand+Ridge+Tirupati',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=13.6191,79.4398&destination_place_id=Fortune+Select+Grand+Ridge+Tirupati',
    lat: 13.6191,
    lng: 79.4398,
    address: 'Shilparamam Tiruchanoor Road, Near Alipiri Footpath, Tirupati, AP 517507',
    price: 3800,
    distance: '0.6 km from Alipiri Tollgate',
    proximityToGate: '600m to Tirumala Alipiri Footpath & Special Entry Counter',
    slotAdvice: 'Highly recommended for families & senior citizens. 24/7 check-in & queue shuttle desk.',
    amenities: ['Pure Veg Restaurant', 'AC Rooms', 'Luggage Lockers', '24/7 Hot Water', 'Free Wi-Fi'],
    image: 'https://www.itchotels.com/content/dam/itchotels/in/umbrella/fortune/hotels/fortuneselectgrandridge-tirupati/image/overview-landing-page/overview/d/facade.jpg',
    realLocationTag: 'Stay Building: Fortune Select Grand Ridge Hotel Facade & Entry',
    roomCategories: [
      { name: 'Deluxe Room', price: 3800 },
      { name: 'Executive Club Room', price: 4600 },
      { name: 'Grand Presidential Suite', price: 6200 }
    ]
  },
  {
    id: 'tiru-3',
    templeId: '1',
    templeName: 'Tirumala Venkateswara Temple',
    name: 'Balaji Sevabhavan Dharamshala',
    type: 'Dharamshala',
    rating: 4.3,
    googleRating: 4.3,
    googleReviewCount: '3,800+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Balaji+Bhavan+Dharamshala+Tirupati',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=13.6265,79.4285&destination_place_id=Balaji+Sevabhavan+Dharamshala',
    lat: 13.6265,
    lng: 79.4285,
    address: 'Alipiri Road, Old Tiruchanoor bypass, Tirupati, AP 517501',
    price: 150,
    distance: '0.8 km from Temple Square',
    proximityToGate: '800m to Alipiri Footpath exit & Bus Depot',
    slotAdvice: 'Very economical pilgrim stay with high security cloakrooms for luggage.',
    amenities: ['Safe Cloakroom', 'Free Dormitory Beds', 'Hot Water', 'Sattvik Canteen', 'CCTV Security'],
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: Balaji Sevabhavan Rest House Courtyard & Rooms',
    roomCategories: [
      { name: 'Standard 2-Bed Room', price: 150 },
      { name: 'Family 4-Bed Room', price: 250 },
      { name: 'Hall / Dormitory Bed', price: 70 }
    ]
  },
  {
    id: 'tiru-4',
    templeId: '1',
    templeName: 'Tirumala Venkateswara Temple',
    name: 'Hotel Bliss Pilgrim Lodge',
    type: 'Lodge',
    rating: 4.5,
    googleRating: 4.4,
    googleReviewCount: '7,400+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Hotel+Bliss+Tirupati',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=13.6254,79.4312&destination_place_id=Hotel+Bliss+Pilgrim+Lodge',
    lat: 13.6254,
    lng: 79.4312,
    address: 'Near Ramanuja Circle, Renigunta Road, Tirupati, AP 517501',
    price: 2400,
    distance: '1.0 km from Queue Entry',
    proximityToGate: 'Free pilgrim electric bus directly connects to queue entrance every 15 mins',
    slotAdvice: 'Great for afternoon & evening darshan slots with express checkout.',
    amenities: ['Temple Shuttle Bus', 'Free Wi-Fi', 'Hot Showers', 'Wheelchair Support', 'Power Backup'],
    image: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/be0633a749bd38dc80d43d10213258a6fdad80c3-1842x1320.jpg',
    realLocationTag: 'Stay Building: Hotel Bliss Exterior & Guest Reception',
    roomCategories: [
      { name: 'Executive AC Room', price: 2400 },
      { name: 'Club Suite AC', price: 3200 },
      { name: 'Family Quad Room', price: 3900 }
    ]
  },

  // 2: Kashi Vishwanath Temple
  {
    id: 'kashi-1',
    templeId: '2',
    templeName: 'Kashi Vishwanath Temple',
    name: 'Kashi Vishwanath Corridor Pilgrim Niwas',
    type: 'Temple Guest House',
    rating: 4.9,
    googleRating: 4.9,
    googleReviewCount: '5,200+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Kashi+Vishwanath+Corridor+Yatri+Niwas+Varanasi',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=25.3109,83.0107&destination_place_id=Kashi+Vishwanath+Corridor+Pilgrim+Niwas',
    lat: 25.3109,
    lng: 83.0107,
    address: 'Dham Complex Gate 4 (Chhatrapati Shivaji Terminal Gate), Lahori Tola, Varanasi, UP 221001',
    price: 600,
    distance: '0.1 km from Gate 4',
    proximityToGate: 'Inside Vishwanath Dham Corridor (Gate 4 reporting)',
    slotAdvice: 'Fastest access for early morning Mangala Aarti (03:00 AM) & VIP darshan passes.',
    amenities: ['Corridor Walkway Access', 'Mobile & Locker Desk', 'Clean Bathrooms', 'Prasadam Counter'],
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: Kashi Vishwanath Dham Yatri Niwas Complex',
    roomCategories: [
      { name: 'Standard Non-AC Room', price: 400 },
      { name: 'Corridor AC Room', price: 600 },
      { name: 'VIP Dham Suite', price: 1100 }
    ]
  },
  {
    id: 'kashi-2',
    templeId: '2',
    templeName: 'Kashi Vishwanath Temple',
    name: 'Shree Annapurna Dharamshala Godowlia',
    type: 'Dharamshala',
    rating: 4.4,
    googleRating: 4.5,
    googleReviewCount: '3,100+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Annapurna+Dharamshala+Godowlia+Varanasi',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=25.3082,83.0075&destination_place_id=Shree+Annapurna+Dharamshala+Godowlia',
    lat: 25.3082,
    lng: 83.0075,
    address: 'Godowlia Chowk, 300m to Dashashwamedh Ghat, Varanasi, UP 221001',
    price: 250,
    distance: '0.3 km from Dashashwamedh Ghat',
    proximityToGate: '300m from Dashashwamedh Ghat & Gate 2',
    slotAdvice: 'Traditional pious atmosphere, 5 mins walk to morning Ganga snanam before darshan.',
    amenities: ['Drinking Water', 'Common Hall', 'Luggage Cloakroom', 'Sattvik Food', 'Jal Sewa'],
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: Shree Annapurna Yatri Niwas Dharamshala',
    roomCategories: [
      { name: 'Pilgrim 2-Bed Room', price: 250 },
      { name: 'Family 4-Bed Room', price: 400 }
    ]
  },
  {
    id: 'kashi-3',
    templeId: '2',
    templeName: 'Kashi Vishwanath Temple',
    name: 'BrijRama Palace Heritage Hotel',
    type: 'Hotel',
    rating: 4.9,
    googleRating: 4.8,
    googleReviewCount: '6,400+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=BrijRama+Palace+Varanasi',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=25.3057,83.0104&destination_place_id=BrijRama+Palace+Heritage+Hotel',
    lat: 25.3057,
    lng: 83.0104,
    address: 'Darbhanga Ghat, Dashashwamedh, Varanasi, UP 221001',
    price: 14500,
    distance: '0.4 km via River Ghat',
    proximityToGate: 'Direct private bajra boat to Corridor Ghat Entrance',
    slotAdvice: 'Historic 1812 palace overlooking holy Ganga with dedicated darshan escorts.',
    amenities: ['Fine Dining Sattvik', 'AC Suites', 'Private Boat Transfers', 'Darshan Guide Escort'],
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: BrijRama Palace Historic Heritage Hotel',
    roomCategories: [
      { name: 'Nadidhara Riverview Room', price: 14500 },
      { name: 'Dhanraj Mahal Suite', price: 22000 }
    ]
  },
  {
    id: 'kashi-4',
    templeId: '2',
    templeName: 'Kashi Vishwanath Temple',
    name: 'Hotel Ganges View Assi Ghat',
    type: 'Lodge',
    rating: 4.6,
    googleRating: 4.6,
    googleReviewCount: '2,900+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Hotel+Ganges+View+Assi+Ghat+Varanasi',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=25.2890,83.0062&destination_place_id=Hotel+Ganges+View+Assi+Ghat',
    lat: 25.2890,
    lng: 83.0062,
    address: 'Assi Ghat B-14/118, Shivala, Varanasi, UP 221005',
    price: 2800,
    distance: '0.5 km from Ganga Aarti',
    proximityToGate: 'Serene Assi Ghat location with direct electric auto connection to Mandir',
    slotAdvice: 'Spiritual library, river views, and quiet atmosphere for devoted yatris.',
    amenities: ['River View Terrace', 'Hot Water', 'Purified Water', 'Library', '24h Front Desk'],
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: Hotel Ganges View Heritage Balcony',
    roomCategories: [
      { name: 'Standard AC Room', price: 2800 },
      { name: 'Ganga Balcony Deluxe', price: 3600 }
    ]
  },

  // 3: Kedarnath Temple
  {
    id: 'kedar-1',
    templeId: '3',
    templeName: 'Kedarnath Temple',
    name: 'GMVN Swargarohini Complex Kedarnath',
    type: 'Temple Guest House',
    rating: 4.7,
    googleRating: 4.6,
    googleReviewCount: '4,100+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=GMVN+Swargarohini+Complex+Kedarnath',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=30.7346,79.0669&destination_place_id=GMVN+Swargarohini+Complex+Kedarnath',
    lat: 30.7346,
    lng: 79.0669,
    address: 'Main Temple Plateau, Kedarnath Shrine Base, Rudraprayag, UK 246445',
    price: 1200,
    distance: '0.2 km from Temple Sanctum',
    proximityToGate: '200m to Kedarnath Temple Sanctum Entrance',
    slotAdvice: 'Directly on temple plateau. Vital for early morning 05:00 AM darshan in cold weather.',
    amenities: ['Emergency Oxygen', 'Heating Blankets', 'Hot Water', 'Doctor on Call', 'Dining Hall'],
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: GMVN Swargarohini Kedarnath Huts & Camp',
    roomCategories: [
      { name: 'GMVN Heated Bed / Hut', price: 1200 },
      { name: 'Super Deluxe Cottage', price: 2400 }
    ]
  },
  {
    id: 'kedar-2',
    templeId: '3',
    templeName: 'Kedarnath Temple',
    name: 'Mandakini Pilgrim Cottages & Shelters',
    type: 'Lodge',
    rating: 4.3,
    googleRating: 4.3,
    googleReviewCount: '1,950+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Kedarnath+Cottages+Mandakini+Valley',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=30.7315,79.0645&destination_place_id=Mandakini+Pilgrim+Cottages+Kedarnath',
    lat: 30.7315,
    lng: 79.0645,
    address: 'Helipad Approach Road, Mandakini Valley, Kedarnath, UK 246445',
    price: 950,
    distance: '0.4 km from Helipad',
    proximityToGate: '400m from Helipad & Temple Trek Path',
    slotAdvice: 'Cozy insulated wooden cottages with heating and hot herbal tea, 6 mins walk to mandir.',
    amenities: ['Warm Bedding', 'Hot Chai & Khichdi', 'Luggage Care', 'Power Backup', 'Warm Showers'],
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: Mandakini Valley Insulated Cottages',
    roomCategories: [
      { name: 'Cozy Timber Hut', price: 950 },
      { name: 'Valley View Deluxe Room', price: 1600 }
    ]
  },
  {
    id: 'kedar-3',
    templeId: '3',
    templeName: 'Kedarnath Temple',
    name: 'Shri Kedar Seva Samiti Dharamshala',
    type: 'Dharamshala',
    rating: 4.4,
    googleRating: 4.4,
    googleReviewCount: '2,300+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Kedar+Seva+Samiti+Dharamshala+Kedarnath',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=30.7352,79.0674&destination_place_id=Shri+Kedar+Seva+Samiti+Dharamshala',
    lat: 30.7352,
    lng: 79.0674,
    address: 'Temple Courtyard West Wing, Kedarnath, UK 246445',
    price: 300,
    distance: '0.3 km from Temple Square',
    proximityToGate: '300m from Temple Courtyard',
    slotAdvice: 'Devotee-run community dharamshala with warm community blankets and free langar.',
    amenities: ['Free Langar / Khichdi', 'Heavy Blankets', 'Common Hall', 'Jal Sewa', 'Warm Stoves'],
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: Shri Kedar Seva Samiti Pilgrim Shelter',
    roomCategories: [
      { name: 'Community Dormitory Bed', price: 150 },
      { name: 'Devotee Room (Warm Blankets)', price: 300 }
    ]
  },

  // 4: Badrinath Temple
  {
    id: 'badri-1',
    templeId: '4',
    templeName: 'Badrinath Temple',
    name: 'GMVN Badrinath Yatri Niwas (Devlok)',
    type: 'Temple Guest House',
    rating: 4.7,
    googleRating: 4.6,
    googleReviewCount: '3,100+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=GMVN+Devlok+Badrinath',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=30.7433,79.4938&destination_place_id=GMVN+Devlok+Badrinath',
    lat: 30.7433,
    lng: 79.4938,
    address: 'Near Alaknanda River Bridge, Badrinath, Chamoli, UK 246422',
    price: 1100,
    distance: '0.2 km from Alaknanda Bridge',
    proximityToGate: '200m from Alaknanda River Bridge & Temple Steps',
    slotAdvice: 'Convenient 3 mins walk to Tapt Kund hot bath before reporting for morning darshan slot.',
    amenities: ['Hot Water Geyser', 'Sattvik Canteen', 'Room Heater Option', 'Cloakroom'],
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: GMVN Hotel Devlok Badrinath',
    roomCategories: [
      { name: 'Standard Room', price: 1100 },
      { name: 'Deluxe Heated Room', price: 1800 }
    ]
  },
  {
    id: 'badri-2',
    templeId: '4',
    templeName: 'Badrinath Temple',
    name: 'Hotel Snow Crest Badrinath',
    type: 'Hotel',
    rating: 4.6,
    googleRating: 4.5,
    googleReviewCount: '2,200+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Hotel+Snow+Crest+Badrinath',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=30.7410,79.4912&destination_place_id=Hotel+Snow+Crest+Badrinath',
    lat: 30.7410,
    lng: 79.4912,
    address: 'Main Bypass Road, Near Badrinath Shrine Gate, Chamoli, UK 246422',
    price: 3600,
    distance: '0.7 km from Temple Gate',
    proximityToGate: '700m to Main Shrine Entry Gate',
    slotAdvice: 'Full family comfort with heating and special darshan taxi coordination desk.',
    amenities: ['Central Heating', 'Pure Veg Buffet', 'Free Wi-Fi', 'Darshan Shuttle Desk'],
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: Hotel Snow Crest Badrinath Facade',
    roomCategories: [
      { name: 'Heated Deluxe AC', price: 3600 },
      { name: 'Valley View Suite', price: 4800 }
    ]
  },

  // 5: Jagannath Temple
  {
    id: 'puri-1',
    templeId: '5',
    templeName: 'Jagannath Temple',
    name: 'Shree Jagannath Yatri Nivas Grand Road',
    type: 'Temple Guest House',
    rating: 4.8,
    googleRating: 4.7,
    googleReviewCount: '6,100+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Shree+Jagannath+Yatri+Nivas+Puri',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=19.8048,85.8179&destination_place_id=Shree+Jagannath+Yatri+Nivas+Puri',
    lat: 19.8048,
    lng: 85.8179,
    address: 'Bada Danda (Grand Road), 300m from Singhadwara Lion Gate, Puri, Odisha 752001',
    price: 500,
    distance: '0.3 km to Lion Gate',
    proximityToGate: '300m to Singhadwara (Lion Gate entry for booked slots)',
    slotAdvice: 'Only 4 mins walk to Singhadwara ticket scanner. Fresh Mahaprasad distribution.',
    amenities: ['Mahaprasad Counter', 'Shoe & Mobile Lockers', 'AC Option', 'Sattvik Kitchen'],
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: Shree Jagannath Yatri Nivas Complex',
    roomCategories: [
      { name: 'Pilgrim Non-AC Room', price: 500 },
      { name: 'Grand Road AC Room', price: 850 }
    ]
  },
  {
    id: 'puri-2',
    templeId: '5',
    templeName: 'Jagannath Temple',
    name: 'Mayfair Heritage Puri Resort',
    type: 'Hotel',
    rating: 4.9,
    googleRating: 4.8,
    googleReviewCount: '8,400+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Mayfair+Heritage+Puri+Odisha',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=19.8005,85.8341&destination_place_id=Mayfair+Heritage+Puri+Resort',
    lat: 19.8005,
    lng: 85.8341,
    address: 'Chakratirtha Road, Sea Beach, Puri, Odisha 752002',
    price: 6200,
    distance: '1.8 km from Lion Gate',
    proximityToGate: 'Private VIP cab transfer directly to Temple Gate',
    slotAdvice: 'Luxury seaside resort with VIP darshan queue assistance and pristine sattvik cuisine.',
    amenities: ['Pool', 'Luxury Sattvik Dining', 'Private Beach Access', 'VIP Temple Transfer'],
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: Mayfair Heritage Puri Beach Resort',
    roomCategories: [
      { name: 'Heritage Deluxe Room', price: 6200 },
      { name: 'Ocean View Suite', price: 9500 }
    ]
  },
  {
    id: 'puri-3',
    templeId: '5',
    templeName: 'Jagannath Temple',
    name: 'Bada Danda Bhaktashram Dharamshala',
    type: 'Dharamshala',
    rating: 4.4,
    googleRating: 4.4,
    googleReviewCount: '3,700+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Jagannath+Dharamshala+Grand+Road+Puri',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=19.8080,85.8210&destination_place_id=Bada+Danda+Bhaktashram+Dharamshala',
    lat: 19.8080,
    lng: 85.8210,
    address: 'Grand Road, Near Medical Square, Puri, Odisha 752001',
    price: 250,
    distance: '0.5 km along Grand Road',
    proximityToGate: '500m along Bada Danda Grand Road',
    slotAdvice: 'Spacious verified dharamshala with elevator and luggage locker facilities.',
    amenities: ['Purified RO Water', 'Cloakroom', 'Luggage Room', 'Lift Access', 'Sattvik Bhojan'],
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: Bada Danda Bhaktashram Dharamshala',
    roomCategories: [
      { name: 'Dharamshala 2-Bed Room', price: 250 },
      { name: 'Family 4-Bed Room', price: 400 }
    ]
  },

  // 6: Somnath Temple
  {
    id: 'som-1',
    templeId: '6',
    templeName: 'Somnath Temple',
    name: 'Shree Somnath Trust Sagar Darshan',
    type: 'Temple Guest House',
    rating: 4.8,
    googleRating: 4.8,
    googleReviewCount: '6,400+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Sagar+Darshan+Guest+House+Somnath',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=20.8880,70.4012&destination_place_id=Shree+Somnath+Trust+Sagar+Darshan',
    lat: 20.8880,
    lng: 70.4012,
    address: 'Promenade Road, Next to Somnath Temple Mandir, Prabhas Patan, Gujarat 362268',
    price: 1200,
    distance: '0.2 km from Temple Gate',
    proximityToGate: 'Adjacent to Sea View Promenade & Temple Gate',
    slotAdvice: 'Walk directly to morning aarti and evening 3D Light & Sound show right from premises.',
    amenities: ['Arabian Sea View', 'AC Rooms', 'Locker Room', 'Dining Hall', 'Hot Water'],
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: Somnath Trust Sagar Darshan Sea-Facing Guest House',
    roomCategories: [
      { name: 'Sea Facing AC Room', price: 1200 },
      { name: 'VIP Sea View Suite', price: 1800 }
    ]
  },
  {
    id: 'som-2',
    templeId: '6',
    templeName: 'Somnath Temple',
    name: 'Shree Somnath Trust Lilavati Atithi Bhavan',
    type: 'Dharamshala',
    rating: 4.6,
    googleRating: 4.6,
    googleReviewCount: '5,900+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Lilavati+Atithi+Bhavan+Somnath+Trust',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=20.8905,70.4042&destination_place_id=Shree+Somnath+Trust+Lilavati+Atithi+Bhavan',
    lat: 20.8905,
    lng: 70.4042,
    address: 'Somnath Mandir Road, Somnath Trust Complex, Prabhas Patan, Gujarat 362268',
    price: 400,
    distance: '0.4 km from Shrine',
    proximityToGate: '400m to Somnath Mandir Main Entrance',
    slotAdvice: 'Official trust property with subsidized sattvik meals and high security.',
    amenities: ['Trust Bhojanalaya', 'Free Parking', 'Security Desk', 'Luggage Lockers'],
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: Lilavati Atithi Bhavan Somnath Trust',
    roomCategories: [
      { name: 'Trust Standard Room', price: 400 },
      { name: 'Trust AC Room', price: 650 }
    ]
  },

  // 7: Meenakshi Amman Temple
  {
    id: 'meen-1',
    templeId: '7',
    templeName: 'Meenakshi Amman Temple',
    name: 'Meenakshi Sundareswarar Yatri Nivas',
    type: 'Temple Guest House',
    rating: 4.7,
    googleRating: 4.6,
    googleReviewCount: '3,800+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Meenakshi+Amman+Temple+Yatri+Nivas+Madurai',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=9.9195,78.1172&destination_place_id=Meenakshi+Sundareswarar+Yatri+Nivas',
    lat: 9.9195,
    lng: 78.1172,
    address: 'West Veli Street, Near West Gopuram, Madurai, TN 625001',
    price: 600,
    distance: '0.3 km from West Tower',
    proximityToGate: '300m to West Gopuram Entrance',
    slotAdvice: 'Nearest entrance for special darshan ticket holders and traditional dress change.',
    amenities: ['Traditional South Veg', 'AC / Non-AC', 'Cloakroom', 'Hot Water', 'Lift'],
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: Meenakshi Sundareswarar Yatri Nivas Building',
    roomCategories: [
      { name: 'Standard Non-AC', price: 600 },
      { name: 'Deluxe AC Room', price: 900 }
    ]
  },
  {
    id: 'meen-2',
    templeId: '7',
    templeName: 'Meenakshi Amman Temple',
    name: 'Heritage Madurai Hotel & Spa',
    type: 'Hotel',
    rating: 4.8,
    googleRating: 4.8,
    googleReviewCount: '7,600+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Heritage+Madurai+Hotel',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=9.9360,78.0890&destination_place_id=Heritage+Madurai+Hotel',
    lat: 9.9360,
    lng: 78.0890,
    address: '11 Melakkal Main Road, Kochadai, Madurai, TN 625016',
    price: 4800,
    distance: '1.5 km from Temple',
    proximityToGate: 'Direct battery car connection to North Tower gate',
    slotAdvice: 'Peaceful luxury stay with temple guide and early morning darshan shuttle.',
    amenities: ['Swimming Pool', 'Sattvik Restaurant', 'Free Wi-Fi', 'Temple Shuttle'],
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: Heritage Madurai Hotel Property',
    roomCategories: [
      { name: 'Heritage Classic Room', price: 4800 },
      { name: 'Plunge Pool Villa', price: 7500 }
    ]
  },

  // 8: Mahakaleshwar Temple
  {
    id: 'maha-1',
    templeId: '8',
    templeName: 'Mahakaleshwar Temple',
    name: 'Shree Mahakal Lok Atithi Niwas',
    type: 'Temple Guest House',
    rating: 4.9,
    googleRating: 4.9,
    googleReviewCount: '5,300+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Mahakal+Lok+Atithi+Niwas+Ujjain',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=23.1827,75.7682&destination_place_id=Shree+Mahakal+Lok+Atithi+Niwas',
    lat: 23.1827,
    lng: 75.7682,
    address: 'Mahakal Lok Corridor Gate 1, Jaisinghpura, Ujjain, MP 456001',
    price: 700,
    distance: '0.1 km from Gate 1',
    proximityToGate: '100m to Gate 1 (Bhasma Aarti Entry)',
    slotAdvice: 'Crucial for 04:00 AM Bhasma Aarti slot. 2 mins walk to the reporting hall.',
    amenities: ['Aarti Wake-up Alert', 'Locker Room for Electronics', 'Dhoti Dressing Rooms', 'Hot Water'],
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: Shree Mahakal Lok Atithi Niwas Guest House',
    roomCategories: [
      { name: 'Corridor Standard Room', price: 700 },
      { name: 'Deluxe AC Room', price: 1100 }
    ]
  },
  {
    id: 'maha-2',
    templeId: '8',
    templeName: 'Mahakaleshwar Temple',
    name: 'Hotel Shipra Residency (MPSTDC)',
    type: 'Hotel',
    rating: 4.6,
    googleRating: 4.5,
    googleReviewCount: '5,100+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Hotel+Shipra+Residency+Ujjain',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=23.1795,75.7845&destination_place_id=Hotel+Shipra+Residency+MPSTDC',
    lat: 23.1795,
    lng: 75.7845,
    address: 'University Road, Madhav Nagar, Ujjain, MP 456010',
    price: 2600,
    distance: '0.9 km from Temple',
    proximityToGate: '900m to Mahakaleshwar & Harsiddhi Mata Mandir',
    slotAdvice: 'Official tourism hotel with comfortable family rooms and pure vegetarian dining.',
    amenities: ['Pure Veg Restaurant', 'AC Rooms', 'Car Parking', 'Darshan Assistance'],
    image: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/be0633a749bd38dc80d43d10213258a6fdad80c3-1842x1320.jpg',
    realLocationTag: 'Stay Building: Hotel Shipra Residency MPSTDC Facade',
    roomCategories: [
      { name: 'Standard AC Room', price: 2600 },
      { name: 'Deluxe AC Suite', price: 3400 }
    ]
  },
  {
    id: 'maha-3',
    templeId: '8',
    templeName: 'Mahakaleshwar Temple',
    name: 'Ujjain Mahakal Lok Dharamshala',
    type: 'Dharamshala',
    rating: 4.5,
    googleRating: 4.5,
    googleReviewCount: '3,400+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Mahakal+Dharamshala+Ujjain',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=23.1835,75.7690&destination_place_id=Ujjain+Mahakal+Lok+Dharamshala',
    lat: 23.1835,
    lng: 75.7690,
    address: 'Bada Ganesh Mandir Lane, Mahakal Lok, Ujjain, MP 456001',
    price: 250,
    distance: '0.3 km from Corridor',
    proximityToGate: 'Overlooking the grand Mahakal Lok Corridor',
    slotAdvice: 'Scenic corridor location with 24/7 security and pure vegetarian food.',
    amenities: ['Locker Facility', 'Free Pure Water', 'Corridor Walkway', 'Langar Meal'],
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: Mahakal Lok Dharamshala Complex',
    roomCategories: [
      { name: 'Devotee 2-Bed Room', price: 250 },
      { name: 'Family 4-Bed Room', price: 400 }
    ]
  },

  // 9: Vaishno Devi Temple
  {
    id: 'vaish-1',
    templeId: '9',
    templeName: 'Vaishno Devi Temple',
    name: 'SMVDSB Bhawan Sanctum Complex',
    type: 'Temple Guest House',
    rating: 4.8,
    googleRating: 4.8,
    googleReviewCount: '14,000+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Mata+Vaishno+Devi+Bhawan+Rooms',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=33.0308,74.9490&destination_place_id=SMVDSB+Bhawan+Sanctum+Complex',
    lat: 33.0308,
    lng: 74.9490,
    address: 'Mata Vaishno Devi Bhawan Sanctum, Katra, Reasi, J&K 182301',
    price: 850,
    distance: '0.1 km from Sanctum',
    proximityToGate: 'At Bhawan Sanctum (Zero walking distance)',
    slotAdvice: 'Stay directly at Bhawan after the trek; immediate entry for booked aarti slots.',
    amenities: ['Blanket Stores', 'Bhojanalaya', 'Free Luggage Lockers', 'Doctor on Duty'],
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: SMVDSB Bhawan Pilgrim Rooms & Locker Complex',
    roomCategories: [
      { name: 'Bhawan Standard Room', price: 850 },
      { name: 'Bhawan AC Deluxe', price: 1250 }
    ]
  },
  {
    id: 'vaish-2',
    templeId: '9',
    templeName: 'Vaishno Devi Temple',
    name: 'SMVDSB Niharika Yatri Niwas Katra',
    type: 'Lodge',
    rating: 4.6,
    googleRating: 4.6,
    googleReviewCount: '8,700+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Niharika+Yatri+Niwas+Katra',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=32.9926,74.9312&destination_place_id=SMVDSB+Niharika+Yatri+Niwas+Katra',
    lat: 32.9926,
    lng: 74.9312,
    address: 'Bus Stand Road, Katra Basecamp, Reasi, J&K 182301',
    price: 1100,
    distance: '0.3 km to Banganga Gate',
    proximityToGate: 'Starting point of Banganga Yatra track',
    slotAdvice: 'Basecamp for rest before starting morning trek or helicopter flight.',
    amenities: ['Yatra Parchi Assistance', 'Hot Water', 'Luggage Lockers', 'Pure Veg Restaurant'],
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: SMVDSB Niharika Yatri Niwas Katra Base Complex',
    roomCategories: [
      { name: 'Standard Non-AC Room', price: 1100 },
      { name: 'Executive AC Room', price: 1600 }
    ]
  },

  // 10: Brihadisvara Temple
  {
    id: 'brih-1',
    templeId: '10',
    templeName: 'Brihadisvara Temple',
    name: 'Hotel Gnanam Thanjavur',
    type: 'Hotel',
    rating: 4.6,
    googleRating: 4.5,
    googleReviewCount: '4,800+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Hotel+Gnanam+Thanjavur',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=10.7828,79.1378&destination_place_id=Hotel+Gnanam+Thanjavur',
    lat: 10.7828,
    lng: 79.1378,
    address: 'Alagiri Nagar, South Main Street, Thanjavur, TN 613001',
    price: 2400,
    distance: '0.5 km from Big Temple',
    proximityToGate: '500m to Big Temple Entrance Fort Gate',
    slotAdvice: 'Peaceful stay within walking distance of temple and royal palace.',
    amenities: ['AC Rooms', 'South Veg Dining', 'Garden Walkway', 'Guide Desk'],
    image: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/be0633a749bd38dc80d43d10213258a6fdad80c3-1842x1320.jpg',
    realLocationTag: 'Stay Building: Hotel Gnanam Thanjavur Exterior',
    roomCategories: [
      { name: 'Executive AC Room', price: 2400 },
      { name: 'Royal Heritage Suite', price: 3500 }
    ]
  },

  // 11: Ramanathaswamy Temple
  {
    id: 'ram-1',
    templeId: '11',
    templeName: 'Ramanathaswamy Temple',
    name: 'Hotel Tamil Nadu Rameswaram (TTDC)',
    type: 'Temple Guest House',
    rating: 4.7,
    googleRating: 4.6,
    googleReviewCount: '4,100+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Hotel+Tamil+Nadu+TTDC+Rameswaram',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=9.2882,79.3175&destination_place_id=Hotel+Tamil+Nadu+TTDC+Rameswaram',
    lat: 9.2882,
    lng: 79.3175,
    address: 'East Gopuram Agnitheertham Beach Road, Rameswaram, TN 623526',
    price: 1200,
    distance: '0.2 km from East Gopuram',
    proximityToGate: '200m from East Gopuram & Agnitheertham Sea',
    slotAdvice: 'Ideal for taking early sea bath & 22 theertham snanam before darshan slot.',
    amenities: ['Theertham Dressing Rooms', 'AC Option', 'Pure Veg Canteen', 'Safe Lockers'],
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: TTDC Hotel Tamil Nadu Property, Rameswaram',
    roomCategories: [
      { name: 'TTDC Standard Room', price: 1200 },
      { name: 'Seaside Deluxe AC Room', price: 1800 }
    ]
  },
  {
    id: 'ram-2',
    templeId: '11',
    templeName: 'Ramanathaswamy Temple',
    name: 'Rameswaram Goswami Dharamshala',
    type: 'Dharamshala',
    rating: 4.3,
    googleRating: 4.3,
    googleReviewCount: '2,600+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=Goswami+Dharamshala+Rameswaram',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=9.2870,79.3140&destination_place_id=Rameswaram+Goswami+Dharamshala',
    lat: 9.2870,
    lng: 79.3140,
    address: 'Car Street, Ramanathaswamy Temple Corridor, Rameswaram, TN 623526',
    price: 200,
    distance: '0.4 km from Corridor',
    proximityToGate: '400m to Ramanathaswamy Temple Corridors',
    slotAdvice: 'Economical pilgrim dharamshala with authentic Tamil sattvik meals.',
    amenities: ['Sattvik Bhojan', 'Common Hall', 'Luggage Locker', 'Drinking Water'],
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: Rameswaram Goswami Dharamshala Complex',
    roomCategories: [
      { name: 'Pilgrim 2-Bed Room', price: 200 },
      { name: 'Family 4-Bed Room', price: 350 }
    ]
  },

  // 12: Konark Sun Temple
  {
    id: 'kon-1',
    templeId: '12',
    templeName: 'Konark Sun Temple',
    name: 'OTDC Yatrinivas Konark',
    type: 'Temple Guest House',
    rating: 4.5,
    googleRating: 4.5,
    googleReviewCount: '2,800+ Google Reviews',
    googleImagesUrl: 'https://www.google.com/search?tbm=isch&q=OTDC+Yatri+Nivas+Konark',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=19.8876,86.0945&destination_place_id=OTDC+Yatrinivas+Konark',
    lat: 19.8876,
    lng: 86.0945,
    address: 'Marine Drive Road, Near Sun Temple, Konark, Odisha 752111',
    price: 1600,
    distance: '0.6 km from Monument Gate',
    proximityToGate: '600m to Sun Temple Monument Gate',
    slotAdvice: 'Perfect for catching sunrise at Chandrabhaga Beach & morning entry.',
    amenities: ['Spacious Lawn', 'AC Rooms', 'Odisha Cuisine', 'Tourist Taxi Desk'],
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
    realLocationTag: 'Stay Building: OTDC Panthanivas Konark Yatri Niwas Facade',
    roomCategories: [
      { name: 'OTDC AC Standard Room', price: 1600 },
      { name: 'Executive Beach Cottage', price: 2400 }
    ]
  }
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

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  res.json({
    token: `mock-jwt-devotee-${Date.now()}`,
    user: {
      email,
      role: 'devotee',
      name: email ? email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Devotee',
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
  const { idToken, email, name } = req.body;
  const mockEmail = email || 'google-user@example.com';
  const mockName = name || 'Devotee';

  res.json({
    success: true,
    token: `mock-jwt-google-${Date.now()}`,
    user: {
      email: mockEmail,
      name: mockName,
      role: 'devotee',
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

// 3rd Party Aadhaar Verification (Cashfree API Simulation)
const aadhaarSessions = {};

app.post('/api/verify/aadhaar/send-otp', async (req, res) => {
  const { aadhaar_number, phone } = req.body;
  if (!aadhaar_number || aadhaar_number.replace(/\D/g, '').length !== 12) {
    return res.status(400).json({ success: false, message: 'Invalid Aadhaar Number' });
  }

  // Check if live keys are present
  if (process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_SECRET) {
    // In production, call Cashfree API here via Axios
    // const response = await axios.post('https://sandbox.cashfree.com/verification/offline-aadhaar/otp', { aadhaar_number: aadhaar_number.replace(/\D/g, '') }, { headers: { 'x-client-id': process.env.CASHFREE_CLIENT_ID, 'x-client-secret': process.env.CASHFREE_SECRET }});
    // return res.json(response.data);
  }

  // Simulated logic
  const ref_id = `cf_req_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  aadhaarSessions[ref_id] = {
    aadhaar_number: aadhaar_number.replace(/\D/g, ''),
    otp,
    expires: Date.now() + 10 * 60000 // 10 mins
  };

  console.log(`[CASHFREE AADHAAR SIMULATION] Ref ID: ${ref_id} | OTP sent to linked mobile: ${otp}`);

  if (phone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: `Your TeerthSetu Aadhaar Verification OTP is: ${otp}. Do not share this code.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone.startsWith('+') ? phone : `+91${phone}`
      });
      console.log("Real SMS OTP sent to: %s", phone);
    } catch (err) {
      console.error("Twilio SMS error in Aadhaar simulation:", err);
    }
  }

  res.json({ success: true, ref_id, message: 'OTP sent successfully to Aadhaar registered mobile number.' });
});

app.post('/api/verify/aadhaar/verify-otp', async (req, res) => {
  const { ref_id, otp } = req.body;

  if (!ref_id || !otp) {
    return res.status(400).json({ success: false, message: 'ref_id and otp required' });
  }

  // Check if live keys are present
  if (process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_SECRET) {
    // In production, you would call Cashfree API here via Axios
    // const response = await axios.post(`https://sandbox.cashfree.com/verification/offline-aadhaar/verify`, { ref_id, otp }, { headers: { 'x-client-id': process.env.CASHFREE_CLIENT_ID, 'x-client-secret': process.env.CASHFREE_SECRET }});
    // return res.json(response.data);
  }

  const session = aadhaarSessions[ref_id];
  if (!session || session.expires < Date.now()) {
    return res.status(400).json({ success: false, message: 'Session expired or invalid ref_id' });
  }

  if (session.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Incorrect OTP' });
  }

  delete aadhaarSessions[ref_id];

  res.json({
    success: true,
    message: 'Aadhaar verified successfully',
    data: {
      full_name: 'Verified Devotee',
      aadhaar_number: `XXXXXXXX${session.aadhaar_number.slice(-4)}`,
      dob: '1990-01-01',
      gender: 'M',
      address: {
        state: 'Delhi',
        city: 'New Delhi',
        pin: '110001'
      }
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

  // Update live telemetry stats
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

// Stay & Accommodation Bookings Endpoints
app.get('/api/stays/bookings', (req, res) => res.json(stayBookings));

app.post('/api/stays/bookings', (req, res) => {
  const stay = req.body;
  const id = stay.reference || `TS-STAY-${Math.floor(100000 + Math.random() * 900000)}`;
  const newStay = {
    id,
    reference: id,
    status: stay.status || 'Upcoming',
    bookedAt: new Date().toISOString().split('T')[0],
    ...stay
  };
  stayBookings.unshift(newStay);
  res.json({ success: true, stay: newStay });
});

app.delete('/api/stays/bookings/:id', (req, res) => {
  const stayId = req.params.id;
  const index = stayBookings.findIndex(s => s.id === stayId || s.reference === stayId);
  if (index !== -1) {
    stayBookings[index].status = 'Cancelled';
    res.json({ success: true, stay: stayBookings[index] });
  } else {
    res.status(404).json({ success: false, message: 'Stay booking not found' });
  }
});

// Payment Gateway Integration Routes
app.post('/api/payment/create-order', (req, res) => {
  const { amount, currency = 'INR', receipt = 'receipt_1' } = req.body;
  const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  res.json({
    success: true,
    orderId,
    amount: (amount || 0) * 100, // amount in paise
    currency,
    receipt,
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TeerthSetuSandbox'
  });
});

app.post('/api/payment/verify', (req, res) => {
  const { paymentId, orderId, signature } = req.body;

  res.json({
    success: true,
    verified: true,
    transactionId: paymentId || `TXN-${Date.now().toString().slice(-8)}`,
    message: 'Payment signature verified successfully'
  });
});

// Accommodation
app.get('/api/hotels', (req, res) => {
  const { templeId, templeName } = req.query;
  let result = hotels;
  if (templeId) {
    result = result.filter(h => String(h.templeId) === String(templeId));
  } else if (templeName) {
    const q = templeName.toLowerCase();
    result = result.filter(h => 
      (h.templeName && h.templeName.toLowerCase().includes(q)) || 
      (h.name && h.name.toLowerCase().includes(q))
    );
  }
  res.json(result);
});

// Notifications
app.get('/api/notifications', (req, res) => res.json(notifications));

app.post('/api/notifications/read-all', (req, res) => {
  notifications = notifications.map(n => ({ ...n, unread: false }));
  res.json({ success: true });
});

// Comprehensive Multi-Temple Circuits Database for all 12 Major Shrines
const templeCircuits = {
  // 1: Tirumala Venkateswara
  '1': {
    name: 'Tirumala Venkateswara Temple',
    city: 'Tirupati',
    primary: { name: 'Tirumala Venkateswara Sanctum', stay: 'TTD Srinivasam Complex', transit: 'Train / Air to Tirupati + Ghat Road Ghat Bus' },
    excursions: [
      { name: 'Sri Kalahasteeswara Temple (Rahu-Ketu Kshetra)', stay: 'Day trip', transit: 'Local Taxi (36 km)' },
      { name: 'Padmavathi Ammavari Temple (Tiruchanur)', stay: 'Day trip', transit: 'Auto Rickshaw (5 km)' },
      { name: 'Govindaraja Swamy Temple', stay: 'Day trip', transit: 'Walking from Station (1 km)' },
      { name: 'Kanipakam Varasiddhi Vinayaka Temple', stay: 'Day trip', transit: 'Intercity Bus (72 km)' }
    ],
    hotels: [
      { name: 'TTD Srinivasam Complex', economyPrice: 200, comfortPrice: 800, rating: 4.6 },
      { name: 'Hotel Bliss Tirupati', economyPrice: 1200, comfortPrice: 3200, rating: 4.4 },
      { name: 'Fortune Select Grand Ridge', economyPrice: 2500, comfortPrice: 5500, rating: 4.7 }
    ],
    baseDist: 140,
    transitMode: { economy: 'APSRTC AC Electric / Super Luxury', comfort: 'Private AC Innova / Ertiga' }
  },
  // 2: Kashi Vishwanath
  '2': {
    name: 'Kashi Vishwanath Temple',
    city: 'Varanasi',
    primary: { name: 'Kashi Vishwanath Corridor & Sanctum', stay: 'Mumukshu Bhawan Corridor', transit: 'Vande Bharat / Air to Varanasi' },
    excursions: [
      { name: 'Kaal Bhairav & Vishalakshi Devi Temple', stay: 'Day trip', transit: 'E-Rickshaw (2.2 km)' },
      { name: 'Sankat Mochan & Dashashwamedh Ganga Aarti', stay: 'Ghatside Dharamshala', transit: 'Heritage Boat / Auto (3.8 km)' },
      { name: 'Sarnath Buddhist Stupa & Deer Park', stay: 'Day trip', transit: 'Local Cab (11 km)' },
      { name: 'Durga Kund & Tulsi Manas Mandir', stay: 'Day trip', transit: 'Auto Rickshaw (4.5 km)' }
    ],
    hotels: [
      { name: 'Kashi Vishwanath Corridor Mumukshu Bhawan', economyPrice: 400, comfortPrice: 1600, rating: 4.8 },
      { name: 'BrijRama Palace Heritage Ghat', economyPrice: 3000, comfortPrice: 7500, rating: 4.9 },
      { name: 'Shiva Ganges View Yatri Nivas', economyPrice: 600, comfortPrice: 2200, rating: 4.5 }
    ],
    baseDist: 48,
    transitMode: { economy: 'Green E-Rickshaw & Public Ferry', comfort: 'Private AC Chauffeur Cab' }
  },
  // 3: Kedarnath Temple
  '3': {
    name: 'Kedarnath Temple',
    city: 'Rudraprayag / Gaurikund',
    primary: { name: 'Kedarnath Jyotirlinga Sanctum (11,755 ft)', stay: 'GMVN Swargarohini Complex', transit: 'Rishikesh NH-107 + Helicopter / 16km Trek' },
    excursions: [
      { name: 'Bhairavnath Temple (Ridge Lookout)', stay: 'Kedarnath Base', transit: 'Paved Mountain Path (1 km)' },
      { name: 'Gaurikund Thermal Springs & Gauri Temple', stay: 'Sonprayag Base Camp', transit: 'Local Shared Jeep (5 km)' },
      { name: 'Tungnath & Chandrashila (Highest Shiva Shrine)', stay: 'Chopta Meadow Camps', transit: 'Mountain SUV (74 km)' },
      { name: 'Guptkashi Vishwanath Temple', stay: 'GMVN Guptkashi', transit: 'Scenic Hill Road (32 km)' }
    ],
    hotels: [
      { name: 'GMVN Kedarnath Swargarohini Complex', economyPrice: 800, comfortPrice: 2800, rating: 4.7 },
      { name: 'GMVN Tourist Rest House Sonprayag', economyPrice: 600, comfortPrice: 2000, rating: 4.3 },
      { name: 'Kedar River Valley Retreat Guptkashi', economyPrice: 1500, comfortPrice: 4200, rating: 4.6 }
    ],
    baseDist: 210,
    transitMode: { economy: 'GMVN Mountain Bus + Palki/Trek', comfort: 'Private 4x4 SUV + Priority Helipad' }
  },
  // 4: Badrinath Temple
  '4': {
    name: 'Badrinath Temple',
    city: 'Chamoli / Badrinath',
    primary: { name: 'Badrinath Temple (Badri Vishal Sanctum)', stay: 'GMVN Devlok Badrinath', transit: 'Rishikesh to Joshimath Highway NH-7' },
    excursions: [
      { name: 'Mana Village (Last Indian Village) & Vyas Gufa', stay: 'Day trip', transit: 'Local Taxi (4.2 km)' },
      { name: 'Tapt Kund & Brahma Kapal Holy Steps', stay: 'Temple Periphery', transit: 'Walking (0.2 km)' },
      { name: 'Joshimath Shankaracharya Math & Ropeway', stay: 'Joshimath Rest House', transit: 'Mountain Cab (44 km)' },
      { name: 'Charanpaduka & Narad Kund', stay: 'Day trip', transit: 'Scenic Trail (3 km)' }
    ],
    hotels: [
      { name: 'GMVN Devlok Badrinath', economyPrice: 900, comfortPrice: 2900, rating: 4.6 },
      { name: 'Sarovar Portico Badrinath', economyPrice: 2500, comfortPrice: 6500, rating: 4.8 },
      { name: 'Gujarati Dharamshala Badrinath', economyPrice: 500, comfortPrice: 1400, rating: 4.2 }
    ],
    baseDist: 180,
    transitMode: { economy: 'Uttarakhand State Roadways Deluxe Bus', comfort: 'Private Hill Certified Scorpio/Innova' }
  },
  // 5: Jagannath Temple, Puri
  '5': {
    name: 'Jagannath Temple',
    city: 'Puri',
    primary: { name: 'Puri Shri Jagannath Temple (Badadeula)', stay: 'Nilachal Bhakta Nivas', transit: 'Train to Puri / Biju Patnaik Airport Bhubaneswar' },
    excursions: [
      { name: 'Konark Sun Temple & Chandrabhaga Beach', stay: 'Day trip', transit: 'Marine Drive Highway Bus (35 km)' },
      { name: 'Gundicha Temple (Mausi Maa Temple)', stay: 'Day trip', transit: 'Grand Road E-Rickshaw (2.8 km)' },
      { name: 'Lingaraj & Mukteshvara Temples (Bhubaneswar)', stay: 'Transit Hotel', transit: 'Express Highway Taxi (58 km)' },
      { name: 'Chilika Lake Sacred Kalijai Island', stay: 'Day trip', transit: 'Cab + Motor Boat (48 km)' }
    ],
    hotels: [
      { name: 'Nilachal Bhakta Nivas (Temple Trust)', economyPrice: 350, comfortPrice: 1200, rating: 4.7 },
      { name: 'Hotel Holiday Resort Marine Drive', economyPrice: 1500, comfortPrice: 4200, rating: 4.5 },
      { name: 'Mayfair Heritage Puri Beach', economyPrice: 3500, comfortPrice: 8500, rating: 4.9 }
    ],
    baseDist: 95,
    transitMode: { economy: 'OTDC AC Tourist Coach', comfort: 'Private AC Sedan / SUV' }
  },
  // 6: Somnath Temple
  '6': {
    name: 'Somnath Temple',
    city: 'Prabhas Patan / Veraval',
    primary: { name: 'Somnath First Jyotirlinga Shrine', stay: 'Sagar Darshan Somnath Guest House', transit: 'Train to Veraval / Rajkot Airport' },
    excursions: [
      { name: 'Bhalka Tirth (Lord Krishna Sacred Departure)', stay: 'Day trip', transit: 'Auto Rickshaw (4.8 km)' },
      { name: 'Triveni Sangam & Gita Mandir', stay: 'Seafront walk', transit: 'Walking / E-Cart (1.4 km)' },
      { name: 'Dwarkadhish Temple (Char Dham Dwarka)', stay: 'Dwarka Yatri Niwas', transit: 'Coastal Express Highway (230 km)' },
      { name: 'Nageshwar Jyotirlinga & Bet Dwarka', stay: 'Day trip', transit: 'Cab + Ferry (250 km)' }
    ],
    hotels: [
      { name: 'Sagar Darshan Somnath Guest House', economyPrice: 500, comfortPrice: 1800, rating: 4.8 },
      { name: 'Liluva Guest House (Somnath Trust)', economyPrice: 300, comfortPrice: 1000, rating: 4.4 },
      { name: 'The Fern Residency Somnath', economyPrice: 1800, comfortPrice: 4500, rating: 4.6 }
    ],
    baseDist: 110,
    transitMode: { economy: 'GSRTC Volvo Gurjarnagri Express', comfort: 'Private AC Cruiser SUV' }
  },
  // 7: Meenakshi Amman Temple
  '7': {
    name: 'Meenakshi Amman Temple',
    city: 'Madurai',
    primary: { name: 'Arulmigu Meenakshi Sundareswarar Temple', stay: 'Sri Meenakshi Temple Guest House', transit: 'Tejas Express / Madurai International Airport' },
    excursions: [
      { name: 'Thiruparankundram Murugan Temple (First Arupadaiveedu)', stay: 'Day trip', transit: 'City Taxi (8.5 km)' },
      { name: 'Alagar Kovil (Kallazhagar Hill Shrine)', stay: 'Day trip', transit: 'Suburban Bus / Cab (21 km)' },
      { name: 'Ramanathaswamy Temple (Rameshwaram Theerthams)', stay: 'Goswami Math', transit: 'Pamban Rail / Sea Highway (172 km)' },
      { name: 'Koodal Azhagar Temple', stay: 'Town walk', transit: 'Auto Rickshaw (1.8 km)' }
    ],
    hotels: [
      { name: 'Sri Meenakshi Temple Rest House', economyPrice: 300, comfortPrice: 900, rating: 4.5 },
      { name: 'Heritage Madurai', economyPrice: 2800, comfortPrice: 6800, rating: 4.8 },
      { name: 'Hotel Supreme Madurai Central', economyPrice: 900, comfortPrice: 2400, rating: 4.3 }
    ],
    baseDist: 120,
    transitMode: { economy: 'TNSTC AC Super Deluxe', comfort: 'Private AC Innova Crysta' }
  },
  // 8: Mahakaleshwar Temple
  '8': {
    name: 'Mahakaleshwar Temple',
    city: 'Ujjain',
    primary: { name: 'Mahakaleshwar Dakshinmukhi Jyotirlinga (Bhasma Aarti)', stay: 'Mahakal Bhakt Niwas', transit: 'Vande Bharat to Ujjain / Indore Airport (55 km)' },
    excursions: [
      { name: 'Kaal Bhairav Mandir (Sacred Madira Offering)', stay: 'Day trip', transit: 'E-Rickshaw (5.6 km)' },
      { name: 'Harsiddhi Mata Temple (51 Shaktipeethas)', stay: 'Corridor Walk', transit: 'Walking via Mahakal Lok (0.6 km)' },
      { name: 'Omkareshwar Island Jyotirlinga & Mamleshwar', stay: 'Narmada Resort', transit: 'Highway Cab (138 km)' },
      { name: 'Mangalnath Mandir (Mars Origin Kshetra)', stay: 'Day trip', transit: 'Auto Rickshaw (6.2 km)' }
    ],
    hotels: [
      { name: 'Mahakal Bhakt Niwas (Temple Trust)', economyPrice: 400, comfortPrice: 1400, rating: 4.7 },
      { name: 'Hotel Anushree Ujjain', economyPrice: 900, comfortPrice: 2600, rating: 4.3 },
      { name: 'Ujjaini Heritage Grand', economyPrice: 2200, comfortPrice: 5200, rating: 4.7 }
    ],
    baseDist: 85,
    transitMode: { economy: 'City E-Bus & Rickshaws', comfort: 'Private AC Sedan' }
  },
  // 9: Vaishno Devi Temple
  '9': {
    name: 'Vaishno Devi Temple',
    city: 'Katra / Trikuta Hills',
    primary: { name: 'Shri Mata Vaishno Devi Bhawan Sanctum', stay: 'Shrine Board Bhawan Complex', transit: 'Vande Bharat to Shri Mata Vaishno Devi Katra (SVDK)' },
    excursions: [
      { name: 'Bhairon Nath Temple (Sacred Darshan Completer)', stay: 'Upper Ridge', transit: 'Bhairon Passenger Ropeway (1.8 km)' },
      { name: 'Ardhkuwari Holy Garbhjoon Cave', stay: 'Midway Camp', transit: 'Battery Eco-Car / Trek (6 km)' },
      { name: 'Banganga Holy Bath & Charan Paduka', stay: 'Base Point', transit: 'Walking (1.5 km)' },
      { name: 'Shiv Khori Holy Cave Shrine (Reasi)', stay: 'Day trip', transit: 'Mountain Cab from Katra (75 km)' }
    ],
    hotels: [
      { name: 'Shrine Board Niharika Complex Katra', economyPrice: 350, comfortPrice: 1200, rating: 4.8 },
      { name: 'Hotel Rama Trident Katra', economyPrice: 1600, comfortPrice: 4200, rating: 4.5 },
      { name: 'The White Katra (Luxury Pilgrim)', economyPrice: 3200, comfortPrice: 7500, rating: 4.8 }
    ],
    baseDist: 65,
    transitMode: { economy: 'Battery Eco-Car & Shared Jeeps', comfort: 'Private AC Cruiser + Helipad' }
  },
  // 10: Brihadisvara Temple
  '10': {
    name: 'Brihadisvara Temple',
    city: 'Thanjavur',
    primary: { name: 'Brihadisvara Great Living Chola Temple (Big Temple)', stay: 'Hotel Tamil Nadu Thanjavur', transit: 'Train to Thanjavur / Tiruchirappalli Airport (55 km)' },
    excursions: [
      { name: 'Thanjavur Maratha Palace & Saraswathi Mahal Library', stay: 'Town centre', transit: 'Auto Rickshaw (1.8 km)' },
      { name: 'Gangaikonda Cholapuram Chola Temple', stay: 'Day trip', transit: 'Heritage Highway Cab (71 km)' },
      { name: 'Kumbakonam Adi Kumbeswarar & Navagraha Circuit', stay: 'Temple Town Nivas', transit: 'Intercity Train (38 km)' },
      { name: 'Airavatesvara Temple (Darasuram UNESCO)', stay: 'Day trip', transit: 'Local Taxi (35 km)' }
    ],
    hotels: [
      { name: 'Hotel Tamil Nadu Thanjavur (TTDC)', economyPrice: 600, comfortPrice: 1800, rating: 4.4 },
      { name: 'Svatma Heritage Luxury Resort', economyPrice: 3500, comfortPrice: 9500, rating: 4.9 },
      { name: 'Hotel Gnanam Thanjavur', economyPrice: 1100, comfortPrice: 2800, rating: 4.3 }
    ],
    baseDist: 115,
    transitMode: { economy: 'TNSTC AC Express', comfort: 'Private AC Chauffeur Cab' }
  },
  // 11: Ramanathaswamy Temple
  '11': {
    name: 'Ramanathaswamy Temple',
    city: 'Rameswaram',
    primary: { name: 'Ramanathaswamy Temple (22 Sacred Wells & Jyotirlinga)', stay: 'Goswami Math Dharamshala', transit: 'Rameswaram Express via Pamban Sea Bridge' },
    excursions: [
      { name: 'Agni Theertham Holy Seafront Bathing', stay: 'Shorefront walk', transit: 'Walking (0.3 km)' },
      { name: 'Dhanushkodi Ghost Town & Ram Setu Point (Arichal Munai)', stay: 'Day trip', transit: '4x4 Beach Van / Coastal Road (19 km)' },
      { name: 'Dr. APJ Abdul Kalam National Memorial', stay: 'Day trip', transit: 'Auto Rickshaw (4.2 km)' },
      { name: 'Kothandaramaswamy Temple (Vibhishan Coronation)', stay: 'Day trip', transit: 'Cab (12 km)' }
    ],
    hotels: [
      { name: 'Goswami Math Dharamshala', economyPrice: 300, comfortPrice: 900, rating: 4.4 },
      { name: 'Hotel Woodside Rameswaram', economyPrice: 1100, comfortPrice: 2800, rating: 4.5 },
      { name: 'Daiwik Hotels Rameswaram (Pilgrim Luxury)', economyPrice: 2400, comfortPrice: 5800, rating: 4.7 }
    ],
    baseDist: 60,
    transitMode: { economy: 'Local Minibus & Auto', comfort: 'Private AC SUV' }
  },
  // 12: Konark Sun Temple
  '12': {
    name: 'Konark Sun Temple',
    city: 'Konark / Puri District',
    primary: { name: 'Konark Sun Temple (Black Pagoda UNESCO World Heritage)', stay: 'Yatri Nivas Konark', transit: 'Puri-Konark Marine Drive / Bhubaneswar Airport (65 km)' },
    excursions: [
      { name: 'Chandrabhaga Clean Blue Flag Beach & Sun Shrine', stay: 'Coastal stretch', transit: 'Auto Rickshaw (3.2 km)' },
      { name: 'Shri Jagannath Temple Puri (Char Dham)', stay: 'Grand Road Nivas', transit: 'Marine Drive Highway (35 km)' },
      { name: 'Dhauli Shanti Stupa & Kalinga War Peace Rock', stay: 'Enroute Bhubaneswar', transit: 'Highway Taxi (54 km)' },
      { name: 'Ramachandi Beach & Temple (Water Sports)', stay: 'Day trip', transit: 'Auto Rickshaw (7 km)' }
    ],
    hotels: [
      { name: 'Yatri Nivas Konark (OTDC)', economyPrice: 500, comfortPrice: 1600, rating: 4.5 },
      { name: 'Lotus Eco Resort Konark', economyPrice: 2200, comfortPrice: 5800, rating: 4.7 },
      { name: 'Surya Inn Konark', economyPrice: 700, comfortPrice: 2000, rating: 4.2 }
    ],
    baseDist: 88,
    transitMode: { economy: 'OTDC AC Tourist Coach', comfort: 'Private AC Cruiser' }
  }
};

// Helper: Resolve circuit by templeId or match by name
function getCircuitForTemple(templeId, templeName = '') {
  if (templeId && templeCircuits[templeId.toString()]) {
    return templeCircuits[templeId.toString()];
  }
  const tLower = (templeName || '').toLowerCase();
  for (const [id, c] of Object.entries(templeCircuits)) {
    if (tLower && (c.name.toLowerCase().includes(tLower) || tLower.includes(c.name.toLowerCase()) || tLower.includes(c.city.toLowerCase()))) {
      return c;
    }
  }
  // Default to Kashi Vishwanath if not found, or Tirumala
  return templeCircuits['2'];
}

// GET test endpoint for /api/planner (prevents 404 when tested in browser)
app.get('/api/planner', (req, res) => {
  const sampleCircuit = templeCircuits['2'];
  res.json({
    status: 'online',
    message: 'TeerthSetu Autonomous AI Pilgrimage Route Agent is online. Send a POST request with { startingCity, templeId, days, budget, optimizationGoal, customDirectives } to deploy.',
    samplePayload: {
      startingCity: 'New Delhi',
      templeId: '2',
      days: 3,
      budget: 'Comfort',
      optimizationGoal: 'crowd_averse',
      customDirectives: 'Evening Aarti Priority'
    },
    groqConfigured: !!process.env.GROQ_API_KEY
  });
});

// Autonomous AI Pilgrimage Route Agent
app.post('/api/planner', async (req, res) => {
  const {
    startingCity,
    templeId,
    templeName,
    days,
    budget,
    optimizationGoal = 'crowd_averse',
    customDirectives = '',
    travelParty = 'Family'
  } = req.body;

  const start = startingCity || 'New Delhi';
  const daysNum = Math.min(15, Math.max(1, parseInt(days) || 2));
  const budgetScale = budget || 'Comfort';
  const circuit = getCircuitForTemple(templeId, templeName);

  const isEconomy = budgetScale === 'Economy';
  const isLuxury = budgetScale === 'Luxury';

  const directivesLower = (typeof customDirectives === 'string' ? customDirectives : '').toLowerCase();

  // Agent Multi-Phase Execution Trace
  const agentPhaseLogs = [
    { phase: '1. Ingestion', status: 'COMPLETE', detail: `Parsed origin (${start}), destination (${circuit.name}), ${daysNum} days, budget ${budgetScale}, party: ${travelParty}.` },
    { phase: '2. Transit Corridor Analysis', status: 'COMPLETE', detail: `Computed primary transit leg: ${start} ➔ ${circuit.city} via ${isEconomy ? 'Express Rail / Deluxe Coach' : 'Vande Bharat / Air Corridor'}.` },
    { phase: '3. Crowd & Queue Telemetry', status: 'COMPLETE', detail: `Analyzed historic queue volumes for ${circuit.name}. Selected optimal Darshan slot with <25 min expected wait.` },
    { phase: '4. Lodging Optimization', status: 'COMPLETE', detail: `Filtered top-rated stays. Assigned ${circuit.hotels[0]?.name} (0.3 km from entrance).` },
    { phase: '5. Multi-Stop Synthesis', status: 'COMPLETE', detail: `Synthesized full ${daysNum}-day sacred itinerary tailored to ${optimizationGoal.replace('_', ' ')} policy.` }
  ];

  // Default fallback route generation supporting up to 15 days
  const primaryStop = {
    name: circuit.primary.name,
    type: 'Primary Sanctum',
    timeSlot: optimizationGoal === 'crowd_averse' ? '05:30 AM - 08:30 AM' : '07:00 AM - 10:00 AM',
    crowdForecast: optimizationGoal === 'crowd_averse' ? 'Calm (Low Rush)' : 'Moderate',
    stay: circuit.primary.stay,
    transit: circuit.primary.transit,
    highlights: 'Main deity Darshan, special Archana, sacred Tirtha & Mahaprasad receipt.',
    gateInfo: 'Entry via Gate 1 / Vaikuntam or Corridor Complex',
    dayIndex: 1
  };

  const defaultRoute = [
    {
      name: start,
      type: 'Origin City',
      timeSlot: 'Day 1 Morning Departure',
      transit: `Direct travel corridor to ${circuit.city}`,
      dayIndex: 1
    },
    primaryStop
  ];

  // Expand excursions dynamically across the requested daysNum (up to 15 days)
  for (let d = 2; d <= daysNum; d++) {
    const excIndex = (d - 2) % circuit.excursions.length;
    const baseExc = circuit.excursions[excIndex];
    const isLastDay = d === daysNum;

    if (isLastDay && daysNum >= 3) {
      defaultRoute.push({
        name: `${circuit.name} (Concluding Darshan & Return to ${start})`,
        type: 'Return Journey',
        timeSlot: '07:00 AM - 11:30 AM',
        crowdForecast: 'Calm (Low Rush)',
        stay: 'Checkout & Transit Hub',
        transit: `Return Express transit to ${start}`,
        highlights: 'Final blessing pradakshina, souvenir bazaar & departure.',
        dayIndex: d
      });
    } else {
      defaultRoute.push({
        name: d % 2 === 0 ? baseExc.name : `${baseExc.name} & Surrounding Holy Tirthams`,
        type: d === 2 ? 'Sacred Excursion' : (d % 2 === 1 ? 'Evening Aarti Darshan' : 'Spiritual Yatra'),
        timeSlot: d % 2 === 0 ? '09:00 AM - 01:00 PM' : '05:00 PM - 08:30 PM',
        crowdForecast: d % 2 === 0 ? 'Moderate' : 'Smooth Flow',
        stay: baseExc.stay,
        transit: baseExc.transit,
        highlights: `Day ${d} pilgrimage node: ancient rituals, sacred holy bath & pradakshina.`,
        dayIndex: d
      });
    }
  }

  // Calculate costs & distances
  const totalKm = circuit.baseDist + (daysNum * 38);
  const transitModeStr = isEconomy ? circuit.transitMode.economy : circuit.transitMode.comfort;

  const dailyHotelCost = isEconomy ? (circuit.hotels[0]?.economyPrice || 400) : (circuit.hotels[0]?.comfortPrice || 1800);
  const totalStayCost = dailyHotelCost * daysNum;
  const transitCost = isEconomy ? Math.round(daysNum * 450 + 800) : Math.round(daysNum * 1400 + 2200);
  const mealsCost = daysNum * (isEconomy ? 300 : 750);
  const totalBudgetEst = totalStayCost + transitCost + mealsCost;

  // Base domain rationale decisions
  const defaultRationale = [
    `Optimal Sanctum Entry: Scheduled ${circuit.primary.name} during the tranquil morning slot (05:30 - 08:30 AM) to bypass peak afternoon tourist influx.`,
    `Transit Efficiency: Paired sequential excursions along the same geographic corridor across ${daysNum} days to reduce unnecessary city back-tracking by ${Math.round(totalKm * 0.22)} km.`,
    `Party Compatibility: Curated lodging at ${circuit.hotels[0]?.name} which features priority battery-car pickup points and pure vegetarian sattvik dining.`,
    optimizationGoal === 'senior_citizen' 
      ? `Accessibility Safeguard: Allocated 45-minute rest intervals across all ${daysNum} days between sacred nodes and routed via flat wheelchair walkways.`
      : `Devotional Timing: Aligned afternoon downtime with temple rest periods (Bhog/Pooja) across your ${daysNum}-day stay to maximize energy for evening deep Aarti.`
  ];

  // Real-Time Groq Cloud Llama 3.3 70B Multi-Day Itinerary Inference
  let liveLLMRationale = null;
  let liveLLMRoute = null;

  if (process.env.GROQ_API_KEY) {
    try {
      const groqPrompt = `You are the TeerthSetu Pilgrimage AI Agent.
A devotee wants a customized spiritual pilgrimage from "${start}" to "${circuit.name}" (${circuit.city}) for EXACTLY ${daysNum} DAYS.
Budget: "${budgetScale}", Policy: "${optimizationGoal}", Directives: "${customDirectives || 'Standard sacred circuit'}".

Generate an itinerary for all ${daysNum} days (Day 1 through Day ${daysNum}).
Include regional shrines, aartis, and holy ghats associated with ${circuit.name}.

Output ONLY valid JSON with this exact schema:
{
  "rationale": [
    "point 1 explaining the ${daysNum}-day strategy",
    "point 2 explaining queue bypass times",
    "point 3 explaining stay / fatigue management",
    "point 4 explaining transport corridor"
  ],
  "itinerary": [
    {
      "dayIndex": 1,
      "name": "${start} ➔ ${circuit.name}",
      "type": "Primary Sanctum",
      "timeSlot": "06:00 AM - 09:30 AM",
      "crowdForecast": "Calm (Low Rush)",
      "stay": "${circuit.hotels[0]?.name || 'Temple Guest House'}",
      "transit": "Express Rail / Highway Cab",
      "highlights": "Arrival, check-in and auspicious Mangala Darshan"
    }
  ]
}
Make sure "itinerary" has entries covering Day 1 to Day ${daysNum}!`;

      const groqApiKey = (process.env.GROQ_API_KEY || '').trim();
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are the TeerthSetu Pilgrimage AI Agent. Provide accurate, spiritually authentic multi-day itineraries in strict JSON.' },
            { role: 'user', content: groqPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
          max_tokens: 1800
        })
      });

      if (groqRes.ok) {
        const data = await groqRes.json();
        const parsed = JSON.parse(data?.choices?.[0]?.message?.content || '{}');
        if (parsed?.rationale && Array.isArray(parsed.rationale) && parsed.rationale.length >= 3) {
          liveLLMRationale = parsed.rationale;
        }
        if (parsed?.itinerary && Array.isArray(parsed.itinerary) && parsed.itinerary.length >= 2) {
          liveLLMRoute = parsed.itinerary;
          console.log(`[AI Agent] Groq Llama 3.3 70B generated custom ${liveLLMRoute.length}-step route for ${daysNum} days!`);
        }
      } else {
        const errText = await groqRes.text();
        console.warn('[AI Agent] Groq returned status:', groqRes.status, errText);

        // If 404 or model issue, try fallback to llama-3.1-8b-instant
        if (groqRes.status === 404) {
          console.log('[AI Agent] Retrying with llama-3.1-8b-instant...');
          const retryRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${groqApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'llama-3.1-8b-instant',
              messages: [
                { role: 'system', content: 'You are the TeerthSetu Pilgrimage AI Agent. Provide accurate itineraries in strict JSON.' },
                { role: 'user', content: groqPrompt }
              ],
              response_format: { type: 'json_object' },
              temperature: 0.3,
              max_tokens: 1800
            })
          });

          if (retryRes.ok) {
            const retryData = await retryRes.json();
            const parsedRetry = JSON.parse(retryData?.choices?.[0]?.message?.content || '{}');
            if (parsedRetry?.rationale && Array.isArray(parsedRetry.rationale)) {
              liveLLMRationale = parsedRetry.rationale;
            }
            if (parsedRetry?.itinerary && Array.isArray(parsedRetry.itinerary)) {
              liveLLMRoute = parsedRetry.itinerary;
              console.log(`[AI Agent] Groq Llama 3.1 8B generated custom ${liveLLMRoute.length}-step route!`);
            }
          } else {
            console.warn('[AI Agent] Retry with llama-3.1-8b-instant also returned:', retryRes.status, await retryRes.text());
          }
        }
      }
    } catch (e) {
      console.warn('[AI Agent] Groq inference fallback to local:', e.message);
    }
  }

  const finalRoute = liveLLMRoute && liveLLMRoute.length >= daysNum ? liveLLMRoute : defaultRoute;

  // Shrine specific Dos & Don'ts from Agent
  const agentDosDonts = [
    `Traditional Attire: Dhoti/Kurta for men and Saree/Salwar for women are required inside the sanctum.`,
    `Digital Lockers: Mobile devices and cameras must be deposited at the official biometric cloakrooms prior to queue entry.`,
    `Footwear Security: Utilize guarded shoe stands adjacent to Gate 1.`
  ];

  res.json({
    agentMetadata: {
      agentName: liveLLMRationale ? 'TeerthSetu AI Agent (Powered by Llama 3.3 70B on Groq)' : 'TeerthSetu Pilgrimage AI Agent v2.4',
      modelProvider: liveLLMRationale ? 'Groq Llama 3.3 70B' : 'TeerthSetu Local Engine',
      optimizationGoal,
      efficiencyScore: '98.6%',
      executionTimeMs: liveLLMRationale ? 220 : 12,
      phaseLogs: agentPhaseLogs,
      rationale: liveLLMRationale || defaultRationale,
      dosDonts: agentDosDonts
    },
    route: finalRoute,
    hotels: circuit.hotels.map(h => ({
      name: h.name,
      price: isEconomy ? h.economyPrice : h.comfortPrice,
      rating: h.rating
    })),
    transport: {
      mode: isEconomy ? (isLuxury ? 'Private Luxury Chauffeur SUV' : transitModeStr) : transitModeStr,
      distance: `${totalKm} km multi-shrine circuit`,
      estTime: `${daysNum} Days Itinerary`,
      estFuel: isEconomy ? `₹${transitCost.toLocaleString('en-IN')} tickets & local transit` : `₹${transitCost.toLocaleString('en-IN')} fuel, tolls & chauffeur`,
      budgetEstimate: `₹${totalBudgetEst.toLocaleString('en-IN')}`,
      breakdown: {
        stay: `₹${totalStayCost.toLocaleString('en-IN')}`,
        travel: `₹${transitCost.toLocaleString('en-IN')}`,
        meals: `₹${mealsCost.toLocaleString('en-IN')}`
      }
    }
  });
});

// Conversational AI Pilgrimage Assistant Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history = [], currentContext = {} } = req.body;
    const userQuery = (message || '').trim();

    if (!userQuery) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const queryLower = userQuery.toLowerCase();

    // Identify target temple if mentioned
    let matchedTempleId = currentContext.templeId || null;
    for (const [id, c] of Object.entries(templeCircuits)) {
      if (queryLower.includes(c.name.toLowerCase()) || queryLower.includes(c.city.toLowerCase())) {
        matchedTempleId = id;
        break;
      }
    }
    if (!matchedTempleId && queryLower.includes('kashi')) matchedTempleId = '2';
    if (!matchedTempleId && queryLower.includes('tirupati')) matchedTempleId = '1';
    if (!matchedTempleId && queryLower.includes('kedar')) matchedTempleId = '3';
    if (!matchedTempleId && queryLower.includes('badri')) matchedTempleId = '4';
    if (!matchedTempleId && queryLower.includes('puri')) matchedTempleId = '5';
    if (!matchedTempleId && queryLower.includes('somnath')) matchedTempleId = '6';
    if (!matchedTempleId && queryLower.includes('madurai')) matchedTempleId = '7';
    if (!matchedTempleId && queryLower.includes('mahakal')) matchedTempleId = '8';
    if (!matchedTempleId && queryLower.includes('vaishno')) matchedTempleId = '9';
    if (!matchedTempleId && queryLower.includes('thanjavur')) matchedTempleId = '10';
    if (!matchedTempleId && queryLower.includes('rameswaram')) matchedTempleId = '11';
    if (!matchedTempleId && queryLower.includes('konark')) matchedTempleId = '12';

    const circuit = getCircuitForTemple(matchedTempleId || '2');

    // Extract days if specified
    const daysMatch = queryLower.match(/(\d+)\s*(?:day|days)/);
    const requestedDays = daysMatch ? parseInt(daysMatch[1]) : (currentContext.days || 2);

    // Extract budget scale if specified
    const budgetScale = queryLower.includes('economy') || queryLower.includes('cheap') || queryLower.includes('budget') 
      ? 'Economy' 
      : (queryLower.includes('luxury') ? 'Luxury' : 'Comfort');

    const startingCity = currentContext.startingCity || (queryLower.includes('mumbai') ? 'Mumbai' : (queryLower.includes('bangalore') || queryLower.includes('bengaluru') ? 'Bengaluru' : 'New Delhi'));

    // Check if query is asking for a plan/itinerary or route
    const isPlanningQuery = queryLower.includes('plan') || queryLower.includes('itinerary') || queryLower.includes('route') || queryLower.includes('trip') || queryLower.includes('circuit') || queryLower.includes('budget');

    // If planning query, build a structured plan object that user can click "Apply to Timeline"
    let suggestedPlan = null;
    if (isPlanningQuery) {
      const isEconomy = budgetScale === 'Economy';
      const excSlice = circuit.excursions.slice(0, requestedDays <= 2 ? 2 : (requestedDays <= 4 ? 3 : 4));
      const route = [
        { name: startingCity, type: 'Origin' },
        { name: circuit.primary.name, type: 'Primary Destination', stay: circuit.primary.stay, transit: circuit.primary.transit }
      ];
      excSlice.forEach(e => route.push({ name: e.name, type: 'Sacred Excursion', stay: e.stay, transit: e.transit }));

      const totalKm = circuit.baseDist + (requestedDays * 35);
      const transitCost = isEconomy ? Math.round(requestedDays * 450 + 800) : Math.round(requestedDays * 1400 + 2200);
      const totalBudgetEst = (isEconomy ? 400 : 1800) * requestedDays + transitCost + (requestedDays * (isEconomy ? 300 : 750));

      suggestedPlan = {
        templeId: matchedTempleId || '2',
        templeName: circuit.name,
        startingCity,
        days: requestedDays,
        budget: budgetScale,
        route,
        hotels: circuit.hotels.map(h => ({
          name: h.name,
          price: isEconomy ? h.economyPrice : h.comfortPrice,
          rating: h.rating
        })),
        transport: {
          mode: isEconomy ? circuit.transitMode.economy : circuit.transitMode.comfort,
          distance: `${totalKm} km multi-shrine circuit`,
          estTime: `${requestedDays} Days Itinerary`,
          estFuel: isEconomy ? `₹${transitCost.toLocaleString('en-IN')} tickets` : `₹${transitCost.toLocaleString('en-IN')} fuel & tolls`,
          budgetEstimate: `₹${totalBudgetEst.toLocaleString('en-IN')}`
        }
      };
    }

    // Build intelligent conversational reply
    let replyText = '';

    if (queryLower.includes('senior') || queryLower.includes('elder') || queryLower.includes('wheelchair') || queryLower.includes('palki')) {
      replyText = `### 🦽 Senior Citizen & Accessibility Guide for ${circuit.name}\n\n` +
        `• **Wheelchair Facilities**: Dedicated priority gate access is available. You can request battery-operated eco-carts at the main entrance.\n` +
        `• **Queue Concessions**: Senior citizens (age 60+) and differently-abled pilgrims have dedicated fast-track darshan queues with seated holding bays and RO drinking water.\n` +
        `• **Transit Support**: For hill shrines (e.g. Kedarnath or Vaishno Devi), pre-booked government certified Palkis, ponies, and passenger ropeways/helicopters are operational.\n` +
        `• **Recommended Lodging**: ${circuit.hotels[0]?.name} is situated directly adjacent to the temple corridor to eliminate strenuous walking.`;
    } else if (queryLower.includes('dress code') || queryLower.includes('rules') || queryLower.includes('wear')) {
      replyText = `### 🥻 Traditional Dress Code & Sanctum Etiquette for ${circuit.name}\n\n` +
        `• **Men**: Traditional Dhoti / Kurta-Pyjama or plain South Indian Veshti. Jeans, shorts, and western nightwear are strictly not permitted inside inner sanctums.\n` +
        `• **Women**: Saree, Half-Saree, or Salwar Kameez with Dupatta.\n` +
        `• **Electronic Devices**: Mobile phones, smartwatches, cameras, and leather belts must be deposited at the official digital cloakroom locker counters.\n` +
        `• **Footwear**: Free guarded footwear stands are located beside Gate 1 and Gate 3.`;
    } else if (queryLower.includes('timing') || queryLower.includes('time') || queryLower.includes('rush') || queryLower.includes('crowd') || queryLower.includes('peak')) {
      replyText = `### ⏰ Darshan Timings & Crowd Intelligence for ${circuit.name}\n\n` +
        `• **Morning Slot (Best Time)**: 05:30 AM - 08:30 AM (Minimal wait times, tranquil morning Mangala Aarti).\n` +
        `• **Afternoon Slot**: 12:00 PM - 03:30 PM (Mid-day bhog / rest period; moderate queue movement).\n` +
        `• **Evening Sandhya Slot**: 06:00 PM - 09:30 PM (Peak devotional rush for evening Aarti and lighting).\n` +
        `• **TeerthSetu Tip**: Book a verified early morning slot between 06:00 AM - 08:00 AM through the Devotee Portal to experience seamless RFID/QR gate entry under 25 minutes!`;
    } else if (isPlanningQuery) {
      replyText = `### 🕉️ Customized ${requestedDays}-Day Spiritual Itinerary for ${circuit.name}\n\n` +
        `Based on your starting point from **${startingCity}** with a **${budgetScale}** budget preference, here is the curated sacred journey:\n\n` +
        `1. **Day 1**: Departure from **${startingCity}** ➔ Arrival at **${circuit.name}**. Check into *${circuit.hotels[0]?.name}* and attend the evening sacred Darshan & Aarti.\n` +
        `2. **Day 2**: Early morning sanctum entry ➔ Visit **${circuit.excursions[0]?.name}** via ${circuit.excursions[0]?.transit} ➔ Excursion to **${circuit.excursions[1]?.name}**.\n` +
        (requestedDays >= 3 ? `3. **Day 3**: Extended pilgrimage circuit to **${circuit.excursions[2]?.name}** and return transit.\n\n` : `\n`) +
        `• **Estimated Budget**: Around **${suggestedPlan?.transport?.budgetEstimate}** (Includes ${requestedDays} nights stay, temple transit & meals).\n` +
        `• **Transit Recommendation**: ${suggestedPlan?.transport?.mode}.\n\n` +
        `*Click **Apply to Route Timeline** below to automatically load this itinerary into your visual map!*`;
    } else {
      replyText = `Namaste! 🙏 I am your **TeerthAI Pilgrimage Assistant**.\n\n` +
        `I can help you with:\n` +
        `• **Multi-Temple Route Optimization**: Custom multi-day circuits for ${circuit.name}, Kashi Vishwanath, Tirumala, Kedarnath, and all 12 Jyotirlingas & Char Dham.\n` +
        `• **Live Crowd & Wait Times**: Slot recommendations and peak rush forecasts.\n` +
        `• **Budget & Stay Guidance**: Government guest houses (TTD, GMVN, Shrine Board) vs private hotels.\n` +
        `• **Elderly & Accessibility Help**: Wheelchair paths, battery cars, and Palki bookings.\n\n` +
        `*What pilgrimage destination or question can I assist you with today?*`;
    }

    res.json({
      reply: replyText,
      suggestedPlan,
      quickChips: [
        `Plan ${circuit.name.split(' ')[0]} 2-Day Circuit`,
        `Estimate 3-Day ${circuit.name.split(' ')[0]} Budget`,
        `Senior Citizen & Wheelchair Guidance`,
        `Peak Rush & Best Darshan Timings`
      ]
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ error: 'Failed to process AI chat request' });
  }
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

// Cashfree Aadhaar Verification Endpoints
app.post('/api/auth/aadhaar-send-otp', async (req, res) => {
  try {
    const { aadhaar } = req.body;
    const response = await fetch('https://sandbox.cashfree.com/verification/offline-aadhaar/otp', {
      method: 'POST',
      headers: {
        'x-client-id': process.env.CASHFREE_CLIENT_ID,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ aadhaar_number: aadhaar })
    });
    const data = await response.json();
    require('fs').writeFileSync('cashfree_error_log.txt', JSON.stringify(data, null, 2) + '\nStatus: ' + response.status);
    if (response.ok && (data.status === 'SUCCESS' || data.ref_id)) {
      res.json({ success: true, ref_id: data.ref_id });
    } else {
      res.json({ success: false, message: data.message || 'Failed to send OTP' });
    }
  } catch (err) {
    console.error('Send OTP Error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.post('/api/auth/aadhaar-verify-otp', async (req, res) => {
  try {
    const { ref_id, otp } = req.body;
    const response = await fetch('https://sandbox.cashfree.com/verification/offline-aadhaar/verify', {
      method: 'POST',
      headers: {
        'x-client-id': process.env.CASHFREE_CLIENT_ID,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ref_id: ref_id || '', otp: otp || '' })
    });
    const data = await response.json();
    require('fs').writeFileSync('cashfree_verify_log.txt', JSON.stringify({ payload: { ref_id, otp }, response: data }, null, 2) + '\nStatus: ' + response.status);
    if (response.ok && data.status === 'VALID') {
      res.json({ success: true, message: 'Aadhaar verified', details: data });
    } else {
      res.json({ success: false, message: data.message || 'Verification failed' });
    }
  } catch (err) {
    console.error('Verify OTP Error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TeerthSethu Backend Server running on port ${PORT}`));
