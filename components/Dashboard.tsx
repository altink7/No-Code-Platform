
import React from 'react';
import { Project } from '../types';
import { Card, Button } from './UI';

interface DashboardProps {
  projects: Project[];
  onCreateNew: () => void;
  onOpenProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ projects, onCreateNew, onOpenProject, onDeleteProject }) => {
  return (
    <div className="flex-1 p-8 overflow-y-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
           <div>
             <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 mb-2">
               Your Universe
             </h1>
             <p className="text-slate-400">Manage your applications and deployments.</p>
           </div>
           <Button variant="neon" size="lg" onClick={onCreateNew}>
              + Create New App
           </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Card */}
          <button onClick={onCreateNew} className="group text-left h-full">
            <Card className="h-full border-dashed border-2 border-slate-700 bg-transparent hover:border-cyan-500 hover:bg-slate-900/50 transition-all flex flex-col items-center justify-center gap-4 min-h-[250px]">
              <div className="w-16 h-16 rounded-full bg-slate-800 group-hover:bg-cyan-500/20 text-slate-500 group-hover:text-cyan-400 flex items-center justify-center transition-colors">
                 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <span className="font-bold text-slate-400 group-hover:text-cyan-400">Start New Project</span>
            </Card>
          </button>

          {projects.map((project) => (
            <div key={project.id} className="relative group">
               <Card className="h-full hover:border-slate-600 transition-all hover:shadow-xl relative overflow-hidden flex flex-col">
                  <div className={`h-2 absolute top-0 left-0 right-0 bg-gradient-to-r ${project.platform === 'mobile' ? 'from-fuchsia-500 to-purple-600' : 'from-cyan-500 to-blue-600'}`} />
                  
                  <div className="mt-4 flex-1">
                      <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{project.name || 'Untitled Project'}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${project.platform === 'mobile' ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'}`}>
                              {project.platform}
                          </span>
                      </div>
                      <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                          {project.description || 'No description provided.'}
                      </p>
                      
                      <div className="flex gap-4 text-xs text-slate-500 font-mono mt-auto">
                          <span>{project.screens.length} Screens</span>
                          <span>•</span>
                          <span>Last edit: {new Date(project.lastModified).toLocaleDateString()}</span>
                      </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                      <Button variant="primary" size="sm" className="flex-1" onClick={() => onOpenProject(project)}>
                          Open Builder
                      </Button>
                      <button 
                         onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                         className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors border border-red-500/20"
                         title="Delete Project"
                      >
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                  </div>
               </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
