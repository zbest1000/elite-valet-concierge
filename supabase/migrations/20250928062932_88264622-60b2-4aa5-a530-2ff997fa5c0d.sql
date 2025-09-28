-- Add more floor variety to existing apartments for better testing
UPDATE apartments 
SET floor_number = CASE 
    WHEN unit_number LIKE '%5%' OR unit_number LIKE '%6%' THEN 5
    WHEN unit_number LIKE '%7%' OR unit_number LIKE '%8%' THEN 6
    WHEN unit_number LIKE '%9%' OR unit_number LIKE '%10%' THEN 7
    WHEN unit_number LIKE '%11%' OR unit_number LIKE '%12%' THEN 8
    WHEN unit_number LIKE '%13%' OR unit_number LIKE '%14%' THEN 9
    WHEN unit_number LIKE '%15%' OR unit_number LIKE '%16%' THEN 10
    ELSE floor_number
END
WHERE complex_id = 'ae7bb0f7-d064-4efd-b4d0-693422b2a196' AND building = 'Tower A';

-- Add penthouse floors to some buildings
UPDATE apartments 
SET floor_number = CASE 
    WHEN unit_number LIKE '%A' AND floor_number <= 2 THEN floor_number + 18  -- Make top floors 
    ELSE floor_number
END
WHERE complex_id = 'ae7bb0f7-d064-4efd-b4d0-693422b2a196' AND building = 'Building A';