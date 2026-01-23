export type UserRole = 'doctor' | 'liaison' | 'hospital-admin' | 'system-admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  hospitalId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPermissions {
  canCreateReferral: boolean;
  canApproveReferral: boolean;
  canViewAllReferrals: boolean;
  canManageUsers: boolean;
  canManageHospitals: boolean;
}

