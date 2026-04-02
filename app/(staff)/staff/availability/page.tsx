/// Page staff simple pour consulter et preparer les disponibilites Clinique NOS.

import type { RowDataPacket } from "mysql2/promise";
import { AvailabilityForm } from "../../../../components/availability/availability-form";
import { Container } from "../../../../components/ui/container";
import { getCurrentUser } from "../../../../lib/auth/session";
import { mysqlPool } from "../../../../lib/db/mysql";
import {
  listAvailabilitiesByDoctorId,
  listAvailabilitySlotsByDoctorId,
} from "../../../../modules/availability/repository";
import type {
  AvailabilityRecord,
  AvailabilitySlotRecord,
} from "../../../../modules/availability/types";

type DoctorDirectoryRow = RowDataPacket & {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  specialty: string | null;
};

type DoctorDirectoryOption = {
  id: string;
  userId: string;
  label: string;
};

type AvailabilitySection = {
  doctor: DoctorDirectoryOption;
  availabilities: Array<{
    availability: AvailabilityRecord;
    slots: AvailabilitySlotRecord[];
  }>;
  totalSlots: number;
};

/// Formate une date UTC dans un style lisible pour l'equipe.
function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(value);
}

/// Formate uniquement l'heure pour les listes compactes de creneaux.
function formatTime(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(value);
}

/// Retourne le libelle simple d'un statut de disponibilite.
function getAvailabilityStatusLabel(status: AvailabilityRecord["status"]) {
  return status === "active" ? "Active" : "Inactive";
}

/// Retourne les medecins actifs pour alimenter la page et le formulaire.
async function getDoctorDirectoryOptions(): Promise<DoctorDirectoryOption[]> {
  const [rows] = await mysqlPool.query<DoctorDirectoryRow[]>(
    `
      SELECT
        profils_medecins.id,
        profils_medecins.user_id,
        utilisateurs.first_name,
        utilisateurs.last_name,
        profils_medecins.specialty
      FROM profils_medecins
      INNER JOIN utilisateurs ON utilisateurs.id = profils_medecins.user_id
      WHERE profils_medecins.is_active = 1
      ORDER BY utilisateurs.first_name ASC, utilisateurs.last_name ASC
    `,
  );

  return rows.map((row) => {
    // Compose un libelle court et lisible pour la vue staff.
    const fullName = `${row.first_name} ${row.last_name}`.trim();
    // Ajoute la specialite seulement si elle existe.
    const specialtySuffix = row.specialty ? ` - ${row.specialty}` : "";

    return {
      id: row.id,
      userId: row.user_id,
      label: `${fullName}${specialtySuffix}`,
    };
  });
}

/// Charge les blocs et creneaux visibles pour les medecins affiches sur la page.
async function getAvailabilitySections(
  doctorOptions: DoctorDirectoryOption[],
): Promise<AvailabilitySection[]> {
  return Promise.all(
    doctorOptions.map(async (doctorOption) => {
      const [availabilities, slots] = await Promise.all([
        listAvailabilitiesByDoctorId(doctorOption.id),
        listAvailabilitySlotsByDoctorId(doctorOption.id),
      ]);

      return {
        doctor: doctorOption,
        availabilities: availabilities.map((availability) => ({
          availability,
          slots: slots.filter((slot) => slot.availabilityId === availability.id),
        })),
        totalSlots: slots.length,
      };
    }),
  );
}

export default async function StaffAvailabilityPage() {
  const currentUser = await getCurrentUser();
  const doctorOptions = await getDoctorDirectoryOptions();
  // Restreint naturellement la vue si le staff connecte est un medecin.
  const visibleDoctorOptions =
    currentUser?.role === "doctor"
      ? doctorOptions.filter((doctorOption) => doctorOption.userId === currentUser.id)
      : doctorOptions;
  const availabilitySections = await getAvailabilitySections(visibleDoctorOptions);
  // Pre-remplit le formulaire quand un medecin consulte sa propre page.
  const defaultDoctorId =
    currentUser?.role === "doctor" ? visibleDoctorOptions[0]?.id : undefined;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f0fdf4_0%,#f8fafc_18%,#ffffff_100%)] py-10">
      <Container className="space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-[0_24px_80px_-40px_rgba(5,150,105,0.45)]">
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Staff clinique
              </span>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950">
                  Gerer les disponibilites des consultations
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600">
                  Cette vue centralise les plages deja declarees et aide l&apos;equipe a
                  preparer de nouveaux creneaux. Les horaires affiches ci-dessous sont
                  presentes en UTC pour garder un repere unique cote serveur.
                </p>
              </div>
            </div>

            <div className="grid gap-4 rounded-[1.75rem] border border-emerald-100 bg-emerald-50/70 p-5 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Medecins visibles
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {visibleDoctorOptions.length}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Blocs de disponibilite
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {availabilitySections.reduce(
                    (total, section) => total + section.availabilities.length,
                    0,
                  )}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Creneaux prepares
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {availabilitySections.reduce((total, section) => total + section.totalSlots, 0)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <AvailabilityForm
          doctorOptions={visibleDoctorOptions.map((doctorOption) => ({
            id: doctorOption.id,
            label: doctorOption.label,
          }))}
          defaultDoctorId={defaultDoctorId}
        />

        <section className="space-y-5">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Vue actuelle des plages
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              Chaque bloc montre la plage declaree et un apercu des creneaux generes.
            </p>
          </div>

          {availabilitySections.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-emerald-200 bg-white px-6 py-10 text-center shadow-sm">
              <p className="text-lg font-semibold text-slate-900">
                Aucun medecin actif n&apos;est encore visible.
              </p>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Ajoute ou active un profil medecin pour commencer a planifier des plages
                de consultation dans cet espace.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {availabilitySections.map((section) => (
                <article
                  key={section.doctor.id}
                  className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-[0_24px_80px_-50px_rgba(5,150,105,0.35)]"
                >
                  <div className="flex flex-col gap-4 border-b border-emerald-100 bg-[linear-gradient(135deg,rgba(240,253,244,1),rgba(255,255,255,1))] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold text-slate-950">
                        {section.doctor.label}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {section.availabilities.length} bloc(s) et {section.totalSlots} creneau(x)
                        prepares.
                      </p>
                    </div>
                    <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                      Planning staff
                    </span>
                  </div>

                  {section.availabilities.length === 0 ? (
                    <div className="px-6 py-6">
                      <p className="text-sm text-slate-600">
                        Aucune plage n&apos;a encore ete enregistree pour ce medecin.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 px-6 py-6">
                      {section.availabilities.map(({ availability, slots }) => (
                        <div
                          key={availability.id}
                          className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                                  {getAvailabilityStatusLabel(availability.status)}
                                </span>
                                {availability.source ? (
                                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                                    Source: {availability.source}
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-base font-semibold text-slate-950">
                                {formatDateTime(availability.startsAt)} -{" "}
                                {formatDateTime(availability.endsAt)}
                              </p>
                              <p className="text-sm text-slate-600">
                                Cree le {formatDateTime(availability.createdAt)}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-700">
                              <p className="font-semibold text-slate-950">{slots.length} creneau(x)</p>
                              <p className="mt-1 text-xs text-slate-500">
                                Bloc #{availability.id.slice(0, 8)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {slots.slice(0, 6).map((slot) => (
                              <span
                                key={slot.id}
                                className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800"
                              >
                                {formatTime(slot.startsAt)} - {formatTime(slot.endsAt)}
                              </span>
                            ))}
                            {slots.length > 6 ? (
                              <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                                +{slots.length - 6} autre(s)
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </Container>
    </main>
  );
}
