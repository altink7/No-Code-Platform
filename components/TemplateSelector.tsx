import React, { useState } from 'react';
import { Card, Button, Input } from './UI';
import { generateAppStructure } from '../services/geminiService';
import { Project, Screen } from '../types';

interface TemplateSelectorProps {
  onSelect: (template: string, screens: Screen[]) => void;
  platform: 'web' | 'mobile';
}

const TEMPLATES = [
  { id: 'blank', name: 'Blank Canvas', desc: 'Start from scratch with an empty flow.', icon: '⬜' },
  { id: 'ecommerce', name: 'E-Commerce', desc: 'Product list, cart, and checkout flow.', icon: '🛍️' },
  { id: 'social', name: 'Social Feed', desc: 'Profile, feed, and post creation flow.', icon: '📱' },
  { id: 'marketing', name: 'Landing Page', desc: 'Hero section, features, and contact form.', icon: '🚀' },
];

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect, platform }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      const generatedScreens = await generateAppStructure(aiPrompt, platform);
      onSelect('ai-custom', generatedScreens);
    } catch (e) {
      console.error(e);
      // Fallback
      onSelect('blank', []);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateClick = (id: string) => {
    // Mock template screens for now
    let screens: Screen[] = [];
    if (id !== 'blank') {
       screens = [
         { id: '1', name: 'Home', x: 100, y: 100, connections: ['2'], components: [] },
         { id: '2', name: 'Details', x: 400, y: 100, connections: [], components: [] }
       ];
    }
    onSelect(id, screens);
  };

  return (
    <div className="max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <h2 className="text-3xl font-bold text-white mb-8">Choose a Starting Point</h2>
      
      {/* AI Magic Section */}
      <div className="mb-12">
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <Card className="relative bg-slate-900 border-0">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 mb-2">
                            ✨ AI Magic Builder
                        </h3>
                        <p className="text-slate-400 mb-4">Describe your app idea in plain text, and our Nebula AI will construct the entire screen flow and component structure for you instantly.</p>
                        <Input 
                            placeholder="e.g. A fitness tracking app with workout logging, progress charts, and a social feed..." 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            className="bg-slate-950/80 border-slate-800"
                        />
                    </div>
                    <div>
                        <Button 
                            variant="neon" 
                            size="lg" 
                            onClick={handleAiGenerate}
                            disabled={isGenerating || !aiPrompt}
                            className="whitespace-nowrap min-w-[160px]"
                        >
                            {isGenerating ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                    </svg>
                                    Generating...
                                </span>
                            ) : 'Generate App'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
      </div>

      <div className="border-t border-slate-800 my-8"></div>
      <h3 className="text-xl font-semibold text-slate-300 mb-6">Or start with a template</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TEMPLATES.map((t) => (
            <button key={t.id} onClick={() => handleTemplateClick(t.id)} className="text-left group">
                <Card className="h-full hover:bg-slate-800/80 transition-all border-slate-800 hover:border-slate-600">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{t.icon}</div>
                    <h4 className="text-lg font-bold text-white mb-1">{t.name}</h4>
                    <p className="text-sm text-slate-500">{t.desc}</p>
                </Card>
            </button>
        ))}
      </div>
    </div>
  );
};
