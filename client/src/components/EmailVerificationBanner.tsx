import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, X, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailVerificationBannerProps {
  emailVerified: boolean;
}

export function EmailVerificationBanner({ emailVerified }: EmailVerificationBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);
  const { toast } = useToast();

  if (emailVerified || dismissed) {
    return null;
  }

  const handleResendEmail = async () => {
    setResending(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada.",
        });
      } else {
        toast({
          title: "Erro",
          description: data.error || "Não foi possível reenviar o email",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("[RESEND EMAIL ERROR]", error);
      toast({
        title: "Erro",
        description: "Erro ao reenviar email de verificação",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <Alert className="border-yellow-600 bg-yellow-50 text-yellow-900 mb-4" data-testid="alert-verify-email">
      <div className="flex items-start gap-3">
        <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <AlertDescription className="flex flex-col gap-2">
            <p className="font-medium">Verifique seu email para ativar sua conta</p>
            <p className="text-sm">
              Enviamos um link de verificação para seu email. Clique no link para ativar todos os recursos.
            </p>
            <div className="flex gap-2 mt-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleResendEmail}
                disabled={resending}
                className="bg-white hover:bg-yellow-100"
                data-testid="button-resend-email"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-3 h-3 mr-1" />
                    Reenviar Email
                  </>
                )}
              </Button>
            </div>
          </AlertDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-yellow-100"
          onClick={() => setDismissed(true)}
          data-testid="button-dismiss-banner"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}
