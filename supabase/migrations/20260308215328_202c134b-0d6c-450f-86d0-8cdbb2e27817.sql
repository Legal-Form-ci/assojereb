-- =====================================================
-- SECURITY HARDENING: Fix RLS policies to PERMISSIVE
-- and add missing triggers
-- =====================================================

-- 1. Recreate families SELECT policy as PERMISSIVE
DROP POLICY IF EXISTS "Familles visibles par tous les authentifiés" ON public.families;
CREATE POLICY "Familles visibles par tous les authentifiés"
  ON public.families FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins peuvent gérer les familles" ON public.families;
CREATE POLICY "Admins peuvent gérer les familles"
  ON public.families FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Fix houses policies
DROP POLICY IF EXISTS "Maisons visibles par tous les authentifiés" ON public.houses;
CREATE POLICY "Maisons visibles par tous les authentifiés"
  ON public.houses FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins peuvent gérer les maisons" ON public.houses;
CREATE POLICY "Admins peuvent gérer les maisons"
  ON public.houses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Fix contribution_categories policies
DROP POLICY IF EXISTS "Catégories visibles par tous les authentifiés" ON public.contribution_categories;
CREATE POLICY "Catégories visibles par tous les authentifiés"
  ON public.contribution_categories FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins peuvent gérer les catégories" ON public.contribution_categories;
CREATE POLICY "Admins peuvent gérer les catégories"
  ON public.contribution_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Fix exceptional_contributions policies
DROP POLICY IF EXISTS "Cotisations exceptionnelles visibles par tous" ON public.exceptional_contributions;
CREATE POLICY "Cotisations exceptionnelles visibles par tous"
  ON public.exceptional_contributions FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins peuvent gérer les cotisations exceptionnelles" ON public.exceptional_contributions;
CREATE POLICY "Admins peuvent gérer les cotisations exceptionnelles"
  ON public.exceptional_contributions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Fix user_roles policies
DROP POLICY IF EXISTS "Utilisateurs voient leurs rôles" ON public.user_roles;
CREATE POLICY "Utilisateurs voient leurs rôles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins peuvent gérer les rôles" ON public.user_roles;
CREATE POLICY "Admins peuvent gérer les rôles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow new users to insert their own role during signup
DROP POLICY IF EXISTS "Users can insert own role on signup" ON public.user_roles;
CREATE POLICY "Users can insert own role on signup"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'membre');

-- 6. Fix profiles policies
DROP POLICY IF EXISTS "Utilisateurs peuvent créer leur profil" ON public.profiles;
CREATE POLICY "Utilisateurs peuvent créer leur profil"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Utilisateurs peuvent modifier leur profil" ON public.profiles;
CREATE POLICY "Utilisateurs peuvent modifier leur profil"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Utilisateurs voient leur profil" ON public.profiles;
CREATE POLICY "Utilisateurs voient leur profil"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 7. Ensure triggers exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_members_updated_at') THEN
    CREATE TRIGGER update_members_updated_at
      BEFORE UPDATE ON public.members
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contributions_updated_at') THEN
    CREATE TRIGGER update_contributions_updated_at
      BEFORE UPDATE ON public.contributions
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_news_updated_at') THEN
    CREATE TRIGGER update_news_updated_at
      BEFORE UPDATE ON public.news
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_member_number_trigger') THEN
    CREATE TRIGGER set_member_number_trigger
      BEFORE INSERT ON public.members
      FOR EACH ROW EXECUTE FUNCTION public.set_member_number();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_news_slug_trigger') THEN
    CREATE TRIGGER set_news_slug_trigger
      BEFORE INSERT ON public.news
      FOR EACH ROW EXECUTE FUNCTION public.set_news_slug();
  END IF;
END;
$$;