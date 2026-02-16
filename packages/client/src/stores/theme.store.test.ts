import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from './theme.store';

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'system' });
  });

  it('tiene tema system por defecto', () => {
    expect(useThemeStore.getState().theme).toBe('system');
  });

  it('setTheme cambia a dark', () => {
    useThemeStore.getState().setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('dark');
  });

  it('setTheme cambia a light', () => {
    useThemeStore.getState().setTheme('light');
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('setTheme puede volver a system', () => {
    useThemeStore.getState().setTheme('dark');
    useThemeStore.getState().setTheme('system');
    expect(useThemeStore.getState().theme).toBe('system');
  });
});
