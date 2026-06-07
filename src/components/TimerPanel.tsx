import { useState, useEffect, useRef } from 'react';
import { type Alarm } from '../hooks/useTimer';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface TimerPanelProps {
  total: number;
  left: number;
  isRunning: boolean;
  alarms: Alarm[];
  onStart: (taskName?: string) => void;
  onPause: () => void;
  onReset: () => void;
  onSetTime: (seconds: number) => void;
  onDeleteAlarm: (id: number) => void;
  fmt: (s: number) => string;
  onTaskChange?: (task: string) => void;
}

const PRESETS = [
  { label: '1 min', seconds: 60 },
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '30 min', seconds: 1800 },
];

export function TimerPanel({
  total,
  left,
  isRunning,
  alarms,
  onStart,
  onPause,
  onReset,
  onSetTime,
  onDeleteAlarm,
  fmt,
  onTaskChange,
}: TimerPanelProps) {
  const [taskInput, setTaskInput] = useState('');
  const [customMin, setCustomMin] = useState(5);
  const [customSec, setCustomSec] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const beep = (freq = 880, dur = 0.18, vol = 0.55) => {
    if (isMuted) return;
    try {
      const ac = getAudioContext();
      if (ac.state !== 'running') return;
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.connect(g);
      g.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ac.currentTime);
      g.gain.setValueAtTime(vol, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
      osc.start();
      osc.stop(ac.currentTime + dur);
    } catch {}
  };

  const playAlarm = () => {
    if (isMuted) return;
    [0, 360, 720].forEach((d, i) => setTimeout(() => beep(580 + i * 240, 0.55, 0.72), d));
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
  };

  useEffect(() => {
    if (left === 0 && !isRunning && total > 0) {
      playAlarm();
    }
    if (isRunning && left > 0 && left % 60 === 0) {
      beep(440, 0.12, 0.28);
    }
    if (isRunning && left <= 3 && left > 0) {
      beep(880, 0.1, 0.5);
    }
  }, [left, isRunning, total]);

  const handlePlayPause = () => {
    const ac = getAudioContext();
    ac.resume().catch(() => {});

    if (left === 0) {
      onReset();
      return;
    }

    if (isRunning) {
      onPause();
    } else {
      onStart(taskInput);
      onTaskChange?.(taskInput);
    }
  };

  const handleReset = () => {
    onReset();
    setTaskInput('');
  };

  const handleSetCustom = () => {
    const m = Math.max(0, Math.min(99, customMin || 0));
    const s = Math.max(0, Math.min(59, customSec || 0));
    const totalSec = m * 60 + s;
    if (totalSec > 0) {
      onSetTime(totalSec);
    }
  };

  const getLabel = () => {
    if (left === 0) return '¡tiempo!';
    if (isRunning) return left / total < 0.25 ? '¡casi!' : 'corriendo';
    return left === total ? 'temporizador' : 'pausado';
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4">
      <div
        className={`timer-display ${left === 0 ? 'finished' : isRunning ? 'running' : ''}`}
        style={{
          fontSize: 'clamp(60px, 18vw, 155px)',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          background: left === 0
            ? 'linear-gradient(135deg, #ff453a 0%, #ff2d55 100%)'
            : 'linear-gradient(135deg, #ff9f0a 0%, #ff375f 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: left === 0
            ? 'drop-shadow(0 0 10px rgba(255, 50, 50, 0.4))'
            : isRunning
              ? 'drop-shadow(0 0 30px rgba(255, 100, 0, 0.72))'
              : 'drop-shadow(0 0 20px rgba(255, 100, 0, 0.45))',
        }}
      >
        {fmt(left)}
      </div>

      <div className="mt-2 text-sm font-medium tracking-wider uppercase"
        style={{ color: 'rgba(255, 160, 60, 0.58)' }}>
        {getLabel()}
      </div>

      <div className="mt-4 w-full max-w-xs">
        <input
          type="text"
          maxLength={40}
          placeholder="¿Qué vas a hacer? (opcional)"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          className="task-input"
        />
      </div>

      <div className="flex flex-wrap gap-2 justify-center mt-4 max-w-md">
        {PRESETS.map(preset => (
          <button
            key={preset.seconds}
            onClick={() => onSetTime(preset.seconds)}
            className={`preset-btn ${total === preset.seconds && !isRunning ? 'selected' : ''}`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-4">
        <input
          type="number"
          min={0}
          max={99}
          value={customMin}
          onChange={(e) => setCustomMin(parseInt(e.target.value) || 0)}
          className="t-input"
        />
        <span className="t-colon">:</span>
        <input
          type="number"
          min={0}
          max={59}
          value={customSec}
          onChange={(e) => setCustomSec(parseInt(e.target.value) || 0)}
          className="t-input"
        />
        <button onClick={handleSetCustom} className="t-set-btn">
          Fijar
        </button>
      </div>

      <div className="flex items-center gap-3 mt-5">
        <button onClick={handleReset} className="t-btn secondary">
          <RotateCcw size={20} />
        </button>
        <button onClick={handlePlayPause} className="t-btn main">
          {isRunning ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button onClick={() => setIsMuted(!isMuted)} className="t-btn secondary">
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {alarms.length > 0 && (
        <div className="mt-4 w-full max-w-xs">
          <div className="text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: 'rgba(255, 160, 60, 0.5)' }}>
            Guardadas
          </div>
          <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
            {alarms.map(alarm => (
              <div key={alarm.id} className="alarm-item"
                onClick={() => {
                  setTaskInput(alarm.name === 'Sin nombre' ? '' : alarm.name);
                  onSetTime(alarm.seconds);
                }}>
                <div className="alarm-item-info">{alarm.name}</div>
                <div className="alarm-item-time">{fmt(alarm.seconds)}</div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteAlarm(alarm.id); }}
                  className="alarm-del"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
