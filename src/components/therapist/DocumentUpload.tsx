/**
 * Document Upload Component
 * Handles file upload for therapist verification documents
 */

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  Image,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  TherapistService,
  DocumentUploadResult,
} from "@/lib/services/therapist-service";
import {
  documentUploadSchema,
  DocumentUploadData,
} from "@/lib/validations/therapist-profile";

interface DocumentUploadProps {
  therapistId: string;
  onUploadComplete?: (result: DocumentUploadResult) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

interface UploadedDocument {
  id: string;
  filename: string;
  url: string;
  documentType: string;
  uploadedAt: Date;
  size: number;
}

export function DocumentUpload({
  therapistId,
  onUploadComplete,
  onUploadError,
  className,
}: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("license");
  const [description, setDescription] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDocuments, setUploadedDocuments] = useState<
    UploadedDocument[]
  >([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes = [
    { value: "license", label: "Professional License" },
    { value: "certification", label: "Certification" },
    { value: "insurance", label: "Insurance Certificate" },
    { value: "other", label: "Other Document" },
  ];

  const handleFileSelect = (file: File) => {
    setErrors({});

    // Validate file
    try {
      const validationData: DocumentUploadData = {
        file,
        documentType: documentType as
          | "license"
          | "certification"
          | "insurance"
          | "other",
        description: description || undefined,
      };

      documentUploadSchema.parse(validationData);
      setSelectedFile(file);
    } catch (error) {
      const err = error as { errors?: Array<{ path: string[]; message: string }> };
      const fieldErrors: Record<string, string> = {};
      if (err.errors) {
        err.errors.forEach((validationErr) => {
          fieldErrors[validationErr.path[0]] = validationErr.message;
        });
      }
      setErrors(fieldErrors);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setErrors({});

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await TherapistService.uploadDocument(
        therapistId,
        selectedFile,
        documentType
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Add to uploaded documents
      const newDocument: UploadedDocument = {
        id: Math.random().toString(36).substring(7),
        filename: result.filename,
        url: result.url,
        documentType,
        uploadedAt: result.uploadedAt,
        size: selectedFile.size,
      };

      setUploadedDocuments((prev) => [...prev, newDocument]);

      // Reset form
      setSelectedFile(null);
      setDescription("");
      setUploadProgress(0);

      if (onUploadComplete) {
        onUploadComplete(result);
      }

      setTimeout(() => {
        setIsUploading(false);
      }, 1000);
    } catch (error) {
      const err = error as Error;
      console.error("Upload error:", err);
      setErrors({ upload: err.message || "Failed to upload document" });
      setIsUploading(false);
      setUploadProgress(0);

      if (onUploadError) {
        onUploadError(err.message || "Failed to upload document");
      }
    }
  };

  const removeDocument = async (document: UploadedDocument) => {
    try {
      await TherapistService.deleteDocument(therapistId, document.filename);
      setUploadedDocuments((prev) =>
        prev.filter((doc) => doc.id !== document.id)
      );
    } catch (error) {
      const err = error as Error;
      console.error("Delete error:", err);
      setErrors({ delete: err.message || "Failed to delete document" });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(extension || "")) {
      return <Image className="h-4 w-4 text-blue-600" />;
    }
    return <FileText className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Document Upload
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Document Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type</Label>
            <select
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the document"
              maxLength={200}
            />
            <p className="text-xs text-gray-500">
              {description.length}/200 characters
            </p>
          </div>

          {/* File Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="flex flex-col items-center justify-center text-center">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-900 mb-1">
                {selectedFile
                  ? selectedFile.name
                  : "Drop files here or click to browse"}
              </p>
              <p className="text-xs text-gray-500">
                Supports: PDF, JPG, PNG (max 10MB)
              </p>
            </div>

            {selectedFile && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getFileIcon(selectedFile.name)}
                    <div>
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Error Messages */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {Object.values(errors).join(", ")}
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </>
            )}
          </Button>

          {/* Uploaded Documents */}
          {uploadedDocuments.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Uploaded Documents</h4>
              <div className="space-y-2">
                {uploadedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(doc.filename)}
                      <div>
                        <p className="text-sm font-medium">{doc.filename}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Badge variant="secondary" className="text-xs">
                            {
                              documentTypes.find(
                                (t) => t.value === doc.documentType
                              )?.label
                            }
                          </Badge>
                          <span>•</span>
                          <span>{formatFileSize(doc.size)}</span>
                          <span>•</span>
                          <span>{doc.uploadedAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(doc)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Guidelines */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Upload Guidelines:</p>
                <ul className="text-sm space-y-1">
                  <li>• Documents should be clear and legible</li>
                  <li>• Professional license must be current and valid</li>
                  <li>• Files should be in PDF, JPG, or PNG format</li>
                  <li>• Maximum file size is 10MB per document</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

export default DocumentUpload;
