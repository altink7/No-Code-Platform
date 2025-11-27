
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
    <div className="flex-1 p-8 overflow-y-auto bg-slate-950 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-black pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-fuchsia-900/10 via-slate-950 to-black pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none mix-blend-overlay" />
      
      <div className="max-w-7xl mx-auto relative z-10">
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
            <Card className="h-full border-dashed border-2 border-slate-800 bg-slate-900/30 hover:border-cyan-500 hover:bg-slate-900/80 transition-all flex flex-col items-center justify-center gap-4 min-h-[250px] backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-slate-800 group-hover:bg-cyan-500/20 text-slate-500 group-hover:text-cyan-400 flex items-center justify-center transition-colors shadow-lg">
                 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <span className="font-bold text-slate-400 group-hover:text-cyan-400 transition-colors">Start New Project</span>
            </Card>
          </button>

          {projects.map((project) => (
            <div key={project.id} className="relative group">
               <Card className="h-full bg-slate-900/60 border-slate-700/50 hover:border-slate-500 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all relative overflow-hidden flex flex-col backdrop-blur-md">
                  <div className={`h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r ${project.platform === 'mobile' ? 'from-fuchsia-500 to-purple-600' : 'from-cyan-500 to-blue-600'}`} />
                  
                  <div className="mt-4 flex-1">
                      <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{project.name || 'Untitled Project'}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${project.platform === 'mobile' ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'}`}>
                              {project.platform}
                          </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                          {project.description || 'No description provided.'}
                      </p>
                      
                      <div className="flex gap-4 text-xs text-slate-500 font-mono mt-auto border-t border-slate-800 pt-4">
                          <div className="flex items-center gap-1">
                             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                             <span>{project.screens.length} Screens</span>
                          </div>
                          <div className="flex items-center gap-1">
                             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             <span>{new Date(project.lastModified).toLocaleDateString()}</span>
                          </div>
                      </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                      <Button variant="primary" size="sm" className="flex-1 shadow-none" onClick={() => onOpenProject(project)}>
                          Open Builder
                      </Button>
                      <button 
                         onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                         className="px-3 py-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white transition-colors border border-slate-700 hover:border-red-500"
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
