import React, { useState, useEffect, useRef } from 'react';
import { Project, UIDesign } from '../types';
import { 
  Eye, Code2, Clipboard, Check, Download, 
  Smartphone, Tablet, Monitor, RefreshCw, Layers 
} from 'lucide-react';

interface UiDesignsSectionProps {
  project: Project;
  onSaveDesigns: (designs: UIDesign[]) => void;
  theme: 'dark' | 'light';
}

export default function UiDesignsSection({ project, onSaveDesigns, theme }: UiDesignsSectionProps) {
  const designs = project.uiDesigns || [];
  const [selectedDesignId, setSelectedDesignId] = useState<string>(designs[0]?.id || '');

  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [viewportSize, setViewportSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);

  // Keep a copy of editable code locally so typing doesn't stutter on state rebuilds
  const [localHtml, setLocalHtml] = useState('');
  
  const currentDesign = designs.find(d => d.id === selectedDesignId);

  useEffect(() => {
    if (currentDesign) {
      setLocalHtml(currentDesign.htmlCode || '');
    } else if (designs.length > 0) {
      setSelectedDesignId(designs[0].id);
      setLocalHtml(designs[0].htmlCode || '');
    }
  }, [selectedDesignId, project.uiDesigns]);

  const handleCopy = () => {
    navigator.clipboard.writeText(localHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `${(currentDesign?.pageName || 'page').toLowerCase().replace(/\s+/g, '_')}_design.html`;
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentDesign?.pageName || 'App Blueprint Design'}</title>
  <!-- Tailwind CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 p-6 min-h-screen text-slate-100 font-sans">
  ${localHtml}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Sync edits to master project state
  const handleHtmlEdit = (newCode: string) => {
    setLocalHtml(newCode);
    const updated = designs.map(d => d.id === selectedDesignId ? { ...d, htmlCode: newCode } : d);
    onSaveDesigns(updated);
  };

  const isDark = theme === 'dark';

  // Construct iframe document that auto-injects Tailwind CDN to compile generated layouts in isolated sandbox
  const getIframeSrcDoc = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {}
      }
    }
  </script>
  <style>
    /* Styling custom glassmorphism handles */
    .glassmorphism {
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    body::-webkit-scrollbar {
      width: 6px;
    }
    body::-webkit-scrollbar-track {
      background: transparent;
    }
    body::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
  </style>
</head>
<body class="p-6 h-full transition-all duration-300 ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}">
  <!-- Render visual container elements -->
  ${localHtml}
</body>
</html>`;
  };

  const viewportWidths = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]'
  };

  return (
    <div className="space-y-4">
      {/* Top Controller Ribbon */}
      <div className={`p-4 rounded-2xl border backdrop-blur-md flex flex-wrap gap-4 items-center justify-between shadow-sm
        ${isDark ? 'bg-zinc-950/40 border-white/5' : 'bg-white/60 border-slate-200'}`}
      >
        {/* Design Select Dropdown */}
        <div className="flex items-center space-x-3 select-none">
          <Layers className="w-4 h-4 text-indigo-400 font-bold" />
          <select
            value={selectedDesignId}
            onChange={(e) => setSelectedDesignId(e.target.value)}
            className={`text-xs font-bold rounded-xl border outline-none px-3.5 py-2 cursor-pointer max-w-[240px] transition-all
              ${isDark ? 'bg-zinc-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
          >
            {designs.map(d => (
              <option key={d.id} value={d.id}>{d.pageName}</option>
            ))}
          </select>
        </div>

        {/* Workspace Display Mode (Visual / Code) */}
        <div className="flex items-center space-x-1 border border-white/5 p-1 rounded-2xl bg-zinc-950/25">
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5
              ${activeTab === 'preview' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : (isDark ? 'text-zinc-500 hover:text-zinc-350' : 'text-slate-500 hover:text-slate-900')}`}
          >
            <Eye className="w-3.5 h-3.5" />
            Visual Preview
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5
              ${activeTab === 'code' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : (isDark ? 'text-zinc-500 hover:text-zinc-355' : 'text-slate-500 hover:text-slate-900')}`}
          >
            <Code2 className="w-3.5 h-3.5" />
            HTML Source
          </button>
        </div>

        {/* Size adjustment (Only displays when in visual preview tab) */}
        {activeTab === 'preview' && (
          <div className="flex items-center space-x-1 border border-white/5 p-1 rounded-2xl bg-zinc-950/25">
            <button
              type="button"
              onClick={() => setViewportSize('mobile')}
              title="Mobile phone simulation"
              className={`p-2 rounded-xl cursor-pointer transition-all
                ${viewportSize === 'mobile' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewportSize('tablet')}
              title="Tablet device simulation"
              className={`p-2 rounded-xl cursor-pointer transition-all
                ${viewportSize === 'tablet' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewportSize('desktop')}
              title="Desktop width responsive"
              className={`p-2 rounded-xl cursor-pointer transition-all
                ${viewportSize === 'desktop' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Action clips */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className={`p-2.5 px-3.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all flex items-center gap-1.5
              ${isDark 
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300' 
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'}`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
            {copied ? 'Copied HTML!' : 'Copy'}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className={`p-2.5 px-3.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all flex items-center gap-1.5
              ${isDark 
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300' 
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'}`}
          >
            <Download className="w-3.5 h-3.5" />
            Export Page
          </button>
        </div>
      </div>

      {designs.length === 0 ? (
        <div className="text-center py-24 text-xs font-mono text-zinc-500">
          No HTML mockup designs have been shaped for this project yet. Go to Wireframe Skeletons to generate a high-fidelity rendering!
        </div>
      ) : (
        <div className="space-y-4">
          {/* Main Rendering Canvas Shell */}
          {activeTab === 'preview' ? (
            <div className="flex flex-col items-center w-full">
              <div 
                className={`border border-zinc-700/20 rounded-3xl overflow-hidden transition-all duration-300 h-[520px] bg-zinc-950/20 shadow-2xl backdrop-blur-md pb-1 flex flex-col
                  ${viewportWidths[viewportSize]}`}
              >
                {/* Browser Title-bar lookalike */}
                <div className="bg-zinc-950/80 py-4 px-6 border-b border-white/5 flex items-center justify-between select-none">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                  </div>
                  
                  <div className="bg-zinc-900 border border-white/5 px-8 py-1 rounded-lg text-[9px] font-mono font-bold text-zinc-400 tracking-widest text-center uppercase">
                    {currentDesign?.pageName || 'App Canvas sandbox'}
                  </div>

                  <span className="text-[10px] text-zinc-600 font-mono font-semibold">localhost:3000</span>
                </div>

                {/* Sandbox iframe render */}
                <iframe
                  title="Layout Sandbox Frame"
                  srcDoc={getIframeSrcDoc()}
                  className="w-full flex-1 border-none bg-transparent"
                  sandbox="allow-scripts"
                />
              </div>

              {viewportSize !== 'desktop' && (
                <div className="text-[9px] font-mono text-zinc-500 mt-2 select-none">
                  Showing simulation viewport width of {viewportSize === 'tablet' ? '768px' : '375px'}. Scroll inside device card frame.
                </div>
              )}
            </div>
          ) : (
            // Raw HTML editor console
            <div className={`p-6 rounded-3xl border shadow-inner relative
              ${isDark ? 'glass-panel border-white/5' : 'bg-slate-100 border-slate-200'}`}
            >
              <h5 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-2 select-none">Live HTML editor Console</h5>
              <p className="text-[10px] text-zinc-400 mb-4 select-none">Change markup text, elements, stats or margins, and click back onto "Visual Preview" to see updates instantly!</p>
              
              <textarea
                value={localHtml}
                onChange={(e) => handleHtmlEdit(e.target.value)}
                className={`w-full h-[450px] font-mono text-xs p-5 rounded-2xl border outline-none leading-relaxed resize-y
                  ${isDark 
                    ? 'bg-slate-950/80 border-white/10 text-emerald-450 focus:border-indigo-500/40' 
                    : 'bg-white border-slate-200 text-indigo-900 focus:border-indigo-500/40'}`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
