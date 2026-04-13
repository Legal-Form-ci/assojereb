DO $$
BEGIN
  -- Check if tables are in the publication before trying to remove them
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'members') THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.members;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'contributions') THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.contributions;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications') THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.notifications;
  END IF;
END $$;