import { Injectable, signal, effect } from '@angular/core';

interface DisplaySettings {
  compactView: boolean;
  showAnimations: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DisplayService {
  private readonly DISPLAY_KEY = 'display_settings';
  
  compactView = signal(false);
  showAnimations = signal(true);

  constructor() {
    this.loadSettings();
    this.initializeEffects();
  }

  private loadSettings() {
    const saved = localStorage.getItem(this.DISPLAY_KEY);
    if (saved) {
      try {
        const settings: DisplaySettings = JSON.parse(saved);
        this.compactView.set(settings.compactView ?? false);
        this.showAnimations.set(settings.showAnimations ?? true);
      } catch (e) {
        console.error('Failed to load display settings:', e);
      }
    }
  }

  private initializeEffects() {
    effect(() => {
      this.applyCompactView(this.compactView());
    });

    effect(() => {
      this.applyAnimations(this.showAnimations());
    });
  }

  setCompactView(enabled: boolean) {
    this.compactView.set(enabled);
    this.saveSettings();
  }

  setShowAnimations(enabled: boolean) {
    this.showAnimations.set(enabled);
    this.saveSettings();
  }

  private saveSettings() {
    const settings: DisplaySettings = {
      compactView: this.compactView(),
      showAnimations: this.showAnimations()
    };
    localStorage.setItem(this.DISPLAY_KEY, JSON.stringify(settings));
  }

  private applyCompactView(enabled: boolean) {
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('compact-view');
    } else {
      root.classList.remove('compact-view');
    }
  }

  private applyAnimations(enabled: boolean) {
    const root = document.documentElement;
    if (enabled) {
      root.classList.remove('reduce-motion');
    } else {
      root.classList.add('reduce-motion');
    }
  }

  toggleCompactView() {
    this.setCompactView(!this.compactView());
  }

  toggleAnimations() {
    this.setShowAnimations(!this.showAnimations());
  }
}
