-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view active complexes" ON public.complexes;

-- Allow valets to view complexes where they have active assignments
CREATE POLICY "Valets can view their assigned complexes"
ON public.complexes
FOR SELECT
USING (
  id IN (
    SELECT complex_id
    FROM assignments
    WHERE valet_id = (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
    AND status = 'active'::assignment_status
  )
);

-- Allow residents to view complexes where they have apartments
CREATE POLICY "Residents can view their complex"
ON public.complexes
FOR SELECT
USING (
  id IN (
    SELECT complex_id
    FROM apartments
    WHERE resident_id = (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
);

-- Allow users with property assignments to view those complexes
CREATE POLICY "Assigned users can view their complexes"
ON public.complexes
FOR SELECT
USING (
  id IN (
    SELECT complex_id
    FROM property_assignments
    WHERE user_id = (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
    AND is_active = true
  )
);