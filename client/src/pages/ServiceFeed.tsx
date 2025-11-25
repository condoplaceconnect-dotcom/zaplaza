import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, AlertCircle, Briefcase } from 'lucide-react';
import type { Service } from '@shared/schema';

export default function ServiceFeed() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuth();

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setError('Authentication required');
      return;
    }

    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/services', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        const data = await response.json();
        setServices(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [token]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-10 w-10 mx-auto text-red-500 mb-2" />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Serviços do Condomínio</h1>
      {services.length === 0 ? (
        <div className="text-center py-16 px-6 border-2 border-dashed rounded-lg">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground">Nenhum serviço oferecido ainda.</h2>
          <p className="text-muted-foreground mt-2">Seja o primeiro a oferecer suas habilidades para a comunidade!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <Card key={service.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>Oferecido por: {service.user?.name || 'Morador'}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
              {/* Future actions like 'View Details' or 'Contact' can go here */}
            </Card>
          ))}
        </div>
      )}
       {/* Floating Action Button to create a new service listing */}
       <Link to="/create-service"> 
        <Button
            className="fixed bottom-24 right-6 h-16 w-16 rounded-full shadow-lg flex items-center justify-center"
            aria-label="Offer new service"
        >
            <Plus className="h-8 w-8" />
        </Button>
       </Link>
    </div>
  );
}
