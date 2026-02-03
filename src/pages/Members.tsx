import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useMembers } from '@/hooks/useMembers';
import { useFamilies, useContributionCategories } from '@/hooks/useReferenceData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Plus, Eye, Edit, Phone, FileText, Download, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { generateMemberListPDF, openPrintWindow } from '@/lib/pdfGenerator';
import { generateMembersCSV, downloadCSV } from '@/lib/excelGenerator';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 20;

export default function MembersPage() {
  const { isAdmin, isResponsable } = useAuth();
  const { members, isLoading } = useMembers();
  const { data: families } = useFamilies();
  const { data: categories } = useContributionCategories();
  
  const [search, setSearch] = useState('');
  const [familyFilter, setFamilyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [generating, setGenerating] = useState(false);

  const filteredMembers = members.filter((member) => {
    const matchesSearch = 
      member.first_name.toLowerCase().includes(search.toLowerCase()) ||
      member.last_name.toLowerCase().includes(search.toLowerCase()) ||
      member.member_number.toLowerCase().includes(search.toLowerCase());
    
    const matchesFamily = familyFilter === 'all' || member.family_id === familyFilter;
    const matchesCategory = categoryFilter === 'all' || member.contribution_category_id === categoryFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesFamily && matchesCategory && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getFilterDescription = () => {
    const parts = [];
    if (familyFilter !== 'all') {
      const family = families?.find(f => f.id === familyFilter);
      parts.push(`Famille: ${family?.name}`);
    }
    if (categoryFilter !== 'all') {
      const cat = categories?.find(c => c.id === categoryFilter);
      parts.push(`Catégorie: ${cat?.name}`);
    }
    if (statusFilter !== 'all') {
      parts.push(`Statut: ${statusFilter}`);
    }
    return parts.length > 0 ? parts.join(' • ') : 'Tous les membres';
  };

  const handleExportPDF = () => {
    setGenerating(true);
    try {
      const html = generateMemberListPDF(filteredMembers, {
        title: 'Liste des Membres - ASSOJEREB Brongonzué',
        subtitle: 'Répertoire officiel',
        filterInfo: getFilterDescription(),
      });
      openPrintWindow(html, 'liste-membres');
      toast.success('Document PDF généré');
    } catch (error) {
      toast.error('Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportExcel = () => {
    setGenerating(true);
    try {
      const csv = generateMembersCSV(filteredMembers);
      const timestamp = new Date().toISOString().split('T')[0];
      downloadCSV(csv, `membres-${timestamp}`);
      toast.success('Export Excel téléchargé');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    } finally {
      setGenerating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'actif':
        return <Badge className="bg-success/10 text-success border-0">Actif</Badge>;
      case 'inactif':
        return <Badge variant="secondary">Inactif</Badge>;
      case 'sympathisant':
        return <Badge className="bg-info/10 text-info border-0">Sympathisant</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold">Membres</h1>
            <p className="text-muted-foreground">Gérez les membres de l'association</p>
          </div>
          <div className="flex gap-2">
            {/* Export dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={generating || filteredMembers.length === 0}>
                  {generating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Exporter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportPDF}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export PDF / Imprimer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Excel (CSV)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {(isAdmin || isResponsable) && (
              <Button asChild className="btn-primary-gradient">
                <Link to="/membres/nouveau">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau membre
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou numéro..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Select value={familyFilter} onValueChange={(v) => { setFamilyFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Famille" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes familles</SelectItem>
              {families?.map((f) => (
                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="inactif">Inactif</SelectItem>
              <SelectItem value="sympathisant">Sympathisant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="card-elevated overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                <TableHead>Nom complet</TableHead>
                <TableHead className="hidden md:table-cell">Famille</TableHead>
                <TableHead className="hidden lg:table-cell">Catégorie</TableHead>
                <TableHead className="hidden lg:table-cell">Zone</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : paginatedMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {search || familyFilter !== 'all' || statusFilter !== 'all'
                      ? 'Aucun membre trouvé avec ces critères'
                      : 'Aucun membre enregistré'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-mono text-sm">{member.member_number}</TableCell>
                    <TableCell className="font-medium">
                      {member.last_name} {member.first_name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{member.family?.name}</TableCell>
                    <TableCell className="hidden lg:table-cell">{member.contribution_category?.name || '-'}</TableCell>
                    <TableCell className="hidden lg:table-cell capitalize">{member.geographic_zone}</TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {member.phone && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`tel:${member.phone}`}><Phone className="h-4 w-4" /></a>
                          </Button>
                        )}
                        {(isAdmin || isResponsable) && (
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/membres/${member.id}/modifier`}><Edit className="h-4 w-4" /></Link>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/membres/${member.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredMembers.length} membre{filteredMembers.length > 1 ? 's' : ''} trouvé{filteredMembers.length > 1 ? 's' : ''}
            {totalPages > 1 && ` • Page ${currentPage} sur ${totalPages}`}
          </p>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
              <div className="flex gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
