const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/DevoteeTravelsView.jsx', 'utf8');

const target = 'export default function DevoteeTravelsView({ userBookings = [], targetBooking = null, onSelectTargetBooking, temples = [] }) {';
const insertion = `export default function DevoteeTravelsView({ userBookings = [], targetBooking = null, onSelectTargetBooking, temples = [] }) {
  // 3 Primary Categories: 'trains', 'buses', 'flights' + 'multimodal'
  const [activeCategory, setActiveCategory] = useState('trains'); 
  
  // Destination Temple & City Filter
  const [selectedDestinationCity, setSelectedDestinationCity] = useState('Tirupati');
  const [originCity, setOriginCity] = useState('Bengaluru');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAcOnly, setFilterAcOnly] = useState(false);
  const [sortBy, setSortBy] = useState('price_low'); // price_low, duration, earliest

  // Selected Booking State for TeerthSetu Smart Pass
  const [selectedItem, setSelectedItem] = useState(null);
  const [passengers, setPassengers] = useState(1);
  const [travelDate, setTravelDate] = useState('2026-06-28');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Redirection Banner State
  const [redirectNotice, setRedirectNotice] = useState(null);

  // GPS / Live location state
  const [locStatus, setLocStatus] = useState('locating');
  const [userLocationName, setUserLocationName] = useState('Detecting live location...');`;

if (code.includes(target)) {
  code = code.replace(target, insertion);
  fs.writeFileSync('frontend/src/components/DevoteeTravelsView.jsx', code, 'utf8');
  console.log('Successfully placed state declarations at the top!');
} else {
  console.error('Target not found!');
  process.exit(1);
}

