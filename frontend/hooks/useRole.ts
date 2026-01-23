import { useAuth } from './useAuth';

export type UserRole = 'doctor' | 'liaison' | 'hospital-admin' | 'system-admin';

export function useRole() {
  const { user } = useAuth();

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role as UserRole);
  };

  const isDoctor = () => hasRole('doctor');
  const isLiaison = () => hasRole('liaison');
  const isHospitalAdmin = () => hasRole('hospital-admin');
  const isSystemAdmin = () => hasRole('system-admin');

  return {
    role: user?.role as UserRole | undefined,
    hasRole,
    isDoctor,
    isLiaison,
    isHospitalAdmin,
    isSystemAdmin,
  };
}

