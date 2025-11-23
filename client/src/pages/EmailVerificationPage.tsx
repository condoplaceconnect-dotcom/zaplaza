import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EmailVerificationPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Token de verificação não encontrado na URL");
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email/${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Email verificado com sucesso!");
          toast({
            title: "Sucesso!",
            description: "Seu email foi verificado. Você já pode usar todos os recursos do CondoPlace.",
          });
          setTimeout(() => {
            setLocation("/");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Erro ao verificar email");
        }
      } catch (error) {
        console.error("[VERIFY EMAIL ERROR]", error);
        setStatus("error");
        setMessage("Erro ao verificar email. Tente novamente.");
      }
    };

    verifyEmail();
  }, [toast, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-white">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && (
              <Loader2 className="h-16 w-16 text-green-600 animate-spin" data-testid="icon-loading" />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-16 w-16 text-green-600" data-testid="icon-success" />
            )}
            {status === "error" && (
              <XCircle className="h-16 w-16 text-red-600" data-testid="icon-error" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Verificando email..."}
            {status === "success" && "Email Verificado!"}
            {status === "error" && "Erro na Verificação"}
          </CardTitle>
          <CardDescription data-testid="text-message">
            {status === "loading" && "Aguarde enquanto verificamos seu email."}
            {status === "success" && message}
            {status === "error" && message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {status === "success" && (
            <p className="text-sm text-center text-muted-foreground">
              Redirecionando para a página inicial em 3 segundos...
            </p>
          )}
          {status === "error" && (
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => setLocation("/login")} 
                variant="default"
                className="w-full"
                data-testid="button-go-to-login"
              >
                <Mail className="w-4 h-4 mr-2" />
                Ir para Login
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="w-full"
                data-testid="button-try-again"
              >
                Tentar Novamente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
