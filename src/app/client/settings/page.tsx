"use client";

import { useState, useEffect } from "react";
import { ClientLayout } from "@/components/client/ClientLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Bell, 
  Lock, 
  CreditCard,
  Save,
  Mail,
  Phone
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Profile settings
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Update form fields when userData is loaded
  useEffect(() => {
    if (userData) {
      setFirstName(userData.profile?.firstName || "");
      setLastName(userData.profile?.lastName || "");
      setPhone(userData.profile?.phoneNumber || "");
      console.log("✅ Form fields updated:", {
        firstName: userData.profile?.firstName,
        lastName: userData.profile?.lastName,
        phone: userData.profile?.phoneNumber,
      });
    }
  }, [userData]);

  // Update email when user is loaded
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      // TODO: Implement profile update
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Profile Updated", "Your profile has been updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Update Failed", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      // TODO: Implement notification settings update
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Settings Saved", "Your notification preferences have been updated");
    } catch (error) {
      console.error("Error updating notifications:", error);
      toast.error("Update Failed", "Failed to update settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    toast.success("Email Sent", "Password reset link has been sent to your email");
  };

  return (
    <ClientLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Section */}
          <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              <p className="text-sm text-gray-600">Update your personal details and profile information</p>
            </div>
          </div>

          <Card className="border-blue-200 bg-white/80 backdrop-blur">
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={loading} className="bg-teal-500 hover:bg-teal-600">
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Bell className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
              <p className="text-sm text-gray-600">Choose how you want to receive notifications</p>
            </div>
          </div>

          <Card className="border-blue-200 bg-white/80 backdrop-blur">
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Receive notifications via text message
                  </p>
                </div>
                <Switch
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Appointment Reminders</Label>
                  <p className="text-sm text-gray-600">
                    Get reminders before your appointments
                  </p>
                </div>
                <Switch
                  checked={appointmentReminders}
                  onCheckedChange={setAppointmentReminders}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-gray-600">
                    Receive updates about new features and offers
                  </p>
                </div>
                <Switch
                  checked={marketingEmails}
                  onCheckedChange={setMarketingEmails}
                />
              </div>

              <Button onClick={handleSaveNotifications} disabled={loading} className="bg-teal-500 hover:bg-teal-600">
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Security Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Lock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Security</h2>
              <p className="text-sm text-gray-600">Manage your password and security settings</p>
            </div>
          </div>

          <Card className="border-blue-200 bg-white/80 backdrop-blur">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <p className="text-sm text-gray-600">
                  Last changed 30 days ago
                </p>
              </div>

              <Button onClick={handleChangePassword} variant="outline" className="border-blue-300 hover:bg-blue-50">
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Active Sessions</h3>
                <p className="text-sm text-gray-600">Manage your active sessions across devices</p>
                <div className="flex items-center justify-between p-4 border border-blue-200 rounded-lg">
                  <div>
                    <p className="font-medium">Current Session</p>
                    <p className="text-sm text-gray-600">
                      Chrome on macOS • Active now
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-teal-100 text-teal-800">Current</Badge>
                </div>
                <Button variant="destructive" size="sm">
                  Sign Out All Other Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Billing Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Billing</h2>
              <p className="text-sm text-gray-600">Manage your payment methods and billing information</p>
            </div>
          </div>

          <Card className="border-blue-200 bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Billing History</h3>
                <p className="text-sm text-gray-600">View your past invoices and payments</p>
                <div className="flex items-center justify-between p-4 border border-blue-200 rounded-lg hover:bg-blue-50/50 transition-colors">
                  <div>
                    <p className="font-medium">Session Payment</p>
                    <p className="text-sm text-gray-600">Nov 1, 2024</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$100.00</p>
                    <Badge className="bg-green-100 text-green-800 mt-1">
                      Paid
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </ClientLayout>
  );
}
