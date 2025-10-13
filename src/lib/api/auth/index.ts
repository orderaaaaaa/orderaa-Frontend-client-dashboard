import api from '..';
import { SignUpPayload } from './payload';

export async function signUp(payload: SignUpPayload) {
  const { data } = await api.post('/auth/signup', payload);

  return data;
}
