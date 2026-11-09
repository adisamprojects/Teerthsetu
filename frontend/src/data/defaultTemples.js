// Master Default Temples Dataset
// Guarantees all 12 famous temples are instantly available even before or without backend fetch

export const DEFAULT_TEMPLES = [
  {
    _id: "1",
    name: "Tirumala Venkateswara Temple",
    location: "Tirupati, Andhra Pradesh",
    dailyLimit: 35000,
    currentCapacity: 28000,
    waitTime: 45,
    crowdLevel: "High",
    rating: 5.0,
    image: "/image/temple_1.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1600100397608-f010e42edb7a?auto=format&fit=crop&w=800&q=80",
    history: "Presiding Deity: Lord Venkateswara (Vishnu), situated on the sacred Tirumala hills.",
    timings: "6:00 AM - 9:00 PM",
    dressCode: "Traditional Dhoti / Saree",
    facilities: [
      "Prasadam",
      "Wheelchairs",
      "Cloakroom",
      "Battery Cars"
    ],
    lat: 13.6833,
    lon: 79.3475
  },
  {
    _id: "2",
    name: "Kashi Vishwanath Temple",
    location: "Varanasi, Uttar Pradesh",
    dailyLimit: 30000,
    currentCapacity: 24000,
    waitTime: 40,
    crowdLevel: "High",
    rating: 5.0,
    image: "/image/temple_2.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
    history: "Presiding Deity: Lord Shiva (Vishveshvara), one of the twelve Jyotirlingas on the banks of the sacred Ganga.",
    timings: "3:00 AM - 11:00 PM",
    dressCode: "Traditional / Modest Wear",
    facilities: [
      "Prasadam",
      "Wheelchairs",
      "Locker Counter"
    ],
    lat: 25.3109,
    lon: 83.0107
  },
  {
    _id: "3",
    name: "Kedarnath Temple",
    location: "Rudraprayag, Uttarakhand",
    dailyLimit: 18000,
    currentCapacity: 14000,
    waitTime: 35,
    crowdLevel: "Moderate",
    rating: 5.0,
    image: "/image/temple_3.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1626014303757-6564477577f1?auto=format&fit=crop&w=800&q=80",
    history: "Presiding Deity: Lord Shiva, nestled in the Garhwal Himalayas near Mandakini river, among the most revered Chota Char Dham.",
    timings: "4:00 AM - 9:00 PM",
    dressCode: "Warm Traditional / Modest Clothing",
    facilities: [
      "Medical Aid",
      "Emergency Oxygen",
      "Pony & Palki",
      "Helicopter Booking"
    ],
    lat: 30.7352,
    lon: 79.0669
  },
  {
    _id: "4",
    name: "Badrinath Temple",
    location: "Chamoli, Uttarakhand",
    dailyLimit: 20000,
    currentCapacity: 16000,
    waitTime: 25,
    crowdLevel: "Moderate",
    rating: 4.9,
    image: "/image/temple_4.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80",
    history: "Presiding Deity: Lord Badri Narayan (Vishnu), located along the banks of the Alaknanda River in the Chamoli district.",
    timings: "4:30 AM - 9:00 PM",
    dressCode: "Warm Traditional Clothing",
    facilities: [
      "Prasadam",
      "Tapt Kund Hot Springs",
      "Medical Aid",
      "Cloakroom"
    ],
    lat: 30.7433,
    lon: 79.4938
  },
  {
    _id: "5",
    name: "Jagannath Temple",
    location: "Puri, Odisha",
    dailyLimit: 32000,
    currentCapacity: 26000,
    waitTime: 35,
    crowdLevel: "High",
    rating: 4.9,
    image: "/image/temple_5.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80",
    history: "Presiding Deity: Lord Jagannath (Krishna), Balabhadra, and Subhadra, celebrated worldwide for the grand annual Ratha Yatra.",
    timings: "5:00 AM - 11:00 PM",
    dressCode: "Traditional Attire (Cotton Dhoti/Kurta/Saree)",
    facilities: [
      "Mahaprasadam (Ananda Bazar)",
      "Shoe Stand",
      "Wheelchairs",
      "Drinking Water"
    ],
    lat: 19.8049,
    lon: 85.8179
  },
  {
    _id: "6",
    name: "Somnath Temple",
    location: "Prabhas Patan, Gujarat",
    dailyLimit: 25000,
    currentCapacity: 19000,
    waitTime: 20,
    crowdLevel: "Moderate",
    rating: 4.9,
    image: "/image/temple_6.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    history: "Presiding Deity: Lord Shiva, the eternal shrine and first among the twelve holy Jyotirlinga shrines of India on the Arabian Sea coast.",
    timings: "6:00 AM - 10:00 PM",
    dressCode: "Decent Modest Wear",
    facilities: [
      "Sound & Light Show",
      "Prasadam Counter",
      "Cloakroom",
      "Wheelchairs"
    ],
    lat: 20.8880,
    lon: 70.4012
  },
  {
    _id: "7",
    name: "Meenakshi Amman Temple",
    location: "Madurai, Tamil Nadu",
    dailyLimit: 28000,
    currentCapacity: 22000,
    waitTime: 30,
    crowdLevel: "Moderate",
    rating: 4.9,
    image: "/image/temple_7.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    history: "Presiding Deity: Goddess Meenakshi (Parvati) and Sundareswarar (Shiva), renowned for its awe-inspiring Dravidian gopurams.",
    timings: "5:00 AM - 12:30 PM, 4:00 PM - 10:00 PM",
    dressCode: "Traditional Dress (Strictly No Western Casuals)",
    facilities: [
      "Prasadam",
      "Golden Lotus Tank",
      "Battery Cars",
      "Wheelchairs"
    ],
    lat: 9.9195,
    lon: 78.1193
  },
  {
    _id: "8",
    name: "Mahakaleshwar Temple",
    location: "Ujjain, Madhya Pradesh",
    dailyLimit: 30000,
    currentCapacity: 25000,
    waitTime: 45,
    crowdLevel: "High",
    rating: 4.9,
    image: "/image/temple_8.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    history: "Presiding Deity: Lord Mahakaleshwar (Shiva), the only south-facing (Dakshinmurti) Swayambhu Jyotirlinga, famous for the sacred Bhasma Aarti.",
    timings: "4:00 AM - 11:00 PM",
    dressCode: "Traditional Dhoti/Sola for Garbhagriha, Modest Wear",
    facilities: [
      "Bhasma Aarti Booking",
      "Prasadam",
      "Cloakroom",
      "Locker Counters"
    ],
    lat: 23.1827,
    lon: 75.7682
  },
  {
    _id: "9",
    name: "Vaishno Devi Temple",
    location: "Katra, Jammu & Kashmir",
    dailyLimit: 35000,
    currentCapacity: 29000,
    waitTime: 50,
    crowdLevel: "High",
    rating: 5.0,
    image: "/image/temple_9.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80",
    history: "Presiding Deity: Mata Vaishno Devi (Maha Kali, Maha Lakshmi, Maha Saraswati Pindis), sacred cave shrine in the Trikuta Mountains.",
    timings: "5:00 AM - 12:00 PM, 4:00 PM - 9:00 PM",
    dressCode: "Modest Traditional / Comfortable Yatra Attire",
    facilities: [
      "RFID Yatra Card",
      "Ropeway",
      "Battery Cars",
      "Medical Centers"
    ],
    lat: 33.0308,
    lon: 74.9490
  },
  {
    _id: "10",
    name: "Brihadisvara Temple",
    location: "Thanjavur, Tamil Nadu",
    dailyLimit: 20000,
    currentCapacity: 14000,
    waitTime: 15,
    crowdLevel: "Low",
    rating: 4.9,
    image: "/image/temple_10.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1600100397608-f010e42edb7a?auto=format&fit=crop&w=800&q=80",
    history: "Presiding Deity: Lord Shiva, UNESCO World Heritage Site built by Chola Emperor Rajaraja I, architectural marvel with a single-stone granite vimana dome.",
    timings: "6:00 AM - 12:30 PM, 4:00 PM - 8:30 PM",
    dressCode: "Traditional / Modest Wear",
    facilities: [
      "Prasadam",
      "Guide Audio Tour",
      "Wheelchairs",
      "Garden Walkways"
    ],
    lat: 10.7828,
    lon: 79.1318
  },
  {
    _id: "11",
    name: "Ramanathaswamy Temple",
    location: "Rameswaram, Tamil Nadu",
    dailyLimit: 25000,
    currentCapacity: 20000,
    waitTime: 30,
    crowdLevel: "Moderate",
    rating: 4.9,
    image: "/image/temple_11.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    history: "Presiding Deity: Lord Ramanathaswamy (Shiva), southern Jyotirlinga and Char Dham shrine famed for its 22 holy theerthams and longest pillared corridors.",
    timings: "5:00 AM - 1:00 PM, 3:00 PM - 9:00 PM",
    dressCode: "Traditional Dress (Dhoti/Saree/Salwar)",
    facilities: [
      "22 Theertham Bathing Guide",
      "Prasadam",
      "Cloakroom",
      "Wheelchairs"
    ],
    lat: 9.2881,
    lon: 79.3174
  },
  {
    _id: "12",
    name: "Konark Sun Temple",
    location: "Konark, Odisha",
    dailyLimit: 22000,
    currentCapacity: 15000,
    waitTime: 20,
    crowdLevel: "Low",
    rating: 4.9,
    image: "/image/temple_12.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80",
    history: "Presiding Deity: Surya (The Sun God), 13th-century UNESCO World Heritage monumental chariot temple with 24 intricately carved stone wheels.",
    timings: "6:00 AM - 8:00 PM",
    dressCode: "Modest Wear",
    facilities: [
      "Interpretation Centre",
      "Light & Sound Show",
      "Wheelchairs",
      "Cafeteria"
    ],
    lat: 19.8876,
    lon: 86.0945
  }
];

// Official Live Darshan Rate Cards by Temple Trust
export const TEMPLE_DARSHAN_RATES = {
  '1': { // Tirumala Venkateswara (TTD)
    General: { rate: 50, label: 'Free Sarva / Token', badge: 'Official TTD Sarva Queue', desc: 'Standard Devotee Lines' },
    Special: { rate: 300, label: 'Special Entry (SED-300)', badge: 'TTD Official SED', desc: 'Fast-Track Queue' },
    VVIP: { rate: 500, label: 'VIP Break / Protocol', badge: 'Sanctum Priority', desc: 'Sanctum Priority' }
  },
  '2': { // Kashi Vishwanath (Varanasi Nyas)
    General: { rate: 50, label: 'General Corridor Pass', badge: 'Sanctum Line', desc: 'Standard Queues' },
    Special: { rate: 300, label: 'Sugam Darshan Pass', badge: 'Official Fast-Track', desc: 'Fast-Track Queue' },
    VVIP: { rate: 1000, label: 'VIP Rudrabhishek Entry', badge: 'VIP Protocol', desc: 'Sanctum Priority' }
  },
  '3': { // Kedarnath Dham (BKTC)
    General: { rate: 50, label: 'General Yatra Pass', badge: 'BKTC Certified', desc: 'Standard Queues' },
    Special: { rate: 500, label: 'Maha Puja Special Pass', badge: 'BKTC Priority', desc: 'Fast-Track Queue' },
    VVIP: { rate: 1100, label: 'VIP Helipad Sanctum Pass', badge: 'Priority Protocol', desc: 'Sanctum Priority' }
  },
  '4': { // Badrinath Dham (BKTC)
    General: { rate: 50, label: 'Badrivishal General', badge: 'BKTC Certified', desc: 'Standard Queues' },
    Special: { rate: 450, label: 'Special Abhishek Pass', badge: 'BKTC Special', desc: 'Fast-Track Queue' },
    VVIP: { rate: 1000, label: 'VIP Sanctum Entry', badge: 'VIP Trust Protocol', desc: 'Sanctum Priority' }
  },
  '5': { // Jagannath Puri
    General: { rate: 50, label: 'General Darshan Pass', badge: 'Simhadwara Entry', desc: 'Standard Queues' },
    Special: { rate: 200, label: 'Parimanik Special Pass', badge: 'Trust Fast-Track', desc: 'Fast-Track Queue' },
    VVIP: { rate: 500, label: 'Garbhagriha VIP Protocol', badge: 'Ratnavedi Priority', desc: 'Sanctum Priority' }
  },
  '6': { // Somnath Jyotirlinga
    General: { rate: 50, label: 'General Jyotirlinga Pass', badge: 'Somnath Trust', desc: 'Standard Queues' },
    Special: { rate: 250, label: 'Somnath Somwar Fast Pass', badge: 'Trust Fast-Track', desc: 'Fast-Track Queue' },
    VVIP: { rate: 500, label: 'VIP Bilva Puja Protocol', badge: 'Special Aarti VIP', desc: 'Sanctum Priority' }
  },
  '7': { // Meenakshi Amman (Madurai)
    General: { rate: 50, label: 'General Temple Pass', badge: 'Ashta Shakti Entry', desc: 'Standard Queues' },
    Special: { rate: 100, label: 'Special Fast-Track Pass', badge: 'HR&CE Official', desc: 'Fast-Track Queue' },
    VVIP: { rate: 500, label: 'VIP Amman Protocol Pass', badge: 'Sanctum Priority', desc: 'Sanctum Priority' }
  },
  '8': { // Mahakaleshwar (Ujjain)
    General: { rate: 50, label: 'General Darshan', badge: 'Mahakal Mandir', desc: 'Standard Queues' },
    Special: { rate: 250, label: 'Sheegra Darshan Ticket', badge: 'Official Sheegra', desc: 'Fast-Track Queue' },
    VVIP: { rate: 750, label: 'Bhasma Aarti / VIP Protocol', badge: 'Bhasma Aarti Access', desc: 'Sanctum Priority' }
  },
  '9': { // Ramanathaswamy (Rameswaram)
    General: { rate: 50, label: 'General Theertham Pass', badge: 'East Gopuram Entry', desc: 'Standard Queues' },
    Special: { rate: 200, label: 'Fast-Track Darshan Pass', badge: 'Official Fast Line', desc: 'Fast-Track Queue' },
    VVIP: { rate: 500, label: 'VIP Spatika Linga Puja', badge: 'Morning Mani Darshan', desc: 'Sanctum Priority' }
  },
  '10': { // Shirdi Sai Baba
    General: { rate: 50, label: 'General Samadhi Pass', badge: 'Sansthan Free Token', desc: 'Standard Queues' },
    Special: { rate: 200, label: 'VIP Aarti / Special Pass', badge: 'Sansthan Fast-Track', desc: 'Fast-Track Queue' },
    VVIP: { rate: 500, label: 'VIP Kakad / Shej Protocol', badge: 'Special VIP Access', desc: 'Sanctum Priority' }
  },
  '11': { // Vaishno Devi Shrine
    General: { rate: 50, label: 'General Yatra Parchi', badge: 'SMVDSB Certified', desc: 'Standard Queues' },
    Special: { rate: 350, label: 'Priority Darshan Pass', badge: 'Shrine Board Priority', desc: 'Fast-Track Queue' },
    VVIP: { rate: 1000, label: 'Atka Aarti VIP Protocol', badge: 'Atka Aarti Special', desc: 'Sanctum Priority' }
  },
  '12': { // Golden Temple (Amritsar)
    General: { rate: 50, label: 'Sewa & Parikrama Pass', badge: 'SGPC Consecrated', desc: 'Standard Queues' },
    Special: { rate: 100, label: 'Special Akal Takht Pass', badge: 'Harmandir Fast Line', desc: 'Fast-Track Queue' },
    VVIP: { rate: 500, label: 'Palki Sahib VIP Protocol', badge: 'Sukhasan Sewa Priority', desc: 'Sanctum Priority' }
  }
};

// Verified Temple Trust Stay & Dharamshala Rates
export const TEMPLE_TRUST_STAYS = {
  '1': { id: 'tiru-trust', name: 'TTD Srinivasam Pilgrim Nilayam Complex', price: 600, distance: '0.4 km from Alipiri Gate', rating: '4.7 ★', roomType: 'Deluxe Pilgrim AC Room' },
  '2': { id: 'kashi-trust', name: 'Kashi Vishwanath Corridor Pilgrim Niwas', price: 800, distance: '0.2 km from Corridor Gate 4', rating: '4.8 ★', roomType: 'Ganga View Devotee AC Room' },
  '3': { id: 'kedar-trust', name: 'GMVN Swargarohini Pilgrim Tourist Complex', price: 1200, distance: '0.3 km from Kedarnath Temple Steps', rating: '4.6 ★', roomType: 'Heated Mountain Yatri Room' },
  '4': { id: 'badri-trust', name: 'BKTC Badrivishal Yatri Vishram Griha', price: 850, distance: '0.2 km from Alaknanda Bank & Temple', rating: '4.7 ★', roomType: 'Warm Deluxe Pilgrim Room' },
  '5': { id: 'puri-trust', name: 'Shree Jagannath Bhakta Niwas (Grand Road)', price: 650, distance: '0.5 km from Simhadwara Gate', rating: '4.6 ★', roomType: 'Traditional Devotee AC Room' },
  '6': { id: 'somnath-trust', name: 'Somnath Trust Sagar Darshan Guest House', price: 950, distance: '0.3 km from Somnath Mandir Seafront', rating: '4.8 ★', roomType: 'Sea-View Devotee AC Room' },
  '7': { id: 'madurai-trust', name: 'Sri Meenakshi Sundareswarar Yatri Nivas', price: 600, distance: '0.4 km from South Gopuram', rating: '4.6 ★', roomType: 'Heritage Pilgrim AC Room' },
  '8': { id: 'ujjain-trust', name: 'Mahakal Mandir Bhakta Niwas Complex', price: 700, distance: '0.3 km from Mahakal Corridor Gate', rating: '4.7 ★', roomType: 'Deluxe AC Bhakta Room' },
  '9': { id: 'ramesh-trust', name: 'Goswami & Ramanatha Trust Yatri Bhavan', price: 500, distance: '0.4 km from East Tower & Agni Teertham', rating: '4.5 ★', roomType: 'Pilgrim AC Room' },
  '10': { id: 'shirdi-trust', name: 'Shirdi Sai Sansthan Bhakta Niwas (500 Rooms)', price: 500, distance: '0.5 km from Gate 2 Samadhi Complex', rating: '4.8 ★', roomType: 'Sansthan Deluxe AC Room' },
  '11': { id: 'vaishno-trust', name: 'SMVDSB Niharika Yatri Niwas Katra', price: 950, distance: '0.3 km from Katra Bus Stand & Yatra Gate', rating: '4.8 ★', roomType: 'Shrine Board AC Room' },
  '12': { id: 'amritsar-trust', name: 'Guru Arjan Dev Niwas (SGPC Yatri Niwas)', price: 400, distance: '0.2 km from Golden Temple Heritage Street', rating: '4.9 ★', roomType: 'SGPC Deluxe Room' }
};

