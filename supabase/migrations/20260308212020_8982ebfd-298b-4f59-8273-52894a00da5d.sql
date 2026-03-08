
-- Fix all restrictive policies to permissive

-- families
DROP POLICY IF EXISTS "Admins peuvent gérer les familles" ON public.families;
CREATE POLICY "Admins peuvent gérer les familles" ON public.families FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Familles visibles par tous les authentifiés" ON public.families;
CREATE POLICY "Familles visibles par tous les authentifiés" ON public.families FOR SELECT TO authenticated USING (true);

-- houses
DROP POLICY IF EXISTS "Admins peuvent gérer les maisons" ON public.houses;
CREATE POLICY "Admins peuvent gérer les maisons" ON public.houses FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Maisons visibles par tous les authentifiés" ON public.houses;
CREATE POLICY "Maisons visibles par tous les authentifiés" ON public.houses FOR SELECT TO authenticated USING (true);

-- contribution_categories
DROP POLICY IF EXISTS "Admins peuvent gérer les catégories" ON public.contribution_categories;
CREATE POLICY "Admins peuvent gérer les catégories" ON public.contribution_categories FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Catégories visibles par tous les authentifiés" ON public.contribution_categories;
CREATE POLICY "Catégories visibles par tous les authentifiés" ON public.contribution_categories FOR SELECT TO authenticated USING (true);

-- members: make SELECT permissive and add broader visibility
DROP POLICY IF EXISTS "Membres visibles par rôle" ON public.members;
CREATE POLICY "Membres visibles par rôle" ON public.members FOR SELECT TO authenticated USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'president'::app_role)
  OR has_role(auth.uid(), 'president_adjoint'::app_role)
  OR has_role(auth.uid(), 'tresorier'::app_role)
  OR has_role(auth.uid(), 'tresorier_adjoint'::app_role)
  OR has_role(auth.uid(), 'commissaire_comptes'::app_role)
  OR (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'responsable'::app_role AND ur.family_id = members.family_id))
  OR (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'chef_famille'::app_role AND ur.family_id = members.family_id))
  OR (members.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins et responsables peuvent créer des membres" ON public.members;
CREATE POLICY "Admins et responsables peuvent créer des membres" ON public.members FOR INSERT TO authenticated WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'president'::app_role)
  OR has_role(auth.uid(), 'president_adjoint'::app_role)
  OR (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'responsable'::app_role AND ur.family_id = members.family_id))
);

DROP POLICY IF EXISTS "Admins et responsables peuvent modifier les membres" ON public.members;
CREATE POLICY "Admins et responsables peuvent modifier les membres" ON public.members FOR UPDATE TO authenticated USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'president'::app_role)
  OR has_role(auth.uid(), 'president_adjoint'::app_role)
  OR (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'responsable'::app_role AND ur.family_id = members.family_id))
  OR (members.user_id = auth.uid())
);

-- contributions: broader access
DROP POLICY IF EXISTS "Cotisations visibles par authentifiés" ON public.contributions;
CREATE POLICY "Cotisations visibles par authentifiés" ON public.contributions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins et responsables peuvent créer des cotisations" ON public.contributions;
CREATE POLICY "Admins et responsables peuvent créer des cotisations" ON public.contributions FOR INSERT TO authenticated WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'president'::app_role)
  OR has_role(auth.uid(), 'tresorier'::app_role)
  OR has_role(auth.uid(), 'tresorier_adjoint'::app_role)
  OR has_role(auth.uid(), 'responsable'::app_role)
);

DROP POLICY IF EXISTS "Admins et responsables peuvent modifier les cotisations" ON public.contributions;
CREATE POLICY "Admins et responsables peuvent modifier les cotisations" ON public.contributions FOR UPDATE TO authenticated USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'president'::app_role)
  OR has_role(auth.uid(), 'tresorier'::app_role)
  OR has_role(auth.uid(), 'tresorier_adjoint'::app_role)
  OR has_role(auth.uid(), 'responsable'::app_role)
);

-- news: allow public SELECT for published
DROP POLICY IF EXISTS "Actualités publiées visibles par tous" ON public.news;
CREATE POLICY "Actualités publiées visibles par tous" ON public.news FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admins peuvent tout voir" ON public.news;
CREATE POLICY "Admins peuvent tout voir" ON public.news FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins peuvent créer des actualités" ON public.news;
CREATE POLICY "Admins peuvent créer des actualités" ON public.news FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins peuvent modifier des actualités" ON public.news;
CREATE POLICY "Admins peuvent modifier des actualités" ON public.news FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins peuvent supprimer des actualités" ON public.news;
CREATE POLICY "Admins peuvent supprimer des actualités" ON public.news FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- user_roles
DROP POLICY IF EXISTS "Admins peuvent gérer les rôles" ON public.user_roles;
CREATE POLICY "Admins peuvent gérer les rôles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Utilisateurs voient leurs rôles" ON public.user_roles;
CREATE POLICY "Utilisateurs voient leurs rôles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

-- profiles
DROP POLICY IF EXISTS "Utilisateurs voient leur profil" ON public.profiles;
CREATE POLICY "Utilisateurs voient leur profil" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Utilisateurs peuvent créer leur profil" ON public.profiles;
CREATE POLICY "Utilisateurs peuvent créer leur profil" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Utilisateurs peuvent modifier leur profil" ON public.profiles;
CREATE POLICY "Utilisateurs peuvent modifier leur profil" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- notifications
DROP POLICY IF EXISTS "Utilisateurs voient leurs notifications" ON public.notifications;
CREATE POLICY "Utilisateurs voient leurs notifications" ON public.notifications FOR SELECT TO authenticated USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins peuvent créer des notifications" ON public.notifications;
CREATE POLICY "Admins peuvent créer des notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Utilisateurs peuvent marquer leurs notifs comme lues" ON public.notifications;
CREATE POLICY "Utilisateurs peuvent marquer leurs notifs comme lues" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- exceptional_contributions
DROP POLICY IF EXISTS "Admins peuvent gérer les cotisations exceptionnelles" ON public.exceptional_contributions;
CREATE POLICY "Admins peuvent gérer les cotisations exceptionnelles" ON public.exceptional_contributions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Cotisations exceptionnelles visibles par tous" ON public.exceptional_contributions;
CREATE POLICY "Cotisations exceptionnelles visibles par tous" ON public.exceptional_contributions FOR SELECT TO authenticated USING (true);

-- Update get_user_permissions to include all roles properly
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id uuid)
RETURNS TABLE(can_manage_members boolean, can_manage_contributions boolean, can_manage_news boolean, can_view_reports boolean, can_manage_roles boolean, can_audit boolean, family_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    role IN ('admin', 'president', 'president_adjoint', 'responsable') as can_manage_members,
    role IN ('admin', 'president', 'president_adjoint', 'tresorier', 'tresorier_adjoint', 'responsable') as can_manage_contributions,
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

-- Update get_role_label
CREATE OR REPLACE FUNCTION public.get_role_label(role_name app_role)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT CASE role_name
    WHEN 'admin' THEN 'Super Administrateur'
    WHEN 'president' THEN 'Président'
    WHEN 'president_adjoint' THEN 'Président Adjoint'
    WHEN 'tresorier' THEN 'Trésorier'
    WHEN 'tresorier_adjoint' THEN 'Trésorier Adjoint'
    WHEN 'commissaire_comptes' THEN 'Commissaire aux Comptes'
    WHEN 'chef_famille' THEN 'Chef de Famille'
    WHEN 'responsable' THEN 'Gestionnaire de Famille'
    WHEN 'membre' THEN 'Membre'
    ELSE 'Inconnu'
  END
$$;
