import { Injectable, signal } from '@angular/core';

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'hi';

interface LanguageStrings {
  [key: string]: {
    [key: string]: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly LANGUAGE_KEY = 'user_language';
  currentLanguage = signal<SupportedLanguage>('en');

  private translations: LanguageStrings = {
    en: {
      'app.name': 'Smart Attendance',
      'app.welcome': 'Welcome back!',
      'dashboard': 'Dashboard',
      'profile': 'Profile',
      'settings': 'Settings',
      'logout': 'Logout',
      'save': 'Save',
      'cancel': 'Cancel',
      'delete': 'Delete',
      'edit': 'Edit',
      'loading': 'Loading...',
      'success': 'Success',
      'error': 'Error',
      'attendance': 'Attendance',
      'subjects': 'Subjects',
      'students': 'Students',
      'faculty': 'Faculty',
      'reports': 'Reports'
    },
    es: {
      'app.name': 'Asistencia Inteligente',
      'app.welcome': '¡Bienvenido de nuevo!',
      'dashboard': 'Panel',
      'profile': 'Perfil',
      'settings': 'Configuración',
      'logout': 'Cerrar sesión',
      'save': 'Guardar',
      'cancel': 'Cancelar',
      'delete': 'Eliminar',
      'edit': 'Editar',
      'loading': 'Cargando...',
      'success': 'Éxito',
      'error': 'Error',
      'attendance': 'Asistencia',
      'subjects': 'Materias',
      'students': 'Estudiantes',
      'faculty': 'Profesores',
      'reports': 'Informes'
    },
    fr: {
      'app.name': 'Présence Intelligente',
      'app.welcome': 'Bon retour!',
      'dashboard': 'Tableau de bord',
      'profile': 'Profil',
      'settings': 'Paramètres',
      'logout': 'Se déconnecter',
      'save': 'Enregistrer',
      'cancel': 'Annuler',
      'delete': 'Supprimer',
      'edit': 'Modifier',
      'loading': 'Chargement...',
      'success': 'Succès',
      'error': 'Erreur',
      'attendance': 'Présence',
      'subjects': 'Matières',
      'students': 'Étudiants',
      'faculty': 'Professeurs',
      'reports': 'Rapports'
    },
    de: {
      'app.name': 'Intelligente Anwesenheit',
      'app.welcome': 'Willkommen zurück!',
      'dashboard': 'Dashboard',
      'profile': 'Profil',
      'settings': 'Einstellungen',
      'logout': 'Abmelden',
      'save': 'Speichern',
      'cancel': 'Abbrechen',
      'delete': 'Löschen',
      'edit': 'Bearbeiten',
      'loading': 'Laden...',
      'success': 'Erfolg',
      'error': 'Fehler',
      'attendance': 'Anwesenheit',
      'subjects': 'Fächer',
      'students': 'Studenten',
      'faculty': 'Fakultät',
      'reports': 'Berichte'
    },
    hi: {
      'app.name': 'स्मार्ट उपस्थिति',
      'app.welcome': 'वापसी पर स्वागत है!',
      'dashboard': 'डैशबोर्ड',
      'profile': 'प्रोफ़ाइल',
      'settings': 'सेटिंग्स',
      'logout': 'लॉग आउट',
      'save': 'सहेजें',
      'cancel': 'रद्द करें',
      'delete': 'हटाएं',
      'edit': 'संपादित करें',
      'loading': 'लोड हो रहा है...',
      'success': 'सफलता',
      'error': 'त्रुटि',
      'attendance': 'उपस्थिति',
      'subjects': 'विषय',
      'students': 'छात्र',
      'faculty': 'संकाय',
      'reports': 'रिपोर्ट'
    }
  };

  constructor() {
    this.loadLanguage();
  }

  private loadLanguage() {
    const saved = localStorage.getItem(this.LANGUAGE_KEY) as SupportedLanguage;
    if (saved && this.translations[saved]) {
      this.currentLanguage.set(saved);
    }
  }

  setLanguage(language: SupportedLanguage) {
    if (this.translations[language]) {
      this.currentLanguage.set(language);
      localStorage.setItem(this.LANGUAGE_KEY, language);
      document.documentElement.setAttribute('lang', language);
    }
  }

  translate(key: string): string {
    const lang = this.currentLanguage();
    return this.translations[lang]?.[key] || this.translations['en'][key] || key;
  }

  t(key: string): string {
    return this.translate(key);
  }

  getLanguageName(code: SupportedLanguage): string {
    const names: Record<SupportedLanguage, string> = {
      en: 'English',
      es: 'Español',
      fr: 'Français',
      de: 'Deutsch',
      hi: 'हिन्दी'
    };
    return names[code] || code;
  }
}
