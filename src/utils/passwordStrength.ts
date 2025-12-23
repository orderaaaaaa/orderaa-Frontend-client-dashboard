export type PasswordStrength = 'weak' | 'medium' | 'strong';

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // 0-100
  label: string;
}

export function calculatePasswordStrength(
  password: string
): PasswordStrengthResult {
  if (!password || password.length === 0) {
    return {
      strength: 'weak',
      score: 0,
      label: 'ضعيفة',
    };
  }

  let score = 0;
  const checks = {
    length: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  // Length check (0-30 points)
  if (checks.length) {
    score += 30;
    if (password.length >= 12) score += 10;
  }

  // Character variety (0-40 points)
  if (checks.hasLowercase) score += 10;
  if (checks.hasUppercase) score += 10;
  if (checks.hasNumber) score += 10;
  if (checks.hasSpecialChar) score += 10;

  // Additional complexity (0-30 points)
  if (
    password.length >= 10 &&
    Object.values(checks).filter(Boolean).length >= 4
  ) {
    score += 20;
  }
  if (
    password.length >= 12 &&
    Object.values(checks).filter(Boolean).length >= 5
  ) {
    score += 10;
  }

  // Determine strength
  let strength: PasswordStrength;
  let label: string;

  if (score < 40) {
    strength = 'weak';
    label = 'ضعيفة';
  } else if (score < 70) {
    strength = 'medium';
    label = 'متوسطة';
  } else {
    strength = 'strong';
    label = 'قوية';
  }

  return {
    strength,
    score: Math.min(100, score),
    label,
  };
}
