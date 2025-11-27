
import React, { useState } from 'react';
import { Screen, UIComponent, COMPONENT_PALETTE, ComponentType, ComponentStyle } from '../../types';
import { Button, Input, Label, Select } from '../UI';

interface ScreenEditorProps {
  screen: Screen;
  onBack: () => void;
  onUpdateScreen: (screen: Screen) => void;
  allScreens?: Screen[];
}

export const ScreenEditor: React.FC<ScreenEditorProps> = ({ screen, onBack, onUpdateScreen, allScreens = [] }) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [propertiesTab, setPropertiesTab] = useState<'props' | 'style'>('props');

  // --- Tree Helpers ---
  const findComponent = (components: UIComponent[], id: string): { component: UIComponent, parent: UIComponent[] | null, index: number } | null => {
    for (let i = 0; i < components.length; i++) {
      if (components[i].id === id) {
        return { component: components[i], parent: components, index: i };
      }
      if (components[i].children) {
        const result = findComponent(components[i].children!, id);
        if (result) return result;
      }
    }
    return null;
  };

  const getSelectedComponent = () => {
    if (!selectedComponentId) return null;
    const result = findComponent(screen.components, selectedComponentId);
    return result ? result.component : null;
  };

  const updateComponentInTree = (components: UIComponent[], id: string, updater: (c: UIComponent) => UIComponent): UIComponent[] => {
    return components.map(c => {
      if (c.id === id) return updater(c);
      if (c.children) {
        return { ...c, children: updateComponentInTree(c.children, id, updater) };
      }
      return c;
    });
  };

  const deleteComponentFromTree = (components: UIComponent[], id: string): UIComponent[] => {
    return components.filter(c => c.id !== id).map(c => {
      if (c.children) {
        return { ...c, children: deleteComponentFromTree(c.children, id) };
      }
      return c;
    });
  };

  const insertComponentInTree = (
      components: UIComponent[], 
      targetId: string | null, 
      component: UIComponent, 
      position: 'before' | 'after' | 'inside'
  ): UIComponent[] => {
      if (!targetId) {
          return [...components, component];
      }
      
      if (position === 'inside') {
          return components.map(c => {
              if (c.id === targetId) {
                  return { ...c, children: [...(c.children || []), component] };
              }
              if (c.children) {
                  return { ...c, children: insertComponentInTree(c.children, targetId, component, position) };
              }
              return c;
          });
      }

      const newComponents: UIComponent[] = [];
      for (const c of components) {
          if (c.id === targetId) {
              if (position === 'before') {
                  newComponents.push(component);
                  newComponents.push(c);
              } else {
                  newComponents.push(c);
                  newComponents.push(component);
              }
          } else {
              if (c.children) {
                  newComponents.push({ ...c, children: insertComponentInTree(c.children, targetId, component, position) });
              } else {
                  newComponents.push(c);
              }
          }
      }
      return newComponents;
  };


  // --- State Updates ---

  const updateSelectedComponent = (updates: Partial<UIComponent> | { props?: any, style?: any }) => {
    if (!selectedComponentId) return;
    
    const newComponents = updateComponentInTree(screen.components, selectedComponentId, (c) => {
        if ('props' in updates) {
            return { ...c, props: { ...c.props, ...updates.props } };
        }
        if ('style' in updates) {
            return { ...c, style: { ...c.style, ...updates.style } };
        }
        return { ...c, ...updates };
    });
    
    onUpdateScreen({ ...screen, components: newComponents });
  };

  const deleteSelectedComponent = () => {
      if (!selectedComponentId) return;
      onUpdateScreen({ ...screen, components: deleteComponentFromTree(screen.components, selectedComponentId) });
      setSelectedComponentId(null);
  };

  // --- Drag & Drop ---

  const handleDragStart = (e: React.DragEvent, id: string, origin: 'palette' | 'canvas', type?: ComponentType) => {
      e.stopPropagation();
      setDraggingId(id);
      e.dataTransfer.setData('id', id);
      e.dataTransfer.setData('origin', origin);
      if (type) e.dataTransfer.setData('type', type);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string, type: ComponentType) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggingId === id) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    const isGroup = type === 'Group';

    if (isGroup) {
         if (y < 10) {
             setDropPosition('before');
             setDragOverId(id);
         } else if (y > rect.height - 10) {
             setDropPosition('after');
             setDragOverId(id);
         } else {
             setDropPosition('inside');
             setDragOverId(id);
         }
    } else {
        if (y < rect.height / 2) {
            setDropPosition('before');
            setDragOverId(id);
        } else {
            setDropPosition('after');
            setDragOverId(id);
        }
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const origin = e.dataTransfer.getData('origin');
    const type = e.dataTransfer.getData('type') as ComponentType;
    const sourceId = e.dataTransfer.getData('id');

    let componentToAdd: UIComponent;

    if (origin === 'palette') {
        componentToAdd = {
            id: Date.now().toString() + Math.random().toString().slice(2,5),
            type: type,
            label: type === 'Header' ? screen.name : `New ${type}`,
            props: {},
            style: { padding: 8, margin: 4 },
            children: type === 'Group' ? [] : undefined
        };
    } else {
        const found = findComponent(screen.components, sourceId);
        if (!found) return;
        componentToAdd = found.component;
        const componentsWithoutSource = deleteComponentFromTree(screen.components, sourceId);
        onUpdateScreen({ ...screen, components: insertComponentInTree(componentsWithoutSource, targetId, componentToAdd, dropPosition || 'after') });
        setDraggingId(null);
        setDragOverId(null);
        setDropPosition(null);
        return;
    }

    const newComponents = insertComponentInTree(screen.components, targetId, componentToAdd, dropPosition || 'after');
    onUpdateScreen({ ...screen, components: newComponents });
    
    setSelectedComponentId(componentToAdd.id);
    setDraggingId(null);
    setDragOverId(null);
    setDropPosition(null);
  };

  const handleRootDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (dragOverId) return;

      const origin = e.dataTransfer.getData('origin');
      
      if (origin === 'palette') {
          const type = e.dataTransfer.getData('type') as ComponentType;
          const componentToAdd: UIComponent = {
            id: Date.now().toString() + Math.random().toString().slice(2,5),
            type: type,
            label: type === 'Header' ? screen.name : `New ${type}`,
            props: {},
            style: { padding: 8, margin: 4 },
            children: type === 'Group' ? [] : undefined
          };
          onUpdateScreen({ ...screen, components: [...screen.components, componentToAdd] });
          setSelectedComponentId(componentToAdd.id);
      }
  };


  // --- Renderer ---

  const renderComponentTree = (components: UIComponent[]) => {
      return components.map(comp => {
          const isSelected = selectedComponentId === comp.id;
          const isDragging = draggingId === comp.id;
          const isDragOver = dragOverId === comp.id;
          
          return (
              <div 
                  key={comp.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, comp.id, 'canvas')}
                  onDragOver={(e) => handleDragOver(e, comp.id, comp.type)}
                  onDrop={(e) => handleDrop(e, comp.id)}
                  onClick={(e) => {
                      e.stopPropagation();
                      setSelectedComponentId(comp.id);
                  }}
                  className={`relative transition-all duration-200 
                      ${isDragging ? 'opacity-40' : 'opacity-100'}
                      ${isSelected ? 'ring-2 ring-cyan-500 z-10' : 'ring-1 ring-transparent hover:ring-slate-600'}
                  `}
                  style={{
                      marginTop: comp.style?.margin,
                      marginBottom: comp.style?.margin,
                      marginLeft: comp.style?.margin,
                      marginRight: comp.style?.margin,
                      width: comp.style?.width || 'auto',
                  }}
              >
                  {isDragOver && dropPosition === 'before' && (
                      <div className="absolute -top-2 left-0 right-0 h-1 bg-cyan-400 rounded-full pointer-events-none shadow-[0_0_10px_cyan]"></div>
                  )}
                  {isDragOver && dropPosition === 'after' && (
                      <div className="absolute -bottom-2 left-0 right-0 h-1 bg-cyan-400 rounded-full pointer-events-none shadow-[0_0_10px_cyan]"></div>
                  )}
                   {isDragOver && dropPosition === 'inside' && (
                      <div className="absolute inset-0 border-2 border-cyan-400 bg-cyan-500/10 rounded-lg pointer-events-none"></div>
                  )}

                  {renderVisualComponent(comp)}
              </div>
          );
      });
  };

  const renderVisualComponent = (comp: UIComponent) => {
      const commonStyle = {
          padding: comp.style?.padding || 0,
          backgroundColor: comp.style?.backgroundColor || 'transparent',
          borderRadius: comp.style?.borderRadius || 0,
          borderWidth: comp.style?.borderWidth || 0,
          borderColor: comp.style?.borderColor || 'transparent',
          boxShadow: comp.style?.boxShadow || 'none'
      };

      if (comp.type === 'Group') {
          return (
              <div 
                  className={`min-h-[60px] border border-dashed border-slate-700/50 rounded-lg transition-colors ${comp.props?.collapsed ? 'h-12 overflow-hidden' : ''}`}
                  style={{ ...commonStyle }}
              >
                  <div className="px-2 py-1 bg-slate-800/50 flex justify-between items-center cursor-pointer select-none">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{comp.label || 'Group'}</span>
                       {comp.props?.collapsible && (
                           <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updateSelectedComponent({ props: { collapsed: !comp.props?.collapsed } });
                                }}
                                className="text-slate-400 hover:text-white"
                           >
                               {comp.props?.collapsed ? '▼' : '▲'}
                           </button>
                       )}
                  </div>
                  {!comp.props?.collapsed && (
                      <div 
                        className="p-2 flex min-h-[40px]"
                        style={{
                            flexDirection: comp.style?.flexDirection || 'column',
                            gap: comp.style?.gap || 0,
                            justifyContent: comp.style?.justifyContent || 'flex-start',
                            alignItems: comp.style?.alignItems || 'stretch',
                            flexWrap: comp.style?.flexWrap || 'nowrap'
                        }}
                      >
                           {comp.children && comp.children.length > 0 ? (
                               renderComponentTree(comp.children)
                           ) : (
                               <div className="w-full text-center text-slate-600 text-xs py-2 italic">Empty Group</div>
                           )}
                      </div>
                  )}
              </div>
          );
      }

      switch(comp.type) {
          case 'Button':
              return (
                <button 
                    className={`w-full font-medium transition-all pointer-events-none flex items-center justify-center gap-2 ${comp.props?.disabled ? 'opacity-50' : ''}`}
                    style={{
                        ...commonStyle,
                        backgroundColor: comp.props?.variant === 'secondary' ? '#334155' : '#0891b2',
                        color: 'white',
                        padding: comp.style?.padding || 12,
                        borderRadius: comp.style?.borderRadius || 8
                    }}
                >
                    {comp.props?.loading && (
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {comp.label}
                </button>
              );
          case 'Input':
          case 'TextArea':
              return (
                <div style={commonStyle}>
                     <label className="block text-xs font-bold text-slate-500 mb-1">{comp.label} {comp.props?.validation?.required && <span className="text-red-400">*</span>}</label>
                     <div className={`w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 ${comp.type === 'TextArea' ? 'h-20' : ''}`}>
                         {comp.props?.inputType === 'password' ? '••••••••' : (comp.props?.placeholder || 'Type here...')}
                     </div>
                </div>
              );
           case 'Image':
                return (
                    <div className="w-full aspect-video bg-slate-800 rounded-xl overflow-hidden border-2 border-dashed border-slate-700 relative" style={commonStyle}>
                        {comp.props?.src ? (
                            <img 
                                src={comp.props.src} 
                                alt={comp.label} 
                                className="w-full h-full"
                                style={{ objectFit: comp.props?.objectFit || 'cover' }}
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full">
                                <span className="text-xs text-slate-500">{comp.label}</span>
                            </div>
                        )}
                    </div>
                );
            case 'Card':
                const elevationClass = {
                    'none': 'shadow-none',
                    'sm': 'shadow-sm',
                    'md': 'shadow-md',
                    'lg': 'shadow-lg',
                    'xl': 'shadow-xl'
                };
                return (
                    <div className={`bg-slate-800 rounded-xl p-4 space-y-2 border border-slate-700 ${elevationClass[comp.props?.elevation || 'md'] || 'shadow-md'}`} style={commonStyle}>
                        {comp.props?.showImage !== false && <div className="h-32 bg-slate-700 rounded-lg w-full mb-2"></div>}
                        <h4 className="font-bold text-slate-200">{comp.label}</h4>
                        <div className="h-2 w-2/3 bg-slate-700 rounded"></div>
                    </div>
                );
            case 'Checkbox':
                return (
                    <div className="flex items-center gap-2" style={commonStyle}>
                        <div className={`w-5 h-5 rounded border border-slate-600 flex items-center justify-center ${comp.props?.defaultChecked ? 'bg-cyan-500 border-cyan-500' : 'bg-slate-800'}`}>
                            {comp.props?.defaultChecked && <span className="text-white text-xs">✓</span>}
                        </div>
                        <span className="text-sm text-slate-300">{comp.label}</span>
                    </div>
                );
            case 'Switch':
                return (
                     <div className="flex items-center justify-between" style={commonStyle}>
                         <span className="text-sm text-slate-300">{comp.label}</span>
                         <div className={`w-10 h-6 rounded-full p-1 transition-colors ${comp.props?.defaultChecked ? 'bg-cyan-500' : 'bg-slate-700'}`}>
                             <div className={`w-4 h-4 bg-white rounded-full transition-transform ${comp.props?.defaultChecked ? 'translate-x-4' : ''}`}></div>
                         </div>
                     </div>
                );
            case 'Slider':
                return (
                    <div style={commonStyle}>
                         <div className="flex justify-between mb-1">
                             <span className="text-xs font-bold text-slate-500">{comp.label}</span>
                             <span className="text-xs text-slate-400">{comp.props?.value || 50}</span>
                         </div>
                         <div className="w-full h-1.5 bg-slate-700 rounded-lg overflow-hidden relative">
                             <div className="h-full bg-cyan-500 absolute top-0 left-0" style={{width: `${comp.props?.value || 50}%`}}></div>
                         </div>
                    </div>
                );
             case 'Badge':
                const badgeColors: Record<string, string> = {
                    info: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
                    success: 'bg-green-500/20 text-green-400 border-green-500/50',
                    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
                    error: 'bg-red-500/20 text-red-400 border-red-500/50',
                };
                return (
                    <div style={commonStyle} className="inline-block">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${badgeColors[comp.props?.variant || 'info']}`}>
                            {comp.label}
                        </span>
                    </div>
                );
             case 'Avatar':
                 return (
                     <div className="flex justify-center" style={commonStyle}>
                         <div className="bg-slate-700 rounded-full flex items-center justify-center overflow-hidden border border-slate-600"
                            style={{ width: comp.props?.size || 48, height: comp.props?.size || 48 }}
                         >
                            {comp.props?.src ? (
                                <img src={comp.props.src} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-slate-400 font-bold text-lg">A</span>
                            )}
                         </div>
                     </div>
                 );
            case 'Divider':
                 return <div className="h-px bg-slate-700 w-full my-2" style={commonStyle}></div>;
          default:
               // Reuse previous default renderers
               return (
                  <div style={{...commonStyle, color: comp.style?.color}}>
                     {comp.type === 'Text' && (
                         <p className={`pointer-events-none ${comp.props?.size === 'lg' ? 'text-xl font-bold' : 'text-sm'}`} style={{ textAlign: comp.props?.align }}>
                             {comp.label}
                         </p>
                     )}
                     {comp.type === 'Header' && (
                          <div className="flex items-center justify-between shadow-sm border-b border-slate-700/50 p-4 bg-slate-800" style={commonStyle}>
                            <div className="w-6 h-6 bg-slate-700 rounded-full"></div>
                            <span className="font-bold text-lg text-white">{comp.label}</span>
                            <div className="w-6 h-6 bg-slate-700 rounded-full"></div>
                        </div>
                     )}
                     {!['Text', 'Header'].includes(comp.type) && (
                         <div className="p-2 border border-slate-700 rounded text-slate-400 text-xs">{comp.type}: {comp.label}</div>
                     )}
                  </div>
               )
      }
  };

  const renderProperties = () => {
      const comp = getSelectedComponent();
      if (!comp) return <div className="p-8 text-center text-slate-500 text-sm">Select a component to edit</div>;

      return (
          <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
                  <div className="flex flex-col">
                      <span className="text-xs text-slate-500 uppercase font-bold">{comp.type}</span>
                      <span className="text-sm font-mono text-cyan-400">{comp.id.slice(-4)}</span>
                  </div>
                  <button onClick={deleteSelectedComponent} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-800 shrink-0">
                  <button 
                    onClick={() => setPropertiesTab('props')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${propertiesTab === 'props' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/30' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                      Config
                  </button>
                  <button 
                    onClick={() => setPropertiesTab('style')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${propertiesTab === 'style' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/30' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                      Style
                  </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                  {propertiesTab === 'props' ? (
                      <>
                        <div>
                            <Label>Label / Text</Label>
                            <Input value={comp.label} onChange={(e) => updateSelectedComponent({ label: e.target.value })} />
                        </div>
                        
                        {/* Button Config */}
                        {comp.type === 'Button' && (
                             <>
                                <div>
                                    <Label>Variant</Label>
                                    <Select 
                                        value={comp.props?.variant || 'primary'}
                                        onChange={(e) => updateSelectedComponent({ props: { variant: e.target.value } })}
                                        options={[
                                            { label: 'Primary (Cyan)', value: 'primary' },
                                            { label: 'Secondary (Dark)', value: 'secondary' },
                                            { label: 'Ghost (Transparent)', value: 'ghost' },
                                            { label: 'Neon (Fuchsia)', value: 'neon' }
                                        ]}
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                     <div className="flex items-center gap-2">
                                         <input type="checkbox" checked={comp.props?.loading || false} onChange={(e) => updateSelectedComponent({ props: { loading: e.target.checked } })} />
                                         <span className="text-sm text-slate-300">Loading</span>
                                     </div>
                                     <div className="flex items-center gap-2">
                                         <input type="checkbox" checked={comp.props?.disabled || false} onChange={(e) => updateSelectedComponent({ props: { disabled: e.target.checked } })} />
                                         <span className="text-sm text-slate-300">Disabled</span>
                                     </div>
                                </div>
                                <div>
                                    <Label>On Click Action</Label>
                                    <Select 
                                        value={comp.props?.action?.type === 'navigate' ? comp.props?.action.targetId : (comp.props?.action?.type || 'none')}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === 'none') {
                                                updateSelectedComponent({ props: { action: undefined } });
                                            } else if (val === 'submit') {
                                                updateSelectedComponent({ props: { action: { type: 'submit' } } });
                                            } else {
                                                updateSelectedComponent({ props: { action: { type: 'navigate', targetId: val } } });
                                            }
                                        }}
                                        options={[
                                            { label: 'No Action', value: 'none' },
                                            { label: 'Submit Form', value: 'submit' },
                                            ...allScreens.filter(s => s.id !== screen.id).map(s => ({ label: `Navigate to: ${s.name}`, value: s.id }))
                                        ]}
                                    />
                                </div>
                             </>
                        )}

                        {/* Input/TextArea Config */}
                        {(comp.type === 'Input' || comp.type === 'TextArea') && (
                            <>
                                {comp.type === 'Input' && (
                                    <div>
                                        <Label>Type</Label>
                                        <Select 
                                            value={comp.props?.inputType || 'text'}
                                            onChange={(e) => updateSelectedComponent({ props: { inputType: e.target.value } })}
                                            options={[
                                                { label: 'Text', value: 'text' },
                                                { label: 'Password', value: 'password' },
                                                { label: 'Email', value: 'email' },
                                                { label: 'Number', value: 'number' },
                                                { label: 'Date', value: 'date' }
                                            ]}
                                        />
                                    </div>
                                )}
                                <div>
                                    <Label>Placeholder</Label>
                                    <Input 
                                        value={comp.props?.placeholder || ''}
                                        onChange={(e) => updateSelectedComponent({ props: { placeholder: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-3 pt-4 border-t border-slate-800">
                                    <Label className="text-cyan-400">Validation Rules</Label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            checked={comp.props?.validation?.required || false} 
                                            onChange={(e) => updateSelectedComponent({ props: { validation: { ...comp.props?.validation, required: e.target.checked } } })} 
                                        />
                                        <span className="text-sm text-slate-300">Required Field</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label>Min Length</Label>
                                            <input 
                                                type="number"
                                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white"
                                                value={comp.props?.validation?.minLength || ''}
                                                onChange={(e) => updateSelectedComponent({ props: { validation: { ...comp.props?.validation, minLength: parseInt(e.target.value) || undefined } } })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Error Message</Label>
                                        <Input 
                                            placeholder="e.g. This field is mandatory"
                                            value={comp.props?.validation?.errorMessage || ''}
                                            onChange={(e) => updateSelectedComponent({ props: { validation: { ...comp.props?.validation, errorMessage: e.target.value } } })}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Dropdown Config */}
                        {comp.type === 'Dropdown' && (
                            <div>
                                <Label>Options (comma separated)</Label>
                                <textarea
                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 h-24"
                                    value={comp.props?.options?.join(',') || ''}
                                    onChange={(e) => updateSelectedComponent({ props: { options: e.target.value.split(',').map(s => s.trim()) } })}
                                    placeholder="Option 1, Option 2, Option 3"
                                />
                            </div>
                        )}

                        {/* Image/Avatar Config */}
                        {(comp.type === 'Image' || comp.type === 'Avatar') && (
                            <>
                                <div>
                                    <Label>Source URL</Label>
                                    <Input value={comp.props?.src || ''} onChange={(e) => updateSelectedComponent({ props: { src: e.target.value } })} placeholder="https://..." />
                                </div>
                                {comp.type === 'Image' && (
                                    <div>
                                        <Label>Fit</Label>
                                        <Select 
                                            value={comp.props?.objectFit || 'cover'}
                                            onChange={(e) => updateSelectedComponent({ props: { objectFit: e.target.value } })}
                                            options={[
                                                { label: 'Cover', value: 'cover' },
                                                { label: 'Contain', value: 'contain' },
                                                { label: 'Fill', value: 'fill' }
                                            ]}
                                        />
                                    </div>
                                )}
                                {comp.type === 'Avatar' && (
                                    <div>
                                        <Label>Size (px)</Label>
                                        <input 
                                            type="number" 
                                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white"
                                            value={comp.props?.size || 48} 
                                            onChange={(e) => updateSelectedComponent({ props: { size: parseInt(e.target.value) } })} 
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {/* Slider Config */}
                        {comp.type === 'Slider' && (
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <Label>Min</Label>
                                    <input type="number" className="w-full bg-slate-900 border-slate-700 rounded text-sm text-white px-1" value={comp.props?.min || 0} onChange={(e) => updateSelectedComponent({ props: { min: parseInt(e.target.value) } })} />
                                </div>
                                <div>
                                    <Label>Max</Label>
                                    <input type="number" className="w-full bg-slate-900 border-slate-700 rounded text-sm text-white px-1" value={comp.props?.max || 100} onChange={(e) => updateSelectedComponent({ props: { max: parseInt(e.target.value) } })} />
                                </div>
                                <div>
                                    <Label>Value</Label>
                                    <input type="number" className="w-full bg-slate-900 border-slate-700 rounded text-sm text-white px-1" value={comp.props?.value || 50} onChange={(e) => updateSelectedComponent({ props: { value: parseInt(e.target.value) } })} />
                                </div>
                            </div>
                        )}

                        {/* Switch/Checkbox Config */}
                        {(comp.type === 'Switch' || comp.type === 'Checkbox') && (
                             <div className="flex items-center gap-2">
                                 <input type="checkbox" checked={comp.props?.defaultChecked || false} onChange={(e) => updateSelectedComponent({ props: { defaultChecked: e.target.checked } })} />
                                 <span className="text-sm text-slate-300">Checked by default</span>
                             </div>
                        )}
                        
                        {/* Group Config */}
                        {comp.type === 'Group' && (
                            <>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={comp.props?.collapsible || false} onChange={(e) => updateSelectedComponent({ props: { collapsible: e.target.checked } })} />
                                    <span className="text-sm text-slate-300">Collapsible</span>
                                </div>
                                {comp.props?.collapsible && (
                                     <div className="flex items-center gap-2 ml-4">
                                        <input type="checkbox" checked={comp.props?.collapsed || false} onChange={(e) => updateSelectedComponent({ props: { collapsed: e.target.checked } })} />
                                        <span className="text-sm text-slate-300">Start Collapsed</span>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Card Config */}
                        {comp.type === 'Card' && (
                            <>
                                <div>
                                    <Label>Elevation</Label>
                                    <Select 
                                        value={comp.props?.elevation || 'md'}
                                        onChange={(e) => updateSelectedComponent({ props: { elevation: e.target.value } })}
                                        options={[
                                            { label: 'None', value: 'none' },
                                            { label: 'Small', value: 'sm' },
                                            { label: 'Medium', value: 'md' },
                                            { label: 'Large', value: 'lg' },
                                            { label: 'Extra Large', value: 'xl' }
                                        ]}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={comp.props?.showImage !== false} onChange={(e) => updateSelectedComponent({ props: { showImage: e.target.checked } })} />
                                    <span className="text-sm text-slate-300">Show Cover Image</span>
                                </div>
                            </>
                        )}
                        
                        {/* Badge Config */}
                        {comp.type === 'Badge' && (
                            <div>
                                <Label>Variant</Label>
                                <Select 
                                    value={comp.props?.variant || 'info'}
                                    onChange={(e) => updateSelectedComponent({ props: { variant: e.target.value } })}
                                    options={[
                                        { label: 'Info (Blue)', value: 'info' },
                                        { label: 'Success (Green)', value: 'success' },
                                        { label: 'Warning (Yellow)', value: 'warning' },
                                        { label: 'Error (Red)', value: 'error' }
                                    ]}
                                />
                            </div>
                        )}
                      </>
                  ) : (
                      <>
                        {/* Layout Styles for Groups */}
                        {comp.type === 'Group' && (
                            <div className="space-y-4 pb-4 border-b border-slate-800">
                                <Label className="text-cyan-400">Flexbox Layout</Label>
                                
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => updateSelectedComponent({ style: { flexDirection: 'column' } })}
                                        className={`flex-1 p-2 rounded border ${comp.style?.flexDirection === 'column' || !comp.style?.flexDirection ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'border-slate-700 text-slate-400'}`}
                                    >
                                        Column ↓
                                    </button>
                                    <button 
                                        onClick={() => updateSelectedComponent({ style: { flexDirection: 'row' } })}
                                        className={`flex-1 p-2 rounded border ${comp.style?.flexDirection === 'row' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'border-slate-700 text-slate-400'}`}
                                    >
                                        Row →
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label>Justify</Label>
                                        <Select 
                                            value={comp.style?.justifyContent || 'flex-start'}
                                            onChange={(e) => updateSelectedComponent({ style: { justifyContent: e.target.value } })}
                                            options={[
                                                { label: 'Start', value: 'flex-start' },
                                                { label: 'Center', value: 'center' },
                                                { label: 'End', value: 'flex-end' },
                                                { label: 'Space Between', value: 'space-between' }
                                            ]}
                                        />
                                    </div>
                                    <div>
                                        <Label>Align</Label>
                                        <Select 
                                            value={comp.style?.alignItems || 'stretch'}
                                            onChange={(e) => updateSelectedComponent({ style: { alignItems: e.target.value } })}
                                            options={[
                                                { label: 'Stretch', value: 'stretch' },
                                                { label: 'Start', value: 'flex-start' },
                                                { label: 'Center', value: 'center' },
                                                { label: 'End', value: 'flex-end' }
                                            ]}
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <Label>Gap: {comp.style?.gap || 0}px</Label>
                                    <input 
                                        type="range" min="0" max="40" 
                                        value={comp.style?.gap || 0}
                                        onChange={(e) => updateSelectedComponent({ style: { gap: parseInt(e.target.value) } })}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        )}

                        {/* General Styles */}
                        <div className="space-y-4">
                            <div>
                                <Label>Spacing</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-slate-500">Margin</span>
                                        <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-sm text-white" value={comp.style?.margin || 0} onChange={(e) => updateSelectedComponent({ style: { margin: parseInt(e.target.value) } })} />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-slate-500">Padding</span>
                                        <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-sm text-white" value={comp.style?.padding || 0} onChange={(e) => updateSelectedComponent({ style: { padding: parseInt(e.target.value) } })} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label>Dimensions</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-slate-500">Width</span>
                                        <Input value={comp.style?.width || ''} onChange={(e) => updateSelectedComponent({ style: { width: e.target.value } })} placeholder="auto / 100%" />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-slate-500">Height</span>
                                        <Input value={comp.style?.height || ''} onChange={(e) => updateSelectedComponent({ style: { height: e.target.value } })} placeholder="auto" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label>Appearance</Label>
                                <div className="flex gap-2 items-center mb-2">
                                     <input type="color" className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" value={comp.style?.backgroundColor || '#000000'} onChange={(e) => updateSelectedComponent({ style: { backgroundColor: e.target.value } })} />
                                     <span className="text-xs text-slate-400">Background</span>
                                </div>
                                <div className="flex gap-2 items-center">
                                     <input type="color" className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" value={comp.style?.color || '#ffffff'} onChange={(e) => updateSelectedComponent({ style: { color: e.target.value } })} />
                                     <span className="text-xs text-slate-400">Text Color</span>
                                </div>
                            </div>
                            
                            <div>
                                <Label>Borders</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-slate-500">Radius</span>
                                        <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-sm text-white" value={comp.style?.borderRadius || 0} onChange={(e) => updateSelectedComponent({ style: { borderRadius: parseInt(e.target.value) } })} />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-slate-500">Width</span>
                                        <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-sm text-white" value={comp.style?.borderWidth || 0} onChange={(e) => updateSelectedComponent({ style: { borderWidth: parseInt(e.target.value) } })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                      </>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-200">
      {/* --- Left Palette --- */}
      <div className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0 z-20 shadow-xl">
          <div className="p-4 border-b border-slate-800">
              <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
                  <span>←</span> Back to Flow
              </button>
              <h2 className="font-bold text-lg text-white">Components</h2>
              <p className="text-xs text-slate-500">Drag items to the canvas</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {COMPONENT_PALETTE.map((item) => (
                  <div 
                      key={item.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.type, 'palette', item.type)}
                      className="p-3 bg-slate-800 rounded-lg border border-slate-700 cursor-grab hover:border-cyan-500 hover:bg-slate-700 transition-all flex items-center gap-3 group"
                  >
                      <div className="text-slate-400 group-hover:text-cyan-400 transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                          </svg>
                      </div>
                      <span className="font-medium text-sm text-slate-200">{item.label}</span>
                  </div>
              ))}
          </div>
      </div>

      {/* --- Center Canvas --- */}
      <div className="flex-1 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] relative flex flex-col items-center justify-center p-8 overflow-hidden"
           onDragOver={(e) => e.preventDefault()}
           onDrop={handleRootDrop}
      >
          {/* View Mode Toggle */}
          <div className="absolute top-4 flex bg-slate-900 p-1 rounded-lg border border-slate-700 shadow-lg z-30">
              <button 
                  onClick={() => setViewMode('mobile')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'mobile' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                  📱 Mobile
              </button>
              <button 
                  onClick={() => setViewMode('desktop')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'desktop' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                  🖥️ Desktop
              </button>
          </div>

          <div className="flex-1 w-full flex items-center justify-center overflow-auto custom-scrollbar">
              <div 
                  className={`
                      relative bg-white dark:bg-slate-950 transition-all duration-500 shadow-2xl border-8 border-slate-900
                      ${viewMode === 'mobile' ? 'w-[375px] min-h-[812px] rounded-[3rem]' : 'w-[1024px] min-h-[768px] rounded-xl'}
                  `}
                  onClick={() => setSelectedComponentId(null)}
              >
                  {/* Mobile Notch */}
                  {viewMode === 'mobile' && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-xl z-10 pointer-events-none"></div>
                  )}

                  {/* Canvas Content */}
                  <div className={`w-full h-full overflow-y-auto p-4 ${viewMode === 'mobile' ? 'pt-8 pb-8' : ''}`}>
                      {screen.components.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-8 text-center text-slate-500 opacity-50">
                              <div className="text-4xl mb-2">🖐️</div>
                              <p className="font-bold">Drop Components Here</p>
                              <p className="text-xs mt-1">Drag from the left palette</p>
                          </div>
                      ) : (
                          renderComponentTree(screen.components)
                      )}
                  </div>
              </div>
          </div>
      </div>

      {/* --- Right Property Panel --- */}
      <div className="w-80 border-l border-slate-800 bg-slate-900/50 flex flex-col shrink-0 z-20 shadow-xl">
          {renderProperties()}
      </div>
    </div>
  );
};
