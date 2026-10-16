import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

const PASSWORD_RULES = {
  minLength: 12,
  requireUpper: true,
  requireLower: true,
  requireDigit: true,
  requireSpecial: true,
};

export function validatePasswordStrength(password: string): {
  valid: boolean;
  message?: string;
} {
  if (!password || password.length < PASSWORD_RULES.minLength) {
    return {
      valid: false,
      message: `La contraseña debe tener al menos ${PASSWORD_RULES.minLength} caracteres`,
    };
  }

  if (PASSWORD_RULES.requireUpper && !/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'La contraseña debe incluir al menos una mayúscula',
    };
  }

  if (PASSWORD_RULES.requireLower && !/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'La contraseña debe incluir al menos una minúscula',
    };
  }

  if (PASSWORD_RULES.requireDigit && !/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'La contraseña debe incluir al menos un número',
    };
  }

  if (PASSWORD_RULES.requireSpecial && !/[^A-Za-z0-9]/.test(password)) {
    return {
      valid: false,
      message: 'La contraseña debe incluir al menos un carácter especial',
    };
  }

  return { valid: true };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
