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