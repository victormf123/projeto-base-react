import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { authenticate } from '../../services/authService';
import LoginForm from './LoginForm';

jest.mock('../../services/authService', () => ({
  authenticate: jest.fn(),
}));

const mockedAuthenticate = authenticate as jest.MockedFunction<typeof authenticate>;

beforeEach(() => {
  mockedAuthenticate.mockReset();
  mockedAuthenticate.mockResolvedValue(undefined);
});

test('renders the login fields and remember option', () => {
  render(<LoginForm />);

  expect(screen.getByRole('textbox', { name: /e-mail ou usuário/i })).toBeInTheDocument();
  expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password');
  expect(screen.getByRole('checkbox', { name: /lembrar-me/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^entrar$/i })).toBeInTheDocument();
});

test('shows validation messages for empty fields', async () => {
  render(<LoginForm />);

  await userEvent.click(screen.getByRole('button', { name: /^entrar$/i }));

  expect(await screen.findByText('Informe seu e-mail ou usuário.')).toBeInTheDocument();
  expect(screen.getByText('Informe sua senha.')).toBeInTheDocument();
  expect(mockedAuthenticate).not.toHaveBeenCalled();
});

test('validates email format when the identifier is an email', async () => {
  render(<LoginForm />);

  await userEvent.type(screen.getByRole('textbox', { name: /e-mail ou usuário/i }), 'pessoa@invalido');
  await userEvent.type(screen.getByLabelText('Senha'), 'uma-senha');
  await userEvent.click(screen.getByRole('button', { name: /^entrar$/i }));

  expect(await screen.findByText('Informe um endereço de e-mail válido.')).toBeInTheDocument();
  expect(mockedAuthenticate).not.toHaveBeenCalled();
});

test('toggles password visibility', async () => {
  render(<LoginForm />);

  const passwordInput = screen.getByLabelText('Senha');
  await userEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }));
  expect(passwordInput).toHaveAttribute('type', 'text');
  expect(screen.getByRole('button', { name: 'Ocultar senha' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('shows loading while authenticating and submits the entered credentials', async () => {
  let resolveAuthentication: (() => void) | undefined;
  mockedAuthenticate.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        resolveAuthentication = resolve;
      }),
  );
  render(<LoginForm />);

  await userEvent.type(
    screen.getByRole('textbox', { name: /e-mail ou usuário/i }),
    'pessoa@example.com',
  );
  await userEvent.type(screen.getByLabelText('Senha'), 'senha-segura');
  await userEvent.click(screen.getByRole('checkbox', { name: /lembrar-me/i }));
  await userEvent.click(screen.getByRole('button', { name: /^entrar$/i }));

  const loadingButton = await screen.findByRole('button', { name: /entrando/i });
  expect(loadingButton).toBeDisabled();
  expect(loadingButton).toHaveAttribute('aria-busy', 'true');
  expect(mockedAuthenticate).toHaveBeenCalledWith({
    identifier: 'pessoa@example.com',
    password: 'senha-segura',
    rememberMe: true,
  });

  fireEvent.submit(loadingButton.closest('form') as HTMLFormElement);
  expect(mockedAuthenticate).toHaveBeenCalledTimes(1);

  resolveAuthentication?.();
  await waitFor(() => {
    expect(screen.getByRole('status')).toHaveTextContent(/autenticação simulada concluída/i);
  });
});
