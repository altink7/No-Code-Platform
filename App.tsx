

import React, { useState, useEffect, useCallback } from 'react';
import { Project, AppPlatform, Step, Screen, ProjectResources, UIComponent, NodeType } from './types';
import { SetupWizard, PlatformSelection } from './components/Setup';
import { TemplateSelector } from './components/TemplateSelector';
import { FlowView } from './components/Builder/FlowView';
import { ScreenEditor } from './components/Builder/ScreenEditor';
import { Button } from './components/UI';
import { ExportModal } from './components/ExportModal';
import { PreviewModal } from './components/PreviewModal';
import { HelpModal } from './components/HelpModal';
import { Dashboard } from './components/Dashboard';
import { ResourceManager } from './components/ResourceManager';

export default function App() {
  // Global State
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [view, setView] = useState<'dashboard' | 'builder'>('dashboard');
  
  // Builder State
  const [step, setStep] = useState<Step>('setup');
  const [builderView, setBuilderView] = useState<'flow' | 'editor'>('flow');
  const [activeScreenId, setActiveScreenId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showResources, setShowResources] = useState(false);

  // Load projects from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('nebula_projects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load projects", e);
      }
    }
  }, []);

  // Save projects to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('nebula_projects', JSON.stringify(projects));
  }, [projects]);

  // Save current project state to projects list
  useEffect(() => {
    if (currentProject) {
      setProjects(prev => prev.map(p => p.id === currentProject.id ? { ...currentProject, lastModified: Date.now() } : p));
    }
  }, [currentProject]);

  const handleCreateNew = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      description: '',
      platform: 'web',
      template: 'blank',
      colors: {
        primary: '#06b6d4',
        secondary: '#d946ef',
        background: '#0f172a',
        text: '#f8fafc'
      },
      font: { name: 'Inter', family: 'sans-serif' },
      screens: [],
      resources: { 
        translations: [], 
        assets: [],
        languages: ['en'],
        defaultLanguage: 'en'
      },
      lastModified: Date.now()
    };
    setCurrentProject(newProject);
    setStep('setup');
    setBuilderView('flow');
    setView('builder');
  };

  const handleOpenProject = (project: Project) => {
    setCurrentProject(project);
    setStep('builder'); // Skip setup for existing projects
    setBuilderView('flow');
    setView('builder');
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (currentProject?.id === projectId) {
        setView('dashboard');
        setCurrentProject(null);
      }
    }
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setCurrentProject(null);
  };

  // Builder Logic
  const handlePlatformSelect = (platform: AppPlatform) => {
    if (!currentProject) return;
    setCurrentProject({ ...currentProject, platform });
    setStep('template');
  };

  const handleTemplateSelect = (templateId: string, screens: Screen[]) => {
    if (!currentProject) return;
    setCurrentProject({ ...currentProject, template: templateId, screens });
    
    // Add new project to list if not already there
    if (!projects.find(p => p.id === currentProject.id)) {
        setProjects(prev => [...prev, { ...currentProject, template: templateId, screens }]);
    }
    setStep('builder');
  };

  const updateScreen = (updatedScreen: Screen) => {
    if (!currentProject) return;
    setCurrentProject(prev => prev ? ({
      ...prev,
      screens: prev.screens.map(s => s.id === updatedScreen.id ? updatedScreen : s)
    }) : null);
  };

  const moveScreen = useCallback((id: string, x: number, y: number) => {
    setCurrentProject(prev => {
        if (!prev) return null;
        return {
            ...prev,
            screens: prev.screens.map(s => s.id === id ? { ...s, x, y } : s)
        };
    });
  }, []);

  const addNode = (type: NodeType = 'screen', x: number = 100, y: number = 100) => {
    if (!currentProject) return;
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    // Auto positioning if manually added via button (x,y passed are from drag drop)
    if (x === 100 && y === 100 && currentProject.screens.length > 0) {
        const lastScreen = currentProject.screens[currentProject.screens.length - 1];
        x = lastScreen.x;
        y = lastScreen.y + 350;
    }

    const newNode: Screen = {
        id: id,
        type: type,
        name: type === 'gateway' ? `Gateway ${currentProject.screens.filter(s => s.type === 'gateway').length + 1}` : `Screen ${currentProject.screens.filter(s => s.type !== 'gateway').length + 1}`,
        x: x,
        y: y,
        components: [],
        connections: [],
        logic: [] // Init empty logic for gateways
    };
    setCurrentProject(prev => prev ? ({...prev, screens: [...prev.screens, newNode]}) : null);
  };

  const addConnection = (sourceId: string, targetId: string) => {
    if (sourceId === targetId || !currentProject) return;

    setCurrentProject(prev => {
        if (!prev) return null;

        // 1. Update Connection IDs
        const newScreens = prev.screens.map(s => {
             if (s.id === sourceId) {
                if (s.connections.includes(targetId)) return s;
                return { ...s, connections: [...s.connections, targetId] };
             }
             return s;
        });

        // Smart Logic:
        const sourceNode = newScreens.find(s => s.id === sourceId);
        const targetNode = newScreens.find(s => s.id === targetId);
        
        // Scenario A: Screen -> Screen
        // Scenario B: Screen -> Gateway
        // Scenario C: Gateway -> Screen

        if (sourceNode && targetNode) {
            
            // 1. If Target is Screen, Add Back Button (Unless Source is Gateway)
            if (targetNode.type !== 'gateway' && sourceNode.type !== 'gateway') {
                 const hasHeader = targetNode.components.some(c => c.type === 'Header');
                 if (!hasHeader) {
                    const backButtonId = Date.now().toString() + 'back';
                    const backGroup: UIComponent = {
                        id: Date.now().toString() + 'header_grp',
                        type: 'Group',
                        label: 'Header Bar',
                        style: { flexDirection: 'row', alignItems: 'center', padding: 10, justifyContent: 'flex-start', backgroundColor: '#1e293b' },
                        props: {},
                        children: [
                            {
                                id: backButtonId,
                                type: 'Button',
                                label: '← Back',
                                props: { variant: 'ghost', action: { type: 'back' } },
                                style: { width: 'auto', padding: 8 }
                            }
                        ]
                    };
                    targetNode.components = [backGroup, ...targetNode.components];
                 }
            }

            // 2. If Source is Screen (going to Screen or Gateway), Add Continue Button
            if (sourceNode.type !== 'gateway') {
                 // Check if there is already a button linking to this target
                 const hasLink = sourceNode.components.some(c => {
                    // Check direct action
                    if (c.props?.action?.targetId === targetId) return true;
                    // Check logic actions (though standard buttons should use single action now)
                    if (c.props?.actions?.some(a => a.targetId === targetId)) return true;
                    // Check children
                    if (c.children) return c.children.some(child => 
                        child.props?.action?.targetId === targetId || 
                        child.props?.actions?.some(a => a.targetId === targetId)
                    );
                    return false;
                });

                if (!hasLink) {
                    let footerGroup = sourceNode.components.find(c => c.label === 'Footer Actions' && c.type === 'Group');
                    
                    const continueBtn: UIComponent = {
                        id: Date.now().toString() + 'cont',
                        type: 'Button',
                        label: targetNode.type === 'gateway' ? 'Proceed' : 'Continue',
                        props: { 
                            variant: 'primary', 
                            action: { type: 'navigate', targetId: targetId } 
                        },
                        style: { flex: 1 }
                    };

                    if (footerGroup) {
                        footerGroup.children = [...(footerGroup.children || []), continueBtn];
                    } else {
                        const newFooter: UIComponent = {
                            id: Date.now().toString() + 'footer',
                            type: 'Group',
                            label: 'Footer Actions',
                            style: { flexDirection: 'row', gap: 10, marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderColor: '#334155' },
                            props: {},
                            children: [continueBtn]
                        };
                        sourceNode.components = [...sourceNode.components, newFooter];
                    }
                }
            }

            // 3. If Source is Gateway (going to Screen), Add a Default Rule to Logic if empty
            if (sourceNode.type === 'gateway') {
                 if (!sourceNode.logic) sourceNode.logic = [];
                 // If no logic exists, add a default navigation to this target
                 if (sourceNode.logic.length === 0) {
                     sourceNode.logic.push({
                         type: 'navigate',
                         targetId: targetId,
                         conditions: [] // Empty conditions = Default / Else
                     });
                 }
            }
        }

        return { ...prev, screens: newScreens };
    });
  };

  const removeConnection = (sourceId: string, targetId: string) => {
    if (!currentProject) return;
    setCurrentProject(prev => prev ? ({
      ...prev,
      screens: prev.screens.map(s => {
        if (s.id === sourceId) {
            return { ...s, connections: s.connections.filter(id => id !== targetId) };
        }
        return s;
      })
    }) : null);
  };

  const updateResources = (newResources: ProjectResources) => {
      if (!currentProject) return;
      setCurrentProject({ ...currentProject, resources: newResources });
  };

  const enterScreenEditor = (id: string) => {
    const screen = currentProject?.screens.find(s => s.id === id);
    if (screen) {
        setActiveScreenId(id);
        setBuilderView('editor');
    }
  };

  const exitScreenEditor = () => {
    setActiveScreenId(null);
    setBuilderView('flow');
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-hidden flex flex-col">
      
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur z-50 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('dashboard')}>
           <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-fuchsia-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">N</div>
           <span className="font-bold text-lg tracking-tight">NebulaBuilder</span>
        </div>
        
        {view === 'builder' && currentProject && (
          <div className="flex items-center gap-4 text-sm text-slate-400">
             <button onClick={handleBackToDashboard} className="hover:text-white transition-colors flex items-center gap-1">
                 <span className="text-lg">←</span> Back
             </button>
             <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
             <span className="font-bold text-white">{currentProject.name || 'Untitled'}</span>
             <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
             <span className="capitalize">{currentProject.platform}</span>
             {step === 'builder' && (
                 <>
                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                    <span className="text-cyan-400">{currentProject.screens.length} Nodes</span>
                 </>
             )}
          </div>
        )}

        <div className="flex gap-3 items-center">
           <button 
             onClick={() => setShowHelp(true)}
             className="w-8 h-8 rounded-full border border-slate-700 text-slate-400 hover:text-white hover:border-cyan-500 transition-colors flex items-center justify-center font-bold text-sm mr-2"
             title="Help & Documentation"
           >
             ?
           </button>
           {view === 'builder' && step === 'builder' && (
             <>
                <Button variant="ghost" size="sm" onClick={() => setShowResources(true)}>
                    Resources
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setIsPreviewing(true)}>
                    ▶ Preview
                </Button>
                <Button variant="neon" size="sm" onClick={() => setIsExporting(true)}>Export</Button>
             </>
           )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col min-h-0">
        
        {view === 'dashboard' && (
             <Dashboard 
                projects={projects}
                onCreateNew={handleCreateNew}
                onOpenProject={handleOpenProject}
                onDeleteProject={handleDeleteProject}
             />
        )}

        {view === 'builder' && currentProject && (
            <>
                {step === 'setup' && (
                <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
                    <SetupWizard 
                        project={currentProject} 
                        setProject={setCurrentProject} 
                        onNext={() => setStep('platform')} 
                        currentStep="setup"
                    />
                </div>
                )}

                {step === 'platform' && (
                <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
                    <PlatformSelection onSelect={handlePlatformSelect} />
                </div>
                )}

                {step === 'template' && (
                <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                    <TemplateSelector onSelect={handleTemplateSelect} platform={currentProject.platform} />
                </div>
                )}

                {step === 'builder' && (
                <div className="flex-1 w-full h-full relative bg-slate-950 overflow-hidden">
                    {builderView === 'flow' ? (
                        <>
                        {/* Removed the top-left floating button in favor of the sidebar palette */}
                        <FlowView 
                            screens={currentProject.screens} 
                            onScreenClick={enterScreenEditor}
                            onScreenMove={moveScreen}
                            onConnect={addConnection}
                            onDisconnect={removeConnection}
                            onAddNode={addNode}
                        />
                        </>
                    ) : (
                        <ScreenEditor 
                            screen={currentProject.screens.find(s => s.id === activeScreenId)!} 
                            onBack={exitScreenEditor}
                            onUpdateScreen={updateScreen}
                            allScreens={currentProject.screens}
                            resources={currentProject.resources}
                        />
                    )}
                </div>
                )}
            </>
        )}

      </main>

      {isExporting && currentProject && (
          <ExportModal 
            project={currentProject} 
            onClose={() => setIsExporting(false)} 
          />
      )}

      {isPreviewing && currentProject && (
          <PreviewModal 
            project={currentProject}
            onClose={() => setIsPreviewing(false)}
          />
      )}

      {showHelp && (
          <HelpModal onClose={() => setShowHelp(false)} />
      )}

      {showResources && currentProject && (
          <ResourceManager 
            resources={currentProject.resources}
            onUpdate={updateResources}
            onClose={() => setShowResources(false)}
          />
      )}
    </div>
  );
}