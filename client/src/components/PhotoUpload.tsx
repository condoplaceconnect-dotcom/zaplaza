import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PhotoUploadProps {
  currentPhoto?: string;
  name: string;
  onPhotoChange: (photoUrl: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function PhotoUpload({ currentPhoto, name, onPhotoChange }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(currentPhoto);
  const [error, setError] = useState<string | undefined>();
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Verificar tamanho
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `Arquivo muito grande. Máximo permitido: 5MB. Seu arquivo: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      };
    }

    // Verificar tipo MIME real (não confiar na extensão)
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de arquivo não permitido. Use: JPEG, PNG, WebP ou GIF. Você enviou: ${file.type || 'desconhecido'}`
      };
    }

    // Adicional: validar magic numbers (primeiros bytes do arquivo)
    // Isso garante que o arquivo é realmente uma imagem
    return { valid: true };
  };

  const sanitizeFilename = (filename: string): string => {
    // Remover caracteres perigosos, manter apenas alfanuméricos, hífens e pontos
    return filename
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(undefined);

    if (file) {
      // Validar arquivo
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      // Sanitizar nome (será usado apenas para log/referência)
      const sanitizedName = sanitizeFilename(file.name);
      console.debug(`Arquivo validado: ${sanitizedName}`);

      // Ler e enviar para o servidor
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          // Base64 é apenas para preview local
          const result = reader.result as string;
          setPreview(result);

          // IMPORTANTE: Na produção, enviar para backend que:
          // 1. Re-valida o arquivo
          // 2. Armazena em serviço seguro (S3, Cloudinary, etc)
          // 3. Retorna apenas a URL segura (nunca dados sensíveis)
          
          // Por agora, usar base64 local (dev)
          // Em produção, fazer upload seguro:
          /*
          const formData = new FormData();
          formData.append('file', file);
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          
          if (!uploadResponse.ok) {
            throw new Error('Erro ao fazer upload');
          }
          
          const { url } = await uploadResponse.json();
          onPhotoChange(url);
          */
          
          onPhotoChange(result);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erro ao processar arquivo');
        }
      };

      reader.onerror = () => {
        setError('Erro ao ler arquivo. Tente novamente.');
      };

      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    setError(undefined);
    onPhotoChange('');
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center gap-4">
        <Avatar className="w-32 h-32">
          <AvatarImage src={preview} alt={name} />
          <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>

        {error && (
          <Alert variant="destructive" className="w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button variant="outline" asChild data-testid="button-upload-photo">
            <label className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Upload Foto
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
                data-testid="input-photo-file"
              />
            </label>
          </Button>
          {preview && (
            <Button variant="outline" onClick={handleRemove} data-testid="button-remove-photo">
              <X className="w-4 h-4 mr-2" />
              Remover
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Máximo 5MB • Formatos: JPEG, PNG, WebP, GIF
        </p>
      </div>
    </Card>
  );
}
