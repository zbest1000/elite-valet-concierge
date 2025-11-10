-- Drop and recreate the view with SECURITY INVOKER to respect RLS policies
DROP VIEW IF EXISTS public.valet_apartments;

CREATE VIEW public.valet_apartments 
WITH (security_invoker=on)
AS
SELECT 
  id,
  building,
  unit_number,
  complex_id,
  floor_number,
  is_active,
  created_at,
  updated_at
FROM public.apartments;

-- Grant SELECT access to authenticated users
GRANT SELECT ON public.valet_apartments TO authenticated;

-- Add comment explaining the view's purpose
COMMENT ON VIEW public.valet_apartments IS 'Restricted view of apartments for valets - excludes resident_id to prevent mapping resident-apartment relationships. Uses SECURITY INVOKER to respect RLS policies.';