import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, FileCheck2, Camera, ArrowLeft } from 'lucide-react';

const defaultTerm = `Eu, o solicitante, concordo em receber o item emprestado e me comprometo a devolvê-lo na data combinada e nas mesmas condições em que o recebi, ressalvado o desgaste natural. Estou ciente de que, conforme os artigos 579 a 585 do Código Civil (Comodato), sou responsável por qualquer dano ou perda do item.`;

export default function LoanCreateAgreementPage() {
    const { token } = useAuth();
    const [, params] = useRoute("/loan-create-agreement/:offerId");
    const [, setLocation] = useLocation();
    const offerId = params?.offerId;

    const [agreedReturnDate, setAgreedReturnDate] = useState('');
    const [digitalTerm, setDigitalTerm] = useState(defaultTerm);
    const [handoverPhotoUrl, setHandoverPhotoUrl] = useState(''); // Placeholder for photo upload
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreedReturnDate || !digitalTerm || !handoverPhotoUrl) {
            setError('Todos os campos são obrigatórios, incluindo a URL da foto.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/loans/agreements', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    offerId, 
                    agreedReturnDate,
                    digitalTerm,
                    handoverPhotoUrl
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Não foi possível formalizar o acordo.');
            }

            setLocation('/my-loans');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <a href="#" onClick={() => window.history.back()} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </a>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><FileCheck2 className="mr-2"/> Formalizar Empréstimo</CardTitle>
                    <CardDescription>Este é o passo final para garantir a segurança de todos. Preencha os detalhes do acordo.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="returnDate">Data de Devolução Combinada</Label>
                            <Input id="returnDate" type="date" value={agreedReturnDate} onChange={e => setAgreedReturnDate(e.target.value)} required />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="photoUrl">URL da Foto do Item (Entregue pelo Dono)</Label>
                            <div className="flex items-center gap-2">
                                <Camera className="h-5 w-5 text-muted-foreground"/>
                                <Input id="photoUrl" type="text" value={handoverPhotoUrl} onChange={e => setHandoverPhotoUrl(e.target.value)} placeholder="https://exemplo.com/foto.jpg" required />
                            </div>
                            <p className="text-xs text-muted-foreground">NOTA: Por enquanto, cole a URL da imagem. O upload direto será implementado em breve.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="terms">Termo de Responsabilidade Digital</Label>
                            <Textarea id="terms" value={digitalTerm} onChange={e => setDigitalTerm(e.target.value)} rows={8} required />
                            <p className="text-xs text-muted-foreground">Este termo é baseado no Código Civil e serve como garantia para ambas as partes.</p>
                        </div>

                        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Aceitar Termo e Finalizar Acordo'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
