import { useEffect, useState } from 'react';

interface DigitalClockProps {
  focusText?: string;
  isLandscapeMode: boolean;
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function DigitalClock({ focusText, isLandscapeMode }: DigitalClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 500);
    return () => clearInterval(interval);
  }, []);

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');
  const day = time.getDate();
  const month = MONTHS[time.getMonth()];
  const year = time.getFullYear();

  return (
    <div className={`flex flex-col items-center justify-center w-full h-full ${isLandscapeMode ? 'flex-row gap-6' : ''}`}>
      <div className={`flex ${isLandscapeMode ? 'flex-row items-baseline gap-4' : 'flex-col items-center'}`}>
        <div
          className="font-extrabold tracking-tight text-center"
          style={{
            fontSize: isLandscapeMode ? 'min(50vw, 56vh)' : 'min(15vh, 130px)',
            lineHeight: isLandscapeMode ? 1 : 0.9,
            letterSpacing: isLandscapeMode ? '-0.02em' : '-0.045em',
            background: 'linear-gradient(150deg, #00c6fb 0%, #005bea 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 26px rgba(0, 140, 255, 0.52))',
          }}
        >
          {hours}:{minutes}
        </div>

        <div
          className="font-bold text-center"
          style={{
            fontSize: isLandscapeMode ? 'min(23vw, 27vh)' : 'min(8vh, 64px)',
            letterSpacing: '0.03em',
            background: 'linear-gradient(135deg, #74d7ff 0%, #3a8ef0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 12px rgba(0, 140, 255, 0.3))',
            marginTop: isLandscapeMode ? 0 : '0.25rem',
          }}
        >
          {seconds}
        </div>
      </div>

      {!isLandscapeMode && (
        <div className="flex flex-col items-center mt-3">
          <div
            className="font-semibold text-center"
            style={{
              fontSize: 'clamp(15px, 4.8vw, 30px)',
              color: 'rgba(74, 160, 255, 0.62)',
            }}
          >
            {day} {month} {year}
          </div>

          {focusText && focusText.trim() && (
            <div
              className="mt-3 px-5 py-2 rounded-full font-semibold text-center max-w-[90vw] truncate"
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 200, 60, 0.5)',
                color: 'rgba(255, 210, 80, 0.95)',
                fontSize: '16px',
                boxShadow: '0 0 20px rgba(0,0,0,0.3)',
              }}
            >
              Focus en: {focusText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
