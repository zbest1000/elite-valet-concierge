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
import { EnhancedCalendar } from '@/components/ui/enhanced-calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { CalendarIcon, Building, Home, Layers, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Apartment {
  id: string;
  unit_number: string;
  building: string;
  floor_number: number;
  complex?: {
    id: string;
    name: string;
  };
}

interface Complex {
  id: string;
  name: string;
}

interface ScheduleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

const ScheduleForm: React.FC<ScheduleFormProps> = ({ onSuccess, onCancel }) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [complexes, setComplexes] = useState<Complex[]>([]);
  const [buildings, setBuildings] = useState<string[]>([]);
  const [floors, setFloors] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [formData, setFormData] = useState({
    target_type: 'apartment',
    apartment_id: '',
    complex_id: '',
    building: '',
    floor_number: '',
    start_time: '',
    end_time: '',
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
    
    if (formData.start_time && formData.end_time) {
      const [startHours] = formData.start_time.split(':').map(Number);
      const [endHours] = formData.end_time.split(':').map(Number);
      
      if (startHours < 6 || startHours > 22 || endHours < 6 || endHours > 22) {
        errors.push('Pickup times must be between 6:00 AM and 10:00 PM');
      }
      
      if (formData.start_time >= formData.end_time) {
        errors.push('End time must be after start time');
      }
    }
    
    return errors;
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.target_type === 'building' || formData.target_type === 'floor') {
      updateBuildingsAndFloors();
    }
  }, [formData.complex_id, formData.building, apartments]);

  const fetchData = async () => {
    await Promise.all([fetchApartments(), fetchComplexes()]);
  };

  const fetchApartments = async () => {
    try {
      const { data, error } = await supabase
        .from('apartments')
        .select(`
          id,
          unit_number,
          building,
          floor_number,
          complex:complexes(id, name)
        `)
        .eq('is_active', true)
        .order('building', { ascending: true })
        .order('unit_number', { ascending: true });

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

  const fetchComplexes = async () => {
    try {
      const { data, error } = await supabase
        .from('complexes')
        .select('id, name')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setComplexes(data || []);
    } catch (error) {
      console.error('Error fetching complexes:', error);
      toast({
        title: "Error",
        description: "Failed to load complexes",
        variant: "destructive",
      });
    }
  };

  const updateBuildingsAndFloors = () => {
    const selectedComplexApartments = apartments.filter(apt => 
      apt.complex?.id === formData.complex_id
    );
    
    const uniqueBuildings = [...new Set(selectedComplexApartments.map(apt => apt.building))];
    setBuildings(uniqueBuildings.sort());
    
    if (formData.target_type === 'floor' && formData.building) {
      const buildingApartments = selectedComplexApartments.filter(apt => 
        apt.building === formData.building
      );
      const uniqueFloors = [...new Set(buildingApartments.map(apt => apt.floor_number))]
        .filter(floor => floor !== null && floor !== undefined)
        .sort((a, b) => a - b);
      setFloors(uniqueFloors);
    }
  };

  const handleDayToggle = (dayValue: number) => {
    const updatedDays = formData.recurrence_days.includes(dayValue)
      ? formData.recurrence_days.filter(day => day !== dayValue)
      : [...formData.recurrence_days, dayValue].sort();
    
    setFormData(prev => ({ ...prev, recurrence_days: updatedDays }));
  };

  const handleTargetTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      target_type: value,
      apartment_id: '',
      complex_id: '',
      building: '',
      floor_number: '',
    }));
    setBuildings([]);
    setFloors([]);
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
    
    if (!startDate || !endDate || !formData.start_time || !formData.end_time) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.recurrence_type !== 'none' && formData.recurrence_days.length === 0) {
      toast({
        title: "Validation Error", 
        description: "Please select days for recurring schedules",
        variant: "destructive",
      });
      return;
    }

    // Validate target selection based on type
    if (formData.target_type === 'apartment' && !formData.apartment_id) {
      toast({
        title: "Validation Error",
        description: "Please select an apartment",
        variant: "destructive",
      });
      return;
    }

    if (formData.target_type === 'complex' && !formData.complex_id) {
      toast({
        title: "Validation Error",
        description: "Please select a complex",
        variant: "destructive",
      });
      return;
    }

    if (formData.target_type === 'building' && (!formData.complex_id || !formData.building)) {
      toast({
        title: "Validation Error",
        description: "Please select a complex and building",
        variant: "destructive",
      });
      return;
    }

    if (formData.target_type === 'floor' && (!formData.complex_id || !formData.building || !formData.floor_number)) {
      toast({
        title: "Validation Error",
        description: "Please select a complex, building, and floor",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const scheduleData = {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        schedule_time_start: formData.start_time,
        schedule_time_end: formData.end_time,
        status: 'scheduled',
        notes: formData.notes || null,
        created_by: userProfile.id,
        recurrence_type: formData.recurrence_type,
        recurrence_days: formData.recurrence_days.length > 0 ? formData.recurrence_days : null,
        recurrence_end_date: formData.recurrence_type !== 'none' ? format(endDate, 'yyyy-MM-dd') : null,
        target_type: formData.target_type,
        apartment_id: formData.target_type === 'apartment' ? formData.apartment_id : null,
        complex_id: formData.target_type !== 'apartment' ? formData.complex_id : null,
        building: formData.target_type === 'building' || formData.target_type === 'floor' ? formData.building : null,
        floor_number: formData.target_type === 'floor' ? parseInt(formData.floor_number) : null,
        // Legacy fields for compatibility
        scheduled_date: format(startDate, 'yyyy-MM-dd'),
        scheduled_time: formData.start_time,
      };

      const { error } = await supabase
        .from('pickup_schedules')
        .insert(scheduleData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Pickup schedule created successfully",
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create pickup schedule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'apartment': return <Home className="w-4 h-4" />;
      case 'building': return <Building className="w-4 h-4" />;
      case 'floor': return <Layers className="w-4 h-4" />;
      case 'complex': return <MapPin className="w-4 h-4" />;
      default: return <Home className="w-4 h-4" />;
    }
  };

  const getPresetDays = (preset: string) => {
    switch (preset) {
      case 'weekdays': return [1, 2, 3, 4, 5]; // Mon-Fri
      case 'sun-thurs': return [0, 1, 2, 3, 4]; // Sun-Thu
      case 'weekends': return [0, 6]; // Sat-Sun
      default: return [];
    }
  };

  const setPresetDays = (preset: string) => {
    const days = getPresetDays(preset);
    setFormData(prev => ({ ...prev, recurrence_days: days }));
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create Pickup Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Type Selection */}
          <div className="space-y-3">
            <Label>Pickup Target</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'apartment', label: 'Specific Unit', icon: <Home className="w-4 h-4" /> },
                { value: 'building', label: 'Entire Building', icon: <Building className="w-4 h-4" /> },
                { value: 'floor', label: 'Building Floor', icon: <Layers className="w-4 h-4" /> },
                { value: 'complex', label: 'Entire Complex', icon: <MapPin className="w-4 h-4" /> },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleTargetTypeChange(option.value)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border text-left transition-colors",
                    formData.target_type === option.value
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-background border-border hover:bg-muted"
                  )}
                >
                  {option.icon}
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Selection Based on Type */}
          {formData.target_type === 'apartment' && (
            <div className="space-y-2">
              <Label htmlFor="apartment">Select Apartment</Label>
              <Select value={formData.apartment_id} onValueChange={(value) => setFormData(prev => ({ ...prev, apartment_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select apartment" />
                </SelectTrigger>
                <SelectContent>
                  {apartments.map((apartment) => (
                    <SelectItem key={apartment.id} value={apartment.id}>
                      {apartment.complex?.name} - {apartment.building} #{apartment.unit_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(formData.target_type === 'complex' || formData.target_type === 'building' || formData.target_type === 'floor') && (
            <div className="space-y-2">
              <Label htmlFor="complex">Select Complex</Label>
              <Select value={formData.complex_id} onValueChange={(value) => setFormData(prev => ({ ...prev, complex_id: value, building: '', floor_number: '' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select complex" />
                </SelectTrigger>
                <SelectContent>
                  {complexes.map((complex) => (
                    <SelectItem key={complex.id} value={complex.id}>
                      {complex.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(formData.target_type === 'building' || formData.target_type === 'floor') && formData.complex_id && (
            <div className="space-y-2">
              <Label htmlFor="building">Select Building</Label>
              <Select value={formData.building} onValueChange={(value) => setFormData(prev => ({ ...prev, building: value, floor_number: '' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select building" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((building) => (
                    <SelectItem key={building} value={building}>
                      Building {building}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.target_type === 'floor' && formData.building && (
            <div className="space-y-2">
              <Label htmlFor="floor">Select Floor</Label>
              <Select value={formData.floor_number} onValueChange={(value) => setFormData(prev => ({ ...prev, floor_number: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select floor" />
                </SelectTrigger>
                <SelectContent>
                  {floors.map((floor) => (
                    <SelectItem key={floor} value={floor.toString()}>
                      Floor {floor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <EnhancedCalendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="pointer-events-auto"
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    enableYearDropdown={true}
                  />
                </PopoverContent>
              </Popover>
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
                  <EnhancedCalendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="pointer-events-auto"
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0)) || (startDate && date < startDate)}
                    enableYearDropdown={true}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                min="06:00"
                max="22:00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                min="06:00"
                max="22:00"
                required
              />
            </div>
          </div>

          {/* Recurrence */}
          <div className="space-y-3">
            <Label htmlFor="recurrence">Recurrence Type</Label>
            <Select value={formData.recurrence_type} onValueChange={(value) => setFormData(prev => ({ ...prev, recurrence_type: value, recurrence_days: [] }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select recurrence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">One-time</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
              </SelectContent>
            </Select>

            {formData.recurrence_type !== 'none' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => setPresetDays('weekdays')}>
                    Weekdays
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setPresetDays('sun-thurs')}>
                    Sun-Thu
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setPresetDays('weekends')}>
                    Weekends
                  </Button>
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={formData.recurrence_days.includes(day.value)}
                        onCheckedChange={() => handleDayToggle(day.value)}
                      />
                      <Label htmlFor={`day-${day.value}`} className="text-sm">
                        {day.short}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any special instructions or notes..."
              maxLength={1000}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {formData.notes.length}/1000 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Schedule'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ScheduleForm;