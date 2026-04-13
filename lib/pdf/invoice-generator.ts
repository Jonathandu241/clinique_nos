/// Service de génération de factures au format PDF utilisant jsPDF.

import { jsPDF } from "jspdf";
import "jspdf-autotable";

/**
 * Génère un buffer PDF représentant la facture pour un rendez-vous donné.
 * @param appointment Les données du rendez-vous (inclus détails médecin et patient)
 */
export async function generateInvoicePdf(appointment: any): Promise<Buffer> {
  const doc = new jsPDF();
  
  // Couleurs de la marque (Vert Clinique)
  const PRIMARY_COLOR = [16, 185, 129]; // emerald-500
  const TEXT_DARK = [15, 23, 42]; // slate-900
  const TEXT_LIGHT = [100, 116, 139]; // slate-500

  // Header : Nom de la clinique
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("CLINIQUE NOS", 20, 30);
  
  doc.setTextColor(TEXT_LIGHT[0], TEXT_LIGHT[1], TEXT_LIGHT[2]);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Espace de Santé Intégré", 20, 36);
  doc.text("123 Rue de la Médecine, 75015 Paris", 20, 42);
  doc.text("contact@clinique-nos.fr | +33 1 23 45 67 89", 20, 47);

  // Titre de la facture
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURE", 140, 30);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Réf: INV-${appointment.id.toUpperCase().slice(0, 8)}`, 140, 37);
  doc.text(`Date ém.: ${new Date().toLocaleDateString('fr-FR')}`, 140, 42);

  // Section : Destinataire (Patient)
  doc.setFont("helvetica", "bold");
  doc.text("FACTURÉ À :", 20, 70);
  doc.setFont("helvetica", "normal");
  doc.text(`${appointment.patientFirstName} ${appointment.patientLastName}`, 20, 77);
  doc.text(appointment.patientEmail || "Client NoS", 20, 82);

  // Section : Détails Consultation
  doc.setFont("helvetica", "bold");
  doc.text("DÉTAILS DU SOIN :", 120, 70);
  doc.setFont("helvetica", "normal");
  doc.text(`Praticien : Dr ${appointment.doctorLastName}`, 120, 77);
  doc.text(`Spécialité : ${appointment.doctorSpecialty || "Médecine Générale"}`, 120, 82);
  doc.text(`Date séance : ${new Date(appointment.startsAt).toLocaleDateString('fr-FR')}`, 120, 87);

  // Tableau des Prestations
  (doc as any).autoTable({
    startY: 100,
    head: [['Désignation', 'Date', 'TVA', 'Total HT', 'Total TTC']],
    body: [
      [
        `Consultation Médicale - ${appointment.doctorSpecialty || "Standard"}`, 
        new Date(appointment.startsAt).toLocaleDateString('fr-FR'),
        "Exonéré",
        "80.00 €",
        "80.00 €"
      ]
    ],
    headStyles: { fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 20, right: 20 }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Résumé financier
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL NET À PAYER :", 130, finalY + 10);
  doc.setFontSize(16);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text("80.00 €", 175, finalY + 10);

  // Footer : Mentions Légales
  doc.setFontSize(8);
  doc.setTextColor(TEXT_LIGHT[0], TEXT_LIGHT[1], TEXT_LIGHT[2]);
  doc.setFont("helvetica", "italic");
  const footerText = "Cette facture fait office de preuve de paiement pour votre mutuelle. Dispensé d'immatriculation au registre du commerce et des sociétés (RCS) et au répertoire des métiers (RM).";
  const splitFooter = doc.splitTextToSize(footerText, 170);
  doc.text(splitFooter, 20, 280);

  // Retourne le Buffer
  return Buffer.from(doc.output("arraybuffer"));
}
