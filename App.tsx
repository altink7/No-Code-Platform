
import React, { useState, useEffect, useCallback } from 'react';
import { Project, AppPlatform, Step, Screen } from './types';
import { SetupWizard, PlatformSelection } from './components/Setup';
import { TemplateSelector } from './components/TemplateSelector';
import { FlowView } from './components/Builder/FlowView';
import { ScreenEditor } from './components/Builder/ScreenEditor';
import { Button } from './components/UI';
import { ExportModal } from './components/ExportModal';
import { PreviewModal } from './components/PreviewModal';
import { HelpModal } from './components/HelpModal';
import { Dashboard } from './components/Dashboard';

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
    
    // Add new project to list if not already there (though handleCreateNew handles init, this confirms it)
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

  const addScreen = () => {
    if (!currentProject) return;
    const id = `screen-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    // Vertical stacking logic
    const lastScreen = currentProject.screens.length > 0 ? currentProject.screens[currentProject.screens.length - 1] : null;
    const x = lastScreen ? lastScreen.x : 100;
    const y = lastScreen ? lastScreen.y + 350 : 100; // Increased spacing for vertical stack
    
    const newScreen: Screen = {
        id: id,
        name: `Screen ${currentProject.screens.length + 1}`,
        x: x,
        y: y,
        components: [],
        connections: []
    };
    setCurrentProject(prev => prev ? ({...prev, screens: [...prev.screens, newScreen]}) : null);
  };

  const addConnection = (sourceId: string, targetId: string) => {
    if (sourceId === targetId || !currentProject) return;
    setCurrentProject(prev => prev ? ({
      ...prev,
      screens: prev.screens.map(s => {
        if (s.id === sourceId) {
            if (s.connections.includes(targetId)) return s;
            return { ...s, connections: [...s.connections, targetId] };
        }
        return s;
      })
    }) : null);
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

  const enterScreenEditor = (id: string) => {
    setActiveScreenId(id);
    setBuilderView('editor');
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
                    <span className="text-cyan-400">{currentProject.screens.length} Screens</span>
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
                <Button variant="secondary" size="sm" onClick={() => setIsPreviewing(true)}>
                    ▶ Preview App
                </Button>
                <Button variant="neon" size="sm" onClick={() => setIsExporting(true)}>Export Code</Button>
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
                        {/* Toolbar */}
                        <div className="absolute top-6 left-6 z-30 flex flex-col gap-2 pointer-events-none">
                            <div className="pointer-events-auto">
                                <button 
                                    onClick={addScreen} 
                                    className="w-full px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 justify-center"
                                >
                                    <span className="text-xl">+</span> Add Screen
                                </button>
                            </div>
                            <div className="bg-slate-900/90 backdrop-blur p-3 rounded-lg border border-slate-700 text-xs text-slate-400 space-y-1 shadow-xl pointer-events-auto">
                                <p>🖱️ <strong>Drag</strong> to move screens</p>
                                <p>🔗 <strong>Drag from dot</strong> to connect</p>
                                <p>👆 <strong>Click</strong> to edit UI</p>
                            </div>
                        </div>
                        
                        <FlowView 
                            screens={currentProject.screens} 
                            onScreenClick={enterScreenEditor}
                            onScreenMove={moveScreen}
                            onConnect={addConnection}
                            onDisconnect={removeConnection}
                        />
                        </>
                    ) : (
                        <ScreenEditor 
                        screen={currentProject.screens.find(s => s.id === activeScreenId)!} 
                        onBack={exitScreenEditor}
                        onUpdateScreen={updateScreen}
                        allScreens={currentProject.screens}
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
    </div>
  );
}
