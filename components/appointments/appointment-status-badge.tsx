/// Composant de badge pour afficher le statut d'un rendez-vous avec des couleurs sémantiques.
import { clsx } from "clsx";
import { AppointmentStatus as Status } from "@/modules/appointments/types";

/// Mapping des styles et libellés par statut.
const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
  pending: { 
    label: "En attente", 
    className: "bg-amber-50 text-amber-700 border-amber-200" 
  },
  confirmed: { 
    label: "Confirmé", 
    className: "bg-emerald-50 text-emerald-700 border-emerald-200" 
  },
  cancelled: { 
    label: "Annulé", 
    className: "bg-rose-50 text-rose-700 border-rose-200" 
  },
  completed: { 
    label: "Terminé", 
    className: "bg-slate-50 text-slate-700 border-slate-200" 
  },
  expired_unpaid: { 
    label: "Expiré (Non payé)", 
    className: "bg-slate-50 text-slate-500 border-slate-100 italic" 
  },
};

interface AppointmentStatusBadgeProps {
  status: Status;
  className?: string;
}

/**
 * Affiche un badge coloré correspondant au statut du rendez-vous.
 */
export function AppointmentStatusBadge({ status, className }: AppointmentStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <span className={clsx(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}
