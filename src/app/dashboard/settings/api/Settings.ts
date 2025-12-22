import http from '@/lib/api/http';
import { changePasswordPayload } from '../types/settings';

export async function changePassword(payload: changePasswordPayload) {
  const { data } = await http.patch('/auth/change-password', payload);
  return data;
}
