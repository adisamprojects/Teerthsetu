import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Auth() {
  const [role, setRole] = useState('devotee');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@divyayatra.in', password: 'password', role })
    }).then(() => {
      // Navigate to correct dashboard based on role
      if(role === 'devotee') navigate('/devotee');
      else navigate('/admin');
    });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="glass-card w-full max-w-md relative z-10 p-8"
      >
        <h2 className="text-3xl font-bold text-center text-darkText mb-2">Welcome to Divya Yatra</h2>
        <p className="text-slate-400 text-center mb-8 text-sm">Select your platform role to continue</p>
        
        {/* Role Selector */}
        <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
          <button 
            className={`flex-1 py-2 rounded-md font-medium text-sm transition-colors ${role === 'devotee' ? 'bg-saffron text-white shadow-md' : 'text-gray-500 hover:text-darkText'}`}
            onClick={() => setRole('devotee')}
          >
            Devotee Portal
          </button>
          <button 
            className={`flex-1 py-2 rounded-md font-medium text-sm transition-colors ${role === 'admin' ? 'bg-saffron text-white shadow-md' : 'text-gray-500 hover:text-darkText'}`}
            onClick={() => setRole('admin')}
          >
            Temple Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="email" placeholder="Email Address" required className="input-field" defaultValue="admin@divyayatra.in" />
          <input type="password" placeholder="Password" required className="input-field" defaultValue="password" />
          
          <button type="submit" className="btn-primary mt-4 w-full">
            {isLogin ? 'Secure Login' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-6 text-sm">
          {isLogin ? "Don't have an account? " : "Already registered? "}
          <span className="text-gold cursor-pointer hover:underline" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Register here' : 'Login here'}
          </span>
        </p>
      </motion.div>
      
      {/* Background Styling */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-saffron/10 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}
