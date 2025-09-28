-- Add more floors to Elite Gardens North complex for better testing
INSERT INTO apartments (unit_number, building, floor_number, complex_id, is_active) VALUES
-- South Wing additional floors
('201', 'South Wing', 2, '817a524a-2191-4939-a934-b782ad658000', true),
('202', 'South Wing', 2, '817a524a-2191-4939-a934-b782ad658000', true),
('301', 'South Wing', 3, '817a524a-2191-4939-a934-b782ad658000', true),
('302', 'South Wing', 3, '817a524a-2191-4939-a934-b782ad658000', true),
('401', 'South Wing', 4, '817a524a-2191-4939-a934-b782ad658000', true),
('402', 'South Wing', 4, '817a524a-2191-4939-a934-b782ad658000', true),
('501', 'South Wing', 5, '817a524a-2191-4939-a934-b782ad658000', true),
('502', 'South Wing', 5, '817a524a-2191-4939-a934-b782ad658000', true),
-- North Wing additional floors  
('201N', 'North Wing', 2, '817a524a-2191-4939-a934-b782ad658000', true),
('202N', 'North Wing', 2, '817a524a-2191-4939-a934-b782ad658000', true),
('301N', 'North Wing', 3, '817a524a-2191-4939-a934-b782ad658000', true),
('302N', 'North Wing', 3, '817a524a-2191-4939-a934-b782ad658000', true),
('401N', 'North Wing', 4, '817a524a-2191-4939-a934-b782ad658000', true),
('402N', 'North Wing', 4, '817a524a-2191-4939-a934-b782ad658000', true),
('501N', 'North Wing', 5, '817a524a-2191-4939-a934-b782ad658000', true),
('502N', 'North Wing', 5, '817a524a-2191-4939-a934-b782ad658000', true),
('601N', 'North Wing', 6, '817a524a-2191-4939-a934-b782ad658000', true),
('602N', 'North Wing', 6, '817a524a-2191-4939-a934-b782ad658000', true);

-- Add more floors to other complexes as well for consistency
UPDATE apartments 
SET floor_number = CASE 
    WHEN unit_number LIKE '%3%' THEN 3
    WHEN unit_number LIKE '%4%' THEN 4
    WHEN unit_number LIKE '%5%' THEN 5
    ELSE floor_number
END
WHERE complex_id IN (
    SELECT id FROM complexes WHERE name NOT LIKE '%Elite Gardens North%'
) AND floor_number <= 2;