import { useState } from 'react';
import { Save, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Mock settings - would come from AppSettings table
const initialSettings = {
  DELIVERY_BASE_FEE: '20',
  DELIVERY_PER_KM_RATE: '9',
  MULTI_ITEM_DISCOUNT: '10',
  AGENT_BASE_EARNING: '20',
  AGENT_MULTI_ITEM_EARNING: '25',
  PLATFORM_COMMISSION: '5',
};

export default function AdminSettings() {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaving(false);
    toast({
      title: "Settings saved",
      description: "Your changes have been saved successfully.",
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Configure pricing and business rules</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Delivery Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Delivery Pricing
            </CardTitle>
            <CardDescription>
              Configure delivery fees charged to customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="baseFee">Base Delivery Fee (₹)</Label>
                <Input
                  id="baseFee"
                  type="number"
                  value={settings.DELIVERY_BASE_FEE}
                  onChange={(e) => handleChange('DELIVERY_BASE_FEE', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Charged for same-village delivery
                </p>
              </div>
              <div>
                <Label htmlFor="perKmRate">Per KM Rate (₹)</Label>
                <Input
                  id="perKmRate"
                  type="number"
                  value={settings.DELIVERY_PER_KM_RATE}
                  onChange={(e) => handleChange('DELIVERY_PER_KM_RATE', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Additional charge for inter-village
                </p>
              </div>
              <div>
                <Label htmlFor="multiDiscount">Multi-Item Discount (₹)</Label>
                <Input
                  id="multiDiscount"
                  type="number"
                  value={settings.MULTI_ITEM_DISCOUNT}
                  onChange={(e) => handleChange('MULTI_ITEM_DISCOUNT', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Discount for 2+ items from same restaurant
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Earnings */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Earnings</CardTitle>
            <CardDescription>
              Configure how much agents earn per delivery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="agentBase">Base Earning (₹)</Label>
                <Input
                  id="agentBase"
                  type="number"
                  value={settings.AGENT_BASE_EARNING}
                  onChange={(e) => handleChange('AGENT_BASE_EARNING', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Per single-item delivery
                </p>
              </div>
              <div>
                <Label htmlFor="agentMulti">Multi-Item Earning (₹)</Label>
                <Input
                  id="agentMulti"
                  type="number"
                  value={settings.AGENT_MULTI_ITEM_EARNING}
                  onChange={(e) => handleChange('AGENT_MULTI_ITEM_EARNING', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Per multi-item delivery
                </p>
              </div>
              <div>
                <Label htmlFor="platformFee">Platform Commission (₹)</Label>
                <Input
                  id="platformFee"
                  type="number"
                  value={settings.PLATFORM_COMMISSION}
                  onChange={(e) => handleChange('PLATFORM_COMMISSION', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Retained from multi-item orders
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Examples</CardTitle>
            <CardDescription>
              How fees are calculated based on current settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Same Village, 1 Item</h4>
                <p className="text-muted-foreground">
                  Customer pays: ₹{settings.DELIVERY_BASE_FEE} | Agent earns: ₹{settings.AGENT_BASE_EARNING}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Same Village, 2+ Items</h4>
                <p className="text-muted-foreground">
                  Customer pays: ₹{parseInt(settings.DELIVERY_BASE_FEE) - parseInt(settings.MULTI_ITEM_DISCOUNT)} (after ₹{settings.MULTI_ITEM_DISCOUNT} discount) | Agent earns: ₹{settings.AGENT_MULTI_ITEM_EARNING} | Platform: ₹{settings.PLATFORM_COMMISSION}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Inter-Village (3km), 1 Item</h4>
                <p className="text-muted-foreground">
                  Customer pays: ₹{parseInt(settings.DELIVERY_BASE_FEE) + (3 * parseInt(settings.DELIVERY_PER_KM_RATE))} (₹{settings.DELIVERY_BASE_FEE} + 3×₹{settings.DELIVERY_PER_KM_RATE}) | Agent earns: ₹{parseInt(settings.AGENT_BASE_EARNING) + 15} (base + ₹5/km bonus)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
