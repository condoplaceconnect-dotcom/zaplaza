import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from '@/components/ui/use-toast';
import { publicSDK } from '@/lib/public-sdk'; // Correctly import the public SDK

interface Condominium {
    id: string;
    name: string;
    address: string;
}

export default function CondoSelectionPage() {
    const [, setLocation] = useLocation();
    const [condos, setCondos] = useState<Condominium[]>([]);
    const [selectedCondo, setSelectedCondo] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCondos = async () => {
            try {
                // Use the publicSDK to get approved condominiums
                const approvedCondos = await publicSDK.listApprovedCondominiums(); 
                setCondos(approvedCondos);
            } catch (error) { 
                console.error("Failed to fetch condominiums:", error);
                toast({
                    title: "Erro ao buscar condomínios",
                    description: "Não foi possível carregar la lista de condomínios. Tente novamente mais tarde.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchCondos();
    }, []);

    const handleContinue = () => {
        if (!selectedCondo) {
            toast({
                title: "Nenhum condomínio selecionado",
                description: "Por favor, selecione um condomínio para continuar.",
                variant: "destructive",
            });
            return;
        }
        // Redirect to the registration page with the selected condo ID
        setLocation(`/register?condoId=${selectedCondo}`);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Bem-vindo ao Zaplaza!</CardTitle>
                    <CardDescription>Para começar, selecione o seu condomínio na lista abaixo.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Carregando condomínios...</p>
                    ) : (
                        <Select onValueChange={setSelectedCondo} value={selectedCondo}>
                            <SelectTrigger data-testid="select-condo">
                                <SelectValue placeholder="Selecione seu condomínio" />
                            </SelectTrigger>
                            <SelectContent>
                                {condos.map((condo) => (
                                    <SelectItem key={condo.id} value={condo.id}>
                                        {condo.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={handleContinue} className="w-full" disabled={!selectedCondo || loading} data-testid="button-continue">
                        Continuar
                    </Button>
                </CardFooter>
            </Card>

             <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                    Não encontrou seu condomínio?{' '}
                    <button
                        type="button"
                        onClick={() => setLocation('/register-condo')}
                        className="underline hover:text-primary"
                         data-testid="button-request-new-condo"
                    >
                        Solicite o registro.
                    </button>
                </p>
            </div>
        </div>
    );
}
