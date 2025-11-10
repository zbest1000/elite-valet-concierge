-- Add an additional restrictive policy to block any potential auth.uid() manipulation attempts
CREATE POLICY "Enforce strict user ownership on profiles"
ON public.profiles
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (
  -- Only allow if user_id matches auth.uid() OR user is admin
  user_id = auth.uid() OR public.is_admin(auth.uid())
)
WITH CHECK (
  -- On writes, enforce that user_id must match auth.uid() OR user is admin  
  user_id = auth.uid() OR public.is_admin(auth.uid())
);

-- Add constraint to prevent null user_id (security hardening)
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_not_null 
CHECK (user_id IS NOT NULL);

-- Add index for faster RLS policy checks
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Document the enhanced security
COMMENT ON TABLE public.profiles IS 'Contains sensitive PII including phone numbers. Protected by multiple restrictive RLS policies with explicit user_id = auth.uid() enforcement and NOT NULL constraint to prevent unauthorized access.';