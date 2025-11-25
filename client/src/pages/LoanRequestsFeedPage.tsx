import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, PackageSearch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Define the type for a loan request, mirroring the backend structure
interface LoanRequest {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    requester: {
        name: string;
        block: string;
        unit: string;
    };
}

export default function LoanRequestsFeedPage() {
    const { token } = useAuth();
    const [requests, setRequests] = useState<LoanRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRequests = async () => {
            if (!token) {
                setIsLoading(false);
                setError("Autenticação necessária.");
                return;
            }
            try {
                const response = await fetch('/api/loan-requests', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Falha ao buscar pedidos de empréstimo.');
                const data = await response.json();
                setRequests(data);
            } catch (err: any) {
                setError(err.message || "Ocorreu um erro desconhecido.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchRequests();
    }, [token]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 py-8">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Pedidos de Empréstimo da Comunidade</h1>
                <Link href="/create-post">
                    <Button>Preciso de Algo</Button>
                </Link>
            </div>

            {requests.length === 0 ? (
                <div className="text-center py-12 px-6 bg-card border rounded-lg">
                    <PackageSearch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold">Nenhum Pedido no Momento</h2>
                    <p className="text-muted-foreground mt-2">Seja o primeiro a pedir algo emprestado para a comunidade!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map(request => (
                        <Card key={request.id}>
                            <CardHeader>
                                <CardTitle>{request.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {request.description && <p className="text-muted-foreground mb-4">{request.description}</p>}
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <span>Pedido por: <strong>{request.requester.name}</strong></span>
                                    <span className="mx-2">|</span>
                                    <span>Unidade: <Badge variant="secondary">{request.requester.block}-{request.requester.unit}</Badge></span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Link href={`/loan-request/${request.id}`}>
                                    <Button>Ver Detalhes e Ofertar</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
