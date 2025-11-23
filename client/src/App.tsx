import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation } from "wouter";
import { ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CondoRequest {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  units: number;
  email: string;
  phone: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: Date;
}

export default function AdminCondoApprovalPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [requests, setRequests] = useState<CondoRequest[]>([
    {
      id: '1',
      name: 'Residencial Novo Horizonte',
      address: 'Rua das Flores, 500',
      city: 'São Paulo',
      state: 'SP',
      units: 150,
      email: 'admin@novohorizonte.com',
      phone: '(11) 3456-7890',
      description: 'Condomínio residencial de alto padrão com 15 andares',
      status: 'pending',
      submittedDate: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Condomínio Vila Paradiso',
      address: 'Avenida Paulista, 1200',
      city: 'São Paulo',
      state: 'SP',
      units: 200,
      email: 'contato@vilaparadiso.com',
      phone: '(11) 2345-6789',
      description: 'Condomínio de luxo com áreas de lazer completas',
      status: 'approved',
      submittedDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      name: 'Edifício Manhattan',
      address: 'Rua Augusta, 800',
      city: 'São Paulo',
      state: 'SP',
      units: 120,
      email: 'info@manhattan.com',
      phone: '(11) 1234-5678',
      description: 'Condomínio comercial e residencial',
      status: 'pending',
      submittedDate: new Date(Date.now() - 1 * 60 * 60 * 1000)
    }
  ]);

  const handleApprove = (id: string) => {
    setRequests(requests.map(req =>
      req.id === id ? { ...req, status: 'approved' as const } : req
    ));
    toast({
      title: "Aprovado!",
      description: "Condomínio foi aprovado com sucesso.",
    });
  };

  const handleReject = (id: string) => {
    setRequests(requests.map(req =>
      req.id === id ? { ...req, status: 'rejected' as const } : req
    ));
    toast({
      title: "Rejeitado",
      description: "Solicitação foi rejeitada.",
      variant: "destructive"
    });
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  const RequestCard = ({ request, showActions = true }: { request: CondoRequest; showActions?: boolean }) => (
    <Card className="p-6 mb-4" data-testid={`card-condo-request-${request.id}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold" data-testid={`text-condo-name-${request.id}`}>
            {request.name}
          </h3>
          <p className="text-sm text-muted-foreground">{request.address}, {request.city} - {request.state}</p>
        </div>
        <Badge variant={request.status === 'approved' ? 'default' : request.status === 'rejected' ? 'destructive' : 'secondary'}>
          {request.status === 'approved' ? 'Aprovado' : request.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
        <div>
          <p className="text-muted-foreground">Unidades</p>
          <p className="font-semibold">{request.units}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Email</p>
          <p className="font-semibold text-xs">{request.email}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Telefone</p>
          <p className="font-semibold">{request.phone}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Enviado há</p>
          <p className="font-semibold">
            {Math.floor((Date.now() - request.submittedDate.getTime()) / (1000 * 60))} min
          </p>
        </div>
      </div>

      <p className="text-sm mb-4">{request.description}</p>

      {showActions && request.status === 'pending' && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleReject(request.id)}
            data-testid={`button-reject-${request.id}`}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Rejeitar
          </Button>
          <Button
            className="flex-1"
            onClick={() => handleApprove(request.id)}
            data-testid={`button-approve-${request.id}`}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Aprovar
          </Button>
        </div>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-6">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Gerenciar Cadastros de Condomínios</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Alert className="mb-6">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Total de solicitações: <strong>{requests.length}</strong> | Pendentes: <strong>{pendingRequests.length}</strong>
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" data-testid="tab-pending">
              Pendentes ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="approved" data-testid="tab-approved">
              Aprovados ({approvedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" data-testid="tab-rejected">
              Rejeitados ({rejectedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            {pendingRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Nenhuma solicitação pendente.</p>
              </Card>
            ) : (
              pendingRequests.map(request => (
                <RequestCard key={request.id} request={request} showActions={true} />
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            {approvedRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Nenhum condomínio aprovado ainda.</p>
              </Card>
            ) : (
              approvedRequests.map(request => (
                <RequestCard key={request.id} request={request} showActions={false} />
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            {rejectedRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Nenhuma solicitação rejeitada.</p>
              </Card>
            ) : (
              rejectedRequests.map(request => (
                <RequestCard key={request.id} request={request} showActions={false} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
