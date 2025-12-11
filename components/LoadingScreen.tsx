import React, { useState, useEffect } from 'react';
import { Plane, Compass } from 'lucide-react';
import { LOADING_TIPS } from '../constants';

const LoadingScreen: React.FC = () => {
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-slate-100 overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-lg px-6 text-center">
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-teal-500 blur-3xl opacity-20 animate-pulse rounded-full"></div>
          <Plane className="w-24 h-24 text-teal-400 animate-bounce relative z-10 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
        </div>
        
        <h2 className="text-4xl font-serif font-bold tracking-wider mb-2 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-violet-400 animate-pulse">
          DESIGNING YOUR JOURNEY
        </h2>
        
        <div className="h-40 flex items-center justify-center mt-8 w-full">
          <div className="glass-panel p-8 rounded-2xl animate-[fadeIn_0.5s_ease-in-out] w-full border border-slate-700/50">
            <p className="text-teal-400 text-xs uppercase font-bold tracking-[0.2em] mb-4 flex items-center justify-center">
              <Compass className="w-4 h-4 mr-2" />
              Travel Tip #{currentTip + 1}
            </p>
            <p className="text-xl text-slate-200 font-medium italic transition-all duration-500 font-serif leading-relaxed">
              "{LOADING_TIPS[currentTip]}"
            </p>
          </div>
        </div>
        
        <div className="mt-16 flex space-x-4">
          <div className="w-3 h-3 bg-violet-500 rounded-full animate-ping"></div>
          <div className="w-3 h-3 bg-teal-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;