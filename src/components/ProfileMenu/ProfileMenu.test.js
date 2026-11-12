import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import ProfileMenu from './ProfileMenu';
import { useAuth } from '../../contexts/AuthContext';

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = useAuth;

function CurrentPath() {
  const location = useLocation();
  return <p>Rota: {location.pathname}</p>;
}

test('navigates to profile, keeps other menu options, and preserves logout', async () => {
  const signOut = jest.fn();
  mockedUseAuth.mockReturnValue({ signOut });

  render(
    <MemoryRouter initialEntries={['/']}>
      <ProfileMenu user={{ displayName: 'Ana', identifier: 'ana@example.com' }} />
      <Routes>
        <Route path="*" element={<CurrentPath />} />
      </Routes>
    </MemoryRouter>,
  );

  await userEvent.click(screen.getByRole('button', { name: /menu do perfil/i }));
  expect(screen.getByRole('menuitem', { name: /configurações/i })).toBeInTheDocument();
  expect(screen.getByRole('menuitem', { name: 'Sair' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('menuitem', { name: /meu perfil/i }));
  expect(screen.getByText('Rota: /profile')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /menu do perfil/i }));
  await userEvent.click(screen.getByRole('menuitem', { name: 'Sair' }));
  expect(signOut).toHaveBeenCalledTimes(1);
});
