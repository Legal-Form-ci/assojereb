-- PARTIE 1: Ajouter les nouvelles valeurs enum et le champ slug

-- 1. Étendre le type enum pour les rôles avancés RBAC
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'president';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'president_adjoint';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'tresorier';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'tresorier_adjoint';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'commissaire_comptes';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'chef_famille';

-- 2. Ajouter la nouvelle zone géographique
ALTER TYPE public.geographic_zone ADD VALUE IF NOT EXISTS 'ville_interieur';

-- 3. Ajouter un champ slug pour les URLs SEO-friendly dans la table news
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS slug TEXT;

-- 4. Créer une fonction pour générer les slugs
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(title);
  base_slug := regexp_replace(base_slug, '[àâä]', 'a', 'g');
  base_slug := regexp_replace(base_slug, '[éèêë]', 'e', 'g');
  base_slug := regexp_replace(base_slug, '[îï]', 'i', 'g');
  base_slug := regexp_replace(base_slug, '[ôö]', 'o', 'g');
  base_slug := regexp_replace(base_slug, '[ùûü]', 'u', 'g');
  base_slug := regexp_replace(base_slug, '[ç]', 'c', 'g');
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.news WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- 5. Trigger pour générer automatiquement le slug
CREATE OR REPLACE FUNCTION public.set_news_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_news_slug ON public.news;
CREATE TRIGGER trigger_set_news_slug
  BEFORE INSERT OR UPDATE ON public.news
  FOR EACH ROW
  EXECUTE FUNCTION public.set_news_slug();

-- 6. Mettre à jour les slugs existants
UPDATE public.news SET slug = public.generate_slug(title) WHERE slug IS NULL OR slug = '';

-- 7. Créer un index unique sur le slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_news_slug ON public.news(slug);

-- 8. Activer pg_cron et pg_net pour les cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;