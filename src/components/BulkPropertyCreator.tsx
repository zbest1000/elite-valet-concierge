import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Building2, Plus, Wand2 } from 'lucide-react';

interface BuildingTemplate {
  id: string;
  name: string;
  description: string;
  floors_count: number;
  units_per_floor: number;
  naming_pattern: string;
}

interface Complex {
  id: string;
  name: string;
}

interface BulkPropertyCreatorProps {
  complexes: Complex[];
  onSuccess: () => void;
}

const BulkPropertyCreator: React.FC<BulkPropertyCreatorProps> = ({ complexes, onSuccess }) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<BuildingTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState({
    complex_id: '',
    building_name: '',
    start_floor: 1,
    end_floor: 5,
    units_per_floor: 8,
    naming_pattern: '{floor}{unit:02d}',
    preview_units: [] as string[]
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    generatePreview();
  }, [formData.start_floor, formData.end_floor, formData.units_per_floor, formData.naming_pattern]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('building_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const generatePreview = () => {
    const preview: string[] = [];
    const maxPreview = 10; // Limit preview to first 10 units

    for (let floor = formData.start_floor; floor <= Math.min(formData.start_floor + 1, formData.end_floor); floor++) {
      for (let unit = 1; unit <= Math.min(formData.units_per_floor, maxPreview); unit++) {
        const unitName = formData.naming_pattern
          .replace('{floor}', floor.toString())
          .replace('{unit:02d}', unit.toString().padStart(2, '0'));
        preview.push(`${formData.building_name} - ${unitName}`);
        
        if (preview.length >= maxPreview) break;
      }
      if (preview.length >= maxPreview) break;
    }

    setFormData(prev => ({ ...prev, preview_units: preview }));
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        start_floor: 1,
        end_floor: template.floors_count,
        units_per_floor: template.units_per_floor,
        naming_pattern: template.naming_pattern
      }));
    }
    setSelectedTemplate(templateId);
  };

  const handleBulkCreate = async () => {
    if (!formData.complex_id || !formData.building_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a complex and enter a building name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('bulk_create_apartments', {
        p_complex_id: formData.complex_id,
        p_building: formData.building_name.trim(),
        p_start_floor: formData.start_floor,
        p_end_floor: formData.end_floor,
        p_units_per_floor: formData.units_per_floor,
        p_naming_pattern: formData.naming_pattern
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Created ${data} apartments successfully`,
      });

      // Reset form
      setFormData({
        complex_id: '',
        building_name: '',
        start_floor: 1,
        end_floor: 5,
        units_per_floor: 8,
        naming_pattern: '{floor}{unit:02d}',
        preview_units: []
      });
      setSelectedTemplate('');
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create apartments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalUnits = (formData.end_floor - formData.start_floor + 1) * formData.units_per_floor;

  return (
    <Card className="border-luxury-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-luxury-navy">
          <Building2 className="w-5 h-5 text-luxury-gold" />
          Bulk Property Creator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Selection */}
        <div className="space-y-2">
          <Label>Building Template (Optional)</Label>
          <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Choose a template to get started" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-luxury-gold/20 z-50">
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id} className="hover:bg-luxury-cream">
                  <div>
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {template.floors_count} floors, {template.units_per_floor} units/floor
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator className="bg-luxury-gold/20" />

        {/* Complex and Building */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="complex">Complex *</Label>
            <Select value={formData.complex_id} onValueChange={(value) => setFormData(prev => ({ ...prev, complex_id: value }))}>
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
            <Label htmlFor="building">Building Name *</Label>
            <Input
              id="building"
              value={formData.building_name}
              onChange={(e) => setFormData(prev => ({ ...prev, building_name: e.target.value }))}
              placeholder="Building A"
              className="bg-background"
            />
          </div>
        </div>

        {/* Floor Configuration */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-floor">Start Floor</Label>
            <Input
              id="start-floor"
              type="number"
              min="1"
              value={formData.start_floor}
              onChange={(e) => setFormData(prev => ({ ...prev, start_floor: parseInt(e.target.value) || 1 }))}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-floor">End Floor</Label>
            <Input
              id="end-floor"
              type="number"
              min="1"
              value={formData.end_floor}
              onChange={(e) => setFormData(prev => ({ ...prev, end_floor: parseInt(e.target.value) || 1 }))}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="units-per-floor">Units per Floor</Label>
            <Input
              id="units-per-floor"
              type="number"
              min="1"
              value={formData.units_per_floor}
              onChange={(e) => setFormData(prev => ({ ...prev, units_per_floor: parseInt(e.target.value) || 1 }))}
              className="bg-background"
            />
          </div>
        </div>

        {/* Naming Pattern */}
        <div className="space-y-2">
          <Label htmlFor="naming-pattern">Unit Naming Pattern</Label>
          <Input
            id="naming-pattern"
            value={formData.naming_pattern}
            onChange={(e) => setFormData(prev => ({ ...prev, naming_pattern: e.target.value }))}
            placeholder="{floor}{unit:02d}"
            className="bg-background"
          />
          <p className="text-sm text-muted-foreground">
            Use {'{floor}'} for floor number and {'{unit:02d}'} for zero-padded unit number
          </p>
        </div>

        {/* Preview */}
        {formData.preview_units.length > 0 && (
          <div className="space-y-2">
            <Label>Preview ({totalUnits} total units)</Label>
            <div className="bg-luxury-cream p-3 rounded-md">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1 text-sm">
                {formData.preview_units.map((unit, index) => (
                  <div key={index} className="text-luxury-navy">
                    {unit}
                  </div>
                ))}
                {totalUnits > formData.preview_units.length && (
                  <div className="text-muted-foreground italic">
                    ... and {totalUnits - formData.preview_units.length} more
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleBulkCreate}
            disabled={loading || !formData.complex_id || !formData.building_name.trim()}
            className="flex-1"
            variant="gold"
          >
            {loading ? (
              <>Loading...</>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Create {totalUnits} Apartments
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkPropertyCreator;