import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Member } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ArrowLeft, User, Phone, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import logoAssojereb from '@/assets/logo-assojereb.png';

export default function MemberVerification() {
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMember = async () => {
      if (!id) {
        setError('ID membre invalide');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('members')
          .select(`
            *,
            family:families(id, name),
            house:houses(id, name, house_number),
            contribution_category:contribution_categories(id, name, monthly_amount)
          `)
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        if (!data) {
          setError('Membre non trouvé');
          return;
        }

        setMember(data as unknown as Member);
      } catch (err) {
        console.error('Error fetching member:', err);
        setError('Impossible de vérifier ce membre');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-pulse">
          <CardHeader className="text-center">
            <div className="h-16 w-16 bg-muted rounded-full mx-auto mb-4" />
            <div className="h-6 bg-muted rounded w-48 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Vérification échouée</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error || 'Membre non trouvé'}</p>
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isActive = member.status === 'actif';

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md overflow-hidden">
        {/* Header */}
        <CardHeader className={`text-center ${isActive ? 'bg-success' : 'bg-destructive'} text-white`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src={logoAssojereb} 
              alt="Logo ASSOJEREB" 
              className="w-12 h-12 rounded-full object-cover border-2 border-white/50"
            />
            <div>
              <h2 className="font-serif font-bold text-lg">ASSOJEREB</h2>
              <p className="text-xs opacity-90">Brongonzué</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            {isActive ? (
              <>
                <CheckCircle className="w-8 h-8" />
                <span className="text-xl font-bold">Membre Vérifié</span>
              </>
            ) : (
              <>
                <XCircle className="w-8 h-8" />
                <span className="text-xl font-bold">Membre {member.status}</span>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Photo et nom */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center overflow-hidden">
              {member.photo_url ? (
                <img 
                  src={member.photo_url} 
                  alt={`${member.first_name} ${member.last_name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold">{member.last_name}</h3>
              <p className="text-primary text-lg font-medium">{member.first_name}</p>
              <p className="text-sm text-muted-foreground">N° {member.member_number}</p>
            </div>
          </div>

          {/* Statut */}
          <div className="flex items-center justify-center">
            <Badge 
              className={`text-lg px-6 py-2 ${
                isActive 
                  ? 'bg-success text-white' 
                  : member.status === 'sympathisant'
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {member.status.toUpperCase()}
            </Badge>
          </div>

          {/* Informations */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Famille:</span>
              <span className="font-medium ml-auto">{member.family?.name || '-'}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Zone:</span>
              <span className="font-medium ml-auto capitalize">{member.geographic_zone}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Genre:</span>
              <span className="font-medium ml-auto">
                {member.gender === 'homme' ? 'Homme' : 'Femme'}
              </span>
            </div>

            {member.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Téléphone:</span>
                <span className="font-medium ml-auto">{member.phone}</span>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Membre depuis:</span>
              <span className="font-medium ml-auto">
                {format(new Date(member.created_at), 'MMMM yyyy', { locale: fr })}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t text-center">
            <p className="text-xs text-muted-foreground mb-4">
              Vérifié le {format(new Date(), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
