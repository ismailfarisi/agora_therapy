/**
 * Email Service
 * Handles sending emails via SMTP (Zoho)
 */

import nodemailer from 'nodemailer';
import ical from 'ical-generator';

interface EmailConfig {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

interface AppointmentEmailData {
  clientName: string;
  clientEmail: string;
  therapistName: string;
  therapistEmail: string;
  appointmentDate: Date;
  duration: number; // minutes
  meetingLink: string;
  amount: number;
  currency: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true, // use SSL
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  private async sendEmail(config: EmailConfig): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Mindgood Therapy" <${process.env.SMTP_USER}>`,
        to: config.to,
        subject: config.subject,
        text: config.text,
        html: config.html,
        attachments: config.attachments,
      });
      console.log(`Email sent successfully to ${config.to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  private generateCalendarInvite(data: AppointmentEmailData): string {
    const calendar = ical({ name: 'Mindgood Therapy Appointment' });
    
    const endDate = new Date(data.appointmentDate);
    endDate.setMinutes(endDate.getMinutes() + data.duration);

    calendar.createEvent({
      start: data.appointmentDate,
      end: endDate,
      summary: `Therapy Session with ${data.therapistName}`,
      description: `Online therapy session via Mindgood Therapy.\n\nJoin Link: ${data.meetingLink}`,
      location: data.meetingLink,
      url: data.meetingLink,
      organizer: {
        name: 'Mindgood Therapy',
        email: process.env.SMTP_USER || 'info@dreamsphere.world',
      },
      attendees: [
        {
          name: data.clientName,
          email: data.clientEmail,
          rsvp: true,
        },
        {
          name: data.therapistName,
          email: data.therapistEmail,
          rsvp: true,
        },
      ],
    });

    return calendar.toString();
  }

  private generateClientConfirmationEmail(data: AppointmentEmailData): string {
    const formattedDate = data.appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = data.appointmentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const googleCalendarLink = this.generateGoogleCalendarLink(data);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #6b7280; }
          .detail-value { color: #111827; }
          .button { display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #2563eb 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Appointment Confirmed!</h1>
          </div>
          <div class="content">
            <p>Dear ${data.clientName},</p>
            <p>Your therapy session has been successfully booked and confirmed. We're looking forward to your session!</p>
            
            <div class="details">
              <h2 style="margin-top: 0; color: #111827;">Appointment Details</h2>
              <div class="detail-row">
                <span class="detail-label">Therapist:</span>
                <span class="detail-value">${data.therapistName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${formattedDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${formattedTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${data.duration} minutes</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount Paid:</span>
                <span class="detail-value">${data.currency.toUpperCase()} ${(data.amount / 100).toFixed(2)}</span>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.meetingLink}" class="button">Join Video Session</a>
              <a href="${googleCalendarLink}" class="button" style="background: #4285f4;">Add to Google Calendar</a>
            </div>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <strong>📌 Important:</strong> Please join the session 5 minutes early to test your audio and video.
            </div>

            <p>If you need to reschedule or have any questions, please contact us at ${process.env.SMTP_USER}</p>
            
            <p>Best regards,<br>The Mindgood Therapy Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply directly to this message.</p>
            <p>&copy; ${new Date().getFullYear()} Mindgood Therapy. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateTherapistNotificationEmail(data: AppointmentEmailData): string {
    const formattedDate = data.appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = data.appointmentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const googleCalendarLink = this.generateGoogleCalendarLink(data);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #6b7280; }
          .detail-value { color: #111827; }
          .button { display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #2563eb 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 New Appointment Booked</h1>
          </div>
          <div class="content">
            <p>Dear ${data.therapistName},</p>
            <p>A new therapy session has been booked with you. Please review the details below:</p>
            
            <div class="details">
              <h2 style="margin-top: 0; color: #111827;">Appointment Details</h2>
              <div class="detail-row">
                <span class="detail-label">Client:</span>
                <span class="detail-value">${data.clientName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${formattedDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${formattedTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${data.duration} minutes</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Session Fee:</span>
                <span class="detail-value">${data.currency.toUpperCase()} ${(data.amount / 100).toFixed(2)}</span>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.meetingLink}" class="button">Join Video Session</a>
              <a href="${googleCalendarLink}" class="button" style="background: #4285f4;">Add to Google Calendar</a>
            </div>

            <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <strong>💡 Reminder:</strong> Please join the session a few minutes early to ensure everything is set up properly.
            </div>

            <p>You can view all your appointments in your <a href="${process.env.NEXT_PUBLIC_APP_URL}/therapist/appointments">dashboard</a>.</p>
            
            <p>Best regards,<br>The Mindgood Therapy Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply directly to this message.</p>
            <p>&copy; ${new Date().getFullYear()} Mindgood Therapy. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateGoogleCalendarLink(data: AppointmentEmailData): string {
    const startDate = data.appointmentDate.toISOString().replace(/-|:|\.\d+/g, '');
    const endDate = new Date(data.appointmentDate);
    endDate.setMinutes(endDate.getMinutes() + data.duration);
    const endDateStr = endDate.toISOString().replace(/-|:|\.\d+/g, '');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Therapy Session with ${data.therapistName}`,
      dates: `${startDate}/${endDateStr}`,
      details: `Online therapy session via Mindgood Therapy.\n\nJoin Link: ${data.meetingLink}`,
      location: data.meetingLink,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  async sendAppointmentConfirmation(data: AppointmentEmailData): Promise<void> {
    const calendarInvite = this.generateCalendarInvite(data);

    // Send to client
    await this.sendEmail({
      to: data.clientEmail,
      subject: '✅ Your Therapy Appointment is Confirmed',
      html: this.generateClientConfirmationEmail(data),
      attachments: [
        {
          filename: 'appointment.ics',
          content: calendarInvite,
          contentType: 'text/calendar',
        },
      ],
    });

    // Send to therapist
    await this.sendEmail({
      to: data.therapistEmail,
      subject: '📅 New Appointment Booked',
      html: this.generateTherapistNotificationEmail(data),
      attachments: [
        {
          filename: 'appointment.ics',
          content: calendarInvite,
          contentType: 'text/calendar',
        },
      ],
    });
  }

  async sendAppointmentReminder(
    to: string,
    appointmentDate: Date,
    therapistName: string,
    meetingLink: string
  ): Promise<void> {
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    await this.sendEmail({
      to,
      subject: '⏰ Reminder: Your Therapy Session is Tomorrow',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #14b8a6;">Appointment Reminder</h2>
            <p>This is a friendly reminder about your upcoming therapy session:</p>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Therapist:</strong> ${therapistName}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${formattedTime}</p>
            </div>
            <p style="text-align: center;">
              <a href="${meetingLink}" style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #2563eb 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">Join Session</a>
            </p>
            <p>We look forward to seeing you!</p>
          </div>
        </body>
        </html>
      `,
    });
  }
}

export const emailService = new EmailService();
