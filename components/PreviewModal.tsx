
import React, { useState, useEffect } from 'react';
import { Project, Screen, UIComponent } from '../types';
import { Modal, Button } from './UI';

interface PreviewModalProps {
  project: Project;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ project, onClose }) => {
  const [currentScreenId, setCurrentScreenId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (project.screens.length > 0) {
      setCurrentScreenId(project.screens[0].id);
      setHistory([project.screens[0].id]);
    }
  }, [project]);

  const currentScreen = project.screens.find(s => s.id === currentScreenId);

  const handleNavigate = (targetId: string) => {
    if (targetId && project.screens.find(s => s.id === targetId)) {
        setHistory(prev => [...prev, targetId]);
        setCurrentScreenId(targetId);
        setErrors({}); // Clear errors on nav
    }
  };

  const handleBack = () => {
      if (history.length > 1) {
          const newHistory = [...history];
          newHistory.pop();
          setHistory(newHistory);
          setCurrentScreenId(newHistory[newHistory.length - 1]);
      }
  };

  const validateInput = (componentId: string, value: string, rules: any): string | null => {
      if (!rules) return null;
      if (rules.required && !value) return rules.errorMessage || 'This field is required';
      if (rules.minLength && value.length < rules.minLength) return rules.errorMessage || `Min ${rules.minLength} chars required`;
      if (rules.pattern && !new RegExp(rules.pattern).test(value)) return rules.errorMessage || 'Invalid format';
      return null;
  };

  const handleAction = (action?: any) => {
      if (!action) return;

      if (action.type === 'navigate') {
          handleNavigate(action.targetId);
      } else if (action.type === 'submit') {
          // Validate all inputs on current screen
          // Simplified: Just validate inputs that are present in inputValues or have rules
          // For a real app, we'd traverse the screen components to find all inputs.
          alert("Form Submitted! (Simulation)");
      }
  };

  const renderRuntimeComponent = (comp: UIComponent) => {
    const commonStyle = {
        padding: comp.style?.padding,
        margin: comp.style?.margin,
        backgroundColor: comp.style?.backgroundColor,
        borderRadius: comp.style?.borderRadius,
        borderWidth: comp.style?.borderWidth,
        borderColor: comp.style?.borderColor,
        color: comp.style?.color,
        width: comp.style?.width,
    };

    if (comp.type === 'Group') {
        return (
            <div 
                key={comp.id} 
                style={{ 
                    ...commonStyle, 
                    display: 'flex', 
                    flexDirection: comp.style?.flexDirection || 'column',
                    gap: comp.style?.gap ? `${comp.style.gap}px` : undefined,
                    justifyContent: comp.style?.justifyContent,
                    alignItems: comp.style?.alignItems,
                    flexWrap: comp.style?.flexWrap
                }}
            >
                {comp.children?.map(child => renderRuntimeComponent(child))}
            </div>
        );
    }

    if (comp.type === 'Button') {
        return (
            <button
                key={comp.id}
                onClick={() => handleAction(comp.props.action)}
                className="transition-transform active:scale-95"
                style={{
                    ...commonStyle,
                    backgroundColor: comp.props.variant === 'secondary' ? '#334155' : project.colors.primary,
                    color: comp.props.variant === 'secondary' ? 'white' : project.colors.text === '#f8fafc' ? 'black' : 'white',
                    padding: comp.style?.padding || 12,
                    borderRadius: comp.style?.borderRadius || 8,
                    width: comp.style?.width || '100%',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
            >
                {comp.label}
            </button>
        );
    }

    if (comp.type === 'Input') {
        const error = errors[comp.id];
        return (
            <div key={comp.id} style={{ ...commonStyle, marginBottom: (commonStyle.margin || 0) + 10 }}>
                <label className="block text-xs font-bold text-slate-500 mb-1">{comp.label}</label>
                <input
                    type="text"
                    value={inputValues[comp.id] || ''}
                    placeholder={comp.props.placeholder}
                    onChange={(e) => {
                        const val = e.target.value;
                        setInputValues(prev => ({...prev, [comp.id]: val}));
                        const err = validateInput(comp.id, val, comp.props.validation);
                        setErrors(prev => ({...prev, [comp.id]: err || ''}));
                    }}
                    onBlur={() => {
                        const err = validateInput(comp.id, inputValues[comp.id], comp.props.validation);
                        setErrors(prev => ({...prev, [comp.id]: err || ''}));
                    }}
                    className={`w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border rounded text-sm text-slate-300 focus:outline-none transition-all ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700 focus:border-cyan-500'}`}
                />
                {error && <span className="text-[10px] text-red-400 mt-1 block">{error}</span>}
            </div>
        );
    }
    
    if (comp.type === 'Dropdown') {
        return (
             <div key={comp.id} style={commonStyle}>
                <label className="block text-xs font-bold text-slate-500 mb-1">{comp.label}</label>
                <select 
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 focus:outline-none"
                    value={inputValues[comp.id] || ''}
                    onChange={(e) => setInputValues(prev => ({...prev, [comp.id]: e.target.value}))}
                >
                    <option value="">Select...</option>
                    {comp.props.options?.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
             </div>
        );
    }

    if (comp.type === 'Header') {
         return (
             <div key={comp.id} className="flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur border-b border-slate-700" style={commonStyle}>
                {history.length > 1 && (
                     <button onClick={handleBack} className="text-slate-400 hover:text-white">
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                     </button>
                )}
                <span className="font-bold text-lg text-white mx-auto">{comp.label}</span>
                {history.length > 1 && <div className="w-6" />}
             </div>
         );
    }

    if (comp.type === 'Text') {
        return (
            <p key={comp.id} style={{ ...commonStyle, textAlign: comp.props.align }}>{comp.label}</p>
        );
    }
    
    if (comp.type === 'Card') {
        return (
            <div key={comp.id} className="bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-700" style={commonStyle}>
                 {comp.props.showImage !== false && <div className="h-32 bg-slate-700 rounded-lg w-full mb-2 bg-cover bg-center" style={{backgroundImage: 'url(https://picsum.photos/400/200)'}}></div>}
                 <h4 className="font-bold text-slate-200">{comp.label}</h4>
                 <p className="text-slate-400 text-sm mt-1">Sample content for the card component.</p>
            </div>
        );
    }

    if (comp.type === 'Image') {
        return (
            <img key={comp.id} src="https://picsum.photos/600/400" alt={comp.label} className="w-full rounded-lg object-cover" style={{ ...commonStyle, aspectRatio: '16/9' }} />
        );
    }

    return null;
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Preview: ${project.name}`}>
      <div className="flex justify-center items-start min-h-[600px] p-8 bg-slate-950/90">
        
        {/* Device Frame */}
        <div 
            className={`
                relative bg-slate-900 border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-all duration-500
                ${project.platform === 'mobile' 
                    ? 'w-[375px] h-[812px] rounded-[3rem] border-[14px] ring-4 ring-slate-950' 
                    : 'w-[1024px] h-[768px] rounded-lg border-8 ring-4 ring-slate-950'
                }
            `}
        >
            {/* Mobile Notch */}
            {project.platform === 'mobile' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-2xl z-50"></div>
            )}
            
            {/* Status Bar Area */}
            <div className={`w-full bg-slate-900 ${project.platform === 'mobile' ? 'h-10' : 'h-8 flex items-center px-4 gap-2 border-b border-slate-800'}`}>
                {project.platform === 'web' && (
                    <>
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                        <div className="ml-4 flex-1 bg-slate-800 h-5 rounded text-[10px] text-slate-500 flex items-center px-2">
                            localhost:3000/{currentScreen?.name.toLowerCase()}
                        </div>
                    </>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-slate-950 relative custom-scrollbar">
                {currentScreen ? (
                    <div className="flex flex-col min-h-full">
                        {/* Render Screen Components */}
                        {currentScreen.components.map(comp => renderRuntimeComponent(comp))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        Screen not found
                    </div>
                )}
            </div>
            
            {/* Mobile Home Bar */}
            {project.platform === 'mobile' && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-50"></div>
            )}
        </div>

      </div>
    </Modal>
  );
};
