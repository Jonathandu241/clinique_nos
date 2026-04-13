/// Composant carte pour afficher un rendez-vous côté patient.

import { Calendar, Clock, MapPin, CreditCard, ChevronRight, Stethoscope, FileText } from "lucide-react";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import Link from "next/link";
import { clsx } from "clsx";

interface PatientAppointmentCardProps {
  appointment: any; // On pourrait typer davantage si besoin
}

/**
 * Affiche les détails d'un rendez-vous patient avec actions contextuelles.
 */
export function PatientAppointmentCard({ appointment }: { appointment: any }) {
  const startDate = new Date(appointment.startsAt);
  const isPast = startDate < new Date();
  
  // Logique de paiement
  const needsPayment = appointment.paymentStatus === "unpaid" && appointment.status === "pending";
  const isPaid = appointment.paymentStatus === "paid";

  return (
    <div className={clsx(
      "group relative bg-white rounded-[2rem] border p-1 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-100",
      isPast ? "opacity-75 blur-[0.2px] hover:blur-0" : "border-slate-100"
    )}>
      <div className="p-6 md:p-8 space-y-6">
        {/* Header : Docteur et Statut */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100/50">
              <Stethoscope size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Dr {appointment.doctorFirstName} {appointment.doctorLastName}
              </h3>
              <p className="text-sm font-medium text-slate-400 capitalize">{appointment.doctorSpecialty || "Cardiologie"}</p>
            </div>
          </div>
          <AppointmentStatusBadge status={appointment.status} />
        </div>

        {/* Détails : Date et Heure */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-slate-600 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
            <Calendar size={16} className="text-emerald-500" />
            <span className="text-sm font-bold">
              {startDate.toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-600 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
            <Clock size={16} className="text-emerald-500" />
            <span className="text-sm font-bold">
              {startDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Footer : Paiement et Actions */}
        <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-50 gap-4">
          <div className="flex items-center gap-2">
            <CreditCard size={14} className={clsx(
              isPaid ? "text-emerald-500" : "text-slate-300"
            )} />
            <span className={clsx(
              "text-[10px] font-black uppercase tracking-widest",
              isPaid ? "text-emerald-600" : "text-slate-400"
            )}>
              {isPaid ? "Payé" : "En attente"}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {isPaid && (
              <a 
                href={`/api/appointments/${appointment.id}/invoice`}
                className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors uppercase border border-emerald-100/50"
                download
              >
                <FileText size={12} />
                Facture PDF
              </a>
            )}
            
            {!isPast && needsPayment && (
              <Link 
                href={`/patient/appointments/${appointment.id}/pay`}
                className="bg-emerald-500 text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors uppercase"
              >
                Payer
              </Link>
            )}

            {!isPast && (
              <Link 
                href={`/patient/appointments/${appointment.id}`}
                className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all border border-slate-100/50"
              >
                <ChevronRight size={18} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
