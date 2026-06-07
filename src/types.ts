export interface Settings {
  openaiApiKey: string;
  openaiBaseUrl: string;
  openaiModel: string;
}

export interface DraftPlan {
  name: string;
  abstract: string;
  coreFeatures: string[];
  techStack: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  phaseId?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
}

export interface UISkeleton {
  id: string;
  pageName: string;
  description: string;
  layoutStructure: string;
  components: string[];
}

export interface UIDesign {
  id: string;
  pageName: string;
  description: string;
  htmlCode: string;
}

export interface Project {
  id: string;
  idea: string;
  name: string;
  description: string;
  status: 'drafting_plan' | 'plan_pending_approval' | 'generating_assets' | 'ready';
  createdAt: string;
  settingsUsed?: Settings;
  
  draftPlan?: DraftPlan;
  prd?: string;
  dbSchema?: string;
  tasks: Task[];
  roadmap: Milestone[];
  uiSkeletons: UISkeleton[];
  uiDesigns: UIDesign[];
}
