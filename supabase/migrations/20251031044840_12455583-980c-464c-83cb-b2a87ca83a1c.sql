-- Fix function search path security issue
-- Update update_updated_at_column function to include search_path
-- Using CREATE OR REPLACE to avoid CASCADE issues

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;