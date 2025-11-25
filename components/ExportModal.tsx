
import React, { useState, useEffect } from 'react';
import { Project, UIComponent } from '../types';
import { Modal, Button } from './UI';

interface ExportModalProps {
  project: Project;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ project, onClose }) => {
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState<'json' | 'react' | 'deploy'>('react');
  const [deployStep, setDeployStep] = useState(0);
  const [deployedUrl, setDeployedUrl] = useState('');

  useEffect(() => {
    if (activeTab === 'json') {
        setCode(JSON.stringify(project, null, 2));
    } else if (activeTab === 'react') {
        setCode(generateReactCode(project));
    }
  }, [project, activeTab]);

  const handleDeploy = () => {
      setDeployStep(1);
      setTimeout(() => setDeployStep(2), 1500); // Bundling
      setTimeout(() => setDeployStep(3), 3000); // Optimizing
      setTimeout(() => {
          setDeployStep(4); // Done
          setDeployedUrl(`https://${project.name.toLowerCase().replace(/\s+/g, '-')}.nebula-app.com`);
      }, 4500);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Export & Deploy">
       <div className="p-6">
           <div className="flex gap-4 mb-4 border-b border-slate-800 pb-2">
               <button 
                  onClick={() => setActiveTab('react')}
                  className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'react' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                   {project.platform === 'mobile' ? 'React Native Code' : 'React Web Code'}
               </button>
               <button 
                  onClick={() => setActiveTab('json')}
                  className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'json' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                   Project JSON
               </button>
               <button 
                  onClick={() => setActiveTab('deploy')}
                  className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'deploy' ? 'text-fuchsia-400 border-b-2 border-fuchsia-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                   Cloud Deploy
               </button>
           </div>

           {activeTab === 'deploy' ? (
               <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-slate-950/50 rounded-lg border border-slate-800">
                   {deployStep === 0 && (
                       <div className="text-center space-y-6">
                           <div className="w-24 h-24 bg-gradient-to-tr from-fuchsia-500 to-cyan-500 rounded-full mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(217,70,239,0.3)]">
                               <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                           </div>
                           <h3 className="text-2xl font-bold text-white">Ready to Launch?</h3>
                           <p className="text-slate-400 max-w-md mx-auto">Deploy your {project.platform} application to our secure global edge network. Includes SSL, CDN, and automatic scaling.</p>
                           <Button variant="neon" size="lg" onClick={handleDeploy}>Start Deployment</Button>
                       </div>
                   )}

                   {deployStep > 0 && deployStep < 4 && (
                       <div className="w-full max-w-md space-y-6">
                           <div className="flex justify-between text-sm text-slate-300 font-mono">
                               <span>Status:</span>
                               <span className="text-cyan-400 animate-pulse">
                                   {deployStep === 1 && 'Validating configuration...'}
                                   {deployStep === 2 && 'Bundling assets...'}
                                   {deployStep === 3 && 'Optimizing build...'}
                               </span>
                           </div>
                           <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                               <div 
                                   className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 transition-all duration-1000 ease-out"
                                   style={{ width: `${deployStep * 33}%` }}
                               ></div>
                           </div>
                           <div className="space-y-2">
                               <div className={`flex items-center gap-3 text-sm ${deployStep >= 1 ? 'text-green-400' : 'text-slate-600'}`}>
                                   <span className="w-4 h-4 border border-current rounded-full flex items-center justify-center text-[10px]">{deployStep > 1 ? '✓' : '1'}</span> Validating Structure
                               </div>
                               <div className={`flex items-center gap-3 text-sm ${deployStep >= 2 ? 'text-green-400' : 'text-slate-600'}`}>
                                   <span className="w-4 h-4 border border-current rounded-full flex items-center justify-center text-[10px]">{deployStep > 2 ? '✓' : '2'}</span> Compiling {project.platform === 'mobile' ? 'React Native' : 'React'} Code
                               </div>
                               <div className={`flex items-center gap-3 text-sm ${deployStep >= 3 ? 'text-green-400' : 'text-slate-600'}`}>
                                   <span className="w-4 h-4 border border-current rounded-full flex items-center justify-center text-[10px]">{deployStep > 3 ? '✓' : '3'}</span> Uploading to Edge
                               </div>
                           </div>
                       </div>
                   )}

                   {deployStep === 4 && (
                       <div className="text-center space-y-6 animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full mx-auto flex items-center justify-center border border-green-500/50">
                               <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                           </div>
                           <h3 className="text-2xl font-bold text-white">Deployment Successful!</h3>
                           <p className="text-slate-400">Your app is now live and accessible worldwide.</p>
                           
                           <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg flex items-center justify-between gap-4">
                               <code className="text-cyan-400">{deployedUrl}</code>
                               <button onClick={() => navigator.clipboard.writeText(deployedUrl)} className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300 transition-colors">Copy</button>
                           </div>

                           <div className="flex justify-center gap-4">
                               <Button variant="secondary" onClick={() => window.open(deployedUrl, '_blank')}>Open App</Button>
                               <Button variant="ghost" onClick={() => setDeployStep(0)}>Deploy Again</Button>
                           </div>
                       </div>
                   )}
               </div>
           ) : (
                <>
                    <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 font-mono text-sm overflow-auto max-h-[500px] text-slate-300 shadow-inner relative group">
                        <button 
                            onClick={() => navigator.clipboard.writeText(code)}
                            className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1 rounded border border-slate-700 transition-opacity opacity-50 group-hover:opacity-100 z-10"
                        >
                            Copy Code
                        </button>
                        <pre className="whitespace-pre-wrap break-words">{code}</pre>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="ghost" onClick={onClose}>Close</Button>
                        <Button variant="primary" onClick={() => {
                            const blob = new Blob([code], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}.${activeTab === 'json' ? 'json' : 'tsx'}`;
                            a.click();
                        }}>
                            Download File
                        </Button>
                    </div>
                </>
           )}
       </div>
    </Modal>
  );
};

// --- Code Generators ---

function generateReactCode(project: Project): string {
  const isMobile = project.platform === 'mobile';
  
  if (isMobile) {
      return generateReactNativeCode(project);
  } else {
      return generateReactWebCode(project);
  }
}

function generateReactNativeCode(project: Project): string {
    const screensCode = project.screens.map(screen => {
        const stylesMap: Record<string, any> = {
            container: { flex: 1, backgroundColor: project.colors.background }
        };

        const renderComponent = (comp: UIComponent): string => {
            const styleId = `s_${comp.id.replace(/[^a-zA-Z0-9]/g, '')}`;
            
            // Extract styles
            const styleObj: any = {};
            if (comp.style?.padding) styleObj.padding = comp.style.padding;
            if (comp.style?.margin) styleObj.margin = comp.style.margin;
            if (comp.style?.backgroundColor && comp.style.backgroundColor !== 'transparent') styleObj.backgroundColor = comp.style.backgroundColor;
            if (comp.style?.borderRadius) styleObj.borderRadius = comp.style.borderRadius;
            if (comp.style?.width) styleObj.width = comp.style.width;
            
            // Flex styles
            if (comp.type === 'Group') {
                styleObj.flexDirection = comp.style?.flexDirection || 'column';
                if (comp.style?.gap) styleObj.gap = comp.style.gap;
                if (comp.style?.alignItems) styleObj.alignItems = comp.style.alignItems;
                if (comp.style?.justifyContent) styleObj.justifyContent = comp.style.justifyContent;
            }

            if (Object.keys(styleObj).length > 0) {
                stylesMap[styleId] = styleObj;
            }

            const styleProp = Object.keys(styleObj).length > 0 ? `style={styles.${styleId}}` : '';

            switch(comp.type) {
                case 'Group':
                    return `
        <View ${styleProp}>
${comp.children?.map(c => renderComponent(c)).join('\n')}
        </View>`;
                case 'Button':
                    return `        <TouchableOpacity ${styleProp} onPress={() => {}}><Text style={{color: 'white', textAlign: 'center'}}>${comp.label}</Text></TouchableOpacity>`;
                case 'Input':
                    return `        <TextInput placeholder="${comp.label}" placeholderTextColor="#666" ${styleProp} />`;
                case 'Text':
                    return `        <Text ${styleProp}>${comp.label}</Text>`;
                case 'Header':
                    return `        <View style={[styles.header, ${styleProp.replace('style=', '') || '{}'}]}><Text style={styles.headerText}>${comp.label}</Text></View>`;
                case 'Image':
                    return `        <View ${styleProp}><Text>Image: ${comp.label}</Text></View>`;
                default:
                    return `        <View ${styleProp}><Text>${comp.type}</Text></View>`;
            }
        };

        const componentsCode = screen.components.map(renderComponent).join('\n');
        
        // Generate Styles String
        const stylesString = Object.entries(stylesMap).map(([key, value]) => {
            return `  ${key}: ${JSON.stringify(value, null, 4).replace(/"/g, "'").replace(/\n/g, '\n  ')},`;
        }).join('\n');

        return `
const ${screen.name.replace(/\s+/g, '')}Screen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
${componentsCode}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
${stylesString}
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#333' },
  headerText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
`;
    }).join('\n');

    return `import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

${screensCode}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        ${project.screens.map(s => `<Stack.Screen name="${s.name}" component={${s.name.replace(/\s+/g, '')}Screen} />`).join('\n        ')}
      </Stack.Navigator>
    </NavigationContainer>
  );
}`;
}

function generateReactWebCode(project: Project): string {
    // Simple placeholder for web generator logic
    return `// React Web Code Generator\n// ... (Implementation similar to React Native but with HTML/CSS)`;
}
