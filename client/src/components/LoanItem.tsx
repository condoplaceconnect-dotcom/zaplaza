import { useState } from 'react';
import type { FC } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertTriangle, CornerDownLeft, Hand } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface LoanDetails {
  id: string;
  status: string;
  agreedReturnDate: string;
  request: { title: string; };
  borrower: { name: string; };
  owner: { name: string; };
}

interface LoanItemProps {
  item: LoanDetails;
  perspective: 'borrower' | 'owner';
  onUpdate: () => void;
}

const statusMap: { [key: string]: { text: string; color: string; icon: FC<any> } } = {
  pending_handover: { text: 'Aguardando Entrega', color: 'bg-yellow-500', icon: Hand },
  active: { text: 'Emprestado (Em Uso)', color: 'bg-blue-500', icon: ArrowRightLeft },
  pending_return_confirmation: { text: 'Aguardando Confirmação de Devolução', color: 'bg-orange-500', icon: CornerDownLeft },
  returned: { text: 'Devolvido', color: 'bg-green-500', icon: CheckCircle },
  disputed: { text: 'Em Disputa', color: 'bg-red-500', icon: AlertTriangle },
};

export const LoanItem: FC<LoanItemProps> = ({ item, perspective, onUpdate }) => {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnCondition, setReturnCondition] = useState<'ok' | 'damaged'>('ok');
  const [returnNotes, setReturnNotes] = useState('');
  const [returnPhotoUrl, setReturnPhotoUrl] = useState('');

  const handleApiCall = async (url: string, method: string, body?: object) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Ação falhou.');
      }
      onUpdate(); // Refresh the parent list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsReturnModalOpen(false); // Close modal on action
    }
  };

  const handleConfirmHandover = () => handleApiCall(`/api/loans/${item.id}/confirm-handover`, 'PATCH');
  const handleConfirmReturnByOwner = () => handleApiCall(`/api/loans/${item.id}/confirm-return`, 'PATCH');
  const handleInitiateReturn = () => {
    const payload = {
        condition: returnCondition,
        notes: returnNotes,
        returnPhotoUrl: returnPhotoUrl,
    };
    handleApiCall(`/api/loans/${item.id}/initiate-return`, 'PATCH', payload);
  };

  const renderActions = () => {
    if (perspective === 'owner') {
      if (item.status === 'pending_handover') {
        return <Button onClick={handleConfirmHandover} disabled={isLoading}>Confirmar Entrega do Item</Button>;
      }
      if (item.status === 'pending_return_confirmation') {
        return <Button onClick={handleConfirmReturnByOwner} disabled={isLoading}>Confirmar Recebimento (Devolução)</Button>;
      }
    }
    if (perspective === 'borrower' && item.status === 'active') {
      return <Button onClick={() => setIsReturnModalOpen(true)} disabled={isLoading}>Iniciar Devolução</Button>;
    }
    return null;
  };

  const statusInfo = statusMap[item.status] || { text: 'Desconhecido', color: 'bg-gray-400', icon: AlertTriangle };
  const StatusIcon = statusInfo.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{item.request.title}</CardTitle>
        <CardDescription>
          {perspective === 'borrower' ? `Emprestado por: ${item.owner.name}` : `Emprestado para: ${item.borrower.name}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Badge className={`${statusInfo.color} hover:${statusInfo.color} text-white`}>
                            <StatusIcon className="h-3 w-3 mr-1.5" />
                            {statusInfo.text}
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent><p>Data de devolução combinada: {new Date(item.agreedReturnDate).toLocaleDateString()}</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </CardContent>
      <CardFooter className="flex justify-end">
        {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : renderActions()}
      </CardFooter>

      {/* Return Modal */}
      <Dialog open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Iniciar Devolução</DialogTitle>
                <DialogDescription>Confirme a condição do item ao devolvê-lo.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Condição do item</Label>
                    <RadioGroup value={returnCondition} onValueChange={(v) => setReturnCondition(v as any)}>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="ok" id="ok" /><Label htmlFor="ok">Devolvido em perfeitas condições</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="damaged" id="damaged" /><Label htmlFor="damaged">Devolvido com avaria/dano</Label></div>
                    </RadioGroup>
                </div>
                {returnCondition === 'damaged' && (
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notas sobre a Avaria</Label>
                        <Input id="notes" value={returnNotes} onChange={e => setReturnNotes(e.target.value)} placeholder="Ex: O cabo soltou, a peça trincou..." />
                        <Label htmlFor="photo">URL da Foto da Avaria</Label>
                        <Input id="photo" value={returnPhotoUrl} onChange={e => setReturnPhotoUrl(e.target.value)} placeholder="https://exemplo.com/avaria.jpg" />
                    </div>
                )}
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                <Button onClick={handleInitiateReturn} disabled={isLoading}>Confirmar Devolução</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
