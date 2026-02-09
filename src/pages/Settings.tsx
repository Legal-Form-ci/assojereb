import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, Users, Wallet, Building2 } from 'lucide-react';
import { useFamilies, useHouses, useContributionCategories } from '@/hooks/useReferenceData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
  const { isAdmin } = useAuth();
  const { data: families } = useFamilies();
  const { data: houses } = useHouses();
  const { data: categories } = useContributionCategories();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <Settings className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">Accès restreint</h3>
          <p className="text-muted-foreground">
            Seuls les administrateurs peuvent accéder aux paramètres.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="font-serif text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">Configuration de l'application</p>
        </div>

        <Tabs defaultValue="families" className="space-y-6">
          <TabsList>
            <TabsTrigger value="families">Familles</TabsTrigger>
            <TabsTrigger value="houses">Maisons</TabsTrigger>
            <TabsTrigger value="categories">Catégories</TabsTrigger>
          </TabsList>

          <TabsContent value="families">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Les 6 Grandes Familles
                </CardTitle>
                <CardDescription>
                  Liste des familles du village configurées dans le système
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ordre</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {families?.map((family) => (
                      <TableRow key={family.id}>
                        <TableCell>{family.display_order}</TableCell>
                        <TableCell className="font-medium">{family.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {family.description || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="houses">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Les 43 Maisons du Village
                </CardTitle>
                <CardDescription>
                  Liste des maisons numérotées du village
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                  {houses?.map((house) => (
                    <div 
                      key={house.id}
                      className="aspect-square flex items-center justify-center rounded-lg bg-primary/10 text-primary font-medium"
                    >
                      {house.house_number}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Catégories de cotisation
                </CardTitle>
                <CardDescription>
                  Grille tarifaire des cotisations mensuelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Montant mensuel</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories?.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-primary font-semibold">
                          {formatCurrency(category.monthly_amount)}
                        </TableCell>
                        <TableCell>
                          {category.is_active ? (
                            <Badge className="bg-success/10 text-success border-0">Actif</Badge>
                          ) : (
                            <Badge variant="secondary">Inactif</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
