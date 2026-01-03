/**
 * Client Profile View
 * Profile-focused dashboard for clients
 */

"use client";

import { useEffect, useState } from "react";
import { ClientLayout } from "@/components/client/ClientLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  LoadingSpinner,
  PageLoadingSpinner,
} from "@/components/ui/loading-spinner";
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Edit,
  CheckCircle,
  Video,
  FileText
} from "lucide-react";
import Link from "next/link";
import { AppointmentService } from "@/lib/services/appointment-service";
import { Appointment } from "@/types/database";

export default function ClientDashboard() {
  const { user, userData, loading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const loadAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const data = await AppointmentService.getClientAppointments(user!.uid);
      setAppointments(data);
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const upcomingAppointments = appointments.filter(
    (apt) => {
      const timestamp = apt.scheduledFor as any;
      const appointmentDate = timestamp?.toDate?.() || new Date(timestamp);
      return appointmentDate > new Date() && apt.status !== "cancelled";
    }
  );

  const completedSessions = appointments.filter(
    (apt) => apt.status === "completed"
  ).length;

  // Log userData to debug createdAt issue
  useEffect(() => {
    if (userData) {
      console.log("🔍 ClientDashboard - Full userData:", JSON.stringify(userData, null, 2));
      console.log("🔍 ClientDashboard - metadata:", userData.metadata);
      console.log("🔍 ClientDashboard - createdAt:", userData.metadata?.createdAt);
      console.log("🔍 ClientDashboard - createdAt type:", typeof userData.metadata?.createdAt);
      console.log("🔍 ClientDashboard - createdAt constructor:", userData.metadata?.createdAt?.constructor?.name);
    }
  }, [userData]);

  if (loading) {
    return <PageLoadingSpinner text="Loading your profile..." />;
  }

  if (!user || !userData) {
    return null;
  }

  // Daily affirmations and positive thoughts
  const dailyAffirmations = [
    { text: "You are worthy of love, care, and healing.", emoji: "💖" },
    { text: "Every step you take towards wellness is a victory.", emoji: "🌟" },
    { text: "Your feelings are valid, and it's okay to not be okay.", emoji: "🤗" },
    { text: "You are stronger than you know, braver than you believe.", emoji: "💪" },
    { text: "Healing is not linear, and that's perfectly okay.", emoji: "🌈" },
    { text: "You deserve peace, happiness, and inner calm.", emoji: "🕊️" },
    { text: "Taking care of your mental health is a sign of strength.", emoji: "🌸" },
  ];

  const wellnessTips = [
    { title: "Breathe Deeply", tip: "Take 5 deep breaths when feeling overwhelmed", icon: "🫁" },
    { title: "Stay Hydrated", tip: "Drink water - it helps your mind and body", icon: "💧" },
    { title: "Move Gently", tip: "A short walk can lift your spirits", icon: "🚶" },
    { title: "Rest Well", tip: "Quality sleep is essential for mental health", icon: "😴" },
  ];

  // Get today's affirmation (changes daily)
  const todayIndex = new Date().getDate() % dailyAffirmations.length;
  const todayAffirmation = dailyAffirmations[todayIndex];

  return (
    <ClientLayout>
      <div className="space-y-8">
        {/* Warm Welcome Section with Affirmation */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-50 via-blue-50 to-purple-50 border-2 border-teal-200 p-6 shadow-lg">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl animate-bounce-slow">🌻</span>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                Welcome back, {userData.profile?.firstName}!
              </h1>
            </div>
            <p className="text-gray-700 text-lg mb-4">
              We're so glad you're here. Your wellness journey matters. ✨
            </p>
            
            {/* Daily Affirmation */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-teal-200 shadow-md">
              <div className="flex items-start gap-3">
                <span className="text-3xl mt-1">{todayAffirmation.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-teal-600 mb-1">💫 Today's Affirmation</p>
                  <p className="text-gray-800 font-medium italic leading-relaxed">
                    "{todayAffirmation.text}"
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-200/20 rounded-full blur-3xl"></div>
        </div>

        {/* Your Progress Journey - Motivational Stats */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🌱</span>
            <h2 className="text-2xl font-bold text-gray-800">Your Growth Journey</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Sessions - Progress Card */}
            <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-teal-700 mb-1">Total Sessions</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                      {appointments.length}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Video className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-teal-200">
                  <p className="text-xs font-medium text-teal-600 flex items-center gap-1">
                    <span>✨</span>
                    {appointments.length === 0 ? "Your journey begins here!" : 
                     appointments.length === 1 ? "Great start! First step taken 🎉" :
                     appointments.length < 5 ? "Building momentum! Keep going 💪" :
                     appointments.length < 10 ? "Amazing progress! You're committed 🌟" :
                     "Incredible dedication! You're thriving 🚀"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Completed Sessions - Achievement Card */}
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-700 mb-1">Completed</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {completedSessions}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-xs font-medium text-green-600 flex items-center gap-1">
                    <span>🏆</span>
                    {completedSessions === 0 ? "Your first win awaits!" :
                     completedSessions === 1 ? "First milestone achieved! 🎊" :
                     completedSessions < 5 ? "Each session is a victory! 🌈" :
                     completedSessions < 10 ? "You're making real progress! 💫" :
                     "Champion of self-care! 👑"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Sessions - Anticipation Card */}
            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-orange-700 mb-1">Upcoming</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                      {upcomingAppointments.length}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-orange-200">
                  <p className="text-xs font-medium text-orange-600 flex items-center gap-1">
                    <span>🌅</span>
                    {upcomingAppointments.length === 0 ? "Ready when you are!" :
                     upcomingAppointments.length === 1 ? "Next step scheduled! 📅" :
                     "Your future self will thank you! 🙏"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Member Since - Journey Duration Card */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-purple-700 mb-1">Member Since</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {userData.metadata?.createdAt ? (() => {
                        const timestamp = userData.metadata.createdAt as any;
                        const date = timestamp?.toDate?.() || new Date(timestamp.seconds * 1000);
                        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                      })() : 'N/A'}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <p className="text-xs font-medium text-purple-600 flex items-center gap-1">
                    <span>💝</span>
                    Every day is a step forward!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Wellness Tips Section */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🌿</span>
            <h2 className="text-xl font-bold text-gray-800">Quick Wellness Reminders</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {wellnessTips.map((tip, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200 hover:shadow-md transition-all duration-300">
                <div className="text-3xl mb-2">{tip.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-1">{tip.title}</h3>
                <p className="text-sm text-gray-600">{tip.tip}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <Card className="border border-blue-200/60 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
                    <CardDescription className="text-sm">
                      Your scheduled therapy sessions
                    </CardDescription>
                  </div>
                  <Link href="/client/appointments">
                    <Button variant="outline" size="sm" className="border-blue-300 hover:bg-blue-50">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingAppointments ? (
                  <div className="text-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : upcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingAppointments.slice(0, 3).map((apt) => {
                      const timestamp = apt.scheduledFor as any;
                      const date = timestamp?.toDate?.() || new Date(timestamp);
                      return (
                        <div key={apt.id} className="flex items-center justify-between p-4 border border-blue-200 rounded-lg hover:bg-blue-50/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                              <Video className="h-6 w-6 text-teal-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Session with Therapist
                              </p>
                              <p className="text-sm text-gray-600">
                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <Link href="/client/appointments">
                            <Button size="sm" className="bg-teal-500 hover:bg-teal-600">View Details</Button>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No upcoming sessions
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Book your first therapy session to get started
                    </p>
                    <Link href="/client/therapists">
                      <Button className="bg-teal-500 hover:bg-teal-600">Find a Therapist</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card className="border border-blue-200/60 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription className="text-sm">Common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/client/therapists" className="block">
                  <Button variant="outline" className="w-full justify-start border-blue-300 hover:bg-blue-50">
                    <User className="mr-2 h-4 w-4" />
                    Browse Therapists
                  </Button>
                </Link>
                <Link href="/client/appointments" className="block">
                  <Button variant="outline" className="w-full justify-start border-blue-300 hover:bg-blue-50">
                    <Calendar className="mr-2 h-4 w-4" />
                    My Appointments
                  </Button>
                </Link>
                <Link href="/client/invoices" className="block">
                  <Button variant="outline" className="w-full justify-start border-blue-300 hover:bg-blue-50">
                    <FileText className="mr-2 h-4 w-4" />
                    View Invoices
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Comforting Encouragement Card */}
            <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-2xl">💝</span>
                  You're Doing Great
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-700">
                  <p className="leading-relaxed">
                    <strong className="text-pink-600">Remember:</strong> Seeking help is brave. You're taking important steps toward a healthier, happier you.
                  </p>
                  <div className="bg-white/60 rounded-lg p-3 border border-pink-200">
                    <p className="text-xs font-semibold text-purple-600 mb-1">🌟 Progress, Not Perfection</p>
                    <p className="text-sm">Every session, every breath, every moment of self-care counts. You're exactly where you need to be.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gentle Self-Care Reminder Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-pink-50 border-2 border-amber-200 p-6 shadow-lg">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🌺</span>
              <h2 className="text-xl font-bold text-gray-800">Gentle Reminder: You Matter</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-amber-200">
                <div className="text-2xl mb-2">🤲</div>
                <h3 className="font-semibold text-gray-800 mb-1">Be Kind to Yourself</h3>
                <p className="text-sm text-gray-600">Treat yourself with the same compassion you'd offer a dear friend.</p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-orange-200">
                <div className="text-2xl mb-2">⏰</div>
                <h3 className="font-semibold text-gray-800 mb-1">Take Your Time</h3>
                <p className="text-sm text-gray-600">Healing happens at its own pace. There's no rush, no deadline.</p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-pink-200">
                <div className="text-2xl mb-2">🌈</div>
                <h3 className="font-semibold text-gray-800 mb-1">Celebrate Small Wins</h3>
                <p className="text-sm text-gray-600">Every step forward, no matter how small, is worth celebrating.</p>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-200/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </ClientLayout>
  );
}
