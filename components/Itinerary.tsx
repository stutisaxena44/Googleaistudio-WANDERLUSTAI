import React from 'react';
import { DayPlan } from '../types';
import { ArrowDown } from 'lucide-react';

interface ItineraryProps {
  days: DayPlan[];
}

const Itinerary: React.FC<ItineraryProps> = ({ days }) => {
  return (
    <div className="relative space-y-12 pl-4 sm:pl-0">
      {/* Central Line */}
      <div className="absolute left-8 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-500 via-violet-500 to-transparent transform sm:-translate-x-1/2 opacity-30 shadow-[0_0_10px_rgba(45,212,191,0.3)]" />
      
      {days.map((day, index) => (
        <div key={day.day} className={`relative flex flex-col sm:flex-row items-center ${index % 2 === 0 ? 'sm:flex-row-reverse' : ''} gap-8 group`}>
          
          {/* Timeline Dot */}
          <div className="absolute left-8 sm:left-1/2 w-8 h-8 bg-slate-900 border-2 border-teal-500 rounded-full transform -translate-x-[15px] sm:-translate-x-1/2 z-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(45,212,191,0.6)]">
             <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
          </div>

          {/* Content Card */}
          <div className="ml-16 sm:ml-0 w-full sm:w-[calc(50%-3rem)] hover:z-20">
            <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-teal-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(45,212,191,0.1)] bg-slate-900/60">
              <div className="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-4">
                <span className="text-teal-400 font-serif text-2xl font-bold drop-shadow-sm">
                  Day {day.day}
                </span>
                <span className="text-violet-300 text-xs uppercase tracking-widest font-bold bg-violet-500/10 px-3 py-1 rounded border border-violet-500/20">
                  {day.title}
                </span>
              </div>
              
              <ul className="space-y-4">
                {day.activities.map((activity, actIndex) => (
                  <li key={actIndex} className="flex items-start text-slate-300 text-sm group/item">
                    <span className="mr-3 mt-1.5 w-1.5 h-1.5 bg-teal-500 rounded-full group-hover/item:bg-violet-400 transition-colors shadow-[0_0_5px_rgba(20,184,166,0.8)]"></span>
                    <span className="leading-relaxed font-light tracking-wide">{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Spacer */}
          <div className="hidden sm:block sm:w-[calc(50%-3rem)]" />
        </div>
      ))}
      
      {/* End Node */}
      <div className="absolute left-8 sm:left-1/2 bottom-0 transform -translate-x-[11px] sm:-translate-x-1/2 translate-y-full pb-4">
        <ArrowDown className="text-teal-500/50 w-6 h-6 animate-bounce" />
      </div>
    </div>
  );
};

export default Itinerary;