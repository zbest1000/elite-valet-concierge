-- Create audit log table for admin profile access
CREATE TABLE IF NOT EXISTS public.admin_profile_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  accessed_profile_id UUID NOT NULL,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'update')),
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS on audit logs
ALTER TABLE public.admin_profile_access_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.admin_profile_access_logs
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Create function to log admin profile updates
CREATE OR REPLACE FUNCTION public.log_admin_profile_update()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if the updating user is an admin and not updating their own profile
  IF public.is_admin(auth.uid()) AND auth.uid() != NEW.user_id THEN
    INSERT INTO public.admin_profile_access_logs (
      admin_user_id,
      accessed_profile_id,
      access_type
    ) VALUES (
      auth.uid(),
      NEW.user_id,
      'update'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for UPDATE operations
CREATE TRIGGER log_admin_profile_update
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.log_admin_profile_update();

-- Add indexes for better query performance on audit logs
CREATE INDEX idx_admin_profile_access_logs_admin_user_id ON public.admin_profile_access_logs(admin_user_id);
CREATE INDEX idx_admin_profile_access_logs_accessed_profile_id ON public.admin_profile_access_logs(accessed_profile_id);
CREATE INDEX idx_admin_profile_access_logs_accessed_at ON public.admin_profile_access_logs(accessed_at DESC);