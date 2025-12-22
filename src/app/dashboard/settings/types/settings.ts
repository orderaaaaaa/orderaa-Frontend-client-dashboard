export interface changePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
export interface updateProfilePayload {
  username?: string;
  email?: string;
  phoneNumber?: string;
  governorate?: string;
  city?: string;
}
