

import React, { useState, useEffect } from 'react';
import { Project, Screen, UIComponent, ComponentAction } from '../types';
import { Modal, Button } from './UI';

interface PreviewModalProps {
  project: Project;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ project, onClose }) => {
  const [currentScreenId, setCurrentScreenId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [inputValues, setInputValues] = useState<Record<string, string | boolean | number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeLanguage, setActiveLanguage] = useState(project.resources?.defaultLanguage || 'en');

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

  const validateInput = (componentId: string, value: any, rules: any): string | null => {
      if (!rules) return null;
      if (typeof value === 'string') {
          if (rules.required && !value) return rules.errorMessage || 'This field is required';
          if (rules.minLength && value.length < rules.minLength) return rules.errorMessage || `Min ${rules.minLength} chars required`;
          if (rules.pattern && !new RegExp(rules.pattern).test(value)) return rules.errorMessage || 'Invalid format';
      }
      return null;
  };

  const evaluateCondition = (condition: any): boolean => {
      if (!condition.fieldId) return true;
      const val = inputValues[condition.fieldId];
      const target = condition.value;

      switch(condition.operator) {
          case 'equals': return String(val) == String(target);
          case 'not_equals': return String(val) != String(target);
          case 'contains': return String(val).includes(String(target));
          case 'greater_than': return Number(val) > Number(target);
          case 'less_than': return Number(val) < Number(target);
          default: return false;
      }
  };

  const executeAction = (action: ComponentAction) => {
      if (action.type === 'navigate' && action.targetId) {
          handleNavigate(action.targetId);
      } else if (action.type === 'back') {
          handleBack();
      } else if (action.type === 'submit') {
          alert("Form Submitted! (Simulation)");
      } else if (action.type === 'link' && action.url) {
          window.open(action.url, '_blank');
      }
  };

  const handleActions = (actions: ComponentAction[] = []) => {
      if (actions.length === 0) return;

      // Iterate actions, execute first matching one
      for (const action of actions) {
          const conditionsMet = !action.conditions || action.conditions.every(evaluateCondition);
          if (conditionsMet) {
              executeAction(action);
              return;
          }
      }
  };

  const renderRuntimeComponent = (comp: UIComponent) => {
    const commonStyle = {
        paddingTop: comp.style?.paddingTop ?? comp.style?.padding,
        paddingBottom: comp.style?.paddingBottom ?? comp.style?.padding,
        paddingLeft: comp.style?.paddingLeft ?? comp.style?.padding,
        paddingRight: comp.style?.paddingRight ?? comp.style?.padding,
        marginTop: comp.style?.marginTop ?? comp.style?.margin,
        marginBottom: comp.style?.marginBottom ?? comp.style?.margin,
        marginLeft: comp.style?.marginLeft ?? comp.style?.margin,
        marginRight: comp.style?.marginRight ?? comp.style?.margin,
        backgroundColor: comp.style?.backgroundColor,
        borderRadius: comp.style?.borderRadius,
        borderTopWidth: comp.style?.borderTopWidth ?? comp.style?.borderWidth,
        borderBottomWidth: comp.style?.borderBottomWidth ?? comp.style?.borderWidth,
        borderLeftWidth: comp.style?.borderLeftWidth ?? comp.style?.borderWidth,
        borderRightWidth: comp.style?.borderRightWidth ?? comp.style?.borderWidth,
        borderColor: comp.style?.borderColor,
        color: comp.style?.color,
        width: comp.style?.width,
        fontWeight: comp.style?.fontWeight,
        flex: comp.style?.flex,
    };

    // Text Resolution
    let displayText = comp.label;
    if (comp.props?.translationKey && project.resources?.translations) {
        const t = project.resources.translations.find(t => t.key === comp.props?.translationKey);
        if (t) displayText = t.values[activeLanguage] || Object.values(t.values)[0] || t.key;
    }

    // Image Resolution
    let displaySrc = comp.props?.src;
    if (comp.props?.assetId && project.resources?.assets) {
        const a = project.resources.assets.find(a => a.id === comp.props?.assetId);
        if (a) displaySrc = a.url;
    }


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
                    flexWrap: comp.style?.flexWrap,
                    borderStyle: (commonStyle.borderTopWidth || commonStyle.borderBottomWidth) ? 'solid' : undefined
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
                onClick={() => {
                    if (comp.props?.actions) {
                        handleActions(comp.props.actions);
                    } else if (comp.props?.action) {
                        handleActions([comp.props.action]);
                    }
                }}
                className="transition-transform active:scale-95"
                style={{
                    ...commonStyle,
                    backgroundColor: comp.props?.variant === 'ghost' ? 'transparent' : comp.props?.variant === 'secondary' ? '#334155' : project.colors.primary,
                    color: comp.props?.variant === 'ghost' ? '#94a3b8' : comp.props?.variant === 'secondary' ? 'white' : project.colors.text === '#f8fafc' ? 'black' : 'white',
                    padding: comp.style?.padding || 12,
                    borderRadius: comp.style?.borderRadius || 8,
                    width: comp.style?.width || '100%',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
            >
                {displayText}
            </button>
        );
    }

    if (comp.type === 'File') {
        return (
            <button
                key={comp.id}
                onClick={() => {
                    if (comp.props?.fileId && project.resources?.assets) {
                        const file = project.resources.assets.find(a => a.id === comp.props?.fileId);
                        if (file) {
                             const a = document.createElement('a');
                             a.href = file.url;
                             a.download = file.name;
                             a.click();
                        }
                    }
                }}
                className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg w-full hover:bg-slate-700 transition-colors border border-slate-700 hover:border-cyan-500"
                style={commonStyle}
            >
                <div className="w-10 h-10 bg-slate-900 rounded flex items-center justify-center text-xl">
                    📁
                </div>
                <div className="flex-1 text-left">
                    <div className="font-bold text-sm text-white">{displayText}</div>
                    <div className="text-xs text-slate-400">{comp.props?.fileName || 'Download'}</div>
                </div>
                <div className="text-cyan-400">⬇</div>
            </button>
        );
    }

    if (comp.type === 'Input' || comp.type === 'TextArea') {
        const error = errors[comp.id];
        const Element = comp.type === 'TextArea' ? 'textarea' : 'input';
        
        return (
            <div key={comp.id} style={{ ...commonStyle, marginBottom: (typeof commonStyle.marginBottom === 'number' ? commonStyle.marginBottom : 0) + 10 }}>
                <label className="block text-xs font-bold text-slate-500 mb-1">{displayText}</label>
                <Element
                    type={comp.type === 'Input' ? 'text' : undefined}
                    value={(inputValues[comp.id] as string) || ''}
                    placeholder={comp.props?.placeholder}
                    onChange={(e: any) => {
                        const val = e.target.value;
                        setInputValues(prev => ({...prev, [comp.id]: val}));
                        const err = validateInput(comp.id, val, comp.props?.validation);
                        setErrors(prev => ({...prev, [comp.id]: err || ''}));
                    }}
                    onBlur={() => {
                        const err = validateInput(comp.id, inputValues[comp.id], comp.props?.validation);
                        setErrors(prev => ({...prev, [comp.id]: err || ''}));
                    }}
                    className={`w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border rounded text-sm text-slate-300 focus:outline-none transition-all ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700 focus:border-cyan-500'} ${comp.type === 'TextArea' ? 'h-24 resize-none' : ''}`}
                />
                {error && <span className="text-[10px] text-red-400 mt-1 block">{error}</span>}
            </div>
        );
    }
    
    if (comp.type === 'Dropdown') {
        return (
             <div key={comp.id} style={commonStyle}>
                <label className="block text-xs font-bold text-slate-500 mb-1">{displayText}</label>
                <select 
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 focus:outline-none"
                    value={(inputValues[comp.id] as string) || ''}
                    onChange={(e) => setInputValues(prev => ({...prev, [comp.id]: e.target.value}))}
                >
                    <option value="">Select...</option>
                    {comp.props?.options?.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
             </div>
        );
    }

    if (comp.type === 'Checkbox') {
        const checked = (inputValues[comp.id] !== undefined ? inputValues[comp.id] : comp.props?.defaultChecked) as boolean;
        return (
            <div key={comp.id} style={commonStyle} className="flex items-center gap-3 cursor-pointer" onClick={() => setInputValues(prev => ({...prev, [comp.id]: !checked}))}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600 bg-slate-800'}`}>
                    {checked && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="text-sm text-slate-300 select-none">{displayText}</span>
            </div>
        );
    }

    if (comp.type === 'Switch') {
         const checked = (inputValues[comp.id] !== undefined ? inputValues[comp.id] : comp.props?.defaultChecked) as boolean;
         return (
             <div key={comp.id} style={commonStyle} className="flex items-center justify-between cursor-pointer" onClick={() => setInputValues(prev => ({...prev, [comp.id]: !checked}))}>
                 <span className="text-sm text-slate-300 select-none">{displayText}</span>
                 <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ${checked ? 'bg-cyan-500' : 'bg-slate-700'}`}>
                     <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? 'translate-x-4' : ''}`}></div>
                 </div>
             </div>
         );
    }

    if (comp.type === 'Slider') {
        const val = (inputValues[comp.id] !== undefined ? inputValues[comp.id] : comp.props?.value || 50) as number;
        return (
            <div key={comp.id} style={commonStyle}>
                <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-slate-500">{displayText}</span>
                    <span className="text-xs text-slate-400">{val}</span>
                </div>
                <input 
                    type="range"
                    min={comp.props?.min || 0}
                    max={comp.props?.max || 100}
                    value={val}
                    onChange={(e) => setInputValues(prev => ({...prev, [comp.id]: parseInt(e.target.value)}))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
            </div>
        );
    }
    
    if (comp.type === 'Avatar') {
        return (
            <div key={comp.id} className="flex justify-center" style={commonStyle}>
                <div className="bg-slate-700 rounded-full flex items-center justify-center overflow-hidden border border-slate-600"
                    style={{ width: comp.props?.size || 48, height: comp.props?.size || 48 }}
                >
                    {displaySrc ? (
                        <img src={displaySrc} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-slate-400 font-bold text-lg">A</span>
                    )}
                </div>
            </div>
        );
    }

    if (comp.type === 'Badge') {
         const badgeColors: Record<string, string> = {
            info: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
            success: 'bg-green-500/20 text-green-400 border-green-500/50',
            warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
            error: 'bg-red-500/20 text-red-400 border-red-500/50',
        };
        const variant = comp.props?.variant || 'info';
        return (
            <div key={comp.id} style={commonStyle} className="inline-block">
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${badgeColors[variant] || badgeColors.info}`}>
                    {displayText}
                </span>
            </div>
        );
    }

    if (comp.type === 'Divider') {
        return (
            <div key={comp.id} style={commonStyle} className="w-full flex items-center py-2">
                 <div className="h-px bg-slate-700 w-full"></div>
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
                <span className="font-bold text-lg text-white mx-auto">{displayText}</span>
                {history.length > 1 && <div className="w-6" />}
             </div>
         );
    }

    if (comp.type === 'Text') {
        return (
            <p key={comp.id} style={{ ...commonStyle, textAlign: comp.props?.align }}>{displayText}</p>
        );
    }
    
    if (comp.type === 'Card') {
        return (
            <div key={comp.id} className="bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-700" style={commonStyle}>
                 {comp.props?.showImage !== false && <div className="h-32 bg-slate-700 rounded-lg w-full mb-2 bg-cover bg-center" style={{backgroundImage: 'url(https://picsum.photos/400/200)'}}></div>}
                 <h4 className="font-bold text-slate-200">{displayText}</h4>
                 <p className="text-slate-400 text-sm mt-1">Sample content for the card component.</p>
            </div>
        );
    }

    if (comp.type === 'Image') {
        return (
            <img key={comp.id} src={displaySrc || "https://picsum.photos/600/400"} alt={displayText} className="w-full rounded-lg object-cover" style={{ ...commonStyle, aspectRatio: '16/9' }} />
        );
    }

    return null;
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Preview: ${project.name}`}>
      <div className="flex justify-center items-start min-h-[600px] p-8 bg-slate-950/90 relative">
        
        {/* Language Toggler for Preview */}
        <div className="absolute top-4 right-20 bg-slate-900 rounded-lg border border-slate-700 p-2 flex gap-2">
            {project.resources?.languages?.map(lang => (
                 <button 
                    key={lang}
                    onClick={() => setActiveLanguage(lang)}
                    className={`px-2 py-1 text-xs rounded font-bold uppercase ${activeLanguage === lang ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'}`}
                 >
                     {lang}
                 </button>
            )) || <span className="text-xs text-slate-500">EN</span>}
        </div>

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