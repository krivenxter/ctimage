import React from 'react';
import { SceneObject, ObjectType, TransformMode } from '../types';
import { Trash2, Plus, RotateCcw, Move, Maximize, Rotate3d, Palette } from 'lucide-react';

interface ControlsProps {
  objects: SceneObject[];
  selectedId: string | null;
  onUpdateObject: (id: string, updates: Partial<SceneObject>) => void;
  onAddObject: () => void;
  onDeleteObject: (id: string) => void;
  bgColor: string;
  onUpdateBgColor: (color: string) => void;
  transformMode: TransformMode;
  onUpdateTransformMode: (mode: TransformMode) => void;
  onSelectObject: (id: string) => void;
}

const COLORS: SceneObject['color'][] = ['cyan', 'purple', 'silver', 'white', 'purple-frosted', 'cyan-frosted', 'graphite'];
const BG_COLORS = ['white', 'beige', 'light-blue', 'light-purple', 'dark-graphite'];

export default function Controls({ 
  objects, selectedId, onUpdateObject, onAddObject, onDeleteObject, 
  bgColor, onUpdateBgColor, transformMode, onUpdateTransformMode, onSelectObject 
}: ControlsProps) {
  const selected = objects.find(o => o.id === selectedId);

  const getColorHex = (color: string) => {
    const map: Record<string, string> = {
      cyan: '#19BCE5',
      purple: '#DB6EEE',
      silver: '#C0C0C0',
      white: '#FFFFFF',
      'purple-frosted': '#E0B0FF',
      'cyan-frosted': '#B2EBF2',
      graphite: '#1F282C',
      beige: '#F1EEE4',
      'light-blue': '#E0F7FA',
      'light-purple': '#F3E5F5',
      'dark-graphite': '#141B1E',
    };
    return map[color] || color; // Allow custom colors if passed
  };

  return (
    <div className="flex flex-col gap-4 p-4 h-full text-[11px]">
      <div className="flex items-center justify-between">
        <h3 className="uppercase tracking-widest font-bold text-black/40">Scene</h3>
        <button
          onClick={onAddObject}
          disabled={objects.length >= 3}
          className="flex items-center gap-1 px-2 py-1 bg-brand-blue-dark text-white rounded-md font-bold uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-30"
        >
          <Plus size={12} />
          Add
        </button>
      </div>

      {/* Layers / Objects List */}
      <div className="bg-[#F5F5F3] p-2 rounded-lg space-y-1">
        {objects.map(obj => (
          <button 
            key={obj.id} 
            onClick={() => onSelectObject(obj.id)}
            className={`w-full flex justify-between items-center p-2 rounded-md transition-all ${selectedId === obj.id ? 'bg-white shadow-sm ring-1 ring-brand-blue/20' : 'hover:bg-black/5'}`}
          >
            <span className="font-medium text-text-main truncate max-w-[140px]">
              {obj.isMain ? '★ ' : ''}{obj.type}
            </span>
            <div className="flex items-center gap-1.5">
              <div 
                className="w-2.5 h-2.5 rounded-full border border-black/10" 
                style={{ backgroundColor: getColorHex(obj.color) }}
              />
            </div>
          </button>
        ))}
      </div>

      {/* Background Color Picker */}
      <div className="space-y-2">
        <label className="uppercase tracking-widest font-bold text-black/40 flex items-center gap-1.5">
          <Palette size={12} /> Background
        </label>
        <div className="flex flex-wrap gap-1">
          {BG_COLORS.map(c => (
            <button
              key={c}
              onClick={() => onUpdateBgColor(c)}
              className={`w-5 h-5 rounded-md border transition-all ${bgColor === c ? 'ring-2 ring-brand-blue ring-offset-1' : 'border-black/5'}`}
              style={{ backgroundColor: getColorHex(c) }}
              title={c}
            />
          ))}
          <input 
            type="text"
            value={bgColor}
            onChange={(e) => onUpdateBgColor(e.target.value)}
            placeholder="#hex"
            className="w-16 h-5 px-1 bg-white border border-black/5 rounded-md text-[9px] focus:outline-none focus:ring-1 focus:ring-brand-blue/30"
          />
        </div>
      </div>

      {!selected ? (
        <div className="flex-1 flex flex-col items-center justify-center text-black/20 text-center opacity-50">
          <Move size={24} className="mb-1" />
          <p className="uppercase tracking-widest font-bold">Select object</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-1 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="uppercase tracking-widest font-bold text-black/40">Settings</h3>
            <button
              onClick={() => onDeleteObject(selected.id)}
              className="p-1 text-black/20 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Transform Mode Switcher */}
          <div className="flex bg-[#F5F5F3] p-1 rounded-lg">
            {(['translate', 'rotate', 'scale'] as TransformMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => onUpdateTransformMode(mode)}
                className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${transformMode === mode ? 'bg-white shadow-sm text-brand-blue' : 'text-black/30 hover:text-black/60'}`}
              >
                {mode === 'translate' && <Move size={14} />}
                {mode === 'rotate' && <Rotate3d size={14} />}
                {mode === 'scale' && <Maximize size={14} />}
              </button>
            ))}
          </div>

          <div className="bg-[#F5F5F3] p-3 rounded-lg space-y-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-black/40 mb-2">Type</label>
              <input
                type="text"
                value={selected.type}
                onChange={(e) => onUpdateObject(selected.id, { type: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-black/5 rounded-md font-medium focus:outline-none focus:ring-1 focus:ring-brand-blue/30 transition-all"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-black/40 mb-2">Color</label>
              <div className="flex flex-wrap gap-1">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => onUpdateObject(selected.id, { color: c })}
                    className={`flex items-center gap-1.5 px-1.5 py-1 rounded-md border transition-all ${
                      selected.color === c 
                        ? 'bg-brand-blue-dark text-white border-brand-blue-dark' 
                        : 'bg-white text-text-main border-black/5 hover:border-black/10'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColorHex(c) }} />
                    <span className="text-[9px] font-bold uppercase tracking-tighter">{c}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-1 border-t border-black/5">
              <div className="grid grid-cols-2 gap-3">
                <Slider label="Pos X" value={selected.position[0]} min={-4} max={4} onChange={(v) => onUpdateObject(selected.id, { position: [v, selected.position[1], selected.position[2]] })} />
                <Slider label="Pos Y" value={selected.position[1]} min={-4} max={4} onChange={(v) => onUpdateObject(selected.id, { position: [selected.position[0], v, selected.position[2]] })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Slider label="Rot X" value={selected.rotation[0]} min={-Math.PI} max={Math.PI} onChange={(v) => onUpdateObject(selected.id, { rotation: [v, selected.rotation[1], selected.rotation[2]] })} />
                <Slider label="Rot Y" value={selected.rotation[1]} min={-Math.PI} max={Math.PI} onChange={(v) => onUpdateObject(selected.id, { rotation: [selected.rotation[0], v, selected.rotation[2]] })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Slider label="Rot Z" value={selected.rotation[2]} min={-Math.PI} max={Math.PI} onChange={(v) => onUpdateObject(selected.id, { rotation: [selected.rotation[0], selected.rotation[1], v] })} />
                <Slider label="Scale" value={selected.scale} min={0.2} max={3} onChange={(v) => onUpdateObject(selected.id, { scale: v })} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Slider({ label, value, min, max, onChange }: { label: string, value: number, min: number, max: number, onChange: (v: number) => void }) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="font-bold uppercase tracking-tighter text-black/40">{label}</label>
        <span className="text-[9px] font-mono text-black/30">{value.toFixed(1)}</span>
      </div>
      <div className="relative h-1 bg-black/5 rounded-full">
        <div className="absolute h-full bg-brand-blue rounded-full" style={{ width: `${percentage}%` }} />
        <input
          type="range"
          min={min} max={max} step={0.01}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
      </div>
    </div>
  );
}
