-- Remove public access to complexes, require authentication
DROP POLICY IF EXISTS "Everyone can view active complexes" ON public.complexes;

-- Create new policy requiring authentication
CREATE POLICY "Authenticated users can view active complexes" 
ON public.complexes 
FOR SELECT 
TO authenticated 
USING (is_active = true);