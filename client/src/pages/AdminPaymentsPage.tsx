import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, DollarSign, TrendingUp, Users } from "lucide-react";
import StatsCard from "@/components/StatsCard";

interface Transaction {
  id: string;
  vendorName: string;
  orderId: string;
  orderValue: number;
  vendorEarnings: number;
  status: 'completed' | 'pending' | 'paid';
  date: Date;
}

interface VendorPayment {
  id: string;
  name: string;
  type: 'store' | 'service';
  totalEarnings: number;
  pendingPayment: number;
  lastPayment?: Date;
  status: 'active' | 'pending-approval';
}

export default function AdminPaymentsPage() {
  const [, setLocation] = useLocation();

  const [transactions] = useState<Transaction[]>([
    // As transações aparecerão aqui quando os vendedores começarem a receber pedidos
  ]);

  const [vendorPayments] = useState<VendorPayment[]>([
    // Os vendedores registrados aparecerão aqui
  ]);

  const totalRevenue = transactions.reduce((sum, t) => sum + t.orderValue, 0);
  const totalVendorPayments = transactions.reduce((sum, t) => sum + t.vendorEarnings, 0);
  const totalPendingPayments = vendorPayments.reduce((sum, v) => sum + v.pendingPayment, 0);

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
          <h1 className="text-xl font-bold">Gerenciar Pagamentos</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <AlertDescription className="text-green-900 dark:text-green-200">
            ✅ <strong>Política de Pagamento: 100% para Vendedores</strong><br/>
            O aplicativo não cobra comissão. 100% do valor de cada transação é repassado ao vendedor.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatsCard 
            icon={DollarSign} 
            label="Faturamento Total" 
            value={`R$ ${totalRevenue.toFixed(2)}`}
            iconColor="text-green-600"
          />
          <StatsCard 
            icon={TrendingUp} 
            label="Repassado a Vendedores" 
            value={`R$ ${totalVendorPayments.toFixed(2)}`}
            iconColor="text-primary"
          />
          <StatsCard 
            icon={Users} 
            label="Pagamentos Pendentes" 
            value={`R$ ${totalPendingPayments.toFixed(2)}`}
            iconColor="text-accent"
          />
        </div>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions" data-testid="tab-transactions">
              Transações
            </TabsTrigger>
            <TabsTrigger value="vendors" data-testid="tab-vendors">
              Pagamentos a Vendedores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-6 space-y-4">
            <Alert>
              <AlertDescription>
                <strong>100% do valor</strong> de cada transação vai para o vendedor. O aplicativo não retém comissão.
              </AlertDescription>
            </Alert>

            {transactions.map(transaction => (
              <Card key={transaction.id} className="p-4" data-testid={`card-transaction-${transaction.id}`}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div>
                    <p className="font-semibold" data-testid={`text-vendor-${transaction.id}`}>
                      {transaction.vendorName}
                    </p>
                    <p className="text-sm text-muted-foreground">{transaction.orderId}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Valor da Transação</p>
                    <p className="font-semibold">R$ {transaction.orderValue.toFixed(2)}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Para Vendedor (100%)</p>
                    <p className="font-semibold text-green-600">R$ {transaction.vendorEarnings.toFixed(2)}</p>
                  </div>

                  <div className="text-right">
                    <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                      {transaction.status === 'completed' ? 'Concluído' : transaction.status === 'pending' ? 'Pendente' : 'Pago'}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="vendors" className="mt-6 space-y-4">
            {vendorPayments.map(payment => (
              <Card key={payment.id} className="p-6" data-testid={`card-vendor-${payment.id}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg" data-testid={`text-vendor-name-${payment.id}`}>
                      {payment.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {payment.type === 'store' ? 'Loja' : 'Prestador de Serviço'}
                    </p>
                  </div>
                  <Badge variant={payment.status === 'active' ? 'default' : 'secondary'}>
                    {payment.status === 'active' ? 'Ativo' : 'Pendente Aprovação'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Ganho Total</p>
                    <p className="font-semibold text-lg">R$ {payment.totalEarnings.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pendente de Pagamento</p>
                    <p className="font-semibold text-lg text-accent">R$ {payment.pendingPayment.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Último Pagamento</p>
                    <p className="font-semibold">
                      {payment.lastPayment?.toLocaleDateString('pt-BR') || 'Nunca'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    data-testid={`button-view-details-${payment.id}`}
                  >
                    Ver Detalhes
                  </Button>
                  <Button 
                    className="flex-1"
                    data-testid={`button-process-payment-${payment.id}`}
                  >
                    Processar Pagamento
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
