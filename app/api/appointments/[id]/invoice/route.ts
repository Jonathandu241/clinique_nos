/// Route API pour servir les factures PDF des rendez-vous.

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import { getAppointmentDetailForInvoice } from "@/modules/appointments/repository";
import { generateInvoicePdf } from "@/lib/pdf/invoice-generator";

/**
 * GET /api/appointments/[id]/invoice
 * Génère et retourne le PDF de la facture pour un rendez-vous payé.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    
    // 1. Authentification requise
    if (!session) {
      return new NextResponse("Non authentifié", { status: 401 });
    }

    // 2. Récupération des détails complets
    const appointment = await getAppointmentDetailForInvoice(id);
    if (!appointment) {
      return new NextResponse("Rendez-vous introuvable", { status: 404 });
    }

    // 3. Vérification des droits d'accès
    // Un patient ne peut voir que SA facture. Le staff (doctor, secretary, clinic_admin) peut tout voir.
    const isOwner = appointment.patient_userId === session.id; 
    
    const isStaff = ["doctor", "secretary", "clinic_admin"].includes(session.role);
    
    // 4. Vérification du statut de paiement
    if (appointment.payment_status !== 'paid') {
      return new NextResponse("Facture disponible uniquement après paiement", { status: 403 });
    }

    // 5. Génération du PDF
    const pdfBuffer = await generateInvoicePdf(appointment);

    // Audit téléchargement facture
    const { auditService } = await import("@/modules/audit/service");
    auditService.log({
      entityType: "appointment",
      entityId: id,
      action: "INVOICE_DOWNLOADED",
      actorUserId: session.id,
    }).catch(console.error);

    // 6. Envoi de la réponse avec les headers appropriés
    return new NextResponse(pdfBuffer.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="facture-clinique-nos-${id.slice(0, 8)}.pdf"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });

  } catch (error) {
    console.error("[INVOICE_API_ERROR]", error);
    return new NextResponse("Erreur lors de la génération de la facture", { status: 500 });
  }
}
