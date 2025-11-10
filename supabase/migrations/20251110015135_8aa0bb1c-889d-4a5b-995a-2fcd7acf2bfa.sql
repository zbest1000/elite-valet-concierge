-- Add explicit policy to deny all anonymous access to profiles
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false);