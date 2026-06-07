export type ScreenType = 'screenAnalog' | 'screenDigital' | 'screenTimer';

export interface Theme {
  className: string;
  background: string;
  label: string;
}

export const THEMES: Theme[] = [
  { className: '', background: '#000000', label: 'Negro' },
  { className: 't-graphite', background: '#1c1c1e', label: 'Grafito' },
  { className: 't-slate', background: '#1e2230', label: 'Pizarra' },
  { className: 't-dusk', background: '#221830', label: 'Crepúsc.' },
  { className: 't-ocre', background: '#26180a', label: 'Ocre' },
  { className: 't-amber', background: '#2a1a04', label: 'Ámbar' },
  { className: 't-rust', background: '#2a1208', label: 'Óxido' },
  { className: 't-clay', background: '#7a4e30', label: 'Arcilla' },
  { className: 't-sienna', background: '#4a2c18', label: 'Siena' },
  { className: 't-sage', background: '#263022', label: 'Salvia' },
  { className: 't-moss', background: '#1e2a1a', label: 'Musgo' },
  { className: 't-fog', background: '#e0dcd4', label: 'Niebla' },
  { className: 't-sand', background: '#ccc0a4', label: 'Arena' },
  { className: 't-stone', background: '#b8b0a0', label: 'Piedra' },
  { className: 't-chalk', background: '#eee8e0', label: 'Tiza' },
  { className: 't-light', background: '#f2f2f7', label: 'Claro' },
];
