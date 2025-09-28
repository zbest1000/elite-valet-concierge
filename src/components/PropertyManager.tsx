import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Building, Home } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Complex {
  id: string;
  name: string;
  address: string;
  is_active: boolean;
  created_at: string;
}

interface Apartment {
  id: string;
  unit_number: string;
  building: string;
  floor_number: number;
  complex_id: string;
  is_active: boolean;
  complex?: {
    name: string;
  };
}

const PropertyManager: React.FC = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [complexes, setComplexes] = useState<Complex[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showComplexForm, setShowComplexForm] = useState(false);
  const [showApartmentForm, setShowApartmentForm] = useState(false);
  const [complexForm, setComplexForm] = useState({ name: '', address: '' });
  const [apartmentForm, setApartmentForm] = useState({
    complex_id: '',
    building: '',
    unit_number: '',
    floor_number: 1,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch complexes
      const { data: complexData, error: complexError } = await supabase
        .from('complexes')
        .select('*')
        .order('name');

      if (complexError) throw complexError;
      setComplexes(complexData || []);

      // Fetch apartments
      const { data: apartmentData, error: apartmentError } = await supabase
        .from('apartments')
        .select(`
          *,
          complex:complexes(name)
        `)
        .order('building')
        .order('unit_number');

      if (apartmentError) throw apartmentError;
      setApartments(apartmentData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load property data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComplex = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complexForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Complex name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('complexes')
        .insert({
          name: complexForm.name.trim(),
          address: complexForm.address.trim() || null,
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Complex created successfully",
      });
      
      setComplexForm({ name: '', address: '' });
      setShowComplexForm(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create complex",
        variant: "destructive",
      });
    }
  };

  const handleCreateApartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apartmentForm.complex_id || !apartmentForm.building.trim() || !apartmentForm.unit_number.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('apartments')
        .insert({
          complex_id: apartmentForm.complex_id,
          building: apartmentForm.building.trim(),
          unit_number: apartmentForm.unit_number.trim(),
          floor_number: apartmentForm.floor_number,
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Apartment created successfully",
      });
      
      setApartmentForm({ complex_id: '', building: '', unit_number: '', floor_number: 1 });
      setShowApartmentForm(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create apartment",
        variant: "destructive",
      });
    }
  };

  const toggleComplexStatus = async (complexId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('complexes')
        .update({ is_active: !currentStatus })
        .eq('id', complexId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Complex ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update complex",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-luxury-navy">Property Management</h2>
      </div>

      <Tabs defaultValue="complexes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="complexes">Complexes</TabsTrigger>
          <TabsTrigger value="apartments">Apartments</TabsTrigger>
        </TabsList>

        <TabsContent value="complexes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Complexes</h3>
            <Dialog open={showComplexForm} onOpenChange={setShowComplexForm}>
              <DialogTrigger asChild>
                <Button variant="gold">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Complex
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Complex</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateComplex} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="complex-name">Complex Name *</Label>
                    <Input
                      id="complex-name"
                      value={complexForm.name}
                      onChange={(e) => setComplexForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter complex name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complex-address">Address</Label>
                    <Input
                      id="complex-address"
                      value={complexForm.address}
                      onChange={(e) => setComplexForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter complex address"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowComplexForm(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" variant="gold" className="flex-1">
                      Create Complex
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {complexes.map((complex) => (
              <Card key={complex.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-luxury-gold" />
                      <div>
                        <h4 className="font-semibold">{complex.name}</h4>
                        {complex.address && (
                          <p className="text-sm text-muted-foreground">{complex.address}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        complex.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {complex.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleComplexStatus(complex.id, complex.is_active)}
                      >
                        {complex.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="apartments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Apartments</h3>
            <Dialog open={showApartmentForm} onOpenChange={setShowApartmentForm}>
              <DialogTrigger asChild>
                <Button variant="gold">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Apartment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Apartment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateApartment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apartment-complex">Complex *</Label>
                    <select
                      id="apartment-complex"
                      className="w-full p-2 border rounded-md"
                      value={apartmentForm.complex_id}
                      onChange={(e) => setApartmentForm(prev => ({ ...prev, complex_id: e.target.value }))}
                      required
                    >
                      <option value="">Select complex</option>
                      {complexes.filter(c => c.is_active).map((complex) => (
                        <option key={complex.id} value={complex.id}>
                          {complex.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="apartment-building">Building *</Label>
                      <Input
                        id="apartment-building"
                        value={apartmentForm.building}
                        onChange={(e) => setApartmentForm(prev => ({ ...prev, building: e.target.value }))}
                        placeholder="Building A"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apartment-unit">Unit Number *</Label>
                      <Input
                        id="apartment-unit"
                        value={apartmentForm.unit_number}
                        onChange={(e) => setApartmentForm(prev => ({ ...prev, unit_number: e.target.value }))}
                        placeholder="101"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apartment-floor">Floor Number</Label>
                    <Input
                      id="apartment-floor"
                      type="number"
                      min="1"
                      value={apartmentForm.floor_number}
                      onChange={(e) => setApartmentForm(prev => ({ ...prev, floor_number: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowApartmentForm(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" variant="gold" className="flex-1">
                      Create Apartment
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {apartments.map((apartment) => (
              <Card key={apartment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Home className="w-5 h-5 text-luxury-gold" />
                      <div>
                        <h4 className="font-semibold">
                          {apartment.building} - Unit {apartment.unit_number}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {apartment.complex?.name} • Floor {apartment.floor_number}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      apartment.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {apartment.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyManager;