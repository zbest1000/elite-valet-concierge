import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Clock, 
  Play, 
  CheckCircle, 
  MapPin, 
  Calendar,
  User,
  Building,
  Star,
  Camera,
  FileText
} from 'lucide-react';

interface PickupSchedule {
  id: string;
  apartment_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  notes: string;
  started_at: string;
  completed_at: string;
  valet_notes: string;
  customer_rating: number;
  apartment?: {
    unit_number: string;
    building: string;
    floor_number: number;
    complex?: { name: string };
  };
}

interface ServiceReport {
  start_time: string;
  end_time: string;
  service_type: string;
  items_collected: number;
  valet_notes: string;
  customer_notes: string;
}

const ValetWorkflow: React.FC = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<PickupSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<PickupSchedule | null>(null);
  const [reportForm, setReportForm] = useState<ServiceReport>({
    start_time: '',
    end_time: '',
    service_type: 'pickup',
    items_collected: 0,
    valet_notes: '',
    customer_notes: ''
  });

  useEffect(() => {
    if (userProfile?.role === 'elite_valet') {
      fetchAssignedSchedules();
    }
  }, [userProfile]);

  const fetchAssignedSchedules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pickup_schedules')
        .select(`
          *,
          apartment:valet_apartments(
            unit_number,
            building,
            floor_number,
            complex:complexes(name)
          )
        `)
        .in('status', ['scheduled', 'in-progress'])
        .order('scheduled_date')
        .order('scheduled_time');

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast({
        title: "Error",
        description: "Failed to load assigned schedules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartService = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from('pickup_schedules')
        .update({ 
          status: 'in-progress',
          started_at: new Date().toISOString()
        })
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: "Service Started",
        description: "You have started this pickup service",
      });

      fetchAssignedSchedules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start service",
        variant: "destructive",
      });
    }
  };

  const handleCompleteService = (schedule: PickupSchedule) => {
    setSelectedSchedule(schedule);
    setReportForm({
      start_time: schedule.started_at || new Date().toISOString(),
      end_time: new Date().toISOString(),
      service_type: 'pickup',
      items_collected: 0,
      valet_notes: '',
      customer_notes: ''
    });
    setShowReportDialog(true);
  };

  const handleSubmitReport = async () => {
    if (!selectedSchedule) return;

    try {
      // Update pickup schedule
      const { error: scheduleError } = await supabase
        .from('pickup_schedules')
        .update({ 
          status: 'completed',
          completed_at: reportForm.end_time,
          valet_notes: reportForm.valet_notes
        })
        .eq('id', selectedSchedule.id);

      if (scheduleError) throw scheduleError;

      // Create service report
      const { error: reportError } = await supabase
        .from('service_reports')
        .insert({
          pickup_schedule_id: selectedSchedule.id,
          valet_id: userProfile?.id,
          start_time: reportForm.start_time,
          end_time: reportForm.end_time,
          service_type: reportForm.service_type,
          items_collected: reportForm.items_collected,
          valet_notes: reportForm.valet_notes,
          customer_notes: reportForm.customer_notes,
          status: 'completed'
        });

      if (reportError) throw reportError;

      toast({
        title: "Service Completed",
        description: "Service report has been submitted successfully",
      });

      setShowReportDialog(false);
      setSelectedSchedule(null);
      fetchAssignedSchedules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete service",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (userProfile?.role !== 'elite_valet') {
    return (
      <Card className="border-luxury-gold/20">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            This section is only available for Elite Valet personnel.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-luxury-navy">Valet Assignments</h3>
        <Button onClick={fetchAssignedSchedules} variant="outline" disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid gap-4">
        {schedules.map((schedule) => (
          <Card key={schedule.id} className="border-luxury-gold/20">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg text-luxury-navy">
                    {schedule.apartment?.complex?.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="w-4 h-4" />
                    {schedule.apartment?.building} - Unit {schedule.apartment?.unit_number}
                    <span>•</span>
                    Floor {schedule.apartment?.floor_number}
                  </div>
                </div>
                <Badge className={getStatusColor(schedule.status)}>
                  {schedule.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Schedule Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-luxury-gold" />
                  <span>{new Date(schedule.scheduled_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-luxury-gold" />
                  <span>{formatTime(schedule.scheduled_time)}</span>
                </div>
              </div>

              {/* Notes */}
              {schedule.notes && (
                <div className="bg-luxury-cream p-3 rounded-md">
                  <div className="text-sm text-luxury-navy">
                    <strong>Notes:</strong> {schedule.notes}
                  </div>
                </div>
              )}

              {/* Service Timing */}
              {schedule.started_at && (
                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="text-sm text-blue-800">
                    <strong>Started:</strong> {new Date(schedule.started_at).toLocaleString()}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {schedule.status === 'scheduled' && (
                  <Button
                    onClick={() => handleStartService(schedule.id)}
                    variant="gold"
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Service
                  </Button>
                )}
                {schedule.status === 'in-progress' && (
                  <Button
                    onClick={() => handleCompleteService(schedule)}
                    variant="gold"
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Service
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {schedules.length === 0 && !loading && (
          <Card className="border-luxury-gold/20">
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                No scheduled pickups assigned to you at the moment.
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Service Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-2xl bg-background">
          <DialogHeader>
            <DialogTitle>Complete Service Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSchedule && (
              <div className="bg-luxury-cream p-3 rounded-md">
                <div className="text-sm text-luxury-navy">
                  <strong>Service for:</strong> {selectedSchedule.apartment?.complex?.name} - 
                  {selectedSchedule.apartment?.building} Unit {selectedSchedule.apartment?.unit_number}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Items Collected</Label>
                <input
                  type="number"
                  min="0"
                  value={reportForm.items_collected}
                  onChange={(e) => setReportForm(prev => ({ ...prev, items_collected: parseInt(e.target.value) || 0 }))}
                  className="w-full p-2 border rounded-md bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Service Type</Label>
                <select
                  value={reportForm.service_type}
                  onChange={(e) => setReportForm(prev => ({ ...prev, service_type: e.target.value }))}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inspection">Inspection</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Valet Notes</Label>
              <Textarea
                value={reportForm.valet_notes}
                onChange={(e) => setReportForm(prev => ({ ...prev, valet_notes: e.target.value }))}
                placeholder="Add any notes about the service completion..."
                className="bg-background"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Customer Feedback (Optional)</Label>
              <Textarea
                value={reportForm.customer_notes}
                onChange={(e) => setReportForm(prev => ({ ...prev, customer_notes: e.target.value }))}
                placeholder="Any feedback from the customer..."
                className="bg-background"
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowReportDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSubmitReport} variant="gold" className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Service
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ValetWorkflow;