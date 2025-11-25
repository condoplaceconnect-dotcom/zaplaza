import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, condoId, condoStatus } = useAuth();

  // Enquanto verifica a autenticação, não renderize nada ou mostre um loader
  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse">
            <div className="h-12 w-12 bg-primary rounded-full"></div>
          </div>
        </div>
      );
  }

  // Se não estiver autenticado, redirecione para o login
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // Se estiver autenticado, mas não selecionou um condomínio
  if (!condoId) {
    return <Redirect to="/select-condo" />;
  }

  // Se o condomínio estiver pendente ou rejeitado, redirecione para a página de status
  if (condoStatus === 'pending' || condoStatus === 'rejected') {
    return <Redirect to="/condo-status" />;
  }

  // Se o condomínio for aprovado, permita o acesso à rota
  if (condoStatus === 'approved') {
    return <>{children}</>;
  }

  // Fallback: se o status do condomínio não for claro, impeça o acesso por segurança
  // Isso pode acontecer se houver um atraso na atualização dos dados do usuário
  console.warn('Status do condomínio desconhecido, acesso negado por padrão.');
  return <Redirect to="/login" />;
}
