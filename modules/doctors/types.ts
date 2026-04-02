/// Types partagés pour les médecins Clinique NOS.

export type DoctorProfileSummary = {
  id: string;
  userId: string;
  specialty: string | null;
  isActive: boolean;
};
