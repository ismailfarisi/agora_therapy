import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "therapist-photos");

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const therapistId = formData.get("therapistId") as string;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    if (!therapistId) {
      return NextResponse.json(
        { message: "No therapist ID provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Please upload a JPG, PNG, or WebP image." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: "File size too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    await ensureUploadDir();

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const filename = `${therapistId}_${timestamp}.${fileExtension}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Generate public URL
    const photoURL = `/uploads/therapist-photos/${filename}`;

    return NextResponse.json(
      { 
        message: "Photo uploaded successfully",
        photoURL 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading photo:", error);
    return NextResponse.json(
      { message: "Failed to upload photo" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { therapistId, photoURL } = body;

    if (!therapistId || !photoURL) {
      return NextResponse.json(
        { message: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Extract filename from URL
    const filename = photoURL.split("/").pop();
    if (!filename) {
      return NextResponse.json(
        { message: "Invalid photo URL" },
        { status: 400 }
      );
    }

    // Verify filename belongs to this therapist
    if (!filename.startsWith(therapistId)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    const filepath = path.join(UPLOAD_DIR, filename);

    // Delete file if it exists
    if (existsSync(filepath)) {
      await unlink(filepath);
    }

    return NextResponse.json(
      { message: "Photo deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { message: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
