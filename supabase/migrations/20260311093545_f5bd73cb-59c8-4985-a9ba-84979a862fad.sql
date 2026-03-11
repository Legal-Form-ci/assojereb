-- Drop ALL existing policies and recreate as PERMISSIVE

-- ============ FAMILIES ============
DROP POLICY IF EXISTS "Admins peuvent gérer les familles" ON public.families;
DROP POLICY IF EXISTS "Familles visibles par tous les authentifiés" ON public.families;
CREATE POLICY "Familles visibles par tous les authentifiés" ON public.families FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins peuvent gérer les familles" ON public.families FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ HOUSES ============
DROP POLICY IF EXISTS "Admins peuvent gérer les maisons" ON public.houses;
DROP POLICY IF EXISTS "Maisons visibles par tous les authentifiés" ON public.houses;
CREATE POLICY "Maisons visibles par tous les authentifiés" ON public.houses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins peuvent gérer les maisons" ON public.houses FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ CONTRIBUTION_CATEGORIES ============
DROP POLICY IF EXISTS "Admins peuvent gérer les catégories" ON public.contribution_categories;
DROP POLICY IF EXISTS "Catégories visibles par tous les authentifiés" ON public.contribution_categories;
CREATE POLICY "Catégories visibles par tous les authentifiés" ON public.contribution_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins peuvent gérer les catégories" ON public.contribution_categories FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ MEMBERS ============
DROP POLICY IF EXISTS "Membres visibles par rôle" ON public.members;
DROP POLICY IF EXISTS "Admins et responsables peuvent créer des membres" ON public.members;
DROP POLICY IF EXISTS "Admins et responsables peuvent modifier les membres" ON public.members;
DROP POLICY IF EXISTS "Admins peuvent supprimer les membres" ON public.members;
CREATE POLICY "Membres visibles par rôle" ON public.members FOR SELECT TO authenticated USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'president'::app_role) OR has_role(auth.uid(), 'president_adjoint'::app_role) OR has_role(auth.uid(), 'tresorier'::app_role) OR has_role(auth.uid(), 'tresorier_adjoint'::app_role) OR has_role(auth.uid(), 'commissaire_comptes'::app_role)
  OR EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'responsable'::app_role AND ur.family_id = members.family_id)
  OR EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'chef_famille'::app_role AND ur.family_id = members.family_id)
  OR user_id = auth.uid()
);
CREATE POLICY "Admins et responsables peuvent créer des membres" ON public.members FOR INSERT TO authenticated WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'president'::app_role) OR has_role(auth.uid(), 'president_adjoint'::app_role)
  OR EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'responsable'::app_role AND ur.family_id = members.family_id)
);
CREATE POLICY "Admins et responsables peuvent modifier les membres" ON public.members FOR UPDATE TO authenticated USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'president'::app_role) OR has_role(auth.uid(), 'president_adjoint'::app_role)
  OR EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'responsable'::app_role AND ur.family_id = members.family_id)
);
CREATE POLICY "Admins peuvent supprimer les membres" ON public.members FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ CONTRIBUTIONS ============
DROP POLICY IF EXISTS "Cotisations visibles par rôle et propriétaire" ON public.contributions;
DROP POLICY IF EXISTS "Admins et responsables peuvent créer des cotisations" ON public.contributions;
DROP POLICY IF EXISTS "Admins et responsables peuvent modifier les cotisations" ON public.contributions;
DROP POLICY IF EXISTS "Admins peuvent supprimer les cotisations" ON public.contributions;
CREATE POLICY "Cotisations visibles par rôle et propriétaire" ON public.contributions FOR SELECT TO authenticated USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'president'::app_role) OR has_role(auth.uid(), 'president_adjoint'::app_role) OR has_role(auth.uid(), 'tresorier'::app_role) OR has_role(auth.uid(), 'tresorier_adjoint'::app_role) OR has_role(auth.uid(), 'commissaire_comptes'::app_role)
  OR EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'responsable'::app_role AND ur.family_id IN (SELECT m.family_id FROM members m WHERE m.id = contributions.member_id))
  OR EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'chef_famille'::app_role AND ur.family_id IN (SELECT m.family_id FROM members m WHERE m.id = contributions.member_id))
  OR EXISTS (SELECT 1 FROM members m WHERE m.id = contributions.member_id AND m.user_id = auth.uid())
);
CREATE POLICY "Admins et responsables peuvent créer des cotisations" ON public.contributions FOR INSERT TO authenticated WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'president'::app_role) OR has_role(auth.uid(), 'tresorier'::app_role) OR has_role(auth.uid(), 'tresorier_adjoint'::app_role) OR has_role(auth.uid(), 'responsable'::app_role)
);
CREATE POLICY "Admins et responsables peuvent modifier les cotisations" ON public.contributions FOR UPDATE TO authenticated USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'president'::app_role) OR has_role(auth.uid(), 'tresorier'::app_role) OR has_role(auth.uid(), 'tresorier_adjoint'::app_role) OR has_role(auth.uid(), 'responsable'::app_role)
);
CREATE POLICY "Admins peuvent supprimer les cotisations" ON public.contributions FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ EXCEPTIONAL_CONTRIBUTIONS ============
DROP POLICY IF EXISTS "Admins peuvent gérer les cotisations exceptionnelles" ON public.exceptional_contributions;
DROP POLICY IF EXISTS "Cotisations exceptionnelles visibles par tous" ON public.exceptional_contributions;
DROP POLICY IF EXISTS "Trésoriers peuvent gérer les cotisations exceptionnelles" ON public.exceptional_contributions;
CREATE POLICY "Cotisations exceptionnelles visibles par tous" ON public.exceptional_contributions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins peuvent gérer les cotisations exceptionnelles" ON public.exceptional_contributions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Trésoriers peuvent gérer les cotisations exceptionnelles" ON public.exceptional_contributions FOR ALL TO authenticated USING (
  has_role(auth.uid(), 'tresorier'::app_role) OR has_role(auth.uid(), 'tresorier_adjoint'::app_role) OR has_role(auth.uid(), 'president'::app_role) OR has_role(auth.uid(), 'president_adjoint'::app_role)
) WITH CHECK (
  has_role(auth.uid(), 'tresorier'::app_role) OR has_role(auth.uid(), 'tresorier_adjoint'::app_role) OR has_role(auth.uid(), 'president'::app_role) OR has_role(auth.uid(), 'president_adjoint'::app_role)
);

-- ============ PROFILES ============
DROP POLICY IF EXISTS "Utilisateurs peuvent créer leur profil" ON public.profiles;
DROP POLICY IF EXISTS "Utilisateurs peuvent modifier leur profil" ON public.profiles;
DROP POLICY IF EXISTS "Utilisateurs voient leur profil" ON public.profiles;
CREATE POLICY "Utilisateurs voient leur profil" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Utilisateurs peuvent créer leur profil" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Utilisateurs peuvent modifier leur profil" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ============ USER_ROLES ============
DROP POLICY IF EXISTS "Admins peuvent gérer les rôles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own role on signup" ON public.user_roles;
DROP POLICY IF EXISTS "Utilisateurs voient leurs rôles" ON public.user_roles;
CREATE POLICY "Utilisateurs voient leurs rôles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert own role on signup" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND role = 'membre'::app_role);
CREATE POLICY "Admins peuvent gérer les rôles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ NOTIFICATIONS ============
DROP POLICY IF EXISTS "Utilisateurs voient leurs notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins peuvent créer des notifications" ON public.notifications;
DROP POLICY IF EXISTS "Utilisateurs peuvent marquer leurs notifs comme lues" ON public.notifications;
CREATE POLICY "Utilisateurs voient leurs notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins peuvent créer des notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Utilisateurs peuvent marquer leurs notifs comme lues" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- ============ NOTIFICATION_SETTINGS ============
DROP POLICY IF EXISTS "Users can manage their notification settings" ON public.notification_settings;
CREATE POLICY "Users can manage their notification settings" ON public.notification_settings FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============ NOTIFICATION_QUEUE ============
DROP POLICY IF EXISTS "Admins can manage notification queue" ON public.notification_queue;
DROP POLICY IF EXISTS "Users can view their own notifications in queue" ON public.notification_queue;
CREATE POLICY "Admins can manage notification queue" ON public.notification_queue FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view their own notifications in queue" ON public.notification_queue FOR SELECT TO authenticated USING (
  recipient_member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
);

-- ============ NOTIFICATION_TEMPLATES ============
DROP POLICY IF EXISTS "Admins can manage notification templates" ON public.notification_templates;
CREATE POLICY "Admins can manage notification templates" ON public.notification_templates FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ NEWS ============
DROP POLICY IF EXISTS "Actualités publiées visibles par tous" ON public.news;
DROP POLICY IF EXISTS "Admins peuvent créer des actualités" ON public.news;
DROP POLICY IF EXISTS "Admins peuvent modifier des actualités" ON public.news;
DROP POLICY IF EXISTS "Admins peuvent supprimer des actualités" ON public.news;
DROP POLICY IF EXISTS "Admins peuvent tout voir" ON public.news;
CREATE POLICY "Actualités publiées visibles par tous" ON public.news FOR SELECT TO authenticated USING (is_published = true);
CREATE POLICY "Admins peuvent tout voir" ON public.news FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins peuvent créer des actualités" ON public.news FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins peuvent modifier des actualités" ON public.news FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins peuvent supprimer des actualités" ON public.news FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));