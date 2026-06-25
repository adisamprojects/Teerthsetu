import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  SparklesIcon, ChartBarIcon, CalendarDaysIcon, QrCodeIcon, 
  MapIcon, BuildingOfficeIcon, UserGroupIcon, ChartPieIcon
} from '@heroicons/react/24/outline';

const features = [
  { icon: <ChartBarIcon className="h-8 w-8 text-saffron" />, title: "AI Crowd Forecasting", desc: "Predict footfall and resource requirements with precision." },
  { icon: <CalendarDaysIcon className="h-8 w-8 text-saffron" />, title: "Smart Darshan Booking", desc: "Dynamically allocate slots based on live crowd density." },
  { icon: <QrCodeIcon className="h-8 w-8 text-saffron" />, title: "QR Entry System", desc: "Frictionless gate access with unified family passes." },
  { icon: <MapIcon className="h-8 w-8 text-saffron" />, title: "Travel Planning", desc: "AI-generated optimal routes for multi-temple journeys." },
  { icon: <BuildingOfficeIcon className="h-8 w-8 text-saffron" />, title: "Hotel Booking", desc: "Integrated stays customized for your spiritual path." },
  { icon: <UserGroupIcon className="h-8 w-8 text-saffron" />, title: "Elderly Assistance", desc: "Priority wheelchairs and volunteer escorts for seniors." },
  { icon: <ChartPieIcon className="h-8 w-8 text-saffron" />, title: "Temple Analytics", desc: "Live telemetry dashboard for temple administrators." }
];

const testimonials = [
  { name: "Rahul S.", text: "Divya Yatra transformed our Tirupati trip. The AI wait time prediction was incredibly accurate!" },
  { name: "Priya M.", text: "Booking a wheelchair for my grandmother was seamless. The volunteer was waiting for us at the gate." },
  { name: "Temple Trust, Varanasi", text: "The Admin Analytics dashboard has reduced our parking congestion by 40%." }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden text-darkText font-sans relative">
      
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="text-saffron font-bold text-2xl flex items-center gap-2">
          <SparklesIcon className="h-8 w-8" /> Divya Yatra
        </div>
        <Link to="/auth" className="btn-primary py-2 px-6 shadow-sm">Login / Register</Link>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[85vh] flex flex-col justify-center items-center text-center px-6 bg-gradient-to-br from-saffron/10 via-white to-white overflow-hidden">
        {/* Faint Mandala SVG Watermark */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <svg width="800" height="800" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#FF6B35" strokeWidth="0.5"/>
            <circle cx="50" cy="50" r="35" fill="none" stroke="#FF6B35" strokeWidth="0.5"/>
            <path d="M50 5 L50 95 M5 50 L95 50" stroke="#FF6B35" strokeWidth="0.5"/>
            <path d="M18 18 L82 82 M18 82 L82 18" stroke="#FF6B35" strokeWidth="0.5"/>
          </svg>
        </div>

        <motion.div 
          className="relative z-10 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-extrabold mb-6 text-darkText tracking-tight">
            Divya Yatra
          </h1>
          <p className="text-2xl md:text-3xl text-saffron font-semibold mb-10">
            India's First AI-Powered Pilgrimage Operating System
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/devotee" className="btn-primary text-lg">Explore Temples</Link>
            <Link to="/auth" className="btn-secondary text-lg">Book Darshan</Link>
          </div>
        </motion.div>
      </section>

      {/* 2. STATS BAR */}
      <section className="relative z-20 -mt-10 bg-white shadow-xl max-w-6xl mx-auto rounded-2xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 px-6 text-center">
          <StatCounter value="500+" label="Temples Connected" />
          <StatCounter value="2M+" label="Pilgrims Served" />
          <StatCounter value="45 min" label="Avg Wait Saved" />
          <StatCounter value="50+" label="Cities Covered" />
        </div>
      </section>

      {/* 3. FEATURES GRID */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-darkText mb-4">A Unified Spiritual Ecosystem</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">Everything you need to plan, book, and experience a divine journey without the friction.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card"
            >
              <div className="bg-saffron/10 p-3 rounded-xl inline-block mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-darkText">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. TESTIMONIALS */}
      <section className="py-24 bg-saffron/5 border-y border-saffron/10">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-darkText">Pilgrim Experiences</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
              >
                <div className="text-gold text-4xl font-serif mb-4">"</div>
                <p className="text-gray-700 italic mb-6">{t.text}</p>
                <p className="font-bold text-darkText">- {t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-darkText text-white py-12 px-6 text-center">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center gap-2 mb-6">
            <SparklesIcon className="h-6 w-6 text-saffron" />
            <span className="text-2xl font-bold">Divya Yatra</span>
          </div>
          <p className="text-gray-400 mb-8">India's First AI-Powered Pilgrimage Operating System</p>
          <div className="flex justify-center gap-6 text-gray-400">
            <span className="hover:text-gold cursor-pointer transition-colors">About Us</span>
            <span className="hover:text-gold cursor-pointer transition-colors">Temple Trusts</span>
            <span className="hover:text-gold cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-gold cursor-pointer transition-colors">Contact</span>
          </div>
          <p className="text-gray-600 mt-12 text-sm">© 2024 Divya Yatra Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function StatCounter({ value, label }) {
  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
    >
      <h4 className="text-4xl md:text-5xl font-extrabold text-saffron mb-2">{value}</h4>
      <p className="text-darkText font-medium">{label}</p>
    </motion.div>
  );
}
