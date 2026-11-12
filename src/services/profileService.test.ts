import { apiRequest } from './httpClient';
import { updateProfile, type ProfileData } from './profileService';

jest.mock('./httpClient', () => ({
  apiRequest: jest.fn(),
}));

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;
const profileData: ProfileData = {
  fullName: 'Leonardo Silva',
  phone: '11999999999',
  cpf: '12345678909',
  cnpj: '12345678000190',
  address: 'Rua das Flores, 100',
  zipCode: '01001000',
  company: true,
};

beforeEach(() => {
  mockedApiRequest.mockReset();
  mockedApiRequest.mockResolvedValue({ ok: true } as Response);
});

test('sends the exact profile attributes to the authenticated user endpoint', async () => {
  await updateProfile(17, profileData);

  expect(mockedApiRequest).toHaveBeenCalledWith('/profiles/user/17', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });
  const request = mockedApiRequest.mock.calls[0][1];
  const payload = JSON.parse(request?.body as string);
  expect(Object.keys(payload)).toEqual([
    'fullName',
    'phone',
    'cpf',
    'cnpj',
    'address',
    'zipCode',
    'company',
  ]);
  expect(payload.user).toBeUndefined();
});

test('encodes the user id and accepts success responses without a body', async () => {
  mockedApiRequest.mockResolvedValue({ ok: true, status: 204 } as Response);
  await expect(updateProfile('user 1', profileData)).resolves.toBeUndefined();
  expect(mockedApiRequest.mock.calls[0][0]).toBe('/profiles/user/user%201');
});

test('propagates HTTP and network errors', async () => {
  mockedApiRequest.mockResolvedValue({ ok: false, status: 400 } as Response);
  await expect(updateProfile(1, profileData)).rejects.toThrow('Profile update failed.');

  mockedApiRequest.mockRejectedValue(new Error('Network failure'));
  await expect(updateProfile(1, profileData)).rejects.toThrow('Network failure');
});
