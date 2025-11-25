import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { Modal, Button } from './UI';

interface ExportModalProps {
  project: Project;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ project, onClose }) => {
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState<'json' | 'react'>('react');

  useEffect(() => {
    if (activeTab === 'json') {
        setCode(JSON.stringify(project, null, 2));
    } else {
        setCode(generateReactCode(project));
    }
  }, [project, activeTab]);

  return (
    <Modal isOpen={true} onClose={onClose} title="Export Project">
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
           </div>

           <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 font-mono text-sm overflow-auto max-h-[500px] text-slate-300 shadow-inner relative group">
               <button 
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1 rounded border border-slate-700 transition-opacity opacity-50 group-hover:opacity-100"
               >
                   Copy
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
       </div>
    </Modal>
  );
};

// Simple code generator helper
function generateReactCode(project: Project): string {
  const isMobile = project.platform === 'mobile';
  
  const imports = isMobile 
    ? `import React from 'react';\nimport { View, Text, Button, Image, ScrollView, TextInput, StyleSheet } from 'react-native';\nimport { NavigationContainer } from '@react-navigation/native';\nimport { createNativeStackNavigator } from '@react-navigation/native-stack';`
    : `import React from 'react';\nimport { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';`;

  const componentMap = project.screens.map(screen => {
      const components = screen.components.map(comp => {
          if (isMobile) {
              switch(comp.type) {
                  case 'Button': return `        <Button title="${comp.label}" onPress={() => {}} />`;
                  case 'Input': return `        <TextInput placeholder="${comp.label}" style={styles.input} />`;
                  case 'Text': return `        <Text style={styles.text}>${comp.label}</Text>`;
                  case 'Header': return `        <View style={styles.header}><Text style={styles.headerText}>${screen.name}</Text></View>`;
                  default: return `        <View style={styles.placeholder}><Text>${comp.type}</Text></View>`;
              }
          } else {
             switch(comp.type) {
                  case 'Button': return `        <button className="btn btn-primary">${comp.label}</button>`;
                  case 'Input': return `        <input placeholder="${comp.label}" className="input" />`;
                  case 'Text': return `        <p>${comp.label}</p>`;
                  case 'Header': return `        <header className="header"><h1>${screen.name}</h1></header>`;
                  default: return `        <div className="placeholder">${comp.type}</div>`;
              }
          }
      }).join('\n');

      return `
const ${screen.name.replace(/\s+/g, '')}Screen = ({ navigation }) => {
  return (
    <${isMobile ? 'View style={styles.container}' : 'div className="page"'}>
${components}
    </${isMobile ? 'View' : 'div'}>
  );
};`;
  }).join('\n');

  const navigation = isMobile
    ? `
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        ${project.screens.map(s => `<Stack.Screen name="${s.name}" component={${s.name.replace(/\s+/g, '')}Screen} />`).join('\n        ')}
      </Stack.Navigator>
    </NavigationContainer>
  );
}`
    : `
export default function App() {
  return (
    <Router>
      <Routes>
        ${project.screens.map(s => `<Route path="/${s.name.toLowerCase()}" element={<${s.name.replace(/\s+/g, '')}Screen />} />`).join('\n        ')}
      </Routes>
    </Router>
  );
}`;

  const styles = isMobile 
    ? `
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '${project.colors.background}', padding: 20 },
  header: { padding: 20, backgroundColor: '${project.colors.primary}' },
  headerText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  input: { backgroundColor: 'white', padding: 10, borderRadius: 5, marginBottom: 10 },
  text: { color: '${project.colors.text}', marginBottom: 10 },
  placeholder: { padding: 20, backgroundColor: '#eee', marginBottom: 10 }
});`
    : '';

  return `${imports}\n\n${componentMap}\n${navigation}\n${styles}`;
}