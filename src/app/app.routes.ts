import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      }
    ]
  },
  // Shared routes (available to all authenticated users)
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shared/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shared/settings/settings.component').then(m => m.SettingsComponent)
  },
  // Admin routes
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['Admin'])],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'subjects',
        loadComponent: () => import('./features/admin/subjects/subjects.component').then(m => m.AdminSubjectsComponent)
      },
      {
        path: 'subjects/create',
        loadComponent: () => import('./features/admin/subjects/create/create-subject.component').then(m => m.CreateSubjectComponent)
      },
      {
        path: 'subjects/edit/:id',
        loadComponent: () => import('./features/admin/subjects/edit/edit-subject.component').then(m => m.EditSubjectComponent)
      },
      {
        path: 'device-requests',
        loadComponent: () => import('./features/admin/device-requests/device-requests.component').then(m => m.DeviceRequestsComponent)
      },
      {
        path: 'low-attendance',
        loadComponent: () => import('./features/admin/low-attendance/low-attendance.component').then(m => m.LowAttendanceComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/admin/reports/reports.component').then(m => m.AdminReportsComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  // Faculty routes
  {
    path: 'faculty',
    canActivate: [authGuard, roleGuard(['Faculty'])],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/faculty/dashboard/faculty-dashboard.component').then(m => m.FacultyDashboardComponent)
      },
      {
        path: 'my-subjects',
        loadComponent: () => import('./features/faculty/my-subjects/my-subjects.component').then(m => m.MySubjectsComponent)
      },
      {
        path: 'open-session',
        loadComponent: () => import('./features/faculty/open-session/open-session.component').then(m => m.OpenSessionComponent)
      },
      {
        path: 'session-history',
        loadComponent: () => import('./features/faculty/session-history/session-history.component').then(m => m.SessionHistoryComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/faculty/reports/reports.component').then(m => m.FacultyReportsComponent)
      },
      {
        path: 'subject-attendance/:id',
        loadComponent: () => import('./features/faculty/my-subjects/my-subjects.component').then(m => m.MySubjectsComponent)
      },
      {
        path: 'active-session/:id',
        loadComponent: () => import('./features/faculty/session-history/session-history.component').then(m => m.SessionHistoryComponent)
      },
      {
        path: 'subject-report/:id',
        loadComponent: () => import('./features/faculty/reports/reports.component').then(m => m.FacultyReportsComponent)
      },
      {
        path: 'session-details/:id',
        loadComponent: () => import('./features/faculty/session-history/session-history.component').then(m => m.SessionHistoryComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  // Student routes
  {
    path: 'student',
    canActivate: [authGuard, roleGuard(['Student'])],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/student/dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent)
      },
      {
        path: 'mark-attendance',
        loadComponent: () => import('./features/student/mark-attendance/mark-attendance.component').then(m => m.MarkAttendanceComponent)
      },
      {
        path: 'my-attendance',
        loadComponent: () => import('./features/student/my-attendance/my-attendance.component').then(m => m.MyAttendanceComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/student/reports/reports.component').then(m => m.StudentReportsComponent)
      },
      {
        path: 'trends',
        loadComponent: () => import('./features/student/trends/trends.component').then(m => m.TrendsComponent)
      },
      {
        path: 'subject-report/:id',
        loadComponent: () => import('./features/student/my-attendance/my-attendance.component').then(m => m.MyAttendanceComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
