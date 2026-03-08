import { useState } from 'react';
import { useExceptionalContributions, ExceptionalContributionFormData } from '@/hooks/useExceptionalContributions';
import { ExceptionalContribution } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2, Loader2, Star } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ExceptionalContributionsWidget() {
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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';

  const resetForm = () => {
    setFormData({ title: '', description: '', amount: 0, due_date: '', is_mandatory: false, is_active: true });
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
  const activeContributions = exceptionalContributions.filter(c => c.is_active);

  return (
    <Card className="card-elevated">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-4 w-4" />
            Cotisations exceptionnelles
          </CardTitle>
          <CardDescription>{activeContributions.length} active(s) sur {exceptionalContributions.length}</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="btn-primary-gradient" onClick={() => handleOpenDialog()}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Ajouter
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
                <Label htmlFor="ec-title">Titre *</Label>
                <Input
                  id="ec-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Décès de M. HOUMBOUANOU Jean"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ec-description">Description</Label>
                <Textarea
                  id="ec-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Détails sur l'événement..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ec-amount">Montant (FCFA) *</Label>
                  <Input
                    id="ec-amount"
                    type="number"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ec-due_date">Date limite</Label>
                  <Input
                    id="ec-due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    id="ec-is_mandatory"
                    checked={formData.is_mandatory}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_mandatory: checked })}
                  />
                  <Label htmlFor="ec-is_mandatory">Obligatoire</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="ec-is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="ec-is_active">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button type="submit" className="btn-primary-gradient" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingItem ? 'Modifier' : 'Créer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : exceptionalContributions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aucune cotisation exceptionnelle</p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {exceptionalContributions.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm truncate">{item.title}</span>
                    {item.is_active ? (
                      <Badge className="bg-success/10 text-success border-0 text-xs">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Terminée</Badge>
                    )}
                    {item.is_mandatory && (
                      <Badge className="bg-warning/10 text-warning border-0 text-xs">Obligatoire</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-semibold text-primary">{formatCurrency(item.amount)}</span>
                    {item.due_date && (
                      <span className="text-xs text-muted-foreground">
                        Échéance: {format(new Date(item.due_date), 'dd MMM yyyy', { locale: fr })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(item)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                          Voulez-vous vraiment supprimer « {item.title} » ? Cette action est irréversible.
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
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
