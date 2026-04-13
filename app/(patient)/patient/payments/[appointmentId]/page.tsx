/// Page de checkout sécurisée pour le paiement d'un rendez-vous.
import { requirePatientAccess } from "@/lib/auth/permissions";
import { getAppointmentDetailById } from "@/modules/appointments/repository";
import { Container } from "@/components/ui/container";
import { FakePaymentForm } from "@/components/payments/fake-payment-form";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Calendar, Stethoscope } from "lucide-react";
import Link from "next/link";

interface PaymentPageProps {
  params: Promise<{ appointmentId: string }>;
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  // 1. Protection de l'accès patient.
  const profile = await requirePatientAccess();
  const { appointmentId } = await params;

  // 2. Récupération des données enrichies du rendez-vous.
  const appointment = await getAppointmentDetailById(appointmentId);

  // 3. Vérifications de validité.
  if (!appointment || appointment.patientId !== profile.id) {
    notFound();
  }

  // Si déjà payé, rediriger vers le détail.
  if (appointment.paymentStatus === 'paid') {
    redirect(`/patient/appointments/${appointmentId}`);
  }

  const startDate = new Date(appointment.startsAt);
  // Prix fixe simulé pour la V1 (ex: 60€ pour une consultation).
  const price = 60.00;

  return (
    <Container className="py-12 max-w-4xl">
      <Link 
        href={`/patient/appointments/${appointmentId}`} 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-sm font-medium mb-8"
      >
        <ArrowLeft size={16} />
        Annuler et revenir au rendez-vous
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Rappel du rendez-vous */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 leading-tight">Finalisez votre réservation</h1>
            <p className="text-slate-500 font-medium">Pour confirmer votre créneau, veuillez procéder au règlement sécurisé.</p>
          </div>

          <div className="bg-emerald-50/50 rounded-3xl p-8 border border-emerald-100 space-y-6">
            <div className="flex gap-4">
               <div className="p-3 bg-white rounded-2xl shadow-sm border border-emerald-100 text-emerald-600">
                  <Stethoscope size={24} />
               </div>
               <div>
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Praticien</p>
                  <p className="font-bold text-slate-900 text-lg">Dr {appointment.doctorFirstName} {appointment.doctorLastName}</p>
                  <p className="text-sm text-slate-500">{appointment.doctorSpecialty || "Consultation générale"}</p>
               </div>
            </div>

            <div className="flex gap-4">
               <div className="p-3 bg-white rounded-2xl shadow-sm border border-emerald-100 text-blue-600">
                  <Calendar size={24} />
               </div>
               <div>
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Date et heure</p>
                  <p className="font-bold text-slate-900 text-sm">
                    {startDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-slate-500">
                    À {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Formulaire de paiement */}
        <div>
          <FakePaymentForm appointmentId={appointmentId} amount={price} />
        </div>
      </div>
    </Container>
  );
}
