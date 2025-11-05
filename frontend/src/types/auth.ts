// Types related to authentication flows

export interface User {
  id?: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
