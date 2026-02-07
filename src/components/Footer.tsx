import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import logoAssojereb from '@/assets/logo-assojereb.png';

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid md:grid-cols-4 gap-6 lg:gap-8 mb-6 lg:mb-8">
          {/* Logo et description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={logoAssojereb} 
                alt="Logo ASSOJEREB" 
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
              />
              <div>
                <span className="font-serif text-lg font-bold">ASSOJEREB</span>
              </div>
            </div>
            <p className="text-background/60 text-sm leading-relaxed max-w-md">
              Association des Jeunes Ressortissants de Brongonzué.<br />
              Unis pour le développement de notre terroir, ensemble nous construisons l'avenir de notre village.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="font-semibold mb-3 lg:mb-4">Liens rapides</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li>
                <a href="#actualites" className="hover:text-background transition-colors">
                  Actualités
                </a>
              </li>
              <li>
                <a href="#cotisations" className="hover:text-background transition-colors">
                  Cotisations
                </a>
              </li>
              <li>
                <Link to="/auth" className="hover:text-background transition-colors">
                  Espace membre
                </Link>
              </li>
              <li>
                <Link to="/actualites" className="hover:text-background transition-colors">
                  Toutes les actualités
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3 lg:mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-secondary" />
                <a href="tel:+2250707167921" className="hover:text-background transition-colors">
                  07 07 16 79 21
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-secondary" />
                <a href="mailto:contact@assojereb.ci" className="hover:text-background transition-colors">
                  contact@assojereb.ci
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-secondary" />
                <span>Brongonzué, Côte d'Ivoire</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-background/10 pt-6 lg:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-background/60">
            <span>© {new Date().getFullYear()} ASSOJEREB. Tous droits réservés.</span>
            <a 
              href="https://www.ikoffi.agricapital.ci" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-secondary transition-colors"
            >
              Plateforme développée par Inocent KOFFI
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
