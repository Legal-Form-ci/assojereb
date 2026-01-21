import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useMembers, MemberFormData } from '@/hooks/useMembers';
import { useFamilies, useHouses, useContributionCategories } from '@/hooks/useReferenceData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { Gender, GeographicZone, MemberStatus } from '@/types/database';

export default function NewMemberPage() {
  const navigate = useNavigate();
  const { createMember } = useMembers();
  const { data: families } = useFamilies();
  const { data: houses } = useHouses();
  const { data: categories } = useContributionCategories();
  
  const [formData, setFormData] = useState<Partial<MemberFormData>>({
    gender: 'homme',
    geographic_zone: 'abidjan',
    status: 'actif',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name || !formData.family_id) {
      return;
    }

    await createMember.mutateAsync(formData as MemberFormData);
    navigate('/membres');
  };

  const updateField = (field: keyof MemberFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-serif text-3xl font-bold">Nouveau membre</h1>
            <p className="text-muted-foreground">Enregistrer un nouveau membre</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom *</Label>
                  <Input id="last_name" required value={formData.last_name || ''} onChange={(e) => updateField('last_name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom *</Label>
                  <Input id="first_name" required value={formData.first_name || ''} onChange={(e) => updateField('first_name', e.target.value)} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Genre *</Label>
                  <Select value={formData.gender} onValueChange={(v) => updateField('gender', v as Gender)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homme">Homme</SelectItem>
                      <SelectItem value="femme">Femme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date de naissance</Label>
                  <Input id="dob" type="date" value={formData.date_of_birth || ''} onChange={(e) => updateField('date_of_birth', e.target.value)} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Famille *</Label>
                  <Select value={formData.family_id} onValueChange={(v) => updateField('family_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                    <SelectContent>
                      {families?.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Maison</Label>
                  <Select value={formData.house_id} onValueChange={(v) => updateField('house_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                    <SelectContent>
                      {houses?.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profession">Profession</Label>
                  <Input id="profession" value={formData.profession || ''} onChange={(e) => updateField('profession', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Catégorie de cotisation</Label>
                  <Select value={formData.contribution_category_id} onValueChange={(v) => updateField('contribution_category_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                    <SelectContent>
                      {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} - {c.monthly_amount} FCFA</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" type="tel" value={formData.phone || ''} onChange={(e) => updateField('phone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input id="whatsapp" type="tel" value={formData.whatsapp || ''} onChange={(e) => updateField('whatsapp', e.target.value)} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Zone géographique</Label>
                  <Select value={formData.geographic_zone} onValueChange={(v) => updateField('geographic_zone', v as GeographicZone)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abidjan">Abidjan</SelectItem>
                      <SelectItem value="village">Village</SelectItem>
                      <SelectItem value="exterieur">Extérieur</SelectItem>
                      <SelectItem value="diaspora">Diaspora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select value={formData.status} onValueChange={(v) => updateField('status', v as MemberStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="actif">Actif</SelectItem>
                      <SelectItem value="inactif">Inactif</SelectItem>
                      <SelectItem value="sympathisant">Sympathisant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={formData.notes || ''} onChange={(e) => updateField('notes', e.target.value)} />
              </div>

              <Button type="submit" className="w-full btn-primary-gradient" disabled={createMember.isPending}>
                {createMember.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</> : <><Save className="mr-2 h-4 w-4" />Enregistrer</>}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}
