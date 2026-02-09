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
  Menu,
  X,
} from 'lucide-react';
import { useNews, NEWS_CATEGORIES } from '@/hooks/useNews';
import { useHouses } from '@/hooks/useReferenceData';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import logoAssojereb from '@/assets/logo-assojereb.png';
import { Footer } from '@/components/Footer';
import { useState } from 'react';

const families = [
  'DJELA OSSOU', 'ZOKOUAKOU', 'YAO GNANNI', 'AHOUMMOI BLE OSSOU', 'HOUMBOUANOU', "TOUA ZAMME"
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
  const { data: houses } = useHouses();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalHouses = houses?.length || 43;

  const getCategoryLabel = (category: string) => {
    return NEWS_CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    return NEWS_CATEGORIES.find(c => c.value === category)?.color || 'bg-primary';
  };

  // Strip HTML tags for preview
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - More compact on mobile */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src={logoAssojereb} 
              alt="Logo ASSOJEREB" 
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover"
            />
            <span className="font-serif text-lg sm:text-xl font-bold text-primary">ASSOJEREB</span>
          </Link>
          
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <a href="#actualites">Actualités</a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="#cotisations">Cotisations</a>
            </Button>
            <Button asChild size="sm" className="btn-primary-gradient">
              <Link to="/auth">
                Espace membre
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-2">
            <a 
              href="#actualites" 
              className="block py-2 text-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              Actualités
            </a>
            <a 
              href="#cotisations" 
              className="block py-2 text-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cotisations
            </a>
            <Button asChild size="sm" className="btn-primary-gradient w-full">
              <Link to="/auth">
                Espace membre
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        )}
      </header>

      {/* Hero - More compact */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{ 
            background: 'var(--gradient-hero)',
          }}
        />
        <div className="container mx-auto px-4 py-10 sm:py-16 lg:py-24 relative">
          <div className="max-w-3xl mx-auto text-center animate-fadeIn">
            <div className="flex justify-center mb-4 sm:mb-6">
              <img 
                src={logoAssojereb} 
                alt="Logo ASSOJEREB" 
                className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full object-cover shadow-xl"
              />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Bienvenue chez les jeunes ressortissants
            </div>
            
            <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight px-2">
              Association des Jeunes Ressortissants
              <span className="text-primary"> de Brongonzué</span>
            </h1>
            
            <p className="text-sm sm:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto px-4">
              Ensemble, nous construisons l'avenir de notre village. Rejoignez une communauté 
              solidaire et engagée pour le développement de notre terroir.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
              <Button asChild size="default" className="btn-primary-gradient text-sm sm:text-base">
                <Link to="/auth">
                  Accéder à mon espace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="default" className="text-sm sm:text-base">
                <a href="#actualites">Voir les actualités</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - More compact grid */}
      <section className="py-8 sm:py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="font-serif text-2xl sm:text-4xl font-bold text-primary mb-1">6</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Grandes familles</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-2xl sm:text-4xl font-bold text-primary mb-1">{totalHouses}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Maisons du village</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-2xl sm:text-4xl font-bold text-primary mb-1">1000+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Membres</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-2xl sm:text-4xl font-bold text-primary mb-1">∞</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Solidarité</div>
            </div>
          </div>
        </div>
      </section>

      {/* News Section - Improved mobile */}
      <section id="actualites" className="py-10 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs sm:text-sm font-medium mb-3">
              <Newspaper className="h-3 w-3 sm:h-4 sm:w-4" />
              Restez informés
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
              Actualités & Communiqués
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
              Décès, mariages, événements, projets... Restez connectés avec la vie de notre communauté.
            </p>
          </div>
          
          {newsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted rounded-t-lg" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-muted rounded w-20" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-8">
              <Newspaper className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">Aucune actualité pour le moment</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {news.slice(0, 6).map((item) => (
                <Link 
                  key={item.id} 
                  to={`/actualites/${item.slug || item.id}`}
                  className="group"
                >
                  <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-l-4 border-b-4 border-l-secondary border-b-secondary border-r-4 border-t-4 border-r-primary border-t-primary bg-card h-full">
                    {item.image_url ? (
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={item.image_url} 
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <Newspaper className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${getCategoryColor(item.category)} text-white border-0 text-xs`}>
                          {getCategoryLabel(item.category)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(item.published_at), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                      <h3 className="font-serif text-sm sm:text-base font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors uppercase">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 italic">
                        {stripHtml(item.content).substring(0, 120)}...
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
          
          {news.length > 6 && (
            <div className="text-center mt-6">
              <Button asChild variant="outline" size="sm">
                <Link to="/actualites">
                  Voir toutes les actualités
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Families - More compact */}
      <section className="py-10 sm:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
              Les 6 Grandes Familles
            </h2>
            <p className="text-sm sm:text-base text-primary-foreground/80">
              Notre communauté est organisée autour de 6 grandes familles fondatrices
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {families.map((family) => (
              <div 
                key={family}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-primary-foreground/10 rounded-full border border-primary-foreground/20 text-sm sm:text-lg font-medium hover:bg-primary-foreground/20 transition-colors"
              >
                {family}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contributions - Improved mobile grid */}
      <section id="cotisations" className="py-10 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs sm:text-sm font-medium mb-3">
              <Wallet className="h-3 w-3 sm:h-4 sm:w-4" />
              Participation solidaire
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
              Grille des Cotisations
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Chaque membre contribue selon ses moyens pour le bien commun.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
            {contributionCategories.map((item) => (
              <Card 
                key={item.category}
                className="card-elevated hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <CardContent className="p-3 sm:p-5 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium mb-1 line-clamp-1">{item.category}</h3>
                  <p className="text-lg sm:text-xl font-bold text-primary">{item.amount}</p>
                  <p className="text-xs text-muted-foreground">/mois</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - More compact */}
      <section className="py-10 sm:py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3">
              Déjà membre de l'ASSOJEREB ?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Connectez-vous pour accéder à votre espace personnel et consulter vos cotisations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="default" className="btn-primary-gradient">
                <Link to="/auth">
                  Se connecter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="default">
                <a href="tel:+2250707167921">
                  <Phone className="mr-2 h-4 w-4" />
                  07 07 16 79 21
                </a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              <Calendar className="inline h-3 w-3 mr-1" />
              Les inscriptions sont gérées par les chefs de famille et l'administration
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
