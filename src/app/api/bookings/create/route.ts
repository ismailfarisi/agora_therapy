import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth = getAdminAuth();
    const db = getAdminFirestore();
    const decodedToken = await auth.verifyIdToken(token);
    const clientId = decodedToken.uid;

    // Get client user data
    const clientDoc = await db.collection("users").doc(clientId).get();
    const clientData = clientDoc.data();

    if (!clientData) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Get request body
    const body = await request.json();
    const {
      therapistId,
      scheduledFor, // ISO string
      duration = 50, // minutes
      sessionType = "individual",
      clientNotes,
    } = body;

    // Validate required fields
    if (!therapistId || !scheduledFor) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get therapist data
    const therapistProfileDoc = await db
      .collection("therapistProfiles")
      .doc(therapistId)
      .get();

    if (!therapistProfileDoc.exists) {
      return NextResponse.json(
        { error: "Therapist not found" },
        { status: 404 }
      );
    }

    const therapistProfile = therapistProfileDoc.data();
    if (!therapistProfile?.verification?.isVerified) {
      return NextResponse.json(
        { error: "Therapist is not verified" },
        { status: 400 }
      );
    }

    // Get therapist hourly rate
    let hourlyRate = therapistProfile.practice?.hourlyRate || 5000; // Default $50
    if (hourlyRate < 1000) {
      // Convert dollars to cents if needed
      hourlyRate = hourlyRate * 100;
    }

    // Calculate amount based on duration
    const amount = Math.round((hourlyRate * duration) / 60);

    // Prepare customer shipping information (required for Indian regulations)
    const customerName = clientData.profile?.displayName || 
                        `${clientData.profile?.firstName || ''} ${clientData.profile?.lastName || ''}`.trim() || 
                        'Customer';
    
    // Create Stripe PaymentIntent with customer details
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: therapistProfile.practice?.currency || "aed",
      description: `Therapy session - ${duration} minutes`,
      statement_descriptor: "MINDGOOD THERAPY",
      receipt_email: clientData.email,
      shipping: {
        name: customerName,
        address: {
          line1: clientData.profile?.address?.line1 || 'Address not provided',
          line2: clientData.profile?.address?.line2 || null,
          city: clientData.profile?.address?.city || 'City not provided',
          state: clientData.profile?.address?.state || null,
          postal_code: clientData.profile?.address?.postalCode || '00000',
          country: clientData.profile?.address?.country || 'AE',
        },
      },
      metadata: {
        therapistId,
        clientId,
        clientName: customerName,
        clientEmail: clientData.email,
        scheduledFor,
        duration: duration.toString(),
        sessionType,
        service: "Online Therapy Session",
        company: "Nextauras Global Services LLC FZ",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create appointment document (pending payment)
    const appointmentRef = db.collection("appointments").doc();
    const appointmentData = {
      id: appointmentRef.id,
      therapistId,
      clientId,
      scheduledFor: new Date(scheduledFor),
      duration,
      status: "pending",
      session: {
        type: sessionType,
        deliveryType: "video",
        platform: "agora",
      },
      payment: {
        amount,
        currency: therapistProfile.practice?.currency || "aed",
        status: "pending",
        transactionId: paymentIntent.id,
        method: "stripe",
      },
      communication: {
        clientNotes: clientNotes || "",
        therapistNotes: "",
        internalNotes: "",
        remindersSent: {
          email: [],
          sms: [],
        },
      },
      metadata: {
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
    };

    await appointmentRef.set(appointmentData);

    return NextResponse.json({
      appointmentId: appointmentRef.id,
      clientSecret: paymentIntent.client_secret,
      amount,
      currency: therapistProfile.practice?.currency || "aed",
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
