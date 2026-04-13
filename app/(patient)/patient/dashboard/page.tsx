/// Page de tableau de bord principal pour le patient.

import { requirePatientAccess } from "@/lib/auth/permissions";
import { getAppointmentsByPatientId, getPatientProfileByUserId } from "@/modules/appointments/repository";
import { Container } from "@/components/ui/container";
import { PatientAppointmentList } from "@/components/appointments/patient-appointment-list";
import { notFound, redirect } from "next/navigation";
import { Calendar, UserCircle, Activity, Sparkles } from "lucide-react";

export default async function PatientDashboardPage() {
  const session = await requirePatientAccess();
  
  // Récupération du profil métier pour avoir l'ID patient
  const patientProfile = await getPatientProfileByUserId(session.id);

  if (!patientProfile) {
    // Si pas de profil, on redirige vers une éventuelle complétion ou on affiche une erreur
    // Pour Clinique NOS, un patient authentifié DEVRAIT avoir un profil.
    return (
      <Container className="py-24 text-center">
        <UserCircle size={64} className="mx-auto text-slate-200 mb-6" />
        <h1 className="text-2xl font-bold text-slate-900">Profil patient introuvable</h1>
        <p className="text-slate-500 mt-2">Veuillez contacter le support administratif de la clinique.</p>
      </Container>
    );
  }

  const appointments = await getAppointmentsByPatientId(patientProfile.id);
  
  // Statistiques rapides
  const now = new Date();
  const upcomingCount = appointments.filter(a => new Date(a.startsAt) >= now).length;
  const nextAppointment = appointments.find(a => new Date(a.startsAt) >= now);

  return (
    <Container className="py-12 max-w-7xl">
      <header className="mb-12 space-y-2">
        <div className="flex items-center gap-3 text-emerald-600 mb-2">
          <Sparkles size={20} className="animate-pulse" />
          <span className="text-xs font-black uppercase tracking-[0.3em]">Tableau de bord</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Bienvenue, {patientProfile.firstName || "Cher Patient"}
        </h1>
        <p className="text-slate-500 font-medium italic">Votre santé, notre priorité absolue.</p>
      </header>

      {/* Résumé Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
          <Activity className="absolute -right-4 -bottom-4 h-32 w-32 text-white/5 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative z-10 space-y-4">
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Suivi d'activité</p>
            <div>
               <p className="text-4xl font-black">{appointments.length}</p>
               <p className="text-sm font-medium text-white/70">Séances au total</p>
            </div>
          </div>
        </div>

        <div className="bg-emerald-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-200 relative overflow-hidden group">
          <Calendar className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative z-10 space-y-4">
            <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Prochains soins</p>
            <div>
               <p className="text-4xl font-black">{upcomingCount}</p>
               <p className="text-sm font-medium text-white/80">Rendez-vous à venir</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
           <div className="relative z-10 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ma prochaine visite</p>
              {nextAppointment ? (
                <div className="space-y-1">
                   <p className="text-lg font-black text-slate-900 leading-tight">
                     Dr {nextAppointment.doctorFirstName} {nextAppointment.doctorLastName}
                   </p>
                   <p className="text-sm font-bold text-emerald-600">
                     Le {new Date(nextAppointment.startsAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                   </p>
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic font-medium">Aucun rendez-vous prévu</p>
              )}
           </div>
        </div>
      </div>

      <section className="space-y-10">
        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
           <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mes Rendez-vous</h2>
           <Activity size={24} className="text-emerald-500/20" />
        </div>
        
        <PatientAppointmentList appointments={appointments} />
      </section>
    </Container>
  );
}
