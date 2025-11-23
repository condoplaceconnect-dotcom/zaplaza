// Auth utilities and token management
export interface AuthToken {
  userId: string;
  username: string;
  role: 'user' | 'vendor' | 'driver' | 'admin';
  iat: number;
  exp: number;
}

const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

export const authUtils = {
  // Armazenar token seguramente (mem + sessionStorage para dev)
  setToken: (token: string, expiresIn: number = 3600) => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(TOKEN_KEY, token);
    const expiryTime = Date.now() + expiresIn * 1000;
    sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    const token = sessionStorage.getItem(TOKEN_KEY);
    const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (!token || !expiry) return null;
    
    // Verificar expiração
    if (Date.now() > parseInt(expiry)) {
      authUtils.clearToken();
      return null;
    }
    
    return token;
  },

  clearToken: () => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
  },

  isTokenValid: (): boolean => {
    return authUtils.getToken() !== null;
  },

  // Fazer requisições autenticadas
  authenticatedFetch: async (url: string, options: RequestInit = {}) => {
    const token = authUtils.getToken();
    
    if (!token) {
      throw new Error('Não autenticado');
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    // Se token expirou (401), limpar e redirecionar
    if (response.status === 401) {
      authUtils.clearToken();
      window.location.href = '/login';
      throw new Error('Sessão expirada');
    }

    return response;
  }
};
