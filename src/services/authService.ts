import type { LoginCredentials } from '../types/auth';

export async function authenticate(credentials: LoginCredentials): Promise<void> {
  void credentials;

  return new Promise((resolve) => {
    window.setTimeout(resolve, 700);
  });
}
