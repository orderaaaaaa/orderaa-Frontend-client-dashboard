export const validateEgyptianPhoneNumber = (phoneNumber: string): boolean => {
  const cleanNumber = phoneNumber.trim();

  if (cleanNumber.length !== 11) {
    return false;
  }

  if (!cleanNumber.startsWith('01')) {
    return false;
  }

  if (!/^\d+$/.test(cleanNumber)) {
    return false;
  }

  return true;
};

export const getPhoneNumberErrorMessage = (phoneNumber: string): string => {
  const cleanNumber = phoneNumber.trim();

  if (cleanNumber.length === 0) {
    return 'رقم الهاتف مطلوب';
  }

  if (!/^\d+$/.test(cleanNumber)) {
    return 'رقم الهاتف يجب أن يحتوي على أرقام فقط';
  }

  if (!cleanNumber.startsWith('01')) {
    return 'رقم الهاتف يجب أن يبدأ بـ 01';
  }

  if (cleanNumber.length !== 11) {
    return `رقم الهاتف يجب أن يكون 11 رقم (الرقم الحالي ${cleanNumber.length} أرقام)`;
  }

  return 'رقم الهاتف غير صالح';
};
