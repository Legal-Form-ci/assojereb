import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Wallet, 
  Shield, 
  BarChart3, 
  Bell, 
  CreditCard,
  ArrowRight,
  Check,
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Gestion des membres',
    description: 'Enregistrez et gérez tous les membres avec leurs informations complètes',
  },
  {
    icon: Wallet,
    title: 'Suivi des cotisations',
    description: 'Suivez les cotisations mensuelles et exceptionnelles en temps réel',
  },
  {
    icon: CreditCard,
    title: 'Paiements flexibles',
    description: 'Acceptez les paiements par carte, Mobile Money ou en espèces',
  },
  {
    icon: Bell,
    title: 'Rappels automatiques',
    description: 'Notifications automatiques pour les échéances et retards',
  },
  {
    icon: BarChart3,
    title: 'Tableaux de bord',
    description: 'Statistiques et rapports détaillés sur l\'activité de l\'association',
  },
  {
    icon: Shield,
    title: 'Sécurisé',
    description: 'Données protégées avec authentification et contrôle d\'accès',
  },
];

const families = [
  'AKPRO', 'DJOMAN', 'KOFFI', 'KOUAME', 'KOUASSI', "N'GUESSAN"
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="font-bold text-primary-foreground">AJ</span>
            </div>
            <span className="font-serif text-xl font-bold">ASSOJEREB</span>
          </Link>
          
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/auth">Connexion</Link>
            </Button>
            <Button asChild className="btn-primary-gradient">
              <Link to="/dashboard">
                Mon espace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{ 
            background: 'var(--gradient-hero)',
          }}
        />
        <div className="container mx-auto px-4 py-20 lg:py-32 relative">
          <div className="max-w-3xl mx-auto text-center animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Application officielle de l'association
            </div>
            
            <h1 className="font-serif text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Gestion Numérique des Membres
              <span className="text-primary"> ASSOJEREB</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Modernisez la gestion de votre association avec une solution complète 
              pour les membres, les cotisations et les communications.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-primary-gradient text-lg px-8">
                <Link to="/auth">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <a href="#features">En savoir plus</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="font-serif text-4xl font-bold text-primary mb-2">6</div>
              <div className="text-muted-foreground">Grandes familles</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-4xl font-bold text-primary mb-2">42</div>
              <div className="text-muted-foreground">Maisons du village</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-4xl font-bold text-primary mb-2">1000+</div>
              <div className="text-muted-foreground">Membres attendus</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-muted-foreground">Numérique</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
              Fonctionnalités complètes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour gérer efficacement votre association
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="card-elevated p-6 hover:shadow-xl transition-shadow duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Families */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
              Les 6 Grandes Familles
            </h2>
            <p className="text-lg text-primary-foreground/80">
              Chaque membre est rattaché à l'une des grandes familles du village
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {families.map((family) => (
              <div 
                key={family}
                className="px-6 py-3 bg-primary-foreground/10 rounded-full border border-primary-foreground/20 text-lg font-medium"
              >
                {family}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
              Cotisations adaptées
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Des montants de cotisation différenciés selon la situation de chaque membre
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { category: 'Élèves/Étudiants', amount: '500 FCFA' },
              { category: 'Femmes au foyer', amount: '1 000 FCFA' },
              { category: 'Artisans/Commerçants', amount: '2 000 FCFA' },
              { category: 'Planteurs', amount: '2 000 FCFA' },
              { category: 'Fonctionnaires', amount: '3 000 FCFA' },
              { category: 'Cadres du privé', amount: '5 000 FCFA' },
              { category: 'Cadres supérieurs', amount: '10 000 FCFA' },
              { category: 'Diaspora', amount: '10 000 FCFA' },
            ].map((item) => (
              <div 
                key={item.category}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
              >
                <span className="font-medium">{item.category}</span>
                <span className="text-primary font-semibold">{item.amount}/mois</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
              Prêt à rejoindre l'association ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Créez votre compte et accédez à toutes les fonctionnalités de gestion
            </p>
            <Button asChild size="lg" className="btn-primary-gradient text-lg px-8">
              <Link to="/auth">
                Créer mon compte
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <span className="font-bold text-secondary-foreground">AJ</span>
              </div>
              <div>
                <span className="font-serif text-lg font-bold">ASSOJEREB</span>
                <p className="text-sm text-background/60">Association des Jeunes Ressortissants</p>
              </div>
            </div>
            
            <p className="text-sm text-background/60">
              © {new Date().getFullYear()} ASSOJEREB. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
