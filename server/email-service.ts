import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email
  };
}

async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail: fromEmail || 'noreply@condoplace.com'
  };
}

export async function sendVerificationEmail(
  to: string, 
  username: string, 
  verificationToken: string
) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    
    const verificationUrl = `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/verify-email/${verificationToken}`;
    
    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: [to],
      subject: 'CondoPlace - Verifique seu email',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .button { 
              display: inline-block; 
              background: #10b981; 
              color: white; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
            }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CondoPlace</h1>
            </div>
            <div class="content">
              <h2>Olá, ${username}!</h2>
              <p>Obrigado por se cadastrar no CondoPlace.</p>
              <p>Para confirmar seu email e ativar sua conta, clique no botão abaixo:</p>
              <center>
                <a href="${verificationUrl}" class="button">Verificar Email</a>
              </center>
              <p>Ou copie e cole este link no seu navegador:</p>
              <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                Se você não criou uma conta no CondoPlace, ignore este email.
              </p>
            </div>
            <div class="footer">
              <p>© 2024 CondoPlace - Marketplace Interno de Condomínios</p>
              <p>Este é um email automático, não responda.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('[EMAIL SERVICE ERROR]', error);
      throw new Error(`Erro ao enviar email: ${error.message}`);
    }

    console.log('[EMAIL SENT]', { to, emailId: data?.id });
    return { success: true, emailId: data?.id };
  } catch (error) {
    console.error('[SEND VERIFICATION EMAIL ERROR]', error);
    throw error;
  }
}

export async function sendWelcomeEmail(to: string, username: string) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    
    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: [to],
      subject: 'Bem-vindo ao CondoPlace!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 CondoPlace</h1>
            </div>
            <div class="content">
              <h2>Bem-vindo, ${username}!</h2>
              <p>Sua conta foi verificada com sucesso.</p>
              <p>Agora você pode aproveitar todas as funcionalidades do CondoPlace:</p>
              <ul>
                <li>🛒 Comprar de lojas do seu condomínio</li>
                <li>🛠️ Contratar serviços de vizinhos</li>
                <li>🏪 Vender ou doar itens no Marketplace</li>
                <li>🔍 Usar o Achados & Perdidos</li>
                <li>📦 Receber entregas internas</li>
              </ul>
              <p style="margin-top: 30px;">
                Qualquer dúvida, estamos à disposição!
              </p>
            </div>
            <div class="footer">
              <p>© 2024 CondoPlace - Marketplace Interno de Condomínios</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('[EMAIL SERVICE ERROR]', error);
      throw new Error(`Erro ao enviar email: ${error.message}`);
    }

    console.log('[WELCOME EMAIL SENT]', { to, emailId: data?.id });
    return { success: true, emailId: data?.id };
  } catch (error) {
    console.error('[SEND WELCOME EMAIL ERROR]', error);
    throw error;
  }
}
