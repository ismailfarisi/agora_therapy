import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { verifyIdToken } from "@/lib/firebase/admin";
import { z } from "zod";
import type {
  CreateCheckoutSessionResponse,
  CreateCheckoutSessionError,
} from "@/types/stripe-api";

// Validation schema for checkout session creation
const createCheckoutSessionSchema = z.object({
  therapistId: z.string().min(1, "Therapist ID is required"),
  therapistName: z.string().min(1, "Therapist name is required"),
  therapistEmail: z.string().email("Valid therapist email is required"),
  appointmentDate: z.string().min(1, "Appointment date is required"),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  duration: z
    .number()
    .min(15)
    .max(180, "Duration must be between 15 and 180 minutes"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  currency: z.string().default("usd"),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Valid client email is required"),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    const idToken = authHeader.split("Bearer ")[1];
    let decodedToken;

    try {
      decodedToken = await verifyIdToken(idToken);
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createCheckoutSessionSchema.parse(body);

    const {
      therapistId,
      therapistName,
      therapistEmail,
      appointmentDate,
      appointmentTime,
      duration,
      amount,
      currency,
      clientName,
      clientEmail,
      notes,
    } = validatedData;

    // Create unique appointment reference
    const appointmentRef = `apt_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Calculate amount in cents for Stripe
    const amountInCents = Math.round(amount * 100);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `Therapy Session with ${therapistName}`,
              description: `${duration} minute therapy session on ${appointmentDate} at ${appointmentTime}`,
              images: [], // Could add therapist profile image URL here
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      customer_email: clientEmail,
      metadata: {
        appointmentRef,
        therapistId,
        therapistName,
        therapistEmail,
        clientId: decodedToken.uid,
        clientName,
        clientEmail,
        appointmentDate,
        appointmentTime,
        duration: duration.toString(),
        notes: notes || "",
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/client/appointments?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/client/therapists/${therapistId}?canceled=true`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    });

    console.log(
      `Checkout session created: ${session.id} for appointment ${appointmentRef}`
    );

    return NextResponse.json<CreateCheckoutSessionResponse>({
      sessionId: session.id,
      url: session.url,
      appointmentRef,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json<CreateCheckoutSessionError>(
        {
          error: "Invalid request data",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("No such")) {
      return NextResponse.json<CreateCheckoutSessionError>(
        { error: "Invalid Stripe configuration" },
        { status: 500 }
      );
    }

    return NextResponse.json<CreateCheckoutSessionError>(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
