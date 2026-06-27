# Software Requirements Specification (SRS)
## Project: TeerthSethu
### Tagline: AI-Powered Smart Pilgrimage Management & Crowd Intelligence Platform

---

## 1. Overview & Objectives

**TeerthSethu** is a smart pilgrimage management and crowd intelligence platform designed to bridge the gap between massive devotee turnouts at holy sites and administrative resource constraints. By providing predictive analytics, queue management, live telemetry, and accessibility features, the platform transforms traditional temple visits into a smooth, organized, and digitally managed ecosystem.

---

## 2. Modules & Functional Requirements

### 👤 2.1 Devotee Module

1. **Splash Screen (Screen 1)**
   - Displays TeerthSethu Logo, Tagline, and a loading mandala animation.
2. **Welcome Screen (Screen 2)**
   - Role selection for users: "Continue as Devotee" or "Continue as Temple Administrator".
3. **Login Screen (Screen 3)**
   - Supports Email & Phone number credentials, password fields, and a "Forgot Password" link.
4. **Registration (Screen 4)**
   - Registers name, phone, email, password, address, optional Aadhaar, and emergency contact.
5. **Home Dashboard (Screen 5)**
   - Personal greeting, nearby temples, today's crowd levels, upcoming festivals, recent bookings list, notification alerts.
   - Quick action buttons: Book Darshan, Plan Journey, My Tickets, Explore Temples.
6. **Temple Discovery (Screen 6)**
   - Search bar and filters: State, City, Temple Name, Crowd Level, Popular, Nearby.
   - Temple cards showing location, current wait time, crowd state, and booking triggers.
7. **Temple Details (Screen 7)**
   - Image carousel, history, opening/closing hours, dress codes, facilities, AI crowd predictions, waiting time index, and action buttons for booking, directions, and nearby hotels.
8. **AI Crowd Prediction Analytics (Screen 8)**
   - Displays graphs detailing crowd trends and wait times for current, next hour, tomorrow, weekend, and festivals. Recommendation on the best times to visit.
9. **Darshan Booking (Screen 9)**
   - Forms to input date, time slot, visitor count, and special Darshan categories.
10. **Accessibility Services (Screen 10)**
    - Checkboxes for priority entries, wheelchair allocation, volunteer escorts, medical camp notifications, senior citizen status, and Divyang privileges.
11. **Travel Planner (Screen 11)**
    - Calculations for private transport (Car, Bike) showing distance, fuel cost, and ETA.
    - Redirects/information for public options (Buses, Trains, Flights).
12. **Accommodation (Screen 12)**
    - Listings for Hotels, Lodges, Dharamshalas, and Temple Guest Houses with rating, price, and distance filters.
13. **Payments Portal (Screen 13)**
    - Interface simulating payments via UPI, Credit/Debit cards, Net Banking, and Wallets.
14. **QR Ticket (Screen 14)**
    - Generates a unique QR code with booking ID, date, time slot, temple name, and visitors count. Allows downloading, sharing, and saving.
15. **My Bookings (Screen 15)**
    - Tabs for Upcoming, Completed, and Cancelled bookings, with reschedule and cancellation options.
16. **Waitlist Tracker (Screen 16)**
    - Displays queue position and estimated confirmation times.
17. **Notifications Pane (Screen 17)**
    - Alerts for slot updates, crowd warnings, weather warnings, festival highlights, and emergency announcements.
18. **Multi-Temple Journey Planner (Screen 18)**
    - Dynamic route mapping based on selected days, starting city, target temples, and budgets.
19. **Profile (Screen 19)**
    - Displays personal details, family members list, saved temples, and pre-selected accessibility configurations.

---

### 🏛 2.2 Temple Administration Module

20. **Admin Dashboard (Screen 20)**
    - Highlights live visitors, exit telemetry, active ticketing counts, average wait time, and revenue widgets.
    - Visual Recharts representing crowd trends and hourly visitors.
21. **Temple Settings (Screen 21)**
    - Controls for daily/hourly capacity quotas, online vs offline ratios, opening hours, and rules.
22. **Slot Management (Screen 22)**
    - CRUD interfaces to setup, alter, or remove Darshan time slots.
23. **Walk-in Ticket POS (Screen 23)**
    - Quick terminal for offline/walk-in visitors generating printable paper QR tickets.
24. **QR Scanner (Screen 24)**
    - Simulates security camera scanning. Displays check-in approvals, already-used alerts, and invalid scan prompts.
25. **Live Crowd Monitor (Screen 25)**
    - Real-time gauges highlighting headcounts inside, exit rate, queue lengths, and immediate wait indicators.
26. **AI Prediction Dashboard (Screen 26)**
    - Displays forecasting widgets for tomorrow's crowd size, peak hourly spikes, and festival forecasts.
27. **Volunteer Shift Planner (Screen 27)**
    - Recommends volunteer staffing levels and allocates shifts.
28. **Security Planner (Screen 28)**
    - Shows guard deployment requirements, highlights congestion heatmaps, and coordinates emergency protocols.
29. **Parking Intelligence Dashboard (Screen 29)**
    - Predicts vehicle volumes, counts, and triggers overflow plans.
30. **Prasadam Inventory Planner (Screen 30)**
    - Matches expected visitor flows against prasadam production limits, stock levels, and consumption.
31. **Accessibility Management Dashboard (Screen 31)**
    - Tallies outstanding wheelchair requests, volunteer escorts, priority queues, and medical camp requests.
32. **Reports Portal (Screen 32)**
    - Compiles daily, weekly, and monthly statistics. Exports to PDF, Excel, and CSV formats.

---

### 🤖 2.3 AI Engine & Predictive Logic

1. **Crowd Forecasting Engine**: Processes weather patterns, holidays, calendar dates, and scanner records to yield crowd estimates and wait times.
2. **Recommendation Engine**: Customizes slots, lodging suggestions, transit modes, and routing.
3. **Resource Optimizer**: Outlines volunteers, guards, wheelchairs, parking, and prasadam supply estimates.

---

## 3. Database Collections Schema

* **Users**: ID, Name, Phone, Email, PasswordHash, Address, AadhaarHash (Optional), EmergencyContact, SavedTemples, AccessibilityPreferences.
* **Admins**: ID, Email, PasswordHash, TempleId, Role.
* **Temples**: ID, Name, Location, DailyLimit, CurrentCapacity, BaseWaitTime, CrowdLevel, Timings, Rules.
* **Bookings**: ID, UserId, TempleId, Date, Slot, VisitorsCount, SpecialDarshan, Status (Pending, Confirmed, Cancelled), WaitlistPosition.
* **Tickets**: ID, BookingId, QRCode, Status (Unused, Used), EntryTime.
* **Payments**: ID, BookingId, Amount, PaymentMode, Status (Success, Failed), TransactionId.
* **CrowdPrediction**: TempleId, Date, HourlyPredictions, WeatherModifier, HolidayModifier, EstimatedWait.
* **Attendance**: TempleId, TimeStamp, Action (Entry, Exit), GateId.
* **Notifications**: ID, TargetUserId, Message, Category, Timestamps.
* **Hotels**: ID, Name, Rating, PricePerNight, DistanceToTemple, TempleId.
* **Transport**: Mode, Distance, ETA, CostEstimation.
* **Volunteers**: ID, Name, ShiftId, TargetArea, Phone.
* **WheelchairRequests**: BookingId, RequesterName, Status, AssignedVolunteerId.
* **Reports**: ID, Date, Type (Daily/Weekly), MetricsSummary.
* **Parking**: TempleId, LotId, Capacity, OccupiedCount, OverflowStatus.
* **Prasadam**: TempleId, ProductionCapacity, AvailableStock, DemandPrediction.

---

## 4. Hackathon MVP Scope

For rapid evaluation and core validation, the project focuses on these 10 fully interactive screens:
1. **Splash Screen**
2. **Role Selection (Welcome)**
3. **Login / Registration**
4. **Devotee Dashboard (Home)**
5. **Temple Discovery**
6. **Temple Details (incl. AI Crowd Analytics & Forecast)**
7. **Darshan Booking (incl. Accessibility)**
8. **QR Ticket**
9. **Admin Command Dashboard**
10. **QR Entry Scanner**
