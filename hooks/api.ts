import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://ing-default-financedocin-b81cf-108864784-1b9b414f3253.kr.lb.naverncp.com';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  try {
    const token = await SecureStore.getItemAsync('accessToken');

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}), 
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    return await response.json();
  } catch (err) {
    throw err;
  }
}
