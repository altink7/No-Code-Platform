import React from 'react';
import { Project, AppPlatform } from '../types';
import { Button, Input, Label, Card } from './UI';

interface SetupWizardProps {
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
  onNext: () => void;
  currentStep: string;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ project, setProject, onNext, currentStep }) => {
  
  if (currentStep === 'setup') {
    return (
      <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 mb-2">
          Initialize Project
        </h1>
        <p className="text-slate-400 mb-8">Define the core identity of your application.</p>
        
        <Card className="space-y-6">
          <div>
            <Label>Project Name</Label>
            <Input 
              placeholder="e.g. Nexus Alpha" 
              value={project.name}
              onChange={(e) => setProject({...project, name: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primary Color</Label>
              <div className="flex gap-2 items-center">
                <input 
                  type="color" 
                  value={project.colors.primary}
                  onChange={(e) => setProject({
                    ...project, 
                    colors: {...project.colors, primary: e.target.value}
                  })}
                  className="h-10 w-10 bg-transparent border-0 rounded cursor-pointer"
                />
                <span className="text-slate-300 font-mono text-sm">{project.colors.primary}</span>
              </div>
            </div>
            <div>
              <Label>Secondary Color</Label>
              <div className="flex gap-2 items-center">
                <input 
                  type="color" 
                  value={project.colors.secondary}
                  onChange={(e) => setProject({
                    ...project, 
                    colors: {...project.colors, secondary: e.target.value}
                  })}
                  className="h-10 w-10 bg-transparent border-0 rounded cursor-pointer"
                />
                 <span className="text-slate-300 font-mono text-sm">{project.colors.secondary}</span>
              </div>
            </div>
          </div>
          
           <div>
            <Label>Typography</Label>
            <select 
              className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:border-cyan-500 outline-none"
              value={project.font.name}
              onChange={(e) => setProject({...project, font: { name: e.target.value, family: 'sans-serif' }})}
            >
              <option value="Inter">Inter (Clean)</option>
              <option value="Roboto">Roboto (Modern)</option>
              <option value="Playfair Display">Playfair (Elegant)</option>
              <option value="Space Mono">Space Mono (Tech)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end">
             <Button onClick={onNext} disabled={!project.name}>
               Continue Config &rarr;
             </Button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};

interface PlatformSelectionProps {
  onSelect: (platform: AppPlatform) => void;
}

export const PlatformSelection: React.FC<PlatformSelectionProps> = ({ onSelect }) => {
  return (
     <div className="max-w-4xl mx-auto w-full animate-in fade-in zoom-in-95 duration-500">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Select Target Platform</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button onClick={() => onSelect('web')} className="group text-left">
            <Card className="h-full hover:border-cyan-500/50 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="p-4 bg-cyan-500/10 rounded-full w-16 h-16 flex items-center justify-center mb-6 text-cyan-400">
                 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                 </svg>
               </div>
               <h3 className="text-2xl font-bold text-white mb-2">Web Application</h3>
               <p className="text-slate-400">Responsive React application optimized for modern browsers. Deploy to Vercel or Netlify instantly.</p>
            </Card>
          </button>

          <button onClick={() => onSelect('mobile')} className="group text-left">
            <Card className="h-full hover:border-fuchsia-500/50 transition-all hover:shadow-[0_0_30px_rgba(217,70,239,0.15)] relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="p-4 bg-fuchsia-500/10 rounded-full w-16 h-16 flex items-center justify-center mb-6 text-fuchsia-400">
                 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                 </svg>
               </div>
               <h3 className="text-2xl font-bold text-white mb-2">Mobile Application</h3>
               <p className="text-slate-400">Native Android and iOS experiences using React Native. High performance and native gesture support.</p>
            </Card>
          </button>
        </div>
     </div>
  );
};
