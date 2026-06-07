import React, { useState } from 'react';
import { Settings } from '../types';
import { getSettings, saveSettings } from '../lib/storage';
import { X, Key, Globe, Cpu, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import minimaxLogo from '/assets/minimax.png';
import { OpenAI } from 'openai';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChanged: () => void;
  theme: 'dark' | 'light';
}

export default function SettingsModal({ isOpen, onClose, onSettingsChanged, theme }: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>(getSettings());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    saveSettings(settings);
    onSettingsChanged();
    onClose();
  };

  const handleTestConnection = async () => {
    if (!settings.openaiApiKey) {
      setTestResult({ success: false, message: 'Please enter an API Key first.' });
      return;
    }
    
    setIsTesting(true);
    setTestResult(null);

    try {
      const openai = new OpenAI({
        apiKey: settings.openaiApiKey,
        baseURL: settings.openaiBaseUrl ? settings.openaiBaseUrl.trim() : 'https://api.minimax.io/v1/text/chatcompletion_v2',
        dangerouslyAllowBrowser: true,
      });

      // Simple brief test chat completion
      const response = await openai.chat.completions.create({
        model: settings.openaiModel || 'Minimax-M3',
        messages: [{ role: 'user', content: 'respond with ok' }],
        max_tokens: 10,
      });

      if (response.choices[0]?.message?.content) {
        setTestResult({
          success: true,
          message: `Successfully connected to endpoint! Model responded: "${response.choices[0].message.content.trim()}"`,
        });
      } else {
        setTestResult({
          success: true,
          message: 'Connected, but received empty response.',
        });
      }
    } catch (err: any) {
      console.error(err);
      setTestResult({
        success: false,
        message: err?.message || 'Connection failed. Verify API Key and Endpoint URL.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div 
        className={`relative w-full max-w-lg overflow-hidden rounded-2xl p-6 shadow-2xl transition-all duration-300 transform scale-100 border
          ${isDark 
            ? 'bg-slate-900/90 text-slate-100 border-white/10 shadow-black/80' 
            : 'bg-white/95 text-slate-900 border-slate-200 shadow-xl'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 border-b pb-3 border-slate-700/20">
          <div className="flex items-center space-x-2">
            <img src={minimaxLogo} alt="Minimax" className="w-6 h-6 object-contain" />
            <h3 className="text-lg font-bold tracking-tight">Minimax Model Configuration</h3>
          </div>
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors 
              ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info label banner */}
        <div className="mb-4 text-xs p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400 flex items-start gap-2">
          <RefreshCw className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            Connect OpenAI, OpenRouter, DeepSeek, or any other compatible provider. Your secrets are preserved carefully on your local browser.
          </span>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              OpenAI-Compatible Base URL
            </label>
            <input 
              type="text"
              value={settings.openaiBaseUrl}
              onChange={(e) => setSettings({ ...settings, openaiBaseUrl: e.target.value })}
              placeholder="https://api.minimax.io/v1/text/chatcompletion_v2"
              className={`w-full text-sm px-3.5 py-2 rounded-xl transition-all border outline-none
                ${isDark 
                  ? 'bg-slate-950/60 border-white/10 text-white focus:border-indigo-500/60 focus:bg-slate-950' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500/60 focus:bg-white'}`}
            />
            <p className="text-[10px] text-slate-500 mt-1">Minimax OpenAI-compatible endpoint URL.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              API Secret Key
            </label>
            <input 
              type="password"
              value={settings.openaiApiKey}
              onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
              placeholder={isDark ? "••••••••••••••••••••" : "paste your AI provider key"}
              className={`w-full text-sm px-3.5 py-2 rounded-xl transition-all border outline-none
                ${isDark 
                  ? 'bg-slate-950/60 border-white/10 text-white focus:border-indigo-500/60 focus:bg-slate-950' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500/60 focus:bg-white'}`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              Target Model ID
            </label>
            <select
              value={settings.openaiModel}
              onChange={(e) => setSettings({ ...settings, openaiModel: e.target.value })}
              className={`w-full text-sm px-3.5 py-2 rounded-xl transition-all border outline-none
                ${isDark 
                  ? 'bg-slate-950/60 border-white/10 text-white focus:border-indigo-500/60 focus:bg-slate-950' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500/60 focus:bg-white'}`}
            >
              <option value="Minimax-M3">Minimax-M3</option>
              <option value="Minimax-M2.7">Minimax-M2.7</option>
              <option value="MiniMax-M2.7-highspeed">MiniMax-M2.7-highspeed</option>
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              Available models: <span className="font-mono text-indigo-400">Minimax-M3</span>, <span className="font-mono text-indigo-400">Minimax-M2.7</span>, <span className="font-mono text-indigo-400">MiniMax-M2.7-highspeed</span>.
            </p>
          </div>
        </div>

        {/* Diagnosis Result */}
        {testResult && (
          <div className={`mt-4 p-3 rounded-xl border text-xs flex gap-2 items-start
            ${testResult.success 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}
          >
            {testResult.success ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Actions Layout */}
        <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-700/20">
          <button
            type="button"
            disabled={isTesting}
            onClick={handleTestConnection}
            className={`text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 border transition-all
              ${isDark 
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' 
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'} 
              ${isTesting ? 'opacity-55 cursor-not-allowed' : ''}`}
          >
            {isTesting ? 'Testing connection...' : 'Validate Endpoint'}
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all
                ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="text-xs font-semibold px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg transition-all shadow-indigo-600/15"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
