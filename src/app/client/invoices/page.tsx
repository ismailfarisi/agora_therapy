"use client";

import { useEffect, useState } from "react";
import { ClientLayout } from "@/components/client/ClientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  FileText, 
  Download, 
  Calendar, 
  DollarSign,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { AppointmentService } from "@/lib/services/appointment-service";
import { Appointment } from "@/types/database";
import { useToast } from "@/lib/hooks/useToast";

export default function InvoicesPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.uid) {
      loadInvoices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await AppointmentService.getClientAppointments(user!.uid);
      setAppointments(data);
    } catch (error) {
      console.error("Error loading invoices:", error);
      toast.error("Load Failed", "Failed to load your invoices");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownloadInvoice = async (appointment: Appointment) => {
    try {
      const invoiceData = `
INVOICE
========================================
Invoice #: INV-${appointment.id.substring(0, 8).toUpperCase()}
Date: ${formatDate(appointment.scheduledFor)}

APPOINTMENT DETAILS
----------------------------------------
Appointment ID: ${appointment.id}
Date: ${formatDate(appointment.scheduledFor)}
Time: ${formatTime(appointment.scheduledFor)}
Duration: ${appointment.duration} minutes
Therapist: ${appointment.therapistId}
Session Type: ${appointment.session?.type || "Individual Therapy"}

PAYMENT DETAILS
----------------------------------------
Session Rate: $${appointment.payment?.amount || "100.00"}
Tax: $${((appointment.payment?.amount || 100) * 0.1).toFixed(2)}
Total: $${((appointment.payment?.amount || 100) * 1.1).toFixed(2)}
Payment Status: ${appointment.payment?.status || "Pending"}
Payment Method: ${appointment.payment?.method || "Not specified"}

========================================
Thank you for choosing our services!
      `;
      
      const blob = new Blob([invoiceData], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${appointment.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success("Invoice Downloaded", "Your invoice has been downloaded successfully");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Download Failed", "Failed to download invoice. Please try again.");
    }
  };

  const getPaymentStatus = (status?: string) => {
    switch (status) {
      case "paid":
        return {
          icon: CheckCircle,
          text: "Paid",
          color: "bg-green-100 text-green-800",
        };
      case "pending":
        return {
          icon: Clock,
          text: "Pending",
          color: "bg-yellow-100 text-yellow-800",
        };
      case "failed":
        return {
          icon: XCircle,
          text: "Failed",
          color: "bg-red-100 text-red-800",
        };
      default:
        return {
          icon: Clock,
          text: "Pending",
          color: "bg-gray-100 text-gray-800",
        };
    }
  };

  const totalPaid = appointments
    .filter((apt) => apt.payment?.status === "paid")
    .reduce((sum, apt) => sum + (apt.payment?.amount || 0), 0);

  const totalPending = appointments
    .filter((apt) => apt.payment?.status === "pending")
    .reduce((sum, apt) => sum + (apt.payment?.amount || 0), 0);

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-2">
            View and download your payment invoices
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-blue-200/60 bg-white shadow-sm hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Total Invoices
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {appointments.length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <FileText className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-blue-200/60 bg-white shadow-sm hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Total Paid</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${totalPaid.toFixed(2)}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-blue-200/60 bg-white shadow-sm hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Total Pending
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${totalPending.toFixed(2)}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                  <Clock className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">All Invoices</h2>
              <p className="text-sm text-gray-600">{appointments.length} total invoices</p>
            </div>
          </div>

          {appointments.length === 0 ? (
            <Card className="border border-blue-200/60 bg-white shadow-sm">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No invoices yet
                </h3>
                <p className="text-gray-600">
                  Your payment invoices will appear here after booking sessions
                </p>
              </CardContent>
            </Card>
          ) : (
            appointments.map((appointment) => {
              const paymentStatus = getPaymentStatus(appointment.payment?.status);
              const StatusIcon = paymentStatus.icon;

              return (
                <Card key={appointment.id} className="border border-blue-200/60 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left Section - Invoice Details */}
                      <div className="flex-1 space-y-4">
                        {/* Header */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Invoice #{appointment.id.substring(0, 8).toUpperCase()}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {formatDate(appointment.scheduledFor)} at {formatTime(appointment.scheduledFor)}
                            </p>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pl-13">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Therapist</p>
                            <p className="font-medium text-gray-900">Dr. {appointment.therapistId}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Session Type</p>
                            <p className="font-medium text-gray-900 capitalize">
                              {appointment.session?.type || "Individual"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Duration</p>
                            <p className="font-medium text-gray-900">{appointment.duration} min</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Amount</p>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-gray-900">
                                ${appointment.payment?.amount || "100.00"}
                              </span>
                              <Badge className={paymentStatus.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {paymentStatus.text}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Action Button */}
                      <div className="flex lg:flex-col gap-2">
                        <Button
                          onClick={() => handleDownloadInvoice(appointment)}
                          variant="outline"
                          className="border-blue-300 hover:bg-blue-50 w-full lg:w-auto"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
            );
          })
        )}
        </div>
      </div>
    </ClientLayout>
  );
}
