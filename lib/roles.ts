/**
 * Jerarquía de roles: SUPER_ADMIN > ADMIN > TEACHER > STUDENT
 * Toda la autorización del sistema (API, middleware y UI) se basa en este archivo.
 */
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LEVEL: Record<Role, number> = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  TEACHER: 2,
  STUDENT: 1,
};

export const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: 'Superadministrador',
  ADMIN: 'Administrador',
  TEACHER: 'Profesor',
  STUDENT: 'Estudiante',
};

export const ALL_ROLES: Role[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT];
export const ADMIN_ROLES: Role[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

/** Mapa único de permisos: cada permiso indica el rol mínimo requerido. */
export const PERMISSIONS = {
  'own:read': ROLES.STUDENT, // ver y editar sus propios datos, progreso y notas
  'own:write': ROLES.STUDENT,
  'students:read': ROLES.TEACHER, // ver la lista de estudiantes
  'grades:read': ROLES.TEACHER, // ver notas de cualquier estudiante
  'grades:write': ROLES.TEACHER, // crear notas (editar solo las propias salvo ADMIN+)
  'grades:manage_all': ROLES.ADMIN, // editar/borrar notas de otros profesores
  'teacher:panel': ROLES.TEACHER,
  'admin:panel': ROLES.ADMIN,
  'users:read': ROLES.ADMIN,
  'users:manage': ROLES.ADMIN, // gestionar TEACHER / STUDENT
  'content:manage': ROLES.ADMIN, // laboratorios, cursos, ajustes
  'admins:manage': ROLES.SUPER_ADMIN, // crear/promover ADMIN o SUPER_ADMIN
  'database:reset': ROLES.SUPER_ADMIN,
} as const satisfies Record<string, Role>;

export type Permission = keyof typeof PERMISSIONS;

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && value in ROLE_LEVEL;
}

export function roleLevel(role?: string | null): number {
  return isRole(role) ? ROLE_LEVEL[role] : 0;
}

/** ¿El rol tiene al menos el nivel de `min`? */
export function hasRole(role: string | null | undefined, min: Role): boolean {
  return roleLevel(role) >= ROLE_LEVEL[min];
}

export function can(role: string | null | undefined, permission: Permission): boolean {
  return hasRole(role, PERMISSIONS[permission]);
}

/**
 * ¿Puede `actor` asignar el rol `newRole` (crear o promover)?
 * - SUPER_ADMIN: cualquier rol.
 * - ADMIN: solo TEACHER o STUDENT.
 */
export function canAssignRole(actorRole: string | null | undefined, newRole: string): boolean {
  if (!isRole(newRole)) return false;
  if (ROLE_LEVEL[newRole] >= ROLE_LEVEL.ADMIN) return can(actorRole, 'admins:manage');
  return can(actorRole, 'users:manage');
}

/**
 * ¿Puede `actor` modificar/suspender/eliminar a un usuario con rol `targetRole`?
 * - SUPER_ADMIN: a cualquiera excepto otro SUPER_ADMIN (protección del propietario).
 * - ADMIN: solo TEACHER y STUDENT.
 */
export function canManageUser(actorRole: string | null | undefined, targetRole: string): boolean {
  if (!can(actorRole, 'users:manage')) return false;
  if (targetRole === ROLES.SUPER_ADMIN) return false;
  if (targetRole === ROLES.ADMIN) return can(actorRole, 'admins:manage');
  return true;
}

// Ayudantes de compatibilidad
export const isSuperAdmin = (role?: string | null) => role === ROLES.SUPER_ADMIN;
export const isAdminRole = (role?: string | null) => hasRole(role, ROLES.ADMIN);
export const isTeacherOrAbove = (role?: string | null) => hasRole(role, ROLES.TEACHER);
/** @deprecated usar canAssignRole */
export const canManageRole = canAssignRole;
