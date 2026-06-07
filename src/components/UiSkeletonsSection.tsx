import React, { useState } from 'react';
import { Project, UISkeleton } from '../types';
import { Sparkles, Monitor, Layers, Eye, RefreshCw, Layers3, PlayCircle } from 'lucide-react';

interface UiSkeletonsSectionProps {
  project: Project;
  onGenerateMockup: (skeleton: UISkeleton) => void;
  isGeneratingMockup: string | null; // active skeleton ID generating a mockup design
  theme: 'dark' | 'light';
}

export default function UiSkeletonsSection({ project, onGenerateMockup, isGeneratingMockup, theme }: UiSkeletonsSectionProps) {
  const skeletons = project.uiSkeletons || [];
  const designs = project.uiDesigns || [];
  const isDark = theme === 'dark';

  return (
    <div className="space-y-6">
      {/* Header Info Panel */}
      <div className={`p-4 rounded-2xl border backdrop-blur-md flex flex-wrap gap-4 items-center justify-between shadow-sm
        ${isDark ? 'bg-zinc-950/40 border-white/5' : 'bg-white/60 border-slate-200'}`}
      >
        <div className="space-y-0.5 select-none">
          <div className="text-[9px] uppercase font-bold tracking-[0.15em] text-zinc-500">Stage 3: UI Wireframes & Layout Skeletons</div>
          <h4 className="text-xs font-bold uppercase tracking-[0.1em] text-white flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-400" />
            Page Draft Blueprints
          </h4>
        </div>
        <div className="text-[10px] text-zinc-400 font-mono text-right select-none">
          Total Layouts: <span className="text-indigo-400 font-bold">{skeletons.length} Skeletons</span> • Styled mockups: <span className="text-emerald-400 font-bold">{designs.length} Mockups</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skeletons.map((skel, sIdx) => {
          // Check if a mockup design already exists for this page skeleton
          const matchedDesign = designs.find(d => d.pageName.toLowerCase().trim() === skel.pageName.toLowerCase().trim());
          const isProcessing = isGeneratingMockup === skel.id;

          return (
            <div 
              key={skel.id || sIdx}
              className={`p-6 rounded-3xl border backdrop-blur-md space-y-5 flex flex-col justify-between shadow-xl transition-all duration-300
                ${isDark 
                  ? 'glass-panel hover:border-white/10 shadow-black/80' 
                  : 'bg-white border-slate-200 hover:border-indigo-200 shadow-indigo-100/10'}`}
            >
              <div className="space-y-4">
                {/* Header title */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <Monitor className="w-4 h-4 text-indigo-400" />
                    <h5 className={`text-xs font-bold uppercase tracking-wide ${isDark ? 'text-zinc-100' : 'text-slate-800'}`}>{skel.pageName}</h5>
                  </div>
                  <span className={`text-[8px] font-bold font-mono border px-2 py-0.5 rounded-full select-none
                    ${matchedDesign 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/25'}`}
                  >
                    {matchedDesign ? 'MOCKUP LIVE' : 'STAGED WIRE'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-400 leading-relaxed select-text">
                  {skel.description}
                </p>

                {/* Layout details */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500 select-none">Grid / Layout Structure</span>
                  <div className={`p-3 rounded-xl text-xs font-mono leading-relaxed border select-text
                    ${isDark ? 'bg-slate-950/40 text-indigo-300 border-white/5' : 'bg-slate-50 text-indigo-800 border-slate-200'}`}
                  >
                    {skel.layoutStructure}
                  </div>
                </div>

                {/* UI components list */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500 flex items-center gap-1 select-none">
                    <Layers3 className="w-3.5 h-3.5" />
                    Atomic UI Elements list
                  </span>
                  
                  <div className="flex flex-wrap gap-1.5 select-text">
                    {skel.components.map((comp, cIdx) => (
                      <span 
                        key={cIdx}
                        className={`text-[9px] px-2 py-1 rounded-lg font-mono border font-medium
                          ${isDark ? 'bg-slate-950/40 text-slate-300 border-white/5' : 'bg-slate-100 text-slate-700 border-slate-200 shadow-sm'}`}
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interaction Call to Action */}
              <div className="pt-4 border-t border-white/5 mt-2">
                <button
                  type="button"
                  onClick={() => onGenerateMockup(skel)}
                  disabled={!!isGeneratingMockup}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all duration-250 flex items-center justify-center gap-1.5 cursor-pointer border uppercase tracking-wider
                    ${matchedDesign 
                      ? 'bg-transparent border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 hover:text-emerald-350' 
                      : 'bg-indigo-600 border-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/15'}
                    ${isProcessing ? 'bg-slate-950 text-slate-400 animate-pulse border-none' : ''}
                    ${!!isGeneratingMockup && !isProcessing ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Styling mockup layout...
                    </>
                  ) : matchedDesign ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      Re-generate Design Canvas
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Build High-Fi Design HTML
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {skeletons.length === 0 && (
          <div className="text-center py-12 text-xs text-slate-500 font-mono select-none col-span-3">No page wireframes drafted yet.</div>
        )}
      </div>
    </div>
  );
}
