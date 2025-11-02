"use client";

import React, { useState, useEffect } from "react";
import { TherapistLayout } from "@/components/therapist/TherapistLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Users,
  Search,
  Calendar,
  DollarSign,
  Mail,
  Phone,
  Clock,
  TrendingUp,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  totalAppointments: number;
  completedAppointments: number;
  upcomingAppointments: number;
  totalSpent: number;
  lastAppointmentDate: any;
  firstAppointmentDate: any;
}

export default function TherapistClientsPage() {
  const { user, loading: authLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user?.uid) {
      fetchClients();
    }
  }, [user?.uid]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredClients(clients);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredClients(
        clients.filter(
          (client) =>
            client.name.toLowerCase().includes(query) ||
            client.email.toLowerCase().includes(query) ||
            client.phone.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, clients]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const token = await user?.getIdToken();
      const response = await fetch("/api/therapist/clients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
        setFilteredClients(data.clients || []);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (authLoading || loading) {
    return (
      <TherapistLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </TherapistLayout>
    );
  }

  // Calculate stats
  const totalClients = clients.length;
  const totalAppointments = clients.reduce(
    (sum, client) => sum + client.totalAppointments,
    0
  );
  const totalRevenue = clients.reduce(
    (sum, client) => sum + client.totalSpent,
    0
  );
  const activeClients = clients.filter(
    (client) => client.upcomingAppointments > 0
  ).length;

  return (
    <TherapistLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Clients</h1>
        <p className="text-lg text-gray-600">
          Manage and view your client relationships
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Clients</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalClients}
                </p>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Clients</p>
                <p className="text-3xl font-bold text-gray-900">
                  {activeClients}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalAppointments}
                </p>
              </div>
              <Calendar className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${(totalRevenue / 100).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search clients by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Client List ({filteredClients.length} of {totalClients})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchQuery
                  ? "No clients found matching your search"
                  : "No clients yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={client.avatar || undefined} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                          {getInitials(client.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {client.name}
                        </h3>

                        <div className="space-y-1 mb-3">
                          <div className="flex items-center text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="text-sm">{client.email}</span>
                          </div>
                          {client.phone && (
                            <div className="flex items-center text-gray-600">
                              <Phone className="h-4 w-4 mr-2" />
                              <span className="text-sm">{client.phone}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {client.upcomingAppointments > 0 && (
                            <Badge variant="default" className="bg-green-500">
                              Active
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {client.totalAppointments} Total Sessions
                          </Badge>
                          <Badge variant="outline">
                            {client.completedAppointments} Completed
                          </Badge>
                          {client.upcomingAppointments > 0 && (
                            <Badge variant="outline" className="text-blue-600">
                              {client.upcomingAppointments} Upcoming
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold text-gray-900">
                        ${(client.totalSpent / 100).toFixed(2)}
                      </div>
                      <p className="text-sm text-gray-500">Total Spent</p>

                      <div className="flex items-center justify-end text-sm text-gray-600 mt-4">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Last: {formatDate(client.lastAppointmentDate)}</span>
                      </div>
                      <div className="flex items-center justify-end text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Since: {formatDate(client.firstAppointmentDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </TherapistLayout>
  );
}
