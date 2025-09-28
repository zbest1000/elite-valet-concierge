import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Calendar, TrendingUp, Users, CheckCircle } from 'lucide-react';

interface AnalyticsData {
  totalSchedules: number;
  completedSchedules: number;
  activeAssignments: number;
  totalValets: number;
  monthlyData: Array<{
    month: string;
    schedules: number;
    completed: number;
  }>;
  statusDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const Analytics: React.FC = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSchedules: 0,
    completedSchedules: 0,
    activeAssignments: 0,
    totalValets: 0,
    monthlyData: [],
    statusDistribution: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch total schedules
      const { count: totalSchedules } = await supabase
        .from('pickup_schedules')
        .select('*', { count: 'exact', head: true });

      // Fetch completed schedules
      const { count: completedSchedules } = await supabase
        .from('pickup_schedules')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Fetch active assignments
      const { count: activeAssignments } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch total valets
      const { count: totalValets } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'elite_valet');

      // Fetch monthly data for last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: monthlySchedules } = await supabase
        .from('pickup_schedules')
        .select('scheduled_date, status')
        .gte('scheduled_date', sixMonthsAgo.toISOString().split('T')[0]);

      // Process monthly data
      const monthlyData = processMonthlyData(monthlySchedules || []);

      // Fetch status distribution
      const { data: statusData } = await supabase
        .from('pickup_schedules')
        .select('status');

      const statusDistribution = processStatusDistribution(statusData || []);

      setAnalytics({
        totalSchedules: totalSchedules || 0,
        completedSchedules: completedSchedules || 0,
        activeAssignments: activeAssignments || 0,
        totalValets: totalValets || 0,
        monthlyData,
        statusDistribution,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = (schedules: any[]) => {
    const monthMap = new Map();
    const months = [];
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      monthMap.set(monthKey, { month: monthName, schedules: 0, completed: 0 });
      months.push(monthKey);
    }

    // Count schedules by month
    schedules.forEach(schedule => {
      const monthKey = schedule.scheduled_date.slice(0, 7);
      if (monthMap.has(monthKey)) {
        const monthData = monthMap.get(monthKey);
        monthData.schedules++;
        if (schedule.status === 'completed') {
          monthData.completed++;
        }
      }
    });

    return months.map(month => monthMap.get(month));
  };

  const processStatusDistribution = (schedules: any[]) => {
    const statusCounts = schedules.reduce((acc, schedule) => {
      acc[schedule.status] = (acc[schedule.status] || 0) + 1;
      return acc;
    }, {});

    const colors = {
      scheduled: '#3b82f6',
      'in-progress': '#f59e0b',
      completed: '#10b981',
      missed: '#ef4444',
      cancelled: '#6b7280',
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count as number,
      color: colors[status as keyof typeof colors] || '#6b7280',
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-luxury-navy">Analytics</h2>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const completionRate = analytics.totalSchedules > 0 
    ? ((analytics.completedSchedules / analytics.totalSchedules) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-luxury-navy">Analytics Dashboard</h2>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Schedules</p>
                <p className="text-2xl font-bold text-luxury-navy">{analytics.totalSchedules}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-luxury-navy">{completionRate}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Assignments</p>
                <p className="text-2xl font-bold text-luxury-navy">{analytics.activeAssignments}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Elite Valets</p>
                <p className="text-2xl font-bold text-luxury-navy">{analytics.totalValets}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="schedules" fill="#3b82f6" name="Scheduled" />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;