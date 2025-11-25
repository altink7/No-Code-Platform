
import React, { useState } from 'react';
import { Screen, UIComponent, COMPONENT_PALETTE, ComponentType, ComponentStyle } from '../../types';
import { Button, Input, Label, Select } from '../UI';

interface ScreenEditorProps {
  screen: Screen;
  onBack: () => void;
  onUpdateScreen: (screen: Screen) => void;
  allScreens?: Screen[]; // Pass all screens for navigation linking
}

export const ScreenEditor: React.FC<ScreenEditorProps> = ({ screen, onBack, onUpdateScreen, allScreens = [] }) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [propertiesTab, setPropertiesTab] = useState<'props' | 'style'>('props');

  // --- Tree Helpers ---

  // Find a component and its parent in the tree
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
      targetId: string | null, // null means root end
      component: UIComponent, 
      position: 'before' | 'after' | 'inside'
  ): UIComponent[] => {
      if (!targetId) {
          return [...components, component];
      }
      
      // If dropping inside a group
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

      // If dropping before/after logic
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
      };

      if (comp.type === 'Group') {
          return (
              <div 
                  className={`min-h-[60px] border border-dashed border-slate-700/50 rounded-lg transition-colors ${comp.props.collapsed ? 'h-12 overflow-hidden' : ''}`}
                  style={{ ...commonStyle }}
              >
                  <div className="px-2 py-1 bg-slate-800/50 flex justify-between items-center cursor-pointer select-none">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{comp.label || 'Group'}</span>
                       {comp.props.collapsible && (
                           <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updateSelectedComponent({ props: { collapsed: !comp.props.collapsed } });
                                }}
                                className="text-slate-400 hover:text-white"
                           >
                               {comp.props.collapsed ? '▼' : '▲'}
                           </button>
                       )}
                  </div>
                  {!comp.props.collapsed && (
                      <div className="p-2 flex flex-col min-h-[40px]">
                           {comp.children && comp.children.length > 0 ? (
                               renderComponentTree(comp.children)
                           ) : (
                               <div className="text-center text-slate-600 text-xs py-2 italic">Empty Group</div>
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
                    className="w-full font-medium transition-all pointer-events-none"
                    style={{
                        ...commonStyle,
                        backgroundColor: comp.props.variant === 'secondary' ? '#334155' : '#0891b2',
                        color: 'white',
                        padding: comp.style?.padding || 12,
                        borderRadius: comp.style?.borderRadius || 8
                    }}
                >
                    {comp.label}
                </button>
              );
          case 'Input':
              return (
                <div style={commonStyle}>
                     <label className="block text-xs font-bold text-slate-500 mb-1">{comp.label} {comp.props.validation?.required && <span className="text-red-400">*</span>}</label>
                     <div className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-700 rounded text-sm text-slate-300">
                         {comp.props.placeholder || 'Type here...'}
                     </div>
                </div>
              );
           case 'Dropdown':
              return (
                  <div style={commonStyle}>
                      <label className="block text-xs font-bold text-slate-500 mb-1">{comp.label}</label>
                      <div className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 flex justify-between items-center">
                          <span>{comp.props.options?.[0] || 'Select option...'}</span>
                          <span className="text-xs">▼</span>
                      </div>
                  </div>
              );
           case 'Text':
              return (
                  <div style={{...commonStyle, color: comp.style?.color}}>
                      <p className={`pointer-events-none ${comp.props.size === 'lg' ? 'text-xl font-bold' : 'text-sm'}`} style={{ textAlign: comp.props.align }}>
                          {comp.label}
                      </p>
                  </div>
              );
           case 'Header':
              return (
                  <div className="flex items-center justify-between shadow-sm border-b border-slate-700/50 p-4 bg-slate-800" style={commonStyle}>
                      <div className="w-6 h-6 bg-slate-700 rounded-full"></div>
                      <span className="font-bold text-lg text-white">{comp.label}</span>
                      <div className="w-6 h-6 bg-slate-700 rounded-full"></div>
                  </div>
              );
           case 'Card':
              return (
                  <div className="bg-slate-800 rounded-xl shadow-md p-4 space-y-2 border border-slate-700" style={commonStyle}>
                      {comp.props.showImage !== false && <div className="h-32 bg-slate-700 rounded-lg w-full mb-2"></div>}
                      <h4 className="font-bold text-slate-200">{comp.label}</h4>
                      <div className="h-2 w-2/3 bg-slate-700 rounded"></div>
                  </div>
              );
            case 'Image':
                return (
                    <div className="w-full aspect-video bg-slate-800 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-700" style={commonStyle}>
                        <span className="text-xs text-slate-500">{comp.label}</span>
                    </div>
                );
          default:
              return <div className="p-2 bg-red-500/20 text-red-300 text-xs">Unknown: {comp.type}</div>
      }
  };


  // --- Property Panel Renderer ---

  const renderProperties = () => {
      const comp = getSelectedComponent();
      if (!comp) return <div className="p-8 text-center text-slate-500 text-sm">Select a component to edit</div>;

      return (
          <div className="flex flex-col h-full">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
                  <div className="flex flex-col">
                      <span className="text-xs text-slate-500 uppercase font-bold">{comp.type}</span>
                      <span className="text-sm font-mono text-cyan-400">{comp.id.slice(-4)}</span>
                  </div>
                  <button onClick={deleteSelectedComponent} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
              </div>

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
                      Appearance
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                  {propertiesTab === 'props' ? (
                      <>
                        <div>
                            <Label>Label / Text</Label>
                            <Input value={comp.label} onChange={(e) => updateSelectedComponent({ label: e.target.value })} />
                        </div>
                        
                        {comp.type === 'Button' && (
                             <>
                                <div>
                                    <Label>Variant</Label>
                                    <Select 
                                        value={comp.props.variant || 'primary'}
                                        onChange={(e) => updateSelectedComponent({ props: { variant: e.target.value } })}
                                        options={[
                                            { label: 'Primary (Cyan)', value: 'primary' },
                                            { label: 'Secondary (Dark)', value: 'secondary' }
                                        ]}
                                    />
                                </div>
                                <div>
                                    <Label>On Click Action</Label>
                                    <Select 
                                        value={comp.props.action?.type === 'navigate' ? comp.props.action.targetId : (comp.props.action?.type || 'none')}
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

                        {comp.type === 'Input' && (
                            <>
                                <div>
                                    <Label>Placeholder</Label>
                                    <Input 
                                        value={comp.props.placeholder || ''}
                                        onChange={(e) => updateSelectedComponent({ props: { placeholder: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-3 pt-4 border-t border-slate-800">
                                    <Label className="text-cyan-400">Validation Rules</Label>
                                    <div className="flex items-center justify-between p-2 bg-slate-800 rounded">
                                        <span className="text-sm text-slate-300">Required Field</span>
                                        <input 
                                            type="checkbox" 
                                            checked={comp.props.validation?.required || false}
                                            onChange={(e) => updateSelectedComponent({ props: { validation: { ...comp.props.validation, required: e.target.checked } } })}
                                            className="toggle-checkbox"
                                        />
                                    </div>
                                    <div>
                                        <Label>Min Length</Label>
                                        <Input 
                                            type="number"
                                            value={comp.props.validation?.minLength || ''}
                                            onChange={(e) => updateSelectedComponent({ props: { validation: { ...comp.props.validation, minLength: parseInt(e.target.value) || undefined } } })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Error Message</Label>
                                        <Input 
                                            value={comp.props.validation?.errorMessage || ''}
                                            placeholder="Custom error text..."
                                            onChange={(e) => updateSelectedComponent({ props: { validation: { ...comp.props.validation, errorMessage: e.target.value } } })}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        
                        {comp.type === 'Group' && (
                             <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                                 <span className="text-sm text-slate-300">Collapsible</span>
                                 <input 
                                     type="checkbox" 
                                     checked={comp.props.collapsible || false}
                                     onChange={(e) => updateSelectedComponent({ props: { collapsible: e.target.checked } })}
                                     className="toggle-checkbox"
                                 />
                             </div>
                        )}

                        {comp.type === 'Dropdown' && (
                             <div>
                                <Label>Options (comma sep)</Label>
                                <Input 
                                    value={comp.props.options ? comp.props.options.join(',') : ''}
                                    onChange={(e) => updateSelectedComponent({ props: { options: e.target.value.split(',') } })}
                                    placeholder="Option 1, Option 2"
                                />
                             </div>
                        )}
                      </>
                  ) : (
                      <>
                        <div className="space-y-4">
                            <div>
                                <Label>Margin</Label>
                                <input 
                                    type="range" min="0" max="48" step="4"
                                    value={comp.style?.margin || 0}
                                    onChange={(e) => updateSelectedComponent({ style: { margin: parseInt(e.target.value) } })}
                                    className="w-full accent-cyan-500"
                                />
                            </div>

                            <div>
                                <Label>Padding</Label>
                                <input 
                                    type="range" min="0" max="48" step="4"
                                    value={comp.style?.padding || 0}
                                    onChange={(e) => updateSelectedComponent({ style: { padding: parseInt(e.target.value) } })}
                                    className="w-full accent-cyan-500"
                                />
                            </div>

                            <div>
                                <Label>Width</Label>
                                <div className="flex gap-2">
                                    <button onClick={() => updateSelectedComponent({ style: { width: '100%' } })} className="flex-1 py-1 text-xs border rounded border-slate-700 hover:bg-slate-800">100%</button>
                                    <button onClick={() => updateSelectedComponent({ style: { width: '50%' } })} className="flex-1 py-1 text-xs border rounded border-slate-700 hover:bg-slate-800">50%</button>
                                    <button onClick={() => updateSelectedComponent({ style: { width: 'auto' } })} className="flex-1 py-1 text-xs border rounded border-slate-700 hover:bg-slate-800">Auto</button>
                                </div>
                            </div>

                            <div>
                                <Label>Background</Label>
                                <div className="flex gap-2 items-center">
                                    <input 
                                        type="color" 
                                        value={comp.style?.backgroundColor === 'transparent' ? '#000000' : comp.style?.backgroundColor}
                                        onChange={(e) => updateSelectedComponent({ style: { backgroundColor: e.target.value } })}
                                        className="bg-transparent w-8 h-8 rounded cursor-pointer border-0"
                                    />
                                    <button onClick={() => updateSelectedComponent({ style: { backgroundColor: 'transparent' } })} className="text-xs text-slate-400 underline">Clear</button>
                                </div>
                            </div>
                            
                            <div>
                                <Label>Border Radius</Label>
                                <input 
                                    type="range" min="0" max="32"
                                    value={comp.style?.borderRadius || 0}
                                    onChange={(e) => updateSelectedComponent({ style: { borderRadius: parseInt(e.target.value) } })}
                                    className="w-full accent-cyan-500"
                                />
                            </div>
                        </div>
                      </>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="flex h-full animate-in slide-in-from-right duration-300">
      <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col z-20 shadow-xl shrink-0">
          <div className="p-4 border-b border-slate-700 flex items-center gap-3">
              <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h3 className="font-bold text-slate-100">Toolbox</h3>
          </div>
          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-2 gap-2">
                  {COMPONENT_PALETTE.map(item => (
                      <div 
                          key={item.type}
                          draggable
                          onDragStart={(e) => handleDragStart(e, `palette-${item.type}`, 'palette', item.type)}
                          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500 rounded-lg p-3 flex flex-col items-center gap-2 cursor-grab transition-all group"
                      >
                          <svg className="w-6 h-6 text-slate-500 group-hover:text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                          </svg>
                          <span className="text-[10px] text-slate-400 group-hover:text-white font-medium">{item.label}</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      <div className="flex-1 bg-slate-950 flex flex-col min-w-0 relative">
          <div className="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0 z-20">
             <div className="flex items-center gap-4">
                 <h2 className="text-white font-bold">{screen.name}</h2>
                 <div className="h-4 w-px bg-slate-700"></div>
                 <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                     <button onClick={() => setViewMode('mobile')} className={`px-3 py-1 text-xs rounded transition-all ${viewMode === 'mobile' ? 'bg-slate-700 text-cyan-400' : 'text-slate-400'}`}>Mobile</button>
                     <button onClick={() => setViewMode('desktop')} className={`px-3 py-1 text-xs rounded transition-all ${viewMode === 'desktop' ? 'bg-slate-700 text-fuchsia-400' : 'text-slate-400'}`}>Web</button>
                 </div>
             </div>
          </div>

          <div 
            className="flex-1 overflow-auto p-8 flex justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-100 custom-scrollbar"
            onClick={() => setSelectedComponentId(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleRootDrop}
          >
             <div 
                className={`
                    transition-all duration-500 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col
                    ${viewMode === 'mobile' ? 'w-[375px] h-[812px] rounded-[3rem] border-[12px] border-slate-800' : 'w-[1024px] h-[768px] rounded-lg border border-slate-700'}
                `}
                onClick={(e) => e.stopPropagation()}
             >
                 {viewMode === 'mobile' && (
                     <div className="h-7 bg-slate-800 w-40 mx-auto rounded-b-2xl absolute top-0 left-0 right-0 z-50 pointer-events-none"></div>
                 )}
                 {viewMode === 'desktop' && (
                     <div className="h-8 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2">
                         <div className="w-3 h-3 rounded-full bg-red-500"></div>
                         <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                         <div className="w-3 h-3 rounded-full bg-green-500"></div>
                     </div>
                 )}

                 <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative">
                     {screen.components.length === 0 ? (
                         <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700 rounded-xl m-4">
                             <p className="mb-2">Drag components here</p>
                             <span className="text-4xl opacity-20">🏗️</span>
                         </div>
                     ) : (
                         renderComponentTree(screen.components)
                     )}
                     
                     <div 
                        className="h-24 w-full" 
                        onDragOver={(e) => {
                             e.preventDefault(); 
                             setDropPosition('after'); 
                             setDragOverId(null); 
                        }}
                        onDrop={handleRootDrop}
                     />
                 </div>
             </div>
          </div>
      </div>

      <div className="w-80 bg-slate-900 border-l border-slate-700 z-20 shrink-0 shadow-xl">
          {renderProperties()}
      </div>

    </div>
  );
};
