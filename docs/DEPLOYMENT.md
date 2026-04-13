# Checklist de Déploiement Production - Clinique NOS

Ce document détaille les étapes nécessaires pour passer de l'environnement de développement local à la production.

## 1. Variables d'Environnement

Assurez-vous que les variables suivantes sont configurées sur votre serveur de production (ex: Vercel, Platform.sh, VPS) :

| Variable | Description | Exemple |
| :--- | :--- | :--- |
| `DATABASE_URL` | L'URL de connexion MySQL | `mysql://user:pass@host:3306/db` |
| `NEXTAUTH_SECRET` | Secret pour les tokens de session | `openssl rand -base64 32` |
| `CRON_SECRET` | Token de sécurité pour les appels API Cron | `votre_secret_tres_long` |
| `APP_URL` | URL racine de l'application | `https://clinique-nos.fr` |

## 2. Base de Données

- [ ] Exécuter `npx prisma migrate deploy` sur la base de prod.
- [ ] Configurer les sauvegardes automatiques.
- [ ] Vérifier les index (déjà définis dans le schéma Prisma).

## 3. Jobs Planifiés (Cron)

L'application nécessite deux jobs récurrents. Vous pouvez utiliser Vercel Cron ou un `crontab` classique qui appelle les endpoints :

| Fréquence | Endpoint | Description |
| :--- | :--- | :--- |
| Toutes les 10 min | `/api/cron/payment-expirations` | Annule les impayés. |
| Toutes les heures | `/api/cron/payment-reminders` | Envoie les rappels par email. |

**Exemple de commande Curl :**
`curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://clinique-nos.fr/api/cron/payment-expirations`

## 4. Notifications (SMTP)

En production, remplacez l'implémentation simulée dans `modules/notifications/provider.ts` par un vrai service (Resend, SendGrid, Amazon SES).

## 5. Checklist Finale

- [ ] Lancer `npm run build` et vérifier l'absence d'erreurs.
- [ ] Vérifier que les variables d'environnement sont injectées.
- [ ] Tester le flux complet sur un environnement de staging si possible.
- [ ] Valider l'accès à `/api/health`.
