-- Create comprehensive test data for pickup schedules with different target types
DO $$
DECLARE
    admin_id UUID := '7754693e-51ea-485d-9a42-5784f1264bec';
    complex_luxury_tower UUID := 'ae7bb0f7-d064-4efd-b4d0-693422b2a196';
    complex_riverside UUID := '39729423-3058-4cda-aa16-b3bffab5f7dc';
    complex_golden_heights UUID := 'a605085b-cf01-4d47-9680-cb613c44426a';
    apartment_ids UUID[];
BEGIN
    -- Get some apartment IDs for apartment-specific schedules
    SELECT ARRAY(SELECT id FROM apartments WHERE complex_id = complex_luxury_tower LIMIT 3) INTO apartment_ids;
    
    -- Insert comprehensive test schedules for different target types
    INSERT INTO pickup_schedules (
        start_date,
        end_date,
        schedule_time_start,
        schedule_time_end,
        status,
        notes,
        created_by,
        recurrence_type,
        recurrence_days,
        target_type,
        apartment_id,
        complex_id,
        building,
        floor_number,
        -- Legacy fields for backward compatibility
        scheduled_date,
        scheduled_time
    ) VALUES
    -- Apartment-specific schedules
    (
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '30 days',
        '08:00:00',
        '10:00:00',
        'scheduled',
        'Weekly luxury valet service for penthouse unit',
        admin_id,
        'weekly',
        ARRAY[1, 3, 5], -- Mon, Wed, Fri
        'apartment',
        apartment_ids[1],
        NULL,
        NULL,
        NULL,
        CURRENT_DATE,
        '08:00:00'
    ),
    (
        CURRENT_DATE + INTERVAL '1 day',
        CURRENT_DATE + INTERVAL '1 day',
        '14:00:00',
        '16:00:00',
        'scheduled',
        'One-time pickup for resident moving out',
        admin_id,
        'none',
        NULL,
        'apartment',
        apartment_ids[2],
        NULL,
        NULL,
        NULL,
        CURRENT_DATE + INTERVAL '1 day',
        '14:00:00'
    ),
    (
        CURRENT_DATE - INTERVAL '2 days',
        CURRENT_DATE - INTERVAL '2 days',
        '09:00:00',
        '11:00:00',
        'completed',
        'Regular maintenance pickup completed',
        admin_id,
        'none',
        NULL,
        'apartment',
        apartment_ids[3],
        NULL,
        NULL,
        NULL,
        CURRENT_DATE - INTERVAL '2 days',
        '09:00:00'
    ),
    -- Building-wide schedules
    (
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '60 days',
        '07:00:00',
        '09:00:00',
        'scheduled',
        'Daily building-wide cleaning service pickup',
        admin_id,
        'daily',
        ARRAY[1, 2, 3, 4, 5], -- Weekdays
        'building',
        NULL,
        complex_luxury_tower,
        'Tower A',
        NULL,
        CURRENT_DATE,
        '07:00:00'
    ),
    (
        CURRENT_DATE + INTERVAL '7 days',
        CURRENT_DATE + INTERVAL '37 days',
        '18:00:00',
        '20:00:00',
        'scheduled',
        'Weekend evening service for Tower B residents',
        admin_id,
        'weekly',
        ARRAY[0, 6], -- Weekends
        'building',
        NULL,
        complex_luxury_tower,
        'Tower B',
        NULL,
        CURRENT_DATE + INTERVAL '7 days',
        '18:00:00'
    ),
    -- Floor-specific schedules
    (
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '14 days',
        '12:00:00',
        '14:00:00',
        'scheduled',
        'Bi-weekly floor cleaning and maintenance',
        admin_id,
        'bi-weekly',
        ARRAY[2, 4], -- Tue, Thu
        'floor',
        NULL,
        complex_luxury_tower,
        'Tower A',
        15,
        CURRENT_DATE,
        '12:00:00'
    ),
    (
        CURRENT_DATE - INTERVAL '1 day',
        CURRENT_DATE - INTERVAL '1 day',
        '10:00:00',
        '12:00:00',
        'completed',
        'Executive floor weekly service completed',
        admin_id,
        'none',
        NULL,
        'floor',
        NULL,
        complex_luxury_tower,
        'Tower A',
        20,
        CURRENT_DATE - INTERVAL '1 day',
        '10:00:00'
    ),
    (
        CURRENT_DATE + INTERVAL '3 days',
        CURRENT_DATE + INTERVAL '3 days',
        '16:00:00',
        '18:00:00',
        'in-progress',
        'Special floor renovation pickup in progress',
        admin_id,
        'none',
        NULL,
        'floor',
        NULL,
        complex_riverside,
        'North Wing',
        5,
        CURRENT_DATE + INTERVAL '3 days',
        '16:00:00'
    ),
    -- Complex-wide schedules
    (
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '90 days',
        '06:00:00',
        '08:00:00',
        'scheduled',
        'Complex-wide morning maintenance and landscape service',
        admin_id,
        'daily',
        ARRAY[1, 2, 3, 4, 5, 6], -- Mon-Sat
        'complex',
        NULL,
        complex_luxury_tower,
        NULL,
        NULL,
        CURRENT_DATE,
        '06:00:00'
    ),
    (
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '30 days',
        '19:00:00',
        '21:00:00',
        'scheduled',
        'Evening complex security and cleaning rounds',
        admin_id,
        'weekly',
        ARRAY[0, 3, 6], -- Sun, Wed, Sat
        'complex',
        NULL,
        complex_riverside,
        NULL,
        NULL,
        CURRENT_DATE,
        '19:00:00'
    ),
    (
        CURRENT_DATE - INTERVAL '5 days',
        CURRENT_DATE - INTERVAL '5 days',
        '11:00:00',
        '13:00:00',
        'completed',
        'Monthly complex-wide deep cleaning completed',
        admin_id,
        'none',
        NULL,
        'complex',
        NULL,
        complex_golden_heights,
        NULL,
        NULL,
        CURRENT_DATE - INTERVAL '5 days',
        '11:00:00'
    ),
    -- Additional mixed schedules for variety
    (
        CURRENT_DATE + INTERVAL '2 days',
        CURRENT_DATE + INTERVAL '16 days',
        '15:00:00',
        '17:00:00',
        'scheduled',
        'Special event preparation for Golden Heights penthouse floor',
        admin_id,
        'weekly',
        ARRAY[5], -- Friday
        'floor',
        NULL,
        complex_golden_heights,
        'Tower Premium',
        25,
        CURRENT_DATE + INTERVAL '2 days',
        '15:00:00'
    );
    
    RAISE NOTICE 'Successfully created comprehensive pickup schedule test data with different target types';
END $$;