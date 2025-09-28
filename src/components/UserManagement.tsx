import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, UserPlus, Settings, Eye, Edit3, Building } from 'lucide-react';

interface User {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number: string;
  created_at: string;
}

interface PropertyAssignment {
  id: string;
  user_id: string;
  complex_id: string;
  building: string;
  floor_number: number;
  assignment_type: string;
  permissions: any;
  is_active: boolean;
  complex?: { name: string };
  user?: { first_name: string; last_name: string; role: string };
}

interface Complex {
  id: string;
  name: string;
}

interface UserManagementProps {
  complexes: Complex[];
}

const UserManagement: React.FC<UserManagementProps> = ({ complexes }) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<PropertyAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [assignmentForm, setAssignmentForm] = useState({
    complex_id: '',
    building: '',
    floor_number: '',
    assignment_type: 'full_access',
    permissions: {
      view_schedules: true,
      create_schedules: true,
      manage_users: false,
      manage_properties: false,
      view_reports: true,
      export_data: false
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .order('first_name');

      if (userError) throw userError;
      setUsers(userData || []);

      // Fetch property assignments
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('property_assignments')
        .select(`
          *,
          complex:complexes(name)
        `)
        .order('created_at', { ascending: false });

      if (assignmentError) throw assignmentError;
      
      // Fetch user details for assignments
      const assignmentsWithUsers = await Promise.all(
        (assignmentData || []).map(async (assignment) => {
          const { data: userData } = await supabase
            .from('profiles')
            .select('first_name, last_name, role')
            .eq('id', assignment.user_id)
            .single();
          
          return {
            ...assignment,
            user: userData
          };
        })
      );
      
      setAssignments(assignmentsWithUsers);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUser = async () => {
    if (!selectedUser || !assignmentForm.complex_id) {
      toast({
        title: "Validation Error",
        description: "Please select a user and complex",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('property_assignments')
        .insert({
          user_id: selectedUser,
          complex_id: assignmentForm.complex_id,
          building: assignmentForm.building || null,
          floor_number: assignmentForm.floor_number ? parseInt(assignmentForm.floor_number) : null,
          assignment_type: assignmentForm.assignment_type,
          permissions: assignmentForm.permissions,
          created_by: selectedUser, // This should be current user's profile ID
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User assigned to property successfully",
      });

      setShowAssignDialog(false);
      setSelectedUser('');
      setAssignmentForm({
        complex_id: '',
        building: '',
        floor_number: '',
        assignment_type: 'full_access',
        permissions: {
          view_schedules: true,
          create_schedules: true,
          manage_users: false,
          manage_properties: false,
          view_reports: true,
          export_data: false
        }
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign user",
        variant: "destructive",
      });
    }
  };

  const toggleAssignmentStatus = async (assignmentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('property_assignments')
        .update({ is_active: !currentStatus })
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Assignment ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update assignment",
        variant: "destructive",
      });
    }
  };

  const getPermissionBadges = (permissions: any) => {
    const badges = [];
    if (permissions?.view_schedules) badges.push('View Schedules');
    if (permissions?.create_schedules) badges.push('Create Schedules');
    if (permissions?.manage_users) badges.push('Manage Users');
    if (permissions?.manage_properties) badges.push('Manage Properties');
    if (permissions?.view_reports) badges.push('View Reports');
    if (permissions?.export_data) badges.push('Export Data');
    return badges;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-luxury-navy">User Management</h3>
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogTrigger asChild>
            <Button variant="gold">
              <UserPlus className="w-4 h-4 mr-2" />
              Assign User to Property
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-background">
            <DialogHeader>
              <DialogTitle>Assign User to Property</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* User Selection */}
              <div className="space-y-2">
                <Label>Select User</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-luxury-gold/20 z-50">
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id} className="hover:bg-luxury-cream">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {user.role.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Property Assignment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Complex *</Label>
                  <Select value={assignmentForm.complex_id} onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, complex_id: value }))}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select complex" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-luxury-gold/20 z-50">
                      {complexes.map((complex) => (
                        <SelectItem key={complex.id} value={complex.id} className="hover:bg-luxury-cream">
                          {complex.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Building (Optional)</Label>
                  <Input
                    value={assignmentForm.building}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, building: e.target.value }))}
                    placeholder="Building A"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Floor (Optional)</Label>
                  <Input
                    type="number"
                    value={assignmentForm.floor_number}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, floor_number: e.target.value }))}
                    placeholder="1"
                    className="bg-background"
                  />
                </div>
              </div>

              {/* Assignment Type */}
              <div className="space-y-2">
                <Label>Assignment Type</Label>
                <Select value={assignmentForm.assignment_type} onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, assignment_type: value }))}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-luxury-gold/20 z-50">
                    <SelectItem value="full_access" className="hover:bg-luxury-cream">Full Access</SelectItem>
                    <SelectItem value="building_manager" className="hover:bg-luxury-cream">Building Manager</SelectItem>
                    <SelectItem value="floor_supervisor" className="hover:bg-luxury-cream">Floor Supervisor</SelectItem>
                    <SelectItem value="valet_assignment" className="hover:bg-luxury-cream">Valet Assignment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Permissions */}
              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(assignmentForm.permissions).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => 
                          setAssignmentForm(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, [key]: checked }
                          }))
                        }
                      />
                      <Label htmlFor={key} className="text-sm capitalize">
                        {key.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAssignDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAssignUser} variant="gold" className="flex-1">
                  Assign User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users List */}
      <Card className="border-luxury-gold/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-luxury-navy">
            <Users className="w-5 h-5 text-luxury-gold" />
            All Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-luxury-cream rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-luxury-gold rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-luxury-navy">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-luxury-navy">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {user.role.replace('_', ' ')} • {user.phone_number || 'No phone'}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="border-luxury-gold text-luxury-navy">
                  {user.role.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Property Assignments */}
      <Card className="border-luxury-gold/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-luxury-navy">
            <Building className="w-5 h-5 text-luxury-gold" />
            Property Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="border border-luxury-gold/20 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-luxury-navy">
                        {assignment.user?.first_name} {assignment.user?.last_name}
                      </h4>
                      <Badge variant="outline" className="border-luxury-gold text-luxury-navy">
                        {assignment.user?.role?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>{assignment.complex?.name}</div>
                      {assignment.building && <div>Building: {assignment.building}</div>}
                      {assignment.floor_number && <div>Floor: {assignment.floor_number}</div>}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {getPermissionBadges(assignment.permissions).map((permission) => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={assignment.is_active ? "default" : "secondary"}
                      className={assignment.is_active ? "bg-green-100 text-green-800" : ""}
                    >
                      {assignment.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAssignmentStatus(assignment.id, assignment.is_active)}
                    >
                      {assignment.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;