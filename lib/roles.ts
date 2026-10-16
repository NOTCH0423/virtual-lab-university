export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Administrador',
  ADMIN: 'Administrador',
  TEACHER: 'Profesor',
  STUDENT: 'Estudiante',
};
export const roleLabel = (role?: string | null) => ROLE_LABELS[String(role || 'STUDENT').toUpperCase()] || String(role);
