-- Fix the apartment_id constraint to allow NULL for non-apartment targets
ALTER TABLE public.pickup_schedules 
ALTER COLUMN apartment_id DROP NOT NULL;