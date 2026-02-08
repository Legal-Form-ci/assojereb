import { AppLayout } from '@/components/AppLayout';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useFamilyDashboardStats } from '@/hooks/useFamilyDashboardStats';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, Wallet, Clock, TrendingUp, Home, Calendar, FileText, Shield, Eye, Newspaper, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#228B22', '#32CD32', '#90EE90', '#006400', '#228B22', '#2E8B57', '#3CB371'];

// Component for Admin Dashboard
function AdminDashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">
          Bienvenue, voici un aperçu global de l'activité de l'association
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total membres
            </CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold">{stats?.totalMembers || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Membres actifs
            </CardTitle>
            <UserCheck className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-success">{stats?.activeMembers || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenus du mois
            </CardTitle>
            <Wallet className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(stats?.monthlyRevenue || 0)}</div>
            )}
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En attente
            </CardTitle>
            <Clock className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-warning">{stats?.pendingContributions || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Contributions chart */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Évolution des cotisations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.contributionsByMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Montant']}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Members by family */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Répartition par famille
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : stats?.membersByFamily && stats.membersByFamily.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.membersByFamily}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, count }) => `${name} (${count})`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="name"
                  >
                    {stats.membersByFamily.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Aucun membre enregistré
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Members by zone */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Répartition géographique</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats?.membersByZone?.map((item) => (
                <div 
                  key={item.zone}
                  className="p-4 rounded-lg bg-muted/50 text-center"
                >
                  <div className="text-2xl font-bold text-primary">{item.count}</div>
                  <div className="text-sm text-muted-foreground capitalize">{item.zone}</div>
                </div>
              ))}
              {(!stats?.membersByZone || stats.membersByZone.length === 0) && (
                <div className="col-span-4 text-center py-8 text-muted-foreground">
                  Aucune donnée disponible
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Component for Family Head Dashboard
function FamilyDashboard() {
  const { data: stats, isLoading } = useFamilyDashboardStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'payee':
        return <Badge className="bg-success/20 text-success">Payée</Badge>;
      case 'en_attente':
        return <Badge className="bg-warning/20 text-warning">En attente</Badge>;
      case 'en_retard':
        return <Badge className="bg-destructive/20 text-destructive">En retard</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'actif': return 'Actifs';
      case 'inactif': return 'Inactifs';
      case 'sympathisant': return 'Sympathisants';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <Skeleton className="h-10 w-64" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="text-center py-12">
          <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Aucune famille assignée</h2>
          <p className="text-muted-foreground">
            Vous n'êtes pas encore responsable d'une famille. Contactez un administrateur.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Home className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-bold">Famille {stats.familyName}</h1>
          <p className="text-muted-foreground mt-1">
            Tableau de bord de votre famille
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Membres
            </CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">dans la famille</p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Actifs
            </CardTitle>
            <UserCheck className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats.activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalMembers > 0 ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenus du mois
            </CardTitle>
            <Wallet className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En attente
            </CardTitle>
            <Clock className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{stats.pendingContributions}</div>
            <p className="text-xs text-muted-foreground">cotisations</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Stats */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Contributions chart */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Évolution des cotisations
            </CardTitle>
            <CardDescription>Cotisations de la famille sur 6 mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.contributionsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Montant']}
                />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Members by status */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Statut des membres
            </CardTitle>
            <CardDescription>Répartition par statut</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.membersByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="capitalize">{getStatusLabel(item.status)}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(item.count / stats.totalMembers) * 100}%` }}
                      />
                    </div>
                    <span className="font-semibold w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium mb-3">Répartition géographique</h4>
              <div className="grid grid-cols-2 gap-2">
                {stats.membersByZone.map((item) => (
                  <div key={item.zone} className="p-2 rounded bg-muted/50 text-center">
                    <div className="font-bold text-primary">{item.count}</div>
                    <div className="text-xs text-muted-foreground capitalize">{item.zone}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent contributions */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Dernières cotisations
          </CardTitle>
          <CardDescription>Les 5 dernières cotisations de la famille</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentContributions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune cotisation enregistrée
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentContributions.map((contribution) => (
                <div 
                  key={contribution.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <div className="font-medium">{contribution.memberName}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(contribution.date), 'dd MMMM yyyy', { locale: fr })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(contribution.amount)}</div>
                    {getStatusBadge(contribution.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Component for Regular Member Dashboard
function MemberDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="font-serif text-3xl font-bold">Bienvenue</h1>
        <p className="text-muted-foreground mt-1">
          Votre espace membre ASSOJEREB
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Mon profil</CardTitle>
            <CardDescription>Gérez vos informations personnelles</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Accédez à votre profil pour mettre à jour vos informations et préférences de notification.
            </p>
            <a href="/profil" className="btn-primary-gradient inline-flex items-center px-4 py-2 rounded-md text-sm font-medium">
              Voir mon profil
            </a>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Mes cotisations</CardTitle>
            <CardDescription>Historique de vos paiements</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Consultez l'historique de vos cotisations et le statut de vos paiements.
            </p>
            <a href="/cotisations" className="btn-primary-gradient inline-flex items-center px-4 py-2 rounded-md text-sm font-medium">
              Voir mes cotisations
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Trésorier Dashboard
function TresorierDashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-secondary/10 rounded-xl">
          <Wallet className="h-6 w-6 text-secondary" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold">Tableau de bord Trésorerie</h1>
          <p className="text-muted-foreground text-sm">Gérez les finances de l'association</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Revenus du mois</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-7 w-24" /> : (
              <div className="text-2xl font-bold text-success">{formatCurrency(stats?.monthlyRevenue || 0)}</div>
            )}
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-7 w-16" /> : (
              <div className="text-2xl font-bold text-warning">{stats?.pendingContributions || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Membres actifs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-7 w-16" /> : (
              <div className="text-2xl font-bold">{stats?.activeMembers || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total membres</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-7 w-16" /> : (
              <div className="text-2xl font-bold">{stats?.totalMembers || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/cotisations/nouveau">
                <Wallet className="h-4 w-4 mr-2" />
                Nouvelle cotisation
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/rapports">
                <FileText className="h-4 w-4 mr-2" />
                Voir les rapports
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/membres">
                <Users className="h-4 w-4 mr-2" />
                Liste des membres
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-base">Rappel</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              En tant que Trésorier, vous pouvez voir tous les membres et cotisations, 
              enregistrer les paiements, et générer des rapports. 
              Vous ne pouvez pas modifier les paramètres système.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Commissaire aux Comptes Dashboard
function CommissaireDashboard() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-info/10 rounded-xl">
          <Eye className="h-6 w-6 text-info" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold">Tableau de bord Audit</h1>
          <p className="text-muted-foreground text-sm">Lecture seule - Contrôle des comptes</p>
        </div>
      </div>

      <Card className="border-l-4 border-l-info">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <Eye className="h-5 w-5 text-info shrink-0" />
            <div>
              <p className="font-medium">Mode lecture seule</p>
              <p className="text-sm text-muted-foreground">
                Vous avez un accès en consultation uniquement pour vérifier les comptes et les cotisations.
                Aucune modification n'est autorisée.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Consulter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/rapports">
                <FileText className="h-4 w-4 mr-2" />
                Rapports financiers
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/cotisations">
                <Wallet className="h-4 w-4 mr-2" />
                Historique des cotisations
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/membres">
                <Users className="h-4 w-4 mr-2" />
                Liste des membres
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="card-elevated bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base">Votre mission</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Vérifier la régularité des cotisations</li>
              <li>• Contrôler les comptes de l'association</li>
              <li>• Préparer le rapport d'audit annuel</li>
              <li>• Signaler les anomalies au bureau</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { userRole, isAdmin, isResponsable } = useAuth();
  const { isTresorier, isCommissaire, isChefFamille, isPresident } = usePermissions();

  const renderDashboard = () => {
    if (isAdmin) return <AdminDashboard />;
    if (isPresident) return <AdminDashboard />;
    if (isTresorier) return <TresorierDashboard />;
    if (isCommissaire) return <CommissaireDashboard />;
    if (isChefFamille || isResponsable) return <FamilyDashboard />;
    return <MemberDashboard />;
  };

  return (
    <AppLayout>
      {renderDashboard()}
    </AppLayout>
  );
}
