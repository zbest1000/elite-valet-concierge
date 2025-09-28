import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { 
  CalendarIcon, 
  Clock, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  Package,
  ArrowLeft,
  Users,
  Building,
  Settings,
  Plus,
  Edit
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import ScheduleForm from '@/components/ScheduleForm';
import AssignmentForm from '@/components/AssignmentForm';
import PropertyManager from '@/components/PropertyManager';
import Analytics from '@/components/Analytics';

interface PickupSchedule {
  id: string;
  apartment_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  notes?: string;
  apartment?: {
    unit_number: string;
    building: string;
    complex?: {
      name: string;
    };
  };
}

interface Assignment {
  id: string;
  assignment_type: string;
  status: string;
  start_date: string;
  end_date?: string;
  description?: string;
  complex?: {
    name: string;
  };
}

const ImprovedDashboard = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [schedules, setSchedules] = useState<PickupSchedule[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showPropertyManager, setShowPropertyManager] = useState(false);
  const [stats, setStats] = useState({
    scheduled: 0,
    completed: 0,
    inProgress: 0,
    totalAssignments: 0,
  });

  useEffect(() => {
    if (userProfile) {
      fetchData();
      
      // Set up real-time updates
      const channel = supabase
        .channel('dashboard-updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'pickup_schedules'
        }, () => {
          fetchData(); // Refresh data when schedules change
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'assignments'
        }, () => {
          fetchData(); // Refresh data when assignments change
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userProfile]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (userProfile.role === 'admin') {
        await fetchAdminData();
      } else if (userProfile.role === 'elite_valet') {
        await fetchValetData();
      } else {
        await fetchResidentData();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    // Admin can see all schedules and assignments
    const { data: schedulesData, error: schedulesError } = await supabase
      .from('pickup_schedules')
      .select(`
        *,
        apartment:apartments(
          unit_number,
          building,
          complex:complexes(name)
        )
      `)
      .order('scheduled_date', { ascending: true })
      .limit(20);

    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from('assignments')
      .select(`
        *,
        complex:complexes(name)
      `)
      .order('created_at', { ascending: false });

    if (schedulesError) throw schedulesError;
    if (assignmentsError) throw assignmentsError;

    setSchedules(schedulesData || []);
    setAssignments(assignmentsData || []);
    calculateStats(schedulesData || [], assignmentsData || []);
  };

  const fetchValetData = async () => {
    // Valet can see their assigned schedules and assignments
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from('assignments')
      .select(`
        *,
        complex:complexes(name)
      `)
      .eq('valet_id', userProfile.id)
      .order('created_at', { ascending: false });

    if (assignmentsError) throw assignmentsError;

    // Get apartment IDs from assignments
    const apartmentIds = assignmentsData?.flatMap(a => a.apartment_ids || []) || [];

    const { data: schedulesData, error: schedulesError } = await supabase
      .from('pickup_schedules')
      .select(`
        *,
        apartment:apartments(
          unit_number,
          building,
          complex:complexes(name)
        )
      `)
      .in('apartment_id', apartmentIds)
      .order('scheduled_date', { ascending: true })
      .limit(20);

    if (schedulesError) throw schedulesError;

    setSchedules(schedulesData || []);
    setAssignments(assignmentsData || []);
    calculateStats(schedulesData || [], assignmentsData || []);
  };

  const fetchResidentData = async () => {
    // Resident can see their own apartment's schedules
    const { data: apartmentData, error: apartmentError } = await supabase
      .from('apartments')
      .select('id')
      .eq('resident_id', userProfile.id);

    if (apartmentError) throw apartmentError;

    if (apartmentData && apartmentData.length > 0) {
      const apartmentIds = apartmentData.map(a => a.id);

      const { data: schedulesData, error: schedulesError } = await supabase
        .from('pickup_schedules')
        .select(`
          *,
          apartment:apartments(
            unit_number,
            building,
            complex:complexes(name)
          )
        `)
        .in('apartment_id', apartmentIds)
        .order('scheduled_date', { ascending: true })
        .limit(20);

      if (schedulesError) throw schedulesError;

      setSchedules(schedulesData || []);
      calculateStats(schedulesData || [], []);
    }
  };

  const calculateStats = (schedules: PickupSchedule[], assignments: Assignment[]) => {
    const scheduled = schedules.filter(s => s.status === 'scheduled').length;
    const completed = schedules.filter(s => s.status === 'completed').length;
    const inProgress = schedules.filter(s => s.status === 'in-progress').length;
    const totalAssignments = assignments.length;

    setStats({ scheduled, completed, inProgress, totalAssignments });
  };

  const updateScheduleStatus = async (scheduleId: string, newStatus: string, notes?: string) => {
    const { error } = await supabase
      .from('pickup_schedules')
      .update({ 
        status: newStatus,
        notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', scheduleId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Schedule updated successfully",
      });
      fetchData(); // Refresh data
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "in-progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "scheduled": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "missed": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "cancelled": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "in-progress": return <Clock className="w-4 h-4" />;
      case "scheduled": return <CalendarIcon className="w-4 h-4" />;
      case "missed": case "cancelled": return <AlertCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-luxury-navy font-bold text-sm">EV</span>
          </div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-luxury-navy hover:text-luxury-gold transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Home</span>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center">
                  <span className="text-luxury-navy font-bold text-sm">EV</span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-luxury-navy">
                  {userProfile?.role === 'admin' ? 'Admin Dashboard' : 
                   userProfile?.role === 'elite_valet' ? 'Valet Dashboard' : 
                   'Resident Dashboard'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Welcome, {userProfile?.first_name}
              </span>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <Tabs defaultValue="schedules" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="schedules" className="text-xs sm:text-sm">Schedules</TabsTrigger>
            {(userProfile?.role === 'admin' || userProfile?.role === 'elite_valet') && (
              <TabsTrigger value="assignments" className="text-xs sm:text-sm">Assignments</TabsTrigger>
            )}
            {userProfile?.role === 'admin' && (
              <>
                <TabsTrigger value="management" className="text-xs sm:text-sm">Management</TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Scheduled</p>
                    <p className="text-xl sm:text-2xl font-bold text-luxury-navy">{stats.scheduled}</p>
                  </div>
                  <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">In Progress</p>
                    <p className="text-xl sm:text-2xl font-bold text-luxury-navy">{stats.inProgress}</p>
                  </div>
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-xl sm:text-2xl font-bold text-luxury-navy">{stats.completed}</p>
                  </div>
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                      {userProfile?.role === 'admin' ? 'Total Assignments' : 'My Assignments'}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-luxury-navy">{stats.totalAssignments}</p>
                  </div>
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <TabsContent value="schedules" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Calendar Sidebar - Hidden on mobile, shown in modal or separate section */}
              <div className="hidden lg:block space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-luxury-navy">Calendar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Schedules List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-luxury-navy">Pickup Schedules</h2>
                    {/* Mobile Calendar Toggle */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="lg:hidden">
                          <CalendarIcon className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="rounded-md border"
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                  {userProfile?.role === 'admin' && (
                    <Dialog open={showScheduleForm} onOpenChange={setShowScheduleForm}>
                      <DialogTrigger asChild>
                        <Button variant="gold" size="sm" className="w-full sm:w-auto">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Schedule
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <ScheduleForm 
                          onSuccess={() => {
                            setShowScheduleForm(false);
                            fetchData();
                          }}
                          onCancel={() => setShowScheduleForm(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <div className="space-y-4">
                  {schedules.length === 0 ? (
                    <Card className="p-8 sm:p-12">
                      <div className="text-center">
                        <Package className="w-12 h-12 sm:w-16 sm:h-16 text-luxury-gold mx-auto mb-4" />
                        <h3 className="text-lg sm:text-xl font-semibold text-luxury-navy mb-2">No Schedules Found</h3>
                        <p className="text-sm sm:text-base text-muted-foreground mb-4">
                          {userProfile?.role === 'admin' 
                            ? 'No pickup schedules have been created yet.' 
                            : 'No pickup schedules assigned to you.'}
                        </p>
                        {userProfile?.role === 'admin' && (
                          <Button variant="gold" onClick={() => setShowScheduleForm(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create First Schedule
                          </Button>
                        )}
                      </div>
                    </Card>
                  ) : (
                    schedules.map((schedule) => (
                      <Card key={schedule.id} className="hover:shadow-elegant transition-shadow duration-300">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            <div className="flex-1 w-full">
                              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                                <Badge className={`flex items-center space-x-1 w-fit ${getStatusColor(schedule.status)}`}>
                                  {getStatusIcon(schedule.status)}
                                  <span className="capitalize">{schedule.status.replace("-", " ")}</span>
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(schedule.scheduled_date), 'MMM dd, yyyy')}
                                </span>
                              </div>
                              
                              <h3 className="text-base sm:text-lg font-semibold text-luxury-navy mb-2">
                                {schedule.apartment?.building} - Unit {schedule.apartment?.unit_number}
                              </h3>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{schedule.scheduled_time}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Building className="w-4 h-4" />
                                  <span>{schedule.apartment?.complex?.name}</span>
                                </div>
                              </div>
                              
                              {schedule.notes && (
                                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                                  {schedule.notes}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 w-full sm:w-auto">
                              {schedule.status === "scheduled" && userProfile?.role !== 'resident' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="flex-1 sm:flex-none"
                                  onClick={() => updateScheduleStatus(schedule.id, "in-progress", "Service has begun")}
                                >
                                  Start Service
                                </Button>
                              )}
                              {schedule.status === "in-progress" && userProfile?.role !== 'resident' && (
                                <Button 
                                  variant="premium" 
                                  size="sm"
                                  className="flex-1 sm:flex-none"
                                  onClick={() => updateScheduleStatus(schedule.id, "completed", "Service completed successfully")}
                                >
                                  Mark Complete
                                </Button>
                              )}
                              {userProfile?.role === 'admin' && (
                                <Button variant="ghost" size="sm" className="flex-1 sm:flex-none">
                                  <Edit className="w-4 h-4 sm:mr-2" />
                                  <span className="hidden sm:inline">Edit</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {(userProfile?.role === 'admin' || userProfile?.role === 'elite_valet') && (
            <TabsContent value="assignments" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-luxury-navy">
                  {userProfile?.role === 'admin' ? 'All Assignments' : 'My Assignments'}
                </h2>
                {userProfile?.role === 'admin' && (
                  <Dialog open={showAssignmentForm} onOpenChange={setShowAssignmentForm}>
                    <DialogTrigger asChild>
                      <Button variant="gold">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Assignment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <AssignmentForm 
                        onSuccess={() => {
                          setShowAssignmentForm(false);
                          fetchData();
                        }}
                        onCancel={() => setShowAssignmentForm(false)}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <div className="grid gap-4">
                {assignments.map((assignment) => (
                  <Card key={assignment.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <Badge variant={assignment.status === 'active' ? 'default' : 'secondary'}>
                              {assignment.status}
                            </Badge>
                            <Badge variant="outline">
                              {assignment.assignment_type.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-luxury-navy mb-2">
                            {assignment.complex?.name}
                          </h3>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                            <span>Start: {format(new Date(assignment.start_date), 'MMM dd, yyyy')}</span>
                            {assignment.end_date && (
                              <span>End: {format(new Date(assignment.end_date), 'MMM dd, yyyy')}</span>
                            )}
                          </div>
                          
                          {assignment.description && (
                            <p className="text-sm text-muted-foreground">
                              {assignment.description}
                            </p>
                          )}
                        </div>
                        
                        {userProfile?.role === 'admin' && (
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}

          {userProfile?.role === 'admin' && (
            <>
              <TabsContent value="management" className="space-y-6">
                <h2 className="text-2xl font-bold text-luxury-navy">Management Tools</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Users & Roles</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">Manage user accounts and role assignments</p>
                      <Button variant="outline" className="w-full">
                        <Users className="w-4 h-4 mr-2" />
                        Manage Users
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Properties</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">Manage complexes and apartments</p>
                      <Dialog open={showPropertyManager} onOpenChange={setShowPropertyManager}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <Building className="w-4 h-4 mr-2" />
                            Manage Properties
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <PropertyManager />
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">Configure system settings</p>
                      <Button variant="outline" className="w-full">
                        <Settings className="w-4 h-4 mr-2" />
                        System Settings
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-6">
                <Analytics />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default ImprovedDashboard;