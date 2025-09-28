-- Create property assignments table for linking users to specific properties
CREATE TABLE public.property_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  complex_id UUID REFERENCES public.complexes(id) ON DELETE CASCADE,
  building TEXT,
  floor_number INTEGER,
  assignment_type TEXT NOT NULL DEFAULT 'full_access',
  permissions JSONB DEFAULT '{"view_schedules": true, "create_schedules": true, "manage_users": false, "manage_properties": false}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for property assignments
CREATE POLICY "Admins can manage all property assignments" 
ON public.property_assignments 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own assignments" 
ON public.property_assignments 
FOR SELECT 
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create assignment logs table for tracking activities
CREATE TABLE public.assignment_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  valet_id UUID NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  location_data JSONB,
  notes TEXT,
  photos TEXT[],
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assignment_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for assignment logs
CREATE POLICY "Admins can manage all assignment logs" 
ON public.assignment_logs 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Valets can manage their own assignment logs" 
ON public.assignment_logs 
FOR ALL 
USING (valet_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create service reports table for completion documentation
CREATE TABLE public.service_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pickup_schedule_id UUID REFERENCES public.pickup_schedules(id) ON DELETE CASCADE,
  valet_id UUID NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'completed',
  service_type TEXT NOT NULL DEFAULT 'pickup',
  items_collected INTEGER DEFAULT 0,
  photos_before TEXT[],
  photos_after TEXT[],
  customer_notes TEXT,
  valet_notes TEXT,
  customer_signature TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for service reports
CREATE POLICY "Admins can manage all service reports" 
ON public.service_reports 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Valets can manage their own service reports" 
ON public.service_reports 
FOR ALL 
USING (valet_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Residents can view their service reports" 
ON public.service_reports 
FOR SELECT 
USING (pickup_schedule_id IN (
  SELECT ps.id FROM public.pickup_schedules ps
  JOIN public.apartments a ON ps.apartment_id = a.id
  WHERE a.resident_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
));

-- Create building templates table for bulk creation
CREATE TABLE public.building_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  floors_count INTEGER NOT NULL DEFAULT 1,
  units_per_floor INTEGER NOT NULL DEFAULT 10,
  naming_pattern TEXT NOT NULL DEFAULT '{floor}{unit:02d}',
  created_by UUID NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.building_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for building templates
CREATE POLICY "Admins can manage all building templates" 
ON public.building_templates 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Users can view public templates or their own" 
ON public.building_templates 
FOR SELECT 
USING (is_public = true OR created_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Add triggers for updated_at columns
CREATE TRIGGER update_property_assignments_updated_at
BEFORE UPDATE ON public.property_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_reports_updated_at
BEFORE UPDATE ON public.service_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_building_templates_updated_at
BEFORE UPDATE ON public.building_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add some default building templates
INSERT INTO public.building_templates (name, description, floors_count, units_per_floor, naming_pattern, created_by, is_public)
VALUES 
  ('Standard Residential', 'Standard residential building with numbered units', 5, 8, '{floor}{unit:02d}', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), true),
  ('Luxury Tower', 'High-rise luxury building', 20, 4, '{floor}{unit:02d}', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), true),
  ('Garden Complex', 'Low-rise garden style complex', 3, 12, '{floor}{unit:02d}', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), true);

-- Update pickup_schedules to include more status tracking
ALTER TABLE public.pickup_schedules 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS valet_notes TEXT,
ADD COLUMN IF NOT EXISTS customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5);

-- Create function for bulk apartment creation
CREATE OR REPLACE FUNCTION public.bulk_create_apartments(
  p_complex_id UUID,
  p_building TEXT,
  p_start_floor INTEGER,
  p_end_floor INTEGER,
  p_units_per_floor INTEGER,
  p_naming_pattern TEXT DEFAULT '{floor}{unit:02d}'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  floor_num INTEGER;
  unit_num INTEGER;
  unit_name TEXT;
  apartments_created INTEGER := 0;
BEGIN
  -- Validate inputs
  IF p_start_floor > p_end_floor THEN
    RAISE EXCEPTION 'Start floor cannot be greater than end floor';
  END IF;
  
  IF p_units_per_floor <= 0 THEN
    RAISE EXCEPTION 'Units per floor must be positive';
  END IF;
  
  -- Loop through floors
  FOR floor_num IN p_start_floor..p_end_floor LOOP
    -- Loop through units on each floor
    FOR unit_num IN 1..p_units_per_floor LOOP
      -- Generate unit name based on pattern
      unit_name := replace(replace(p_naming_pattern, '{floor}', floor_num::text), '{unit:02d}', LPAD(unit_num::text, 2, '0'));
      
      -- Insert apartment if it doesn't exist
      INSERT INTO public.apartments (complex_id, building, unit_number, floor_number, is_active)
      VALUES (p_complex_id, p_building, unit_name, floor_num, true)
      ON CONFLICT (complex_id, building, unit_number) DO NOTHING;
      
      IF FOUND THEN
        apartments_created := apartments_created + 1;
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN apartments_created;
END;
$$;