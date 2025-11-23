import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

interface PaymentIntentRequest {
  amount: number;
  currency: string;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
  metadata?: Record<string, unknown>;
}

interface PixQrRequest {
  amount: number;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ✅ ROTA: Criar Payment Intent (Stripe)
  // Isso será integrado com Stripe no futuro
  app.post("/api/payments/create-payment-intent", async (req: Request, res: Response) => {
    try {
      const body: PaymentIntentRequest = req.body;

      // Validar dados
      if (!body.amount || body.amount < 100) { // Stripe mínimo 1 real (100 centavos)
        return res.status(400).json({ error: "Valor inválido" });
      }

      if (!body.currency || body.currency !== "brl") {
        return res.status(400).json({ error: "Moeda inválida" });
      }

      if (!Array.isArray(body.items) || body.items.length === 0) {
        return res.status(400).json({ error: "Items inválidos" });
      }

      // Log de auditoria (não armazenar dados de cartão)
      console.log(`[PAYMENT] Intent criado: R$ ${(body.amount / 100).toFixed(2)}, Items: ${body.items.length}`);

      // IMPORTANTE: Aqui seria chamado Stripe API
      // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      // const paymentIntent = await stripe.paymentIntents.create({
      //   amount: body.amount,
      //   currency: body.currency,
      //   metadata: {
      //     vendorCommission: 0,
      //     appCommission: 0,
      //     orderItems: JSON.stringify(body.items)
      //   }
      // });
      // return res.json({ clientSecret: paymentIntent.client_secret });

      // Mock para desenvolvimento
      const clientSecret = `pi_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      res.json({
        clientSecret,
        status: "requires_payment_method",
        amount: body.amount,
        currency: body.currency
      });
    } catch (error) {
      console.error("[PAYMENT ERROR]", error);
      res.status(500).json({ error: "Erro ao criar intenção de pagamento" });
    }
  });

  // ✅ ROTA: Gerar QR Code Pix
  app.post("/api/payments/create-pix-qr", async (req: Request, res: Response) => {
    try {
      const body: PixQrRequest = req.body;

      // Validar dados
      if (!body.amount || body.amount <= 0) {
        return res.status(400).json({ error: "Valor inválido" });
      }

      if (!Array.isArray(body.items) || body.items.length === 0) {
        return res.status(400).json({ error: "Items inválidos" });
      }

      // Log de auditoria
      console.log(`[PIX] QR Code solicitado: R$ ${body.amount.toFixed(2)}`);

      // IMPORTANTE: Integrar com API Pix (Banco Central ou intermediário como Stripe Pix)
      // const pixQrCode = await generatePixQr({
      //   amount: body.amount,
      //   description: `Pedido com ${body.items.length} itens`,
      //   expiresIn: 600 // 10 minutos
      // });

      // Mock para desenvolvimento
      const qrCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;

      res.json({
        qrCode,
        pixKey: "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426655440000",
        amount: body.amount,
        expiresAt: new Date(Date.now() + 600000).toISOString()
      });
    } catch (error) {
      console.error("[PIX ERROR]", error);
      res.status(500).json({ error: "Erro ao gerar QR Code Pix" });
    }
  });

  // ✅ ROTA: Webhook Stripe (processar eventos de pagamento)
  app.post("/api/webhooks/stripe", async (req: Request, res: Response) => {
    try {
      // IMPORTANTE: Stripe envia signature no header para verificação
      // const signature = req.headers['stripe-signature'] as string;
      // const event = stripe.webhooks.constructEvent(
      //   req.body,
      //   signature,
      //   process.env.STRIPE_WEBHOOK_SECRET!
      // );

      // switch (event.type) {
      //   case 'payment_intent.succeeded':
      //     console.log('Pagamento confirmado:', event.data.object);
      //     // Atualizar banco de dados, enviar email ao vendedor, etc
      //     break;
      //   case 'payment_intent.payment_failed':
      //     console.log('Pagamento falhou:', event.data.object);
      //     break;
      // }

      res.json({ received: true });
    } catch (error) {
      console.error("[WEBHOOK ERROR]", error);
      res.status(400).json({ error: "Webhook error" });
    }
  });

  // ✅ ROTA: Upload de Arquivo (com validações seguras)
  app.post("/api/upload", async (req: Request, res: Response) => {
    try {
      // IMPORTANTE: Usar middleware como multer com validações:
      // const upload = multer({
      //   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      //   fileFilter: (req, file, cb) => {
      //     const fileType = await FileType.fromBuffer(file.buffer);
      //     if (ALLOWED_MIMES.includes(fileType?.mime)) {
      //       cb(null, true);
      //     } else {
      //       cb(new Error('Invalid file type'));
      //     }
      //   }
      // });

      // Armazenar em serviço seguro (S3, Cloudinary, etc)
      // const uploadResult = await cloudinary.uploader.upload(req.file.path);

      // Retornar apenas a URL pública (nunca dados sensíveis)
      res.json({
        url: "https://example-cdn.com/image-hash.jpg",
        success: true
      });
    } catch (error) {
      console.error("[UPLOAD ERROR]", error);
      res.status(400).json({ error: "Erro no upload" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
