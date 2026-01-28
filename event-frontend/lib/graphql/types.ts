export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginResponse {
  login: AuthResponse;
}

export interface SignupResponse {
  signup: AuthResponse;
}

export interface CreateEventInput {
  title: string;
  description: string;
  date: string;
  img?: string;
}
