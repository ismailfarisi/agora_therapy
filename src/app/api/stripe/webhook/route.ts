import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import Stripe from "stripe";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import type { WebhookResponse, WebhookError } from "@/types/stripe-api";

// Store processed webhook IDs to handle idempotency
const processedWebhooks = new Set<string>();

// AppointmentMetadata interface removed - using checkout session metadata directly

// Removed createAppointment function - now using AppointmentService.createAppointmentAfterPayment

async function updateAppointmentPaymentStatus(
  appointmentRef: string,
  status: "paid" | "failed" | "refunded",
  paymentIntentId: string
) {
  try {
    const db = getAdminFirestore();
    const appointmentsQuery = await db
      .collection("appointments")
      .where("appointmentRef", "==", appointmentRef)
      .limit(1)
      .get();

    if (appointmentsQuery.empty) {
      console.error(`No appointment found with ref: ${appointmentRef}`);
      return;
    }

    const appointmentDoc = appointmentsQuery.docs[0];
    await appointmentDoc.ref.update({
      "payment.status": status,
      "payment.transactionId": paymentIntentId,
      "metadata.updatedAt": Timestamp.now(),
      ...(status === "failed" && { status: "cancelled" }),
    });

    console.log(
      `Appointment ${appointmentDoc.id} payment status updated to: ${status}`
    );
  } catch (error) {
    console.error("Error updating appointment payment status:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("No Stripe signature found");
      return NextResponse.json<WebhookError>(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return NextResponse.json<WebhookError>(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    // Verify webhook signature
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log('✅ Webhook signature verified:', {
        eventType: event.type,
        eventId: event.id
      });
    } catch (error) {
      console.error("❌ Webhook signature verification failed:", {
        error: error instanceof Error ? error.message : error,
        hasSignature: !!signature,
        hasSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        bodyLength: body.length
      });
      return NextResponse.json<WebhookError>(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle idempotency - prevent processing the same event multiple times
    if (processedWebhooks.has(event.id)) {
      console.log(`Event ${event.id} already processed, skipping`);
      return NextResponse.json<WebhookResponse>({ received: true });
    }

    console.log(`Processing webhook event: ${event.type} (${event.id})`);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('✅ Processing checkout.session.completed:', {
          sessionId: session.id,
          paymentStatus: session.payment_status,
          hasMetadata: !!session.metadata,
          metadataKeys: session.metadata ? Object.keys(session.metadata) : []
        });

        if (session.payment_status === "paid" && session.metadata) {
          try {
            const metadata = session.metadata;

            // Validate required fields
            const requiredFields = ['appointmentDate', 'appointmentTime', 'duration', 'therapistId', 'clientId'];
            const missingFields = requiredFields.filter(field => !metadata[field]);
            
            if (missingFields.length > 0) {
              console.error('❌ Missing required metadata fields:', {
                missing: missingFields,
                available: Object.keys(metadata)
              });
              return NextResponse.json(
                {
                  error: 'Missing required appointment metadata',
                  missing: missingFields,
                  sessionId: session.id
                },
                { status: 400 }
              );
            }

            // Retrieve payment intent to get amount
            if (!session.payment_intent) {
              console.error('❌ No payment intent found in session:', session.id);
              return NextResponse.json(
                {
                  error: 'No payment intent found',
                  sessionId: session.id
                },
                { status: 400 }
              );
            }

            const paymentIntent = await stripe.paymentIntents.retrieve(
              session.payment_intent as string
            );

            // Convert metadata to BookingRequest format expected by appointment service
            const appointmentDateTime = new Date(`${metadata.appointmentDate}T${metadata.appointmentTime}`);
            
            if (isNaN(appointmentDateTime.getTime())) {
              throw new Error(`Invalid appointment date/time: ${metadata.appointmentDate}T${metadata.appointmentTime}`);
            }

            const bookingRequest = {
              therapistId: metadata.therapistId,
              clientId: metadata.clientId,
              date: appointmentDateTime,
              duration: parseInt(metadata.duration),
              sessionType: 'individual' as const, // Default to individual session
              timeSlotId: `${appointmentDateTime.getHours()}:${appointmentDateTime.getMinutes().toString().padStart(2, '0')}`, // Generate timeSlot from time
              clientNotes: metadata.notes || '',
            };

            console.log('📝 Creating appointment with booking request:', {
              ...bookingRequest,
              date: bookingRequest.date.toISOString()
            });

            // Create appointment directly using admin SDK since webhook runs server-side
            const db = getAdminFirestore();
            
            // Create appointment reference
            const appointmentRef = db.collection('appointments').doc();
            const appointmentId = appointmentRef.id;
            
            // Create appointment data
            const appointmentData = {
              id: appointmentId,
              therapistId: bookingRequest.therapistId,
              clientId: bookingRequest.clientId,
              scheduledFor: Timestamp.fromDate(bookingRequest.date),
              timeSlotId: bookingRequest.timeSlotId,
              duration: bookingRequest.duration,
              status: "confirmed",
              session: {
                type: bookingRequest.sessionType,
                deliveryType: "video",
                platform: "agora",
                channelId: `therapy_session_${appointmentId}`,
              },
              payment: {
                amount: paymentIntent.amount / 100, // Convert from cents to dollars
                currency: paymentIntent.currency.toLowerCase(),
                status: "paid",
                transactionId: paymentIntent.id,
                method: "card",
              },
              communication: {
                clientNotes: bookingRequest.clientNotes || "",
                remindersSent: {
                  email: [],
                  sms: [],
                },
              },
              metadata: {
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                confirmedAt: Timestamp.now(),
              },
              paymentSessionId: session.id, // Add session ID for lookup
            };

            // Save appointment to database
            await appointmentRef.set(appointmentData);

            console.log('✅ Appointment created successfully:', {
              appointmentId,
              sessionId: session.id,
              paymentIntentId: paymentIntent.id,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency
            });

            return NextResponse.json({
              received: true,
              appointmentId,
              message: 'Appointment created successfully'
            });

          } catch (error) {
            console.error('❌ Error processing checkout.session.completed:', {
              sessionId: session.id,
              error: error instanceof Error ? error.message : error,
              stack: error instanceof Error ? error.stack : undefined
            });
            
            // Return error response to Stripe so it knows the webhook failed
            return NextResponse.json(
              {
                error: 'Failed to create appointment after payment',
                sessionId: session.id,
                details: error instanceof Error ? error.message : 'Unknown error'
              },
              { status: 500 }
            );
          }
        } else {
          console.log('ℹ️ Checkout session not paid or missing metadata:', {
            sessionId: session.id,
            paymentStatus: session.payment_status,
            hasMetadata: !!session.metadata
          });
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        if (paymentIntent.metadata?.appointmentRef) {
          try {
            await updateAppointmentPaymentStatus(
              paymentIntent.metadata.appointmentRef,
              "paid",
              paymentIntent.id
            );
          } catch (error) {
            console.error("Error processing payment_intent.succeeded:", error);
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        if (paymentIntent.metadata?.appointmentRef) {
          try {
            await updateAppointmentPaymentStatus(
              paymentIntent.metadata.appointmentRef,
              "failed",
              paymentIntent.id
            );
          } catch (error) {
            console.error(
              "Error processing payment_intent.payment_failed:",
              error
            );
          }
        }
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;

        // Log dispute for manual review
        console.warn(
          `Payment dispute created: ${dispute.id} for charge: ${dispute.charge}`
        );

        // Could implement automatic appointment status updates here
        break;
      }

      case "invoice.payment_succeeded": {
        // Handle subscription payments if implemented later
        console.log(
          "Invoice payment succeeded - not implemented for one-time payments"
        );
        break;
      }

      case "customer.subscription.deleted": {
        // Handle subscription cancellation if implemented later
        console.log(
          "Subscription deleted - not implemented for one-time payments"
        );
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    processedWebhooks.add(event.id);

    // Clean up old processed events (keep last 1000)
    if (processedWebhooks.size > 1000) {
      const oldEvents = Array.from(processedWebhooks).slice(0, 100);
      oldEvents.forEach((eventId) => processedWebhooks.delete(eventId));
    }

    return NextResponse.json<WebhookResponse>({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json<WebhookError>(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json<WebhookError>(
    { error: "Method not allowed" },
    { status: 405 }
  );
}
