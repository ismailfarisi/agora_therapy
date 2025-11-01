"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Settings as SettingsIcon,
  Mail,
  Phone,
  DollarSign,
  FileText,
  Bell,
  Shield,
  Globe,
  Save,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PlatformSettings {
  // Contact Information
  supportEmail: string;
  supportPhone: string;
  businessHours: string;
  
  // Platform Configuration
  platformName: string;
  platformCommission: number;
  payoutScheduleDays: number;
  currency: string;
  timezone: string;
  
  // Policies
  termsOfService: string;
  privacyPolicy: string;
  refundPolicy: string;
  cancellationPolicy: string;
  
  // Features
  enableVideoSessions: boolean;
  enableReviews: boolean;
  enableNewRegistrations: boolean;
  maintenanceMode: boolean;
  
  // Notifications
  emailNotifications: boolean;
  smsNotifications: boolean;
  adminNotifications: boolean;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    supportEmail: "",
    supportPhone: "",
    businessHours: "",
    platformName: "MindGood",
    platformCommission: 10,
    payoutScheduleDays: 4,
    currency: "USD",
    timezone: "UTC",
    termsOfService: "",
    privacyPolicy: "",
    refundPolicy: "",
    cancellationPolicy: "",
    enableVideoSessions: true,
    enableReviews: true,
    enableNewRegistrations: true,
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
    adminNotifications: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "policies" | "features">("general");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings({ ...settings, ...data.settings });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof PlatformSettings, value: any) => {
    setSettings({ ...settings, [field]: value });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600">
            Configure platform settings and preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 font-medium ${
            activeTab === "general"
              ? "border-b-2 border-teal-500 text-teal-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          General Settings
        </button>
        <button
          onClick={() => setActiveTab("policies")}
          className={`px-4 py-2 font-medium ${
            activeTab === "policies"
              ? "border-b-2 border-teal-500 text-teal-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Policies
        </button>
        <button
          onClick={() => setActiveTab("features")}
          className={`px-4 py-2 font-medium ${
            activeTab === "features"
              ? "border-b-2 border-teal-500 text-teal-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Features & Notifications
        </button>
      </div>

      {/* General Settings Tab */}
      {activeTab === "general" && (
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                Support contact details displayed to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="supportEmail">Support Email *</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) =>
                    handleInputChange("supportEmail", e.target.value)
                  }
                  placeholder="support@mindgood.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="supportPhone">Support Phone Number *</Label>
                <Input
                  id="supportPhone"
                  type="tel"
                  value={settings.supportPhone}
                  onChange={(e) =>
                    handleInputChange("supportPhone", e.target.value)
                  }
                  placeholder="+1 (555) 123-4567"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="businessHours">Business Hours</Label>
                <Input
                  id="businessHours"
                  value={settings.businessHours}
                  onChange={(e) =>
                    handleInputChange("businessHours", e.target.value)
                  }
                  placeholder="Mon-Fri: 9AM-6PM EST"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Platform Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                Platform Configuration
              </CardTitle>
              <CardDescription>
                Basic platform settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="platformName">Platform Name</Label>
                <Input
                  id="platformName"
                  value={settings.platformName}
                  onChange={(e) =>
                    handleInputChange("platformName", e.target.value)
                  }
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={settings.currency}
                    onChange={(e) =>
                      handleInputChange("currency", e.target.value)
                    }
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    value={settings.timezone}
                    onChange={(e) =>
                      handleInputChange("timezone", e.target.value)
                    }
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Asia/Kolkata">India</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Commission Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Payment & Commission Settings
              </CardTitle>
              <CardDescription>
                Configure payment processing and commission rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platformCommission">
                    Platform Commission (%)
                  </Label>
                  <Input
                    id="platformCommission"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.platformCommission}
                    onChange={(e) =>
                      handleInputChange(
                        "platformCommission",
                        parseFloat(e.target.value)
                      )
                    }
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {settings.platformCommission}% (Therapist gets{" "}
                    {100 - settings.platformCommission}%)
                  </p>
                </div>

                <div>
                  <Label htmlFor="payoutScheduleDays">
                    Payout Schedule (Days)
                  </Label>
                  <Input
                    id="payoutScheduleDays"
                    type="number"
                    min="0"
                    max="30"
                    value={settings.payoutScheduleDays}
                    onChange={(e) =>
                      handleInputChange(
                        "payoutScheduleDays",
                        parseInt(e.target.value)
                      )
                    }
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Days after session completion before payout
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Important:</p>
                    <p>
                      Changing commission rates will only affect new bookings.
                      Existing payouts will use the rate at the time of booking.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === "policies" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Legal Policies
              </CardTitle>
              <CardDescription>
                Configure platform policies and legal documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="termsOfService">Terms of Service</Label>
                <textarea
                  id="termsOfService"
                  value={settings.termsOfService}
                  onChange={(e) =>
                    handleInputChange("termsOfService", e.target.value)
                  }
                  rows={6}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter your terms of service..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Displayed to users during registration
                </p>
              </div>

              <div>
                <Label htmlFor="privacyPolicy">Privacy Policy</Label>
                <textarea
                  id="privacyPolicy"
                  value={settings.privacyPolicy}
                  onChange={(e) =>
                    handleInputChange("privacyPolicy", e.target.value)
                  }
                  rows={6}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter your privacy policy..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Explains how user data is collected and used
                </p>
              </div>

              <div>
                <Label htmlFor="refundPolicy">Refund Policy</Label>
                <textarea
                  id="refundPolicy"
                  value={settings.refundPolicy}
                  onChange={(e) =>
                    handleInputChange("refundPolicy", e.target.value)
                  }
                  rows={4}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter your refund policy..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Conditions for refunds and cancellations
                </p>
              </div>

              <div>
                <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                <textarea
                  id="cancellationPolicy"
                  value={settings.cancellationPolicy}
                  onChange={(e) =>
                    handleInputChange("cancellationPolicy", e.target.value)
                  }
                  rows={4}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter your cancellation policy..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Rules for appointment cancellations
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Features & Notifications Tab */}
      {activeTab === "features" && (
        <div className="space-y-6">
          {/* Feature Toggles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <SettingsIcon className="mr-2 h-5 w-5" />
                Feature Toggles
              </CardTitle>
              <CardDescription>
                Enable or disable platform features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                <div>
                  <p className="font-medium">Video Sessions</p>
                  <p className="text-sm text-gray-600">
                    Allow therapists to conduct video sessions
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableVideoSessions}
                    onChange={(e) =>
                      handleInputChange("enableVideoSessions", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                <div>
                  <p className="font-medium">Reviews & Ratings</p>
                  <p className="text-sm text-gray-600">
                    Allow clients to leave reviews for therapists
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableReviews}
                    onChange={(e) =>
                      handleInputChange("enableReviews", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                <div>
                  <p className="font-medium">New Registrations</p>
                  <p className="text-sm text-gray-600">
                    Allow new users to register on the platform
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableNewRegistrations}
                    onChange={(e) =>
                      handleInputChange("enableNewRegistrations", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-md">
                <div>
                  <p className="font-medium text-red-900">Maintenance Mode</p>
                  <p className="text-sm text-red-700">
                    Temporarily disable the platform for maintenance
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) =>
                      handleInputChange("maintenanceMode", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-600">
                    Send email notifications to users
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) =>
                      handleInputChange("emailNotifications", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-gray-600">
                    Send SMS notifications to users
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) =>
                      handleInputChange("smsNotifications", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                <div>
                  <p className="font-medium">Admin Notifications</p>
                  <p className="text-sm text-gray-600">
                    Receive notifications for important admin events
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.adminNotifications}
                    onChange={(e) =>
                      handleInputChange("adminNotifications", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Save Button at Bottom */}
      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving Changes..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
}
