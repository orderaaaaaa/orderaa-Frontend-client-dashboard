export const normalizePhoneNumber = (phone: string) => {
  let digits = phone
    .replace(/[\u06F0-\u06F9]/g, (c) => String(c.charCodeAt(0) - 0x06f0))
    .replace(/[\u0660-\u0669]/g, (c) => String(c.charCodeAt(0) - 0x0660))
    .replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('20')) digits = digits.slice(2);
  if (digits.length === 10 && !digits.startsWith('0')) digits = `0${digits}`;
  return digits;
};

export const lookupPhoneOf = (phones: string[]): string =>
  phones.find((phone) => phone.trim().length >= 8) || '';
