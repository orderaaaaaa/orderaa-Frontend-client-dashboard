'use client';

import { AuthGuard } from '@/components/auth-guard';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Save, Upload, Bell, Shield, Globe, CreditCard } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    lowStock: true,
    newCustomers: false,
    marketing: true,
  });

  const [storeSettings, setStoreSettings] = useState({
    storeName: 'My Ecommerce Store',
    storeDescription: 'Your one-stop shop for quality products',
    currency: 'USD',
    timezone: 'America/New_York',
    language: 'en',
  });

  return (
    <AuthGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your store settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Navigation */}
          <div className="space-y-2">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start bg-[#5D24E1]/10 text-[#5D24E1]"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    General
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Security
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder.svg" alt="Admin" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Change Avatar
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    {/* <Input id="firstName" defaultValue="Admin" /> */}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    {/* <Input id="lastName" defaultValue="User" /> */}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {/* <Input
                    id="email"
                    type="email"
                    defaultValue="Admin@gmail.com"
                  /> */}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {/* <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                  /> */}
                </div>
              </CardContent>
            </Card>

            {/* Store Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Store Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  {/* <Input
                    id="storeName"
                    value={storeSettings.storeName}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        storeName: e.target.value,
                      })
                    }
                  /> */}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeDescription">Store Description</Label>
                  <Textarea
                    id="storeDescription"
                    value={storeSettings.storeDescription}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        storeDescription: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={storeSettings.currency}
                      onValueChange={(value) =>
                        setStoreSettings({ ...storeSettings, currency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD">
                          CAD - Canadian Dollar
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={storeSettings.timezone}
                      onValueChange={(value) =>
                        setStoreSettings({ ...storeSettings, timezone: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">
                          Eastern Time
                        </SelectItem>
                        <SelectItem value="America/Chicago">
                          Central Time
                        </SelectItem>
                        <SelectItem value="America/Denver">
                          Mountain Time
                        </SelectItem>
                        <SelectItem value="America/Los_Angeles">
                          Pacific Time
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Order Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when orders are placed or updated
                      </p>
                    </div>
                    <Switch
                      checked={notifications.orderUpdates}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          orderUpdates: checked,
                        })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Low Stock Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get alerted when products are running low
                      </p>
                    </div>
                    <Switch
                      checked={notifications.lowStock}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          lowStock: checked,
                        })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Customers</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when new customers register
                      </p>
                    </div>
                    <Switch
                      checked={notifications.newCustomers}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          newCustomers: checked,
                        })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive marketing tips and product updates
                      </p>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          marketing: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Badge variant="secondary">Not Enabled</Badge>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Change Password</Label>
                    <div className="space-y-2">
                      {/* <Input type="password" placeholder="Current password" />
                      <Input type="password" placeholder="New password" />
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                      /> */}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button className="bg-[#5D24E1] hover:bg-[#4A1DB8]">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
