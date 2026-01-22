import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useContributions } from '@/hooks/useContributions';
import { useMembers } from '@/hooks/useMembers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Wallet, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ContributionsPage() {
  const { allContributions, isLoading, stats } = useContributions();
  const { members } = useMembers();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member ? `${member.last_name} ${member.first_name}` : 'Inconnu';
  };

  const filteredContributions = allContributions.filter((contribution) => {
    const memberName = getMemberName(contribution.member_id).toLowerCase();
    const matchesSearch = memberName.includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contribution.status === statusFilter;
    const matchesType = typeFilter === 'all' || contribution.contribution_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'payee':
        return <Badge className="bg-success/10 text-success border-0">Payée</Badge>;
      case 'en_attente':
        return <Badge className="bg-warning/10 text-warning border-0">En attente</Badge>;
      case 'en_retard':
        return <Badge className="bg-destructive/10 text-destructive border-0">En retard</Badge>;
      case 'annulee':
        return <Badge variant="secondary">Annulée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'mensuelle':
        return <Badge variant="outline">Mensuelle</Badge>;
      case 'exceptionnelle':
        return <Badge className="bg-secondary/10 text-secondary border-0">Exceptionnelle</Badge>;
      case 'adhesion':
        return <Badge className="bg-primary/10 text-primary border-0">Adhésion</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold">Cotisations</h1>
            <p className="text-muted-foreground">Gérez les cotisations des membres</p>
          </div>
          <Button asChild className="btn-primary-gradient">
            <Link to="/cotisations/nouveau">
              <Plus className="mr-2 h-4 w-4" />
              Enregistrer paiement
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total collecté</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalCollected)}</p>
                </div>
                <Wallet className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Payées</p>
                  <p className="text-2xl font-bold text-success">{stats.paidCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold text-warning">{stats.pendingCount}</p>
                </div>
                <Clock className="h-8 w-8 text-warning/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En retard</p>
                  <p className="text-2xl font-bold text-destructive">{stats.lateCount}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-destructive/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom de membre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="payee">Payée</SelectItem>
              <SelectItem value="en_attente">En attente</SelectItem>
              <SelectItem value="en_retard">En retard</SelectItem>
              <SelectItem value="annulee">Annulée</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="mensuelle">Mensuelle</SelectItem>
              <SelectItem value="exceptionnelle">Exceptionnelle</SelectItem>
              <SelectItem value="adhesion">Adhésion</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="card-elevated overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membre</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="hidden md:table-cell">Date paiement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : filteredContributions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {search || statusFilter !== 'all' || typeFilter !== 'all'
                      ? 'Aucune cotisation trouvée avec ces critères'
                      : 'Aucune cotisation enregistrée'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredContributions.map((contribution) => (
                  <TableRow key={contribution.id}>
                    <TableCell className="font-medium">
                      <Link 
                        to={`/membres/${contribution.member_id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {getMemberName(contribution.member_id)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {contribution.period_month && contribution.period_year 
                        ? `${contribution.period_month}/${contribution.period_year}`
                        : '-'}
                    </TableCell>
                    <TableCell>{getTypeBadge(contribution.contribution_type)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(contribution.amount)}</TableCell>
                    <TableCell>{getStatusBadge(contribution.status)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {contribution.paid_at 
                        ? format(new Date(contribution.paid_at), 'dd/MM/yyyy', { locale: fr })
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
        
        <p className="text-sm text-muted-foreground">
          {filteredContributions.length} cotisation{filteredContributions.length > 1 ? 's' : ''} trouvée{filteredContributions.length > 1 ? 's' : ''}
        </p>
      </div>
    </AppLayout>
  );
}
