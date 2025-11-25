import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Handshake, MessageSquare, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Offer {
    id: string;
    offerer: {
        id: string;
        name: string;
        block: string;
        unit: string;
    };
}

interface LoanRequestDetails {
    id: string;
    title: string;
    description: string;
    requester: {
        id: string;
        name: string;
        block: string;
        unit: string;
    };
    offers: Offer[];
}

export default function LoanRequestDetailsPage() {
    const { user, token } = useAuth();
    const [, params] = useRoute("/loan-request/:id");
    const requestId = params?.id;

    const [request, setRequest] = useState<LoanRequestDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOffering, setIsOffering] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!token || !requestId) return;
            try {
                const response = await fetch(`/api/loan-requests/${requestId}`, { 
                    headers: { 'Authorization': `Bearer ${token}` } 
                });
                if (!response.ok) throw new Error('Pedido não encontrado.');
                const data = await response.json();
                setRequest(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [token, requestId]);

    const handleOffer = async () => {
        if (!token || !requestId) return;
        setIsOffering(true);
        setError(null);
        try {
            const response = await fetch(`/api/loan-requests/${requestId}/offers`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Não foi possível fazer a oferta.');
            }
            const newOffer = await response.json();
            // Refresh data to show the new offer
            setRequest(prev => prev ? ({ ...prev, offers: [...prev.offers, { id: newOffer.id, offerer: { id: user!.id, name: user!.name, block: user!.block!, unit: user!.unit! } }] }) : null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsOffering(false);
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
    if (!request) return <div className="text-center text-muted-foreground py-8">Pedido não encontrado.</div>;

    const isRequester = user?.id === request.requester.id;
    const hasUserOffered = request.offers.some(offer => offer.offerer.id === user?.id);

    const renderOfferButton = () => {
        if (isRequester || hasUserOffered) return null;
        return (
            <Button onClick={handleOffer} disabled={isOffering} className="w-full sm:w-auto">
                {isOffering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Handshake className="mr-2 h-4 w-4" />} 
                Eu tenho, quero emprestar
            </Button>
        );
    };

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <Link href="/loan-requests-feed" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para os Pedidos
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{request.title}</CardTitle>
                    <CardDescription>
                        Pedido por: <strong>{request.requester.name}</strong> (Bloco: {request.requester.block}, Unidade: {request.requester.unit})
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {request.description && <p>{request.description}</p>}
                    <div className="mt-6 flex justify-end">
                        {renderOfferButton()}
                    </div>
                </CardContent>
            </Card>

            {isRequester && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Ofertas Recebidas</h2>
                    {request.offers.length > 0 ? (
                        <div className="space-y-3">
                            {request.offers.map(offer => (
                                <Card key={offer.id} className="flex justify-between items-center p-4">
                                    <div>
                                        <p className="font-semibold">{offer.offerer.name}</p>
                                        <p className="text-sm text-muted-foreground">Bloco: {offer.offerer.block}, Unidade: {offer.offerer.unit}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm"><MessageSquare className="mr-2 h-4 w-4"/>Chat</Button>
                                        <Link href={`/loan-create-agreement/${offer.id}`}>
                                            <Button size="sm">Aceitar e Formalizar</Button>
                                        </Link>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">Nenhuma oferta recebida ainda.</p>
                    )}
                </div>
            )}
        </div>
    );
}
