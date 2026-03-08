
-- Add new geographic zones to the enum
ALTER TYPE public.geographic_zone ADD VALUE IF NOT EXISTS 'grand_abidjan';
ALTER TYPE public.geographic_zone ADD VALUE IF NOT EXISTS 'yamoussoukro';
ALTER TYPE public.geographic_zone ADD VALUE IF NOT EXISTS 'diaspora_africaine';
ALTER TYPE public.geographic_zone ADD VALUE IF NOT EXISTS 'diaspora_occidentale';
