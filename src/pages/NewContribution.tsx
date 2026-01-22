import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useContributions, ContributionFormData } from '@/hooks/useContributions';
import { useMembers } from '@/hooks/useMembers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Save } from 'lucide-react';

const months = [
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function NewContributionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedMemberId = searchParams.get('member');
  
  const { members } = useMembers();
  const { createContribution } = useContributions();
  
  const [formData, setFormData] = useState<Partial<ContributionFormData>>({
    contribution_type: 'mensuelle',
    status: 'payee',
    period_month: new Date().getMonth() + 1,
    period_year: currentYear,
    member_id: preselectedMemberId || '',
  });

  // Update amount when member is selected
  useEffect(() => {
    if (formData.member_id && formData.contribution_type === 'mensuelle') {
      const member = members.find(m => m.id === formData.member_id);
      if (member?.contribution_category?.monthly_amount) {
        setFormData(prev => ({
          ...prev,
          amount: member.contribution_category!.monthly_amount,
        }));
      }
    }
  }, [formData.member_id, formData.contribution_type, members]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.member_id || !formData.amount) {
      return;
    }

    await createContribution.mutateAsync({
      ...formData,
      paid_at: formData.status === 'payee' ? new Date().toISOString() : undefined,
    } as ContributionFormData);
    
    navigate('/cotisations');
  };

  const updateField = (field: keyof ContributionFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedMember = members.find(m => m.id === formData.member_id);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-serif text-3xl font-bold">Enregistrer un paiement</h1>
            <p className="text-muted-foreground">Enregistrer une cotisation pour un membre</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Détails de la cotisation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Membre *</Label>
                <Select 
                  value={formData.member_id} 
                  onValueChange={(v) => updateField('member_id', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un membre..." />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.member_number} - {m.last_name} {m.first_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedMember?.contribution_category && (
                  <p className="text-sm text-muted-foreground">
                    Catégorie: {selectedMember.contribution_category.name} - 
                    {' '}{selectedMember.contribution_category.monthly_amount} FCFA/mois
                  </p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type de cotisation *</Label>
                  <Select 
                    value={formData.contribution_type} 
                    onValueChange={(v) => updateField('contribution_type', v)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensuelle">Mensuelle</SelectItem>
                      <SelectItem value="adhesion">Adhésion</SelectItem>
                      <SelectItem value="exceptionnelle">Exceptionnelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Statut *</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(v) => updateField('status', v)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payee">Payée</SelectItem>
                      <SelectItem value="en_attente">En attente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.contribution_type === 'mensuelle' && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mois</Label>
                    <Select 
                      value={String(formData.period_month)} 
                      onValueChange={(v) => updateField('period_month', parseInt(v))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {months.map((m) => (
                          <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Année</Label>
                    <Select 
                      value={String(formData.period_year)} 
                      onValueChange={(v) => updateField('period_year', parseInt(v))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {years.map((y) => (
                          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Montant (FCFA) *</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    required
                    value={formData.amount || ''} 
                    onChange={(e) => updateField('amount', parseInt(e.target.value) || 0)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mode de paiement</Label>
                  <Select 
                    value={formData.payment_method || ''} 
                    onValueChange={(v) => updateField('payment_method', v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="especes">Espèces</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="virement">Virement bancaire</SelectItem>
                      <SelectItem value="carte">Carte bancaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Référence de paiement</Label>
                <Input 
                  id="reference" 
                  value={formData.payment_reference || ''} 
                  onChange={(e) => updateField('payment_reference', e.target.value)}
                  placeholder="Numéro de transaction, reçu, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  value={formData.notes || ''} 
                  onChange={(e) => updateField('notes', e.target.value)} 
                />
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary-gradient" 
                disabled={createContribution.isPending}
              >
                {createContribution.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}
