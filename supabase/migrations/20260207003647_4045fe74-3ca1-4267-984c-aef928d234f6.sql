-- PARTIE 2: Fonctions de permissions et realtime

-- 1. Fonction améliorée pour vérifier les rôles avec hiérarchie
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id uuid)
RETURNS TABLE(
  can_manage_members boolean,
  can_manage_contributions boolean,
  can_manage_news boolean,
  can_view_reports boolean,
  can_manage_roles boolean,
  can_audit boolean,
  family_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    role IN ('admin', 'president', 'president_adjoint', 'chef_famille', 'responsable') as can_manage_members,
    role IN ('admin', 'president', 'president_adjoint', 'tresorier', 'tresorier_adjoint', 'chef_famille', 'responsable') as can_manage_contributions,
    role IN ('admin', 'president', 'president_adjoint') as can_manage_news,
    role IN ('admin', 'president', 'president_adjoint', 'tresorier', 'tresorier_adjoint', 'commissaire_comptes') as can_view_reports,
    role IN ('admin') as can_manage_roles,
    role IN ('admin', 'commissaire_comptes') as can_audit,
    ur.family_id
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
  ORDER BY 
    CASE ur.role 
      WHEN 'admin' THEN 1 
      WHEN 'president' THEN 2 
      WHEN 'president_adjoint' THEN 3
      WHEN 'tresorier' THEN 4
      WHEN 'tresorier_adjoint' THEN 5
      WHEN 'commissaire_comptes' THEN 6
      WHEN 'chef_famille' THEN 7
      WHEN 'responsable' THEN 8
      ELSE 9 
    END
  LIMIT 1
$$;

-- 2. Fonction pour obtenir le label du rôle
CREATE OR REPLACE FUNCTION public.get_role_label(role_name app_role)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE role_name
    WHEN 'admin' THEN 'Super Administrateur'
    WHEN 'president' THEN 'Président'
    WHEN 'president_adjoint' THEN 'Président Adjoint'
    WHEN 'tresorier' THEN 'Trésorier'
    WHEN 'tresorier_adjoint' THEN 'Trésorier Adjoint'
    WHEN 'commissaire_comptes' THEN 'Commissaire aux Comptes'
    WHEN 'chef_famille' THEN 'Chef de Famille'
    WHEN 'responsable' THEN 'Responsable'
    WHEN 'membre' THEN 'Membre'
    ELSE 'Inconnu'
  END
$$;

-- 3. Activer le realtime sur les tables importantes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'contributions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.contributions;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.members;
  END IF;
END $$;