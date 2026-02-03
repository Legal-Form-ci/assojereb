import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Wallet, 
  Shield, 
  Calendar,
  ArrowRight,
  Phone,
  MapPin,
  Heart,
  GraduationCap,
  Newspaper,
} from 'lucide-react';
import { useNews, NEWS_CATEGORIES } from '@/hooks/useNews';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import logoAssojereb from '@/assets/logo-assojereb.png';

const families = [
  'AKPRO', 'DJOMAN', 'KOFFI', 'KOUAME', 'KOUASSI', "N'GUESSAN"
];

const contributionCategories = [
  { category: 'Élèves/Étudiants', amount: '500 FCFA', icon: GraduationCap },
  { category: 'Femmes au foyer', amount: '1 000 FCFA', icon: Heart },
  { category: 'Artisans/Commerçants', amount: '2 000 FCFA', icon: Wallet },
  { category: 'Planteurs', amount: '2 000 FCFA', icon: MapPin },
  { category: 'Fonctionnaires', amount: '3 000 FCFA', icon: Users },
  { category: 'Cadres du privé', amount: '5 000 FCFA', icon: Shield },
  { category: 'Cadres supérieurs', amount: '10 000 FCFA', icon: Shield },
  { category: 'Diaspora', amount: '10 000 FCFA', icon: MapPin },
];

export default function LandingPage() {
  const { news, isLoading: newsLoading } = useNews(true); // Only published

  const getCategoryLabel = (category: string) => {
    return NEWS_CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    return NEWS_CATEGORIES.find(c => c.value === category)?.color || 'bg-primary';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={logoAssojereb} 
              alt="Logo ASSOJEREB" 
              className="w-12 h-12 rounded-full object-cover"
            />
            <span className="font-serif text-xl font-bold text-primary">ASSOJEREB</span>
          </Link>
          
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <a href="#actualites">Actualités</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#cotisations">Cotisations</a>
            </Button>
            <Button asChild className="btn-primary-gradient">
              <Link to="/auth">
                Espace membre
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
            <div className="flex justify-center mb-6">
              <img 
                src={logoAssojereb} 
                alt="Logo ASSOJEREB" 
                className="w-32 h-32 rounded-full object-cover shadow-xl"
              />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Bienvenue chez les jeunes ressortissants
            </div>
            
            <h1 className="font-serif text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Association des Jeunes Ressortissants
              <span className="text-primary"> de Brongonzué</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Ensemble, nous construisons l'avenir de notre village. Rejoignez une communauté 
              solidaire et engagée pour le développement de notre terroir.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-primary-gradient text-lg px-8">
                <Link to="/auth">
                  Accéder à mon espace
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <a href="#actualites">Voir les actualités</a>
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
              <div className="text-muted-foreground">Membres</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-4xl font-bold text-primary mb-2">∞</div>
              <div className="text-muted-foreground">Solidarité</div>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="actualites" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              <Newspaper className="h-4 w-4" />
              Restez informés
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
              Actualités & Communiqués
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Décès, mariages, événements, projets... Restez connectés avec la vie de notre communauté.
            </p>
          </div>
          
          {newsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="card-elevated animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded w-20 mb-4" />
                    <div className="h-5 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12">
              <Newspaper className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Aucune actualité pour le moment</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.slice(0, 6).map((item) => (
                <Card key={item.id} className="card-elevated hover:shadow-lg transition-shadow">
                  {item.image_url && (
                    <div className="h-48 overflow-hidden rounded-t-lg">
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={`${getCategoryColor(item.category)} text-white border-0`}>
                        {getCategoryLabel(item.category)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(item.published_at), 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-semibold mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {item.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
              Notre communauté est organisée autour de 6 grandes familles fondatrices
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {families.map((family) => (
              <div 
                key={family}
                className="px-8 py-4 bg-primary-foreground/10 rounded-full border border-primary-foreground/20 text-xl font-medium hover:bg-primary-foreground/20 transition-colors"
              >
                {family}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contributions */}
      <section id="cotisations" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              <Wallet className="h-4 w-4" />
              Participation solidaire
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
              Grille des Cotisations
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Chaque membre contribue selon ses moyens pour le bien commun de notre association.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {contributionCategories.map((item) => (
              <Card 
                key={item.category}
                className="card-elevated hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">{item.category}</h3>
                  <p className="text-2xl font-bold text-primary">{item.amount}</p>
                  <p className="text-sm text-muted-foreground">par mois</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
              Déjà membre de l'ASSOJEREB ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Connectez-vous pour accéder à votre espace personnel, consulter vos cotisations 
              et rester informé des activités de l'association.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-primary-gradient text-lg px-8">
                <Link to="/auth">
                  Se connecter
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <a href="tel:+225XXXXXXXXX">
                  <Phone className="mr-2 h-5 w-5" />
                  Contacter l'association
                </a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              <Calendar className="inline h-4 w-4 mr-1" />
              Les inscriptions sont gérées par les chefs de famille et l'administration
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={logoAssojereb} 
                  alt="Logo ASSOJEREB" 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <span className="font-serif text-lg font-bold">ASSOJEREB</span>
                </div>
              </div>
              <p className="text-background/60 text-sm">
                Association des Jeunes Ressortissants de Brongonzué.<br />
                Unis pour le développement de notre terroir.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liens rapides</h4>
              <ul className="space-y-2 text-sm text-background/60">
                <li><a href="#actualites" className="hover:text-background transition-colors">Actualités</a></li>
                <li><a href="#cotisations" className="hover:text-background transition-colors">Cotisations</a></li>
                <li><Link to="/auth" className="hover:text-background transition-colors">Espace membre</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-background/60">
                <li>Email: contact@assojereb.ci</li>
                <li>Tél: +225 XX XX XX XX</li>
                <li>Brongonzué, Côte d'Ivoire</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/10 pt-8 text-center text-sm text-background/60">
            © {new Date().getFullYear()} ASSOJEREB. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
