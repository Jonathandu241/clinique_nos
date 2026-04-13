/// Formulaire client simple pour reserver un creneau patient Clinique NOS.

"use client";

import { useActionState } from "react";
import { createAppointmentReservationAction } from "../../modules/appointments/actions";
import { INITIAL_CREATE_APPOINTMENT_RESERVATION_ACTION_STATE } from "../../modules/appointments/types";
import type { CreateAppointmentReservationActionState } from "../../modules/appointments/types";

type BookingFormProps = {
  availabilitySlotId: string;
  doctorId: string;
};

/// Affiche les erreurs de champ de reservation de maniere lisible.
function BookingFieldErrors({
  errors,
}: {
  errors?: string[];
}) {
  // Evite d'afficher une zone vide quand aucun message n'est present.
  if (!errors || errors.length === 0) {
    return null;
  }

  return <p className="text-xs text-rose-600">{errors[0]}</p>;
}

/// Formulaire de reservation minimal branché sur la Server Action.
export function BookingForm({ availabilitySlotId, doctorId }: BookingFormProps) {
  const [state, formAction, isPending] = useActionState<
    CreateAppointmentReservationActionState,
    FormData
  >(createAppointmentReservationAction, INITIAL_CREATE_APPOINTMENT_RESERVATION_ACTION_STATE);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="availabilitySlotId" value={availabilitySlotId} />
      <input type="hidden" name="doctorId" value={doctorId} />

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Note pour l&apos;equipe</span>
        <textarea
          name="notesInternal"
          rows={3}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          placeholder="Precise ici un besoin utile pour la consultation."
        />
        <BookingFieldErrors errors={state.fieldErrors?.notesInternal} />
      </label>

      <BookingFieldErrors errors={state.fieldErrors?.availabilitySlotId} />
      <BookingFieldErrors errors={state.fieldErrors?.doctorId} />

      {state.message ? (
        <p
          className={
            state.status === "error"
              ? "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              : "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          }
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Reservation en cours..." : "Reserver ce creneau"}
      </button>
    </form>
  );
}
