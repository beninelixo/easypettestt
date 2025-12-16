/**
 * Query Keys Factory for React Query
 * Provides consistent, type-safe query keys for cache management
 */

export const queryKeys = {
  // Appointments
  appointments: {
    all: ['appointments'] as const,
    lists: () => [...queryKeys.appointments.all, 'list'] as const,
    list: (filters?: { petShopId?: string; status?: string; date?: string }) =>
      [...queryKeys.appointments.lists(), filters] as const,
    details: () => [...queryKeys.appointments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.appointments.details(), id] as const,
    byPet: (petId: string) => [...queryKeys.appointments.all, 'pet', petId] as const,
    byClient: (clientId: string) => [...queryKeys.appointments.all, 'client', clientId] as const,
    upcoming: (petShopId: string) => [...queryKeys.appointments.all, 'upcoming', petShopId] as const,
  },

  // Pets
  pets: {
    all: ['pets'] as const,
    lists: () => [...queryKeys.pets.all, 'list'] as const,
    list: (filters?: { ownerId?: string; species?: string }) =>
      [...queryKeys.pets.lists(), filters] as const,
    details: () => [...queryKeys.pets.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.pets.details(), id] as const,
    byOwner: (ownerId: string) => [...queryKeys.pets.all, 'owner', ownerId] as const,
  },

  // Services
  services: {
    all: ['services'] as const,
    lists: () => [...queryKeys.services.all, 'list'] as const,
    list: (petShopId?: string) => [...queryKeys.services.lists(), { petShopId }] as const,
    details: () => [...queryKeys.services.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.services.details(), id] as const,
  },

  // Pet Shops
  petShops: {
    all: ['petShops'] as const,
    lists: () => [...queryKeys.petShops.all, 'list'] as const,
    list: (filters?: { city?: string; state?: string }) =>
      [...queryKeys.petShops.lists(), filters] as const,
    details: () => [...queryKeys.petShops.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.petShops.details(), id] as const,
    byOwner: (ownerId: string) => [...queryKeys.petShops.all, 'owner', ownerId] as const,
  },

  // Users/Profiles
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: { role?: string }) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    profile: (id: string) => [...queryKeys.users.all, 'profile', id] as const,
    roles: (id: string) => [...queryKeys.users.all, 'roles', id] as const,
  },

  // Payments
  payments: {
    all: ['payments'] as const,
    lists: () => [...queryKeys.payments.all, 'list'] as const,
    list: (filters?: { petShopId?: string; status?: string; startDate?: string; endDate?: string }) =>
      [...queryKeys.payments.lists(), filters] as const,
    details: () => [...queryKeys.payments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.payments.details(), id] as const,
    byAppointment: (appointmentId: string) =>
      [...queryKeys.payments.all, 'appointment', appointmentId] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (userId: string) => [...queryKeys.notifications.lists(), userId] as const,
    unread: (userId: string) => [...queryKeys.notifications.all, 'unread', userId] as const,
  },

  // Loyalty
  loyalty: {
    all: ['loyalty'] as const,
    points: (clientId: string, petShopId: string) =>
      [...queryKeys.loyalty.all, 'points', clientId, petShopId] as const,
    transactions: (loyaltyId: string) =>
      [...queryKeys.loyalty.all, 'transactions', loyaltyId] as const,
  },

  // Admin
  admin: {
    all: ['admin'] as const,
    metrics: () => [...queryKeys.admin.all, 'metrics'] as const,
    alerts: () => [...queryKeys.admin.all, 'alerts'] as const,
    users: () => [...queryKeys.admin.all, 'users'] as const,
    health: () => [...queryKeys.admin.all, 'health'] as const,
    logs: (filters?: { level?: string; module?: string }) =>
      [...queryKeys.admin.all, 'logs', filters] as const,
  },

  // Site Images
  siteImages: {
    all: ['siteImages'] as const,
    list: () => [...queryKeys.siteImages.all, 'list'] as const,
    byKey: (key: string) => [...queryKeys.siteImages.all, key] as const,
  },

  // Blog
  blog: {
    all: ['blog'] as const,
    posts: () => [...queryKeys.blog.all, 'posts'] as const,
    post: (slug: string) => [...queryKeys.blog.posts(), slug] as const,
  },
} as const;

// Type helpers
export type QueryKeys = typeof queryKeys;
