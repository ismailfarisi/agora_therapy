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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoices</h1>
        <p className="text-lg text-gray-600">
          View and download your payment invoices
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Invoices
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {appointments.length}
                </p>
              </div>
              <FileText className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-3xl font-bold text-green-600">
                  ${totalPaid.toFixed(2)}
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Pending
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  ${totalPending.toFixed(2)}
                </p>
              </div>
              <Clock className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="h-5 w-5 text-gray-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Invoice #{appointment.id.substring(0, 8).toUpperCase()}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(appointment.scheduledFor)} at{" "}
                            {formatTime(appointment.scheduledFor)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Therapist</p>
                          <p className="font-medium">Dr. {appointment.therapistId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Session Type</p>
                          <p className="font-medium capitalize">
                            {appointment.session?.type || "Individual"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-medium">{appointment.duration} minutes</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-600" />
                          <span className="font-semibold text-lg">
                            ${appointment.payment?.amount || "100.00"}
                          </span>
                        </div>
                        <Badge className={paymentStatus.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {paymentStatus.text}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleDownloadInvoice(appointment)}
                      variant="outline"
                      className="ml-4"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </ClientLayout>
  );
}
