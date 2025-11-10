-- Create a view for valets that excludes sensitive resident_id field
CREATE OR REPLACE VIEW public.valet_apartments AS
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

-- Grant SELECT access to authenticated users (RLS will still apply from underlying table)
GRANT SELECT ON public.valet_apartments TO authenticated;

-- Add comment explaining the view's purpose
COMMENT ON VIEW public.valet_apartments IS 'Restricted view of apartments for valets - excludes resident_id to prevent mapping resident-apartment relationships';