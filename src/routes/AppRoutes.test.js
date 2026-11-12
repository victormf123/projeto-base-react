import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { authenticate } from '../services/authService';

jest.mock('../services/authService', () => ({
  authenticate: jest.fn(),
}));

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.history.replaceState({}, '', '/');
  authenticate.mockReset();
  authenticate.mockResolvedValue(undefined);
});

test('redirects protected pages to login, returns after sign-in, and logs out', async () => {
  window.history.replaceState({}, '', '/cadastro-itens');
  const { unmount } = render(<App />);

  await userEvent.type(
    screen.getByRole('textbox', { name: /e-mail ou usuário/i }),
    'ana.silva@example.com',
  );
  await userEvent.type(screen.getByLabelText('Senha'), 'senha-segura');
  await userEvent.click(screen.getByRole('checkbox', { name: /lembrar-me/i }));
  await userEvent.click(screen.getByRole('button', { name: /^entrar$/i }));

  expect(await screen.findByRole('heading', { name: 'Cadastro de Itens' })).toBeInTheDocument();
  expect(window.localStorage.getItem('projeto-base.auth-user')).toContain(
    'ana.silva@example.com',
  );
  expect(window.localStorage.getItem('projeto-base.auth-user')).not.toContain('senha-segura');

  unmount();
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Cadastro de Itens' })).toBeInTheDocument();

  await userEvent.click(
    screen.getByRole('button', { name: /menu do perfil de ana silva/i }),
  );
  expect(screen.getByRole('menu')).toBeInTheDocument();

  fireEvent.pointerDown(document.body);
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();

  await userEvent.click(
    screen.getByRole('button', { name: /menu do perfil de ana silva/i }),
  );
  await userEvent.click(screen.getByRole('menuitem', { name: 'Sair' }));

  expect(await screen.findByRole('textbox', { name: /e-mail ou usuário/i })).toBeInTheDocument();
  await waitFor(() => {
    expect(window.localStorage.getItem('projeto-base.auth-user')).toBeNull();
    expect(window.sessionStorage.getItem('projeto-base.auth-user')).toBeNull();
  });
});

test('shows the dashboard on the home route after successful login', async () => {
  render(<App />);

  await userEvent.type(
    screen.getByRole('textbox', { name: /e-mail ou usuário/i }),
    'ana@example.com',
  );
  await userEvent.type(screen.getByLabelText('Senha'), 'senha-segura');
  await userEvent.click(screen.getByRole('button', { name: /^entrar$/i }));

  expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /cadastro de itens/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('link', { name: /cadastro de itens/i }));
  expect(await screen.findByRole('heading', { name: 'Cadastro de Itens' })).toBeInTheDocument();
});

test('protects the profile route from unauthenticated users', async () => {
  window.history.replaceState({}, '', '/profile');
  render(<App />);

  expect(await screen.findByRole('heading', { name: 'Boas-vindas de volta' })).toBeInTheDocument();
});
