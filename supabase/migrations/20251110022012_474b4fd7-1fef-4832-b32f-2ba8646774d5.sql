-- Create a secure view for public building templates that excludes created_by
CREATE OR REPLACE VIEW public.public_building_templates AS
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
FROM public.building_templates
WHERE is_public = true 
   OR created_by = (SELECT id FROM profiles WHERE user_id = auth.uid())
   OR public.is_admin(auth.uid());

-- Grant SELECT on the view
GRANT SELECT ON public.public_building_templates TO authenticated;
GRANT SELECT ON public.public_building_templates TO anon;

-- Add comment to document the security feature
COMMENT ON VIEW public.public_building_templates IS 'Secure view that hides created_by field for public templates to prevent exposure of internal user IDs';