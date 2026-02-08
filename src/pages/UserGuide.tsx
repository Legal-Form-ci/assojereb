import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, Users, Wallet, FileText, Settings, Shield, 
  Home, PieChart, Bell, UserPlus, CreditCard, Newspaper,
  CheckCircle2, AlertTriangle, Info
} from 'lucide-react';

const GUIDE_SECTIONS = {
  admin: {
    title: 'Super Administrateur',
    icon: Shield,
    color: 'bg-destructive',
    intro: 'En tant que Super Administrateur, vous avez un accès complet à toutes les fonctionnalités de la plateforme.',
    sections: [
      {
        title: 'Gestion des rôles',
        icon: Shield,
        content: `
          <p>Vous êtes le seul à pouvoir attribuer ou retirer des statuts aux utilisateurs.</p>
          <ul>
            <li><strong>Accéder à la gestion des rôles</strong> : Menu → Gestion des rôles</li>
            <li><strong>Modifier un rôle</strong> : Cliquez sur "Modifier" à côté de l'utilisateur</li>
            <li><strong>Rôles disponibles</strong> : Président, Trésorier, Chef de famille, etc.</li>
          </ul>
        `
      },
      {
        title: 'Gestion des membres',
        icon: Users,
        content: `
          <p>Créez, modifiez et supprimez les membres de l'association.</p>
          <ul>
            <li><strong>Nouveau membre</strong> : Membres → Nouveau membre</li>
            <li><strong>Photo obligatoire</strong> : Uploadez une photo pour la carte membre</li>
            <li><strong>Générer une carte</strong> : Fiche membre → Carte membre (PDF)</li>
          </ul>
        `
      },
      {
        title: 'Cotisations',
        icon: Wallet,
        content: `
          <p>Gérez toutes les cotisations mensuelles et exceptionnelles.</p>
          <ul>
            <li><strong>Enregistrer un paiement</strong> : Cotisations → Nouvelle cotisation</li>
            <li><strong>Cotisations exceptionnelles</strong> : Créez des événements spéciaux</li>
            <li><strong>Rapports</strong> : Exportez en Excel ou PDF</li>
          </ul>
        `
      },
      {
        title: 'Actualités',
        icon: Newspaper,
        content: `
          <p>Publiez et gérez les actualités de l'association.</p>
          <ul>
            <li><strong>Éditeur IA</strong> : Écrivez un texte brut, cliquez "Générer"</li>
            <li><strong>Catégories</strong> : Événement, communiqué, annonce...</li>
            <li><strong>Médias</strong> : Images (20Mo max) et vidéos (500Mo max)</li>
          </ul>
        `
      },
    ]
  },
  president: {
    title: 'Président',
    icon: Home,
    color: 'bg-primary',
    intro: 'En tant que Président, vous supervisez l\'ensemble des activités de l\'association.',
    sections: [
      {
        title: 'Tableau de bord',
        icon: PieChart,
        content: `
          <p>Votre tableau de bord affiche une vue globale de l'association.</p>
          <ul>
            <li><strong>Statistiques</strong> : Membres actifs, cotisations du mois</li>
            <li><strong>Graphiques</strong> : Évolution des cotisations, répartition par famille</li>
            <li><strong>Alertes</strong> : Cotisations en retard, nouveaux membres</li>
          </ul>
        `
      },
      {
        title: 'Gestion des membres',
        icon: Users,
        content: `
          <p>Accédez à la liste complète des membres.</p>
          <ul>
            <li><strong>Recherche</strong> : Par nom, famille, statut</li>
            <li><strong>Export</strong> : Téléchargez la liste en Excel</li>
            <li><strong>Détails</strong> : Consultez l'historique de chaque membre</li>
          </ul>
        `
      },
      {
        title: 'Rapports financiers',
        icon: FileText,
        content: `
          <p>Consultez les rapports de l'association.</p>
          <ul>
            <li><strong>Rapport mensuel</strong> : Recettes et dépenses</li>
            <li><strong>Export PDF</strong> : Pour les réunions du bureau</li>
          </ul>
        `
      },
    ]
  },
  tresorier: {
    title: 'Trésorier',
    icon: Wallet,
    color: 'bg-secondary',
    intro: 'En tant que Trésorier, vous gérez les finances de l\'association.',
    sections: [
      {
        title: 'Enregistrer une cotisation',
        icon: CreditCard,
        content: `
          <p>Enregistrez les paiements des membres.</p>
          <ol>
            <li>Allez dans <strong>Cotisations</strong></li>
            <li>Cliquez sur <strong>Nouvelle cotisation</strong></li>
            <li>Sélectionnez le membre et le mois</li>
            <li>Indiquez le montant et le mode de paiement</li>
            <li>Cliquez sur <strong>Enregistrer</strong></li>
          </ol>
        `
      },
      {
        title: 'Cotisations exceptionnelles',
        icon: Wallet,
        content: `
          <p>Gérez les cotisations pour les événements spéciaux.</p>
          <ul>
            <li><strong>Créer</strong> : Définissez le titre, le montant, la date limite</li>
            <li><strong>Suivre</strong> : Voyez qui a payé et qui est en retard</li>
          </ul>
        `
      },
      {
        title: 'Rapports',
        icon: FileText,
        content: `
          <p>Générez des rapports financiers.</p>
          <ul>
            <li><strong>Par période</strong> : Mensuel, trimestriel, annuel</li>
            <li><strong>Par famille</strong> : Répartition des cotisations</li>
            <li><strong>Export</strong> : Excel ou PDF</li>
          </ul>
        `
      },
    ]
  },
  commissaire: {
    title: 'Commissaire aux Comptes',
    icon: FileText,
    color: 'bg-info',
    intro: 'En tant que Commissaire aux Comptes, vous avez un accès en lecture seule pour l\'audit.',
    sections: [
      {
        title: 'Audit des cotisations',
        icon: CheckCircle2,
        content: `
          <p>Vérifiez les cotisations enregistrées.</p>
          <ul>
            <li><strong>Historique</strong> : Consultez toutes les transactions</li>
            <li><strong>Filtres</strong> : Par date, membre, statut</li>
            <li><strong>Anomalies</strong> : Identifiez les irrégularités</li>
          </ul>
        `
      },
      {
        title: 'Rapports',
        icon: FileText,
        content: `
          <p>Accédez aux rapports financiers.</p>
          <ul>
            <li><strong>Lecture seule</strong> : Vous ne pouvez pas modifier les données</li>
            <li><strong>Export</strong> : Téléchargez pour vos analyses</li>
          </ul>
        `
      },
    ]
  },
  chef_famille: {
    title: 'Chef de Famille',
    icon: Home,
    color: 'bg-success',
    intro: 'En tant que Chef de Famille, vous gérez uniquement les membres de votre famille.',
    sections: [
      {
        title: 'Membres de votre famille',
        icon: Users,
        content: `
          <p>Gérez les membres de votre famille.</p>
          <ul>
            <li><strong>Ajouter</strong> : Enregistrez un nouveau membre</li>
            <li><strong>Modifier</strong> : Mettez à jour les informations</li>
            <li><strong>Statut</strong> : Actif, inactif, sympathisant</li>
          </ul>
        `
      },
      {
        title: 'Cotisations familiales',
        icon: Wallet,
        content: `
          <p>Enregistrez les cotisations de votre famille.</p>
          <ul>
            <li><strong>Paiements</strong> : Enregistrez les cotisations mensuelles</li>
            <li><strong>Suivi</strong> : Voyez l'état des paiements</li>
          </ul>
        `
      },
    ]
  },
  membre: {
    title: 'Membre',
    icon: Users,
    color: 'bg-muted',
    intro: 'En tant que Membre, vous accédez à votre profil et aux contenus publics.',
    sections: [
      {
        title: 'Votre profil',
        icon: Users,
        content: `
          <p>Gérez vos informations personnelles.</p>
          <ul>
            <li><strong>Photo</strong> : Uploadez votre photo de profil</li>
            <li><strong>Coordonnées</strong> : Mettez à jour téléphone, adresse</li>
            <li><strong>Mot de passe</strong> : Changez votre mot de passe</li>
          </ul>
        `
      },
      {
        title: 'Historique',
        icon: FileText,
        content: `
          <p>Consultez votre historique.</p>
          <ul>
            <li><strong>Cotisations</strong> : Vos paiements passés</li>
            <li><strong>Carte membre</strong> : Téléchargez votre carte</li>
          </ul>
        `
      },
      {
        title: 'Actualités',
        icon: Newspaper,
        content: `
          <p>Restez informé des activités de l'association.</p>
          <ul>
            <li><strong>Événements</strong> : Dates importantes</li>
            <li><strong>Communiqués</strong> : Annonces officielles</li>
          </ul>
        `
      },
    ]
  },
};

export default function UserGuidePage() {
  const { userRole } = useAuth();
  const { roleLabel, isSuperAdmin, isPresident, isTresorier, isCommissaire, isChefFamille } = usePermissions();

  // Determine which guide to show based on role
  let guideKey = 'membre';
  if (isSuperAdmin) guideKey = 'admin';
  else if (isPresident) guideKey = 'president';
  else if (isTresorier) guideKey = 'tresorier';
  else if (isCommissaire) guideKey = 'commissaire';
  else if (isChefFamille) guideKey = 'chef_famille';

  const guide = GUIDE_SECTIONS[guideKey as keyof typeof GUIDE_SECTIONS];
  const Icon = guide.icon;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl ${guide.color} flex items-center justify-center`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold">Guide d'utilisation</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`${guide.color} text-white border-0`}>
                {guide.title}
              </Badge>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground text-sm">{roleLabel}</span>
            </div>
          </div>
        </div>

        {/* Intro card */}
        <Card className="border-l-4 border-l-primary">
          <CardContent className="py-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-muted-foreground">{guide.intro}</p>
            </div>
          </CardContent>
        </Card>

        {/* Guide sections */}
        <div className="grid gap-4">
          <Accordion type="single" collapsible className="space-y-3">
            {guide.sections.map((section, index) => {
              const SectionIcon = section.icon;
              return (
                <AccordionItem 
                  key={index} 
                  value={`section-${index}`}
                  className="border rounded-lg px-4 bg-card"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <SectionIcon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium text-left">{section.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div 
                      className="prose prose-sm dark:prose-invert max-w-none pl-13"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Quick tips */}
        <Card className="bg-secondary/5 border-secondary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-secondary" />
              Conseils rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                <span>Utilisez l'assistant IA (bouton flottant) pour poser vos questions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                <span>Vérifiez régulièrement vos notifications pour les rappels de cotisation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                <span>Exportez les rapports en PDF pour vos réunions</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
