import { Smartphone, Monitor } from 'lucide-react';

interface LandscapeButtonProps {
  isLandscapeMode: boolean;
  wakeLockActive: boolean;
  onToggle: () => void;
}

export function LandscapeButton({ isLandscapeMode, wakeLockActive, onToggle }: LandscapeButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="fixed top-4 left-4 z-[150] flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300"
      style={{
        background: isLandscapeMode
          ? 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)'
          : 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(10px)',
        border: isLandscapeMode
          ? '1px solid rgba(0, 198, 251, 0.5)'
          : '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: isLandscapeMode
          ? '0 0 20px rgba(0, 140, 255, 0.4)'
          : '0 2px 10px rgba(0, 0, 0, 0.2)',
      }}
    >
      {isLandscapeMode ? (
        <>
          <Monitor size={18} className="text-white" />
          <span className="text-sm font-semibold text-white">Modo Horizontal</span>
          {wakeLockActive && (
            <div
              className="w-2 h-2 rounded-full bg-green-400"
              style={{ boxShadow: '0 0 8px rgba(34, 221, 85, 0.8)' }}
            />
          )}
        </>
      ) : (
        <>
          <Smartphone size={18} className="text-white/70" />
          <span className="text-sm font-medium text-white/70">Horizontal</span>
        </>
      )}
    </button>
  );
}
