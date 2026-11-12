import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from './ProfilePage';
import { updateProfile } from '../services/profileService';

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../services/profileService', () => ({
  updateProfile: jest.fn(),
}));

const mockedUseAuth = jest.requireMock('../contexts/AuthContext').useAuth as jest.Mock;
const mockedUpdateProfile = updateProfile as jest.MockedFunction<typeof updateProfile>;

beforeEach(() => {
  mockedUseAuth.mockReturnValue({
    user: { id: 21, identifier: 'ana@example.com', displayName: 'Ana' },
    signIn: jest.fn(),
    signOut: jest.fn(),
  });
  mockedUpdateProfile.mockReset();
  mockedUpdateProfile.mockResolvedValue(undefined);
});

test('renders personal and business sections without fictitious profile data', () => {
  render(<ProfilePage />);

  expect(screen.getByRole('heading', { name: 'Meu perfil' })).toBeInTheDocument();
  expect(screen.getByLabelText('Nome completo')).toHaveValue('');
  expect(screen.getByText(/não estão disponíveis na sessão/i)).toBeInTheDocument();
  expect(screen.queryByLabelText('CNPJ')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Endereço')).toBeInTheDocument();
  expect(screen.getByLabelText('CEP')).toBeInTheDocument();
});

test('shows business fields when company is selected and hides them when deselected', async () => {
  render(<ProfilePage />);

  await userEvent.click(screen.getByRole('checkbox', { name: 'Possui empresa?' }));
  expect(screen.getByLabelText('CNPJ')).toBeInTheDocument();
  expect(screen.getByLabelText('Endereço')).toBeInTheDocument();
  expect(screen.getByLabelText('CEP')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('checkbox', { name: 'Possui empresa?' }));
  expect(screen.queryByLabelText('CNPJ')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Endereço')).toBeInTheDocument();
  expect(screen.getByLabelText('CEP')).toBeInTheDocument();
});

test('validates required name, CPF, CNPJ, CEP, and does not send an invalid form', async () => {
  render(<ProfilePage />);

  await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
  expect(await screen.findByText('Informe seu nome completo.')).toBeInTheDocument();

  await userEvent.type(screen.getByLabelText('Nome completo'), 'Ana Silva');
  await userEvent.type(screen.getByLabelText('CPF'), '11111111111');
  await userEvent.click(screen.getByRole('checkbox', { name: 'Possui empresa?' }));
  await userEvent.type(screen.getByLabelText('CNPJ'), '11111111111111');
  await userEvent.type(screen.getByLabelText('CEP'), '1234567');
  await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

  expect(screen.getByText('Informe um CPF válido.')).toBeInTheDocument();
  expect(screen.getByText('Informe um CNPJ válido.')).toBeInTheDocument();
  expect(screen.getByText('Informe um CEP com oito dígitos.')).toBeInTheDocument();
  expect(mockedUpdateProfile).not.toHaveBeenCalled();
});

test('rejects a phone number that is not in a Brazilian phone format', async () => {
  render(<ProfilePage />);

  await userEvent.type(screen.getByLabelText('Nome completo'), 'Ana Silva');
  await userEvent.type(screen.getByLabelText('Telefone'), '1191234567');
  await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

  expect(await screen.findByText('Informe um telefone com DDD válido.')).toBeInTheDocument();
  expect(mockedUpdateProfile).not.toHaveBeenCalled();
});

test('uses the authenticated user id and sends a normalized profile payload', async () => {
  render(<ProfilePage />);

  await userEvent.type(screen.getByLabelText('Nome completo'), ' Ana Silva ');
  await userEvent.type(screen.getByLabelText('Telefone'), '11999999999');
  await userEvent.type(screen.getByLabelText('CPF'), '52998224725');
  await userEvent.click(screen.getByRole('checkbox', { name: 'Possui empresa?' }));
  await userEvent.type(screen.getByLabelText('CNPJ'), '11222333000181');
  await userEvent.type(screen.getByLabelText('Endereço'), ' Rua das Flores ');
  await userEvent.type(screen.getByLabelText('CEP'), '01001000');
  await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

  await waitFor(() => {
    expect(mockedUpdateProfile).toHaveBeenCalledWith(21, {
      fullName: 'Ana Silva',
      phone: '11999999999',
      cpf: '52998224725',
      cnpj: '11222333000181',
      address: 'Rua das Flores',
      zipCode: '01001000',
      company: true,
    });
  });
  expect(await screen.findByRole('status')).toHaveTextContent(
    'Perfil atualizado com sucesso!',
  );
});

test('preserves address fields when company is false and permits retry after failure', async () => {
  mockedUpdateProfile.mockRejectedValueOnce(new Error('failure'));
  render(<ProfilePage />);

  await userEvent.type(screen.getByLabelText('Nome completo'), 'Ana Silva');
  await userEvent.type(screen.getByLabelText('Telefone'), '11999999999');
  await userEvent.type(screen.getByLabelText('CPF'), '52998224725');
  await userEvent.type(screen.getByLabelText('Endereço'), 'Rua das Flores');
  await userEvent.type(screen.getByLabelText('CEP'), '01001000');
  await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Não foi possível atualizar seu perfil. Verifique os dados informados e tente novamente.',
  );
  expect(screen.getByLabelText('Nome completo')).toHaveValue('Ana Silva');
  expect(mockedUpdateProfile).toHaveBeenLastCalledWith(21, {
    fullName: 'Ana Silva',
    phone: '11999999999',
    cpf: '52998224725',
    cnpj: null,
    address: 'Rua das Flores',
    zipCode: '01001000',
    company: false,
  });

  mockedUpdateProfile.mockResolvedValueOnce(undefined);
  await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
  await waitFor(() =>
    expect(screen.getByRole('status')).toHaveTextContent('Perfil atualizado com sucesso!'),
  );
});

test('prevents duplicate submissions while waiting and cancel restores the last saved form', async () => {
  let resolveUpdate: (() => void) | undefined;
  mockedUpdateProfile.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      }),
  );
  render(<ProfilePage />);

  await userEvent.type(screen.getByLabelText('Nome completo'), 'Ana Silva');
  await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
  expect(await screen.findByRole('status')).toHaveTextContent('Salvando alterações...');
  fireEvent.submit(screen.getByRole('button', { name: 'Salvar alterações' }).closest('form')!);
  expect(mockedUpdateProfile).toHaveBeenCalledTimes(1);

  resolveUpdate?.();
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Perfil atualizado'));
  await userEvent.clear(screen.getByLabelText('Nome completo'));
  await userEvent.type(screen.getByLabelText('Nome completo'), 'Outro nome');
  await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(screen.getByLabelText('Nome completo')).toHaveValue('Ana Silva');
});

test('does not call the API when the authenticated context has no user id', async () => {
  mockedUseAuth.mockReturnValue({
    user: { identifier: 'ana@example.com', displayName: 'Ana' },
    signIn: jest.fn(),
    signOut: jest.fn(),
  });
  render(<ProfilePage />);

  await userEvent.type(screen.getByLabelText('Nome completo'), 'Ana Silva');
  await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Não foi possível atualizar seu perfil.',
  );
  expect(mockedUpdateProfile).not.toHaveBeenCalled();
});
