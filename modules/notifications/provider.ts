/// Provider simulé pour l'envoi de notifications (Simulation V1).
import { NotificationChannel } from "./types";

/**
 * Simule l'envoi d'une notification via un canal spécifique.
 * Affiche le résultat dans la console avec un formatage distinctif.
 * 
 * @param channel Le canal (email, sms, etc).
 * @param recipient Le destinataire.
 * @param content Le contenu du message.
 * @returns Une référence de fournisseur fictive.
 */
export async function simulateSend(
  channel: NotificationChannel,
  recipient: string,
  content: string
): Promise<string> {
  // Simulation d'un délai réseau (100ms - 400ms)
  const delay = Math.floor(Math.random() * 300) + 100;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const providerRef = `sim_${Math.random().toString(36).substring(2, 9)}`;
  const timestamp = new Date().toLocaleTimeString();

  // Affichage console "Premium" pour le debug et la démo V1
  console.log("\n" + "=".repeat(60));
  console.log(`[${timestamp}] 🔔 NOTIFICATION SIMULATION [${channel.toUpperCase()}]`);
  console.log(`TO: ${recipient}`);
  console.log(`REF: ${providerRef}`);
  console.log("-".repeat(60));
  console.log(content);
  console.log("=".repeat(60) + "\n");

  return providerRef;
}
