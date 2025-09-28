-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'elite_valet', 'resident');

-- Create enum for assignment types
CREATE TYPE public.assignment_type AS ENUM ('weekly', 'monthly', 'one_time', 'recurring');

-- Create enum for assignment status
CREATE TYPE public.assignment_status AS ENUM ('pending', 'active', 'completed', 'cancelled');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  role user_role NOT NULL DEFAULT 'resident',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create apartments table
CREATE TABLE public.apartments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_number TEXT NOT NULL,
  building TEXT NOT NULL,
  floor_number INTEGER,
  resident_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(unit_number, building)
);

-- Create complexes table for managing different building complexes
CREATE TABLE public.complexes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add complex_id to apartments table
ALTER TABLE public.apartments ADD COLUMN complex_id UUID REFERENCES public.complexes(id) ON DELETE CASCADE;

-- Create assignments table for valet personnel
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  valet_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  complex_id UUID REFERENCES public.complexes(id) ON DELETE CASCADE,
  apartment_ids UUID[], -- Array of apartment IDs for flexible assignment
  assignment_type assignment_type NOT NULL DEFAULT 'weekly',
  status assignment_status NOT NULL DEFAULT 'pending',
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pickup_schedules table (improved version of existing mock data)
CREATE TABLE public.pickup_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  apartment_id UUID NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
  valet_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'missed', 'cancelled')),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complexes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_schedules ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = _user_id;
$$;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = _user_id AND role = 'admin'
  );
$$;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR ALL
USING (public.is_admin(auth.uid()));

-- RLS Policies for apartments table
CREATE POLICY "Residents can view their own apartment"
ON public.apartments FOR SELECT
USING (resident_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Elite valets can view assigned apartments"
ON public.apartments FOR SELECT
USING (
  public.get_user_role(auth.uid()) = 'elite_valet' AND 
  id = ANY(
    SELECT unnest(apartment_ids) FROM public.assignments 
    WHERE valet_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) 
    AND status = 'active'
  )
);

CREATE POLICY "Admins can manage all apartments"
ON public.apartments FOR ALL
USING (public.is_admin(auth.uid()));

-- RLS Policies for complexes table
CREATE POLICY "Everyone can view active complexes"
ON public.complexes FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all complexes"
ON public.complexes FOR ALL
USING (public.is_admin(auth.uid()));

-- RLS Policies for assignments table
CREATE POLICY "Valets can view their own assignments"
ON public.assignments FOR SELECT
USING (valet_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all assignments"
ON public.assignments FOR ALL
USING (public.is_admin(auth.uid()));

-- RLS Policies for pickup_schedules table
CREATE POLICY "Residents can view their own pickup schedules"
ON public.pickup_schedules FOR SELECT
USING (
  apartment_id IN (
    SELECT id FROM public.apartments 
    WHERE resident_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Valets can view assigned pickup schedules"
ON public.pickup_schedules FOR SELECT
USING (
  public.get_user_role(auth.uid()) = 'elite_valet' AND 
  apartment_id = ANY(
    SELECT unnest(apartment_ids) FROM public.assignments 
    WHERE valet_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) 
    AND status = 'active'
  )
);

CREATE POLICY "Valets can update assigned pickup schedules"
ON public.pickup_schedules FOR UPDATE
USING (
  public.get_user_role(auth.uid()) = 'elite_valet' AND 
  apartment_id = ANY(
    SELECT unnest(apartment_ids) FROM public.assignments 
    WHERE valet_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) 
    AND status = 'active'
  )
);

CREATE POLICY "Admins can manage all pickup schedules"
ON public.pickup_schedules FOR ALL
USING (public.is_admin(auth.uid()));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_apartments_updated_at
  BEFORE UPDATE ON public.apartments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_complexes_updated_at
  BEFORE UPDATE ON public.complexes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pickup_schedules_updated_at
  BEFORE UPDATE ON public.pickup_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'resident')
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();