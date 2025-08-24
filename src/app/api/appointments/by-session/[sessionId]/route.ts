import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Query appointments collection for appointment with matching payment session ID
    const db = getAdminFirestore();
    const appointmentsRef = db.collection('appointments');
    const querySnapshot = await appointmentsRef
      .where('paymentSessionId', '==', sessionId)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return NextResponse.json(
        { message: 'Appointment not found yet' },
        { status: 404 }
      );
    }

    const appointmentDoc = querySnapshot.docs[0];
    const appointmentId = appointmentDoc.id;
    const appointmentData = appointmentDoc.data();

    return NextResponse.json({
      appointmentId,
      status: appointmentData.status,
      createdAt: appointmentData.createdAt,
      therapistId: appointmentData.therapistId,
      clientId: appointmentData.clientId,
      scheduledFor: appointmentData.scheduledFor,
      duration: appointmentData.duration,
      sessionType: appointmentData.session?.type,
      payment: appointmentData.payment,
    });
  } catch (error) {
    console.error('Error fetching appointment by session ID:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}