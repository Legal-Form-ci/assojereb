import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="font-serif text-3xl font-bold">Rapports</h1>
          <p className="text-muted-foreground">Générez et téléchargez des rapports</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="card-elevated hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Liste des membres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Export complet de tous les membres avec leurs informations
              </p>
              <Button variant="outline" className="w-full" disabled>
                <Download className="mr-2 h-4 w-4" />
                Bientôt disponible
              </Button>
            </CardContent>
          </Card>

          <Card className="card-elevated hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                État des cotisations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Rapport détaillé des cotisations par période
              </p>
              <Button variant="outline" className="w-full" disabled>
                <Download className="mr-2 h-4 w-4" />
                Bientôt disponible
              </Button>
            </CardContent>
          </Card>

          <Card className="card-elevated hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Bilan financier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Synthèse des revenus et dépenses de l'association
              </p>
              <Button variant="outline" className="w-full" disabled>
                <Download className="mr-2 h-4 w-4" />
                Bientôt disponible
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
