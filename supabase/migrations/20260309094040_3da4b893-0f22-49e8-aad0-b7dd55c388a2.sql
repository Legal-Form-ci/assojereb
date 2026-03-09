
-- Fix: Replace the broad self-update policy with a restricted one
-- First, drop the existing policy
DROP POLICY IF EXISTS "Admins et responsables peuvent modifier les membres" ON public.members;

-- Recreate with separate admin/responsable policy (no self-update)
CREATE POLICY "Admins et responsables peuvent modifier les membres"
ON public.members
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'president'::app_role) OR
  has_role(auth.uid(), 'president_adjoint'::app_role) OR
  (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'responsable'::app_role
      AND ur.family_id = members.family_id
  ))
);

-- Create a restricted self-update function for members
CREATE OR REPLACE FUNCTION public.update_own_member_profile(
  _phone text DEFAULT NULL,
  _whatsapp text DEFAULT NULL,
  _email text DEFAULT NULL,
  _address text DEFAULT NULL,
  _photo_url text DEFAULT NULL,
  _profession text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.members
  SET
    phone = COALESCE(_phone, phone),
    whatsapp = COALESCE(_whatsapp, whatsapp),
    email = COALESCE(_email, email),
    address = COALESCE(_address, address),
    photo_url = COALESCE(_photo_url, photo_url),
    profession = COALESCE(_profession, profession),
    updated_at = now()
  WHERE user_id = auth.uid();
END;
$$;
