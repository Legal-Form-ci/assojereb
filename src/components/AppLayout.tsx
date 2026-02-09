import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
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
  Menu,
  X,
  Newspaper,
  User,
  Building2,
  Shield,
  BookOpen,
} from 'lucide-react';
import { useState } from 'react';
import logoAssojereb from '@/assets/logo-assojereb.png';
import { Footer } from './Footer';

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
  adminOnly?: boolean;
  permission?: keyof ReturnType<typeof usePermissions>['permissions'];
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Tableau de bord', href: '/dashboard' },
  { icon: Users, label: 'Membres', href: '/membres' },
  { icon: Building2, label: 'Maisons', href: '/maisons', adminOnly: true },
  { icon: Wallet, label: 'Cotisations', href: '/cotisations' },
  { icon: Newspaper, label: 'Actualités', href: '/gestion-actualites', permission: 'can_manage_news' },
  { icon: Shield, label: 'Gestion des rôles', href: '/gestion-roles', adminOnly: true },
  { icon: Bell, label: 'Notifications', href: '/notifications' },
  { icon: FileText, label: 'Rapports', href: '/rapports', permission: 'can_view_reports' },
  { icon: User, label: 'Mon profil', href: '/profil' },
  { icon: BookOpen, label: 'Guide', href: '/guide' },
  { icon: Settings, label: 'Paramètres', href: '/parametres', adminOnly: true },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, signOut, isAdmin, userRole } = useAuth();
  const { roleLabel, permissions } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.permission && !permissions[item.permission]) return false;
    return true;
  });

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
          "fixed lg:static inset-y-0 left-0 z-50 w-56 lg:w-60 bg-sidebar flex flex-col transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo - Compact */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img 
              src={logoAssojereb} 
              alt="Logo ASSOJEREB" 
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <h1 className="font-serif text-sm font-bold text-sidebar-foreground leading-none">ASSOJEREB</h1>
              <p className="text-[9px] text-sidebar-foreground/60">Brongonzué</p>
            </div>
          </Link>
          <button
            className="lg:hidden text-sidebar-foreground p-1"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User info - Compact */}
        <div className="px-3 py-2 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0">
              <span className="text-xs font-medium text-sidebar-foreground">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-sidebar-foreground truncate">
                {user?.email}
              </p>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-sidebar-primary/20 text-sidebar-primary">
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation - Tight spacing */}
        <nav className="flex-1 px-2 py-1.5 space-y-0.5 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200",
                  isActive && "bg-sidebar-accent text-sidebar-foreground font-medium"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-2 py-1.5 border-t border-sidebar-border space-y-0.5">
          <Link
            to="/"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
            onClick={() => setSidebarOpen(false)}
          >
            <Home className="h-4 w-4" />
            <span>Accueil</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] w-full text-left text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* Mobile header - Compact */}
        <header className="lg:hidden sticky top-0 z-30 bg-background border-b border-border px-3 py-2 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 -ml-1"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <img 
              src={logoAssojereb} 
              alt="Logo ASSOJEREB" 
              className="w-7 h-7 rounded-full object-cover"
            />
            <span className="font-serif font-bold text-sm">ASSOJEREB</span>
          </Link>
          <div className="w-7" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-x-hidden">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
