/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Project, Task, Milestone, UISkeleton, UIDesign, Settings } from './types';
import { 
  getProjects, saveProject, deleteProject, getSettings, saveSettings 
} from './lib/storage';
import { 
  generateDraftPlan, generateProjectAssets, generateUISkeletons, generateUIDesign 
} from './lib/openai';
import { 
  Sparkles, Layers, Sliders, Settings as SettingsIcon, Sun, Moon, 
  Trash2, Plus, LayoutDashboard, FileText, Database, Monitor, 
  Eye, RefreshCw, Cpu, CheckSquare, Compass, X, AlertOctagon, Download 
} from 'lucide-react';

// Subcomponents import
import SettingsModal from './components/SettingsModal';
import Onboarding from './components/Onboarding';
import ProjectDraftSpec from './components/ProjectDraftSpec';
import WorkspaceDashboard from './components/WorkspaceDashboard';
import PrdSection from './components/PrdSection';
import DbSchemaSection from './components/DbSchemaSection';
import UiSkeletonsSection from './components/UiSkeletonsSection';
import UiDesignsSection from './components/UiDesignsSection';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // Creation States
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [newIdeaText, setNewIdeaText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Active workspace states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'prd' | 'db_schema' | 'wireframes' | 'mockups'>('dashboard');
  const [isGeneratingMockup, setIsGeneratingMockup] = useState<string | null>(null);

  // Initialize data on load
  useEffect(() => {
    const loadedProjects = getProjects();
    setProjects(loadedProjects);
    if (loadedProjects.length > 0) {
      setSelectedProjectId(loadedProjects[0].id);
    }
    
    // Theme lookup
    const savedTheme = localStorage.getItem('theme_preference') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const handleSettingsChanged = () => {
    // Let standard changes take effect
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme_preference', nextTheme);
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    // Reset back to overview
    setActiveTab('dashboard');
    setProcessingError(null);
  };

  const handleCreateDraftProject = async (idea: string) => {
    if (!idea.trim()) return;
    
    setNewIdeaText('');
    setShowIdeaModal(false);
    setIsProcessing(true);
    setProcessingError(null);
    setProcessingStep('Analyzing concept & formulating proposal spec...');

    const settings = getSettings();
    if (!settings.openaiApiKey) {
      // Create template placeholder but warn
      const tempId = 'proj_' + Date.now();
      const mockProj: Project = {
        id: tempId,
        idea: idea,
        name: 'Concept Proposal Stack',
        description: 'New Application Draft',
        status: 'plan_pending_approval',
        createdAt: new Date().toISOString(),
        draftPlan: {
          name: 'Concept Blueprint Spec',
          abstract: `Draft for: "${idea}". Input your OpenAI API Key in settings to unlock the automated system architect and generate full PRDs and live HTML models!`,
          techStack: 'React SPA, Vite tooling & Tailwind CSS framework',
          coreFeatures: [
            'Requirement details (Key missing in Settings)',
            'Database schemas triggers',
            'Skeletons and custom visual wireframes compilation',
            'Static live high-fidelity mockup designs render'
          ]
        },
        tasks: [],
        roadmap: [],
        uiSkeletons: [],
        uiDesigns: []
      };
      
      saveProject(mockProj);
      setProjects(getProjects());
      setSelectedProjectId(tempId);
      setIsProcessing(false);
      setIsSettingsOpen(true); // Open settings to help user prompt keys
      return;
    }

    try {
      const draft = await generateDraftPlan(idea, settings);
      
      const newProjId = 'proj_' + Date.now();
      const newProj: Project = {
        id: newProjId,
        idea: idea,
        name: draft.name,
        description: draft.abstract.substring(0, 80) + '...',
        status: 'plan_pending_approval',
        createdAt: new Date().toISOString(),
        draftPlan: draft,
        tasks: [],
        roadmap: [],
        uiSkeletons: [],
        uiDesigns: [],
        settingsUsed: settings
      };

      saveProject(newProj);
      setProjects(getProjects());
      setSelectedProjectId(newProjId);
    } catch (err: any) {
      console.error(err);
      setProcessingError(err?.message || 'Failed to formulate tentative draft proposal. Verify settings credentials.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Stage 2: Approve Concept Proposal - Trigger Complete Blueprint Asset Generation
  const handleApproveProjectDraft = async (additionalPrompt?: string) => {
    const activeProj = projects.find(p => p.id === selectedProjectId);
    if (!activeProj || !activeProj.draftPlan) return;

    setIsProcessing(true);
    setProcessingError(null);
    const settings = getSettings();

    try {
      // Step A: Generate PRD, DB Tables Schema, Tasks Checklist, and Timeline Roadmaps
      setProcessingStep('Drafting Product Requirements (PRD) and relational table schemas...');
      const combinedIdea = additionalPrompt 
        ? `${activeProj.idea} [Additional Custom Requests: ${additionalPrompt}]` 
        : activeProj.idea;
        
      const assets = await generateProjectAssets(combinedIdea, activeProj.draftPlan, settings);
      
      // Step B: Generate layout Wireframe skeletons for views
      setProcessingStep('Forming view wireframes layout maps and visual components list...');
      const skeletons = await generateUISkeletons(activeProj.draftPlan, settings);

      // Create ID mappings
      const structuredTasks: Task[] = assets.tasks.map((t, idx) => ({
        ...t,
        id: `task_${Date.now()}_${idx}`
      })) as Task[];

      const structuredMilestones: Milestone[] = assets.roadmap.map((m, idx) => ({
        ...m,
        id: `milestone_${Date.now()}_${idx}`
      })) as Milestone[];

      const structuredSkeletons: UISkeleton[] = skeletons.map((s, idx) => ({
        ...s,
        id: `skeleton_${Date.now()}_${idx}`
      }));

      // Update project attributes
      const updatedProj: Project = {
        ...activeProj,
        status: 'ready',
        prd: assets.prd,
        dbSchema: assets.dbSchema,
        tasks: structuredTasks,
        roadmap: structuredMilestones,
        uiSkeletons: structuredSkeletons,
        uiDesigns: [] // will generate mockups downstream or on demand
      };

      saveProject(updatedProj);
      setProjects(getProjects());
    } catch (err: any) {
      console.error(err);
      setProcessingError(err?.message || 'Failed deep architecture compilation. Check model configuration schemas.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Regenerate Project concept draft block
  const handleRegenerateDraft = async (overridePrompt?: string) => {
    const activeProj = projects.find(p => p.id === selectedProjectId);
    if (!activeProj) return;

    const mergedIdea = overridePrompt ? `${activeProj.idea} (${overridePrompt})` : activeProj.idea;
    setIsProcessing(true);
    setProcessingError(null);
    setProcessingStep('Remapping draft proposal with tailored instruction guidelines...');
    
    const settings = getSettings();
    try {
      const draft = await generateDraftPlan(mergedIdea, settings);
      const updatedProj: Project = {
        ...activeProj,
        name: draft.name,
        description: draft.abstract.substring(0, 80) + '...',
        draftPlan: draft
      };
      
      saveProject(updatedProj);
      setProjects(getProjects());
    } catch (err: any) {
      console.error(err);
      setProcessingError(err?.message || 'Failed to regenerate proposal spec.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper sync utilities for editing workspaces
  const handleUpdateTasks = (updatedTasks: Task[]) => {
    const activeProj = projects.find(p => p.id === selectedProjectId);
    if (!activeProj) return;
    const updated = { ...activeProj, tasks: updatedTasks };
    saveProject(updated);
    setProjects(getProjects());
  };

  const handleUpdateRoadmap = (updatedRoadmap: Milestone[]) => {
    const activeProj = projects.find(p => p.id === selectedProjectId);
    if (!activeProj) return;
    const updated = { ...activeProj, roadmap: updatedRoadmap };
    saveProject(updated);
    setProjects(getProjects());
  };

  const handleSavePrdContent = (newPrd: string) => {
    const activeProj = projects.find(p => p.id === selectedProjectId);
    if (!activeProj) return;
    const updated = { ...activeProj, prd: newPrd };
    saveProject(updated);
    setProjects(getProjects());
  };

  const handleSaveSchemaContent = (newSchema: string) => {
    const activeProj = projects.find(p => p.id === selectedProjectId);
    if (!activeProj) return;
    const updated = { ...activeProj, dbSchema: newSchema };
    saveProject(updated);
    setProjects(getProjects());
  };

  const handleSaveDesigns = (updatedDesigns: UIDesign[]) => {
    const activeProj = projects.find(p => p.id === selectedProjectId);
    if (!activeProj) return;
    const updated = { ...activeProj, uiDesigns: updatedDesigns };
    saveProject(updated);
    setProjects(getProjects());
  };

  // Goal #5: Trigger on-demand detailed HTML design for a page wireframe skeleton
  const handleGenerateHtmlMockup = async (skeleton: UISkeleton) => {
    const activeProj = projects.find(p => p.id === selectedProjectId);
    if (!activeProj || !activeProj.draftPlan) return;

    setIsGeneratingMockup(skeleton.id);
    const settings = getSettings();

    try {
      const htmlCode = await generateUIDesign(
        activeProj.draftPlan,
        skeleton.pageName,
        skeleton.description,
        activeProj.uiSkeletons,
        settings
      );

      const newDesignId = 'ds_' + Date.now();
      const newDesign: UIDesign = {
        id: newDesignId,
        pageName: skeleton.pageName,
        description: skeleton.description,
        htmlCode: htmlCode
      };

      // Filter out double pages
      const freshDesigns = (activeProj.uiDesigns || []).filter(
        d => d.pageName.toLowerCase().trim() !== skeleton.pageName.toLowerCase().trim()
      );

      const updatedProj: Project = {
        ...activeProj,
        uiDesigns: [...freshDesigns, newDesign]
      };

      saveProject(updatedProj);
      setProjects(getProjects());
      
      // Shift user over to live mockup view tab so they see results instantly!
      setActiveTab('mockups');
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Could not compile high-fidelity mockup. Ensure API permissions are correct.');
    } finally {
      setIsGeneratingMockup(null);
    }
  };

  const handleDeleteProject = (projId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to discard this project template?')) {
      deleteProject(projId);
      const remaining = getProjects();
      setProjects(remaining);
      if (remaining.length > 0) {
        setSelectedProjectId(remaining[0].id);
      } else {
        setSelectedProjectId('');
      }
    }
  };

  const handleDownloadProject = () => {
    const activeProj = projects.find(p => p.id === selectedProjectId);
    if (!activeProj) return;

    const exportBundle = {
      projectName: activeProj.name,
      projectIdea: activeProj.idea,
      themeUsed: theme,
      created_at: activeProj.createdAt,
      prd: activeProj.prd || 'No PRD generated yet.',
      databaseSchema: activeProj.dbSchema || 'No relational database schema generated yet.',
      htmlMockups: (activeProj.uiDesigns || []).map(design => ({
        pageName: design.pageName,
        description: design.description,
        htmlCode: design.htmlCode
      })),
      associatedTasks: activeProj.tasks || [],
      associatedMilestones: activeProj.roadmap || []
    };

    const jsonStr = JSON.stringify(exportBundle, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const safeName = activeProj.name.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'blueprint';
    link.download = `${safeName}_bundle.json`;
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowDownloadModal(false);
  };

  const handleExportPDF = () => {
    const activeProj = projects.find(p => p.id === selectedProjectId);
    if (!activeProj) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const margin = 20;
    const contentWidth = 170;
    const pageHeight = 297;
    let y = 25;

    const checkPageSpace = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin - 15) {
        doc.addPage();
        y = margin + 10;
      }
    };

    const printText = (text: string, fontSize = 10, fontStyle = 'normal', color = [40, 40, 40], spacing = 5, indent = 0) => {
      doc.setFont('helvetica', fontStyle);
      doc.setFontSize(fontSize);
      doc.setTextColor(color[0], color[1], color[2]);
      
      const lines = doc.splitTextToSize(text, contentWidth - indent);
      const lineHeight = (fontSize * 0.3527) * 1.35;
      
      lines.forEach((line: string) => {
        checkPageSpace(lineHeight);
        doc.text(line, margin + indent, y);
        y += lineHeight;
      });
      
      y += spacing;
    };

    // Cover Page Indicator Bar
    doc.setFillColor(79, 70, 229);
    doc.rect(margin, y, contentWidth, 3.5, 'F');
    y += 10;

    // Project Name & Descriptive Subheader
    printText(activeProj.name.toUpperCase(), 20, 'bold', [15, 23, 42], 2);
    printText("Blueprint Specification & Strategic Roadmap Report", 9.5, 'italic', [100, 116, 139], 10);

    // Meta Block Card Layout
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, contentWidth, 32, 'DF');

    let metaY = y + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text("Created At:", margin + 6, metaY);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(activeProj.createdAt).toLocaleDateString(), margin + 35, metaY);

    metaY += 6;
    doc.setFont('helvetica', 'bold');
    doc.text("Draft Concept:", margin + 6, metaY);
    doc.setFont('helvetica', 'normal');
    const conceptSlug = activeProj.idea.substring(0, 60) + (activeProj.idea.length > 60 ? '...' : '');
    doc.text(`"${conceptSlug}"`, margin + 35, metaY);

    metaY += 6;
    doc.setFont('helvetica', 'bold');
    doc.text("Tech Stack Spec:", margin + 6, metaY);
    doc.setFont('helvetica', 'normal');
    doc.text(activeProj.draftPlan?.techStack || 'React, Vite, Tailwind CSS', margin + 35, metaY);

    metaY += 6;
    doc.setFont('helvetica', 'bold');
    doc.text("Exported On:", margin + 6, metaY);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString() + " (UTC)", margin + 35, metaY);

    y += 40;

    // Overview Segment
    printText("1. CONCEPT ABSTRACT & PURPOSE", 12, 'bold', [79, 70, 229], 4);
    const summaryText = activeProj.description || activeProj.draftPlan?.abstract || "No abstract vision specified yet.";
    printText(summaryText, 9.5, 'normal', [64, 64, 64], 8);

    // Separator line
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.4);
    doc.line(margin, y, 210 - margin, y);
    y += 10;

    // PRD Block Parsing and Output
    printText("2. PRODUCT REQUIREMENT SPECIFICATIONS (PRD)", 12, 'bold', [79, 70, 229], 4);
    const prdContent = activeProj.prd || '';
    if (!prdContent) {
      printText("No requirements defined in the specification tab yet.", 9.5, 'italic', [148, 163, 184], 6);
    } else {
      const prdLines = prdContent.split('\n');
      prdLines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('# ')) {
          y += 3;
          printText(trimmed.substring(2).toUpperCase(), 13, 'bold', [15, 23, 42], 4);
        } else if (trimmed.startsWith('## ')) {
          y += 2;
          printText(trimmed.substring(3), 11, 'bold', [79, 70, 229], 3.5);
        } else if (trimmed.startsWith('### ')) {
          y += 1;
          printText(trimmed.substring(4), 10, 'bold', [71, 85, 105], 3);
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          printText('•  ' + trimmed.substring(2), 9, 'normal', [51, 65, 85], 2, 4);
        } else if (trimmed.match(/^\d+\.\s/)) {
          const rawNum = trimmed.substring(0, trimmed.indexOf('.') + 1);
          const body = trimmed.substring(trimmed.indexOf('.') + 1).trim();
          printText(`${rawNum}  ${body}`, 9, 'normal', [51, 65, 85], 2, 4);
        } else if (trimmed !== '') {
          printText(line, 9, 'normal', [64, 74, 94], 2.5);
        } else {
          y += 2;
        }
      });
    }

    y += 10;

    // Roadmap Milestone list
    checkPageSpace(50);
    printText("3. STRATEGIC MILESTONES & PHASING ROADMAP", 12, 'bold', [79, 70, 229], 4);
    
    const roadmap = activeProj.roadmap || [];
    if (roadmap.length === 0) {
      printText("No roadmap milestones have detail logs yet.", 9.5, 'italic', [148, 163, 184], 6);
    } else {
      roadmap.forEach((mil, idx) => {
        checkPageSpace(30);

        // Draw progress timeline status bulb
        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(0.4);
        doc.line(margin + 2.5, y, margin + 2.5, y + 16);

        let statusColor = [100, 116, 139]; // default gray
        if (mil.status === 'completed') statusColor = [16, 185, 129]; // completed green
        else if (mil.status === 'active') statusColor = [79, 70, 229]; // active indigo

        doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.circle(margin + 2.5, y + 1.5, 1.5, 'F');

        printText(`Phase ${idx + 1}: ${mil.title}`, 10.5, 'bold', [15, 23, 42], 1.5, 6);
        printText(`STATUS PROMPTING: ${mil.status.toUpperCase()}`, 8, 'bold', statusColor, 1.5, 6);
        printText(mil.description || 'No additional specifications listed.', 9, 'normal', [71, 85, 105], 4, 6);
        y += 1.5;
      });
    }

    // Append standard formatting headers and footers post production
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Header top line
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.1);
      doc.line(margin, 15, 210 - margin, 15);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`${activeProj.name.toUpperCase()}  |  BLUEPRINT REPORT`, margin, 10.5);

      // Footer bottom line
      doc.line(margin, 297 - 14, 210 - margin, 297 - 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Document Reference: ${activeProj.id}`, margin, 297 - 9);
      doc.text(`Page ${i} of ${pageCount}`, 210 - margin - 15, 297 - 9);
    }

    const safeFilename = activeProj.name.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'blueprint_config';
    doc.save(`${safeFilename}_blueprint.pdf`);
    setShowDownloadModal(false);
  };

  const activeProject = projects.find(p => p.id === selectedProjectId);
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-all duration-300 font-sans select-none flex flex-col relative overflow-hidden
      ${isDark 
        ? 'dark bg-art-radial text-zinc-100' 
        : 'bg-gradient-to-br from-zinc-50 via-zinc-100 to-indigo-50 text-zinc-900'}`}
    >
      
      {/* Decorative Atmospheric Glows for Artistic Flair */}
      {isDark && (
        <>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none z-0" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none z-0" />
        </>
      )}
      
      {/* Brand Header */}
      <header className={`px-6 py-4 border-b flex items-center justify-between backdrop-blur-md sticky top-0 z-40 transition-all duration-300
        ${isDark ? 'bg-zinc-950/45 border-white/5 shadow-lg' : 'bg-white/70 border-zinc-200 shadow-sm'}`}
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20 text-white select-none">
            B
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>Blueprint</span> 
              <span className="text-zinc-500 font-light underline decoration-indigo-500/50 underline-offset-8">AI</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Intelligent System Architect</p>
          </div>
        </div>

        {/* Global Controls & Status */}
        <div className="flex items-center space-x-4">
          {/* AI Engine Status badge */}
          <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 shadow-inner select-none">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></div>
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest whitespace-nowrap">AI Engine Ready</span>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`p-2.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold
              ${isDark 
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300' 
                : 'bg-white hover:bg-zinc-100 border-zinc-200 text-slate-700'}`}
            title="Configure API Model Credentials"
          >
            <SettingsIcon className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* Theme Shift Button */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-full border transition-all cursor-pointer
              ${isDark 
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300' 
                : 'bg-white hover:bg-zinc-100 border-zinc-200 text-slate-700'}`}
            title="Switch palette focus"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
        </div>
      </header>

      {/* Main Container Layout (2 Cols: Sidebar + Dynamic Workspace Panel) */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
        
        {/* Left Column: Blueprints Sidebar Navigation */}
        <aside className={`w-full md:w-72 shrink-0 border-r flex flex-col justify-between p-4 z-10 transition-all duration-300
          ${isDark ? 'bg-zinc-900/10 border-white/5 backdrop-blur-xl' : 'bg-zinc-100/30 border-zinc-200 shadow-sm'}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2 select-none">
              <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-zinc-500">Blueprint Libraries</span>
              <span className="px-2.5 py-0.5 rounded-full font-mono text-[9px] bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/25">{projects.length} Apps</span>
            </div>

            {/* List block */}
            <div className="space-y-2.5 max-h-[350px] md:max-h-[500px] overflow-y-auto pr-1">
              {projects.map((proj) => {
                const isSelected = proj.id === selectedProjectId;
                const date = new Date(proj.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                
                return (
                  <div
                    key={proj.id}
                    onClick={() => handleSelectProject(proj.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-start group select-none
                      ${isSelected
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-500 text-white shadow-lg shadow-indigo-600/15'
                        : (isDark 
                          ? 'bg-white/5 border-white/5 hover:bg-white/10 text-zinc-300 hover:text-white' 
                          : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50')}`}
                  >
                    <div className="space-y-1 w-11/12">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate pr-1">{proj.name}</span>
                        <span className={`text-[8px] font-mono shrink-0 uppercase px-1.5 py-0.5 rounded font-bold border
                          ${proj.status === 'ready' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/25'}`}
                        >
                          {proj.status === 'ready' ? 'READY' : 'DRAFT'}
                        </span>
                      </div>
                      <p className={`text-[10px] leading-relaxed truncate ${isSelected ? 'text-indigo-100' : 'text-zinc-400'}`}>
                        {proj.idea}
                      </p>
                      <div className={`text-[8px] font-mono ${isSelected ? 'text-indigo-200' : 'text-zinc-500'}`}>
                        Created {date}
                      </div>
                    </div>

                    {/* Simple deletion action */}
                    <button
                      onClick={(e) => handleDeleteProject(proj.id, e)}
                      className={`opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition-all cursor-pointer`}
                      title="Discard project blueprint"
                    >
                      <Trash2 className="w-3 text-zinc-400 hover:text-rose-400" />
                    </button>
                  </div>
                );
              })}

              {projects.length === 0 && (
                <div className="text-center py-10 text-xs text-zinc-500 font-mono">No active project sheets. Sketch an idea below!</div>
              )}
            </div>
          </div>

          {/* Glowing create launcher button in background sidebar bottom */}
          <div className="pt-4 border-t border-slate-800/15 mt-4">
            <button
              onClick={() => {
                setProcessingError(null);
                setShowIdeaModal(true);
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5" />
              Sketch App Idea
            </button>
          </div>
        </aside>

        {/* Right Column: Dynamic Workspace Execution Arena */}
        <section className="flex-1 p-6 overflow-y-auto z-0 select-text">
          
          {/* Overlay compile / loader loading screen */}
          {isProcessing && (
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 text-center select-none">
              <div className="relative mb-6">
                {/* Rotating holographic rings */}
                <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-indigo-600 animate-spin" />
                <Cpu className="w-8 h-8 text-indigo-500 absolute top-6 left-6 animate-pulse" />
              </div>

              <div className="space-y-2 max-w-sm">
                <h4 className="text-base font-bold tracking-tight text-white">Blueprint AI Seeding Engines</h4>
                <p className="text-xs text-indigo-400 font-mono tracking-wide">{processingStep}</p>
                <div className="w-48 bg-slate-800 rounded-full h-1 overflow-hidden mx-auto mt-4">
                  <div className="bg-indigo-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          )}

          {/* Diagnostic Error Banner */}
          {processingError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl mb-6 flex gap-3 items-start max-w-2xl mx-auto select-none">
              <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
              <div className="space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider">Blueprint Architect Error</div>
                <p className="text-xs leading-relaxed">{processingError}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsSettingsOpen(true);
                      setProcessingError(null);
                    }}
                    className="text-[10px] font-bold bg-rose-500/25 px-2.5 py-1 rounded-lg border border-rose-500/40 text-rose-300 hover:bg-rose-500/35 transition-all"
                  >
                    Open Settings Configuration
                  </button>
                  <button
                    onClick={() => setProcessingError(null)}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-200 px-2 py-1"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Context Render routing */}
          {!activeProject ? (
            <div className="h-full flex items-center justify-center">
              <Onboarding theme={theme} onIdeaSubmit={handleCreateDraftProject} />
            </div>
          ) : activeProject.status === 'plan_pending_approval' ? (
            <ProjectDraftSpec
              project={activeProject}
              onApprove={handleApproveProjectDraft}
              onRegenerate={handleRegenerateDraft}
              isProcessing={isProcessing}
              theme={theme}
            />
          ) : (
            // Status IS fully Ready Workspace! Activate Workspace tabs navigation console
            <div className="space-y-6">
              
              {/* Navigation Bar & Project Bundle Downloader wrapper */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sticky top-[10px] z-20">
                {/* Dynamic horizontal Nav Bar selector strip */}
                <div className={`p-1 rounded-2xl border flex flex-wrap gap-1 backdrop-blur-md shadow-xl
                  ${isDark ? 'bg-zinc-950/40 border-white/5' : 'bg-white/80 border-zinc-200'}`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border
                      ${activeTab === 'dashboard'
                        ? (isDark ? 'bg-white/10 text-white border-white/10 shadow-md' : 'bg-zinc-900 text-white border-zinc-900 shadow-sm')
                        : (isDark ? 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border-transparent' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border-transparent')}`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Overview & Tasks
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('prd')}
                    className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border
                      ${activeTab === 'prd'
                        ? (isDark ? 'bg-white/10 text-white border-white/10 shadow-md' : 'bg-zinc-900 text-white border-zinc-900 shadow-sm')
                        : (isDark ? 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border-transparent' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border-transparent')}`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    PRD Specifications
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('db_schema')}
                    className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border
                      ${activeTab === 'db_schema'
                        ? (isDark ? 'bg-white/10 text-white border-white/10 shadow-md' : 'bg-zinc-900 text-white border-zinc-900 shadow-sm')
                        : (isDark ? 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border-transparent' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border-transparent')}`}
                  >
                    <Database className="w-3.5 h-3.5" />
                    Relational SQL
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('wireframes')}
                    className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border
                      ${activeTab === 'wireframes'
                        ? (isDark ? 'bg-white/10 text-white border-white/10 shadow-md' : 'bg-zinc-900 text-white border-zinc-900 shadow-sm')
                        : (isDark ? 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border-transparent' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border-transparent')}`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    Wireframe Skeletons
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('mockups')}
                    className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border
                      ${activeTab === 'mockups'
                        ? (isDark ? 'bg-white/10 text-white border-white/10 shadow-md' : 'bg-zinc-900 text-white border-zinc-900 shadow-sm')
                        : (isDark ? 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border-transparent' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border-transparent')}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    HTML Live Canvas ({activeProject.uiDesigns?.length || 0})
                  </button>
                </div>

                {/* Download Project Action button */}
                <button
                  type="button"
                  onClick={() => setShowDownloadModal(true)}
                  className="px-5 py-3 lg:py-2.5 rounded-2xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xl hover:shadow-emerald-600/25 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider shrink-0 border border-emerald-500/25"
                >
                  <Download className="w-4 h-4 text-white" />
                  Download Project Report
                </button>
              </div>

              {/* Display components mapped on activeTabs */}
              <div className="transition-all duration-300">
                {activeTab === 'dashboard' && (
                  <WorkspaceDashboard
                    project={activeProject}
                    onUpdateTasks={handleUpdateTasks}
                    onUpdateRoadmap={handleUpdateRoadmap}
                    theme={theme}
                  />
                )}

                {activeTab === 'prd' && (
                  <PrdSection
                    prdContent={activeProject.prd || ''}
                    onSavePrd={handleSavePrdContent}
                    theme={theme}
                  />
                )}

                {activeTab === 'db_schema' && (
                  <DbSchemaSection
                    dbSchema={activeProject.dbSchema || ''}
                    onSaveSchema={handleSaveSchemaContent}
                    theme={theme}
                  />
                )}

                {activeTab === 'wireframes' && (
                  <UiSkeletonsSection
                    project={activeProject}
                    onGenerateMockup={handleGenerateHtmlMockup}
                    isGeneratingMockup={isGeneratingMockup}
                    theme={theme}
                  />
                )}

                {activeTab === 'mockups' && (
                  <UiDesignsSection
                    project={activeProject}
                    onSaveDesigns={handleSaveDesigns}
                    theme={theme}
                  />
                )}
              </div>

            </div>
          )}
        </section>

      </main>

      {/* Settings Modal Component Overlay */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsChanged={handleSettingsChanged}
        theme={theme}
      />

      {/* Quick Launch Idea Popup Modal */}
      {showIdeaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={() => setShowIdeaModal(false)} />
          
          <div className={`relative w-full max-w-lg p-6 rounded-2xl border shadow-xl transition-all duration-300
            ${isDark ? 'bg-slate-900/90 text-slate-100 border-white/10' : 'bg-white text-slate-900 border-slate-200'}`}
          >
            <button 
              onClick={() => setShowIdeaModal(false)} 
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-1.5">
              <Compass className="w-5 h-5 text-indigo-500" />
              Sketch App Blueprint Vision
            </h3>

            <div className="space-y-4">
              <textarea
                value={newIdeaText}
                onChange={(e) => setNewIdeaText(e.target.value)}
                placeholder="Sketch the page goal, specific features, user roles, integrations, or data persistence schemas..."
                className={`w-full h-32 text-xs p-3.5 rounded-xl border outline-none resize-none
                  ${isDark ? 'bg-slate-950/60 border-white/10 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-500'}`}
              />

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowIdeaModal(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!newIdeaText.trim()}
                  onClick={() => handleCreateDraftProject(newIdeaText)}
                  className={`px-5 py-2.5 text-xs font-semibold rounded-xl text-white transition-all duration-250 cursor-pointer
                    ${newIdeaText.trim() 
                      ? 'bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/15' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'}`}
                >
                  Construct Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Options Modal Dialog Block */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm animate-fade-in" onClick={() => setShowDownloadModal(false)} />
          
          <div className={`relative w-full max-w-xl p-6 md:p-8 rounded-3xl border shadow-2xl transition-all duration-300 transform scale-100 relative overflow-hidden
            ${isDark ? 'bg-zinc-900 border-white/10 text-zinc-100 shadow-black' : 'bg-white text-slate-800 border-slate-200'}`}
          >
            {/* Ambient subtle glow background */}
            {isDark && <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full" />}
            
            <button 
              onClick={() => setShowDownloadModal(false)} 
              className={`absolute top-5 right-5 p-1.5 rounded-lg transition-colors
                ${isDark ? 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6 select-none">
              <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-indigo-400">Workspace Exporter</span>
              <h3 className="text-xl font-extrabold tracking-tight mt-1 flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-500" />
                Download Blueprint Deliverables
              </h3>
              <p className={`text-xs mt-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'} leading-relaxed`}>
                Export this conceptual catalog to share with colleagues or feed it into standard system development workspaces.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Option 1: PDF Document */}
              <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-300
                ${isDark ? 'bg-zinc-950/30 border-white/5 hover:border-indigo-500/20' : 'bg-slate-50 border-slate-200/50 hover:border-indigo-200'}`}
              >
                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 text-xs font-bold leading-none">
                      PDF
                    </div>
                    <span className="text-xs font-extrabold">Strategic PDF Report</span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Generates a visually formatted project document featuring the conceptual abstract blueprint, full PRD specifications, and structured roadmap milestones. Recommended for presentations.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-600/15 transition-all text-center uppercase tracking-wide cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  Download PDF
                </button>
              </div>

              {/* Option 2: Full JSON Bundle */}
              <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-300
                ${isDark ? 'bg-zinc-950/30 border-white/5 hover:border-emerald-500/20' : 'bg-slate-50 border-slate-200/50 hover:border-emerald-200'}`}
              >
                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold leading-none">
                      JSON
                    </div>
                    <span className="text-xs font-extrabold">Data Model Bundle</span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Bundles the full machine-parsable catalog schema including PRD logs, milestones timeline, task checklists, Relational columns, wireframes, and live high-fidelity mockups code.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadProject}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl hover:shadow-lg hover:shadow-emerald-600/15 transition-all text-center uppercase tracking-wide cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Database className="w-4 h-4" />
                  Download JSON
                </button>
              </div>

            </div>

            <div className={`mt-6 pt-4 border-t text-[10px] text-center font-mono ${isDark ? 'border-white/5 text-zinc-500' : 'border-slate-100 text-slate-400'}`}>
              Both file types compiled in real-time within the local web container.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
