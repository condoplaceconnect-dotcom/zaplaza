import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { User } from '@shared/schema';

// Defina o tipo de retorno para useAuth
interface AuthHook {
  user: User | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  condoId: string | undefined;
  condoStatus: 'approved' | 'pending' | 'rejected' | undefined;
}

// Função para obter o token de autenticação
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const useAuth = (): AuthHook => {
  const token = getAuthToken();

  const { data: user, isLoading } = useQuery<User>(
    {
      queryKey: ['/api/auth/me'],
      queryFn: async () => {
        // Se não houver token, não há necessidade de fazer a requisição
        if (!token) return Promise.resolve(undefined);
        try {
          return await apiRequest('GET', '/api/auth/me');
        } catch (error) {
          // Se a requisição falhar (ex: token inválido), remova o token
          localStorage.removeItem('authToken');
          return Promise.resolve(undefined);
        }
      },
      enabled: !!token, // A query só será executada se houver um token
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1, // Tente novamente apenas uma vez em caso de falha
    }
  );

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const condoStatus = user?.condo?.status as 'approved' | 'pending' | 'rejected' | undefined;
  const condoId = user?.condoId;

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    condoId,
    condoStatus,
  };
};
