import React, { useState, useEffect } from 'react';
import { useEditMode } from '../context/EditModeContext';
import { Info, X, CloudCheck, RefreshCw } from 'lucide-react';
import { syncLocalImagesToServer } from '../utils/imageStorage';

export const EditImagesToggle: React.FC = () => {
  const { isEditMode, toggleEditMode } = useEditMode();
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode) {
      setShowHint(true);
      const timer = setTimeout(() => setShowHint(false), 8000);
      return () => clearTimeout(timer);
    } else {
      setShowHint(false);
    }
  }, [isEditMode]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Saving images to server...');
    try {
      const res = await syncLocalImagesToServer();
      if (res.count > 0) {
        setSyncStatus(`Saved ${res.count} images to build!`);
      } else {
        setSyncStatus('All images up to date on server');
      }
    } catch {
      setSyncStatus('Sync check complete');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2">
      {/* Informative Hint when Edit Mode is active */}
      {isEditMode && showHint && (
        <div className="bg-[#142B1A] text-[#FAF7F2] border border-[#C59B27] rounded-xl px-3.5 py-2.5 shadow-2xl max-w-xs text-xs font-sans-brand flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Info size={16} className="text-[#E5C778] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-[#E5C778] block">Permanent Image Editor</span>
            <span className="text-[#DFD4C2] leading-tight block text-[11px] mt-0.5">
              Click <strong>CHANGE IMAGE</strong> on any picture to upload. Images save directly to the permanent project build.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowHint(false)}
            className="text-[#DFD4C2] hover:text-white p-0.5 cursor-pointer ml-1"
            aria-label="Dismiss hint"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Sync Status Badge (if visible) */}
      {syncStatus && (
        <div className="bg-emerald-900/90 text-emerald-200 border border-emerald-500/50 rounded-lg px-3 py-1.5 shadow-lg text-[11px] font-sans-brand flex items-center gap-1.5">
          <CloudCheck size={14} className="text-emerald-300 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Manual Sync Button when in edit mode */}
        {isEditMode && (
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3 py-2 rounded-full font-bold text-[10px] tracking-wider uppercase font-sans-brand bg-[#234A30] text-[#E5C778] border border-[#C59B27] shadow-lg cursor-pointer hover:bg-[#2F5E3D] active:scale-95 flex items-center gap-1.5 transition-all select-none disabled:opacity-60"
            title="Force sync all local images to permanent server assets"
          >
            <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'SYNCING...' : 'SYNC TO BUILD'}</span>
          </button>
        )}

        {/* Main Toggle Button */}
        <button
          type="button"
          onClick={toggleEditMode}
          className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full font-bold text-[11px] sm:text-xs tracking-wider uppercase font-sans-brand shadow-xl cursor-pointer transition-all duration-300 flex items-center gap-2 select-none active:scale-95 ${
            isEditMode
              ? 'bg-[#142B1A] text-[#E5C778] ring-2 ring-[#C59B27] shadow-[0_4px_25px_rgba(197,155,39,0.45)]'
              : 'bg-[#142B1A]/95 text-[#FAF7F2] hover:bg-[#142B1A] border border-[#C59B27]/40 hover:border-[#C59B27]'
          }`}
          aria-label="Toggle Edit Images Mode"
          title={isEditMode ? 'Exit Edit Images Mode' : 'Enter Edit Images Mode'}
        >
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              isEditMode ? 'bg-emerald-400 animate-pulse' : 'bg-[#A89F91]'
            }`}
          />
          <span>{isEditMode ? 'EDIT IMAGES: ON' : 'EDIT IMAGES'}</span>
        </button>
      </div>
    </div>
  );
};

export default EditImagesToggle;
