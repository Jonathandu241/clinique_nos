"use client";

import { useState } from "react";
import { XCircle, Calendar, Loader2 } from "lucide-react";
import { staffCancelAppointmentAction } from "@/modules/appointments/actions-staff";
import { AppointmentStatus } from "@/modules/appointments/types";
import { canCancel, canReschedule } from "@/modules/appointments/policies";

interface StaffAppointmentActionsProps {
  appointmentId: string;
  status: AppointmentStatus;
}

export function StaffAppointmentActionsClient({ appointmentId, status }: StaffAppointmentActionsProps) {
  const [isPending, setIsPending] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [reason, setReason] = useState("");

  async function handleCancel() {
    setIsPending(true);
    const formData = new FormData();
    formData.append("appointmentId", appointmentId);
    formData.append("reason", reason || "Annulation administrative par le staff");

    const result = await staffCancelAppointmentAction(formData);
    
    if (!result.success) {
      alert(result.message);
      setIsPending(false);
    } else {
      setShowCancelConfirm(false);
      setIsPending(false);
    }
  }

  if (!canCancel(status) && !canReschedule(status)) {
    return (
      <p className="text-xs text-slate-500 italic text-center">
        Aucune action disponible pour ce statut.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Bouton Annuler */}
      {canCancel(status) && !showCancelConfirm && (
        <button 
          onClick={() => setShowCancelConfirm(true)}
          className="w-full flex items-center justify-center gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 py-3 rounded-2xl font-bold transition-all"
        >
          <XCircle size={18} />
          Annuler
        </button>
      )}

      {/* Confirmation Annulation */}
      {showCancelConfirm && (
        <div className="bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 space-y-3 animate-in fade-in slide-in-from-top-2">
          <p className="text-xs font-bold text-rose-300">Confirmer l'annulation ?</p>
          <textarea 
            placeholder="Motif (ex: Médecin absent)"
            className="w-full bg-slate-800 border-white/10 rounded-xl text-xs p-2 text-white placeholder:text-slate-500 focus:ring-emerald-500"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex gap-2">
            <button 
              onClick={handleCancel}
              disabled={isPending}
              className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : "Confirmer"}
            </button>
            <button 
              onClick={() => setShowCancelConfirm(false)}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 rounded-xl"
            >
              Retour
            </button>
          </div>
        </div>
      )}

      {/* Bouton Reprogrammer (Placeholder UI pour l'instant) */}
      {canReschedule(status) && (
        <button 
          className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-3 rounded-2xl font-bold transition-all active:scale-95 text-white"
          onClick={() => alert("La reprogrammation nécessite la sélection d'un nouveau créneau (Tâche 10.4 extension)")}
        >
          <Calendar size={18} />
          Reprogrammer
        </button>
      )}
    </div>
  );
}
