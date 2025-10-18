import api from '.';

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
}

export async function signUp(payload: SignUpPayload) {
  const { data } = await api.post('/auth/signup', payload);

  return data;
}

export async function signIn(payload: SignInPayload) {
  const { data } = await api.post('/auth/signin', payload);

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

export async function resetPassword(
  email: string,
  newPassword: string,
  confirmPassword: string
) {
  const { data } = await api.post('/auth/reset-password', {
    email,
    newPassword,
    confirmPassword,
  });

  return data;
}
