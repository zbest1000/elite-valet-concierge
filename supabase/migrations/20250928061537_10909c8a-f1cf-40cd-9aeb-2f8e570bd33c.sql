-- Update pickup_schedules table for improved scheduling
ALTER TABLE public.pickup_schedules 
ADD COLUMN IF NOT EXISTS start_date date,
ADD COLUMN IF NOT EXISTS end_date date,
ADD COLUMN IF NOT EXISTS schedule_time_start time without time zone,
ADD COLUMN IF NOT EXISTS schedule_time_end time without time zone,
ADD COLUMN IF NOT EXISTS target_type text DEFAULT 'apartment',
ADD COLUMN IF NOT EXISTS building text,
ADD COLUMN IF NOT EXISTS floor_number integer,
ADD COLUMN IF NOT EXISTS complex_id uuid;

-- Add check constraint for target_type
ALTER TABLE public.pickup_schedules 
ADD CONSTRAINT pickup_schedules_target_type_check 
CHECK (target_type IN ('apartment', 'building', 'floor', 'complex'));

-- Update existing records to use new schema
UPDATE public.pickup_schedules 
SET 
  start_date = scheduled_date,
  end_date = scheduled_date,
  schedule_time_start = scheduled_time,
  schedule_time_end = scheduled_time,
  target_type = 'apartment'
WHERE start_date IS NULL;

-- Add comment to clarify usage
COMMENT ON COLUMN public.pickup_schedules.target_type IS 'Defines pickup target: apartment (specific unit), building (entire building), floor (building floor), complex (entire complex)';
COMMENT ON COLUMN public.pickup_schedules.recurrence_days IS 'Array of weekday numbers (0=Sunday, 1=Monday, ..., 6=Saturday)';
COMMENT ON COLUMN public.pickup_schedules.schedule_time_start IS 'Start time of pickup window';
COMMENT ON COLUMN public.pickup_schedules.schedule_time_end IS 'End time of pickup window';