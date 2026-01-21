-- =============================================
-- APPLICATION ASSOJEREB - SCHÉMA COMPLET
-- =============================================

-- 1. ENUM TYPES
-- =============================================

-- Rôles utilisateurs
CREATE TYPE public.app_role AS ENUM ('admin', 'responsable', 'membre');

-- Statut membre
CREATE TYPE public.member_status AS ENUM ('actif', 'inactif', 'sympathisant');

-- Statut cotisation
CREATE TYPE public.contribution_status AS ENUM ('payee', 'en_attente', 'en_retard', 'annulee');

-- Type de cotisation
CREATE TYPE public.contribution_type AS ENUM ('mensuelle', 'exceptionnelle', 'adhesion');

-- Zone géographique
CREATE TYPE public.geographic_zone AS ENUM ('abidjan', 'village', 'exterieur', 'diaspora');

-- Genre
CREATE TYPE public.gender AS ENUM ('homme', 'femme');

-- 2. TABLES DE RÉFÉRENCE
-- =============================================

-- Les 6 grandes familles + Autres
CREATE TABLE public.families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Les 42 maisons du village
CREATE TABLE public.houses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    house_number INTEGER NOT NULL UNIQUE,
    family_id UUID REFERENCES public.families(id),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Catégories de cotisation (élèves, femmes, cadres, etc.)
CREATE TABLE public.contribution_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    monthly_amount INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. TABLES PRINCIPALES
-- =============================================

-- Profils utilisateurs (liés à auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rôles utilisateurs (sécurisé, séparé des profils)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL DEFAULT 'membre',
    family_id UUID REFERENCES public.families(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Membres de l'association
CREATE TABLE public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_number TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    gender gender NOT NULL,
    date_of_birth DATE,
    family_id UUID REFERENCES public.families(id) NOT NULL,
    house_id UUID REFERENCES public.houses(id),
    profession TEXT,
    contribution_category_id UUID REFERENCES public.contribution_categories(id),
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    geographic_zone geographic_zone NOT NULL DEFAULT 'abidjan',
    address TEXT,
    status member_status NOT NULL DEFAULT 'actif',
    photo_url TEXT,
    notes TEXT,
    registered_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cotisations exceptionnelles (décès, fêtes, projets)
CREATE TABLE public.exceptional_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    amount INTEGER NOT NULL,
    due_date DATE,
    is_mandatory BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Paiements des cotisations
CREATE TABLE public.contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    contribution_type contribution_type NOT NULL,
    amount INTEGER NOT NULL,
    period_month INTEGER,
    period_year INTEGER,
    exceptional_contribution_id UUID REFERENCES public.exceptional_contributions(id),
    status contribution_status NOT NULL DEFAULT 'en_attente',
    payment_method TEXT,
    payment_reference TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    recorded_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Historique des notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    user_id UUID,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. FONCTIONS UTILITAIRES
-- =============================================

-- Fonction pour vérifier les rôles (SECURITY DEFINER pour éviter récursion RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Fonction pour obtenir le rôle principal d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'responsable' THEN 2 
      ELSE 3 
    END
  LIMIT 1
$$;

-- Fonction pour générer le numéro de membre automatique
CREATE OR REPLACE FUNCTION public.generate_member_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_number TEXT;
  year_prefix TEXT;
  sequence_num INTEGER;
BEGIN
  year_prefix := TO_CHAR(NOW(), 'YY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(member_number FROM 4) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM public.members
  WHERE member_number LIKE 'AJ' || year_prefix || '%';
  
  new_number := 'AJ' || year_prefix || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$;

-- Trigger pour générer automatiquement le numéro de membre
CREATE OR REPLACE FUNCTION public.set_member_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.member_number IS NULL OR NEW.member_number = '' THEN
    NEW.member_number := public.generate_member_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_member_number
  BEFORE INSERT ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.set_member_number();

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contributions_updated_at
  BEFORE UPDATE ON public.contributions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contribution_categories_updated_at
  BEFORE UPDATE ON public.contribution_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exceptional_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies pour families (lecture publique, écriture admin)
CREATE POLICY "Familles visibles par tous les authentifiés"
  ON public.families FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins peuvent gérer les familles"
  ON public.families FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Policies pour houses (lecture publique, écriture admin)
CREATE POLICY "Maisons visibles par tous les authentifiés"
  ON public.houses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins peuvent gérer les maisons"
  ON public.houses FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Policies pour contribution_categories
CREATE POLICY "Catégories visibles par tous les authentifiés"
  ON public.contribution_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins peuvent gérer les catégories"
  ON public.contribution_categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Policies pour profiles
CREATE POLICY "Utilisateurs voient leur profil"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Utilisateurs peuvent modifier leur profil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent créer leur profil"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies pour user_roles (lecture par l'utilisateur, gestion par admin)
CREATE POLICY "Utilisateurs voient leurs rôles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins peuvent gérer les rôles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Policies pour members
CREATE POLICY "Membres visibles par authentifiés"
  ON public.members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins et responsables peuvent créer des membres"
  ON public.members FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'responsable')
  );

CREATE POLICY "Admins et responsables peuvent modifier les membres"
  ON public.members FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'responsable')
  );

CREATE POLICY "Admins peuvent supprimer les membres"
  ON public.members FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Policies pour exceptional_contributions
CREATE POLICY "Cotisations exceptionnelles visibles par tous"
  ON public.exceptional_contributions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins peuvent gérer les cotisations exceptionnelles"
  ON public.exceptional_contributions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Policies pour contributions
CREATE POLICY "Cotisations visibles par authentifiés"
  ON public.contributions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins et responsables peuvent créer des cotisations"
  ON public.contributions FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'responsable')
  );

CREATE POLICY "Admins et responsables peuvent modifier les cotisations"
  ON public.contributions FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'responsable')
  );

CREATE POLICY "Admins peuvent supprimer les cotisations"
  ON public.contributions FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Policies pour notifications
CREATE POLICY "Utilisateurs voient leurs notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins peuvent créer des notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Utilisateurs peuvent marquer leurs notifs comme lues"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());