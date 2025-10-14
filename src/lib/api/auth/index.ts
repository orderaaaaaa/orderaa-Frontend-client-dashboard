import api from '..';
import { SignUpPayload, SignInPayload } from './payload';

export async function signUp(payload: SignUpPayload) {
  const { data } = await api.post('/auth/signup', payload);

  return data;
}

export async function signIn(payload: SignInPayload) {
  const { data } = await api.post('/auth/signin', payload);

  return data;
}
