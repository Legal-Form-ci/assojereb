import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useMembers } from '@/hooks/useMembers';
import { useContributions } from '@/hooks/useContributions';
import { useFamilies, useContributionCategories } from '@/hooks/useReferenceData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Users, Wallet, Loader2, Printer, FileSpreadsheet } from 'lucide-react';
import { generateMemberListPDF, openPrintWindow } from '@/lib/pdfGenerator';
import { generateMembersCSV, generateContributionsCSV, downloadCSV } from '@/lib/excelGenerator';
import { toast } from 'sonner';

export default function ReportsPage() {
  const { members, isLoading: membersLoading } = useMembers();
  const { contributions, isLoading: contributionsLoading } = useContributions();
  const { data: families } = useFamilies();
  const { data: categories } = useContributionCategories();

  const [memberFilters, setMemberFilters] = useState({
    family: 'all',
    category: 'all',
    status: 'all',
  });
  
  const [generating, setGenerating] = useState<string | null>(null);

  const filteredMembers = members.filter(member => {
    if (memberFilters.family !== 'all' && member.family_id !== memberFilters.family) return false;
    if (memberFilters.category !== 'all' && member.contribution_category_id !== memberFilters.category) return false;
    if (memberFilters.status !== 'all' && member.status !== memberFilters.status) return false;
    return true;
  });

  const getFilterDescription = () => {
    const parts = [];
    if (memberFilters.family !== 'all') {
      const family = families?.find(f => f.id === memberFilters.family);
      parts.push(`Famille: ${family?.name}`);
    }
    if (memberFilters.category !== 'all') {
      const cat = categories?.find(c => c.id === memberFilters.category);
      parts.push(`Catégorie: ${cat?.name}`);
    }
    if (memberFilters.status !== 'all') {
      parts.push(`Statut: ${memberFilters.status}`);
    }
    return parts.length > 0 ? parts.join(' • ') : 'Tous les membres';
  };

  const handleGenerateMembersPDF = () => {
    setGenerating('members-pdf');
    try {
      const html = generateMemberListPDF(filteredMembers, {
        title: 'Liste des Membres ASSOJEREB',
        subtitle: 'Répertoire officiel des membres',
        filterInfo: getFilterDescription(),
      });
      openPrintWindow(html, 'liste-membres-assojereb');
      toast.success('Document généré avec succès');
    } catch (error) {
      toast.error('Erreur lors de la génération');
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateMembersExcel = () => {
    setGenerating('members-excel');
    try {
      const csv = generateMembersCSV(filteredMembers);
      const timestamp = new Date().toISOString().split('T')[0];
      downloadCSV(csv, `membres-assojereb-${timestamp}`);
      toast.success('Export Excel généré avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateContributionsExcel = () => {
    setGenerating('contributions-excel');
    try {
      const csv = generateContributionsCSV(contributions);
      const timestamp = new Date().toISOString().split('T')[0];
      downloadCSV(csv, `cotisations-assojereb-${timestamp}`);
      toast.success('Export Excel généré avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    } finally {
      setGenerating(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="font-serif text-3xl font-bold">Rapports</h1>
          <p className="text-muted-foreground">Générez et exportez des rapports personnalisés</p>
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members">
              <Users className="h-4 w-4 mr-2" />
              Membres
            </TabsTrigger>
            <TabsTrigger value="contributions">
              <Wallet className="h-4 w-4 mr-2" />
              Cotisations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6">
            {/* Filters */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Filtres du rapport
                </CardTitle>
                <CardDescription>
                  Personnalisez les critères pour votre export
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Famille</Label>
                    <Select 
                      value={memberFilters.family} 
                      onValueChange={(v) => setMemberFilters(prev => ({ ...prev, family: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les familles</SelectItem>
                        {families?.map(f => (
                          <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select 
                      value={memberFilters.category} 
                      onValueChange={(v) => setMemberFilters(prev => ({ ...prev, category: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les catégories</SelectItem>
                        {categories?.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Statut</Label>
                    <Select 
                      value={memberFilters.status} 
                      onValueChange={(v) => setMemberFilters(prev => ({ ...prev, status: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="actif">Actif</SelectItem>
                        <SelectItem value="inactif">Inactif</SelectItem>
                        <SelectItem value="sympathisant">Sympathisant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>{filteredMembers.length}</strong> membre(s) correspondent à vos critères
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{getFilterDescription()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="card-elevated hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Printer className="h-5 w-5 text-primary" />
                    Export PDF / Impression
                  </CardTitle>
                  <CardDescription>
                    Document A4 formaté avec en-tête et pied de page ASSOJEREB
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                    <li>• Format A4 avec marges optimisées</li>
                    <li>• En-tête avec logo et nom de l'association</li>
                    <li>• Résumé statistique</li>
                    <li>• Pied de page avec date et pagination</li>
                  </ul>
                  <Button 
                    onClick={handleGenerateMembersPDF}
                    disabled={generating === 'members-pdf' || membersLoading || filteredMembers.length === 0}
                    className="w-full btn-primary-gradient"
                  >
                    {generating === 'members-pdf' ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Génération...</>
                    ) : (
                      <><Printer className="mr-2 h-4 w-4" />Générer PDF / Imprimer</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-elevated hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-success" />
                    Export Excel (CSV)
                  </CardTitle>
                  <CardDescription>
                    Fichier CSV compatible avec Excel, Google Sheets, etc.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                    <li>• Toutes les colonnes de données</li>
                    <li>• Format CSV universel</li>
                    <li>• Encodage UTF-8 (accents préservés)</li>
                    <li>• Compatible Excel et Google Sheets</li>
                  </ul>
                  <Button 
                    onClick={handleGenerateMembersExcel}
                    disabled={generating === 'members-excel' || membersLoading || filteredMembers.length === 0}
                    variant="outline"
                    className="w-full"
                  >
                    {generating === 'members-excel' ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Export...</>
                    ) : (
                      <><Download className="mr-2 h-4 w-4" />Télécharger Excel</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contributions" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="card-elevated hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-success" />
                    Export Cotisations Excel
                  </CardTitle>
                  <CardDescription>
                    Historique complet des cotisations au format CSV
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                    <li>• {contributions.length} cotisation(s) enregistrées</li>
                    <li>• Détails membres et montants</li>
                    <li>• Statuts et dates de paiement</li>
                    <li>• Compatible avec les logiciels comptables</li>
                  </ul>
                  <Button 
                    onClick={handleGenerateContributionsExcel}
                    disabled={generating === 'contributions-excel' || contributionsLoading || contributions.length === 0}
                    variant="outline"
                    className="w-full"
                  >
                    {generating === 'contributions-excel' ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Export...</>
                    ) : (
                      <><Download className="mr-2 h-4 w-4" />Télécharger Excel</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Rapport Financier PDF
                  </CardTitle>
                  <CardDescription>
                    Synthèse des cotisations avec graphiques
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                    <li>• Synthèse par période</li>
                    <li>• Répartition par statut</li>
                    <li>• Totaux et moyennes</li>
                    <li>• Prêt pour présentation</li>
                  </ul>
                  <Button variant="outline" className="w-full" disabled>
                    <Printer className="mr-2 h-4 w-4" />
                    Bientôt disponible
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
