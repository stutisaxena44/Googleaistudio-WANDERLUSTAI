import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Calendar, ArrowRight, Sun, Wind, DollarSign, Utensils, Shield, Sparkles, Globe, Newspaper, ExternalLink, Calculator, ArrowRightLeft } from 'lucide-react';
import { fetchTravelData, fetchTravelNews } from './services/geminiService';
import { TravelData, CitySuggestion, NewsItem } from './types';
import { POPULAR_DESTINATIONS } from './constants';
import LoadingScreen from './components/LoadingScreen';
import AttractionCard from './components/AttractionCard';
import Itinerary from './components/Itinerary';

// --- Atmosphere Animation Component ---
const Atmosphere: React.FC<{ type: string }> = ({ type }) => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generate static particles on mount to avoid hydration mismatch
    setParticles(Array.from({ length: 30 }).map((_, i) => ({
      left: Math.random() * 100,
      width: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    })));
  }, []);
  
  if (!type) return null;

  let color = 'rgba(255,255,255,0.8)';
  let glow = '0 0 10px rgba(255,255,255,0.5)';
  let animationClass = 'rise'; // Default floating up like fireflies/dust
  
  if (type === 'sakura') {
    color = '#fbcfe8'; // Pink
    glow = '0 0 10px #f472b6';
    animationClass = 'fall';
  }
  if (type === 'snow') {
    color = '#ffffff'; 
    glow = '0 0 8px #e2e8f0';
    animationClass = 'fall';
  }
  if (type === 'forest') {
    color = '#34d399'; // Green fireflies
    glow = '0 0 12px #059669';
    animationClass = 'rise';
  }
  if (type === 'ocean') {
    color = '#38bdf8'; // Blue bubbles
    glow = '0 0 15px #0284c7';
    animationClass = 'rise';
  }
  if (type === 'desert') {
    color = '#fbbf24'; // Dust
    glow = '0 0 5px #d97706';
    animationClass = 'rise';
  }
  if (type === 'city') {
    color = '#a78bfa'; // Purple neon
    glow = '0 0 10px #7c3aed';
    animationClass = 'rise';
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className={`particle ${animationClass}`}
          style={{
            backgroundColor: color,
            boxShadow: glow,
            left: `${p.left}vw`,
            width: `${p.width}px`,
            height: `${p.width}px`, // square/circle
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20 pointer-events-none" />
    </div>
  );
};

// --- Currency Converter Component ---
const CurrencyConverter: React.FC<{ rate: number, currencyCode: string }> = ({ rate, currencyCode }) => {
  const [amount, setAmount] = useState<number>(1000);
  const converted = (amount * rate).toFixed(2);

  return (
    <div className="glass-panel p-6 rounded-2xl border-t-4 border-teal-500 hover:bg-slate-800/80 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg border border-teal-500/20">
          <ArrowRightLeft className="w-6 h-6" />
        </div>
        <div>
           <h3 className="text-slate-100 text-lg font-bold">Currency Converter</h3>
           <p className="text-slate-400 text-xs">1 INR ≈ {rate} {currencyCode}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <label className="text-xs text-slate-400 font-bold ml-1 tracking-wider">INDIAN RUPEE (INR)</label>
          <div className="flex items-center mt-1">
            <span className="absolute left-3 text-slate-400 font-serif">₹</span>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-xl py-2 pl-8 pr-4 focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold placeholder-slate-600"
            />
          </div>
        </div>

        <div className="flex justify-center text-teal-500/50">
          <ArrowRight className="w-4 h-4 rotate-90" />
        </div>

        <div className="relative">
          <label className="text-xs text-slate-400 font-bold ml-1 tracking-wider">{currencyCode}</label>
          <div className="flex items-center mt-1">
            <div className="w-full bg-slate-800 border border-slate-700 text-teal-400 rounded-xl py-2 pl-4 pr-4 font-bold shadow-inner">
               {converted}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [view, setView] = useState<'home' | 'result'>('home');
  const [searchInput, setSearchInput] = useState('');
  const [daysInput, setDaysInput] = useState<number>(5);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [travelData, setTravelData] = useState<TravelData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchInput.length > 0) {
      const filtered = POPULAR_DESTINATIONS.filter(city => 
        city.name.toLowerCase().startsWith(searchInput.toLowerCase()) || 
        city.country.toLowerCase().includes(searchInput.toLowerCase())
      ).slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchInput]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSearch = async () => {
    if (!searchInput) return;
    setLoading(true);
    setTravelData(null);
    setNews([]);
    
    const newsPromise = fetchTravelNews(searchInput);
    
    try {
      const data = await fetchTravelData(searchInput, daysInput);
      setTravelData(data);
      setView('result');
      
      setLoadingNews(true);
      newsPromise.then(newsData => {
        setNews(newsData);
        setLoadingNews(false);
      }).catch(err => {
        console.error("News fetch failed", err);
        setLoadingNews(false);
      });
      
    } catch (error) {
      console.error(error);
      alert("Failed to generate travel plan. Please check your API key or try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectSuggestion = (city: CitySuggestion) => {
    setSearchInput(`${city.name}, ${city.country}`);
    setShowSuggestions(false);
  };

  if (loading) return <LoadingScreen />;

  // --- HOME VIEW ---
  if (view === 'home') {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-950 text-slate-100">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900 z-10 opacity-80"></div>
          <img 
            src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop" 
            alt="Starry Night" 
            className="w-full h-full object-cover animate-[scale-in_60s_ease-out_infinite] opacity-40 mix-blend-overlay"
          />
          
          {/* Glowing Orbs */}
          <div className="absolute top-0 left-0 w-full h-full z-10 overflow-hidden">
             <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[120px] animate-float"></div>
             <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-teal-600/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>

        <div className="relative z-20 w-full max-w-4xl px-6 flex flex-col items-center">
          <div className="text-center mb-12 space-y-6">
            <span className="inline-flex items-center gap-2 py-1.5 px-5 rounded-full bg-white/5 border border-white/10 text-teal-400 text-xs font-bold tracking-[0.3em] uppercase backdrop-blur-md shadow-[0_0_20px_rgba(45,212,191,0.2)] animate-pulse">
              <Globe className="w-3 h-3" /> Explore The Unseen
            </span>
            <h1 className="text-6xl md:text-8xl font-serif font-medium text-white tracking-tight leading-tight drop-shadow-2xl">
              Curate Your <br />
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-violet-400">Next Escape</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-lg mx-auto font-light leading-relaxed">
              AI-powered itineraries designed for the modern explorer. <br/>Where will your curiosity take you tonight?
            </p>
          </div>

          <div className="w-full max-w-xl glass-panel p-2 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row gap-2 bg-slate-900/60 border border-slate-700">
            
            {/* Location Input */}
            <div className="relative flex-grow" ref={wrapperRef}>
              <div className="relative flex items-center h-full group">
                <MapPin className="absolute left-4 w-5 h-5 text-teal-500 group-focus-within:text-teal-400 transition-colors" />
                <input 
                  type="text" 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Where to? (e.g. Tokyo)" 
                  className="w-full bg-transparent hover:bg-slate-800/50 focus:bg-slate-800/80 border-0 text-white rounded-2xl py-4 pl-12 pr-4 focus:ring-0 placeholder-slate-500 transition-all font-medium h-16 outline-none"
                />
              </div>

              {/* Autocomplete */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                  {suggestions.map((city, idx) => (
                    <button 
                      key={idx}
                      onClick={() => selectSuggestion(city)}
                      className="w-full text-left px-5 py-4 hover:bg-slate-800 transition-colors flex items-center justify-between group border-b border-slate-800 last:border-0"
                    >
                      <span className="text-slate-200 font-medium font-serif text-lg group-hover:text-teal-400 transition-colors">{city.name}</span>
                      <span className="text-slate-500 text-xs uppercase tracking-wider">{city.country}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Days Input */}
            <div className="relative md:w-32">
              <div className="relative flex items-center h-full group">
                <Calendar className="absolute left-4 w-5 h-5 text-teal-500 group-focus-within:text-teal-400 transition-colors" />
                <input 
                  type="number" 
                  min="1" 
                  max="30"
                  value={daysInput}
                  onChange={(e) => setDaysInput(parseInt(e.target.value) || 1)}
                  className="w-full bg-transparent hover:bg-slate-800/50 focus:bg-slate-800/80 border-0 text-white rounded-2xl py-4 pl-12 pr-4 focus:ring-0 placeholder-slate-500 transition-all font-medium h-16 outline-none"
                />
              </div>
            </div>

            <button 
              onClick={handleSearch}
              className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold px-8 rounded-2xl shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center h-16 md:w-auto w-full"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
          
          <div className="mt-8 flex gap-6 text-slate-500 text-sm font-medium">
             <span className="hover:text-teal-400 cursor-pointer transition-colors" onClick={() => setSearchInput("Tokyo, Japan")}>Tokyo</span>
             <span className="hover:text-teal-400 cursor-pointer transition-colors" onClick={() => setSearchInput("Reykjavik, Iceland")}>Iceland</span>
             <span className="hover:text-teal-400 cursor-pointer transition-colors" onClick={() => setSearchInput("Bali, Indonesia")}>Bali</span>
             <span className="hover:text-teal-400 cursor-pointer transition-colors" onClick={() => setSearchInput("New York City, USA")}>NYC</span>
          </div>
        </div>
      </div>
    );
  }

  // --- RESULT VIEW ---
  if (!travelData) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20 selection:bg-teal-500/30 font-sans">
      <Atmosphere type={travelData.atmosphere} />
      
      {/* Hero Header */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950 z-10" />
        <div className="absolute inset-0 bg-black/20 z-10" />
        <img 
          src={`https://image.pollinations.ai/prompt/${encodeURIComponent(travelData.location_name + " landscape cinematic 8k")}?width=1920&height=1080&nologo=true&seed=123`} 
          alt={travelData.location_name}
          className="w-full h-full object-cover animate-[scale-in_30s_ease-out_infinite]"
        />
        
        <div className="absolute bottom-0 left-0 right-0 z-20 container mx-auto px-6 pb-20">
           <button 
            onClick={() => setView('home')} 
            className="mb-8 px-5 py-2.5 rounded-full glass-panel text-sm text-slate-200 hover:bg-white/10 transition-colors flex items-center w-fit backdrop-blur-xl border-white/10 bg-black/40 shadow-lg font-bold group"
           >
             <span className="group-hover:-translate-x-1 transition-transform inline-block mr-2">←</span> Plan Another Trip
           </button>
           <h1 className="text-7xl md:text-9xl font-serif font-black text-white mb-4 tracking-tight drop-shadow-2xl">
             {travelData.location_name}
           </h1>
           <div className="flex flex-col md:flex-row md:items-end gap-6">
             <p className="text-3xl md:text-4xl text-teal-400 font-light tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
               {travelData.country}
             </p>
             <p className="text-xl text-slate-300 italic max-w-2xl border-l-2 border-teal-500 pl-6 py-1 mb-1 font-serif drop-shadow-md">
               "{travelData.tagline}"
             </p>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-32 relative z-30">
        
        {/* Intro & Map & Weather Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24">
          
          {/* Introduction Card */}
          <div className="lg:col-span-8 glass-card p-10 rounded-3xl relative overflow-hidden bg-slate-900/80 shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-white/5">
             <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px]"></div>
             <h2 className="text-3xl font-serif font-bold text-slate-100 mb-6 flex items-center">
               The Essence of {travelData.location_name}
             </h2>
             <p className="text-slate-400 leading-8 text-lg font-light">
               {travelData.introduction}
             </p>
             
             <div className="mt-8 pt-8 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                   <h4 className="text-teal-400 text-sm font-bold uppercase tracking-widest mb-2">Best Time</h4>
                   <p className="text-slate-300 font-medium">{travelData.best_time_to_visit}</p>
                </div>
                <div className="sm:col-span-2">
                   <h4 className="text-teal-400 text-sm font-bold uppercase tracking-widest mb-2">Did You Know?</h4>
                   <p className="text-slate-300 text-sm italic">{travelData.fun_facts[0]}</p>
                </div>
             </div>
          </div>

          {/* Weather Widget */}
          <div className="lg:col-span-4 glass-card p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden group hover:border-teal-500/30 transition-all bg-slate-900/80 shadow-2xl border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-50"></div>
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">Current Conditions</span>
                <Sun className="w-8 h-8 text-amber-400 animate-spin-slow drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-6xl font-serif font-bold text-white">{travelData.weather.temperature}</span>
              </div>
              <p className="text-teal-400 text-xl font-medium capitalize mb-6">{travelData.weather.condition}</p>
            </div>
            
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
               <div className="flex items-start gap-3">
                 <Wind className="w-5 h-5 text-slate-400 mt-1" />
                 <p className="text-slate-400 text-sm italic leading-relaxed">
                   "{travelData.weather.advice}"
                 </p>
               </div>
            </div>
          </div>
        </div>

        {/* 3D Map View Section */}
        <div ref={mapRef} className="mb-24">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-serif font-bold text-white">Satellite Exploration</h2>
              <div className="flex items-center gap-2 text-teal-400 text-sm font-bold uppercase tracking-widest animate-pulse">
                <Globe className="w-4 h-4" /> Live View
              </div>
           </div>
           
           <div className="w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-slate-700 relative group">
              {/* Overlay for interaction hint */}
              <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]"></div>
              
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0} 
                src={`https://maps.google.com/maps?q=${encodeURIComponent(travelData.location_name)}&t=k&z=13&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full group-hover:grayscale-0 grayscale-[50%] transition-all duration-700 invert-[0.1]" // invert slightly for dark feel
                title="Satellite Map"
              ></iframe>

              <div className="absolute bottom-6 left-6 z-20 glass-panel px-4 py-2 rounded-full flex items-center gap-2 bg-black/60 border-slate-600">
                 <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                 <span className="text-xs text-slate-200 font-bold tracking-wider">LIVE SATELLITE FEED</span>
              </div>
           </div>
        </div>

        {/* Attractions Section */}
        <div className="mb-24">
          <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-4xl font-serif font-bold text-white mb-2">Curated Highlights</h2>
              <p className="text-slate-400">Top 5 must-visit locations selected for your trip</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {travelData.attractions.map((place, idx) => (
              <AttractionCard key={idx} attraction={place} index={idx} />
            ))}
          </div>
        </div>

        {/* Essentials & Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          
          {/* Currency Card */}
          <CurrencyConverter rate={travelData.essentials.exchange_rate_from_inr} currencyCode={travelData.essentials.currency_code} />

          {/* Safety Card Expanded */}
          <div className="glass-panel p-6 rounded-2xl border-t-4 border-blue-500 hover:bg-slate-800/80 transition-colors md:col-span-2 lg:col-span-3">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-slate-100 text-lg font-bold">Traveler Safety & Tips</h3>
                   <p className="text-slate-400 text-xs">Essential knowledge for a secure trip</p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <h4 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">Safety First</h4>
                   <ul className="space-y-3">
                      {travelData.essentials.safety_tips.map((tip, i) => (
                        <li key={i} className="flex items-start text-sm text-slate-400">
                           <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 mr-2 flex-shrink-0 shadow-[0_0_5px_rgba(248,113,113,0.8)]"></span>
                           {tip}
                        </li>
                      ))}
                   </ul>
                </div>
                <div>
                   <h4 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">Local Etiquette</h4>
                    <ul className="space-y-3">
                      {travelData.essentials.travel_tips.slice(0, 4).map((tip, i) => (
                        <li key={i} className="flex items-start text-sm text-slate-400">
                           <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0 shadow-[0_0_5px_rgba(96,165,250,0.8)]"></span>
                           {tip}
                        </li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>
        </div>

        {/* Local Cuisine Section */}
        <div className="mb-24">
           <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                 <Utensils className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                 <h2 className="text-3xl font-serif font-bold text-white">Local Flavors</h2>
                 <p className="text-slate-400 text-sm">Must-try dishes in {travelData.location_name}</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {travelData.essentials.local_cuisine.map((dish, idx) => (
                 <div key={idx} className="group rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-lg hover:shadow-[0_0_20px_rgba(251,146,60,0.2)] transition-all duration-300">
                    <div className="h-48 overflow-hidden relative">
                       <img 
                          src={`https://image.pollinations.ai/prompt/${encodeURIComponent(dish.name + " delicious food")}?width=400&height=300&nologo=true&seed=${idx+100}`}
                          alt={dish.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => {
                             (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400&auto=format&fit=crop';
                          }}
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60"></div>
                    </div>
                    <div className="p-5 relative">
                       <h3 className="text-lg font-bold text-slate-100 mb-2 font-serif group-hover:text-orange-400 transition-colors">{dish.name}</h3>
                       <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">{dish.description}</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Itinerary Section */}
        <div className="mb-24 relative">
          <div className="text-center mb-16">
            <span className="text-teal-400 font-bold tracking-widest uppercase text-sm mb-4 block">Day by Day</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Your Journey Map</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg font-light">
              We've organized your {daysInput} days to maximize discovery and minimize stress.
            </p>
          </div>
          <Itinerary days={travelData.itinerary} />
        </div>

        {/* Latest News Section */}
        <div className="mb-16 border-t border-slate-800 pt-16">
           <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                 <Newspaper className="w-6 h-6 text-red-400" />
              </div>
              <div>
                 <h2 className="text-3xl font-serif font-bold text-white">Latest from {travelData.location_name}</h2>
                 <p className="text-slate-400 text-sm">Top 10 Headlines & Events</p>
              </div>
           </div>

           {loadingNews ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-32 bg-slate-800 rounded-xl animate-pulse"></div>
                ))}
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {news.map((item, idx) => (
                  <div key={idx} className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:shadow-[0_0_15px_rgba(20,184,166,0.1)] transition-all flex flex-col justify-between group hover:border-teal-500/30">
                     <div>
                       <div className="flex justify-between items-start mb-3">
                          <h3 className="text-slate-200 font-bold group-hover:text-teal-400 transition-colors line-clamp-2">{item.headline}</h3>
                          {item.date && <span className="text-xs text-slate-500 whitespace-nowrap ml-2">{item.date}</span>}
                       </div>
                       <p className="text-slate-400 text-sm line-clamp-2">{item.summary}</p>
                     </div>
                     <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end">
                        <span className="text-xs text-slate-500 flex items-center group-hover:text-teal-400 transition-colors font-bold cursor-pointer">
                           Read more <ExternalLink className="w-3 h-3 ml-1" />
                        </span>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="text-center pt-12 border-t border-slate-800 pb-8">
          <p className="text-slate-500 text-sm flex items-center justify-center">
            <Sparkles className="w-4 h-4 mr-2 text-teal-600" />
            Generated with Gemini 2.5 Flash • Wanderlust AI
          </p>
        </div>

      </div>
    </div>
  );
}

export default App;