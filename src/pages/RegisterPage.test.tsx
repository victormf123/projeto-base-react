import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { registerUser } from '../services/authService';

jest.mock('../services/authService', () => ({
  authenticate: jest.fn(),
  registerUser: jest.fn(),
}));

const mockedRegisterUser = registerUser as jest.MockedFunction<typeof registerUser>;

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.history.replaceState({}, '', '/register');
  mockedRegisterUser.mockReset();
  mockedRegisterUser.mockResolvedValue(undefined);
});

test('validates required fields and email format without submitting', async () => {
  render(<App />);

  await userEvent.click(screen.getByRole('button', { name: /criar conta/i }));
  expect(await screen.findByText('Informe seu username.')).toBeInTheDocument();
  expect(screen.getByText('Informe seu e-mail.')).toBeInTheDocument();
  expect(screen.getByText('Informe sua senha.')).toBeInTheDocument();
  expect(mockedRegisterUser).not.toHaveBeenCalled();

  await userEvent.type(screen.getByLabelText('Username'), 'leo');
  await userEvent.type(screen.getByLabelText('E-mail'), 'email-invalido');
  await userEvent.type(screen.getByLabelText('Senha'), '123');
  await userEvent.click(screen.getByRole('button', { name: /criar conta/i }));

  expect(await screen.findByText('Informe um endereço de e-mail válido.')).toBeInTheDocument();
  expect(mockedRegisterUser).not.toHaveBeenCalled();
});

test('submits the registration and redirects to the existing dashboard', async () => {
  render(<App />);

  await userEvent.type(screen.getByLabelText('Username'), 'leo');
  await userEvent.type(screen.getByLabelText('E-mail'), 'leonardo@gmail.com');
  await userEvent.type(screen.getByLabelText('Senha'), '123');
  await userEvent.click(screen.getByRole('button', { name: /criar conta/i }));

  expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  expect(mockedRegisterUser).toHaveBeenCalledWith({
    username: 'leo',
    email: 'leonardo@gmail.com',
    password: '123',
  });
  expect(window.sessionStorage.getItem('projeto-base.auth-user')).toContain(
    'leonardo@gmail.com',
  );
});

test('shows a generic error and stays on the registration page when the request fails', async () => {
  mockedRegisterUser.mockRejectedValue(new Error('Internal API details'));
  render(<App />);

  await userEvent.type(screen.getByLabelText('Username'), 'leo');
  await userEvent.type(screen.getByLabelText('E-mail'), 'leonardo@gmail.com');
  await userEvent.type(screen.getByLabelText('Senha'), '123');
  await userEvent.click(screen.getByRole('button', { name: /criar conta/i }));

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Não foi possível efetuar o cadastro. Verifique os dados informados e tente novamente.',
  );
  expect(screen.getByRole('heading', { name: 'Criar sua conta' })).toBeInTheDocument();
  expect(screen.queryByText('Internal API details')).not.toBeInTheDocument();
  expect(window.sessionStorage.getItem('projeto-base.auth-user')).toBeNull();
});

test('prevents duplicate submissions while the request is pending', async () => {
  let resolveRegistration: (() => void) | undefined;
  mockedRegisterUser.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        resolveRegistration = resolve;
      }),
  );
  render(<App />);

  await userEvent.type(screen.getByLabelText('Username'), 'leo');
  await userEvent.type(screen.getByLabelText('E-mail'), 'leonardo@gmail.com');
  await userEvent.type(screen.getByLabelText('Senha'), '123');
  await userEvent.click(screen.getByRole('button', { name: /criar conta/i }));

  const pendingButton = await screen.findByRole('button', { name: /criando conta/i });
  expect(pendingButton).toBeDisabled();
  fireEvent.submit(pendingButton.closest('form') as HTMLFormElement);
  expect(mockedRegisterUser).toHaveBeenCalledTimes(1);

  resolveRegistration?.();
  expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
});

test('provides a link back to login', async () => {
  render(<App />);

  await userEvent.click(screen.getByRole('link', { name: 'Entrar' }));
  expect(await screen.findByRole('heading', { name: 'Boas-vindas de volta' })).toBeInTheDocument();
});

test('provides a registration link from the login page', async () => {
  window.history.replaceState({}, '', '/login');
  render(<App />);

  await userEvent.click(screen.getByRole('link', { name: 'Cadastre-se' }));
  expect(await screen.findByRole('heading', { name: 'Criar sua conta' })).toBeInTheDocument();
});
