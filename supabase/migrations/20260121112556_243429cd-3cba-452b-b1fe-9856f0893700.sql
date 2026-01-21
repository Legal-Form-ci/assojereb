-- Fix security warnings: set search_path for functions
ALTER FUNCTION public.generate_member_number() SET search_path = public;
ALTER FUNCTION public.set_member_number() SET search_path = public;