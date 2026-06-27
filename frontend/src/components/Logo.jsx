import React from 'react';

export default function Logo({ className = '', isDarkMode = false }) {
  // Using the provided CSS logic directly in React inline styles for portability,
  // or via Tailwind arbitrary values where simpler.
  
  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      {/* Top Line */}
      <div 
        className="w-full max-w-[280px] md:max-w-[380px] h-[3px] mb-6"
        style={{
          background: 'linear-gradient(to right, transparent, #ffcf69, #fff3b4, #ffcf69, transparent)',
          boxShadow: '0 0 8px #ffd76b, 0 0 15px rgba(255,180,0,0.5)'
        }}
      />

      {/* Typography Logo */}
      <h1 
        className="m-0 leading-none"
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
          fontWeight: 900,
          letterSpacing: '4px',
          color: '#fff9ef',
          background: 'linear-gradient(180deg, #ffffff 0%, #fff9ee 15%, #ffecc6 35%, #ffd78f 60%, #fff2d8 80%, #ffffff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          WebkitTextStroke: '2px #8d180f',
          textShadow: `
            0 1px 0 #ffd89d,
            0 2px 0 #f4b868,
            0 3px 0 #e78f3c,
            0 4px 0 #c46a1d,
            0 5px 8px rgba(0,0,0,.4),
            0 0 5px #ffdd99,
            0 0 12px rgba(255,185,90,.8),
            0 0 25px rgba(255,120,50,.5)
          `
        }}
      >
        TEERTH<span style={{ WebkitTextFillColor: 'transparent' }}>SETHU</span>
      </h1>

      {/* Bottom Line */}
      <div 
        className="w-full max-w-[280px] md:max-w-[380px] h-[3px] mt-6"
        style={{
          background: 'linear-gradient(to right, transparent, #ffcf69, #fff3b4, #ffcf69, transparent)',
          boxShadow: '0 0 8px #ffd76b, 0 0 15px rgba(255,180,0,0.5)'
        }}
      />
    </div>
  );
}
