/**
 * Design tokens: the ONLY place to change colors and radius.
 * Values are HSL triples ("H S% L%") using shadcn's variable names, so they plug straight into
 * shadcn/ui (web) and React Native Reusables (mobile).
 * After editing, run `bun run tokens` from the repo root to regenerate the CSS for both apps.
 */
export const palette = {
  light: {
    background: '0 0% 100%',
    foreground: '240 10% 6%',
    card: '0 0% 100%',
    'card-foreground': '240 10% 6%',
    popover: '0 0% 100%',
    'popover-foreground': '240 10% 6%',
    primary: '252 100% 62%',
    'primary-foreground': '0 0% 100%',
    secondary: '240 5% 96%',
    'secondary-foreground': '240 10% 10%',
    muted: '240 5% 96%',
    'muted-foreground': '240 4% 46%',
    accent: '252 100% 96%',
    'accent-foreground': '252 60% 30%',
    destructive: '348 83% 55%',
    'destructive-foreground': '0 0% 100%',
    border: '240 6% 90%',
    input: '240 6% 90%',
    ring: '252 100% 62%',
    'chart-1': '252 100% 62%',
    'chart-2': '173 58% 39%',
    'chart-3': '197 37% 24%',
    'chart-4': '43 74% 66%',
    'chart-5': '348 83% 55%',
  },
  dark: {
    background: '240 14% 5%',
    foreground: '240 10% 96%',
    card: '240 13% 10%',
    'card-foreground': '240 10% 96%',
    popover: '240 13% 10%',
    'popover-foreground': '240 10% 96%',
    primary: '252 100% 68%',
    'primary-foreground': '0 0% 100%',
    secondary: '240 10% 15%',
    'secondary-foreground': '240 10% 96%',
    muted: '240 10% 15%',
    'muted-foreground': '240 8% 64%',
    accent: '252 40% 20%',
    'accent-foreground': '252 100% 90%',
    destructive: '348 100% 68%',
    'destructive-foreground': '0 0% 100%',
    border: '240 11% 19%',
    input: '240 11% 19%',
    ring: '252 100% 68%',
    'chart-1': '252 100% 68%',
    'chart-2': '160 60% 45%',
    'chart-3': '30 80% 55%',
    'chart-4': '280 65% 60%',
    'chart-5': '348 100% 68%',
  },
} as const;

/** Base radius in rem. Components use lg = radius, md = radius - 2px, sm = radius - 4px. */
export const radius = '0.75rem';

export type ColorMode = keyof typeof palette;
export type ColorToken = keyof (typeof palette)['light'];

/** Resolved color string for places that can't use classes (navigation theme, status bar, charts). */
export const color = (mode: ColorMode, token: ColorToken) => `hsl(${palette[mode][token]})`;
