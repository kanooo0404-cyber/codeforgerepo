import React from 'react';
import { Database, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { resetDemoState } from '../data/localStore.js';
import { useToast } from '../context/ToastContext.jsx';

export function DemoModeBanner() {
  const { isDemoMode } = useAuth();
  const { showToast } = useToast();

  if (!isDemoMode) return null;

  const handleReset = () => {
    resetDemoState();
    showToast('Local Demo Mode data reset to fresh campus seed.', 'info');
    window.location.reload();
  };

  return (
    <div className="bg-[#11183B] text-white/90 text-xs px-4 py-1.5 border-b border-white/10">
      <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 font-semibold">
            <Database className="w-3 h-3" />
            Local Demo Mode
          </span>
          <span className="text-white/75">
            Firebase credentials are not configured — data is saved locally in your browser (not connected to live Firebase).
          </span>
        </div>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-white/80 hover:text-white font-medium underline underline-offset-2"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Demo Data
        </button>
      </div>
    </div>
  );
}
