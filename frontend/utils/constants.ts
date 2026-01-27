export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  FORGOT_PASSWORD: '/auth/forgot-password',
  DASHBOARD: {
    DOCTOR: '/dashboard/doctor',
    LIAISON: '/dashboard/liaison',
    HOSPITAL_ADMIN: '/dashboard/hospital-admin',
    SYSTEM_ADMIN: '/dashboard/system-admin',
  },
  VERIFY: '/verify',
} as const;

export const USER_ROLES = {
  DOCTOR: 'doctor',
  LIAISON: 'liaison',
  HOSPITAL_ADMIN: 'hospital-admin',
  SYSTEM_ADMIN: 'system-admin',
} as const;

export const REFERRAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
} as const;

export const REFERRAL_URGENCY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

