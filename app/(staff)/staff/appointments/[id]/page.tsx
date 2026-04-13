/// Page de détail et de gestion d'un rendez-vous pour le staff.
import { requireStaffAccess } from "@/lib/auth/permissions";
import { getAppointmentDetailById } from "@/modules/appointments/repository";
import { Container } from "@/components/ui/container";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Stethoscope, Clock, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";

interface StaffAppointmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StaffAppointmentDetailPage({ params }: StaffAppointmentDetailPageProps) {
  await requireStaffAccess();
  const { id } = await params;

  const appointment = await getAppointmentDetailById(id);

  if (!appointment) {
    notFound();
  }

  const startDate = new Date(appointment.startsAt);

  return (
    <Container className="py-12 max-w-5xl">
      <Link 
        href="/staff/appointments" 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-sm font-medium mb-8"
      >
        <ArrowLeft size={16} />
        Retour au planning
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Détails Principaux */}
        <div className="lg:col-span-2 space-y-8">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Fiche Rendez-vous</h1>
              <p className="text-sm font-mono text-slate-400 uppercase tracking-widest">{appointment.id}</p>
            </div>
            <AppointmentStatusBadge status={appointment.status} className="text-sm px-4 py-1.5 h-fit shadow-sm" />
          </header>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
              <section className="space-y-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <User size={14} className="text-emerald-500" />
                  Patient
                </h3>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-slate-900">{appointment.patientFirstName} {appointment.patientLastName}</p>
                  <p className="text-sm text-slate-500 font-medium">ID Patient: {appointment.patientId.slice(0, 12)}...</p>
                </div>
                <div className="inline-flex bg-slate-50 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 border border-slate-100">
                  Dossier à jour
                </div>
              </section>

              <section className="space-y-6">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Stethoscope size={14} className="text-emerald-500" />
                  Praticien
                </h3>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-slate-900">Dr {appointment.doctorFirstName} {appointment.doctorLastName}</p>
                  <p className="text-sm text-slate-500 font-medium">{appointment.doctorSpecialty || "Cardiologie"}</p>
                </div>
              </section>
            </div>

            <div className="bg-slate-50/50 p-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-8">
               <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm text-emerald-600">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Horaires</p>
                    <p className="font-bold text-slate-900 mt-1">
                      {startDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-sm text-slate-600">
                       À partir de {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
               </div>
               
               <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm text-blue-600">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paiement</p>
                    <p className="font-bold text-slate-900 mt-1 uppercase text-sm">
                      {appointment.paymentStatus === 'paid' ? 'Payé' : 'En attente'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Référence Stripe: -</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Panneau d'Actions Staff */}
        <aside className="space-y-6">
           <section className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200 space-y-6">
              <h3 className="font-bold text-lg border-b border-white/10 pb-4">Actions de gestion</h3>
              
              <div className="space-y-3">
                 <button className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 py-3 rounded-2xl font-bold transition-all active:scale-95">
                    <CheckCircle2 size={18} />
                    Confirmer
                 </button>
                 <button className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-3 rounded-2xl font-bold transition-all active:scale-95">
                    Consulter le dossier
                 </button>
                 <button className="w-full flex items-center justify-center gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 py-3 rounded-2xl font-bold transition-all">
                    <XCircle size={18} />
                    Annuler
                 </button>
              </div>
           </section>

           <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 space-y-4">
              <div className="flex items-center gap-2 text-amber-700">
                 <ShieldAlert size={18} />
                 <h4 className="font-bold text-sm">Notes administratives</h4>
              </div>
              <p className="text-xs text-amber-900/70 leading-relaxed italic">
                 {appointment.notesInternal || "Aucune note administrative pour ce rendez-vous."}
              </p>
           </div>
        </aside>
      </div>
    </Container>
  );
}
