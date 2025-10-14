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
