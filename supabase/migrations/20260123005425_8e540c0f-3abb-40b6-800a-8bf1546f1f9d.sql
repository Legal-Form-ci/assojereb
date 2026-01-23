-- Table des actualités/communiqués pour la page d'accueil
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general', -- 'deces', 'mariage', 'anniversaire', 'communique', 'opportunite', 'projet', 'evenement', 'general'
  image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Policies pour les actualités
CREATE POLICY "Actualités publiées visibles par tous" 
ON public.news 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins peuvent tout voir" 
ON public.news 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins peuvent créer des actualités" 
ON public.news 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins peuvent modifier des actualités" 
ON public.news 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins peuvent supprimer des actualités" 
ON public.news 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Ajouter le champ must_change_password sur profiles
ALTER TABLE public.profiles 
ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT false;

-- Ajouter le lien user_id dans members pour associer membre à utilisateur
ALTER TABLE public.members 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Créer un index pour la recherche
CREATE INDEX idx_news_published_at ON public.news(published_at DESC);
CREATE INDEX idx_news_category ON public.news(category);
CREATE INDEX idx_members_user_id ON public.members(user_id);

-- Trigger pour updated_at sur news
CREATE TRIGGER update_news_updated_at
BEFORE UPDATE ON public.news
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Mettre à jour la politique RLS sur members pour chefs de famille
-- D'abord supprimer l'ancienne politique de SELECT
DROP POLICY IF EXISTS "Membres visibles par authentifiés" ON public.members;

-- Nouvelle politique: Les admins voient tout, les responsables voient leurs membres de famille, les membres voient tous
CREATE POLICY "Membres visibles par rôle"
ON public.members
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR 
  -- Les responsables de famille voient les membres de leur famille
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'responsable'
    AND ur.family_id = members.family_id
  )
  OR
  -- Les membres normaux peuvent voir tous les membres (lecture seule)
  public.has_role(auth.uid(), 'membre'::app_role)
);

-- Mettre à jour la politique INSERT pour members - chefs de famille peuvent créer
DROP POLICY IF EXISTS "Admins et responsables peuvent créer des membres" ON public.members;

CREATE POLICY "Admins et responsables peuvent créer des membres"
ON public.members
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR 
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'responsable'
    AND ur.family_id = members.family_id
  )
);

-- Mettre à jour la politique UPDATE pour members
DROP POLICY IF EXISTS "Admins et responsables peuvent modifier les membres" ON public.members;

CREATE POLICY "Admins et responsables peuvent modifier les membres"
ON public.members
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR 
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'responsable'
    AND ur.family_id = members.family_id
  )
);