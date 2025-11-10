-- Drop existing permissive policies and recreate as restrictive for tighter security
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create restrictive policies that explicitly check user_id match
CREATE POLICY "Users can view only their own profile"
ON public.profiles
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update only their own profile"
ON public.profiles  
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert only their own profile"
ON public.profiles
AS RESTRICTIVE  
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Admins need permissive policy to override restrictive ones
CREATE POLICY "Admins have full access to all profiles"
ON public.profiles
AS PERMISSIVE
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Explicitly block any attempts by authenticated users to access other profiles
CREATE POLICY "Block cross-user profile access"
ON public.profiles
AS RESTRICTIVE
FOR SELECT
TO authenticated  
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Add comment documenting the security approach
COMMENT ON TABLE public.profiles IS 'Contains sensitive PII including phone numbers. Protected by restrictive RLS policies that enforce user_id = auth.uid() checks to prevent cross-user data access.';