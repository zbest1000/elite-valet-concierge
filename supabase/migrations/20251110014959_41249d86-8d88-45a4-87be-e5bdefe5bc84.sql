-- Add explicit policy to deny all anonymous access to pickup_schedules
CREATE POLICY "Deny anonymous access to pickup schedules"
ON public.pickup_schedules
FOR ALL
TO anon
USING (false);