import { Project, Settings, Task } from '../types';

const STORAGE_KEYS = {
  PROJECTS: 'ai_blueprint_projects',
  SETTINGS: 'ai_blueprint_settings',
};

// Seeding high-fidelity mockup data for immediate user delight on first launch
const SAMPLE_HTML_DASHBOARD = `
<div class="space-y-6">
  <!-- Top Stats Row -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div class="bg-indigo-950/40 p-5 rounded-2xl border border-indigo-500/20 backdrop-blur-md">
      <div class="text-xs text-indigo-300 font-mono tracking-wider uppercase mb-1">Weekly Active Users</div>
      <div class="text-3xl font-semibold tracking-tight text-white">12,480</div>
      <div class="text-xs text-emerald-400 mt-2 flex items-center">
        <span>▲ +18.4%</span>
        <span class="text-slate-400 ml-2">from last week</span>
      </div>
    </div>
    
    <div class="bg-emerald-950/40 p-5 rounded-2xl border border-emerald-500/20 backdrop-blur-md">
      <div class="text-xs text-emerald-300 font-mono tracking-wider uppercase mb-1">OCR Receipt Match Rate</div>
      <div class="text-3xl font-semibold tracking-tight text-white">99.2%</div>
      <div class="text-xs text-emerald-400 mt-2 flex items-center">
        <span>▲ +1.5%</span>
        <span class="text-slate-400 ml-2">near zero errors</span>
      </div>
    </div>
    
    <div class="bg-cyan-950/40 p-5 rounded-2xl border border-cyan-500/20 backdrop-blur-md">
      <div class="text-xs text-cyan-300 font-mono tracking-wider uppercase mb-1">Avg Settlement Time</div>
      <div class="text-3xl font-semibold tracking-tight text-white">4.2 min</div>
      <div class="text-xs text-rose-400 mt-2 flex items-center">
        <span>▼ -35.1%</span>
        <span class="text-slate-400 ml-2">faster processing</span>
      </div>
    </div>
    
    <div class="bg-purple-950/40 p-5 rounded-2xl border border-purple-500/20 backdrop-blur-md">
      <div class="text-xs text-purple-300 font-mono tracking-wider uppercase mb-1">Total Bills Resolved</div>
      <div class="text-3xl font-semibold tracking-tight text-white">$45,190</div>
      <div class="text-xs text-purple-300 mt-2 flex items-center">
        <span class="bg-purple-500/20 px-2 py-0.5 rounded text-[10px]">PRODUCTION READY</span>
      </div>
    </div>
  </div>

  <!-- Main Content Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Active Payments Queue (2 Cols) -->
    <div class="lg:col-span-2 bg-slate-900/40 rounded-2xl border border-slate-700/30 p-6 backdrop-blur-md">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h4 class="text-lg font-semibold text-white">Pending Receipt Settlements</h4>
          <p class="text-xs text-slate-400">Latest receipts uploaded via mobile app scan</p>
        </div>
        <button class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all shadow-lg shadow-indigo-600/20">
          + Scan Receipt
        </button>
      </div>

      <div class="space-y-3">
        <!-- Settlement Item 1 -->
        <div class="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-all border border-slate-700/10">
          <div class="flex items-center space-x-3">
            <div class="p-2.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
               <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
               </svg>
            </div>
            <div>
              <div class="text-sm font-medium text-white">Whole Foods Groceries</div>
              <div class="text-xs text-slate-400">Shared with Emily & Alex • OCR matched 12 items</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm font-semibold text-white">$142.50</div>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              OCR VERIFIED
            </span>
          </div>
        </div>

        <!-- Settlement Item 2 -->
        <div class="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-all border border-slate-700/10">
          <div class="flex items-center space-x-3">
            <div class="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
               <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
               </svg>
            </div>
            <div>
              <div class="text-sm font-medium text-white">Gas Station Refuel</div>
              <div class="text-xs text-slate-400">Shared with Jordan • Equal Split</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm font-semibold text-white">$45.00</div>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
              PENDING SETTLEMENT
            </span>
          </div>
        </div>

        <!-- Settlement Item 3 -->
        <div class="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-all border border-slate-700/10">
          <div class="flex items-center space-x-3">
            <div class="p-2.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
               <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
               </svg>
            </div>
            <div>
              <div class="text-sm font-medium text-white">Dinner at Gusto's</div>
              <div class="text-xs text-slate-400">Shared with Team • Custom item weights parsed</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm font-semibold text-white">$310.80</div>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              FULLY RESOLVED
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Split Analytics (CSS Graph) -->
    <div class="bg-slate-900/40 rounded-2xl border border-slate-700/30 p-6 backdrop-blur-md">
      <h4 class="text-lg font-semibold text-white mb-2">Member Balances</h4>
      <p class="text-xs text-slate-400 mb-6">Net amount owed (+), and owing (-)</p>

      <div class="space-y-4">
        <!-- Alex -->
        <div>
          <div class="flex justify-between text-xs font-semibold text-slate-300 mb-1">
            <span>Alex (You)</span>
            <span class="text-emerald-400">+$124.50 (Owed)</span>
          </div>
          <div class="w-full bg-slate-800 rounded-full h-2">
            <div class="bg-emerald-500 h-2 rounded-full" style="width: 78%"></div>
          </div>
        </div>

        <!-- Emily -->
        <div>
          <div class="flex justify-between text-xs font-semibold text-slate-300 mb-1">
            <span>Emily Watson</span>
            <span class="text-red-400">-$42.00 (Owes)</span>
          </div>
          <div class="w-full bg-slate-800 rounded-full h-2">
            <div class="bg-red-500 h-2 rounded-full" style="width: 35%"></div>
          </div>
        </div>

        <!-- Jordan -->
        <div>
          <div class="flex justify-between text-xs font-semibold text-slate-300 mb-1">
            <span>Jordan K.</span>
            <span class="text-red-400">-$82.50 (Owes)</span>
          </div>
          <div class="w-full bg-slate-800 rounded-full h-2">
            <div class="bg-red-500 h-2 rounded-full" style="width: 55%"></div>
          </div>
        </div>

        <!-- Sofia -->
        <div>
          <div class="flex justify-between text-xs font-semibold text-slate-300 mb-1">
            <span>Sofia Ramirez</span>
            <span class="text-slate-400">$0.00 (Settled)</span>
          </div>
          <div class="w-full bg-slate-800 rounded-full h-2">
            <div class="bg-slate-600 h-2 rounded-full" style="width: 10%"></div>
          </div>
        </div>
      </div>

      <div class="mt-6 pt-5 border-t border-slate-700/30 text-center">
        <button class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 hover:text-white transition-all rounded-xl text-xs font-semibold text-slate-300">
          Settle All Group Balances
        </button>
      </div>
    </div>
  </div>
</div>
`;

const SAMPLE_HTML_METRICS = `
<div class="space-y-6">
  <!-- Grid of Metrics -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="bg-indigo-950/20 rounded-2xl border border-indigo-500/20 p-6 flex flex-col justify-between">
      <div>
        <span class="text-[10px] text-indigo-400 font-mono uppercase tracking-wider">Storage Stats</span>
        <h4 class="text-slate-100 font-semibold mb-2">S3 Image Cache Bucket</h4>
        <p class="text-xs text-slate-400">Automatically caches raw scanning imagery with an expiration cycle of 30 days to limit space.</p>
      </div>
      <div class="mt-6">
        <div class="flex justify-between text-xs mb-1 font-mono text-slate-400">
          <span>Usage: 14.5 GB / 50 GB</span>
          <span>29%</span>
        </div>
        <div class="w-full bg-slate-800 rounded-full h-1.5">
          <div class="bg-indigo-500 h-1.5 rounded-full" style="width: 29%"></div>
        </div>
      </div>
    </div>

    <div class="bg-emerald-950/20 rounded-2xl border border-emerald-500/20 p-6 flex flex-col justify-between">
      <div>
        <span class="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">Integrations</span>
        <h4 class="text-slate-100 font-semibold mb-2">Venmo & Stripe Adapters</h4>
        <p class="text-xs text-slate-400">Triggers instantaneous ledger reconciliations directly with external payout handlers on settlement approval.</p>
      </div>
      <div class="mt-6 pt-2">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          ● Connected
        </span>
      </div>
    </div>

    <div class="bg-cyan-950/20 rounded-2xl border border-cyan-500/20 p-6 flex flex-col justify-between">
      <div>
        <span class="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">AI Engines</span>
        <h4 class="text-slate-100 font-semibold mb-2">OCR Invoice OCR v4-vision</h4>
        <p class="text-xs text-slate-400">Deep layout parser designed to construct accurate tables from blurred camera snaps or long folded grocery bills.</p>
      </div>
      <div class="mt-6">
        <div class="flex justify-between text-xs mb-1 font-mono text-slate-400">
          <span>Model confidence index</span>
          <span>98.6/100</span>
        </div>
        <div class="w-full bg-slate-800 rounded-full h-1.5">
          <div class="bg-cyan-400 h-1.5 rounded-full" style="width: 98%"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- DB Entities Relations Preview -->
  <div class="p-6 bg-slate-900/40 rounded-2xl border border-slate-700/30">
    <div class="mb-4">
      <h4 class="text-lg font-semibold text-white">System Architecture Mapping</h4>
      <p class="text-xs text-slate-400">Visual topology layout representing relational pathways of database schemas</p>
    </div>

    <div class="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-800/20 p-6 rounded-xl border border-slate-700/20">
      <div class="p-4 bg-slate-950 rounded-xl border border-slate-700/60 w-full md:w-1/4 text-center">
        <div class="font-semibold text-sm text-indigo-400">Users Table</div>
        <div class="text-[10px] text-slate-400 font-mono mt-1">ID (PK) • Email • VenmoHandle</div>
      </div>
      
      <div class="text-slate-500 text-lg">── (1 to Many) ──▶</div>

      <div class="p-4 bg-slate-950 rounded-xl border border-slate-700/60 w-full md:w-1/4 text-center">
        <div class="font-semibold text-sm text-emerald-400">Receipts Table</div>
        <div class="text-[10px] text-slate-400 font-mono mt-1">ID (PK) • UploaderId (FK) • Subtotal</div>
      </div>

      <div class="text-slate-500 text-lg">── (1 to Many) ──▶</div>

      <div class="p-4 bg-slate-950 rounded-xl border border-slate-700/60 w-full md:w-1/4 text-center">
        <div class="font-semibold text-sm text-cyan-400">ReceiptItems</div>
        <div class="text-[10px] text-slate-400 font-mono mt-1">ID (PK) • ReceiptId (FK) • Price</div>
      </div>
    </div>
  </div>
</div>
`;

// Beautiful complete demo project seed
const DEMO_PROJECT: Project = {
  id: 'demo-split-bill-ocr',
  idea: 'A real-time split-bill application for shared house expenses utilizing mobile OCR camera snaps to scan, weight and divide receipts among housemates.',
  name: 'SplitBill OCR',
  description: 'OCR Scanning based split billing ledger platform',
  status: 'ready',
  createdAt: new Date().toISOString(),
  draftPlan: {
    name: 'SplitBill OCR Ledger',
    abstract: 'A modern, real-time shared budget and settlement tracker that parses physical receipts using OCR vision, matches items to users dynamically, and offers a smooth balance reconciliation.',
    techStack: 'Vite React, Tailwind CSS, Local Storage persistence, OpenAI-compatible Vision model APIs, and Lucide illustration accents.',
    coreFeatures: [
      'Visual OCR scanning to read grocery receipts item-by-item.',
      'Drag-and-drop item mapping to group members.',
      'Real-time mesh ledger summarizing net balances (who owes whom).',
      'One-tap peer settlements (integrated Venmo schema anchors).'
    ]
  },
  prd: `# Product Requirement Document (PRD)

## 1. Objective
Enable roommates and traveling cohorts to snap photos of physical invoices and instantly divide nested itemizations, taxes, and service tips fairly, reducing settlement friction.

## 2. Product Scope
- **Vision Scan Module**: Extracts text from raw image uploads to generate a structured draft receipt.
- **Mesh Balance Solver**: Resolves complex inter-group IOUs into a minimal set of transactions.
- **Local Ledger Cache**: Stores records locally on device for complete offline compatibility and speeds.

## 3. Core Functional Requirements
- **Item Assignment UI**: Tap individual grocery items and assign them to one or more members.
- **Dynamic Ledger Grid**: Real-time balance charts updating dynamically with each invoice modification.
- **Symmetric Splits**: Supports equal, weighted, or specific numeric percentages.

## 4. Edge Cases & Validations
- Handling double-spaced items or complex invoice formats.
- Safe division when amounts yield fractions of cents (carryover logic).
- Group members deletion while maintaining active settlement balance references.`,
  
  dbSchema: `-- PostgreSQL Relational Schema for SplitBill OCR Ledger

-- 1. Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  avatar_url TEXT
);

-- 2. Groups table
CREATE TABLE expense_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Group Members Link table
CREATE TABLE group_members (
  group_id UUID REFERENCES expense_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (group_id, user_id)
);

-- 4. Receipts / Invoices table
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES expense_groups(id) ON DELETE CASCADE,
  uploader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(150) NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  ocr_raw_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Receipt Items table
CREATE TABLE receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
  item_name VARCHAR(150) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1
);

-- 6. Item Assignments (Splits) table
CREATE TABLE assignments (
  item_id UUID REFERENCES receipt_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  split_weight NUMERIC(5, 2) DEFAULT 1.00,
  PRIMARY KEY (item_id, user_id)
);`,

  tasks: [
    { id: 't-1', title: 'Prepare design system and container specs', description: 'Setup custom glassmorphism layers, dark/light backdrop shadows, and responsive sizing grids.', status: 'completed', priority: 'high', phaseId: 'Phase 1: Setup' },
    { id: 't-2', title: 'Code local ledger database caching layers', description: 'Write standard key-value access wrappers on LocalStorage to index member transactions list safely.', status: 'completed', priority: 'high', phaseId: 'Phase 1: Setup' },
    { id: 't-3', title: 'Implement mesh financial ledger solver', description: 'Write an algorithm (greedy vector approach) to collapse recursive IOUs down to the absolute shortest path list of balance payoffs.', status: 'in_progress', priority: 'high', phaseId: 'Phase 2: Core Engineering' },
    { id: 't-4', title: 'Build receipts drag-and-drop assigner', description: 'An interactive horizontal layout displaying receipt items as cards which users can tap-and-assign.', status: 'todo', priority: 'medium', phaseId: 'Phase 2: Core Engineering' },
    { id: 't-5', title: 'Add custom Vision parsing endpoints', description: 'Establish backend proxies to safely format multipart bills photo arrays into JSON strings.', status: 'todo', priority: 'medium', phaseId: 'Phase 3: State Mechanics' },
    { id: 't-6', title: 'Form validators and error handling guides', description: 'Establish alert templates when inputs contain faulty characters, negative prices, or empty names.', status: 'todo', priority: 'low', phaseId: 'Phase 4: Design Accents' }
  ],
  
  roadmap: [
    { id: 'm-1', title: 'Phase 1: Setup & Groundwork', description: 'Develop project templates, coordinate canvas models, set up global state systems, and launch basic view structure.', status: 'completed' },
    { id: 'm-2', title: 'Phase 2: Core Engineering & Database Integration', description: 'Compose API adapters, build visual UI modules, link schema fields, and establish transactional equations.', status: 'active' },
    { id: 'm-3', title: 'Phase 3: State Mechanics & Logic Enhancements', description: 'Wire image detection services, settle ledger algorithms, compile security assertions, and test validation gates.', status: 'pending' },
    { id: 'm-4', title: 'Phase 4: Design Accents & Polishing', description: 'Implement transition curves, finish state flags, complete empty dashboards, and generate responsive screen optimizations.', status: 'pending' }
  ],

  uiSkeletons: [
    { id: 'sk-1', pageName: 'Main Bills Dashboard', description: 'The hub where roommates see active receipts, scan bills, view balance circles, and start custom payouts.', layoutStructure: 'Grid structure with top metrics banner, 2/3 width table queue, and 1/3 width balance leaderboards.', components: ['Stats banner cards', 'Receipts tabular queue', 'Payoff shortcut list', 'Member balance bars'] },
    { id: 'sk-2', pageName: 'Live Receipt Builder & Assigner', description: 'The workspace view containing parsed optical text where cards are assigned to housemate icons.', layoutStructure: 'Three-tiered horizontal viewport. Receipts on leftmost column, assignable avatars on main rail, status checkers on right.', components: ['Draggable invoice items', 'Active group avatar tags', 'Summary checklist', 'Interactive manual inputs'] },
    { id: 'sk-3', pageName: 'Group Balance Reconciler & Settlements', description: 'Consolidation visualizer displaying final mesh payment pathways and Venmo/Zelle shortcut actions.', layoutStructure: 'Split hero showcase. Top features absolute transaction vectors, bottom hosts detailed settlement checklist.', components: ['Graph layout of node transactions', 'Copyable pay info keys', 'Payment verification buttons'] }
  ],

  uiDesigns: [
    { id: 'd-1', pageName: 'Main Bills Dashboard', description: 'A fluid responsive web view containing statistics charts, receipt item status check, and balances mesh diagram.', htmlCode: SAMPLE_HTML_DASHBOARD },
    { id: 'd-2', pageName: 'System Architecture Mapping', description: 'High-fidelity mockup exhibiting backend schemas and integration states.', htmlCode: SAMPLE_HTML_METRICS }
  ]
};

export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        openaiApiKey: parsed.openaiApiKey || '',
        openaiBaseUrl: parsed.openaiBaseUrl || '',
        openaiModel: parsed.openaiModel || 'Minimax-M3',
      };
    }
  } catch (e) {
    console.error('Error fetching settings', e);
  }
  return {
    openaiApiKey: '',
    openaiBaseUrl: 'https://api.minimax.io/v1/text/chatcompletion_v2',
    openaiModel: 'Minimax-M3',
  };
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
}

export function getProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (raw) {
      const parsed = JSON.parse(raw) as Project[];
      // If empty array, default to demo project
      if (parsed.length === 0) {
        return [DEMO_PROJECT];
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error fetching projects', e);
  }
  // Load initial seed demo project
  return [DEMO_PROJECT];
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Error saving projects', e);
  }
}

export function saveProject(project: Project): void {
  const list = getProjects();
  const existingIndex = list.findIndex(p => p.id === project.id);
  
  if (existingIndex >= 0) {
    list[existingIndex] = project;
  } else {
    list.unshift(project);
  }
  
  saveProjects(list);
}

export function deleteProject(projectId: string): void {
  const list = getProjects();
  const filtered = list.filter(p => p.id !== projectId);
  saveProjects(filtered);
}
