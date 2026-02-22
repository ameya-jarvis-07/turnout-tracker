# 🎓 Smart Attendance System - Angular Frontend

A modern, production-ready Angular 21+ application for managing student attendance with device-based authentication and a beautiful claymorphism design theme.

## 🌟 Features

### 🔐 Authentication & Security
- JWT-based authentication with device fingerprinting
- Device-based access control
- Secure token storage and management
- Role-based access control (Admin, Faculty, Student)
- HTTP interceptors for auth, error handling, and loading states

### 👥 Role-Based Dashboards

#### **Admin Dashboard**
- System-wide statistics and metrics
- Subject management (CRUD operations)
- Device change request approval/rejection
- Low attendance student reports
- User management
- Real-time system health monitoring

#### **Faculty Dashboard**
- Subject assignment overview
- Open/close attendance sessions
- Real-time session monitoring
- Student attendance tracking
- Subject-wise attendance reports
- Session history

#### **Student Dashboard**
- Personal attendance overview
- Mark attendance for active sessions
- Subject-wise attendance reports
- Monthly attendance trends
- Low attendance warnings
- Interactive attendance charts

### 🎨 Design System
- **Claymorphism Theme**: Modern, soft UI with elegant shadows
- Fully responsive design (mobile, tablet, desktop)
- Custom component library with reusable elements
- Smooth animations and transitions
- Accessible UI components

### 📊 Data Visualization
- Interactive charts using Chart.js
- Line charts for monthly trends
- Progress bars for attendance percentages
- Real-time data updates

## 🛠️ Technology Stack

- **Angular 21+** with standalone components
- **TypeScript 5.9+**
- **RxJS 7.8** for reactive programming
- **Angular Signals** for state management
- **Chart.js 4.4** for data visualization
- **fingerprintjs2** for device fingerprinting
- **SCSS** for styling with claymorphism design

## 📁 Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/         # Route guards (auth, role, device)
│   │   ├── interceptors/   # HTTP interceptors
│   │   ├── services/       # Core services (auth, storage, etc.)
│   │   └── models/         # Core data models
│   ├── features/
│   │   ├── auth/           # Login, register components
│   │   ├── admin/          # Admin features
│   │   ├── faculty/        # Faculty features
│   │   ├── student/        # Student features
│   │   └── shared/         # Shared components & services
│   ├── app.config.ts       # App configuration
│   └── app.routes.ts       # Routing configuration
├── environments/           # Environment configs
└── styles/                # Global styles & theme
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Angular CLI 21+
- ASP.NET Core 8.0 backend running at `http://localhost:5000/api`

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   - Update `src/environments/environment.ts` with your API URL
   - For production, update `src/environments/environment.prod.ts`

3. **Start development server**
   ```bash
   npm start
   ```
   Navigate to `http://localhost:4200/`

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🔑 Default Credentials

**Note:** These are example credentials. Update based on your backend setup.

- **Admin**: admin@example.com / Admin@123
- **Faculty**: faculty@example.com / Faculty@123
- **Student**: student@example.com / Student@123

## 📡 API Integration

The application connects to an ASP.NET Core 8.0 backend. Key endpoints:

### Authentication
- `POST /api/Auth/login` - User login with device fingerprint
- `POST /api/Auth/register` - User registration

### Attendance
- `POST /api/Attendance/mark` - Mark attendance
- `GET /api/Attendance/my-attendance` - Get user's attendance
- `GET /api/Attendance/report/{userId}/{subjectId}` - Attendance report

### Sessions
- `POST /api/AttendanceSession/open` - Open attendance session
- `GET /api/AttendanceSession/active` - Get active sessions
- `PUT /api/AttendanceSession/close/{id}` - Close session

### Admin
- `GET /api/Admin/dashboard-stats` - Dashboard statistics
- `GET /api/Admin/device-change-requests` - Device change requests
- `POST /api/Admin/device-change-requests/{id}/review` - Review request

## 🎨 Claymorphism Design

The application uses a custom claymorphism design system with:

### Color Palette
- **Clay Background**: `#e0e5ec`
- **Clay Primary**: `#7c9cbf`
- **Clay Success**: `#7bc043`
- **Clay Warning**: `#ffa62b`
- **Clay Danger**: `#ee4266`

### Clay Components
- `.clay-card` - Raised card with soft shadows
- `.clay-card-inset` - Inset card effect
- `.clay-button` - Interactive button with depth
- `.clay-input` - Form input with inset shadow
- `.clay-progress` - Progress bar with clay styling

## 🔒 Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Device Fingerprinting**: Unique device identification
3. **HTTP Interceptors**: Automatic token injection and error handling
4. **Route Guards**: Protected routes based on authentication and roles
5. **XSS Protection**: Angular's built-in sanitization
6. **Input Validation**: Reactive forms with comprehensive validation

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 576px
- **Tablet**: 576px - 992px
- **Desktop**: > 992px

All components adapt seamlessly to different screen sizes.

## 🧪 Testing

Run unit tests:
```bash
npm test
```

## 📈 Performance Optimization

- **Lazy Loading**: Routes are lazy-loaded for better performance
- **Standalone Components**: No NgModules for reduced bundle size
- **OnPush Change Detection**: Optimized change detection (where applicable)
- **HTTP Interceptors**: Centralized request/response handling
- **Signal-based State**: Efficient reactive state management

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 Component Documentation

### Shared Components

#### NavbarComponent
```typescript
<app-navbar [appName]="'My App'"></app-navbar>
```

#### SidebarComponent
```typescript
<app-sidebar [menuItems]="menuItems" [collapsed]="false"></app-sidebar>
```

#### StatsCardComponent
```typescript
<app-stats-card
  title="Total Students"
  [value]="120"
  icon="👨‍🎓"
  iconBackground="linear-gradient(135deg, #7c9cbf, #8b9dc3)"
  [trend]="'up'"
  [clickable]="true"
></app-stats-card>
```

#### AttendanceChartComponent
```typescript
<app-attendance-chart
  [chartType]="'line'"
  [title]="'Monthly Trends'"
  [labels]="['Jan', 'Feb', 'Mar']"
  [datasets]="[{label: 'Attendance', data: [75, 80, 85]}]"
></app-attendance-chart>
```

## 🎯 Roadmap

- [ ] Real-time notifications with SignalR
- [ ] Advanced reporting with PDF export
- [ ] Biometric attendance integration
- [ ] Mobile app (Ionic/Capacitor)
- [ ] Offline support with service workers
- [ ] Multi-language support (i18n)
- [ ] Dark mode theme
- [ ] Advanced analytics dashboard

## 📚 Additional Resources

- [Angular Documentation](https://angular.dev)
- [Chart.js Documentation](https://www.chartjs.org)
- [Claymorphism Design](https://hype4.academy/tools/claymorphism-generator)

---

**Built with ❤️ using Angular 21+ and Claymorphism Design**

