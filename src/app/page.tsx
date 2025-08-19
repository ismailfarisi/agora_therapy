"use client";

import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/hooks/useAuth";
import { Video, Shield, Clock, Users, CheckCircle, Star } from "lucide-react";

export default function Home() {
  const { user, userData } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      {/* Hero Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Connect with Licensed{" "}
              <span className="text-blue-600">Therapists</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Experience secure, professional therapy sessions from the comfort
              of your home. Our platform connects you with qualified therapists
              for personalized mental health support.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {!user ? (
                <>
                  <Link href="/register">
                    <Button size="lg" className="px-8">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="px-8">
                      Sign In
                    </Button>
                  </Link>
                </>
              ) : (
                <Link
                  href={
                    userData?.role === "therapist" ? "/therapist" : "/client"
                  }
                >
                  <Button size="lg" className="px-8">
                    Go to Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose TherapyConnect?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Professional therapy made accessible, secure, and convenient
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Video className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Secure Video Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  End-to-end encrypted video calls ensure your privacy and
                  security during sessions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">
                  Licensed Professionals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All therapists are licensed, verified, and experienced in
                  their specializations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Flexible Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Book sessions that fit your schedule with easy online
                  appointment management.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Personalized Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Find the right therapist based on your needs, preferences, and
                  therapy goals.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Getting started is simple and straightforward
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sign Up
              </h3>
              <p className="text-gray-600">
                Create your account and tell us about your therapy needs and
                preferences.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Find Your Therapist
              </h3>
              <p className="text-gray-600">
                Browse qualified therapists and choose the one that best fits
                your needs.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Start Your Journey
              </h3>
              <p className="text-gray-600">
                Schedule your first session and begin your path to better mental
                health.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to start your therapy journey?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Join thousands who have found support and healing through our
            platform.
          </p>
          <div className="mt-8">
            {!user ? (
              <Link href="/register">
                <Button size="lg" variant="secondary" className="px-8">
                  Get Started Today
                </Button>
              </Link>
            ) : (
              <Link
                href={userData?.role === "therapist" ? "/therapist" : "/client"}
              >
                <Button size="lg" variant="secondary" className="px-8">
                  Continue to Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">TC</span>
              </div>
              <span className="font-bold text-xl">TherapyConnect</span>
            </div>
            <p className="text-gray-400">
              © 2024 TherapyConnect. All rights reserved. Professional therapy
              platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
