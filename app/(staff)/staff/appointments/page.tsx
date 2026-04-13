/// Page de gestion globale des rendez-vous pour le staff.
import { requireStaffAccess } from "@/lib/auth/permissions";
import { listAllAppointmentsWithProfiles } from "@/modules/appointments/repository";
import { Container } from "@/components/ui/container";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import Link from "next/link";
import { Search, Filter, ChevronRight, ArrowLeft } from "lucide-react";

export default async function StaffAppointmentsPage() {
  await requireStaffAccess();
  
  const appointments = await listAllAppointmentsWithProfiles();

  return (
    <Container className="py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <Link 
            href="/staff/dashboard" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-sm font-medium mb-3"
          >
            <ArrowLeft size={16} />
            Retour Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Planning de la Clinique</h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Rechercher patient..." 
               className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-64"
             />
           </div>
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
             <Filter size={16} />
             Filtres
           </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Praticien</th>
                <th className="px-6 py-4">Date & Heure</th>
                <th className="px-6 py-4 text-center">Statut</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <p className="font-bold text-slate-900 leading-none">{app.patientLastName} {app.patientFirstName}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono">{app.patientId.slice(0, 8)}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-medium text-slate-700">Dr {app.doctorLastName}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-semibold text-slate-900">
                      {new Date(app.startsAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(app.startsAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <AppointmentStatusBadge status={app.status} />
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Link 
                      href={`/staff/appointments/${app.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 hover:text-emerald-600 transition-all hover:bg-emerald-50 px-3 py-1.5 rounded-lg"
                    >
                      Gérer
                      <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic font-medium">
                    Aucun rendez-vous enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}
