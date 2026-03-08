import { useRef, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFamilies } from '@/hooks/useReferenceData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Printer, TreePine, ChevronLeft, ChevronRight } from 'lucide-react';
import logoAssojereb from '@/assets/logo-assojereb.png';

interface PyramidMember {
  id: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  family_id: string;
  family_name: string;
  role?: string;
}

function usePyramidData() {
  const { data: families = [] } = useFamilies();

  return useQuery({
    queryKey: ['pyramid-data'],
    queryFn: async () => {
      // Get all members
      const { data: members } = await supabase
        .from('members')
        .select('id, first_name, last_name, photo_url, family_id, user_id')
        .eq('status', 'actif')
        .order('created_at', { ascending: true });

      // Get all user_roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role, family_id');

      // Get family names
      const { data: familiesData } = await supabase
        .from('families')
        .select('id, name')
        .order('display_order');

      const familyMap: Record<string, string> = {};
      familiesData?.forEach(f => { familyMap[f.id] = f.name; });

      const roleMap: Record<string, string> = {};
      roles?.forEach(r => { if (r.user_id) roleMap[r.user_id] = r.role; });

      const allMembers: PyramidMember[] = (members || []).map(m => ({
        id: m.id,
        first_name: m.first_name,
        last_name: m.last_name,
        photo_url: m.photo_url,
        family_id: m.family_id,
        family_name: familyMap[m.family_id] || 'N/A',
        role: m.user_id ? roleMap[m.user_id] : undefined,
      }));

      // Categorize
      const president = allMembers.find(m => m.role === 'president');
      const bureau = allMembers.filter(m => ['president_adjoint', 'tresorier', 'tresorier_adjoint', 'commissaire_comptes'].includes(m.role || ''));
      const chefsFamille = allMembers.filter(m => m.role === 'chef_famille');
      const gestionnaires = allMembers.filter(m => m.role === 'responsable');
      
      const leaderIds = new Set([president, ...bureau, ...chefsFamille, ...gestionnaires].filter(Boolean).map(m => m!.id));
      const regularMembers = allMembers.filter(m => !leaderIds.has(m.id));

      // Group regular members by family
      const membersByFamily: Record<string, PyramidMember[]> = {};
      regularMembers.forEach(m => {
        if (!membersByFamily[m.family_id]) membersByFamily[m.family_id] = [];
        membersByFamily[m.family_id].push(m);
      });

      return {
        families: familiesData || [],
        president,
        bureau,
        chefsFamille,
        gestionnaires,
        membersByFamily,
        totalMembers: allMembers.length,
      };
    },
  });
}

const ROLE_COLORS: Record<string, string> = {
  president: 'bg-amber-500',
  president_adjoint: 'bg-amber-400',
  tresorier: 'bg-emerald-500',
  tresorier_adjoint: 'bg-emerald-400',
  commissaire_comptes: 'bg-sky-500',
  chef_famille: 'bg-orange-500',
  responsable: 'bg-violet-500',
};

const ROLE_LABELS: Record<string, string> = {
  president: 'Président',
  president_adjoint: 'Prés. Adjoint',
  tresorier: 'Trésorier',
  tresorier_adjoint: 'Trés. Adjoint',
  commissaire_comptes: 'Commissaire',
  chef_famille: 'Chef Famille',
  responsable: 'Gestionnaire',
};

function MiniAvatar({ member, size = 'sm', showRole = false }: { member: PyramidMember; size?: 'xs' | 'sm' | 'md' | 'lg'; showRole?: boolean }) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[6px]',
    sm: 'w-8 h-8 text-[7px]',
    md: 'w-10 h-10 text-[8px]',
    lg: 'w-14 h-14 text-xs',
  };
  const nameSizes = {
    xs: 'text-[5px] max-w-[40px]',
    sm: 'text-[6px] max-w-[50px]',
    md: 'text-[7px] max-w-[60px]',
    lg: 'text-[8px] max-w-[80px]',
  };

  return (
    <div className="flex flex-col items-center gap-0.5 shrink-0">
      {member.photo_url ? (
        <img
          src={member.photo_url}
          alt={`${member.first_name} ${member.last_name}`}
          className={`${sizeClasses[size]} rounded-full object-cover border border-border`}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground border border-border`}>
          {member.first_name[0]}{member.last_name[0]}
        </div>
      )}
      <span className={`${nameSizes[size]} text-center leading-tight truncate font-medium`}>
        {member.first_name} {member.last_name[0]}.
      </span>
      {showRole && member.role && (
        <span className={`text-[5px] px-1 py-0.5 rounded-full text-white ${ROLE_COLORS[member.role] || 'bg-muted'}`}>
          {ROLE_LABELS[member.role] || member.role}
        </span>
      )}
    </div>
  );
}

function PrintableContent({ data }: { data: NonNullable<ReturnType<typeof usePyramidData>['data']> }) {
  const MEMBERS_PER_PAGE = 200;
  const allRegularMembers = Object.values(data.membersByFamily).flat();
  const totalPages = Math.max(1, Math.ceil(allRegularMembers.length / MEMBERS_PER_PAGE));
  const [currentPage, setCurrentPage] = useState(0);

  const paginatedMembers = allRegularMembers.slice(
    currentPage * MEMBERS_PER_PAGE,
    (currentPage + 1) * MEMBERS_PER_PAGE
  );

  // Group paginated members by family
  const paginatedByFamily: Record<string, PyramidMember[]> = {};
  paginatedMembers.forEach(m => {
    if (!paginatedByFamily[m.family_id]) paginatedByFamily[m.family_id] = [];
    paginatedByFamily[m.family_id].push(m);
  });

  return (
    <div>
      {/* Pagination controls (hidden in print) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mb-4 print:hidden">
          <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Page {currentPage + 1} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Printable pyramid area */}
      <div
        id="pyramid-content"
        className="bg-white mx-auto border border-border print:border-0"
        style={{ width: '297mm', minHeight: '210mm', padding: '6mm', overflow: 'hidden' }}
      >
        {/* Header */}
        <div className="text-center mb-3">
          <div className="flex items-center justify-center gap-3 mb-1">
            <img src={logoAssojereb} alt="Logo" className="w-10 h-10 rounded-full" />
            <div>
              <h1 className="text-sm font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                ASSOJEREB - Organigramme
              </h1>
              <p className="text-[7px] text-muted-foreground">
                Association des Jeunes Ressortissants et Élites de Brongonzué • {data.totalMembers} membres
              </p>
            </div>
          </div>
        </div>

        {/* Level 1: Families */}
        <div className="mb-2">
          <div className="text-center mb-1">
            <span className="text-[7px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              LES GRANDES FAMILLES
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {data.families.map(f => (
              <div key={f.id} className="bg-primary/5 border border-primary/20 rounded px-2 py-1 text-center">
                <span className="text-[8px] font-bold text-primary">{f.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Connector line */}
        <div className="flex justify-center my-1">
          <div className="w-px h-3 bg-border" />
        </div>

        {/* Level 2: President */}
        {data.president && (
          <div className="text-center mb-2">
            <span className="text-[6px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mb-1 inline-block">
              PRÉSIDENT
            </span>
            <div className="flex justify-center">
              <MiniAvatar member={data.president} size="lg" />
            </div>
          </div>
        )}

        <div className="flex justify-center my-1"><div className="w-px h-3 bg-border" /></div>

        {/* Level 3: Bureau */}
        {data.bureau.length > 0 && (
          <div className="mb-2">
            <div className="text-center mb-1">
              <span className="text-[6px] font-bold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                MEMBRES DU BUREAU
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {data.bureau.map(m => (
                <MiniAvatar key={m.id} member={m} size="md" showRole />
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center my-1"><div className="w-px h-3 bg-border" /></div>

        {/* Level 4: Chefs de famille */}
        {data.chefsFamille.length > 0 && (
          <div className="mb-2">
            <div className="text-center mb-1">
              <span className="text-[6px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                CHEFS DE FAMILLE
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {data.chefsFamille.map(m => (
                <MiniAvatar key={m.id} member={m} size="sm" showRole />
              ))}
            </div>
          </div>
        )}

        {/* Level 5: Gestionnaires */}
        {data.gestionnaires.length > 0 && (
          <div className="mb-2">
            <div className="text-center mb-1">
              <span className="text-[6px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                GESTIONNAIRES DE FAMILLE
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {data.gestionnaires.map(m => (
                <MiniAvatar key={m.id} member={m} size="sm" showRole />
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center my-1"><div className="w-px h-3 bg-border" /></div>

        {/* Level 6: Members by family */}
        <div>
          <div className="text-center mb-1">
            <span className="text-[6px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              MEMBRES ({allRegularMembers.length})
              {totalPages > 1 && ` - Page ${currentPage + 1}/${totalPages}`}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {data.families.map(family => {
              const familyMembers = paginatedByFamily[family.id] || [];
              if (familyMembers.length === 0) return null;
              return (
                <div key={family.id} className="border border-border/50 rounded p-1.5">
                  <div className="text-center mb-1">
                    <span className="text-[6px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded">
                      {family.name} ({familyMembers.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1">
                    {familyMembers.map(m => (
                      <MiniAvatar key={m.id} member={m} size="xs" />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-1 border-t border-border text-center">
          <p className="text-[6px] text-muted-foreground">
            ASSOJEREB © {new Date().getFullYear()} • Organigramme généré le {new Date().toLocaleDateString('fr-FR')}
            {totalPages > 1 && ` • Page ${currentPage + 1} sur ${totalPages}`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OrganizationalPyramid() {
  const { data, isLoading } = usePyramidData();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-2">
              <TreePine className="h-8 w-8 text-primary" />
              Organigramme
            </h1>
            <p className="text-muted-foreground mt-1">
              Pyramide organisationnelle de l'association — {data?.totalMembers || 0} membres
            </p>
          </div>
          <Button onClick={handlePrint} className="btn-primary-gradient">
            <Printer className="mr-2 h-4 w-4" />
            Imprimer (A4 Paysage)
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : data ? (
          <div ref={printRef} className="overflow-x-auto">
            <PrintableContent data={data} />
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Aucune donnée disponible
            </CardContent>
          </Card>
        )}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 5mm;
          }
          body * { visibility: hidden; }
          #pyramid-content, #pyramid-content * { visibility: visible; }
          #pyramid-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 287mm !important;
            min-height: auto !important;
            border: none !important;
            padding: 5mm !important;
          }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </AppLayout>
  );
}
