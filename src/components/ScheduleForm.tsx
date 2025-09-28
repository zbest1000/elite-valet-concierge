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
  const [formData, setFormData] = useState({
    apartment_id: '',
    scheduled_time: '',
    notes: '',
  });

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
    if (!selectedDate || !formData.apartment_id || !formData.scheduled_time) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('pickup_schedules')
        .insert({
          apartment_id: formData.apartment_id,
          scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
          scheduled_time: formData.scheduled_time,
          status: 'scheduled',
          notes: formData.notes || null,
          created_by: userProfile.id,
        });

      if (error) throw error;

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