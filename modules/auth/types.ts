/// Types partagés pour l'authentification Clinique NOS.

export type AuthSessionUser = {
  id: string;
  role: "patient" | "doctor" | "secretary" | "clinic_admin";
};
