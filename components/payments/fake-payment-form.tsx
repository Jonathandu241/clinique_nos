"use client";

/// Composant de simulation de paiement.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmFakePayment } from "@/modules/payments/actions";
import { CreditCard, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";

interface FakePaymentFormProps {
  appointmentId: string;
  amount: number;
}

export function FakePaymentForm({ appointmentId, amount }: FakePaymentFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handlePayment() {
    setIsPending(true);
    setError(null);

    try {
      const result = await confirmFakePayment(appointmentId);
      
      if (result.success) {
        setIsSuccess(true);
        // Délai pour laisser l'utilisateur voir le succès
        setTimeout(() => {
          router.push(`/patient/appointments/${appointmentId}`);
          router.refresh();
        }, 2000);
      } else {
        setError(result.error || "Le paiement a échoué.");
      }
    } catch (e: any) {
      setError(e.message || "Une erreur inattendue est survenue.");
    } finally {
      setIsPending(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-12 text-center space-y-4 animate-in fade-in zoom-in duration-500">
        <div className="bg-emerald-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Paiement Réussi !</h3>
        <p className="text-emerald-700 font-medium">Votre rendez-vous est maintenant confirmé. Redirection...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900">Détails du règlement</h3>
            <p className="text-sm text-slate-500 font-medium">Transaction sécurisée par Clinique NOS Pay</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl text-slate-400">
            <ShieldCheck size={24} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 rounded-2xl p-6 flex justify-between items-center border border-slate-100">
            <span className="text-slate-500 font-medium">Total à régler</span>
            <span className="text-2xl font-black text-slate-900">{amount.toFixed(2)} €</span>
          </div>

          <div className="space-y-1 relative group">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                <CreditCard size={20} />
             </div>
             <input 
              disabled 
              value="**** **** **** 4242" 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-500 font-mono text-sm cursor-not-allowed"
             />
             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               Mode Démo
             </span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-rose-500 font-bold bg-rose-50 p-4 rounded-xl border border-rose-100">
            {error}
          </p>
        )}

        <button
          onClick={handlePayment}
          disabled={isPending}
          className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold py-5 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-slate-200 flex items-center justify-center gap-3"
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Traitement en cours...
            </>
          ) : (
            `Confirmer le paiement de ${amount.toFixed(2)} €`
          )}
        </button>
      </div>

      <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
          Ceci est une simulation de paiement pour la validation technique de la V1.
        </p>
      </div>
    </div>
  );
}
