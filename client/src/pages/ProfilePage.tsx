import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, Building, Home } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) {
    return <div>Carregando perfil...</div>;
  }

  // Get user initials for the avatar fallback
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-primary/10 p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
              <CardDescription className="text-lg">{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
            <h3 class="text-lg font-semibold border-b pb-2 mb-4">Minhas Informações</h3>
            <div className="flex items-center text-muted-foreground">
                <User className="h-5 w-5 mr-3" />
                <span>{user.username}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
                <Phone className="h-5 w-5 mr-3" />
                <span>{user.phone}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
                <Building className="h-5 w-5 mr-3" />
                <span>Bloco: {user.block}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
                <Home className="h-5 w-5 mr-3" />
                <span>Unidade: {user.unit}</span>
            </div>
        </CardContent>
        <div className="p-6 border-t">
            <Button onClick={logout} variant="destructive" className="w-full">
                Sair (Logout)
            </Button>
        </div>
      </Card>
    </div>
  );
}
