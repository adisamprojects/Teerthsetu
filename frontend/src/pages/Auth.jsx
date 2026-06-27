import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Phone, Mail, Lock, Shield, User, MapPin, Key, UserCheck, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'devotee';
  const [role, setRole] = useState(initialRole);
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    aadhaar: '',
    emergencyContact: ''
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const payload = isLogin 
      ? { email: formData.email || 'user@teerthsethu.in', password: formData.password || 'password', role }
      : { ...formData, role };

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      // Store mock token and user details
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Navigate based on role
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/devotee');
      }
    });
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgot(false);
      setForgotSuccess(false);
      setForgotEmail('');
    }, 2000);
  };

  const { isDarkMode, toggleTheme } = useTheme();
  const finalLogo = isDarkMode ? "/logo_dark_mode.png" : "/logo_light_mode.png";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#1A1A2E] text-slate-900 dark:text-white flex items-center justify-center p-6 relative transition-colors duration-300 overflow-hidden">
      
      {/* Close/Back Button */}
      <Link
        to="/"
        state={{ skipSplash: true }}
        className="absolute top-6 left-6 p-2.5 rounded-full border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md hover:bg-white/80 dark:hover:bg-white/10 transition-all z-50 text-slate-600 dark:text-slate-300 shadow-sm hover:scale-105"
        aria-label="Back to home"
      >
        <X className="h-5 w-5" />
      </Link>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-full border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md hover:bg-white/80 dark:hover:bg-white/10 transition-all z-50 text-indigo-600 dark:text-yellow-400 shadow-sm"
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
      
      {/* Decorative Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-saffron/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-gold/10 rounded-full blur-[130px] pointer-events-none" />
      
      {/* Auth Card Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row relative z-10"
      >
        
        {/* Left Side - Brand & Info */}
        <div className="w-full md:w-5/12 bg-indigo-50 dark:bg-slate-900/50 p-8 flex flex-col border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-8">
              <img 
                src={finalLogo} 
                alt="TeerthSetu Logo" 
                className="h-28 md:h-36 w-auto object-contain"
                style={!isDarkMode ? { filter: 'brightness(0.85) contrast(1.15) saturate(1.1)', mixBlendMode: 'multiply' } : {}}
              />
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-sm">AI-Powered Smart Pilgrimage Management</p>
          </div>
        </div>
        
        {/* Right Side - Forms */}
        <div className="w-full md:w-7/12 p-8 flex flex-col justify-center">

        {/* Form Title */}
        <h3 className="text-2xl font-bold text-center mb-6">
          {isLogin ? `${role === 'admin' ? 'Administrator' : 'Devotee'} Login` : 'Create Devotee Account'}
        </h3>

        {/* Login Method Toggle (only if login mode) */}
        {isLogin && (
          <div className="flex justify-center gap-6 mb-6 text-sm">
            <button 
              type="button"
              className={`pb-1 border-b-2 font-medium transition-colors ${loginMethod === 'email' ? 'border-saffron text-saffron' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white'}`}
              onClick={() => setLoginMethod('email')}
            >
              Email Login
            </button>
            <button 
              type="button"
              className={`pb-1 border-b-2 font-medium transition-colors ${loginMethod === 'phone' ? 'border-saffron text-saffron' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white'}`}
              onClick={() => setLoginMethod('phone')}
            >
              Phone Login
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {isLogin ? (
              // --- LOGIN FORM ---
              <motion.div 
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex flex-col gap-4"
              >
                {loginMethod === 'email' ? (
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <input 
                      type="email" 
                      name="email"
                      placeholder="Email Address" 
                      required 
                      className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                      defaultValue={role === 'admin' ? 'admin@teerthsethu.in' : 'pilgrim@teerthsethu.in'}
                      onChange={handleInputChange}
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <input 
                      type="tel" 
                      name="phone"
                      placeholder="Phone Number" 
                      required 
                      className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                      defaultValue="+91 9876543210"
                      onChange={handleInputChange}
                    />
                  </div>
                )}

                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <input 
                    type="password" 
                    name="password"
                    placeholder="Password" 
                    required 
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                    defaultValue="password"
                    onChange={handleInputChange}
                  />
                </div>

                <div className="text-right">
                  <button 
                    type="button" 
                    onClick={() => setShowForgot(true)}
                    className="text-xs text-gold hover:underline transition-all"
                  >
                    Forgot Password?
                  </button>
                </div>
              </motion.div>
            ) : (
              // --- REGISTRATION FORM ---
              <motion.div 
                key="register-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-2"
              >
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Full Name" 
                    required 
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="Phone Number" 
                    required 
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Email Address" 
                    required 
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <input 
                    type="password" 
                    name="password" 
                    placeholder="Password" 
                    required 
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    placeholder="Confirm Password" 
                    required 
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>


              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit" 
            className={`w-full py-3.5 rounded-xl font-bold text-lg mt-4 shadow-lg transition-all duration-300 hover:-translate-y-0.5 text-white ${role === 'admin' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/30' : 'bg-saffron hover:bg-[#e85a28] shadow-saffron/30'}`}
          >
            {isLogin ? 'Secure Sign In' : 'Register Account'}
          </button>
        </form>

        {/* OR Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-slate-200 dark:border-white/10"></div>
          <span className="px-4 text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">or</span>
          <div className="flex-1 border-t border-slate-200 dark:border-white/10"></div>
        </div>
        
        {/* Google Sign In Button */}
        <button 
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300 shadow-sm font-semibold text-slate-700 dark:text-white"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {role === 'devotee' && (
          <p className="text-center text-slate-600 dark:text-slate-400 mt-8 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              className="text-gold font-semibold cursor-pointer hover:underline" 
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Create Account' : 'Sign In'}
            </span>
          </p>
        )}
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgot && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[#1F1F35] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <h4 className="text-xl font-bold mb-2">Reset Password</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Enter your registered email or phone to receive a password reset link.</p>
              
              {forgotSuccess ? (
                <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-xl text-center font-medium mb-4">
                  Reset link sent successfully!
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
                  <input 
                    type="text" 
                    placeholder="Email or Phone Number" 
                    required 
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-saffron transition-all"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                  <div className="flex gap-4 mt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowForgot(false)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 py-2.5 rounded-xl bg-saffron text-slate-900 dark:text-white font-bold hover:bg-[#e85a28] transition-all"
                    >
                      Send Code
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
