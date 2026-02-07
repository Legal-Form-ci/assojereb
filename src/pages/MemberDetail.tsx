import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useMember } from '@/hooks/useMembers';
import { useContributions } from '@/hooks/useContributions';
import { MemberCardPDF } from '@/components/MemberCardPDF';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Wallet,
  Plus,
  Edit,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: member, isLoading: memberLoading } = useMember(id);
  const { contributions, isLoading: contributionsLoading } = useContributions(id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

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

  const getContributionStatusBadge = (status: string) => {
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

  const getContributionTypeBadge = (type: string) => {
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

  if (memberLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 lg:col-span-1" />
            <Skeleton className="h-64 lg:col-span-2" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!member) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Membre non trouvé</p>
          <Button variant="link" onClick={() => navigate('/membres')}>
            Retour à la liste
          </Button>
        </div>
      </AppLayout>
    );
  }

  const totalPaid = contributions
    .filter(c => c.status === 'payee')
    .reduce((sum, c) => sum + c.amount, 0);

  const pendingAmount = contributions
    .filter(c => c.status === 'en_attente' || c.status === 'en_retard')
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-serif text-3xl font-bold">
                {member.last_name} {member.first_name}
              </h1>
              <p className="text-muted-foreground font-mono">{member.member_number}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Carte membre
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Carte de membre</DialogTitle>
                </DialogHeader>
                <MemberCardPDF member={member} />
              </DialogContent>
            </Dialog>
            <Button variant="outline" asChild>
              <Link to={`/cotisations/nouveau?member=${id}`}>
                <Plus className="mr-2 h-4 w-4" />
                Enregistrer paiement
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Member Info Card */}
          <Card className="card-elevated lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">
                    {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Statut</span>
                  {getStatusBadge(member.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Genre</span>
                  <span className="capitalize">{member.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Famille</span>
                  <span className="font-medium">{member.family?.name}</span>
                </div>
                {member.house && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Maison</span>
                    <span>{member.house.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zone</span>
                  <span className="capitalize">{member.geographic_zone}</span>
                </div>
                {member.profession && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profession</span>
                    <span>{member.profession}</span>
                  </div>
                )}
                {member.contribution_category && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Catégorie</span>
                    <span>{member.contribution_category.name}</span>
                  </div>
                )}
              </div>

              <hr className="border-border" />

              <div className="space-y-3">
                {member.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${member.phone}`} className="text-primary hover:underline">
                      {member.phone}
                    </a>
                  </div>
                )}
                {member.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${member.email}`} className="text-primary hover:underline">
                      {member.email}
                    </a>
                  </div>
                )}
                {member.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{member.address}</span>
                  </div>
                )}
                {member.date_of_birth && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(member.date_of_birth), 'dd MMMM yyyy', { locale: fr })}</span>
                  </div>
                )}
              </div>

              {member.notes && (
                <>
                  <hr className="border-border" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm">{member.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Contributions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="stat-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total payé</p>
                      <p className="text-2xl font-bold text-success">{formatCurrency(totalPaid)}</p>
                    </div>
                    <Wallet className="h-8 w-8 text-success/20" />
                  </div>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">En attente</p>
                      <p className="text-2xl font-bold text-warning">{formatCurrency(pendingAmount)}</p>
                    </div>
                    <Wallet className="h-8 w-8 text-warning/20" />
                  </div>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Cotisation</p>
                      <p className="text-2xl font-bold">{formatCurrency(member.contribution_category?.monthly_amount || 0)}/mois</p>
                    </div>
                    <Wallet className="h-8 w-8 text-muted-foreground/20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contributions History */}
            <Card className="card-elevated">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Historique des cotisations
                </CardTitle>
                <Button size="sm" asChild>
                  <Link to={`/cotisations/nouveau?member=${id}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {contributionsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : contributions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune cotisation enregistrée
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Période</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date paiement</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contributions.map((contribution) => (
                        <TableRow key={contribution.id}>
                          <TableCell>
                            {contribution.period_month && contribution.period_year 
                              ? `${contribution.period_month}/${contribution.period_year}`
                              : '-'}
                          </TableCell>
                          <TableCell>{getContributionTypeBadge(contribution.contribution_type)}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(contribution.amount)}</TableCell>
                          <TableCell>{getContributionStatusBadge(contribution.status)}</TableCell>
                          <TableCell>
                            {contribution.paid_at 
                              ? format(new Date(contribution.paid_at), 'dd/MM/yyyy', { locale: fr })
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
