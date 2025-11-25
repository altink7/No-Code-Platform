import React, { useState } from 'react';
import { Modal, Button, Card } from './UI';

interface HelpModalProps {
  onClose: () => void;
}

type TabId = 'welcome' | 'setup' | 'ai' | 'flow' | 'editor' | 'layouts' | 'deploy';

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('welcome');

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'welcome', label: 'Welcome', icon: '👋' },
    { id: 'setup', label: 'Project Setup', icon: '⚙️' },
    { id: 'ai', label: 'AI Magic', icon: '✨' },
    { id: 'flow', label: 'Flow Builder', icon: '🕸️' },
    { id: 'editor', label: 'UI Editor', icon: '🎨' },
    { id: 'layouts', label: 'Advanced Layouts', icon: '📐' },
    { id: 'deploy', label: 'Export & Deploy', icon: '🚀' },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'welcome':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <div>
                 <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 mb-2">
                    NebulaBuilder
                 </h3>
                 <p className="text-lg text-slate-300">
                    The next-generation No-Code platform that bridges the gap between imagination and reality.
                 </p>
             </div>
             
             <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4">
               <h4 className="font-bold text-white text-lg">🚀 What can you do?</h4>
               <ul className="space-y-3 text-slate-400">
                 <li className="flex gap-3 items-start">
                    <span className="text-cyan-400 mt-1">✓</span>
                    <span><strong>Generate Apps with AI:</strong> Describe your idea in plain English and watch the screens appear.</span>
                 </li>
                 <li className="flex gap-3 items-start">
                    <span className="text-cyan-400 mt-1">✓</span>
                    <span><strong>Design Visually:</strong> Drag, drop, and style components on an infinite canvas.</span>
                 </li>
                 <li className="flex gap-3 items-start">
                    <span className="text-cyan-400 mt-1">✓</span>
                    <span><strong>Export Clean Code:</strong> Get production-ready React Native or React.js code instantly.</span>
                 </li>
               </ul>
             </div>

             <div className="p-4 border-l-4 border-fuchsia-500 bg-fuchsia-500/10 rounded-r-lg">
                 <p className="text-fuchsia-300 font-medium">✨ Pro Tip: Use the 'Preview' mode often to test your navigation flow and interactions on a simulated device.</p>
             </div>
          </div>
        );

      case 'setup':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <h3 className="text-2xl font-bold text-white">Project Initialization</h3>
             <p className="text-slate-400">Every great app starts with a strong identity. The setup phase defines the core DNA of your application.</p>
             
             <div className="grid gap-6">
                 <Card className="bg-slate-900 border-slate-800">
                     <h5 className="font-bold text-cyan-400 mb-2">Platform Selection</h5>
                     <p className="text-sm text-slate-400 mb-2">Choosing the right platform changes how the code is generated:</p>
                     <ul className="list-disc list-inside text-sm text-slate-500 space-y-1 ml-2">
                         <li><strong>Mobile:</strong> Generates React Native code (View, Text, TouchableOpacity). Optimized for iOS & Android.</li>
                         <li><strong>Web:</strong> Generates React.js code (div, button, input). Optimized for responsive browsers.</li>
                     </ul>
                 </Card>

                 <Card className="bg-slate-900 border-slate-800">
                     <h5 className="font-bold text-fuchsia-400 mb-2">Design System</h5>
                     <p className="text-sm text-slate-400">
                         Global settings like <strong>Primary Color</strong> and <strong>Typography</strong> are applied automatically to all new components. 
                         Changing these later in the code is easy, but setting them here ensures visual consistency while building.
                     </p>
                 </Card>
             </div>
          </div>
        );

      case 'ai':
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-tr from-cyan-500 to-fuchsia-500 rounded-lg">
                        <span className="text-xl">✨</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">AI Magic Builder</h3>
                </div>
                <p className="text-slate-400">NebulaBuilder uses Google Gemini 2.5 to understand complex app requirements and translate them into structured screen flows.</p>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                    <h5 className="font-bold text-white mb-3">How to write effective prompts</h5>
                    <div className="space-y-4">
                        <div>
                            <span className="text-xs font-bold text-red-400 uppercase tracking-wide">Bad Prompt</span>
                            <p className="text-slate-500 italic">"Make a shopping app."</p>
                        </div>
                        <div className="h-px bg-slate-700"></div>
                        <div>
                            <span className="text-xs font-bold text-green-400 uppercase tracking-wide">Good Prompt</span>
                            <p className="text-slate-300 italic">"Create a plant care application with a 'My Garden' dashboard showing a list of plants. Include a 'Plant Details' screen with watering schedule and a 'Add Plant' form with inputs for name and species."</p>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-slate-500">
                    <strong>Note:</strong> The AI generates the <em>structure</em> (screens, names, connections, and base components). You can then refine the layout and style manually in the Editor.
                </p>
            </div>
        );

      case 'flow':
        return (
           <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-2xl font-bold text-white">The Flow Canvas</h3>
              <p className="text-slate-400">The high-level view of your application architecture. Arrange screens and define navigation paths.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                      <span className="text-2xl block mb-3">🖱️</span>
                      <h5 className="font-bold text-white">Navigation</h5>
                      <ul className="text-sm text-slate-400 mt-2 space-y-1">
                          <li>• <strong>Drag Card:</strong> Move screens around.</li>
                          <li>• <strong>Delete:</strong> Click the red dot on a card header.</li>
                          <li>• <strong>Edit UI:</strong> Click the center of the card.</li>
                      </ul>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                      <span className="text-2xl block mb-3">🔗</span>
                      <h5 className="font-bold text-white">Linking Screens</h5>
                      <p className="text-sm text-slate-400 mt-2">
                          Click and drag from the <strong>Cyan Dot</strong> (Output) on the right side of a screen to any other screen. 
                          This creates a navigation connection used in the code export.
                      </p>
                  </div>
              </div>
           </div>
        );

      case 'editor':
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <h3 className="text-2xl font-bold text-white">Visual UI Editor</h3>
               <p className="text-slate-400">The heart of the builder. Construct your screens component by component.</p>

               <div className="space-y-4">
                   <div className="flex gap-4 p-4 bg-slate-900 rounded-lg border border-slate-800">
                       <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xl shrink-0">1</div>
                       <div>
                           <h5 className="font-bold text-white">The Palette</h5>
                           <p className="text-sm text-slate-400">Located on the left. Drag items like Buttons, Inputs, or Groups onto the central phone/web canvas.</p>
                       </div>
                   </div>

                   <div className="flex gap-4 p-4 bg-slate-900 rounded-lg border border-slate-800">
                       <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xl shrink-0">2</div>
                       <div>
                           <h5 className="font-bold text-white">Property Panel</h5>
                           <p className="text-sm text-slate-400">Located on the right. When you select a component, this panel shows two tabs:</p>
                           <ul className="mt-2 space-y-1 text-sm text-slate-500 ml-4 list-disc">
                               <li><strong>Config:</strong> Functional props (Text, Placeholder, Validation, Actions).</li>
                               <li><strong>Style:</strong> Visual props (Colors, Margins, Padding, Dimensions).</li>
                           </ul>
                       </div>
                   </div>

                   <div className="flex gap-4 p-4 bg-slate-900 rounded-lg border border-slate-800">
                       <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xl shrink-0">3</div>
                       <div>
                           <h5 className="font-bold text-white">Validation & Actions</h5>
                           <p className="text-sm text-slate-400">
                               For <strong>Inputs</strong>, you can set "Required" or "Min Length".
                               For <strong>Buttons</strong>, you can set the "On Click" action to navigate to another screen or submit a form.
                           </p>
                       </div>
                   </div>
               </div>
            </div>
        );

      case 'layouts':
         return (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                 <h3 className="text-2xl font-bold text-white">Mastering Layouts</h3>
                 <p className="text-slate-400">Create complex, responsive designs using the <strong>Group</strong> component and Flexbox controls.</p>

                 <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                         <div className="flex flex-col gap-2 mb-3 p-2 bg-slate-900 rounded border border-slate-800 h-20 justify-center">
                             <div className="h-2 w-2/3 bg-slate-600 rounded"></div>
                             <div className="h-2 w-1/2 bg-slate-600 rounded"></div>
                         </div>
                         <h5 className="font-bold text-cyan-400">Column (Default)</h5>
                         <p className="text-xs text-slate-400 mt-1">Items stack vertically. Good for forms and lists.</p>
                     </div>
                     <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                         <div className="flex gap-2 mb-3 p-2 bg-slate-900 rounded border border-slate-800 h-20 items-center">
                             <div className="h-8 w-8 bg-slate-600 rounded"></div>
                             <div className="h-8 w-8 bg-slate-600 rounded"></div>
                             <div className="h-8 w-8 bg-slate-600 rounded"></div>
                         </div>
                         <h5 className="font-bold text-fuchsia-400">Row</h5>
                         <p className="text-xs text-slate-400 mt-1">Items align horizontally. Good for nav bars and card actions.</p>
                     </div>
                 </div>

                 <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
                     <h5 className="font-bold text-white mb-3">Layout Controls Guide</h5>
                     <ul className="space-y-3 text-sm text-slate-400">
                         <li><strong>Gap:</strong> Controls the space between items in a group.</li>
                         <li><strong>Align Items:</strong>
                             <ul className="ml-4 mt-1 text-slate-500 space-y-1">
                                 <li>• <em>Stretch:</em> Items fill the cross-axis (default).</li>
                                 <li>• <em>Center:</em> Items are centered.</li>
                                 <li>• <em>Start/End:</em> Items stick to top/left or bottom/right.</li>
                             </ul>
                         </li>
                         <li><strong>Flex Wrap:</strong> Allows items to wrap to the next line if there isn't enough space (perfect for grids).</li>
                     </ul>
                 </div>
             </div>
         );

      case 'deploy':
          return (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-2xl font-bold text-white">Export & Deployment</h3>
                  
                  <div className="space-y-4">
                      <div className="border-l-2 border-cyan-500 pl-4 py-1">
                          <h5 className="font-bold text-white">Preview Mode</h5>
                          <p className="text-sm text-slate-400">
                              Click the "Preview" button in the header. This compiles your app in memory and runs it in a simulator. 
                              You can type in inputs, click buttons, and test validation logic live.
                          </p>
                      </div>

                      <div className="border-l-2 border-fuchsia-500 pl-4 py-1">
                          <h5 className="font-bold text-white">Clean Code Export</h5>
                          <p className="text-sm text-slate-400">
                              The "Export Code" feature doesn't just give you a messy blob. It generates:
                          </p>
                          <ul className="list-disc ml-4 mt-2 text-sm text-slate-500">
                              <li>Proper component structure.</li>
                              <li>Extracted StyleSheet objects (for React Native).</li>
                              <li>Navigation configuration.</li>
                              <li>Clean prop drilling.</li>
                          </ul>
                      </div>

                      <div className="border-l-2 border-green-500 pl-4 py-1">
                          <h5 className="font-bold text-white">Cloud Deploy</h5>
                          <p className="text-sm text-slate-400">
                              Our simulated deployment pipeline shows you how a CI/CD process works: 
                              Validation -> Bundling -> Optimization -> CDN Upload.
                          </p>
                      </div>
                  </div>
              </div>
          );
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Documentation & Knowledge Base">
       <div className="flex h-[600px] flex-col md:flex-row">
           {/* Sidebar Navigation */}
           <div className="w-full md:w-64 border-r border-slate-800 pr-0 md:pr-4 shrink-0 flex flex-col bg-slate-900/30 p-2 md:p-0 rounded-l-lg">
               <div className="space-y-1 overflow-y-auto custom-scrollbar flex-1">
                   {tabs.map(tab => (
                       <button 
                         key={tab.id}
                         onClick={() => setActiveTab(tab.id)}
                         className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-3
                             ${activeTab === tab.id 
                                ? 'bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-400 border-l-2 border-cyan-400' 
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                             }`}
                       >
                           <span className="text-lg">{tab.icon}</span>
                           {tab.label}
                       </button>
                   ))}
               </div>
               
               <div className="mt-4 pt-6 border-t border-slate-800 md:block hidden">
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2 px-2">Architect</p>
                   <div className="px-2">
                       <p className="text-sm font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                           Altin Kelmendi
                       </p>
                       <p className="text-xs text-slate-600 mt-1">Lead Designer & Engineer</p>
                   </div>
               </div>
           </div>

           {/* Content Area */}
           <div className="flex-1 pl-0 md:pl-8 pt-4 md:pt-0 overflow-y-auto custom-scrollbar">
               {renderContent()}
           </div>
       </div>
       
       <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-800">
           <span className="text-xs text-slate-600 md:hidden">Designed by Altin Kelmendi</span>
           <div className="ml-auto">
                <Button variant="ghost" onClick={onClose}>Close Documentation</Button>
           </div>
       </div>
    </Modal>
  );
};
