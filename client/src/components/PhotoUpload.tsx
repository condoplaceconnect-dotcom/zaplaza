import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PhotoUploadProps {
  currentPhoto?: string;
  name: string;
  onPhotoChange: (photoUrl: string) => void;
}

export default function PhotoUpload({ currentPhoto, name, onPhotoChange }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(currentPhoto);
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onPhotoChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
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

        <div className="flex gap-2">
          <Button variant="outline" asChild data-testid="button-upload-photo">
            <label className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Upload Foto
              <input
                type="file"
                accept="image/*"
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

        <p className="text-sm text-muted-foreground text-center">
          Clique para selecionar uma foto de perfil. Formatos: JPG, PNG
        </p>
      </div>
    </Card>
  );
}
