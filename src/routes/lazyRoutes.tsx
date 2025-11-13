/**
 * Lazy-loaded routes for code splitting and performance optimization
 * Each route is loaded only when needed, reducing initial bundle size
 */
import { lazyLoadWithRetry } from '@/lib/lazyLoad';

// Admin routes (heavy dashboards with charts)
export const AdminDashboard = lazyLoadWithRetry(
  () => import('@/pages/AdminDashboard'),
  'AdminDashboard'
);

export const SystemHealthDashboard = lazyLoadWithRetry(
  () => import('@/pages/admin/SystemHealthDashboard'),
  'SystemHealthDashboard'
);

export const SecurityMonitoring = lazyLoadWithRetry(
  () => import('@/pages/admin/SecurityMonitoring'),
  'SecurityMonitoring'
);

export const UserManagement = lazyLoadWithRetry(
  () => import('@/pages/admin/UserManagement'),
  'UserManagement'
);

export const AuthMonitoring = lazyLoadWithRetry(
  () => import('@/pages/admin/AuthMonitoring'),
  'AuthMonitoring'
);

// Professional routes
export const ProfessionalDashboard = lazyLoadWithRetry(
  () => import('@/pages/professional/ProfessionalDashboard'),
  'ProfessionalDashboard'
);

export const ProfessionalCalendar = lazyLoadWithRetry(
  () => import('@/pages/professional/ProfessionalCalendar'),
  'ProfessionalCalendar'
);

export const ProfessionalClients = lazyLoadWithRetry(
  () => import('@/pages/professional/ProfessionalClients'),
  'ProfessionalClients'
);

export const Analytics = lazyLoadWithRetry(
  () => import('@/pages/petshop/Analytics'),
  'Analytics'
);

// Client routes
export const ClientDashboard = lazyLoadWithRetry(
  () => import('@/pages/ClientDashboard'),
  'ClientDashboard'
);

export const ClientPets = lazyLoadWithRetry(
  () => import('@/pages/client/ClientPets'),
  'ClientPets'
);

export const ClientAppointments = lazyLoadWithRetry(
  () => import('@/pages/client/ClientAppointments'),
  'ClientAppointments'
);

// Heavy pages with charts
export const Relatorios = lazyLoadWithRetry(
  () => import('@/pages/petshop/Relatorios'),
  'Relatorios'
);

export const Financeiro = lazyLoadWithRetry(
  () => import('@/pages/petshop/Financeiro'),
  'Financeiro'
);

export const PerformanceDashboard = lazyLoadWithRetry(
  () => import('@/pages/admin/PerformanceDashboard'),
  'PerformanceDashboard'
);

export const ConsolidatedHealthDashboard = lazyLoadWithRetry(
  () => import('@/pages/admin/ConsolidatedHealthDashboard'),
  'ConsolidatedHealthDashboard'
);

// Less critical pages
export const SuccessStories = lazyLoadWithRetry(
  () => import('@/pages/SuccessStories'),
  'SuccessStories'
);

export const Blog = lazyLoadWithRetry(
  () => import('@/pages/Blog'),
  'Blog'
);

export const BlogPost = lazyLoadWithRetry(
  () => import('@/pages/BlogPost'),
  'BlogPost'
);
