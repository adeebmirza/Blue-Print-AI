import React, { useState } from 'react';
import { Database, Clipboard, Check, Download, Table, Edit3, Save } from 'lucide-react';

interface DbSchemaSectionProps {
  dbSchema: string;
  onSaveSchema: (newSchema: string) => void;
  theme: 'dark' | 'light';
}

export default function DbSchemaSection({ dbSchema, onSaveSchema, theme }: DbSchemaSectionProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSchema, setEditedSchema] = useState(dbSchema);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([editedSchema], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DATABASE_SCHEMA.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    onSaveSchema(editedSchema);
    setIsEditing(false);
  };

  // Parse SQL to render brief visual tables
  const parseTablesFromSql = (sql: string) => {
    const tables: { name: string; columns: string[] }[] = [];
    const createTableRegex = /CREATE\s+TABLE\s+(\w+)\s*\(([\s\S]*?)\);/gi;
    let match;
    
    while ((match = createTableRegex.exec(sql)) !== null) {
      const tableName = match[1];
      const columnContent = match[2];
      const columns = columnContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('--') && !line.startsWith('PRIMARY KEY') && !line.startsWith('CONSTRAINT') && !line.startsWith('FOREIGN KEY'))
        .map(line => {
          // Keep first parts
          const parts = line.split(/\s+/);
          if (parts.length > 1) {
            return `${parts[0]} (${parts[1].replace(/,$/, '')})`;
          }
          return line.replace(/,$/, '');
        });

      tables.push({ name: tableName, columns });
    }
    return tables;
  };

  const visualTables = parseTablesFromSql(editedSchema);
  const isDark = theme === 'dark';

  return (
    <div className="space-y-4">
      {/* Configuration Header Bar */}
      <div className={`p-4 rounded-2xl border backdrop-blur-md flex flex-wrap gap-4 items-center justify-between shadow-sm
        ${isDark ? 'bg-zinc-950/40 border-white/5' : 'bg-white/60 border-slate-200'}`}
      >
        <div className="flex items-center space-x-2.5">
          <Database className="w-4 h-4 text-indigo-400 font-bold" />
          <h4 className="text-xs font-bold uppercase tracking-[0.12em]">Relational Database Schemas</h4>
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
            {copied ? 'Copied SQL!' : 'Copy Schema'}
          </button>

          <button
            onClick={handleDownload}
            className={`p-2.5 px-3.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all flex items-center gap-1.5
              ${isDark 
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300' 
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'}`}
          >
            <Download className="w-3.5 h-3.5" />
            Download SQL
          </button>

          <button
            type="button"
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setEditedSchema(dbSchema);
                setIsEditing(true);
              }
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/15 flex items-center gap-1.5 cursor-pointer"
          >
            {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            {isEditing ? 'Save Statements' : 'Edit Statements'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: SQL Statement Block (2 Cols Desktop) */}
        <div className="lg:col-span-2 space-y-4">
          <div className={`p-6 rounded-3xl border min-h-[460px] shadow-2xl flex flex-col justify-between
            ${isDark ? 'glass-panel shadow-black/80' : 'bg-white border-slate-200 shadow-indigo-50/15'}`}
          >
            {isEditing ? (
              <textarea
                value={editedSchema}
                onChange={(e) => setEditedSchema(e.target.value)}
                className={`w-full h-[400px] text-xs font-mono p-4 rounded-xl border outline-none leading-relaxed resize-y
                  ${isDark 
                    ? 'bg-slate-950/60 border-white/10 text-emerald-400 focus:border-indigo-500/50' 
                    : 'bg-slate-100 border-slate-200 text-emerald-800 focus:border-indigo-500/50'}`}
              />
            ) : (
              <pre className={`p-4 rounded-xl font-mono text-xs overflow-x-auto text-emerald-400 select-text leading-relaxed h-[420px]
                ${isDark ? 'bg-slate-950/60' : 'bg-slate-55 border border-slate-200/50 text-emerald-800'}`}
              >
                {editedSchema || '-- No table schema definitions generated yet.'}
              </pre>
            )}
            
            <div className={`text-[10px] mt-4 pt-4 border-t border-slate-800/15 text-slate-500 flex items-center justify-between`}>
              <span>PostgreSQL / Relational compliant SQL dialect</span>
              <span>Statements match standard database seeding specifications</span>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Entity Columns */}
        <div className="space-y-4">
          <div className={`p-6 rounded-3xl border backdrop-blur-md h-full shadow-2xl
            ${isDark ? 'glass-panel shadow-black/80' : 'bg-white border-slate-200'}`}
          >
            <div className="flex items-center justify-between border-b border-slate-800/20 pb-3 mb-4 select-none">
              <h5 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 flex items-center gap-1.5">
                <Table className="w-4 h-4 text-indigo-400" />
                Relational Tables
              </h5>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {visualTables.map((tbl, tIdx) => (
                <div key={tIdx} className={`p-4 rounded-2xl border
                  ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100/60 border-slate-200'}`}
                >
                  <div className="font-mono text-xs font-bold text-zinc-100 mb-2 border-b border-white/5 pb-2 flex items-center justify-between">
                    <span>{tbl.name}</span>
                    <span className="text-[9px] text-zinc-400 uppercase font-bold">{tbl.columns.length} Fields</span>
                  </div>
                  
                  <div className="space-y-1.5 pl-1 select-text">
                    {tbl.columns.map((col, cIdx) => (
                      <div key={cIdx} className="flex justify-between font-mono text-[10px] text-zinc-400 hover:text-indigo-400 transition-colors">
                        <span>{col.split('(')[0].trim()}</span>
                        <span className="text-indigo-500 text-[9px]">{col.includes('(') ? `(${col.split('(')[1]}` : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {visualTables.length === 0 && (
                <div className="text-center py-12 text-xs text-slate-500 border border-dashed border-slate-800/40 rounded-xl">
                  Analyze/Parse SQL to populate visual tables.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
