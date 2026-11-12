import type { LoginCredentials, RegistrationData } from '../types/auth';
import { apiRequest } from './httpClient';

export async function authenticate(credentials: LoginCredentials): Promise<void> {
  void credentials;

  return new Promise((resolve) => {
    window.setTimeout(resolve, 700);
  });
}

export async function registerUser(data: RegistrationData): Promise<void> {
  const response = await apiRequest('/auth/createUser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('User registration failed.');
  }
}
