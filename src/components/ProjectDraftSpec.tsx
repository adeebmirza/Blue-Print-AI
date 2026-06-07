import React, { useState } from 'react';
import { DraftPlan, Project } from '../types';
import { Play, Sparkles, Code, CheckSquare, Plus, Trash, RotateCw, CheckCircle } from 'lucide-react';

interface ProjectDraftSpecProps {
  project: Project;
  onApprove: (additionalPrompt?: string) => void;
  onRegenerate: (guideline?: string) => void;
  isProcessing: boolean;
  theme: 'dark' | 'light';
}

export default function ProjectDraftSpec({ project, onApprove, onRegenerate, isProcessing, theme }: ProjectDraftSpecProps) {
  const plan = project.draftPlan;
  const [additionalGuide, setAdditionalGuide] = useState('');

  if (!plan) return null;

  const handleApprove = () => {
    onApprove(additionalGuide);
  };

  const handleRegen = () => {
    onRegenerate(additionalGuide);
    setAdditionalGuide('');
  };

  const isDark = theme === 'dark';

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Banner */}
      <div className={`p-8 rounded-3xl border mb-6 backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row gap-5 items-center justify-between shadow-2xl
        ${isDark 
          ? 'glass-panel shadow-black/80' 
          : 'bg-white/70 border-indigo-200 shadow-indigo-100/30'}`}
      >
        <div className="space-y-2 flex-1 select-none">
          <div className="inline-flex items-center gap-1.5 text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-3 py-1 rounded-full font-bold font-mono tracking-widest uppercase mb-1">
            <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
            Stage 1: Proposal Draft Specifications
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">{plan.name}</h2>
          <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'} leading-relaxed`}>
            The system parsed the concept and constructed this structural blueprint proposal. Approve this plan to seed formal database schemas, PRDs, task checklist boards, and page blueprints.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Concept specifications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Abstract */}
          <div className={`p-6 rounded-2xl border backdrop-blur-md
            ${isDark ? 'bg-zinc-900/20 border-white/5 shadow-inner' : 'bg-white/40 border-slate-200/50'}`}
          >
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-3.5">Conceptual Abstract</h4>
            <p className={`text-sm leading-relaxed font-normal ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>
              {plan.abstract}
            </p>
          </div>

          {/* Core Features */}
          <div className={`p-6 rounded-2xl border backdrop-blur-md
            ${isDark ? 'bg-zinc-900/20 border-white/5 shadow-inner' : 'bg-white/40 border-slate-200/50'}`}
          >
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-4">Core Feature Catalog</h4>
            <div className="space-y-3.5">
              {plan.coreFeatures.map((feat, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="p-1 px-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg font-mono text-[10px] font-bold h-fit mt-0.5 select-none">
                    {idx + 1}
                  </div>
                  <span className={`text-xs leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tech stack */}
          <div className={`p-6 rounded-2xl border backdrop-blur-md
            ${isDark ? 'bg-zinc-900/20 border-white/5 shadow-inner' : 'bg-white/40 border-slate-200/50'}`}
          >
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-3 flex items-center gap-1.5 select-none">
              <Code className="w-4 h-4 text-indigo-400" />
              Proposed Technology Stack
            </h4>
            <div className={`p-4 rounded-xl text-xs font-mono select-text leading-relaxed border
              ${isDark ? 'bg-slate-950/80 text-indigo-300 border-white/5' : 'bg-slate-100 text-indigo-800 border-slate-200'}`}
            >
              {plan.techStack}
            </div>
          </div>
        </div>

        {/* Form Controls / Refinement Options */}
        <div className="space-y-6">
          <div className={`p-6 rounded-3xl border backdrop-blur-md shadow-2xl sticky top-6
            ${isDark 
              ? 'glass-panel shadow-black/80' 
              : 'bg-white/80 border-slate-200/50 shadow-indigo-100/10'}`}
          >
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-3.5 select-none">Refine & Tailor</h4>
            <textarea
              value={additionalGuide}
              onChange={(e) => setAdditionalGuide(e.target.value)}
              placeholder="e.g. Include mobile notifications schema; add dark-mode support; use supabase integrations..."
              className={`w-full h-24 text-xs px-3.5 py-2.5 rounded-xl border transition-all outline-none resize-none mb-4
                ${isDark 
                  ? 'bg-slate-950/60 border-white/10 text-white focus:border-indigo-500/60' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500/60'}`}
            />

            <div className="space-y-3">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleRegen}
                className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border
                  ${isDark 
                    ? 'border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200' 
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'}
                  ${isProcessing ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                Regenerate Concept Spec
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleApprove}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-wider
                  ${isProcessing
                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-white/5' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 active:scale-[0.98]'}`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Approve & Build Blueprints
              </button>
            </div>
            
            <div className={`mt-5 pt-4 border-t border-slate-700/20 text-[10px] space-y-2 select-none
              ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}
            >
              <div className="flex gap-2">
                <span className="text-emerald-500">✓</span>
                <span>Generates detailed Relational SQL/database</span>
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-500">✓</span>
                <span>Produces deep Product Requirements (PRD)</span>
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-500">✓</span>
                <span>Initializes interactive task checklist log boards</span>
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-500">✓</span>
                <span>Prepares page layouts & Skeletons</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
