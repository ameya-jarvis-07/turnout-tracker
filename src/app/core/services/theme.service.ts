import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'user_theme';
  currentTheme = signal<Theme>('light');
  effectiveTheme = signal<'light' | 'dark'>('light');

  constructor() {
    this.loadTheme();
    this.initializeThemeEffect();
    this.watchSystemTheme();
  }

  private loadTheme() {
    const saved = localStorage.getItem(this.THEME_KEY) as Theme;
    if (saved && ['light', 'dark', 'auto'].includes(saved)) {
      this.currentTheme.set(saved);
    }
    this.updateEffectiveTheme();
  }

  private initializeThemeEffect() {
    effect(() => {
      const theme = this.effectiveTheme();
      this.applyTheme(theme);
    });
  }

  setTheme(theme: Theme) {
    this.currentTheme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    this.updateEffectiveTheme();
  }

  private updateEffectiveTheme() {
    const theme = this.currentTheme();
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.effectiveTheme.set(prefersDark ? 'dark' : 'light');
    } else {
      this.effectiveTheme.set(theme);
    }
  }

  private watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (this.currentTheme() === 'auto') {
        this.updateEffectiveTheme();
      }
    });
  }

  private applyTheme(theme: 'light' | 'dark') {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
  }

  toggleTheme() {
    const current = this.currentTheme();
    const next: Theme = current === 'light' ? 'dark' : current === 'dark' ? 'auto' : 'light';
    this.setTheme(next);
  }
}
