/// Page patient simple pour consulter et reserver les creneaux ouverts Clinique NOS.

import { Container } from "../../../../components/ui/container";
import { BookingForm } from "../../../../components/appointments/booking-form";
import { listOpenAvailabilitySlots } from "../../../../modules/appointments/repository";
import type { OpenAppointmentSlotRecord } from "../../../../modules/appointments/types";

/// Formate une date UTC dans un style lisible pour le patient.
function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(value);
}

/// Formate un nom de medecin a partir des informations disponibles.
function formatDoctorName(slot: OpenAppointmentSlotRecord) {
  // Replie sur un libelle generique si le nom medecin n'est pas encore disponible.
  if (!slot.doctorFirstName && !slot.doctorLastName) {
    return "Medecin de garde";
  }

  return [slot.doctorFirstName, slot.doctorLastName].filter(Boolean).join(" ");
}

/// Retourne le libelle secondaire de specialite du medecin.
function formatDoctorSubtitle(slot: OpenAppointmentSlotRecord) {
  // Evite d'afficher une ligne vide si la specialite n'est pas renseignee.
  if (!slot.doctorSpecialty) {
    return "Consultation generale";
  }

  return slot.doctorSpecialty;
}

export default async function PatientBookingPage() {
  const openSlots = await listOpenAvailabilitySlots();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ecfdf5_0%,#f8fafc_18%,#ffffff_100%)] py-10">
      <Container className="space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-[0_24px_80px_-40px_rgba(5,150,105,0.35)]">
          <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Espace patient
              </span>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950">
                  Reserver un creneau de consultation
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600">
                  Choisis un horaire disponible puis valide ta reservation. Cette vue
                  reste volontairement simple pour te permettre d&apos;aller a
                  l&apos;essentiel sans confusion.
                </p>
              </div>
            </div>

            <div className="grid gap-4 rounded-[1.75rem] border border-emerald-100 bg-emerald-50/70 p-5 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Creneaux ouverts
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{openSlots.length}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Fuseau affiche
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">UTC</p>
                <p className="mt-1 text-xs text-slate-500">
                  Les horaires sont harmonises cote serveur.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Horaires disponibles
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              Chaque carte te permet de confirmer directement le creneau choisi. Le
              formulaire patient dedie sera extrait dans le lot suivant.
            </p>
          </div>

          {openSlots.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-emerald-200 bg-white px-6 py-10 text-center shadow-sm">
              <p className="text-lg font-semibold text-slate-900">
                Aucun creneau n&apos;est encore ouvert a la reservation.
              </p>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Reviens un peu plus tard ou contacte le secretariat si tu dois planifier
                une consultation rapidement.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {openSlots.map((slot) => (
                <article
                  key={slot.id}
                  className="rounded-[1.75rem] border border-emerald-100 bg-white p-5 shadow-[0_18px_60px_-45px_rgba(5,150,105,0.45)]"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700">
                        Disponible
                      </span>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-950">
                          {formatDoctorName(slot)}
                        </h3>
                        <p className="text-sm text-slate-600">{formatDoctorSubtitle(slot)}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <p className="text-sm font-medium text-slate-500">Prochain horaire</p>
                      <p className="mt-2 text-base font-semibold leading-6 text-slate-950">
                        {formatDateTime(slot.startsAt)}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Fin prevue a {formatDateTime(slot.endsAt)}
                      </p>
                    </div>

                    <BookingForm availabilitySlotId={slot.id} doctorId={slot.doctorId} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </Container>
    </main>
  );
}
