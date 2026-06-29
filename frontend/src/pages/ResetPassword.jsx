import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordRules = [
    { label: '8 to 20 characters', valid: password.length >= 8 && password.length <= 20 },
    { label: 'Uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'Number (0-9)', valid: /[0-9]/.test(password) },
    { label: 'Special character', valid: /[^A-Za-z0-9\s]/.test(password) && password.length > 0 },
    { label: 'No spaces', valid: !/\s/.test(password) && password.length > 0 }
  ];
  const isPasswordValid = passwordRules.every(rule => rule.valid);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg("Invalid or missing reset token.");
      return;
    }
    if (!isPasswordValid) {
      setErrorMsg("Please ensure your password meets all requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com';
    
    fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword: password })
    })
    .then(async res => {
      const text = await res.text();
      try {
        return { status: res.status, data: JSON.parse(text) };
      } catch {
        throw new Error(`Status ${res.status} | Non-JSON response: ${text.substring(0, 100)}`);
      }
    })
    .then(({ status, data }) => {
      if (status === 200 && data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/auth'), 3000);
      } else {
        setErrorMsg(data.message || 'Failed to reset password');
      }
    })
    .catch(err => setErrorMsg('Network error: ' + err.message));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#1A1A2E] text-slate-900 dark:text-white flex items-center justify-center p-6 relative transition-colors duration-300 overflow-hidden">
      <Link
        to="/auth"
        className="absolute top-6 left-6 p-2.5 rounded-full border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/40 backdrop-blur-md hover:bg-white/80 dark:hover:bg-white/10 transition-all z-50 text-slate-600 dark:text-slate-300 shadow-sm hover:scale-105"
        aria-label="Back to login"
      >
        <X className="h-5 w-5" />
      </Link>

      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-saffron/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-gold/10 rounded-full blur-[130px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black font-serif text-red-900 dark:text-white mb-2">Reset Password</h2>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Enter your new password below</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-center font-medium shadow-sm">
            {errorMsg}
          </div>
        )}

        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-6 rounded-xl text-center font-bold mb-4 shadow-sm">
            Password updated successfully! Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="relative">
              <Lock className="absolute z-10 left-4 top-3.5 h-5 w-5 text-slate-600 dark:text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                required
                className="w-full bg-white/80 dark:bg-white/30 backdrop-blur-md border border-slate-300 dark:border-white/30 rounded-xl pl-12 pr-12 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {password && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-xl p-4 border border-slate-200 dark:border-white/10 text-xs shadow-sm overflow-hidden"
              >
                <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2 font-serif">Password Requirements:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {passwordRules.map((rule, idx) => (
                    <div key={idx} className={`flex items-center gap-1.5 font-medium transition-colors duration-300 ${rule.valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      <span className="text-base leading-none">{rule.valid ? '✓' : '○'}</span>
                      <span>{rule.label}</span>
                    </div>
                  ))}
                  <div className={`flex items-center gap-1.5 font-medium transition-colors duration-300 ${confirmPassword && password === confirmPassword ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    <span className="text-base leading-none">{confirmPassword && password === confirmPassword ? '✓' : '○'}</span>
                    <span>Passwords match</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="relative">
              <Lock className="absolute z-10 left-4 top-3.5 h-5 w-5 text-slate-600 dark:text-slate-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                required
                className="w-full bg-white/80 dark:bg-white/30 backdrop-blur-md border border-slate-300 dark:border-white/30 rounded-xl pl-12 pr-12 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-saffron hover:bg-[#e85a28] text-white font-bold text-lg mt-4 shadow-lg shadow-saffron/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              Update Password
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
