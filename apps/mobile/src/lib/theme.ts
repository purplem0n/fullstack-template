import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import { type ColorMode, color, radius } from '@repo/tokens';

// Resolved token values for JS-side styling (icons, navigation, native props).
// Source of truth is packages/tokens/src/index.ts; never hardcode values here.
const resolve = (mode: ColorMode) => ({
  background: color(mode, 'background'),
  foreground: color(mode, 'foreground'),
  card: color(mode, 'card'),
  popover: color(mode, 'popover'),
  primary: color(mode, 'primary'),
  secondary: color(mode, 'secondary'),
  muted: color(mode, 'muted'),
  accent: color(mode, 'accent'),
  destructive: color(mode, 'destructive'),
  border: color(mode, 'border'),
  input: color(mode, 'input'),
  ring: color(mode, 'ring'),
  radius,
});

export const THEME = { light: resolve('light'), dark: resolve('dark') };

const nav = (mode: ColorMode, base: Theme): Theme => ({
  ...base,
  colors: {
    background: THEME[mode].background,
    border: THEME[mode].border,
    card: THEME[mode].card,
    notification: THEME[mode].destructive,
    primary: THEME[mode].primary,
    text: THEME[mode].foreground,
  },
});

export const NAV_THEME: Record<ColorMode, Theme> = {
  light: nav('light', DefaultTheme),
  dark: nav('dark', DarkTheme),
};
