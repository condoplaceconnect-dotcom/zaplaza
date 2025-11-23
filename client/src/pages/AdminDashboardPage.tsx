import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, Home, Store, LogOut } from "lucide-react";

export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Home className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="residents" data-testid="tab-residents">
              <Users className="w-4 h-4 mr-2" />
              Moradores
            </TabsTrigger>
            <TabsTrigger value="stores" data-testid="tab-stores">
              <Store className="w-4 h-4 mr-2" />
              Lojas
            </TabsTrigger>
            <TabsTrigger value="communications" data-testid="tab-comms">
              Comunicados
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground">Moradores</h3>
                <p className="text-3xl font-bold mt-2">145</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground">Lojas Ativas</h3>
                <p className="text-3xl font-bold mt-2">12</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground">Serviços</h3>
                <p className="text-3xl font-bold mt-2">8</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground">Pedidos Hoje</h3>
                <p className="text-3xl font-bold mt-2">24</p>
              </Card>
            </div>
          </TabsContent>

          {/* RESIDENTS */}
          <TabsContent value="residents" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Gerenciar Moradores</h2>
              <p className="text-muted-foreground">Funcionalidade de gerenciamento de moradores em desenvolvimento</p>
            </Card>
          </TabsContent>

          {/* STORES */}
          <TabsContent value="stores" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Gerenciar Lojas</h2>
              <p className="text-muted-foreground">Funcionalidade de gerenciamento de lojas em desenvolvimento</p>
            </Card>
          </TabsContent>

          {/* COMMUNICATIONS */}
          <TabsContent value="communications" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Comunicados</h2>
              <p className="text-muted-foreground">Funcionalidade de comunicados em desenvolvimento</p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
