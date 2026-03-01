export type ThemeId = 'default' | 'hacker';

export interface Theme {
  id: ThemeId;
  name: string;
  vars: Record<string, string>;
  branchColors: string[];
  rootColor: string;
  showDots: boolean;
}

export const THEMES: Record<ThemeId, Theme> = {
  default: {
    id: 'default',
    name: 'Default',
    vars: {
      '--t-bg':          '#0a0a0f',
      '--t-surface':     '#1a1a2a',
      '--t-border':      'rgba(255,255,255,0.1)',
      '--t-text':        '#e8e8f0',
      '--t-text-muted':  'rgba(255,255,255,0.4)',
      '--t-text-dim':    'rgba(255,255,255,0.25)',
      '--t-dot':         'rgba(255,255,255,0.55)',
      '--t-root-bg':     'radial-gradient(ellipse at center, #1a1a2e, #0f0f1a)',
      '--t-toolbar-bg':  'rgba(15,15,25,0.85)',
      '--t-panel-bg':    'rgba(15,15,25,0.9)',
      '--t-popup-bg':    '#0d0d14',
      '--t-separator':   'rgba(255,255,255,0.1)',
      '--t-hover':       'rgba(255,255,255,0.08)',
      '--t-accent':      'linear-gradient(135deg, rgba(124,92,252,0.25), rgba(0,180,216,0.25))',
      '--t-accent-hover':'linear-gradient(135deg, rgba(124,92,252,0.45), rgba(0,180,216,0.45))',
      '--t-accent-border':'rgba(124,92,252,0.4)',
      '--t-accent-text': '#c4b0ff',
    },
    branchColors: ['#7c5cfc', '#fc5c7d', '#43e97b', '#fa8231', '#00b4d8', '#f7d794'],
    rootColor: '#e8e8f0',
    showDots: true,
  },

  hacker: {
    id: 'hacker',
    name: 'Hacker',
    vars: {
      '--t-bg':          '#000000',
      '--t-surface':     '#001a00',
      '--t-border':      'rgba(0,255,65,0.2)',
      '--t-text':        '#e8e8f0',
      '--t-text-muted':  'rgba(232,232,240,0.5)',
      '--t-text-dim':    'rgba(232,232,240,0.25)',
      '--t-dot':         'rgba(0,255,65,0.3)',
      '--t-root-bg':     'radial-gradient(ellipse at center, #001a00, #000a00)',
      '--t-toolbar-bg':  'rgba(0,8,0,0.92)',
      '--t-panel-bg':    'rgba(0,8,0,0.96)',
      '--t-popup-bg':    'rgba(0,10,0,0.98)',
      '--t-separator':   'rgba(0,255,65,0.15)',
      '--t-hover':       'rgba(0,255,65,0.1)',
      '--t-accent':      'rgba(0,255,65,0.12)',
      '--t-accent-hover':'rgba(0,255,65,0.22)',
      '--t-accent-border':'rgba(0,255,65,0.4)',
      '--t-accent-text': '#e8e8f0',
    },
    branchColors: ['rgba(255,255,255,0.75)', 'rgba(255,255,255,0.65)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0.75)'],
    rootColor: 'rgba(255,255,255,0.85)',
    showDots: true,
  },
};
