import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useExceptionalContributions, ExceptionalContributionFormData } from '@/hooks/useExceptionalContributions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Calendar, Wallet, Edit, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ExceptionalContribution } from '@/types/database';

export default function ExceptionalContributionsPage() {
  const { isAdmin } = useAuth();
  const { exceptionalContributions, isLoading, createExceptionalContribution, updateExceptionalContribution, deleteExceptionalContribution } = useExceptionalContributions();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExceptionalContribution | null>(null);
  const [formData, setFormData] = useState<ExceptionalContributionFormData>({
    title: '',
    description: '',
    amount: 0,
    due_date: '',
    is_mandatory: false,
    is_active: true,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      amount: 0,
      due_date: '',
      is_mandatory: false,
      is_active: true,
    });
    setEditingItem(null);
  };

  const handleOpenDialog = (item?: ExceptionalContribution) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description || '',
        amount: item.amount,
        due_date: item.due_date || '',
        is_mandatory: item.is_mandatory,
        is_active: item.is_active,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      await updateExceptionalContribution.mutateAsync({ id: editingItem.id, ...formData });
    } else {
      await createExceptionalContribution.mutateAsync(formData);
    }
    
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await deleteExceptionalContribution.mutateAsync(id);
  };

  const isPending = createExceptionalContribution.isPending || updateExceptionalContribution.isPending;

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">Accès restreint</h3>
          <p className="text-muted-foreground">
            Seuls les administrateurs peuvent gérer les cotisations exceptionnelles.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold">Cotisations exceptionnelles</h1>
            <p className="text-muted-foreground">Gérez les événements spéciaux (décès, mariages, projets...)</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary-gradient" onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle cotisation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-serif">
                  {editingItem ? 'Modifier la cotisation' : 'Nouvelle cotisation exceptionnelle'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Décès de M. HOUMBOUANOU Jean"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Détails sur l'événement..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Montant (FCFA) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Date limite</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_mandatory"
                      checked={formData.is_mandatory}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_mandatory: checked })}
                    />
                    <Label htmlFor="is_mandatory">Obligatoire</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" className="btn-primary-gradient" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingItem ? 'Modifier' : 'Créer'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total cotisations</p>
                  <p className="text-2xl font-bold">{exceptionalContributions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-success/10">
                  <Calendar className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Actives</p>
                  <p className="text-2xl font-bold">{exceptionalContributions.filter(c => c.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-warning/10">
                  <Wallet className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Montant total</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(exceptionalContributions.reduce((sum, c) => sum + c.amount, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Liste des cotisations exceptionnelles</CardTitle>
            <CardDescription>Gérez les collectes pour événements spéciaux</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead className="hidden md:table-cell">Date limite</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : exceptionalContributions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Aucune cotisation exceptionnelle
                    </TableCell>
                  </TableRow>
                ) : (
                  exceptionalContributions.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        {formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {item.due_date 
                          ? format(new Date(item.due_date), 'dd MMM yyyy', { locale: fr })
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {item.is_active ? (
                            <Badge className="bg-success/10 text-success border-0">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Terminée</Badge>
                          )}
                          {item.is_mandatory && (
                            <Badge className="bg-warning/10 text-warning border-0">Obligatoire</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleOpenDialog(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Voulez-vous vraiment supprimer cette cotisation exceptionnelle ?
                                  Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(item.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
