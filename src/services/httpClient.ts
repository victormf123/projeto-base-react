const API_BASE_URL = '/api';

export function apiRequest(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, init);
}
