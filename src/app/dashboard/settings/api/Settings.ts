import http from '@/lib/api/http';
import { changePasswordPayload, updateProfilePayload } from '../types/settings';

export async function changePassword(payload: changePasswordPayload) {
  const { data } = await http.patch('/auth/change-password', payload);
  return data;
}

export async function updateProfile(payload: updateProfilePayload) {
  const { data } = await http.put('auth/profile', payload);
  return data;
}
