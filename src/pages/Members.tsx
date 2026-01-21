import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useMembers } from '@/hooks/useMembers';
import { useFamilies } from '@/hooks/useReferenceData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Eye, Edit, Phone } from 'lucide-react';

export default function MembersPage() {
  const { members, isLoading } = useMembers();
  const { data: families } = useFamilies();
  const [search, setSearch] = useState('');
  const [familyFilter, setFamilyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredMembers = members.filter((member) => {
    const matchesSearch = 
      member.first_name.toLowerCase().includes(search.toLowerCase()) ||
      member.last_name.toLowerCase().includes(search.toLowerCase()) ||
      member.member_number.toLowerCase().includes(search.toLowerCase());
    
    const matchesFamily = familyFilter === 'all' || member.family_id === familyFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesFamily && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'actif':
        return <Badge className="bg-success/10 text-success border-0">Actif</Badge>;
      case 'inactif':
        return <Badge variant="secondary">Inactif</Badge>;
      case 'sympathisant':
        return <Badge className="bg-info/10 text-info border-0">Sympathisant</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold">Membres</h1>
            <p className="text-muted-foreground">Gérez les membres de l'association</p>
          </div>
          <Button asChild className="btn-primary-gradient">
            <Link to="/membres/nouveau">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau membre
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou numéro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={familyFilter} onValueChange={setFamilyFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Famille" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les familles</SelectItem>
              {families?.map((f) => (
                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="inactif">Inactif</SelectItem>
              <SelectItem value="sympathisant">Sympathisant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="card-elevated overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                <TableHead>Nom complet</TableHead>
                <TableHead className="hidden md:table-cell">Famille</TableHead>
                <TableHead className="hidden lg:table-cell">Zone</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {search || familyFilter !== 'all' || statusFilter !== 'all'
                      ? 'Aucun membre trouvé avec ces critères'
                      : 'Aucun membre enregistré'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-mono text-sm">{member.member_number}</TableCell>
                    <TableCell className="font-medium">
                      {member.last_name} {member.first_name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{member.family?.name}</TableCell>
                    <TableCell className="hidden lg:table-cell capitalize">{member.geographic_zone}</TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {member.phone && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`tel:${member.phone}`}><Phone className="h-4 w-4" /></a>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/membres/${member.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {filteredMembers.length} membre{filteredMembers.length > 1 ? 's' : ''} trouvé{filteredMembers.length > 1 ? 's' : ''}
        </p>
      </div>
    </AppLayout>
  );
}
