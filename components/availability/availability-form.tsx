/// Formulaire client simple pour creer une disponibilite Clinique NOS.

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createAvailabilityAction } from "../../modules/availability/actions";
import {
  INITIAL_CREATE_AVAILABILITY_ACTION_STATE,
  type CreateAvailabilityActionState,
} from "../../modules/availability/types";

type AvailabilityDoctorOption = {
  id: string;
  label: string;
};

type AvailabilityFormProps = {
  doctorOptions?: AvailabilityDoctorOption[];
  defaultDoctorId?: string;
  defaultSlotDurationMinutes?: number;
};

type AvailabilityFieldName =
  | "doctorId"
  | "startsAt"
  | "endsAt"
  | "slotDurationMinutes"
  | "source"
  | "status";

const DEFAULT_SOURCE = "staff_manual";
const DEFAULT_STATUS = "active";
const DEFAULT_SLOT_DURATION_MINUTES = 30;

/// Bouton de soumission avec retour visuel pendant l'envoi.
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
    >
      {pending ? "Preparation..." : "Creer la disponibilite"}
    </button>
  );
}

/// Retourne la premiere erreur d'un champ pour garder l'affichage compact.
function getFieldError(
  state: CreateAvailabilityActionState,
  fieldName: AvailabilityFieldName,
): string | undefined {
  return state.fieldErrors?.[fieldName]?.[0];
}

/// Champ texte ou date partage avec style clinique simple.
function InputField({
  id,
  label,
  name,
  type,
  defaultValue,
  placeholder,
  error,
  description,
  required = false,
}: {
  id: string;
  label: string;
  name: AvailabilityFieldName;
  type: "text" | "datetime-local" | "number";
  defaultValue?: string | number;
  placeholder?: string;
  error?: string;
  description?: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={id} className="space-y-2">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      {description ? <p className="text-xs text-slate-500">{description}</p> : null}
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        min={type === "number" ? 15 : undefined}
        step={type === "number" ? 15 : undefined}
        className="min-h-11 w-full rounded-2xl border border-emerald-100 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </label>
  );
}

/// Champ select pour garder l'interface flexible quand la liste des medecins est connue.
function DoctorField({
  doctorOptions,
  defaultDoctorId,
  error,
}: {
  doctorOptions?: AvailabilityDoctorOption[];
  defaultDoctorId?: string;
  error?: string;
}) {
  // Utilise un select si la page staff fournit deja des medecins.
  if (doctorOptions && doctorOptions.length > 0) {
    return (
      <label htmlFor="doctorId" className="space-y-2">
        <span className="text-sm font-medium text-slate-800">Medecin</span>
        <select
          id="doctorId"
          name="doctorId"
          defaultValue={defaultDoctorId ?? doctorOptions[0]?.id ?? ""}
          required
          className="min-h-11 w-full rounded-2xl border border-emerald-100 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        >
          {doctorOptions.map((doctorOption) => (
            <option key={doctorOption.id} value={doctorOption.id}>
              {doctorOption.label}
            </option>
          ))}
        </select>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </label>
    );
  }

  return (
    <InputField
      id="doctorId"
      label="Identifiant du medecin"
      name="doctorId"
      type="text"
      defaultValue={defaultDoctorId}
      placeholder="doctor_123"
      description="Utilise un identifiant simple tant que la selection staff n'est pas encore branchee."
      error={error}
      required
    />
  );
}

/// Composant principal du formulaire de disponibilite.
export function AvailabilityForm({
  doctorOptions,
  defaultDoctorId,
  defaultSlotDurationMinutes = DEFAULT_SLOT_DURATION_MINUTES,
}: AvailabilityFormProps) {
  const [state, formAction] = useActionState(
    createAvailabilityAction,
    INITIAL_CREATE_AVAILABILITY_ACTION_STATE,
  );

  const doctorError = getFieldError(state, "doctorId");
  const startsAtError = getFieldError(state, "startsAt");
  const endsAtError = getFieldError(state, "endsAt");
  const slotDurationError = getFieldError(state, "slotDurationMinutes");
  const sourceError = getFieldError(state, "source");

  return (
    <section className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-[0_24px_80px_-40px_rgba(5,150,105,0.45)]">
      <div className="border-b border-emerald-100 bg-[linear-gradient(135deg,rgba(240,253,244,1),rgba(236,253,245,0.65),rgba(255,255,255,1))] px-6 py-6">
        <div className="space-y-2">
          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Disponibilites
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Creer une plage de consultation
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Definis une plage horaire simple pour un medecin. Les creneaux seront prepares
            automatiquement a partir de la duree choisie.
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-6 px-6 py-6">
        <div className="grid gap-5 md:grid-cols-2">
          <DoctorField
            doctorOptions={doctorOptions}
            defaultDoctorId={defaultDoctorId}
            error={doctorError}
          />

          <InputField
            id="slotDurationMinutes"
            label="Duree d'un creneau"
            name="slotDurationMinutes"
            type="number"
            defaultValue={defaultSlotDurationMinutes}
            description="La V1 fonctionne avec des durees simples de 15 a 180 minutes."
            error={slotDurationError}
            required
          />

          <InputField
            id="startsAt"
            label="Debut"
            name="startsAt"
            type="datetime-local"
            error={startsAtError}
            required
          />

          <InputField
            id="endsAt"
            label="Fin"
            name="endsAt"
            type="datetime-local"
            error={endsAtError}
            required
          />
        </div>

        <InputField
          id="source"
          label="Source"
          name="source"
          type="text"
          defaultValue={DEFAULT_SOURCE}
          description="Garde une trace simple de l'origine de cette plage."
          error={sourceError}
        />

        <input type="hidden" name="status" value={DEFAULT_STATUS} />

        {state.message ? (
          <div
            className={
              state.status === "success"
                ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                : "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            }
          >
            <p>{state.message}</p>
            {state.status === "success" && state.generatedSlotCount ? (
              <p className="mt-1 text-xs text-emerald-700">
                {state.generatedSlotCount} creneau(x) prepare(s) pour cette plage.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">
            Les horaires sont validates cote serveur avant toute future persistence.
          </p>
          <SubmitButton />
        </div>
      </form>
    </section>
  );
}
