/// Page de liste complète des rendez-vous pour le patient.
import { requirePatientAccess } from "@/lib/auth/permissions";
import { getPatientProfileByUserId, listAppointmentsByPatientId } from "@/modules/appointments/repository";
import { Container } from "@/components/ui/container";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import Link from "next/link";
import { ChevronRight, ArrowLeft, Search } from "lucide-react";
import { redirect } from "next/navigation";

export default async function PatientAppointmentsPage() {
  const session = await requirePatientAccess();
  const profile = await getPatientProfileByUserId(session.id);
  
  if (!profile) {
    redirect("/");
  }

  const appointments = await listAppointmentsByPatientId(profile.id);

  return (
    <Container className="py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <Link 
            href="/patient/dashboard" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-sm font-medium mb-3"
          >
            <ArrowLeft size={16} />
            Retour au tableau de bord
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Historique des rendez-vous</h1>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all w-full md:w-64"
          />
        </div>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {appointments.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-slate-500">Aucun rendez-vous trouvé.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">Date & Heure</th>
                  <th className="px-6 py-4">Référence</th>
                  <th className="px-6 py-4 text-center">Statut</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5">
                      <p className="font-semibold text-slate-900">
                        {new Date(app.bookedAt).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-slate-500">Pris le {new Date(app.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {app.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <AppointmentStatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link 
                        href={`/patient/appointments/${app.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:translate-x-1 transition-all"
                      >
                        Détails
                        <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Container>
  );
}
