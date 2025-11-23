import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Lock, CheckCircle, Loader } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  store: string;
}

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Mock cart items
  const cartItems: CartItem[] = [
    { id: '1', name: 'Brigadeiro Gourmet', price: 3.50, quantity: 2, store: 'Doces da Maria' },
    { id: '2', name: 'Pão de Queijo', price: 2.00, quantity: 3, store: 'Lanchonete do Seu José' }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 5.00;
  const tax = subtotal * 0.10; // 10% tax
  const total = subtotal + deliveryFee + tax;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      if (paymentMethod === 'card') {
        // Chamada ao backend para processar pagamento Stripe
        // O backend irá criptografar e tokenizar usando Stripe API
        const response = await fetch('/api/payments/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(total * 100), // Stripe espera cents
            currency: 'brl',
            items: cartItems,
            metadata: {
              vendorCommission: 0, // 0% comissão (100% vendedor)
              appCommission: 0,
            }
          })
        });

        if (!response.ok) {
          throw new Error('Erro ao criar intenção de pagamento');
        }

        const { clientSecret } = await response.json();

        // Aqui seria integrado Stripe Elements ou Stripe.js
        // Por segurança, o cliente usaria clientSecret para completar pagamento
        // Dados de cartão NUNCA deixam o navegador sem criptografia Stripe

        toast({
          title: "Redirecionando para Stripe",
          description: "Você será redirecionado para completar o pagamento de forma segura.",
        });

        // Simular redirecionamento para Stripe
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        // Para PIX, gerar código QR dinâmico via backend
        const response = await fetch('/api/payments/create-pix-qr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: total,
            items: cartItems,
          })
        });

        if (!response.ok) {
          throw new Error('Erro ao gerar código Pix');
        }

        const { qrCode } = await response.json();

        toast({
          title: "QR Code Pix Gerado",
          description: "Escaneie o código para completar o pagamento.",
        });

        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      setCompleted(true);
    } catch (error) {
      toast({
        title: "Erro no Pagamento",
        description: error instanceof Error ? error.message : "Erro ao processar pagamento",
        variant: "destructive"
      });
      setProcessing(false);
    }
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Pagamento Realizado!</h2>
            <p className="text-muted-foreground mb-2">
              Seu pedido foi confirmado com sucesso.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Você receberá um email com os detalhes do pedido. A entrega será feita em breve.
            </p>
            <p className="text-lg font-bold text-primary">
              Total: R$ {total.toFixed(2)}
            </p>
          </div>
          <Button 
            onClick={() => setLocation('/orders')}
            className="w-full"
            data-testid="button-track-order"
          >
            Acompanhar Pedido
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Finalizar Compra</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Resumo do Pedido */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Resumo do Pedido</h2>
              <div className="space-y-3">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm" data-testid={`item-${item.id}`}>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.store} x{item.quantity}</p>
                    </div>
                    <p className="font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Método de Pagamento */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Método de Pagamento</h2>
              
              <div className="space-y-4">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover-elevate" data-testid="option-card">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium">Cartão de Crédito (Stripe)</p>
                    <p className="text-sm text-muted-foreground">Seguro com criptografia PCI Compliant</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover-elevate" data-testid="option-pix">
                  <input
                    type="radio"
                    name="payment"
                    value="pix"
                    checked={paymentMethod === 'pix'}
                    onChange={() => setPaymentMethod('pix')}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium">Pix</p>
                    <p className="text-sm text-muted-foreground">Transferência instantânea com QR Code</p>
                  </div>
                </label>
              </div>

              <Separator className="my-6" />

              {/* Aviso de Segurança */}
              <Alert className="mb-6">
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  ✅ Seus dados de pagamento são processados com segurança através de Stripe (PCI Level 1 Compliant). Dados sensíveis nunca são armazenados no nosso servidor.
                </AlertDescription>
              </Alert>

              <form onSubmit={handlePayment} className="space-y-4">
                {paymentMethod === 'card' ? (
                  <div className="p-4 bg-muted rounded-lg border-2 border-dashed">
                    <p className="text-sm text-muted-foreground text-center">
                      Ao clicar em "Pagar", você será redirecionado para a página segura do Stripe.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-muted rounded-lg border-2 border-dashed">
                    <p className="text-sm text-muted-foreground text-center">
                      Um QR Code Pix será gerado após confirmar o pagamento.
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full mt-4"
                  disabled={processing}
                  data-testid="button-pay"
                >
                  {processing ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    `Pagar R$ ${total.toFixed(2)}`
                  )}
                </Button>
              </form>
            </Card>
          </div>

          {/* Resumo de Preços */}
          <Card className="p-6 h-fit">
            <h3 className="font-semibold mb-4">Total</h3>
            
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxa de Entrega</span>
                <span>R$ {deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Impostos (10%)</span>
                <span>R$ {tax.toFixed(2)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-bold text-base">
                <span>Total para o Vendedor</span>
                <span className="text-primary">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              ✅ <strong>100% do valor</strong> vai para o vendedor. O app não cobra comissão.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
