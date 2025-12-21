import React from 'react';
import {
  calculatePasswordStrength,
  PasswordStrength,
} from '@/utils/passwordStrength';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirement?: boolean;
}

export default function PasswordStrengthIndicator({
  password,
  showRequirement = true,
}: PasswordStrengthIndicatorProps) {
  const { strength, score, label } = calculatePasswordStrength(password);

  const getStrengthColors = (strength: PasswordStrength) => {
    switch (strength) {
      case 'weak':
        return {
          bg: 'bg-red-500',
          text: 'text-red-500',
        };
      case 'medium':
        return {
          bg: 'bg-orange-500',
          text: 'text-orange-500',
        };
      case 'strong':
        return {
          bg: 'bg-green-500',
          text: 'text-green-500',
        };
      default:
        return {
          bg: 'bg-gray-300',
          text: 'text-gray-500',
        };
    }
  };

  const colors = getStrengthColors(strength);

  // Calculate segment widths
  const segment1Width = score >= 33 ? 100 : score > 0 ? (score / 33) * 100 : 0;
  const segment2Width =
    score >= 66 ? 100 : score > 33 ? ((score - 33) / 33) * 100 : 0;
  const segment3Width = score > 66 ? ((score - 66) / 34) * 100 : 0;

  return (
    <div className="flex flex-col gap-2 w-full" style={{ direction: 'rtl' }}>
      <div className="flex items-center justify-between">
        <span className="text-base md:text-xl font-medium text-right">
          قوة كلمة المرور
        </span>
        {password && (
          <span className={`text-md font-medium ${colors.text}`}>{label}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden border border-gray-200">
          <div className="flex h-full">
            <div
              className={`${
                segment1Width > 0
                  ? strength === 'weak'
                    ? 'bg-red-500'
                    : strength === 'medium'
                    ? 'bg-orange-500'
                    : 'bg-green-500'
                  : 'bg-white'
              } transition-all duration-300`}
              style={{ width: `${Math.min(33.33, segment1Width)}%` }}
            />
            <div
              className={`${
                segment2Width > 0
                  ? strength === 'medium'
                    ? 'bg-orange-500'
                    : strength === 'strong'
                    ? 'bg-green-500'
                    : 'bg-white'
                  : 'bg-white'
              } transition-all duration-300`}
              style={{ width: `${Math.min(33.33, segment2Width)}%` }}
            />
            <div
              className={`${
                segment3Width > 0 ? 'bg-green-500' : 'bg-white'
              } transition-all duration-300`}
              style={{ width: `${Math.min(33.33, segment3Width)}%` }}
            />
          </div>
        </div>
      </div>
      {showRequirement && (
        <div className="text-md">
          يجب ان تحتوي علي 8 احرف علي الاقل و تشمل احرف كبيرة و صغيرة و ارقام
          ورموز
        </div>
      )}
    </div>
  );
}
