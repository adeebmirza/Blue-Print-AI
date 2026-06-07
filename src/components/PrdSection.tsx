import React, { useState } from 'react';
import { FileText, Edit3, Clipboard, Check, Download, Save } from 'lucide-react';

interface PrdSectionProps {
  prdContent: string;
  onSavePrd: (newPrd: string) => void;
  theme: 'dark' | 'light';
}

export default function PrdSection({ prdContent, onSavePrd, theme }: PrdSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrd, setEditedPrd] = useState(prdContent);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedPrd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([editedPrd], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PRODUCT_REQUIREMENTS_DOCUMENT.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    onSavePrd(editedPrd);
    setIsEditing(false);
  };

  const isDark = theme === 'dark';

  return (
    <div className="space-y-4">
      {/* Configuration Header Bar */}
      <div className={`p-4 rounded-2xl border backdrop-blur-md flex flex-wrap gap-4 items-center justify-between shadow-sm
        ${isDark ? 'bg-zinc-950/40 border-white/5' : 'bg-white/60 border-slate-200'}`}
      >
        <div className="flex items-center space-x-2.5">
          <FileText className="w-4 h-4 text-indigo-400 font-bold" />
          <h4 className="text-xs font-bold uppercase tracking-[0.12em]">Product Requirements Document (PRD)</h4>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`p-2.5 px-3.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all flex items-center gap-1.5
              ${isDark 
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300' 
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'}`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>

          <button
            onClick={handleDownload}
            className={`p-2.5 px-3.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all flex items-center gap-1.5
              ${isDark 
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300' 
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'}`}
          >
            <Download className="w-3.5 h-3.5" />
            Download .md
          </button>

          <button
            type="button"
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setEditedPrd(prdContent);
                setIsEditing(true);
              }
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/15 flex items-center gap-1.5 cursor-pointer"
          >
            {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            {isEditing ? 'Save Markdown' : 'Edit PRD'}
          </button>
        </div>
      </div>

      {/* Main Document Content */}
      <div className={`p-8 rounded-3xl border min-h-[500px] shadow-2xl relative
        ${isDark 
          ? 'glass-panel shadow-black/80' 
          : 'bg-white border-slate-200 shadow-indigo-50/10'}`}
      >
        {isEditing ? (
          <textarea
            value={editedPrd}
            onChange={(e) => setEditedPrd(e.target.value)}
            className={`w-full min-h-[460px] text-xs font-mono p-4 rounded-xl border outline-none leading-relaxed resize-y
              ${isDark 
                ? 'bg-slate-950/60 border-white/10 text-slate-100 focus:border-indigo-500/50' 
                : 'bg-slate-100 border-slate-200 text-slate-900 focus:border-indigo-500/50'}`}
          />
        ) : (
          <div className="prose prose-zinc max-w-none text-xs leading-relaxed font-sans space-y-4 text-zinc-300 p-2 select-text">
            {prdContent ? (
              // Simple parser rendering titles, lists, and line-breaks elegantly for rich visual feedback
              prdContent.split('\n').map((line, idx) => {
                const trimmed = line.trim();
                if (trimmed.startsWith('# ')) {
                  return <h1 key={idx} className="text-xl font-extrabold tracking-tight pb-2 border-b border-white/5 text-white mt-6 mb-2">{trimmed.substring(2)}</h1>;
                }
                if (trimmed.startsWith('## ')) {
                  return <h2 key={idx} className="text-base font-bold tracking-tight text-white mt-5 mb-2">{trimmed.substring(3)}</h2>;
                }
                if (trimmed.startsWith('### ')) {
                  return <h3 key={idx} className="text-sm font-semibold tracking-tight text-zinc-100 mt-4 mb-2">{trimmed.substring(4)}</h3>;
                }
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                  return <li key={idx} className="ml-4 pl-1 list-disc text-zinc-300 mb-1">{trimmed.substring(2)}</li>;
                }
                if (trimmed.match(/^\d+\.\s/)) {
                  // Numbered list
                  return <li key={idx} className="ml-4 pl-1 list-decimal text-zinc-300 mb-1">{trimmed.substring(trimmed.indexOf('.') + 1).trim()}</li>;
                }
                if (trimmed === '') {
                  return <div key={idx} className="h-2" />;
                }
                return <p key={idx} className="text-zinc-300 leading-relaxed mb-2">{line}</p>;
              })
            ) : (
              <div className="text-center text-slate-500 py-12">No PRD has been generated yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
