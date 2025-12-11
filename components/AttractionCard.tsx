import React from 'react';
import { MapPin } from 'lucide-react';
import { Attraction } from '../types';

interface AttractionCardProps {
  attraction: Attraction;
  index: number;
}

const AttractionCard: React.FC<AttractionCardProps> = ({ attraction, index }) => {
  // Simplified prompt for better reliability
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(attraction.name + " landscape photo 8k")}?width=600&height=400&nologo=true&seed=${index}`;

  return (
    <div 
      className="group relative overflow-hidden rounded-2xl glass-card transition-all duration-500 hover:translate-y-[-8px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 hover:border-teal-500/50"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="aspect-[4/3] w-full overflow-hidden relative">
        <img 
          src={imageUrl} 
          alt={attraction.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=600&auto=format&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
        
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
           <span className="text-xs font-bold text-teal-300 tracking-wider shadow-sm">MUST SEE</span>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="flex items-center text-xl font-serif font-bold text-white mb-2 drop-shadow-md">
          <MapPin className="w-4 h-4 mr-2 text-teal-400" />
          {attraction.name}
        </h3>
        <p className="text-sm text-slate-300 line-clamp-2 group-hover:line-clamp-none transition-all duration-300 drop-shadow-md font-medium leading-relaxed">
          {attraction.description}
        </p>
      </div>
    </div>
  );
};

export default AttractionCard;