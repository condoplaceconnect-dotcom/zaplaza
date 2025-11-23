import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UserPlus, Trash2, Edit, AlertCircle, Users } from "lucide-react";

interface Dependent {
  id: string;
  name: string;
  birthDate: string;
  accountType: string;
  relationship: string;
  status: string;
}

export default function FamilyAccountPage() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDependent, setEditingDependent] = useState<Dependent | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    relationship: "",
  });

  const { data: dependents, isLoading } = useQuery<Dependent[]>({
    queryKey: ["/api/family/dependents"],
  });

  const addDependentMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/family/dependents", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/family/dependents"] });
      setIsAddDialogOpen(false);
      setFormData({ name: "", birthDate: "", relationship: "" });
      toast({
        title: "Sucesso",
        description: "Dependente adicionado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar dependente",
        variant: "destructive",
      });
    },
  });

  const updateDependentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      return await apiRequest("PATCH", `/api/family/dependents/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/family/dependents"] });
      setEditingDependent(null);
      setFormData({ name: "", birthDate: "", relationship: "" });
      toast({
        title: "Sucesso",
        description: "Dependente atualizado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar dependente",
        variant: "destructive",
      });
    },
  });

  const deleteDependentMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/family/dependents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/family/dependents"] });
      toast({
        title: "Sucesso",
        description: "Dependente removido com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover dependente",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDependent) {
      updateDependentMutation.mutate({
        id: editingDependent.id,
        data: {
          name: formData.name,
          relationship: formData.relationship,
        },
      });
    } else {
      addDependentMutation.mutate(formData);
    }
  };

  const handleEdit = (dependent: Dependent) => {
    setEditingDependent(dependent);
    setFormData({
      name: dependent.name,
      birthDate: dependent.birthDate || "",
      relationship: dependent.relationship || "",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover este dependente?")) {
      deleteDependentMutation.mutate(id);
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            Conta Família
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus dependentes menores de 18 anos
          </p>
        </div>

        <Dialog open={isAddDialogOpen || !!editingDependent} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setEditingDependent(null);
            setFormData({ name: "", birthDate: "", relationship: "" });
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-dependent">
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar Dependente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingDependent ? "Editar Dependente" : "Adicionar Dependente"}
                </DialogTitle>
                <DialogDescription>
                  {editingDependent
                    ? "Atualize as informações do dependente"
                    : "Adicione um dependente menor de 18 anos à sua conta"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: João Silva"
                    required
                    data-testid="input-dependent-name"
                  />
                </div>

                {!editingDependent && (
                  <div>
                    <Label htmlFor="birthDate">Data de Nascimento *</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                      required
                      data-testid="input-dependent-birthdate"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Dependente deve ter menos de 18 anos
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="relationship">Grau de Parentesco *</Label>
                  <Select
                    value={formData.relationship}
                    onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                    required
                  >
                    <SelectTrigger data-testid="select-relationship">
                      <SelectValue placeholder="Selecione o parentesco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="filho">Filho</SelectItem>
                      <SelectItem value="filha">Filha</SelectItem>
                      <SelectItem value="sobrinho">Sobrinho</SelectItem>
                      <SelectItem value="sobrinha">Sobrinha</SelectItem>
                      <SelectItem value="dependente">Dependente</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingDependent(null);
                    setFormData({ name: "", birthDate: "", relationship: "" });
                  }}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={addDependentMutation.isPending || updateDependentMutation.isPending}
                  data-testid="button-submit-dependent"
                >
                  {editingDependent ? "Atualizar" : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Conta Família:</strong> Adicione e gerencie dependentes menores de 18 anos.
          Você será responsável por aprovar as compras realizadas por eles.
        </AlertDescription>
      </Alert>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando dependentes...</p>
        </div>
      ) : !dependents || dependents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold mb-2">Nenhum dependente cadastrado</p>
            <p className="text-muted-foreground text-center mb-6">
              Adicione dependentes menores de 18 anos para que possam usar o app sob sua supervisão
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dependents.map((dependent) => (
            <Card key={dependent.id} data-testid={`card-dependent-${dependent.id}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{dependent.name}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(dependent)}
                      data-testid={`button-edit-${dependent.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(dependent.id)}
                      data-testid={`button-delete-${dependent.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>{dependent.relationship}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Idade:</span>
                    <span className="font-medium">
                      {calculateAge(dependent.birthDate)} anos
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">
                      {dependent.status === "blocked_until_18" ? "Bloqueado (<18)" : dependent.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
