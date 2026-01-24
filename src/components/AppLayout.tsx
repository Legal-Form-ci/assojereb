import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Bell,
  FileText,
  Settings,
  LogOut,
  Home,
  CreditCard,
  UserPlus,
  Menu,
  X,
  Star,
  Newspaper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', href: '/dashboard' },
  { icon: Users, label: 'Membres', href: '/membres' },
  { icon: UserPlus, label: 'Nouveau membre', href: '/membres/nouveau', adminOnly: true },
  { icon: Wallet, label: 'Cotisations', href: '/cotisations' },
  { icon: CreditCard, label: 'Enregistrer paiement', href: '/cotisations/nouveau', adminOnly: true },
  { icon: Star, label: 'Cotisations exceptionnelles', href: '/cotisations-exceptionnelles' },
  { icon: Newspaper, label: 'Actualités', href: '/actualites', adminOnly: true },
  { icon: Bell, label: 'Notifications', href: '/notifications' },
  { icon: FileText, label: 'Rapports', href: '/rapports' },
  { icon: Settings, label: 'Paramètres', href: '/parametres', adminOnly: true },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, signOut, isAdmin, userRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  const getRoleBadge = () => {
    switch (userRole) {
      case 'admin':
        return 'Administrateur';
      case 'responsable':
        return 'Responsable';
      default:
        return 'Membre';
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-sidebar flex flex-col transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center">
              <span className="font-bold text-sidebar-primary-foreground">AJ</span>
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-sidebar-foreground">ASSOJEREB</h1>
              <p className="text-xs text-sidebar-foreground/60">Gestion des membres</p>
            </div>
          </Link>
          <button
            className="lg:hidden text-sidebar-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sm font-medium text-sidebar-foreground">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.email}
              </p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sidebar-primary/20 text-sidebar-primary">
                {getRoleBadge()}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "sidebar-item",
                  isActive && "sidebar-item-active"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <Link
            to="/"
            className="sidebar-item"
            onClick={() => setSidebarOpen(false)}
          >
            <Home className="h-5 w-5" />
            <span>Accueil</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="sidebar-item w-full text-left text-destructive"
          >
            <LogOut className="h-5 w-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2"
          >
            <Menu className="h-6 w-6 text-foreground" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">AJ</span>
            </div>
            <span className="font-serif font-bold">ASSOJEREB</span>
          </Link>
          <div className="w-10" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
