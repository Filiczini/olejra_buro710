export interface LoginCredentials {
  email: string;
  password: string;
}

// Tokens are delivered as httpOnly cookies; the body carries only the user.
export interface LoginResponse {
  user: { id: string; email: string; role: string };
}
