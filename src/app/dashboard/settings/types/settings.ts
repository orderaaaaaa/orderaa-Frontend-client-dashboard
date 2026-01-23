export interface changePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
export interface updateProfilePayload {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  governorate?: string;
  city?: string;
}
