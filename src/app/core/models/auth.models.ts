export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresAt: string;
  userName: string;
  email: string;
  role: string;
  isEmailConfirmed: boolean;
  message?: string | null;
}

export interface ApiErrorResponse {
  error?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ConfirmEmailRequest {
  email: string;
  token: string;
}

export interface ResendConfirmationRequest {
  email: string;
}

export interface CurrentUser {
  userId: string;
  email: string | null;
  name: string | null;
  role: string | null;
  isEmailConfirmed: boolean;
}

export interface MessageResponse {
  message: string;
}

export interface PasswordActionResponse {
  success: boolean;
  message: string;
}