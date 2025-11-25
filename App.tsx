
import React, { useState, useCallback } from 'react';
import { Project, AppPlatform, Step, Screen } from './types';
import { SetupWizard, PlatformSelection } from './components/Setup';
import { TemplateSelector } from './components/TemplateSelector';
import { FlowView } from './components/Builder/FlowView';
import { ScreenEditor } from './components/Builder/ScreenEditor';
import { Button } from './components/UI';
import { ExportModal } from './components/ExportModal';
import { PreviewModal } from './components/PreviewModal';

const INITIAL_PROJECT: Project = {
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
  screens: []
};

export default function App() {
  const [project, setProject] = useState<Project>(INITIAL_PROJECT);
  const [step, setStep] = useState<Step>('setup');
  const [builderView, setBuilderView] = useState<'flow' | 'editor'>('flow');
  const [activeScreenId, setActiveScreenId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const handlePlatformSelect = (platform: AppPlatform) => {
    setProject(prev => ({ ...prev, platform }));
    setStep('template');
  };

  const handleTemplateSelect = (templateId: string, screens: Screen[]) => {
    setProject(prev => ({ ...prev, template: templateId, screens }));
    setStep('builder');
  };

  const updateScreen = (updatedScreen: Screen) => {
    setProject(prev => ({
      ...prev,
      screens: prev.screens.map(s => s.id === updatedScreen.id ? updatedScreen : s)
    }));
  };

  const moveScreen = useCallback((id: string, x: number, y: number) => {
    setProject(prev => ({
      ...prev,
      screens: prev.screens.map(s => s.id === id ? { ...s, x, y } : s)
    }));
  }, []);

  const addScreen = () => {
    const id = `screen-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    // Simple cascade effect
    const count = project.screens.length;
    const startX = 50;
    const startY = 50;
    const offset = 30; 
    
    // Ensure it wraps if it goes too far
    const x = startX + (count * offset) % 400;
    const y = startY + (count * offset) % 300;
    
    const newScreen: Screen = {
        id: id,
        name: `Screen ${count + 1}`,
        x: x,
        y: y,
        components: [],
        connections: []
    };
    setProject(prev => ({...prev, screens: [...prev.screens, newScreen]}));
  };

  const addConnection = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return; // No self loops
    setProject(prev => ({
      ...prev,
      screens: prev.screens.map(s => {
        if (s.id === sourceId) {
            // Check if connection already exists
            if (s.connections.includes(targetId)) return s;
            return { ...s, connections: [...s.connections, targetId] };
        }
        return s;
      })
    }));
  };

  const removeConnection = (sourceId: string, targetId: string) => {
    setProject(prev => ({
      ...prev,
      screens: prev.screens.map(s => {
        if (s.id === sourceId) {
            return { ...s, connections: s.connections.filter(id => id !== targetId) };
        }
        return s;
      })
    }));
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
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep('setup')}>
           <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-fuchsia-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">N</div>
           <span className="font-bold text-lg tracking-tight">NebulaBuilder</span>
        </div>
        
        {project.name && (
          <div className="flex items-center gap-4 text-sm text-slate-400">
             <span>{project.name}</span>
             <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
             <span className="capitalize">{project.platform}</span>
             {step === 'builder' && (
                 <>
                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                    <span className="text-cyan-400">{project.screens.length} Screens</span>
                 </>
             )}
          </div>
        )}

        <div className="flex gap-3">
           {step === 'builder' && (
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
        
        {step === 'setup' && (
          <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
             <SetupWizard 
                project={project} 
                setProject={setProject} 
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
            <TemplateSelector onSelect={handleTemplateSelect} platform={project.platform} />
          </div>
        )}

        {step === 'builder' && (
          <div className="flex-1 w-full h-full relative bg-slate-950 overflow-hidden">
             {builderView === 'flow' ? (
                <>
                   {/* Toolbar */}
                   <div className="absolute top-6 left-6 z-30 flex flex-col gap-2 pointer-events-none">
                      <div className="pointer-events-auto">
                        <Button size="sm" onClick={addScreen} className="shadow-lg shadow-cyan-500/20 w-full bg-slate-900/90 backdrop-blur border border-cyan-500/50 hover:bg-slate-800">
                            + Add Screen
                        </Button>
                      </div>
                      <div className="bg-slate-900/90 backdrop-blur p-3 rounded-lg border border-slate-700 text-xs text-slate-400 space-y-1 shadow-xl pointer-events-auto">
                          <p>🖱️ <strong>Drag</strong> to move screens</p>
                          <p>🔗 <strong>Drag from dot</strong> to connect</p>
                          <p>👆 <strong>Click</strong> to edit UI</p>
                      </div>
                   </div>
                   
                   <FlowView 
                      screens={project.screens} 
                      onScreenClick={enterScreenEditor}
                      onScreenMove={moveScreen}
                      onConnect={addConnection}
                      onDisconnect={removeConnection}
                   />
                </>
             ) : (
                <ScreenEditor 
                  screen={project.screens.find(s => s.id === activeScreenId)!} 
                  onBack={exitScreenEditor}
                  onUpdateScreen={updateScreen}
                  allScreens={project.screens}
                />
             )}
          </div>
        )}

      </main>

      {isExporting && (
          <ExportModal 
            project={project} 
            onClose={() => setIsExporting(false)} 
          />
      )}

      {isPreviewing && (
          <PreviewModal 
            project={project}
            onClose={() => setIsPreviewing(false)}
          />
      )}
    </div>
  );
}
