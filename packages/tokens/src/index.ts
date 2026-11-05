/**
 * Design tokens: the single source of truth for both platforms.
 * Mobile imports this object directly. Web reads the same values from ./theme.css
 * (Tailwind v4 @theme). When you change a value here, change it in theme.css too.
 */
export const colors = {
  background: '#0b0b0f',
  surface: '#16161d',
  border: '#2a2a35',
  text: '#f4f4f6',
  muted: '#9a9aab',
  primary: '#7c5cff',
  primaryText: '#ffffff',
  danger: '#ff5c7a',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 20, full: 999 } as const;
export const fontSize = { sm: 14, md: 16, lg: 20, xl: 28, display: 56 } as const;

export const tokens = { colors, spacing, radius, fontSize } as const;
export type Tokens = typeof tokens;
