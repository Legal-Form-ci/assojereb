import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useMember, useMembers, MemberFormData } from '@/hooks/useMembers';
import { useFamilies, useHouses, useContributionCategories } from '@/hooks/useReferenceData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ArrowLeft, Save, User, X } from 'lucide-react';
import { Gender, GeographicZone, MemberStatus } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function EditMemberPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: member, isLoading: memberLoading } = useMember(id);
  const { updateMember } = useMembers();
  const { data: families } = useFamilies();
  const { data: houses } = useHouses();
  const { data: categories } = useContributionCategories();
  
  const [formData, setFormData] = useState<Partial<MemberFormData>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Veuillez sélectionner une image'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('La photo ne doit pas dépasser 5 Mo'); return; }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormData(prev => ({ ...prev, photo_url: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null;
    setUploadingPhoto(true);
    try {
      const fileName = `members/${Date.now()}-${Math.random().toString(36).substring(7)}-${photoFile.name}`;
      const { data, error } = await supabase.storage.from('news-media').upload(fileName, photoFile);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('news-media').getPublicUrl(data.path);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('Erreur lors du téléchargement de la photo');
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  useEffect(() => {
    if (member && !isInitialized) {
      setFormData({
        first_name: member.first_name,
        last_name: member.last_name,
        gender: member.gender,
        date_of_birth: member.date_of_birth || '',
        family_id: member.family_id,
        house_id: member.house_id || '',
        profession: member.profession || '',
        contribution_category_id: member.contribution_category_id || '',
        phone: member.phone || '',
        whatsapp: member.whatsapp || '',
        email: member.email || '',
        geographic_zone: member.geographic_zone,
        address: member.address || '',
        status: member.status,
        notes: member.notes || '',
        photo_url: member.photo_url || '',
      });
      if (member.photo_url) setPhotoPreview(member.photo_url);
      setIsInitialized(true);
    }
  }, [member, isInitialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.family_id || !id) return;

    let photoUrl = formData.photo_url || null;
    if (photoFile) {
      photoUrl = await uploadPhoto();
    }

    await updateMember.mutateAsync({ id, ...formData as MemberFormData, photo_url: photoUrl });
    navigate(`/membres/${id}`);
  };

  const updateField = (field: keyof MemberFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (memberLoading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Card className="card-elevated">
            <CardContent className="space-y-4 pt-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!member) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Membre non trouvé</h3>
          <Button variant="outline" onClick={() => navigate('/membres')}>
            Retour à la liste
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-serif text-3xl font-bold">Modifier le membre</h1>
            <p className="text-muted-foreground">{member.member_number} - {member.last_name} {member.first_name}</p>
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

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" type="tel" value={formData.phone || ''} onChange={(e) => updateField('phone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input id="whatsapp" type="tel" value={formData.whatsapp || ''} onChange={(e) => updateField('whatsapp', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email || ''} onChange={(e) => updateField('email', e.target.value)} />
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
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" value={formData.address || ''} onChange={(e) => updateField('address', e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={formData.notes || ''} onChange={(e) => updateField('notes', e.target.value)} />
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                  Annuler
                </Button>
                <Button type="submit" className="flex-1 btn-primary-gradient" disabled={updateMember.isPending}>
                  {updateMember.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</> : <><Save className="mr-2 h-4 w-4" />Enregistrer</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}
