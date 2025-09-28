import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { EnhancedCalendar } from '@/components/ui/enhanced-calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Complex {
  id: string;
  name: string;
}

interface Apartment {
  id: string;
  unit_number: string;
  building: string;
  complex_id: string;
}

interface ValetProfile {
  id: string;
  first_name: string;
  last_name: string;
  user_id: string;
}

interface AssignmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ onSuccess, onCancel }) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [complexes, setComplexes] = useState<Complex[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [valets, setValets] = useState<ValetProfile[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedApartments, setSelectedApartments] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    valet_id: '',
    complex_id: '',
    assignment_type: 'weekly',
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.complex_id) {
      fetchApartments(formData.complex_id);
    }
  }, [formData.complex_id]);

  const fetchData = async () => {
    try {
      // Fetch complexes
      const { data: complexData, error: complexError } = await supabase
        .from('complexes')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (complexError) throw complexError;
      setComplexes(complexData || []);

      // Fetch valets
      const { data: valetData, error: valetError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, user_id')
        .eq('role', 'elite_valet')
        .order('first_name');

      if (valetError) throw valetError;
      setValets(valetData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load form data",
        variant: "destructive",
      });
    }
  };

  const fetchApartments = async (complexId: string) => {
    try {
      const { data, error } = await supabase
        .from('apartments')
        .select('id, unit_number, building, complex_id')
        .eq('complex_id', complexId)
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

  const handleApartmentToggle = (apartmentId: string) => {
    setSelectedApartments(prev => 
      prev.includes(apartmentId)
        ? prev.filter(id => id !== apartmentId)
        : [...prev, apartmentId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !formData.valet_id || !formData.complex_id || selectedApartments.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and select at least one apartment",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('assignments')
        .insert([{
          valet_id: formData.valet_id,
          complex_id: formData.complex_id,
          apartment_ids: selectedApartments,
          assignment_type: formData.assignment_type as any,
          status: 'active' as any,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
          description: formData.description || null,
          created_by: userProfile.id,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment created successfully",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valet">Elite Valet</Label>
              <Select value={formData.valet_id} onValueChange={(value) => setFormData(prev => ({ ...prev, valet_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select valet" />
                </SelectTrigger>
                <SelectContent>
                  {valets.map((valet) => (
                    <SelectItem key={valet.id} value={valet.id}>
                      {valet.first_name} {valet.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complex">Complex</Label>
              <Select value={formData.complex_id} onValueChange={(value) => setFormData(prev => ({ ...prev, complex_id: value }))}>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignment_type">Assignment Type</Label>
              <Select value={formData.assignment_type} onValueChange={(value) => setFormData(prev => ({ ...prev, assignment_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="one_time">One Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                    enableYearDropdown={true}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>End Date (Optional)</Label>
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
                  {endDate ? format(endDate, "PPP") : <span>Pick end date (optional)</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <EnhancedCalendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  disabled={(date) => startDate ? date < startDate : false}
                  enableYearDropdown={true}
                />
              </PopoverContent>
            </Popover>
          </div>

          {apartments.length > 0 && (
            <div className="space-y-2">
              <Label>Select Apartments</Label>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {apartments.map((apartment) => (
                    <div key={apartment.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={apartment.id}
                        checked={selectedApartments.includes(apartment.id)}
                        onCheckedChange={() => handleApartmentToggle(apartment.id)}
                      />
                      <Label htmlFor={apartment.id} className="text-sm">
                        {apartment.building} - {apartment.unit_number}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedApartments.length} apartment(s) selected
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Assignment description..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="gold" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Assignment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AssignmentForm;