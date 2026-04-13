/// Page de tableau de bord pour le patient.
import { requirePatientAccess } from "@/lib/auth/permissions";
import { getPatientProfileByUserId, listAppointmentsByPatientId } from "@/modules/appointments/repository";
import { Container } from "@/components/ui/container";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import Link from "next/link";
import { Calendar, ChevronRight, PlusCircle } from "lucide-react";
import { redirect } from "next/navigation";

/**
 * Dashboard principal affichant les rendez-vous récents et les actions rapides.
 */
export default async function PatientDashboardPage() {
  const session = await requirePatientAccess();
  
  // Récupère le profil patient lié à l'utilisateur connecté.
  const profile = await getPatientProfileByUserId(session.id);
  
  // Si aucun profil patient n'est trouvé, redirige par sécurité.
  if (!profile) {
    redirect("/");
  }

  // Liste tous les rendez-vous du patient.
  const appointments = await listAppointmentsByPatientId(profile.id);

  return (
    <Container className="py-12 space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Espace Patient</h1>
          <p className="text-slate-500 mt-1">Gérez vos rendez-vous et votre suivi médical.</p>
        </div>
        <Link 
          href="/patient/book" 
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <PlusCircle size={18} />
          Prendre rendez-vous
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Résumé rapide */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={18} className="text-emerald-600" />
                Derniers rendez-vous
              </h2>
            </div>

            {appointments.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <p className="text-slate-500">Vous n&apos;avez pas encore de rendez-vous programmé.</p>
                <Link href="/patient/book" className="text-emerald-600 hover:underline font-medium">
                  Réserver un créneau dès maintenant
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {appointments.slice(0, 5).map((app) => (
                  <Link 
                    key={app.id} 
                    href={`/patient/appointments/${app.id}`}
                    className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">
                        {new Date(app.bookedAt).toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </p>
                      <p className="text-sm text-slate-500">Réf: {app.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <AppointmentStatusBadge status={app.status} />
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            {appointments.length > 5 && (
              <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                <Link href="/patient/appointments" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                  Voir tout l&apos;historique
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* Aide / Informations */}
        <aside className="space-y-6">
          <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200/50">
            <h3 className="font-bold text-lg mb-2">Besoin d&apos;aide ?</h3>
            <p className="text-emerald-50 text-sm leading-relaxed mb-4">
              En cas d&apos;urgence, veuillez contacter le secrétariat directement ou appeler le 15.
            </p>
            <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 py-2 rounded-xl transition-colors font-medium text-sm">
              Nous contacter
            </button>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Vos documents</h3>
            <p className="text-slate-400 text-sm italic">Bientôt disponible : accédez à vos comptes-rendus ici.</p>
          </div>
        </aside>
      </div>
    </Container>
  );
}
