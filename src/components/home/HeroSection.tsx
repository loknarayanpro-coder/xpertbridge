import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/notes');
    }
  };

  return (
    <section className="relative overflow-hidden bg-white pt-10 pb-16 lg:pt-16 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column matching reference */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Tagline category & Auth announcement */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-bold tracking-widest text-[#6366F1] uppercase">
                YOUR COLLEGE STUDY SPACE
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <Link 
                to="/signup" 
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
              >
                <span>Free Student Sign Up</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Headline matching reference */}
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-extrabold text-[#102C4B] tracking-tight leading-[1.12]">
              Your notes. Your pace. <br />
              <span className="text-blue-600">Your future.</span>
            </h1>

            {/* Supporting text */}
            <p className="text-sm sm:text-base text-slate-500 max-w-lg leading-relaxed pt-1">
              Find class notes, unit-wise PDFs and previous year question papers shared by your college community.
            </p>

            {/* Search Field with circular arrow button matching reference */}
            <form onSubmit={handleSearch} className="max-w-xl relative pt-2">
              <div className="relative flex items-center bg-white border border-slate-300 rounded-full shadow-sm hover:border-slate-400 focus-within:border-blue-600 transition p-1">
                <Search className="w-4 h-4 text-slate-400 ml-4 shrink-0 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by subject, subject code or department..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-3 pr-12 py-2.5 sm:py-3 text-xs sm:text-sm bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shrink-0 transition shadow-sm"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Call to Actions matching reference */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to="/notes"
                className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition duration-150"
              >
                <span>Browse Notes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/question-papers"
                className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold text-[#102C4B] bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition duration-150"
              >
                <span>Question Papers</span>
              </Link>

              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-semibold text-blue-700 hover:text-blue-800 transition"
              >
                <span>Sign Up Free →</span>
              </Link>
            </div>

          </div>

          {/* Right Column: Outdoor Campus Students Photography with script badge matching reference */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* Campus students studying on outdoor college steps */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100 aspect-[16/11]">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop&q=85"
                  alt="College students studying notes together outdoors on campus steps"
                  className="w-full h-full object-cover"
                />
                
                {/* Subtle dark gradient overlay on top-right for script legibility */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-black/35" />

                {/* Handwritten script text in top-right corner matching reference image */}
                <div className="absolute top-4 right-5 text-right select-none">
                  <p className="font-serif italic font-bold text-white text-base sm:text-lg leading-tight drop-shadow-md tracking-wide">
                    Better
                  </p>
                  <p className="font-serif italic font-bold text-white text-base sm:text-lg leading-tight drop-shadow-md tracking-wide">
                    Notes
                  </p>
                  <p className="font-serif italic font-bold text-white text-base sm:text-lg leading-tight drop-shadow-md tracking-wide">
                    Brighter
                  </p>
                  <p className="font-serif italic font-bold text-cyan-300 text-base sm:text-lg leading-tight drop-shadow-md tracking-wide">
                    Futures
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
