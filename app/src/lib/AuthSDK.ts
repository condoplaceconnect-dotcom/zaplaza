const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export class AuthSDK {
  async getApprovedCondominiums() {
    const response = await fetch(`${API_URL}/condominiums/approved`);
    if (!response.ok) {
      throw new Error('Failed to fetch condominiums');
    }
    return response.json();
  }

  async register(userData: any, inviteCode: string) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...userData, inviteCode }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    return response.json();
  }

  async login(credentials: any) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    return response.json();
  }
}
