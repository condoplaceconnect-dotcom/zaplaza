import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, Lock, CheckCircle } from "lucide-react";

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

  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    pixKey: ''
  });

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 5.00;
  const tax = subtotal * 0.10; // 10% tax
  const total = subtotal + deliveryFee + tax;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Validações básicas
    if (paymentMethod === 'card') {
      if (!formData.cardName || !formData.cardNumber || !formData.cardExpiry || !formData.cardCVC) {
        toast({
          title: "Erro",
          description: "Por favor, preencha todos os campos do cartão.",
          variant: "destructive"
        });
        setProcessing(false);
        return;
      }
    } else {
      if (!formData.pixKey) {
        toast({
          title: "Erro",
          description: "Por favor, informe sua chave Pix.",
          variant: "destructive"
        });
        setProcessing(false);
        return;
      }
    }

    // Simular processamento de pagamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Pagamento Confirmado!",
      description: `Seu pedido foi confirmado. Total: R$ ${total.toFixed(2)}`,
    });

    setProcessing(false);
    setCompleted(true);
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
                    <p className="font-medium flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Cartão de Crédito
                    </p>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard, Elo</p>
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
                    <p className="text-sm text-muted-foreground">Transferência instantânea</p>
                  </div>
                </label>
              </div>

              <Separator className="my-6" />

              {/* Formulário de Pagamento */}
              <form onSubmit={handlePayment} className="space-y-4">
                {paymentMethod === 'card' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Nome no Cartão *</Label>
                      <Input
                        id="cardName"
                        placeholder="João Silva"
                        value={formData.cardName}
                        onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                        data-testid="input-card-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Número do Cartão *</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                        data-testid="input-card-number"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardExpiry">Vencimento *</Label>
                        <Input
                          id="cardExpiry"
                          placeholder="MM/AA"
                          value={formData.cardExpiry}
                          onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                          data-testid="input-card-expiry"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardCVC">CVC *</Label>
                        <Input
                          id="cardCVC"
                          placeholder="123"
                          value={formData.cardCVC}
                          onChange={(e) => setFormData({ ...formData, cardCVC: e.target.value })}
                          data-testid="input-card-cvc"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="pixKey">Chave Pix *</Label>
                    <Input
                      id="pixKey"
                      placeholder="seu@email.com ou CPF"
                      value={formData.pixKey}
                      onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                      data-testid="input-pix-key"
                    />
                  </div>
                )}

                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    Seus dados de pagamento são criptografados e seguros.
                  </AlertDescription>
                </Alert>

                <Button 
                  type="submit" 
                  className="w-full mt-4"
                  disabled={processing}
                  data-testid="button-pay"
                >
                  {processing ? 'Processando...' : `Pagar R$ ${total.toFixed(2)}`}
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
                <span>Total</span>
                <span className="text-primary">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              * O aplicativo recebe uma comissão de 10% sobre o subtotal. O restante vai para o vendedor.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
