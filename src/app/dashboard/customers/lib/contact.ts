import type { KeyboardEvent } from 'react';

export const toWhatsAppNumber = (phone: string) => {
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.startsWith('0')) {
    return `+20${cleaned.slice(1)}`;
  }
  return cleaned;
};

export const formatOrderDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString('en-GB') : '-';

export const formatNotes = (notes: string[]) => notes.join('، ');

export const isActivationKey = (event: KeyboardEvent<HTMLElement>) =>
  event.target === event.currentTarget &&
  (event.key === 'Enter' || event.key === ' ');
