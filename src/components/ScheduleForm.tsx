import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Apartment {
  id: string;
  unit_number: string;
  building: string;
  complex?: {
    name: string;
  };
}

interface ScheduleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ onSuccess, onCancel }) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [formData, setFormData] = useState({
    apartment_id: '',
    scheduled_time: '',
    notes: '',
    recurrence_type: 'none',
    recurrence_days: [] as number[],
  });
  
  // Input validation
  const validateInputs = () => {
    const errors: string[] = [];
    
    if (formData.notes.length > 1000) {
      errors.push('Notes must be less than 1000 characters');
    }
    
    if (formData.scheduled_time) {
      const [hours] = formData.scheduled_time.split(':').map(Number);
      if (hours < 6 || hours > 22) {
        errors.push('Pickup time must be between 6:00 AM and 10:00 PM');
      }
    }
    
    return errors;
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    try {
      const { data, error } = await supabase
        .from('apartments')
        .select(`
          id,
          unit_number,
          building,
          complex:complexes(name)
        `)
        .eq('is_active', true)
        .order('building')
        .order('unit_number');

      if (error) throw error;
      setApartments(data || []);
    } catch (error) {
      console.error('Error fetching apartments:', error);
      toast({
        title: "Error",
        description: "Failed to load apartments",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation
    const validationErrors = validateInputs();
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors[0],
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedDate || !formData.apartment_id || !formData.scheduled_time) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.recurrence_type !== 'none' && (!endDate || endDate <= selectedDate)) {
      toast({
        title: "Validation Error", 
        description: "Please select a valid end date for recurring schedules",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (formData.recurrence_type === 'none') {
        // Create single schedule
        const { error } = await supabase
          .from('pickup_schedules')
          .insert({
            apartment_id: formData.apartment_id,
            scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
            scheduled_time: formData.scheduled_time,
            status: 'scheduled',
            notes: formData.notes || null,
            created_by: userProfile.id,
            recurrence_type: 'none',
          });

        if (error) throw error;
      } else {
        // Create recurring schedules
        await createRecurringSchedules();
      }

      toast({
        title: "Success",
        description: "Pickup schedule created successfully",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create schedule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createRecurringSchedules = async () => {
    const schedules = [];
    const currentDate = new Date(selectedDate!);
    const endDateTime = new Date(endDate!);
    
    while (currentDate <= endDateTime) {
      let shouldCreateSchedule = false;
      
      if (formData.recurrence_type === 'daily') {
        shouldCreateSchedule = formData.recurrence_days.length === 0 || 
          formData.recurrence_days.includes(currentDate.getDay());
      } else if (formData.recurrence_type === 'weekly') {
        shouldCreateSchedule = formData.recurrence_days.includes(currentDate.getDay());
      } else if (formData.recurrence_type === 'bi-weekly') {
        const weeksDiff = Math.floor((currentDate.getTime() - selectedDate!.getTime()) / (7 * 24 * 60 * 60 * 1000));
        shouldCreateSchedule = weeksDiff % 2 === 0 && formData.recurrence_days.includes(currentDate.getDay());
      }
      
      if (shouldCreateSchedule) {
        schedules.push({
          apartment_id: formData.apartment_id,
          scheduled_date: format(currentDate, 'yyyy-MM-dd'),
          scheduled_time: formData.scheduled_time,
          status: 'scheduled',
          notes: formData.notes || null,
          created_by: userProfile.id,
          recurrence_type: formData.recurrence_type,
          recurrence_days: formData.recurrence_days.length > 0 ? formData.recurrence_days : null,
          recurrence_end_date: format(endDate!, 'yyyy-MM-dd'),
          is_recurring_parent: schedules.length === 0,
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (schedules.length === 0) {
      throw new Error('No schedules would be created with the selected recurrence pattern');
    }
    
    const { data: parentSchedule, error: parentError } = await supabase
      .from('pickup_schedules')
      .insert(schedules[0])
      .select()
      .single();
      
    if (parentError) throw parentError;
    
    if (schedules.length > 1) {
      const childSchedules = schedules.slice(1).map(schedule => ({
        ...schedule,
        parent_schedule_id: parentSchedule.id,
        is_recurring_parent: false,
      }));
      
      const { error: childError } = await supabase
        .from('pickup_schedules')
        .insert(childSchedules);
        
      if (childError) throw childError;
    }
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const toggleDay = (dayIndex: number) => {
    setFormData(prev => ({
      ...prev,
      recurrence_days: prev.recurrence_days.includes(dayIndex)
        ? prev.recurrence_days.filter(d => d !== dayIndex)
        : [...prev.recurrence_days, dayIndex].sort()
    }));
  };

  const getPresetDays = (preset: string) => {
    switch (preset) {
      case 'weekdays': return [1, 2, 3, 4, 5]; // Mon-Fri
      case 'sun-thurs': return [0, 1, 2, 3, 4]; // Sun-Thu
      case 'weekends': return [0, 6]; // Sat-Sun
      default: return [];
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Pickup Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apartment">Apartment</Label>
            <Select value={formData.apartment_id} onValueChange={(value) => setFormData(prev => ({ ...prev, apartment_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select apartment" />
              </SelectTrigger>
              <SelectContent>
                {apartments.map((apartment) => (
                  <SelectItem key={apartment.id} value={apartment.id}>
                    {apartment.building} - Unit {apartment.unit_number}
                    {apartment.complex?.name && ` (${apartment.complex.name})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Scheduled Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Scheduled Time</Label>
            <Input
              id="time"
              type="time"
              value={formData.scheduled_time}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or notes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Recurrence</Label>
            <Select value={formData.recurrence_type} onValueChange={(value) => setFormData(prev => ({ ...prev, recurrence_type: value, recurrence_days: [] }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select recurrence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Recurrence</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.recurrence_type !== 'none' && (
            <>
              <div className="space-y-2">
                <Label>Days of Week</Label>
                <div className="space-y-2">
                  <div className="flex gap-2 text-sm">
                    <Button
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, recurrence_days: getPresetDays('weekdays') }))}
                    >
                      Weekdays
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm" 
                      onClick={() => setFormData(prev => ({ ...prev, recurrence_days: getPresetDays('sun-thurs') }))}
                    >
                      Sun-Thu
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, recurrence_days: getPresetDays('weekends') }))}
                    >
                      Weekends
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {dayNames.map((day, index) => (
                      <Button
                        key={day}
                        type="button"
                        variant={formData.recurrence_days.includes(index) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDay(index)}
                        className="text-xs"
                      >
                        {day.slice(0, 3)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => selectedDate ? date <= selectedDate : date <= new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or notes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="gold" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Schedule'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ScheduleForm;