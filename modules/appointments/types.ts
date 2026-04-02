/// Types partagés pour les rendez-vous Clinique NOS.

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "expired_unpaid";

export type PaymentStatus = "unpaid" | "due" | "paid" | "failed" | "refunded";
