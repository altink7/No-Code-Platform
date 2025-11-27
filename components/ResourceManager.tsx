

import React, { useState } from 'react';
import { ProjectResources, Asset, Translation } from '../types';
import { Modal, Button, Input, Label, Card, Select } from './UI';

interface ResourceManagerProps {
  resources: ProjectResources;
  onUpdate: (resources: ProjectResources) => void;
  onClose: () => void;
}

export const ResourceManager: React.FC<ResourceManagerProps> = ({ resources, onUpdate, onClose }) => {
  const [activeTab, setActiveTab] = useState<'translations' | 'images' | 'files'>('translations');
  
  // Translation State
  const [selectedLang, setSelectedLang] = useState(resources.defaultLanguage || 'en');
  const [newKey, setNewKey] = useState('');
  const [newLangCode, setNewLangCode] = useState('');

  // Asset State
  const [uploadUrl, setUploadUrl] = useState('');

  // --- Translation Logic ---

  const handleAddLanguage = () => {
      if (newLangCode && !resources.languages.includes(newLangCode)) {
          onUpdate({
              ...resources,
              languages: [...resources.languages, newLangCode]
          });
          setNewLangCode('');
      }
  };

  const handleAddKey = () => {
      if (newKey && !resources.translations.find(t => t.key === newKey)) {
          onUpdate({
              ...resources,
              translations: [...resources.translations, { key: newKey, values: {} }]
          });
          setNewKey('');
      }
  };

  const handleUpdateTranslationValue = (key: string, value: string) => {
      const updated = resources.translations.map(t => {
          if (t.key === key) {
              return { ...t, values: { ...t.values, [selectedLang]: value } };
          }
          return t;
      });
      onUpdate({ ...resources, translations: updated });
  };

  // --- Asset Logic ---

  const handleAddAsset = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const url = URL.createObjectURL(file);
          const newAsset: Asset = {
              id: Date.now().toString(),
              name: file.name,
              url: url,
              type: type
          };
          onUpdate({ ...resources, assets: [...resources.assets, newAsset] });
      }
  };

  const handleDeleteAsset = (id: string) => {
       const updatedAssets = resources.assets.filter(a => a.id !== id);
       onUpdate({ ...resources, assets: updatedAssets });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Resource Center">
       <div className="h-[600px] flex flex-col">
           {/* Navigation Tabs */}
           <div className="flex border-b border-slate-800 mb-4 shrink-0">
               <button 
                  onClick={() => setActiveTab('translations')}
                  className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'translations' ? 'text-cyan-400 border-cyan-400 bg-slate-800/30' : 'text-slate-500 border-transparent hover:text-white'}`}
               >
                   <span>🌐</span> Translations
               </button>
               <button 
                  onClick={() => setActiveTab('images')}
                  className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'images' ? 'text-cyan-400 border-cyan-400 bg-slate-800/30' : 'text-slate-500 border-transparent hover:text-white'}`}
               >
                   <span>🖼️</span> Images
               </button>
               <button 
                  onClick={() => setActiveTab('files')}
                  className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'files' ? 'text-cyan-400 border-cyan-400 bg-slate-800/30' : 'text-slate-500 border-transparent hover:text-white'}`}
               >
                   <span>📁</span> Files
               </button>
           </div>

           {/* Content Area */}
           <div className="flex-1 overflow-hidden flex">
               {activeTab === 'translations' && (
                   <div className="flex-1 flex gap-4">
                       {/* Left: Language Manager */}
                       <div className="w-48 border-r border-slate-800 pr-4 flex flex-col gap-4">
                           <div>
                               <Label>Active Language</Label>
                               <div className="space-y-1 mt-2">
                                   {resources.languages.map(lang => (
                                       <button
                                            key={lang}
                                            onClick={() => setSelectedLang(lang)}
                                            className={`w-full text-left px-3 py-2 rounded text-sm font-bold flex justify-between items-center ${selectedLang === lang ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                                       >
                                           {lang.toUpperCase()}
                                           {lang === resources.defaultLanguage && <span className="text-[10px] bg-slate-700 px-1 rounded">DEF</span>}
                                       </button>
                                   ))}
                               </div>
                           </div>
                           <div className="mt-auto pt-4 border-t border-slate-800">
                               <Label>Add Locale</Label>
                               <div className="flex gap-2">
                                   <Input placeholder="fr, de..." value={newLangCode} onChange={(e) => setNewLangCode(e.target.value)} className="w-full min-w-0" />
                                   <Button size="sm" onClick={handleAddLanguage} disabled={!newLangCode}>+</Button>
                               </div>
                           </div>
                       </div>

                       {/* Right: Keys Table */}
                       <div className="flex-1 flex flex-col overflow-hidden">
                           <div className="flex gap-2 mb-4">
                               <Input placeholder="New Translation Key (e.g. home_title)" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
                               <Button onClick={handleAddKey} disabled={!newKey}>Add Key</Button>
                           </div>
                           <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                               {resources.translations.map(t => (
                                   <div key={t.key} className="bg-slate-800/50 p-3 rounded border border-slate-700 flex flex-col gap-2">
                                       <div className="flex justify-between items-center">
                                           <span className="font-mono text-cyan-400 text-xs font-bold">{t.key}</span>
                                           <span className="text-[10px] text-slate-500 uppercase tracking-widest">{selectedLang}</span>
                                       </div>
                                       <Input 
                                            value={t.values[selectedLang] || ''} 
                                            onChange={(e) => handleUpdateTranslationValue(t.key, e.target.value)}
                                            placeholder={`Value for ${selectedLang}...`}
                                            className="bg-slate-900 border-slate-800 focus:border-cyan-500"
                                       />
                                   </div>
                               ))}
                               {resources.translations.length === 0 && (
                                   <div className="text-center text-slate-500 py-10 italic">No keys added yet.</div>
                               )}
                           </div>
                       </div>
                   </div>
               )}

               {(activeTab === 'images' || activeTab === 'files') && (
                   <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                       <Card className="bg-slate-900 border-slate-800 p-6 mb-6">
                           <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-8 hover:border-cyan-500 hover:bg-slate-800/50 transition-all cursor-pointer relative group">
                               <input 
                                    type="file" 
                                    onChange={(e) => handleAddAsset(e, activeTab === 'images' ? 'image' : 'file')} 
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                    accept={activeTab === 'images' ? "image/*" : "*"}
                               />
                               <div className="text-5xl mb-4 text-slate-600 group-hover:text-cyan-400 transition-colors">
                                   {activeTab === 'images' ? '🖼️' : '📁'}
                               </div>
                               <h4 className="text-lg font-bold text-white mb-1">Upload {activeTab === 'images' ? 'Images' : 'Files'}</h4>
                               <p className="text-slate-400 text-sm">Drag & drop or click to browse</p>
                           </div>
                       </Card>

                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           {resources.assets.filter(a => activeTab === 'images' ? a.type === 'image' : a.type === 'file').map((asset) => (
                               <div key={asset.id} className="bg-slate-800 p-2 rounded-lg border border-slate-700 relative group hover:border-cyan-500 transition-colors">
                                   <div className="aspect-square bg-slate-900 rounded mb-2 overflow-hidden flex items-center justify-center">
                                       {asset.type === 'image' ? (
                                           <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                                       ) : (
                                           <div className="flex flex-col items-center text-slate-500">
                                               <span className="text-3xl mb-1">📄</span>
                                               <span className="text-[10px] uppercase font-bold">{asset.name.split('.').pop()}</span>
                                           </div>
                                       )}
                                   </div>
                                   <p className="text-xs text-slate-300 truncate font-medium px-1">{asset.name}</p>
                                   <button 
                                        onClick={() => handleDeleteAsset(asset.id)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                   >
                                       <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                   </button>
                               </div>
                           ))}
                       </div>
                   </div>
               )}
           </div>
       </div>
    </Modal>
  );
};