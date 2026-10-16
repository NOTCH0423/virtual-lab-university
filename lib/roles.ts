export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ADMIN_ROLES: Role[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

export function isAdminRole(role?: string | null): boolean {
  return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;
}

export function isSuperAdmin(role?: string | null): boolean {
  return role === ROLES.SUPER_ADMIN;
}

export function isTeacherOrAbove(role?: string | null): boolean {
  return isAdminRole(role) || role === ROLES.TEACHER;
}

export function canManageRole(actorRole: string, targetRole: string): boolean {
  if (isSuperAdmin(actorRole)) return true;
  if (actorRole === ROLES.ADMIN) {
    return targetRole === ROLES.TEACHER || targetRole === ROLES.STUDENT || targetRole === ROLES.ADMIN;
  }
  return false;
}
