/// Types partagés pour les utilisateurs Clinique NOS.

export type UserRole = "patient" | "doctor" | "secretary" | "clinic_admin";

export type UserSummary = {
  id: string;
  email: string;
  role: UserRole;
};
