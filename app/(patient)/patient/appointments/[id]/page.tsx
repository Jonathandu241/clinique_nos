/// Page de détail d'un rendez-vous spécifique pour le patient.
import { requirePatientAccess } from "@/lib/auth/permissions";
import { getPatientProfileByUserId, getAppointmentDetailById } from "@/modules/appointments/repository";
import { Container } from "@/components/ui/container";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, MapPin, User, FileText, Info, CreditCard } from "lucide-react";

interface PatientAppointmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientAppointmentDetailPage({ params }: PatientAppointmentDetailPageProps) {
  const session = await requirePatientAccess();
  const { id } = await params;

  // Récupère le profil patient.
  const profile = await getPatientProfileByUserId(session.id);
  if (!profile) redirect("/");

  // Récupère les détails du rendez-vous.
  const appointment = await getAppointmentDetailById(id);

  // Sécurité: Si le rendez-vous n'existe pas ou n'appartient pas au patient, on throw une 404.
  if (!appointment || appointment.patientId !== profile.id) {
    notFound();
  }

  const startDate = new Date(appointment.startsAt);
  const endDate = new Date(appointment.endsAt);

  return (
    <Container className="py-12 max-w-4xl">
      <Link 
        href="/patient/appointments" 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-sm font-medium mb-8"
      >
        <ArrowLeft size={16} />
        Retour à la liste
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <header className="space-y-4">
            <div className="flex items-center gap-3">
              <AppointmentStatusBadge status={appointment.status} className="text-sm px-4 py-1" />
              <span className="text-slate-400 text-sm">Référence: {appointment.id.toUpperCase()}</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Rendez-vous avec le Dr {appointment.doctorLastName}
            </h1>
          </header>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Date et Heure</p>
                  <p className="font-bold text-slate-900 leading-tight mt-1">
                    {startDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-slate-600">
                    {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    {" - "}
                    {endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-slate-50 p-3 rounded-xl text-slate-400">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Lieu</p>
                  <p className="font-bold text-slate-900 leading-tight mt-1">Clinique NOS - Siège</p>
                  <p className="text-slate-600">123 Avenue de la Santé, Paris</p>
                </div>
              </div>
            </div>

              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${appointment.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  <CreditCard size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Statut de paiement</p>
                  <p className="font-bold text-slate-900 leading-tight mt-1 uppercase text-sm">
                    {appointment.paymentStatus === 'paid' ? 'Payé' : 'En attente de règlement'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Consultation - 60.00 €</p>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <User size={18} className="text-emerald-600" />
                Informations Praticien
              </h3>
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                <p className="font-semibold text-slate-900">Dr {appointment.doctorFirstName} {appointment.doctorLastName}</p>
                <p className="text-sm text-slate-500">{appointment.doctorSpecialty || "Médecine générale"}</p>
              </div>
            </div>

            {appointment.notesInternal && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <FileText size={18} className="text-emerald-600" />
                  Notes du rendez-vous
                </h3>
                <p className="text-slate-600 bg-slate-50 p-4 rounded-xl italic">
                   &quot;{appointment.notesInternal}&quot;
                </p>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900">Actions</h3>
            
            {appointment.paymentStatus === 'unpaid' && appointment.status === 'pending' && (
              <Link 
                href={`/patient/payments/${appointment.id}`}
                className="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl transition-all font-bold active:scale-95 shadow-lg shadow-emerald-200 block"
              >
                Payer maintenant (60.00 €)
              </Link>
            )}
            
            {appointment.status === 'pending' || appointment.status === 'confirmed' ? (
              <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl transition-all font-semibold active:scale-95">
                Annuler le rendez-vous
              </button>
            ) : (
              <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3 border border-slate-100">
                <Info size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-500 italic">
                  Ce rendez-vous est {appointment.status}. Aucune action n&apos;est possible.
                </p>
              </div>
            )}
            
            <button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 py-3 rounded-xl transition-all font-semibold">
              Modifier mes informations
            </button>
          </div>

          <div className="p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
             <p className="text-xs text-slate-400 text-center uppercase tracking-widest font-bold mb-2">Instructions</p>
             <p className="text-xs text-slate-500 leading-relaxed text-center">
               Veuillez vous présenter 15 minutes avant l&apos;heure du rendez-vous muni de votre carte vitale.
             </p>
          </div>
        </aside>
      </div>
    </Container>
  );
}
