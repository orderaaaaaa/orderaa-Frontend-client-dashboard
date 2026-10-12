import api from '.';
import type { User } from '@/store/authStore';

export interface SignUpPayload {
  username: string;
  merchantName: string;
  email: string;
  phoneNumber: string;
  city: string;
  governorate: string;
  password: string;
  confirmPassword: string;
}

export interface SignInPayload {
  emailOrPhoneNumber: string;
  password: string;
  rememberMe: boolean;
}

export interface SignInResponse {
  access_token: string;
  expires_in: number;
}

export async function signUp(payload: SignUpPayload) {
  const { data } = await api.post('/auth/signup', payload);

  return data;
}

export async function signIn(payload: SignInPayload): Promise<SignInResponse> {
  const { data } = await api.post<SignInResponse>('/auth/signin', payload, {
    withCredentials: true,
  });
  return data;
}

export async function fetchMe(token?: string): Promise<User> {
  const { data } = await api.get<User>(
    '/auth/me',
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  );
  return data;
}

export async function sendOTP(email: string) {
  const { data } = await api.post('/auth/send-otp', { email });

  return data;
}

export async function verifyOTP(email: string, otp: string) {
  const { data } = await api.post('/auth/verify-otp', { email, otp });

  return data;
}
