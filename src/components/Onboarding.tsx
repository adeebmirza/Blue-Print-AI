import React, { useState } from 'react';
import { Sparkles, Compass, Lightbulb, Map, Heart } from 'lucide-react';

interface OnboardingProps {
  onIdeaSubmit: (idea: string) => void;
  theme: 'dark' | 'light';
}

const POPULAR_IDEAS = [
  {
    title: 'Minimalist habit streak ledger',
    description: 'Tracks daily streaks with flexible custom reminder schedules and charts.',
    icon: Heart,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
  },
  {
    title: 'Smart travel itinerary builder',
    description: 'Relational planner scheduling sightseeing nodes, lodging options, and travel tickets.',
    icon: Map,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  },
  {
    title: 'Freelancer invoice manager',
    description: 'Generates billing sheets from active logged client hours with auto PDF export logic.',
    icon: Lightbulb,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  }
];

export default function Onboarding({ onIdeaSubmit, theme }: OnboardingProps) {
  const [ideaInput, setIdeaInput] = useState('');
  const [isHovered, setIsHovered] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ideaInput.trim()) {
      onIdeaSubmit(ideaInput.trim());
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 transition-all duration-300">
      {/* Visual Header */}
      <div className="text-center mb-10">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4 select-none">
          <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-indigo-200 mb-3">
          Blueprint AI
        </h1>
        <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'} max-w-lg mx-auto leading-relaxed`}>
          Draft comprehensive PRDs, interactive relational schemas, task checklists, page wireframes, and high-fidelity HTML designs from a simple idea.
        </p>
      </div>

      {/* Main Idea Input Form */}
      <form 
        onSubmit={handleSubmit}
        className={`p-8 rounded-3xl border transition-all duration-300 backdrop-blur-md mb-8 shadow-2xl
          ${isDark 
            ? 'glass-panel shadow-black/80' 
            : 'bg-white/70 border-slate-200/50 shadow-indigo-100/40'}`}
      >
        <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-3">
          The Vision
        </label>
        
        <div className="relative mb-6">
          <textarea
            value={ideaInput}
            onChange={(e) => setIdeaInput(e.target.value)}
            placeholder="Describe the application you want to build in absolute detail..."
            className={`w-full h-28 text-lg italic bg-transparent border-none focus:ring-0 resize-none outline-none leading-relaxed
              ${isDark 
                ? 'text-zinc-100 placeholder-zinc-700' 
                : 'text-zinc-800 placeholder-zinc-300'}`}
          />
        </div>

        <button
          type="submit"
          disabled={!ideaInput.trim()}
          className={`w-full py-3.5 px-6 rounded-2xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2.5 transition-all duration-250 cursor-pointer
            ${ideaInput.trim() 
              ? 'bg-indigo-600 hover:bg-indigo-505 text-white shadow-lg shadow-indigo-600/25 active:scale-[0.99]' 
              : 'bg-zinc-800/40 text-zinc-600 cursor-not-allowed border border-white/5'}`}
        >
          <Compass className="w-4 h-4" />
          Create Architectural Blueprint
        </button>
      </form>

      {/* Idea Quickstart Suggestions */}
      <div>
        <h4 className={`text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-5 text-center flex items-center justify-center gap-1.5`}>
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          Or launch instantly with a conceptual template
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {POPULAR_IDEAS.map((idea, idx) => {
            const Icon = idea.icon;
            return (
              <button
                key={idx}
                onClick={() => onIdeaSubmit(idea.title)}
                onMouseEnter={() => setIsHovered(idx)}
                onMouseLeave={() => setIsHovered(null)}
                className={`p-5 rounded-2xl text-left border transition-all duration-300 backdrop-blur-md cursor-pointer flex flex-col justify-between h-44
                  ${isDark 
                    ? 'border-white/5 hover:border-white/10' 
                    : 'border-slate-200/50 hover:border-indigo-400/50'}
                  ${isHovered === idx 
                    ? (isDark ? 'bg-white/10 shadow-xl' : 'bg-white shadow-md shadow-indigo-100') 
                    : (isDark ? 'bg-zinc-900/40' : 'bg-slate-50/20')}`}
              >
                <div className={`p-2 rounded-xl border w-fit ${idea.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="mt-2">
                  <div className={`text-xs font-bold mb-1 ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>{idea.title}</div>
                  <div className="text-[10px] text-zinc-400 line-clamp-3 leading-relaxed">{idea.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
