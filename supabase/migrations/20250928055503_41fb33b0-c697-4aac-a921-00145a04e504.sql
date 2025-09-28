-- Create some sample test data for demonstration
INSERT INTO public.complexes (name, address, is_active) VALUES 
('Luxury Tower Downtown', '123 Main Street, Downtown', true),
('Elite Gardens North', '456 Oak Avenue, North District', true),
('Premium Heights', '789 Hill Drive, Heights', true)
ON CONFLICT DO NOTHING;

-- Create sample apartments (only if complexes exist)
DO $$
DECLARE
    luxury_tower_id UUID;
    elite_gardens_id UUID;
    premium_heights_id UUID;
BEGIN
    -- Get complex IDs
    SELECT id INTO luxury_tower_id FROM public.complexes WHERE name = 'Luxury Tower Downtown' LIMIT 1;
    SELECT id INTO elite_gardens_id FROM public.complexes WHERE name = 'Elite Gardens North' LIMIT 1;
    SELECT id INTO premium_heights_id FROM public.complexes WHERE name = 'Premium Heights' LIMIT 1;
    
    -- Insert apartments if complexes exist
    IF luxury_tower_id IS NOT NULL THEN
        INSERT INTO public.apartments (complex_id, building, unit_number, floor_number, is_active) VALUES 
        (luxury_tower_id, 'Building A', '101', 1, true),
        (luxury_tower_id, 'Building A', '102', 1, true),
        (luxury_tower_id, 'Building A', '201', 2, true),
        (luxury_tower_id, 'Building A', '202', 2, true),
        (luxury_tower_id, 'Building B', '101', 1, true),
        (luxury_tower_id, 'Building B', '102', 1, true),
        (luxury_tower_id, 'Building B', '201', 2, true),
        (luxury_tower_id, 'Building B', '202', 2, true)
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF elite_gardens_id IS NOT NULL THEN
        INSERT INTO public.apartments (complex_id, building, unit_number, floor_number, is_active) VALUES 
        (elite_gardens_id, 'North Wing', '101', 1, true),
        (elite_gardens_id, 'North Wing', '102', 1, true),
        (elite_gardens_id, 'South Wing', '101', 1, true),
        (elite_gardens_id, 'South Wing', '102', 1, true)
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF premium_heights_id IS NOT NULL THEN
        INSERT INTO public.apartments (complex_id, building, unit_number, floor_number, is_active) VALUES 
        (premium_heights_id, 'Tower 1', '501', 5, true),
        (premium_heights_id, 'Tower 1', '502', 5, true),
        (premium_heights_id, 'Tower 2', '501', 5, true),
        (premium_heights_id, 'Tower 2', '502', 5, true)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;