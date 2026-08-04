export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface ContactMessage extends ContactFormData {
  id: string;
  telegram_sent: boolean;
  telegram_message_id: string | null;
  created_at: string;
}

export interface ContactSubmitResponse {
  success: boolean;
  message: string;
  data?: ContactMessage;
}
