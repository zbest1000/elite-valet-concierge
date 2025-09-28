-- Add recurring schedule support to pickup_schedules table
ALTER TABLE public.pickup_schedules 
ADD COLUMN recurrence_type TEXT DEFAULT 'none' CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'bi-weekly', 'monthly')),
ADD COLUMN recurrence_days INTEGER[] DEFAULT NULL, -- 0=Sunday, 1=Monday, etc.
ADD COLUMN recurrence_end_date DATE DEFAULT NULL,
ADD COLUMN parent_schedule_id UUID REFERENCES public.pickup_schedules(id) DEFAULT NULL,
ADD COLUMN is_recurring_parent BOOLEAN DEFAULT FALSE;

-- Add index for better performance on recurring schedule queries
CREATE INDEX idx_pickup_schedules_parent ON public.pickup_schedules(parent_schedule_id);
CREATE INDEX idx_pickup_schedules_recurrence ON public.pickup_schedules(recurrence_type, recurrence_end_date);