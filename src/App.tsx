import React, { useState, useEffect } from 'react';
import { SceneObject, AppState, TransformMode } from './types';
import Scene from './components/Scene';
import Controls from './components/Controls';
import { generatePrompt } from './lib/promptUtils';
import { Copy, Sparkles, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_OBJECTS: SceneObject[] = [
  {
    id: '1',
    type: 'telephone',
    position: [0, 0, 0],
    rotation: [0, 0, 0.5],
    scale: 1.5,
    color: 'cyan',
    isMain: true,
  },
  {
    id: '2',
    type: 'cursor',
    position: [-0.8, -0.8, 0.2],
    rotation: [0, 0, -0.8],
    scale: 0.6,
    color: 'purple-frosted',
    isMain: false,
  }
];

import { GoogleGenAI } from "@google/genai";


const aiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
// Временно замените эту строку в App.tsx для теста:
const proxyBaseUrl = "https://api.proxyapi.ru/google/v1";

// ДИАГНОСТИКА: Откройте консоль браузера (F12) на Vercel, чтобы увидеть это
console.log("--- AI CONFIG DEBUG ---");
console.log("API Key present:", !!aiKey);
console.log("Proxy URL:", proxyBaseUrl || "NOT SET (Using default Google URL)");
console.log("-----------------------");

// Инициализация с явной проверкой
const ai = new GoogleGenAI({ 
  apiKey: aiKey,
  ...(proxyBaseUrl ? { baseUrl: proxyBaseUrl.replace(/\/$/, '') } : {})
});

export default function App() {
  const [objects, setObjects] = useState<SceneObject[]>(INITIAL_OBJECTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState('white');
  const [transformMode, setTransformMode] = useState<TransformMode>('translate');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPrompt(generatePrompt(objects, bgColor));
  }, [objects, bgColor]);

  const handleUpdateObject = (id: string, updates: Partial<SceneObject>) => {
    setObjects(prev => prev.map(obj => obj.id === id ? { ...obj, ...updates } : obj));
  };

  const handleAddObject = () => {
    if (objects.length >= 3) return;
    const newObj: SceneObject = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'sphere',
      position: [1, 1, 0],
      rotation: [0, 0, 0],
      scale: 0.5,
      color: 'silver',
      isMain: false,
    };
    setObjects([...objects, newObj]);
    setSelectedId(newObj.id);
  };

  const handleDeleteObject = (id: string) => {
    const obj = objects.find(o => o.id === id);
    if (obj?.isMain) return; // Don't delete main object
    setObjects(prev => prev.filter(o => o.id !== id));
    setSelectedId(null);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    if (!aiKey) {
      alert("Please set VITE_GEMINI_API_KEY in your environment variables.");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setError(null);
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `Generate a high-quality 3D render based on this prompt: ${prompt}. 
              The style should be minimalistic, playful UI fintech aesthetic with vivid contrast. 
              The background should be a solid color as specified in the prompt.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });

      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64Data = part.inlineData.data;
            setGeneratedImage(`data:image/png;base64,${base64Data}`);
            break;
          }
        }
      } else {
        throw new Error("No image data received from API");
      }
    } catch (err: any) {
      console.error("Generation failed:", err);
      
      let errorMessage = "Generation failed. Please try again.";
      if (err.message?.includes("429") || err.status === 429 || err.message?.includes("RESOURCE_EXHAUSTED")) {
        errorMessage = "Quota exceeded (429). Please wait a moment or check your API limits.";
      }
      
      setError(errorMessage);
      
      // Fallback to a seeded placeholder
      const seed = Math.floor(Math.random() * 1000);
      setGeneratedImage(`https://picsum.photos/seed/${seed}/800/800`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-brand-beige">
      {/* Header */}
      <header className="h-16 bg-brand-white border-b border-border-subtle flex items-center justify-between px-8 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <img 
            src="https://static.tildacdn.com/tild3361-6134-4363-a566-383132656232/Calltouch-logo-a.svg" 
            alt="Calltouch" 
            className="h-6"
            referrerPolicy="no-referrer"
          />
          <div className="h-4 w-[1px] bg-black/10" />
          <span className="font-light opacity-50 text-sm tracking-widest uppercase">PROMPT STUDIO</span>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="flex-1 grid grid-cols-[300px_1fr_320px] overflow-hidden">
        {/* Left Panel: Scene Composition */}
        <aside className="bg-brand-white border-r border-border-subtle overflow-y-auto">
          <Controls 
            objects={objects}
            selectedId={selectedId}
            onUpdateObject={handleUpdateObject}
            onAddObject={handleAddObject}
            onDeleteObject={handleDeleteObject}
            bgColor={bgColor}
            onUpdateBgColor={setBgColor}
            transformMode={transformMode}
            onUpdateTransformMode={setTransformMode}
            onSelectObject={setSelectedId}
          />
        </aside>

        {/* Center: Workspace */}
        <section className="relative bg-brand-white flex items-center justify-center overflow-hidden">
          <div className="w-full h-full relative z-10">
            <Scene 
              objects={objects}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onUpdateObject={handleUpdateObject}
              bgColor={bgColor}
              transformMode={transformMode}
            />
          </div>

          {/* Result Overlay */}
          <AnimatePresence>
            {generatedImage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 z-30 flex items-center justify-center p-12 bg-black/40 backdrop-blur-sm"
              >
                <div className="relative aspect-square h-full max-h-[600px] bg-white rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                  <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button 
                    onClick={() => setGeneratedImage(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all"
                  >
                    ✕
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono">
                    Generated via Nanobanana API (Mock)
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Overlay */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-brand-white/80 backdrop-blur-md"
              >
                <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest text-brand-blue-dark">Generating with Nanobanana...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Right Panel: Prompt Preview */}
        <aside className="bg-[#F9F9F7] border-l border-border-subtle flex flex-col p-6 gap-4 overflow-hidden">
          <h3 className="text-[11px] uppercase tracking-widest font-bold text-black/40">Real-time Prompt</h3>
          
          <div className="flex-1 bg-[#1A1A1A] text-[#A0A0A0] p-4 font-mono text-[10px] leading-relaxed rounded-lg overflow-y-auto custom-scrollbar">
            {prompt.split('\n').map((line, i) => {
              const parts = line.split(':');
              if (parts.length > 1) {
                return (
                  <p key={i} className="mb-2">
                    <span className="text-brand-blue font-bold">{parts[0]}:</span>
                    {parts.slice(1).join(':')}
                  </p>
                );
              }
              return <p key={i} className="mb-2">{line}</p>;
            })}
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[10px] text-red-600 font-medium">
                {error}
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-brand-purple text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-brand-purple/20 disabled:opacity-50"
            >
              <Sparkles size={16} />
              Generate Image
            </button>
            <button
              onClick={copyToClipboard}
              className="w-full bg-brand-blue-dark text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {copied ? 'Copied!' : (
                <>
                  <Copy size={16} />
                  Copy Prompt
                </>
              )}
            </button>
          </div>
        </aside>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
