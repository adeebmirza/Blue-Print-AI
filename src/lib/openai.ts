import { OpenAI } from 'openai';
import { Settings, DraftPlan, Task, Milestone, UISkeleton, UIDesign } from '../types';

/**
 * Creates an instance of the OpenAI client dynamically using settings stored by the user.
 */
function getOpenAIClient(settings: Settings): OpenAI {
  if (!settings.openaiApiKey) {
    throw new Error('OpenAI API Key is missing. Please configure it in Settings.');
  }
  
  // Safe default base URL if empty
  const baseURL = settings.openaiBaseUrl ? settings.openaiBaseUrl.trim() : 'https://api.openai.com/v1';

  return new OpenAI({
    apiKey: settings.openaiApiKey,
    baseURL: baseURL,
    dangerouslyAllowBrowser: true, // Required for running from the client-side app
  });
}

/**
 * Clean helper to strip potential model-wrapped markdown formatting from LLM answers.
 */
function cleanJsonResponse(response: string): string {
  let cleaned = response.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

/**
 * Standard system configuration prompting
 */
const SYSTEM_JSON_PROMPT = `You are a world-class Full Stack System Architect and Lead Product Engineer.
Your task is to generate high-fidelity, highly accurate, and extremely practical software architectural specifications.
Always output validation-ready JSON. Do not include introductory text, conversation, or wrapping except the requested JSON specification.`;

/**
 * Stage 1: Generate initial Draft Plan of the project based on the raw idea.
 */
export async function generateDraftPlan(idea: string, settings: Settings): Promise<DraftPlan> {
  const openai = getOpenAIClient(settings);
  const modelName = settings.openaiModel ? settings.openaiModel.trim() : 'gpt-4o-mini';

  const userPrompt = `Develop a project blueprint proposal and initial design layout plan for this idea:
"${idea}"

Generate a JSON object matching this structure:
{
  "name": "Short Descriptive App Name (avoid prefix buzzwords like Quick/Smart if possible, or create a clean literal elegant name)",
  "abstract": "A compelling, thorough, 2-to-3 sentence explanation of precisely what this app solves and how it functions.",
  "coreFeatures": [
    "A concise title and description of a core required feature...",
    "Another distinct core feature details...",
    "At least 4 crucial features are needed"
  ],
  "techStack": "Detailed, highly optimized stack tailored for this idea. Example: React SPA with Tailwind CSS, TypeScript, Client-side storage/IndexedDB for local performance, and potential server-side APIs for specialized parts."
}

Ensure the response is valid, parseable JSON only.`;

  try {
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: SYSTEM_JSON_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const text = response.choices[0]?.message?.content || '{}';
    const cleaned = cleanJsonResponse(text);
    return JSON.parse(cleaned) as DraftPlan;
  } catch (error: any) {
    console.error('generateDraftPlan error:', error);
    throw new Error(error?.message || 'Failed to generate initial project plan.');
  }
}

/**
 * Stage 2: Generate Core Project Assets - PRD, Database Schema, Roadmap, and Task Checklist.
 */
export interface GeneratedCoreAssets {
  prd: string;
  dbSchema: string;
  tasks: Omit<Task, 'id'>[];
  roadmap: Omit<Milestone, 'id'>[];
}

export async function generateProjectAssets(
  idea: string,
  plan: DraftPlan,
  settings: Settings
): Promise<GeneratedCoreAssets> {
  const openai = getOpenAIClient(settings);
  const modelName = settings.openaiModel ? settings.openaiModel.trim() : 'gpt-4o-mini';

  const userPrompt = `The user has approved the concept plan for "${plan.name}". Let's create the robust, high-fidelity technical blueprints.
Original Idea: "${idea}"
Approved Concept:
- Abstract: ${plan.abstract}
- Selected Tech Stack: ${plan.techStack}
- Core Features: ${plan.coreFeatures.join(', ')}

Please generate highly polished artifacts matching this JSON format exactly:
{
  "prd": "Write a meticulous, detailed Markdown document for the Product Requirement Document (PRD). Include: 1. Objective, 2. Target Audience, 3. Detailed Scope & Feature Specifications, 4. Tech Stack Overview, 5. Edge cases, and 6. Post-MVP scope. Use standard markdown headlines, details, and lists.",
  "dbSchema": "Create a fully documented relational database schema or structure spec. It should be presented in standard SQL (CREATE TABLE statements) with clean field-level comments, primary keys, foreign keys, constraints, indexes, and brief comments explaining each table's purpose. Make it look professional and ready for Drizzle, PostgreSQL, or Sqlite.",
  "roadmap": [
    {
      "title": "Phase 1: Setup & Groundwork",
      "description": "Establish environment variables, repository configurations, boilerplate routing, database tables seeding, and styling layout initialization.",
      "status": "pending"
    },
    {
      "title": "Phase 2: Core Engineering & Database Integration",
      "description": "Build primary backend controllers/client modules, connect schema entities, wire forms, and prove core input-output pathways.",
      "status": "pending"
    },
    {
      "title": "Phase 3: State Mechanics & Logic Enhancements",
      "description": "Integrate key business rules, calculations, alerts, filter configurations, and state validations.",
      "status": "pending"
    },
    {
      "title": "Phase 4: Design Accents & Polishing",
      "description": "Form validation polish, micro-animations, empty-states, responsive layout refinements, and final verification.",
      "status": "pending"
    }
  ],
  "tasks": [
    {
      "title": "Configure project layout and styles",
      "description": "Initialize standard index.css, load fonts, setup core container dimensions and viewport parameters.",
      "status": "todo",
      "priority": "high",
      "phaseId": "Phase 1: Setup"
    },
    {
      "title": "Create primary database migration seeds",
      "description": "Write initial tables, indexes, and basic seed parameters to populate default options.",
      "status": "todo",
      "priority": "high",
      "phaseId": "Phase 1: Setup"
    },
    {
      "title": "Implement core UI wrapper and navigation system",
      "description": "Build responsive application header, sidebar shell, panel grids, and dark/light toggles.",
      "status": "todo",
      "priority": "medium",
      "phaseId": "Phase 1: Setup"
    },
    {
      "title": "Build main forms logic and schemas",
      "description": "Write input fields for capturing core entities with real-time feedback and validation handlers.",
      "status": "todo",
      "priority": "high",
      "phaseId": "Phase 2: Core Engineering"
    },
    {
      "title": "Implement state controllers and cache syncing",
      "description": "Connect the client store hooks or database state triggers to update the browser/local databases.",
      "status": "todo",
      "priority": "medium",
      "phaseId": "Phase 2: Core Engineering"
    }
  ]
}

Please return the response as a single, valid parseable JSON object matching the specification above. Provide deep technical values in these objects, not just dummy summaries. Try to generate at least 8 logical tasks matching the milestones of the project.`;

  try {
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: SYSTEM_JSON_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.6,
      response_format: { type: 'json_object' }
    });

    const text = response.choices[0]?.message?.content || '{}';
    const cleaned = cleanJsonResponse(text);
    return JSON.parse(cleaned) as GeneratedCoreAssets;
  } catch (error: any) {
    console.error('generateProjectAssets error:', error);
    throw new Error(error?.message || 'Failed to generate comprehensive project assets.');
  }
}

/**
 * Stage 3: Generate page UI skeletons (Wireframes/layouts).
 */
export async function generateUISkeletons(
  plan: DraftPlan,
  settings: Settings
): Promise<UISkeleton[]> {
  const openai = getOpenAIClient(settings);
  const modelName = settings.openaiModel ? settings.openaiModel.trim() : 'gpt-4o-mini';

  const userPrompt = `Based on the approved project structure for "${plan.name}" with tech stack "${plan.techStack}", 
we need to lay out the UI Wireframe/Skeleton pages that must be implemented.

Generate a JSON array of 3 distinct page skeletons representing the typical system view structure (e.g. Dashboard, Details/Creator, and Analytics/Settings Workspace).

Return ONLY a JSON object of the form:
{
  "skeletons": [
    {
      "pageName": "Name of page/view (e.g., Creator Workspace, Metrics Dashboard)",
      "description": "A high-level explanation of the view's layout, focus, and user entry pathways.",
      "layoutStructure": "Visual description of grid/flex layouts (e.g., 'Two-column bento box with fluid sidebar and grid controls')",
      "components": [
        "Component A (e.g., Filter pill cluster with hover states)",
        "Component B",
        "Component C"
      ]
    }
  ]
}

Ensure it is valid, parseable JSON matching this template.`;

  try {
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: SYSTEM_JSON_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const text = response.choices[0]?.message?.content || '{}';
    const cleaned = cleanJsonResponse(text);
    const parsed = JSON.parse(cleaned);
    return parsed.skeletons || [];
  } catch (error: any) {
    console.error('generateUISkeletons error:', error);
    throw new Error(error?.message || 'Failed to generate UI skeletons.');
  }
}

/**
 * Stage 4: Generate HTML/Tailwind high-fidelity designs for specific pages.
 */
export async function generateUIDesign(
  plan: DraftPlan,
  pageName: string,
  pageDescription: string,
  skeletons: UISkeleton[],
  settings: Settings
): Promise<string> {
  const openai = getOpenAIClient(settings);
  const modelName = settings.openaiModel ? settings.openaiModel.trim() : 'gpt-4o-mini';

  const userPrompt = `Create a premium, high-fidelity responsive HTML design for the page "${pageName}".
Application: ${plan.name}
Description of application: ${plan.abstract}
Tech Stack: ${plan.techStack}
Page Goal: ${pageDescription}

You MUST follow these design rules for this HTML representation:
1. Deliver a FULL static HTML content inside a <div> sandbox. It will be injected directly into our app preview. Only use standard HTML.
2. Styling: Use Tailwind CSS utility classes. Since this HTML is rendered in our sandbox, assume typical Tailwind CSS v3 or v4 classes.
3. Design vibe: It should be visually STUNNING, utilizing glassmorphism, beautiful gradients, structured cards, modern soft-edged buttons, subtle shadows, and realistic copy (NOT lorem ipsum). High content density is encouraged!
4. Create complete interactive components with dummy layouts like statistics, a beautiful data list, rich forms, charts made of stylized CSS div bars/lines, modern user avatars, and status badges.
5. Do NOT include standard full HTML boilerplate like <html>, <head> or <body> tags. Start directly with a container <div> (e.g. <div class="bg-slate-900/40 p-6 rounded-xl border border-white/10 glassmorphism...">).
6. Ensure adequate contrast and a modern tech aesthetic (e.g. deep blues/emerald accents, beautiful slate backgrounds, clear buttons with hover feedback).
7. If needed, you can use Lucide glassmorphic icon-like indicators or standard unicode symbols/emoji/SVG if icons are needed. Standard SVG icons are superb!
8. Make the design functional: include realistic menus, tabs, and fields. Include dummy interactive attributes where relevant, but most of all focus on complete mockup quality.

Generate ONLY the code snippet containing the HTML inside a parent container widget. Do not write text outside the HTML response.`;

  try {
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: 'You are an elite front-end layout engineer specializing in modern glassmorphic, clean dashboard designs. Your outputs must contain ONLY the formatted layout HTML, with no introductory text, markdown code-block wraps, or conversational chatter.' },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7
    });

    let rawHtml = response.choices[0]?.message?.content || '';
    
    // Clean up code tags if they are still wrapped
    if (rawHtml.startsWith('```html')) {
      rawHtml = rawHtml.substring(7);
    } else if (rawHtml.startsWith('```')) {
      rawHtml = rawHtml.substring(3);
    }
    if (rawHtml.endsWith('```')) {
      rawHtml = rawHtml.substring(0, rawHtml.length - 3);
    }
    
    return rawHtml.trim();
  } catch (error: any) {
    console.error('generateUIDesign error:', error);
    throw new Error(error?.message || 'Failed to generate high-fidelity HTML design.');
  }
}
