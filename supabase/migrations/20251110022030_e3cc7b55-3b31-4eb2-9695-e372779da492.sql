-- Drop and recreate the view without security definer
DROP VIEW IF EXISTS public.public_building_templates;

CREATE VIEW public.public_building_templates 
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  description,
  floors_count,
  units_per_floor,
  naming_pattern,
  is_public,
  created_at,
  updated_at,
  CASE 
    WHEN is_public = true THEN NULL
    ELSE created_by
  END as created_by
FROM public.building_templates;

-- The view will respect the RLS policies of the underlying table
COMMENT ON VIEW public.public_building_templates IS 'Secure view that hides created_by field for public templates to prevent exposure of internal user IDs';