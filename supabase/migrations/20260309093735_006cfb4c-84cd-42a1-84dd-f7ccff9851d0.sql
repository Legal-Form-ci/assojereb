
-- 1. Fix contributions SELECT policy: restrict by role and ownership
DROP POLICY IF EXISTS "Cotisations visibles par authentifiés" ON public.contributions;

CREATE POLICY "Cotisations visibles par rôle et propriétaire"
ON public.contributions
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'president'::app_role) OR
  has_role(auth.uid(), 'president_adjoint'::app_role) OR
  has_role(auth.uid(), 'tresorier'::app_role) OR
  has_role(auth.uid(), 'tresorier_adjoint'::app_role) OR
  has_role(auth.uid(), 'commissaire_comptes'::app_role) OR
  (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'responsable'::app_role
      AND ur.family_id IN (
        SELECT m.family_id FROM public.members m WHERE m.id = contributions.member_id
      )
  )) OR
  (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'chef_famille'::app_role
      AND ur.family_id IN (
        SELECT m.family_id FROM public.members m WHERE m.id = contributions.member_id
      )
  )) OR
  (EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = contributions.member_id AND m.user_id = auth.uid()
  ))
);

-- 2. Allow tresorier roles to manage exceptional_contributions
CREATE POLICY "Trésoriers peuvent gérer les cotisations exceptionnelles"
ON public.exceptional_contributions
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'tresorier'::app_role) OR
  has_role(auth.uid(), 'tresorier_adjoint'::app_role) OR
  has_role(auth.uid(), 'president'::app_role) OR
  has_role(auth.uid(), 'president_adjoint'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'tresorier'::app_role) OR
  has_role(auth.uid(), 'tresorier_adjoint'::app_role) OR
  has_role(auth.uid(), 'president'::app_role) OR
  has_role(auth.uid(), 'president_adjoint'::app_role)
);
