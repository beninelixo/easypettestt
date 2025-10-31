-- Create trigger to auto-create profile and role on new user signups
-- NOTE: Uses existing public.handle_new_user() function
DO $$ BEGIN
  -- If trigger already exists, do nothing
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Make sure updated_at stays fresh on core tables (idempotent guards)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_pet_shops_updated_at') THEN
    CREATE TRIGGER trg_pet_shops_updated_at
      BEFORE UPDATE ON public.pet_shops
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_updated_at') THEN
    CREATE TRIGGER trg_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_services_updated_at') THEN
    CREATE TRIGGER trg_services_updated_at
      BEFORE UPDATE ON public.services
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_pets_updated_at') THEN
    CREATE TRIGGER trg_pets_updated_at
      BEFORE UPDATE ON public.pets
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_appointments_updated_at') THEN
    CREATE TRIGGER trg_appointments_updated_at
      BEFORE UPDATE ON public.appointments
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;