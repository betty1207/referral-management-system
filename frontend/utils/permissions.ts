import { UserRole } from '@/types/user';

export interface Permission {
  canCreateReferral: boolean;
  canApproveReferral: boolean;
  canViewAllReferrals: boolean;
  canManageUsers: boolean;
  canManageHospitals: boolean;
}

export const getPermissions = (role: UserRole): Permission => {
  const permissions: Record<UserRole, Permission> = {
    doctor: {
      canCreateReferral: true,
      canApproveReferral: false,
      canViewAllReferrals: false,
      canManageUsers: false,
      canManageHospitals: false,
    },
    liaison: {
      canCreateReferral: false,
      canApproveReferral: true,
      canViewAllReferrals: true,
      canManageUsers: false,
      canManageHospitals: false,
    },
    'hospital-admin': {
      canCreateReferral: false,
      canApproveReferral: false,
      canViewAllReferrals: true,
      canManageUsers: false,
      canManageHospitals: true,
    },
    'system-admin': {
      canCreateReferral: false,
      canApproveReferral: false,
      canViewAllReferrals: true,
      canManageUsers: true,
      canManageHospitals: true,
    },
  };

  return permissions[role];
};

export const hasPermission = (role: UserRole, permission: keyof Permission): boolean => {
  return getPermissions(role)[permission];
};

