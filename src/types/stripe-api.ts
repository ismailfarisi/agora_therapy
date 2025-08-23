export interface CreateCheckoutSessionRequest {
  therapistId: string;
  therapistName: string;
  therapistEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  amount: number;
  currency?: string;
  clientName: string;
  clientEmail: string;
  notes?: string;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string | null;
  appointmentRef: string;
}

export interface CreateCheckoutSessionError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface WebhookResponse {
  received: boolean;
}

export interface WebhookError {
  error: string;
}
