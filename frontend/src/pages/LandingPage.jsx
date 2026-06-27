import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon, ChartBarIcon, CalendarDaysIcon, QrCodeIcon,
  MapIcon, BuildingOfficeIcon, UserGroupIcon, ChartPieIcon
} from '@heroicons/react/24/outline';
import { Sparkles, Shield, Compass, Calendar, ArrowRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useTransparentImage } from '../hooks/useTransparentImage';

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
  { name: "Rahul S.", text: "TeerthSethu transformed our Tirupati trip. The AI wait time prediction was incredibly accurate!" },
  { name: "Priya M.", text: "Booking a wheelchair for my grandmother was seamless. The volunteer was waiting for us at the gate." },
  { name: "Temple Trust, Varanasi", text: "The Admin Analytics dashboard has reduced our parking congestion by 40%." }
];


export default function LandingPage() {
const [showSplash, setShowSplash] = useState(true);
  const [showLogo, setShowLogo] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const finalLogo = isDarkMode ? "/logo_dark_mode.png" : "/logo_light_mode.png";
  const transparentTrishul = useTransparentImage("/trishul.png");

  useEffect(() => {
    // Show logo text after 1 second
    const logoTimer = setTimeout(() => {
      setShowLogo(true);
    }, 1000);

    // Fade out splash screen after 3.5 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3500);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(splashTimer);
    };
  }, []);

  return (
    <div className={`min-h-screen font-sans selection:bg-saffron selection:text-white transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0F172A] text-white' : 'bg-slate-50 text-slate-900'
    }`}>

      {/* 1. SPLASH SCREEN (Screen 1) */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className={`fixed inset-0 bg-cover bg-center bg-no-repeat z-[999] flex flex-col items-center justify-center text-center p-6 transition-all duration-500 ${
              isDarkMode ? "bg-[url('/splash_bg.jpg')]" : "bg-[url('/splash_bg_light.jpg')]"
            }`}
          >
            {/* Overlay Gradient for text readability */}
            <div className={`absolute inset-0 z-0 transition-colors duration-500 ${
              isDarkMode 
                ? 'bg-gradient-to-b from-slate-950/20 via-slate-950/40 to-slate-950/70' 
                : 'bg-gradient-to-b from-white/40 via-white/60 to-white/80'
            }`} />

            {/* Theme Toggle Button on Splash Screen */}
            <div className="absolute top-6 right-6 z-50">
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-full border transition-all duration-300 backdrop-blur-sm shadow-lg ${
                  isDarkMode 
                    ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-yellow-400 hover:border-yellow-400/40 shadow-black/40' 
                    : 'border-slate-200 bg-white/60 hover:bg-white text-indigo-600 hover:border-indigo-600/40 shadow-slate-200'
                }`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.364 17.636l-.707.707M18.364 17.636l-.707-.707M6.364 6.364l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Pulsing Sacred Mandala Watermark */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              className={`absolute w-80 h-80 pointer-events-none z-10 transition-opacity ${
                isDarkMode ? 'opacity-[0.05]' : 'opacity-[0.08]'
              }`}
            >
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#FF6B35" strokeWidth="1" />
                <circle cx="50" cy="50" r="35" fill="none" stroke="#FF6B35" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="20" fill="none" stroke="#F7C948" strokeWidth="0.5" />
                <path d="M50 0 L50 100 M0 50 L100 50 M15 15 L85 85 M15 85 L85 15" stroke="#FF6B35" strokeWidth="0.2" />
              </svg>
            </motion.div>

            {/* Brand Logo & Tagline Wrapper - Fades in after 1s */}
            <div className="min-h-[400px] md:min-h-[500px] w-full flex flex-col items-center justify-center relative z-10">
              <AnimatePresence>
                {showLogo && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative group flex items-center justify-center">
                      {/* Soft Divine White/Saffron Radial Glow Aura behind the logo */}
                      <motion.div 
                        animate={{
                          opacity: isDarkMode ? [0.35, 0.65, 0.35] : [0.65, 0.95, 0.65],
                          scale: [1, 1.12, 1],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className={`absolute inset-0 pointer-events-none rounded-full blur-3xl ${isDarkMode ? '-m-12 opacity-70' : '-m-16 opacity-90'}`}
                        style={{
                          background: isDarkMode 
                            ? 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.08) 50%, transparent 70%)'
                            : 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 40%, transparent 70%)'
                        }}
                      />

                      {/* Floating/Glowing Logo wrapper */}
                      <motion.div
                        animate={{
                          y: [0, -6, 0],
                          filter: [
                            "drop-shadow(0 0 15px rgba(255,255,255,0.25)) drop-shadow(0 4px 6px rgba(0,0,0,0.4))",
                            "drop-shadow(0 0 35px rgba(255,255,255,0.6)) drop-shadow(0 12px 16px rgba(0,0,0,0.6))",
                            "drop-shadow(0 0 15px rgba(255,255,255,0.25)) drop-shadow(0 4px 6px rgba(0,0,0,0.4))"
                          ]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="relative z-10"
                      >
                        <img
                          src={finalLogo}
                          alt="TeerthSetu Logo"
                          className="max-w-[500px] md:max-w-[800px] w-full h-auto mb-6 relative z-10 select-none"
                          style={!isDarkMode ? { filter: 'brightness(0.85) contrast(1.15) saturate(1.1)', mixBlendMode: 'multiply' } : {}}
                        />
                      </motion.div>
                    </div>

                    {/* High-Fidelity Tagline utilizing Montserrat font, SVGs, and CSS Gradients */}
                    <div 
                      className={`flex items-center gap-4 mt-6 text-[20px] md:text-[28px] font-semibold uppercase select-none ${isDarkMode ? 'filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]' : ''}`}
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        letterSpacing: "0.4em",
                        lineHeight: 1
                      }}
                    >
                      <img 
                        src={transparentTrishul} 
                        alt="Trishul" 
                        className={`h-12 w-auto md:h-16 animate-pulse flex-shrink-0 object-contain transition-all duration-300 ${isDarkMode ? 'filter drop-shadow-[0_0_12px_rgba(255,215,0,0.85)] brightness-125' : ''}`}
                      />

                      {/* Tagline Text */}
                      <span className={`flex flex-wrap items-center justify-center gap-x-2 text-center pl-[0.4em] ${isDarkMode ? 'filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]' : ''}`}>
                        <span className={`tracking-widest ${isDarkMode ? 'text-white font-extrabold' : 'text-black font-extrabold'}`}>ONE YATRA.</span>
                        <span 
                          className={`tracking-widest ${isDarkMode ? 'font-extrabold bg-gradient-to-r from-[#FFF6D6] via-[#FDE047] to-[#FBBF24] bg-clip-text text-transparent' : 'font-extrabold text-black'}`}
                          style={isDarkMode ? {
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                          } : {}}
                        >
                          LIMITLESS BLESSINGS.
                        </span>
                      </span>

                      <img 
                        src={transparentTrishul} 
                        alt="Trishul" 
                        className={`h-12 w-auto md:h-16 animate-pulse flex-shrink-0 object-contain transition-all duration-300 ${isDarkMode ? 'filter drop-shadow-[0_0_12px_rgba(255,215,0,0.85)] brightness-125' : ''}`}
                      />
                    </div>

                    <div className="mt-8 flex flex-col items-center gap-3">
                      <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden relative">
                        <motion.div
                          initial={{ left: "-100%" }}
                          animate={{ left: "100%" }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                          className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-saffron to-gold"
                        />
                      </div>
                      <span className={`text-[10px] tracking-wide font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-650'}`}>Loading divine portals...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MAIN APP CONTENT (Welcome & Landing) */}
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        {/* Navigation */}
        <nav className={`flex justify-between items-center py-3 px-6 sticky top-0 z-50 transition-all duration-300 shadow-lg ${
          isDarkMode 
            ? 'bg-slate-900/80 backdrop-blur-md border-b border-slate-800' 
            : 'bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center w-[200px] md:w-[250px] h-[50px] md:h-[64px]">
            <img 
              src={finalLogo} 
              alt="TeerthSetu Logo" 
              className="w-full h-full object-contain object-left"
              style={!isDarkMode ? { filter: 'brightness(0.85) contrast(1.15) saturate(1.1)', mixBlendMode: 'multiply' } : {}}
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-full border transition-all duration-300 ${
                isDarkMode 
                  ? 'border-slate-800 hover:bg-slate-800 text-yellow-400' 
                  : 'border-slate-200 hover:bg-slate-100 text-indigo-600'
              }`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.364 17.636l-.707.707M18.364 17.636l-.707-.707M6.364 6.364l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <Link to="/auth" className="bg-saffron hover:bg-[#e85a28] text-white font-bold py-2 px-6 rounded-full transition-all shadow-[0_4px_14px_0_rgba(255,107,53,0.3)] text-sm">
              Sign In Portal
            </Link>
          </div>
        </nav>

        {/* WELCOME SECTION (Screen 2 - Role selection) */}
        <section className={`relative w-full min-h-[90vh] flex flex-col justify-center items-center px-6 py-12 transition-all duration-500 ${
          isDarkMode 
            ? "bg-[url('/splash_bg.jpg')] bg-cover bg-center bg-no-repeat border-b border-slate-800" 
            : "bg-[url('/splash_bg_light.jpg')] bg-cover bg-center bg-no-repeat border-b border-slate-200"
        }`}>

          {/* Overlay Gradient for background readability */}
          <div className={`absolute inset-0 z-0 transition-colors duration-500 pointer-events-none ${
            isDarkMode 
              ? 'bg-slate-950/70' 
              : 'bg-white/40'
          }`} />

          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
            <svg width="800" height="800" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#FF6B35" strokeWidth="0.5" />
              <path d="M50 5 L50 95 M5 50 L95 50" stroke="#FF6B35" strokeWidth="0.5" />
            </svg>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`text-4xl md:text-6xl font-bold mb-4 tracking-tight transition-colors ${
                isDarkMode ? 'text-white' : 'text-slate-900 filter drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]'
              }`}
            >
              Welcome to <span className="text-saffron">TeerthSethu</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className={`text-lg md:text-xl max-w-2xl mx-auto mb-12 transition-colors ${
                isDarkMode ? 'text-slate-400' : 'text-slate-700 font-medium filter drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]'
              }`}
            >
              AI-Powered smart queue scheduling, live crowd telemetry, and resource balancing for India's historic pilgrimage centers.
            </motion.p>

            {/* Role Options Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

              {/* Option A: Devotee Portal */}
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className={`p-8 rounded-3xl text-left relative overflow-hidden shadow-2xl flex flex-col justify-between border transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-slate-900/60 border-slate-800 hover:border-gold/40' 
                    : 'bg-white/90 backdrop-blur-md border-slate-200 hover:border-saffron/40 shadow-xl'
                }`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl" />
                <div>
                  <div className="w-14 h-14 bg-saffron/10 rounded-2xl flex items-center justify-center mb-6">
                    <Compass className="h-8 w-8 text-saffron" />
                  </div>
                  <h3 className={`text-2xl font-bold mb-3 flex items-center gap-2 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Devotee Portal <span className="text-xs px-2.5 py-0.5 rounded-full bg-saffron/20 text-saffron font-semibold">Pilgrims</span>
                  </h3>
                  <p className={`text-sm leading-relaxed mb-8 transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-650'}`}>
                    Discover holy shrines, review live crowd wait-times, schedule priority Darshan slots, request accessibility support, and calculate AI itineraries.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/auth?role=devotee')}
                  className="w-full py-3.5 bg-saffron hover:bg-[#e85a28] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all group"
                >
                  Continue as Devotee <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>

              {/* Option B: Admin Dashboard */}
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className={`p-8 rounded-3xl text-left relative overflow-hidden shadow-2xl flex flex-col justify-between border transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/40' 
                    : 'bg-white/90 backdrop-blur-md border-slate-200 hover:border-emerald-500/40 shadow-xl'
                }`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
                <div>
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                    <Shield className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h3 className={`text-2xl font-bold mb-3 flex items-center gap-2 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Temple Administration <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">Trusts</span>
                  </h3>
                  <p className={`text-sm leading-relaxed mb-8 transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-650'}`}>
                    Access live command telemetry, manage entry gates, simulate walk-in POS billing, toggle security protocols, and check resource forecasting.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/auth?role=admin')}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all group"
                >
                  Continue as Admin <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>

            </div>
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section className={`py-24 px-6 max-w-6xl mx-auto border-t transition-colors duration-300 ${isDarkMode ? 'border-slate-900' : 'border-slate-200'}`}>
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>A Unified Spiritual Ecosystem</h2>
            <p className={`text-lg max-w-2xl mx-auto transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Everything you need to plan, book, and experience a divine journey without the friction.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`border p-6 rounded-2xl transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800 hover:border-saffron/40 shadow-lg' 
                    : 'bg-white border-slate-200 hover:border-saffron/40 shadow-md'
                }`}
              >
                <div className="bg-saffron/10 p-3 rounded-xl inline-block mb-4">
                  {feature.icon}
                </div>
                <h3 className={`text-lg font-bold mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{feature.title}</h3>
                <p className={`text-sm leading-relaxed transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className={`py-24 border-y transition-all duration-300 ${
          isDarkMode 
            ? 'bg-slate-900/40 border-slate-900' 
            : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="max-w-6xl mx-auto px-6">
            <h2 className={`text-4xl font-bold text-center mb-16 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Pilgrim Experiences</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className={`p-8 rounded-2xl border transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-slate-900 border-slate-850 shadow-xl' 
                      : 'bg-white border-slate-200 shadow-lg'
                  }`}
                >
                  <div className="text-gold text-4xl font-serif mb-4">"</div>
                  <p className={`italic mb-6 text-sm leading-relaxed transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t.text}</p>
                  <p className={`font-bold text-sm transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>- {t.name}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className={`py-12 px-6 text-center border-t transition-all duration-300 ${
          isDarkMode 
            ? 'bg-slate-950 border-slate-900 text-slate-400' 
            : 'bg-white border-slate-200 text-slate-500'
        }`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-center items-center mb-6">
              <img 
                src={finalLogo} 
                alt="TeerthSetu Logo" 
                className="h-8 md:h-10 w-auto opacity-80 hover:opacity-100 transition-opacity"
                style={!isDarkMode ? { filter: 'brightness(0.85) contrast(1.15) saturate(1.1)', mixBlendMode: 'multiply' } : {}}
              />
            </div>
            <p className={`mb-8 max-w-sm mx-auto text-sm leading-relaxed transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-650'}`}>India's First AI-Powered Pilgrimage Management & Crowd Intelligence Platform</p>
            <div className="flex justify-center gap-6 text-sm">
              <span className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}>About Us</span>
              <span className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}>Temple Trusts</span>
              <span className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}>Privacy Policy</span>
              <span className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}>Contact Support</span>
            </div>
            <p className="text-slate-500 mt-12 text-xs">© 2026 TeerthSethu Platform. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
