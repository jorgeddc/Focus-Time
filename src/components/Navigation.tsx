import type { ScreenType } from '../types';

interface NavigationProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  isLandscape: boolean;
}

const SCREENS: ScreenType[] = ['screenAnalog', 'screenDigital', 'screenTimer'];

const TAB_ICONS: Record<ScreenType, string> = {
  screenAnalog: '⌚',
  screenDigital: '🔢',
  screenTimer: '⏱',
};

export function Navigation({ currentScreen, onNavigate, isLandscape }: NavigationProps) {
  return (
    <nav
      className="tabs"
      style={{
        ...(isLandscape
          ? {
              bottom: 'auto',
              top: '50%',
              left: 'auto',
              right: 'max(12px, env(safe-area-inset-right, 12px))',
              transform: 'translateY(-50%)',
              flexDirection: 'column',
              gap: '2px',
              borderRadius: '24px',
              padding: '6px 4px',
            }
          : {}),
      }}
    >
      {SCREENS.map(screen => (
        <button
          key={screen}
          className={`tab ${currentScreen === screen ? 'active' : ''}`}
          onClick={() => onNavigate(screen)}
          style={isLandscape ? { padding: '10px 12px', fontSize: '18px' } : {}}
        >
          {TAB_ICONS[screen]}
        </button>
      ))}
    </nav>
  );
}
