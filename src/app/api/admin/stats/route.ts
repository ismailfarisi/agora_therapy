/**
 * Admin Stats API
 * GET /api/admin/stats - Get platform statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const db = getAdminFirestore();
    
    // Get current month boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Fetch all data in parallel
    const [
      usersSnapshot,
      therapistsSnapshot,
      appointmentsSnapshot,
      paymentsSnapshot,
    ] = await Promise.all([
      db.collection('users').get(),
      db.collection('therapistProfiles').get(),
      db.collection('appointments').get(),
      db.collection('paymentIntents').get(),
    ]);
    
    // Process users
    const users = usersSnapshot.docs.map(doc => doc.data());
    const userStats = {
      total: users.length,
      clients: users.filter(u => u.role === 'client').length,
      therapists: users.filter(u => u.role === 'therapist').length,
      active: users.filter(u => u.status === 'active').length,
      newThisMonth: users.filter(u => {
        const createdAt = u.metadata?.createdAt?.toDate?.() || new Date(0);
        return createdAt >= startOfMonth;
      }).length,
    };
    
    // Process therapists
    const therapists = therapistsSnapshot.docs.map(doc => doc.data());
    const therapistStats = {
      verified: therapists.filter(t => t.verification?.isVerified).length,
      pending: therapists.filter(t => !t.verification?.isVerified).length,
      active: therapists.filter(t => t.verification?.isVerified).length,
    };
    
    // Process appointments
    const appointments = appointmentsSnapshot.docs.map(doc => doc.data());
    const appointmentStats = {
      total: appointments.length,
      upcoming: appointments.filter(a => {
        const scheduledFor = a.scheduledFor?.toDate?.() || new Date(0);
        return a.status === 'confirmed' && scheduledFor > now;
      }).length,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
      todayCount: appointments.filter(a => {
        const scheduledFor = a.scheduledFor?.toDate?.() || new Date(0);
        return scheduledFor >= startOfToday && scheduledFor < new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
      }).length,
    };
    
    // Process payments
    const payments = paymentsSnapshot.docs.map(doc => doc.data());
    const paidPayments = payments.filter(p => p.status === 'paid');
    
    const thisMonthRevenue = paidPayments
      .filter(p => {
        const paidAt = p.metadata?.paidAt?.toDate?.() || new Date(0);
        return paidAt >= startOfMonth;
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const lastMonthRevenue = paidPayments
      .filter(p => {
        const paidAt = p.metadata?.paidAt?.toDate?.() || new Date(0);
        return paidAt >= startOfLastMonth && paidAt <= endOfLastMonth;
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const totalRevenue = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const revenueStats = {
      total: totalRevenue / 100, // Convert from cents
      thisMonth: thisMonthRevenue / 100,
      lastMonth: lastMonthRevenue / 100,
      currency: 'USD',
    };
    
    const stats = {
      users: userStats,
      appointments: appointmentStats,
      revenue: revenueStats,
      therapists: therapistStats,
    };
    
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics', details: error.message },
      { status: 500 }
    );
  }
}
