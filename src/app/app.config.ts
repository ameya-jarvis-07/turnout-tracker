import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { ThemeService } from './core/services/theme.service';
import { LanguageService } from './core/services/language.service';
import { DisplayService } from './core/services/display.service';

// Initialize theme and display services on app startup
export function initializeApp(
  themeService: ThemeService,
  languageService: LanguageService,
  displayService: DisplayService
) {
  return () => {
    // Services are initialized through their constructors
    // This just ensures they're instantiated early
    themeService.currentTheme();
    languageService.currentLanguage();
    displayService.compactView();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor,
        loadingInterceptor
      ])
    ),
    provideAnimations(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ThemeService, LanguageService, DisplayService],
      multi: true
    }
  ]
};
