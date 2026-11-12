import { apiRequest } from './httpClient';

export type ProfileData = {
  fullName: string;
  phone: string;
  cpf: string;
  cnpj: string | null;
  address: string | null;
  zipCode: string | null;
  company: boolean;
};

export async function updateProfile(userId: string | number, profileData: ProfileData): Promise<void> {
  const response = await apiRequest(`/profiles/user/${encodeURIComponent(String(userId))}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fullName: profileData.fullName,
      phone: profileData.phone,
      cpf: profileData.cpf,
      cnpj: profileData.cnpj,
      address: profileData.address,
      zipCode: profileData.zipCode,
      company: profileData.company,
    }),
  });

  if (!response.ok) {
    throw new Error('Profile update failed.');
  }
}
