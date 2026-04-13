/// Types partagés pour les rendez-vous Clinique NOS.

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "expired_unpaid";

export type PaymentStatus = "unpaid" | "due" | "paid" | "failed" | "refunded";

/// Donnees metier minimales necessaires pour reserver un creneau.
export type AppointmentReservationInput = {
  availabilitySlotId: string;
  doctorId: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  notesInternal?: string;
};

/// Donnees preparees avant la transaction de reservation.
export type AppointmentReservationDraft = {
  patientUserId: string;
  appointment: AppointmentReservationInput;
};

/// Donnees necessaires pour persister une reservation preparee.
export type AppointmentPersistenceInput = {
  patientId: string;
  appointment: AppointmentReservationDraft["appointment"];
  paymentDueAt?: Date;
};

/// Representation d'un creneau relu depuis la base pour une reservation.
export type AppointmentAvailabilitySlotRecord = {
  id: string;
  availabilityId: string;
  doctorId: string;
  startsAt: Date;
  endsAt: Date;
  status: "open" | "reserved" | "blocked" | "expired";
  createdAt: Date;
  updatedAt: Date;
};

/// Representation d'un creneau ouvert expose au module de reservation.
export type OpenAppointmentSlotRecord = AppointmentAvailabilitySlotRecord & {
  doctorFirstName?: string;
  doctorLastName?: string;
  doctorSpecialty?: string;
};

/// Representation d'un rendez-vous relu depuis la base.
export type AppointmentRecord = {
  id: string;
  patientId: string;
  doctorId: string;
  availabilitySlotId: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  paymentDueAt?: Date;
  bookedAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;
  cancellationReason?: string;
  notesInternal?: string;
  createdAt: Date;
  updatedAt: Date;
};

/// Representation minimale d'un profil patient utile pour la reservation.
export type PatientProfileRecord = {
  id: string;
  userId: string;
};

/// Représentation d'un rendez-vous avec informations patients et médecins pour le staff.
export type StaffAppointmentRecord = AppointmentRecord & {
  patientFirstName: string;
  patientLastName: string;
  doctorFirstName: string;
  doctorLastName: string;
  startsAt: Date;
  endsAt: Date;
};

/// Représentation complète d'un rendez-vous pour la vue détail.
export type AppointmentDetailRecord = StaffAppointmentRecord & {
  doctorSpecialty?: string;
};

/// Etat reutilisable pour les actions de reservation patient.
export type CreateAppointmentReservationActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  createdAppointment?: {
    appointmentId: string;
    doctorId: string;
    availabilitySlotId: string;
    status: AppointmentStatus;
    paymentStatus: PaymentStatus;
  };
  fieldErrors?: Record<string, string[] | undefined>;
};

/// Etat initial reutilisable pour le formulaire de reservation patient.
export const INITIAL_CREATE_APPOINTMENT_RESERVATION_ACTION_STATE: CreateAppointmentReservationActionState =
  {
    status: "idle",
  };
