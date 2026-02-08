import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useHouses, House } from '@/hooks/useHouses';
import { useFamilies } from '@/hooks/useReferenceData';
import { Building2, Plus, Pencil, Trash2, Users, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function HousesManagement() {
  const { houses, isLoading, createHouse, updateHouse, deleteHouse } = useHouses();
  const { data: families = [] } = useFamilies();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [familyFilter, setFamilyFilter] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    name: '',
    house_number: 1,
    description: '',
    family_id: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      house_number: houses.length + 1,
      description: '',
      family_id: '',
    });
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.family_id) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    try {
      await createHouse({
        name: formData.name,
        house_number: formData.house_number,
        description: formData.description || undefined,
        family_id: formData.family_id,
      });
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEdit = async () => {
    if (!selectedHouse) return;

    try {
      await updateHouse(selectedHouse.id, {
        name: formData.name,
        house_number: formData.house_number,
        description: formData.description || null,
        family_id: formData.family_id,
      });
      setIsEditOpen(false);
      setSelectedHouse(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = async () => {
    if (!selectedHouse) return;

    try {
      await deleteHouse(selectedHouse.id);
      setDeleteDialogOpen(false);
      setSelectedHouse(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const openEditDialog = (house: House) => {
    setSelectedHouse(house);
    setFormData({
      name: house.name,
      house_number: house.house_number,
      description: house.description || '',
      family_id: house.family_id || '',
    });
    setIsEditOpen(true);
  };

  const filteredHouses = houses.filter(house => {
    const matchesSearch = 
      house.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      house.house_number.toString().includes(searchTerm);
    const matchesFamily = familyFilter === 'all' || house.family_id === familyFilter;
    return matchesSearch && matchesFamily;
  });

  // Group houses by family
  const housesByFamily = families.map(family => ({
    family,
    houses: filteredHouses.filter(h => h.family_id === family.id),
  })).filter(group => group.houses.length > 0 || familyFilter === group.family.id);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Gestion des Maisons</h1>
            <p className="text-muted-foreground mt-1">
              Les 42 maisons du village organisées par famille
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary-gradient" onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle maison
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle maison</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="house_number">Numéro de maison *</Label>
                  <Input
                    id="house_number"
                    type="number"
                    min={1}
                    value={formData.house_number}
                    onChange={(e) => setFormData({ ...formData, house_number: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la maison *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Maison DJELA OSSOU 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="family">Famille *</Label>
                  <Select 
                    value={formData.family_id}
                    onValueChange={(value) => setFormData({ ...formData, family_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une famille" />
                    </SelectTrigger>
                    <SelectContent>
                      {families.map((family) => (
                        <SelectItem key={family.id} value={family.id}>
                          {family.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description optionnelle de la maison"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreate} className="btn-primary-gradient">
                  Créer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{houses.length}</p>
                  <p className="text-sm text-muted-foreground">Total maisons</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-secondary/10">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{families.length}</p>
                  <p className="text-sm text-muted-foreground">Familles</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-accent">
                  <Building2 className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{(houses.length / families.length).toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Moy. par famille</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une maison..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={familyFilter} onValueChange={setFamilyFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrer par famille" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les familles</SelectItem>
                  {families.map((family) => (
                    <SelectItem key={family.id} value={family.id}>
                      {family.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Houses by Family */}
        {isLoading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="card-elevated animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-32" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {housesByFamily.map(({ family, houses: familyHouses }) => (
              <Card key={family.id} className="card-elevated">
                <CardHeader className="bg-primary/5 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-primary font-serif">{family.name}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      ({familyHouses.length} maisons)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {familyHouses.length === 0 ? (
                    <p className="p-6 text-center text-muted-foreground">
                      Aucune maison dans cette famille
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20">N°</TableHead>
                          <TableHead>Nom</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="w-24">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {familyHouses.map((house) => (
                          <TableRow key={house.id}>
                            <TableCell className="font-bold text-primary">
                              #{house.house_number}
                            </TableCell>
                            <TableCell className="font-medium">{house.name}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {house.description || '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(house)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedHouse(house);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la maison</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_house_number">Numéro de maison *</Label>
                <Input
                  id="edit_house_number"
                  type="number"
                  min={1}
                  value={formData.house_number}
                  onChange={(e) => setFormData({ ...formData, house_number: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_name">Nom de la maison *</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_family">Famille *</Label>
                <Select 
                  value={formData.family_id}
                  onValueChange={(value) => setFormData({ ...formData, family_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une famille" />
                  </SelectTrigger>
                  <SelectContent>
                    {families.map((family) => (
                      <SelectItem key={family.id} value={family.id}>
                        {family.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_description">Description</Label>
                <Textarea
                  id="edit_description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleEdit} className="btn-primary-gradient">
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cette maison ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. La maison "{selectedHouse?.name}" sera 
                définitivement supprimée. Les membres associés ne seront pas supprimés 
                mais perdront leur affectation de maison.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
