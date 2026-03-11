export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Profile {
  id: string;
  full_name: string | null;
  date_of_birth: string | null;
  phone_number: string | null;
  message_count: number;
  is_subscribed: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DestinyMatrixRow {
  id: string;
  user_id: string;
  date_of_birth: string;
  matrix_data: Json;
  created_at: string;
}

export interface Message {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  channel: "web" | "whatsapp" | "sms";
  created_at: string;
}
