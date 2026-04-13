/// Page de tableau de bord pour le personnel de la clinique.
import { requireStaffAccess } from "@/lib/auth/permissions";
import { listAllAppointmentsWithProfiles } from "@/modules/appointments/repository";
import { Container } from "@/components/ui/container";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import Link from "next/link";
import { Users, Calendar, Activity, ChevronRight } from "lucide-react";

export default async function StaffDashboardPage() {
  await requireStaffAccess();
  
  // Récupère tous les rendez-vous pour une vue globale.
  const appointments = await listAllAppointmentsWithProfiles();
  
  // Statistiques simples (exemples).
  const today = new Date().toDateString();
  const todayAppointments = appointments.filter(a => new Date(a.startsAt).toDateString() === today);
  const pendingAppointments = appointments.filter(a => a.status === 'pending');

  return (
    <Container className="py-12 space-y-10">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tableau de Bord Staff</h1>
        <p className="text-slate-500 mt-1">Vue d&apos;ensemble de l&apos;activité de la clinique.</p>
      </header>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Rendez-vous" value={appointments.length} icon={<Calendar size={20} />} color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard title="Aujourd'hui" value={todayAppointments.length} icon={<Activity size={20} />} color="text-emerald-600" bgColor="bg-emerald-50" />
        <StatCard title="En attente" value={pendingAppointments.length} icon={<Activity size={20} />} color="text-amber-600" bgColor="bg-amber-50" />
        <StatCard title="Patients" value="-" icon={<Users size={20} />} color="text-purple-600" bgColor="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <section className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Derniers rendez-vous enregistrés</h2>
            <Link href="/staff/appointments" className="text-sm font-semibold text-emerald-600 hover:underline">Voir tout</Link>
          </div>

          <div className="divide-y divide-slate-100">
            {appointments.slice(0, 10).map((app) => (
              <div key={app.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-sm">
                    {app.patientLastName[0]}{app.patientFirstName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{app.patientFirstName} {app.patientLastName}</p>
                    <p className="text-xs text-slate-500">Avec Dr {app.doctorLastName} • {new Date(app.startsAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 self-end sm:self-center">
                  <AppointmentStatusBadge status={app.status} />
                  <Link href={`/staff/appointments/${app.id}`} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <ChevronRight size={18} className="text-slate-400" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Actions Rapides</h3>
            <div className="space-y-3">
              <Link href="/staff/availability" className="block w-full text-center py-2.5 px-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">
                Gérer les disponibilités
              </Link>
              <button disabled className="w-full py-2.5 px-4 bg-slate-100 text-slate-400 rounded-xl font-medium cursor-not-allowed">
                Nouvelle Fiche Patient
              </button>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}

function StatCard({ title, value, icon, color, bgColor }: { title: string; value: string | number; icon: React.ReactNode; color: string; bgColor: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${bgColor} ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-black text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
