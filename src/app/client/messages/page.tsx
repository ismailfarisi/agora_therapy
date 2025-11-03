"use client";

import { ClientLayout } from "@/components/client/ClientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Search } from "lucide-react";

export default function MessagesPage() {
  return (
    <ClientLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-lg text-gray-600">
          Chat with your therapists
        </p>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Messaging Coming Soon
          </h3>
          <p className="text-gray-600">
            Direct messaging with your therapists will be available soon
          </p>
        </CardContent>
      </Card>
    </ClientLayout>
  );
}
