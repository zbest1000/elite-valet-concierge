-- Clear existing apartments to avoid conflicts
DELETE FROM public.apartments;

-- Create sample complexes for testing (only if they don't exist)
INSERT INTO public.complexes (name, address, is_active)
SELECT * FROM (VALUES 
  ('Luxury Tower Downtown', '123 Elite Street, Downtown', true),
  ('Riverside Estates', '456 River View Blvd, Riverside', true),
  ('Golden Heights', '789 Gold Coast Ave, Uptown', true)
) AS new_complexes(name, address, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM public.complexes WHERE public.complexes.name = new_complexes.name
);

-- Create sample apartments
INSERT INTO public.apartments (unit_number, building, floor_number, complex_id, is_active)
SELECT 
  (row_number() OVER ())::text || CASE 
    WHEN row_number() OVER () % 10 < 5 THEN 'A' 
    ELSE 'B' 
  END as unit_number,
  CASE 
    WHEN row_number() OVER () <= 20 THEN 'Tower A'
    WHEN row_number() OVER () <= 40 THEN 'Tower B'
    ELSE 'Tower C'
  END as building,
  ((row_number() OVER () - 1) / 4) + 1 as floor_number,
  c.id as complex_id,
  true as is_active
FROM public.complexes c
CROSS JOIN generate_series(1, 15) 
WHERE c.name = 'Luxury Tower Downtown';

-- Create development helper functions
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find the user by email and get their ID
  SELECT au.id INTO target_user_id
  FROM auth.users au 
  WHERE au.email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN 'User not found with email: ' || user_email;
  END IF;
  
  -- Update the user's role to admin
  UPDATE public.profiles 
  SET role = 'admin'
  WHERE user_id = target_user_id;
  
  IF NOT FOUND THEN
    RETURN 'Profile not found for user: ' || user_email;
  END IF;
  
  RETURN 'Successfully promoted ' || user_email || ' to admin role';
END;
$$;

-- Create function to setup complete test environment
CREATE OR REPLACE FUNCTION public.create_dev_test_data()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_id UUID;
  valet_id UUID;
  resident_id UUID;
  complex_id UUID;
  apartment_ids UUID[];
  result_text TEXT := '';
BEGIN
  -- Get IDs of different role users
  SELECT id INTO admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
  SELECT id INTO valet_id FROM public.profiles WHERE role = 'elite_valet' LIMIT 1;
  SELECT id INTO resident_id FROM public.profiles WHERE role = 'resident' LIMIT 1;
  
  -- Get complex and apartments
  SELECT id INTO complex_id FROM public.complexes WHERE name = 'Luxury Tower Downtown';
  SELECT ARRAY(SELECT id FROM public.apartments LIMIT 8) INTO apartment_ids;
  
  -- Only proceed if we have the required users
  IF admin_id IS NULL THEN
    RETURN 'Please create an admin user first using promote_user_to_admin(email)';
  END IF;
  
  IF valet_id IS NULL THEN
    RETURN 'Please create a valet user by signing up with role "elite_valet"';
  END IF;
  
  -- Assign some apartments to resident if exists
  IF resident_id IS NOT NULL AND array_length(apartment_ids, 1) > 0 THEN
    UPDATE public.apartments 
    SET resident_id = resident_id 
    WHERE id = apartment_ids[1];
    result_text := result_text || 'Assigned apartment to resident. ';
  END IF;
  
  -- Create valet assignment
  INSERT INTO public.assignments (
    valet_id, 
    complex_id, 
    apartment_ids, 
    assignment_type, 
    status, 
    start_date, 
    end_date, 
    description, 
    created_by
  ) VALUES (
    valet_id,
    complex_id,
    apartment_ids,
    'weekly',
    'active',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 month',
    'Weekly luxury valet service - Downtown Tower buildings',
    admin_id
  )
  ON CONFLICT DO NOTHING;
  
  result_text := result_text || 'Created valet assignment. ';
  
  -- Create sample pickup schedules
  INSERT INTO public.pickup_schedules (
    apartment_id,
    valet_id,
    scheduled_date,
    scheduled_time,
    status,
    notes,
    created_by
  )
  SELECT 
    apartment_ids[1 + (i % array_length(apartment_ids, 1))],
    valet_id,
    CURRENT_DATE + (i || ' days')::INTERVAL,
    ('18:' || LPAD((30 + i * 10)::text, 2, '0') || ':00')::TIME,
    CASE 
      WHEN i % 4 = 0 THEN 'completed'
      WHEN i % 4 = 1 THEN 'scheduled'  
      WHEN i % 4 = 2 THEN 'in-progress'
      ELSE 'scheduled'
    END,
    'Sample pickup #' || (i + 1) || ' - ' || 
    CASE 
      WHEN i % 3 = 0 THEN 'Regular weekly service'
      WHEN i % 3 = 1 THEN 'Express pickup requested'
      ELSE 'Standard luxury service'
    END,
    admin_id
  FROM generate_series(0, 11) i
  ON CONFLICT DO NOTHING;
  
  result_text := result_text || 'Created sample pickup schedules. ';
  
  RETURN result_text || 'Development test data setup complete!';
END;
$$;