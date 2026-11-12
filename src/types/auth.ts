export type LoginCredentials = {
  identifier: string;
  password: string;
  rememberMe: boolean;
};

export type LoginErrors = Partial<Record<'identifier' | 'password', string>>;

export type RegistrationData = {
  username: string;
  email: string;
  password: string;
};
