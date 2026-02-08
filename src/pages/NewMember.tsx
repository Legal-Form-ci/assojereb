import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useMembers, MemberFormData } from '@/hooks/useMembers';
import { useFamilies, useHouses, useContributionCategories } from '@/hooks/useReferenceData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, Save, Eye, EyeOff, Info, Upload, User, X } from 'lucide-react';
import { Gender, GeographicZone, MemberStatus } from '@/types/database';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [showPassword, setShowPassword] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La photo ne doit pas dépasser 5 Mo');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null;
    
    setUploadingPhoto(true);
    try {
      const fileName = `members/${Date.now()}-${Math.random().toString(36).substring(7)}-${photoFile.name}`;
      const { data, error } = await supabase.storage
        .from('news-media')
        .upload(fileName, photoFile);
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('news-media')
        .getPublicUrl(data.path);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('Erreur lors du téléchargement de la photo');
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name || !formData.family_id) {
      return;
    }

    // Upload photo first if exists
    let photoUrl = null;
    if (photoFile) {
      photoUrl = await uploadPhoto();
    }

    await createMember.mutateAsync({
      ...formData,
      photo_url: photoUrl,
    } as MemberFormData);
    
    navigate('/membres');
  };

  const updateField = (field: keyof MemberFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isPending = createMember.isPending || uploadingPhoto;

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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Section */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Photo du membre</CardTitle>
              <CardDescription>
                La photo sera utilisée pour la carte de membre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div 
                  className="relative w-32 h-32 rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer overflow-hidden bg-muted/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoPreview ? (
                    <>
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto();
                        }}
                        className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <User className="h-10 w-10 text-muted-foreground/50" />
                      <span className="text-xs text-muted-foreground">Cliquez pour ajouter</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Formats acceptés : JPG, PNG, GIF<br />
                    Taille maximale : 5 Mo<br />
                    Recommandé : Photo d'identité récente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                      <SelectItem value="ville_interieur">Ville de l'intérieur</SelectItem>
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
                <Textarea id="address" value={formData.address || ''} onChange={(e) => updateField('address', e.target.value)} placeholder="Adresse complète" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={formData.notes || ''} onChange={(e) => updateField('notes', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Section Accès membre */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Accès membre</CardTitle>
              <CardDescription>
                Créez un compte pour permettre au membre de se connecter à l'application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Si vous renseignez un email et un mot de passe, un compte sera créé automatiquement. 
                  Le membre devra changer son mot de passe lors de sa première connexion.
                </AlertDescription>
              </Alert>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email || ''} 
                    onChange={(e) => updateField('email', e.target.value)} 
                    placeholder="membre@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe initial</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? 'text' : 'password'} 
                      value={formData.password || ''} 
                      onChange={(e) => updateField('password', e.target.value)} 
                      placeholder="••••••••"
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full btn-primary-gradient" disabled={isPending}>
            {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{uploadingPhoto ? 'Téléchargement photo...' : 'Enregistrement...'}</> : <><Save className="mr-2 h-4 w-4" />Enregistrer</>}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
