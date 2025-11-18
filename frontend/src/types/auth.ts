// Types related to authentication flows

export interface User {
  id?: string;
  email: string;
  name?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

export interface AuthResponse {
  message: string;
  response: {
    session: Session;
    user: User;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}
