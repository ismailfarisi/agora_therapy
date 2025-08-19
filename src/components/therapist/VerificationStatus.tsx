/**
 * Verification Status Component
 * Displays therapist verification badges and status information
 */

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  FileText,
  Upload,
} from "lucide-react";
import { TherapistProfile } from "@/types/database";

interface VerificationStatusProps {
  profile: TherapistProfile;
  className?: string;
}

export function VerificationStatus({
  profile,
  className,
}: VerificationStatusProps) {
  const { verification, credentials } = profile;
  const isVerified = verification.isVerified;

  const getStatusIcon = () => {
    if (isVerified) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <Clock className="h-4 w-4 text-yellow-600" />;
  };

  const getStatusBadge = () => {
    if (isVerified) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified Professional
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        <Clock className="h-3 w-3 mr-1" />
        Verification Pending
      </Badge>
    );
  };

  const getStatusMessage = () => {
    if (isVerified) {
      return {
        title: "Verification Complete",
        description: `Your professional credentials have been verified${
          verification.verifiedAt
            ? ` on ${verification.verifiedAt.toDate().toLocaleDateString()}`
            : ""
        }. You can now accept client bookings.`,
        variant: "default" as const,
      };
    }

    return {
      title: "Verification in Progress",
      description:
        "Your credentials are being reviewed by our team. This process typically takes 1-3 business days. You'll be notified once verification is complete.",
      variant: "default" as const,
    };
  };

  const requiredDocuments = [
    {
      name: "Professional License",
      field: "licenseNumber",
      hasValue: !!credentials.licenseNumber,
      description: "Valid therapy license",
    },
    {
      name: "License Verification",
      field: "licenseState",
      hasValue: !!credentials.licenseState,
      description: "State licensing information",
    },
    {
      name: "Specializations",
      field: "specializations",
      hasValue: credentials.specializations.length > 0,
      description: "Professional specialization areas",
    },
  ];

  const completedDocs = requiredDocuments.filter((doc) => doc.hasValue).length;
  const totalDocs = requiredDocuments.length;

  const statusMessage = getStatusMessage();

  return (
    <div className={className}>
      {/* Status Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Verification Status</h3>
        </div>
        {getStatusBadge()}
      </div>

      {/* Status Alert */}
      <Alert className="mb-6">
        {getStatusIcon()}
        <div className="ml-2">
          <h4 className="font-medium">{statusMessage.title}</h4>
          <AlertDescription className="mt-1">
            {statusMessage.description}
          </AlertDescription>
        </div>
      </Alert>

      {/* Requirements Checklist */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">
              Verification Requirements
            </h4>
            <span className="text-sm text-gray-500">
              {completedDocs}/{totalDocs} completed
            </span>
          </div>

          <div className="space-y-3">
            {requiredDocuments.map((doc, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {doc.hasValue ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      doc.hasValue ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {doc.name}
                  </p>
                  <p className="text-xs text-gray-500">{doc.description}</p>
                </div>
                <div className="flex-shrink-0">
                  {doc.hasValue ? (
                    <Badge variant="secondary" className="text-xs">
                      Complete
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Upload Documents Section */}
          {!isVerified && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="h-4 w-4 text-gray-600" />
                <h5 className="font-medium text-gray-900">Document Upload</h5>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Upload supporting documents to expedite the verification
                process.
              </p>
              <div className="text-xs text-gray-500">
                Supported formats: PDF, JPG, PNG (max 10MB each)
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verified Benefits */}
      {isVerified && (
        <Card className="mt-4 bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <h4 className="font-medium text-green-900">Verified Benefits</h4>
            </div>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Accept client bookings and appointments</li>
              <li>• Display "Verified Professional" badge</li>
              <li>• Enhanced profile visibility in search results</li>
              <li>• Access to advanced practice management tools</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default VerificationStatus;
