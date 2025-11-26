import { useEffect, useState } from 'react';
import { useLocation, Redirect } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

// This component handles the email verification process.
export default function VerifyEmailPage() {
    const { setToken } = useAuth();
    const [, setLocation] = useLocation();

    // Get the verification token from the URL query string
    const token = new URLSearchParams(window.location.search).get('token');

    const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setVerificationStatus('error');
            setErrorMessage('Token de verificação não encontrado. Por favor, verifique o link ou tente novamente.');
            return;
        }

        const verifyToken = async () => {
            try {
                // Call the new backend endpoint
                const response = await api.post('/auth/verify-email', { token });
                
                // On success, the backend returns a new JWT.
                const { token: jwtToken } = response.data;
                
                // Set the token in our auth context, logging the user in
                setToken(jwtToken);
                
                setVerificationStatus('success');

            } catch (error: any) {
                setVerificationStatus('error');
                const message = error.response?.data?.error || 'Ocorreu um erro ao verificar seu e-mail. O link pode ter expirado.';
                setErrorMessage(message);
            }
        };

        verifyToken();
    }, [token, setToken]);

    // If verification is successful, redirect to the home page
    if (verificationStatus === 'success') {
        return <Redirect to="/" />;
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
            <div className="max-w-md w-full">
                {verificationStatus === 'verifying' && (
                    <div>
                        <h1 className="text-2xl font-semibold">Verificando sua conta...</h1>
                        <p className="text-muted-foreground mt-2">Aguarde um momento enquanto validamos seu e-mail.</p>
                    </div>
                )}

                {verificationStatus === 'error' && (
                    <div className="bg-destructive/10 border border-destructive/50 text-destructive p-4 rounded-md">
                        <h1 className="text-xl font-semibold">Falha na Verificação</h1>
                        <p className="mt-2">{errorMessage}</p>
                        <button 
                            onClick={() => setLocation('/login')}
                            className="mt-4 underline"
                        >
                            Ir para a página de Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
