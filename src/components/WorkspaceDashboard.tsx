import React, { useState } from 'react';
import { Project, Task, Milestone } from '../types';
import { 
  CheckSquare, Plus, Trash2, Edit2, Play, Circle, 
  CheckCircle, ArrowRight, ArrowLeft, Tag, Calendar, 
  Map, Milestone as MilestoneIcon, ChevronRight, X 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell 
} from 'recharts';

interface WorkspaceDashboardProps {
  project: Project;
  onUpdateTasks: (tasks: Task[]) => void;
  onUpdateRoadmap: (roadmap: Milestone[]) => void;
  theme: 'dark' | 'light';
}

export default function WorkspaceDashboard({ project, onUpdateTasks, onUpdateRoadmap, theme }: WorkspaceDashboardProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTaskStatus, setSelectedTaskStatus] = useState<Task['status']>('todo');

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium');
  const [newPhase, setNewPhase] = useState('');

  const tasks = project.tasks || [];
  const milestones = project.roadmap || [];

  // Generate Gantt chart timeline ranges sequentially
  const generateGanttData = () => {
    if (milestones.length === 0) return [];
    let lastEnd = 1;
    return milestones.map((mil, idx) => {
      const duration = 5 + (idx % 3) * 2; // estimated days (e.g. 5, 7, 9)
      const start = lastEnd;
      const end = start + duration - 1;
      lastEnd = end + 1;
      return {
        id: mil.id,
        name: mil.title,
        status: mil.status,
        start: start,
        duration: duration,
        end: end,
        displayRange: `Day ${start} - Day ${end}`
      };
    });
  };

  const ganttData = generateGanttData();
  const isDark = theme === 'dark';

  const CustomGanttTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-3.5 rounded-2xl border text-xs shadow-2xl backdrop-blur-md font-sans select-none
          ${isDark ? 'bg-zinc-950/90 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
          <div className="font-extrabold border-b border-zinc-800/50 pb-1.5 mb-2 uppercase tracking-wide text-indigo-400">{data.name}</div>
          <div className="space-y-1.5 font-sans">
            <div className="flex justify-between gap-6 text-zinc-400">
              <span className="font-bold uppercase tracking-wider text-[9px]">Timeline Range:</span>
              <span className="font-bold text-zinc-200 font-mono">{data.displayRange}</span>
            </div>
            <div className="flex justify-between gap-6 text-zinc-400">
              <span className="font-bold uppercase tracking-wider text-[9px]">Duration:</span>
              <span className="font-bold text-zinc-200 font-mono">{data.duration} Days</span>
            </div>
            <div className="flex justify-between gap-6 items-center text-zinc-400">
              <span className="font-bold uppercase tracking-wider text-[9px]">Status:</span>
              <span className={`font-bold font-mono text-[9px] uppercase px-2 py-0.5 rounded-md border
                ${data.status === 'completed' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                  : data.status === 'active'
                    ? 'bg-indigo-505/10 text-indigo-400 border-indigo-500/25'
                    : 'bg-zinc-850 text-zinc-400 border-zinc-700/45'}`}>
                {data.status}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Toggle single task completed state (quick-toggle between todo and completed)
  const handleQuickToggleTask = (task: Task) => {
    const nextStatus: Task['status'] = task.status === 'completed' ? 'todo' : 'completed';
    const updated = tasks.map(t => t.id === task.id ? { ...t, status: nextStatus } : t);
    onUpdateTasks(updated);
  };

  // Cycle task status through todo -> in_progress -> completed
  const handleMoveStatus = (task: Task, direction: 'forward' | 'backward') => {
    const sequence: Task['status'][] = ['todo', 'in_progress', 'completed'];
    const currentIdx = sequence.indexOf(task.status);
    let nextIdx = direction === 'forward' ? currentIdx + 1 : currentIdx - 1;
    if (nextIdx < 0) nextIdx = 0;
    if (nextIdx > 2) nextIdx = 2;
    
    const nextStatus = sequence[nextIdx];
    const updated = tasks.map(t => t.id === task.id ? { ...t, status: nextStatus } : t);
    onUpdateTasks(updated);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: 'task_' + Date.now(),
      title: newTitle.trim(),
      description: newDesc.trim(),
      status: selectedTaskStatus,
      priority: newPriority,
      phaseId: newPhase.trim() || undefined
    };

    onUpdateTasks([...tasks, newTask]);
    resetAddForm();
  };

  const resetAddForm = () => {
    setNewTitle('');
    setNewDesc('');
    setNewPriority('medium');
    setNewPhase('');
    setShowAddForm(false);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to remove this task?')) {
      onUpdateTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const handleUpdateMilestone = (milestoneId: string) => {
    const statusCycle: Milestone['status'][] = ['pending', 'active', 'completed'];
    const updated = milestones.map(m => {
      if (m.id === milestoneId) {
        const nextIdx = (statusCycle.indexOf(m.status) + 1) % statusCycle.length;
        return { ...m, status: statusCycle[nextIdx] };
      }
      return m;
    });
    onUpdateRoadmap(updated);
  };

  // Stats calculation
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasksCount = tasks.filter(t => t.status === 'in_progress').length;
  const todoTasksCount = tasks.filter(t => t.status === 'todo').length;
  const pctComplete = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Progress Banner Block */}
      <div className={`p-8 rounded-3xl border backdrop-blur-md flex flex-col md:flex-row gap-6 items-center justify-between shadow-2xl relative overflow-hidden
        ${isDark ? 'glass-panel shadow-black/80' : 'bg-white/60 border-slate-200'}`}
      >
        <div className="space-y-2 w-full md:w-auto relative z-10">
          <div className="text-[9px] uppercase font-bold tracking-[0.15em] text-zinc-500">Stage 2: Workspace Implementation Dashboard</div>
          <h3 className="text-3xl font-extrabold tracking-tight text-white">
            {project.name} Task Catalog
          </h3>
          <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'} leading-relaxed`}>Manage checklist requirements and review milestone pathways.</p>
        </div>

        {/* Progress gauge bar */}
        <div className="w-full md:w-80 space-y-2.5 shrink-0 relative z-10 select-none">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-bold uppercase tracking-[0.05em] text-[10px]">Tasks Completion Engine</span>
            <span className="font-bold text-indigo-400 font-mono text-xs">{pctComplete}% Complete ({completedTasksCount}/{totalTasksCount})</span>
          </div>
          <div className="w-full bg-slate-950/60 border border-white/5 rounded-full h-3 overflow-hidden p-0.5">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(79,70,229,0.4)]" 
              style={{ width: `${pctComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* Visual Gantt Chart / Timeline view of Milestones */}
      {milestones.length > 0 && (
        <div className={`p-6 md:p-8 rounded-3xl border shadow-2xl backdrop-blur-md relative overflow-hidden transition-all duration-300
          ${isDark ? 'glass-panel shadow-black/80' : 'bg-white border-slate-200'}`}
        >
          {/* Subtle glow background */}
          {isDark && <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />}
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-light-zinc-700/10 pb-4 mb-6 relative z-10 select-none">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-indigo-400">Roadmap Timeline</span>
              <h4 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500 animate-pulse" />
                Project Milestone Gantt Chart
              </h4>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'} leading-relaxed`}>
                Estimated progression of design and architecture blueprints over relative days.
              </p>
            </div>
            
            {/* Status indicators Legend */}
            <div className="flex flex-wrap items-center gap-4 text-[9px] font-bold font-mono">
              <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                COMPLETED
              </div>
              <div className="flex items-center gap-1.5 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-md">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(79,70,229,0.5)] animate-pulse" />
                ACTIVE
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400 bg-zinc-800/40 border border-zinc-700/30 px-2.5 py-1 rounded-md">
                <span className="w-2 h-2 rounded-full bg-zinc-650" />
                PENDING
              </div>
            </div>
          </div>

          <div className="w-full h-[220px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ganttData}
                layout="vertical"
                margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
                barCategoryGap={10}
              >
                <XAxis 
                  type="number" 
                  domain={[1, 'dataMax + 4']} 
                  stroke={isDark ? '#52525b' : '#94a3b8'} 
                  tick={{ fill: isDark ? '#71717a' : '#475569', fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' }}
                  tickFormatter={(val) => `Day ${val}`}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke={isDark ? '#e4e4e7' : '#1e293b'} 
                  tick={{ fill: isDark ? '#e4e4e7' : '#1e293b', fontSize: 10, fontWeight: 'bold' }}
                  width={150}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  content={<CustomGanttTooltip />} 
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }} 
                />
                
                {/* Spacer block (transparent background bar to offset the real duration bar) */}
                <Bar dataKey="start" stackId="gantt" fill="transparent" />
                
                {/* Duration block */}
                <Bar dataKey="duration" stackId="gantt" radius={[6, 6, 6, 6]}>
                  {ganttData.map((entry, index) => {
                    let color = isDark ? '#27272a' : '#e2e8f0'; // pending
                    if (entry.status === 'completed') color = '#10b981'; // completed
                    else if (entry.status === 'active') color = '#4f46e5'; // active
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Milestones Timeline Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className={`p-6 rounded-3xl border backdrop-blur-md h-full shadow-2xl
            ${isDark ? 'glass-panel shadow-black/80' : 'bg-white/40 border-slate-200/50'}`}
          >
            <div className="flex items-center justify-between mb-5 border-b border-light-zinc-700/10 pb-3 select-none">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 flex items-center gap-2">
                <MilestoneIcon className="w-4 h-4 text-indigo-400" />
                Project Phases
              </h4>
              <span className="px-2.5 py-0.5 rounded-full text-[8px] font-bold font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                ACTIVE PLAN
              </span>
            </div>

            <div className="space-y-6 relative pl-3.5 border-l border-white/5">
              {milestones.map((mil, mIdx) => {
                const statusStyles = {
                  completed: { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25', circle: 'bg-emerald-500 ring-4 ring-emerald-500/15' },
                  active: { badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25', circle: 'bg-indigo-500 ring-4 ring-indigo-500/15 animate-pulse' },
                  pending: { badge: 'bg-zinc-850 text-zinc-400 border-zinc-700/40', circle: 'bg-zinc-805 ring-4 ring-zinc-850/20' }
                };

                const activeStyle = statusStyles[mil.status] || statusStyles.pending;

                return (
                  <div key={mil.id || mIdx} className="relative group select-none">
                    {/* Circle positioning absolutely left on timeline */}
                    <div className={`absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full transition-colors ${activeStyle.circle}`} />
                    
                    <div className="space-y-1 pl-2">
                      <div className="flex items-start justify-between gap-1">
                        <span className={`text-xs font-bold leading-snug ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                          {mil.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateMilestone(mil.id || '')}
                          className={`text-[8px] font-bold font-mono px-2 py-0.5 rounded cursor-pointer border transition-all ${activeStyle.badge}`}
                        >
                          {mil.status.toUpperCase()}
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">{mil.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Kanban Drag boards */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls Bar */}
          <div className="flex items-center justify-between select-none">
            <div className="text-[10px] uppercase font-mono font-bold tracking-[0.05em] text-zinc-500">
              Tasks breakdown: <span className="text-rose-400">{todoTasksCount} To-Do</span> • <span className="text-amber-400">{inProgressTasksCount} In-Progress</span> • <span className="text-emerald-400">{completedTasksCount} Completed</span>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setSelectedTaskStatus('todo');
                setShowAddForm(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/15 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              Add Task Blueprint
            </button>
          </div>

          {/* Quick Task Creation Drawer/Form Panel */}
          {showAddForm && (
            <form 
              onSubmit={handleAddTask}
              className={`p-6 rounded-3xl border backdrop-blur-md space-y-4 relative shadow-2xl
                ${isDark ? 'glass-panel shadow-black/80' : 'bg-slate-50 border-slate-200'}`}
            >
              <button
                type="button"
                onClick={resetAddForm}
                className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-white/5 text-zinc-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <h5 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 select-none">Assemble Implementation Step</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text"
                  required
                  placeholder="Task title (e.g. Set up OAuth endpoints)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`text-xs px-3.5 py-2.5 rounded-xl border outline-none transition-colors
                    ${isDark ? 'bg-slate-950/60 border-white/5 text-white focus:border-indigo-500/50' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500/50'}`}
                />

                <input 
                  type="text"
                  placeholder="Target Milestone/Phase title or Tag (optional)"
                  value={newPhase}
                  onChange={(e) => setNewPhase(e.target.value)}
                  className={`text-xs px-3.5 py-2.5 rounded-xl border outline-none transition-colors
                    ${isDark ? 'bg-slate-950/60 border-white/5 text-white focus:border-indigo-500/50' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500/50'}`}
                />
              </div>

              <input 
                type="text"
                placeholder="Brief summary or technical specs description..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className={`w-full text-xs px-3.5 py-2.5 rounded-xl border outline-none transition-colors
                  ${isDark ? 'bg-slate-950/60 border-white/5 text-white focus:border-indigo-500/50' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500/50'}`}
              />

              <div className="flex flex-wrap items-center gap-4 text-xs select-none">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 font-bold uppercase tracking-[0.05em] text-[10px]">Priority:</span>
                  <div className="flex gap-1.5">
                    {(['low', 'medium', 'high'] as const).map(prio => (
                      <button
                        key={prio}
                        type="button"
                        onClick={() => setNewPriority(prio)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[9px] capitalize cursor-pointer border transition-colors
                          ${newPriority === prio
                            ? (prio === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : prio === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-slate-500/10 text-slate-400 border-slate-500/30')
                            : (isDark ? 'bg-slate-900 border-white/5 text-zinc-400 hover:text-zinc-200' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50')}`}
                      >
                        {prio}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-zinc-400 font-bold uppercase tracking-[0.05em] text-[10px]">Initial state:</span>
                  <select
                    value={selectedTaskStatus}
                    onChange={(e) => setSelectedTaskStatus(e.target.value as Task['status'])}
                    className={`px-2.5 py-1 rounded-lg text-[10px] border outline-none cursor-pointer font-bold
                      ${isDark ? 'bg-slate-900 border-white/5 text-zinc-300' : 'bg-white border-slate-200 text-slate-700'}`}
                  >
                    <option value="todo">To-Do</option>
                    <option value="in_progress">In-Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={resetAddForm}
                  className="text-xs text-zinc-400 hover:text-zinc-200 px-3.5 py-2 hover:bg-white/5 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg transition-all cursor-pointer uppercase tracking-wider"
                >
                  Add Step
                </button>
              </div>
            </form>
          )}

          {/* Kanban Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Column 1: To-Do Column */}
            <div className={`p-4 rounded-3xl border backdrop-blur-md space-y-3.5 min-h-[400px] shadow-2xl
              ${isDark ? 'glass-panel shadow-black/80' : 'bg-slate-100/40 border-slate-200'}`}
            >
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-2 mb-2 select-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-450">To-Do Queue</span>
                </div>
                <span className="px-2 py-0.5 rounded-full font-mono text-[9px] font-bold bg-rose-500/10 text-rose-450 border border-rose-500/25">{todoTasksCount}</span>
              </div>

              <div className="space-y-3.5">
                {tasks.filter(t => t.status === 'todo').map(task => (
                  <TaskCard 
                    key={task.id}
                    task={task}
                    isDark={isDark}
                    onMoveForward={() => handleMoveStatus(task, 'forward')}
                    onMoveBackward={() => handleMoveStatus(task, 'backward')}
                    onToggle={() => handleQuickToggleTask(task)}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                ))}
                
                {tasks.filter(t => t.status === 'todo').length === 0 && (
                  <div className={`py-12 text-center text-xs text-slate-500 border border-dashed rounded-2xl border-white/5 pl-2 select-none`}>
                    No outstanding tasks. Add steps above!
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: In Progress Column */}
            <div className={`p-4 rounded-3xl border backdrop-blur-md space-y-3.5 min-h-[400px] shadow-2xl
              ${isDark ? 'glass-panel shadow-black/80' : 'bg-slate-100/40 border-slate-200'}`}
            >
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2 mb-2 select-none font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-amber-505 rounded-full animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-500">In Progress</span>
                </div>
                <span className="px-2 py-0.5 rounded-full font-mono text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/25">{inProgressTasksCount}</span>
              </div>

              <div className="space-y-3.5">
                {tasks.filter(t => t.status === 'in_progress').map(task => (
                  <TaskCard 
                    key={task.id}
                    task={task}
                    isDark={isDark}
                    onMoveForward={() => handleMoveStatus(task, 'forward')}
                    onMoveBackward={() => handleMoveStatus(task, 'backward')}
                    onToggle={() => handleQuickToggleTask(task)}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                ))}

                {tasks.filter(t => t.status === 'in_progress').length === 0 && (
                  <div className={`py-12 text-center text-xs text-slate-500 border border-dashed rounded-2xl border-white/5 pl-2 select-none`}>
                    No active implementations.
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: Completed Column */}
            <div className={`p-4 rounded-3xl border backdrop-blur-md space-y-3.5 min-h-[400px] shadow-2xl
              ${isDark ? 'glass-panel shadow-black/80' : 'bg-slate-100/40 border-slate-200'}`}
            >
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2 mb-2 select-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-450">Completed</span>
                </div>
                <span className="px-2 py-0.5 rounded-full font-mono text-[9px] font-bold bg-emerald-500/10 text-emerald-450 border border-emerald-500/25">{completedTasksCount}</span>
              </div>

              <div className="space-y-3.5">
                {tasks.filter(t => t.status === 'completed').map(task => (
                  <TaskCard 
                    key={task.id}
                    task={task}
                    isDark={isDark}
                    onMoveForward={() => handleMoveStatus(task, 'forward')}
                    onMoveBackward={() => handleMoveStatus(task, 'backward')}
                    onToggle={() => handleQuickToggleTask(task)}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                ))}

                {tasks.filter(t => t.status === 'completed').length === 0 && (
                  <div className={`py-12 text-center text-xs text-slate-500 border border-dashed rounded-2xl border-white/5 pl-2 select-none`}>
                    Check off milestones to populate logs!
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

/* Internal helper card representation */
interface TaskCardProps {
  key?: string;
  task: Task;
  isDark: boolean;
  onMoveForward: () => void;
  onMoveBackward: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

function TaskCard({ task, isDark, onMoveForward, onMoveBackward, onToggle, onDelete }: TaskCardProps) {
  const isCompleted = task.status === 'completed';
  const isProgress = task.status === 'in_progress';

  const priorityColors = {
    high: 'text-rose-400 bg-rose-500/15 border-rose-500/25',
    medium: 'text-amber-400 bg-amber-500/15 border-amber-500/25',
    low: 'text-zinc-400 bg-zinc-500/15 border-zinc-500/25',
  };

  const currentPriority = priorityColors[task.priority] || priorityColors.medium;

  return (
    <div 
      className={`p-4 rounded-2xl border shadow-md flex flex-col justify-between group transition-all duration-300 transform hover:-translate-y-0.5
        ${isDark 
          ? 'bg-zinc-950/40 border-white/5 hover:border-indigo-500/30 shadow-black/80' 
          : 'bg-white border-slate-200/50 shadow-indigo-50/30 hover:border-indigo-200'}`}
    >
      <div className="space-y-2 mb-3">
        {/* Priority & Phase Row */}
        <div className="flex items-center gap-1.5 select-none">
          <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold font-mono tracking-wider uppercase border ${currentPriority}`}>
            {task.priority}
          </span>
          {task.phaseId && (
            <span className={`max-w-[120px] font-bold text-[8px] truncate bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 h-snug rounded-md px-2 py-0.5`}>
              {task.phaseId}
            </span>
          )}
        </div>

        {/* Title */}
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={onToggle}
            className="mt-0.5 shrink-0 hover:scale-110 active:scale-95 transition-all text-slate-500 hover:text-indigo-400 cursor-pointer"
          >
            {isCompleted ? (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            ) : (
              <Circle className="w-4 h-4 text-slate-500" />
            )}
          </button>
          
          <h5 className={`text-xs font-bold leading-tight select-text
            ${isCompleted ? 'text-zinc-500 line-through' : (isDark ? 'text-zinc-100' : 'text-slate-800')}`}
          >
            {task.title}
          </h5>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-[10px] text-zinc-400 leading-relaxed pl-6 select-text">
            {task.description}
          </p>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="flex items-center justify-between border-t border-white/5 pt-2 md:pt-3 pl-6 select-none">
        {/* Toggle Shift Buttons */}
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onMoveBackward}
            disabled={task.status === 'todo'}
            title="Move step left"
            className={`p-1 rounded-lg cursor-pointer transition-all border
              ${isDark ? 'border-white/5 text-zinc-500 hover:text-zinc-300' : 'border-slate-200 text-slate-400 hover:text-slate-700'}
              ${task.status === 'todo' ? 'opacity-[0.11] pointer-events-none' : ''}`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onMoveForward}
            disabled={isCompleted}
            title="Move step right"
            className={`p-1 rounded-lg cursor-pointer transition-all border
              ${isDark ? 'border-white/5 text-zinc-500 hover:text-zinc-300' : 'border-slate-200 text-slate-400 hover:text-slate-700'}
              ${isCompleted ? 'opacity-[0.11] pointer-events-none' : ''}`}
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Delete button (displays on group-hover) */}
        <button
          type="button"
          onClick={onDelete}
          className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-xl hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 cursor-pointer transition-all`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
