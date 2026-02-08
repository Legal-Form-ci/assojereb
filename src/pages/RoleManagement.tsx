import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Search, UserCog, Crown, Users, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ROLE_LABELS, AppRole } from '@/types/database';
import { useFamilies } from '@/hooks/useReferenceData';

const ROLES: { value: AppRole; label: string; description: string; color: string }[] = [
  { value: 'admin', label: 'Super Administrateur', description: 'Accès total à la plateforme', color: 'bg-destructive' },
  { value: 'president', label: 'Président', description: 'Accès complet sans modification des rôles', color: 'bg-primary' },
  { value: 'president_adjoint', label: 'Président Adjoint', description: 'Accès global avec restrictions', color: 'bg-primary/80' },
  { value: 'tresorier', label: 'Trésorier', description: 'Gestion des cotisations et finances', color: 'bg-secondary' },
  { value: 'tresorier_adjoint', label: 'Trésorier Adjoint', description: 'Assistance à la gestion financière', color: 'bg-secondary/80' },
  { value: 'commissaire_comptes', label: 'Commissaire aux Comptes', description: 'Audit et lecture seule', color: 'bg-info' },
  { value: 'chef_famille', label: 'Chef de Famille', description: 'Gestion de sa famille uniquement', color: 'bg-success' },
  { value: 'responsable', label: 'Responsable', description: 'Gestion des membres et cotisations', color: 'bg-warning' },
  { value: 'membre', label: 'Membre', description: 'Accès de base', color: 'bg-muted' },
];

export default function RoleManagementPage() {
  const { isAdmin, user } = useAuth();
  const queryClient = useQueryClient();
  const { data: families } = useFamilies();
  
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<AppRole>('membre');
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('');

  // Fetch all user roles with profile info
  const { data: userRoles, isLoading } = useQuery({
    queryKey: ['user-roles-management'],
    queryFn: async () => {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          profiles:user_id (
            full_name,
            user_id
          ),
          families (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return roles;
    },
    enabled: isAdmin,
  });

  // Fetch all profiles for assigning new roles
  const { data: allProfiles } = useQuery({
    queryKey: ['all-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ roleId, role, familyId }: { roleId: string; role: AppRole; familyId?: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role, family_id: familyId || null })
        .eq('id', roleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles-management'] });
      toast.success('Rôle mis à jour avec succès');
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour du rôle');
      console.error(error);
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles-management'] });
      toast.success('Rôle supprimé');
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    },
  });

  const filteredRoles = userRoles?.filter((r) => {
    const name = (r.profiles as any)?.full_name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const getRoleInfo = (role: string) => ROLES.find((r) => r.value === role);

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">Accès restreint</h3>
          <p className="text-muted-foreground">
            Seul le Super Administrateur peut gérer les rôles.
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
            <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Gestion des rôles
            </h1>
            <p className="text-muted-foreground">
              Attribuez et gérez les statuts des utilisateurs
            </p>
          </div>
        </div>

        {/* Role legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hiérarchie des rôles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ROLES.map((role) => (
                <div key={role.value} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                  <Badge className={`${role.color} text-white shrink-0`}>
                    {role.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{role.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search and table */}
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Utilisateurs et rôles</CardTitle>
                <CardDescription>{filteredRoles?.length || 0} utilisateur(s)</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle actuel</TableHead>
                  <TableHead className="hidden md:table-cell">Famille</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredRoles?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoles?.map((ur) => {
                    const roleInfo = getRoleInfo(ur.role);
                    const profile = ur.profiles as any;
                    const family = ur.families as any;
                    
                    return (
                      <TableRow key={ur.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{profile?.full_name || 'Utilisateur'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${roleInfo?.color || 'bg-muted'} text-white border-0`}>
                            {roleInfo?.label || ur.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {family?.name || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(ur);
                                setNewRole(ur.role as AppRole);
                                setSelectedFamilyId(ur.family_id || '');
                                setDialogOpen(true);
                              }}
                            >
                              <UserCog className="h-4 w-4 mr-1" />
                              Modifier
                            </Button>
                            
                            {ur.user_id !== user?.id && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Retirer le rôle</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Voulez-vous vraiment retirer ce rôle ? L'utilisateur n'aura plus accès aux fonctionnalités associées.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteRoleMutation.mutate(ur.id)}
                                      className="bg-destructive text-destructive-foreground"
                                    >
                                      Retirer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-secondary" />
                Modifier le rôle
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nouveau rôle</label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          <span>{role.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(newRole === 'chef_famille' || newRole === 'responsable') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Famille assignée</label>
                  <Select value={selectedFamilyId} onValueChange={setSelectedFamilyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une famille" />
                    </SelectTrigger>
                    <SelectContent>
                      {families?.map((f) => (
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={() => {
                  if (selectedUser) {
                    updateRoleMutation.mutate({
                      roleId: selectedUser.id,
                      role: newRole,
                      familyId: selectedFamilyId || undefined,
                    });
                  }
                }}
                disabled={updateRoleMutation.isPending}
                className="btn-primary-gradient"
              >
                {updateRoleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
