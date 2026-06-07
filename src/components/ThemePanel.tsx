import { THEMES, type Theme } from '../types';

interface ThemePanelProps {
  isOpen: boolean;
  currentTheme: string;
  onSelectTheme: (className: string) => void;
  onClose: () => void;
}

export function ThemePanel({ isOpen, currentTheme, onSelectTheme, onClose }: ThemePanelProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4"
      style={{
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
      onClick={onClose}
    >
      <h2
        className="text-sm font-semibold tracking-widest uppercase"
        style={{ color: 'rgba(255, 255, 255, 0.65)' }}
      >
        Color de fondo
      </h2>

      <div className="grid grid-cols-4 gap-3">
        {THEMES.map((theme: Theme) => (
          <div
            key={theme.className}
            className={`swatch ${currentTheme === theme.className ? 'active' : ''}`}
            style={{ background: theme.background }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectTheme(theme.className);
              setTimeout(onClose, 260);
            }}
          >
            <span>{theme.label}</span>
          </div>
        ))}
      </div>

      <button onClick={onClose} className="close-panel">
        Cerrar
      </button>
    </div>
  );
}
