import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useFamilies } from '@/hooks/useReferenceData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Family } from '@/types/database';

export default function FamiliesManagement() {
  const { data: families = [], isLoading } = useFamilies();
  const queryClient = useQueryClient();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    display_order: 0,
  });

  const resetForm = () => setFormData({ name: '', description: '', display_order: families.length + 1 });

  const handleCreate = async () => {
    if (!formData.name) { toast.error('Le nom est obligatoire'); return; }
    try {
      const { error } = await supabase.from('families').insert([{
        name: formData.name,
        description: formData.description || null,
        display_order: formData.display_order,
      }]);
      if (error) throw error;
      toast.success('Famille créée avec succès');
      queryClient.invalidateQueries({ queryKey: ['families'] });
      setIsCreateOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    }
  };

  const handleEdit = async () => {
    if (!selectedFamily) return;
    try {
      const { error } = await supabase.from('families').update({
        name: formData.name,
        description: formData.description || null,
        display_order: formData.display_order,
      }).eq('id', selectedFamily.id);
      if (error) throw error;
      toast.success('Famille modifiée avec succès');
      queryClient.invalidateQueries({ queryKey: ['families'] });
      setIsEditOpen(false);
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedFamily) return;
    try {
      const { error } = await supabase.from('families').delete().eq('id', selectedFamily.id);
      if (error) throw error;
      toast.success('Famille supprimée');
      queryClient.invalidateQueries({ queryKey: ['families'] });
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    }
  };

  const openEditDialog = (family: Family) => {
    setSelectedFamily(family);
    setFormData({ name: family.name, description: family.description || '', display_order: family.display_order });
    setIsEditOpen(true);
  };

  const filtered = families.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const FamilyForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Nom de la famille *</Label>
        <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: AKPRO" />
      </div>
      <div className="space-y-2">
        <Label>Ordre d'affichage</Label>
        <Input type="number" min={0} value={formData.display_order} onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })} />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Description optionnelle" />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); }}>Annuler</Button>
        <Button onClick={onSubmit} className="btn-primary-gradient">{submitLabel}</Button>
      </DialogFooter>
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Gestion des Grandes Familles</h1>
            <p className="text-muted-foreground mt-1">Les {families.length} grandes familles de l'association</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary-gradient" onClick={resetForm}><Plus className="mr-2 h-4 w-4" />Nouvelle famille</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Créer une famille</DialogTitle></DialogHeader>
              <FamilyForm onSubmit={handleCreate} submitLabel="Créer" />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10"><Users className="h-6 w-6 text-primary" /></div>
                <div>
                  <p className="text-2xl font-bold">{families.length}</p>
                  <p className="text-sm text-muted-foreground">Grandes familles</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher une famille..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader><CardTitle>Liste des familles</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Chargement...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Ordre</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(family => (
                    <TableRow key={family.id}>
                      <TableCell className="font-bold text-primary">{family.display_order}</TableCell>
                      <TableCell className="font-semibold">{family.name}</TableCell>
                      <TableCell className="text-muted-foreground">{family.description || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(family)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setSelectedFamily(family); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Modifier la famille</DialogTitle></DialogHeader>
            <FamilyForm onSubmit={handleEdit} submitLabel="Enregistrer" />
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cette famille ?</AlertDialogTitle>
              <AlertDialogDescription>
                La famille "{selectedFamily?.name}" sera supprimée. Les maisons et membres associés seront affectés.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
