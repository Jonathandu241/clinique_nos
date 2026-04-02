RENAME TABLE `users` TO `utilisateurs`;
RENAME TABLE `patient_profiles` TO `profils_patients`;
RENAME TABLE `doctor_profiles` TO `profils_medecins`;
RENAME TABLE `availabilities` TO `disponibilites`;
RENAME TABLE `availability_slots` TO `creneaux_disponibilite`;
RENAME TABLE `appointments` TO `rendezvous`;
RENAME TABLE `payment_transactions` TO `transactions_paiement`;
RENAME TABLE `notification_events` TO `evenements_notification`;
RENAME TABLE `audit_logs` TO `journaux_audit`;

-- DropForeignKey
ALTER TABLE `creneaux_disponibilite` DROP FOREIGN KEY `availability_slots_availability_id_fkey`;

-- DropForeignKey
ALTER TABLE `creneaux_disponibilite` DROP FOREIGN KEY `availability_slots_doctor_id_fkey`;

-- DropForeignKey
ALTER TABLE `disponibilites` DROP FOREIGN KEY `availabilities_created_by_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `disponibilites` DROP FOREIGN KEY `availabilities_doctor_id_fkey`;

-- DropForeignKey
ALTER TABLE `evenements_notification` DROP FOREIGN KEY `notification_events_appointment_id_fkey`;

-- DropForeignKey
ALTER TABLE `journaux_audit` DROP FOREIGN KEY `audit_logs_actor_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `profils_medecins` DROP FOREIGN KEY `doctor_profiles_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `profils_patients` DROP FOREIGN KEY `patient_profiles_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `rendezvous` DROP FOREIGN KEY `appointments_availability_slot_id_fkey`;

-- DropForeignKey
ALTER TABLE `rendezvous` DROP FOREIGN KEY `appointments_doctor_id_fkey`;

-- DropForeignKey
ALTER TABLE `rendezvous` DROP FOREIGN KEY `appointments_patient_id_fkey`;

-- DropForeignKey
ALTER TABLE `transactions_paiement` DROP FOREIGN KEY `payment_transactions_appointment_id_fkey`;

-- AddForeignKey
ALTER TABLE `profils_patients` ADD CONSTRAINT `profils_patients_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profils_medecins` ADD CONSTRAINT `profils_medecins_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `disponibilites` ADD CONSTRAINT `disponibilites_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `utilisateurs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `disponibilites` ADD CONSTRAINT `disponibilites_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `profils_medecins`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `creneaux_disponibilite` ADD CONSTRAINT `creneaux_disponibilite_availability_id_fkey` FOREIGN KEY (`availability_id`) REFERENCES `disponibilites`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `creneaux_disponibilite` ADD CONSTRAINT `creneaux_disponibilite_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `profils_medecins`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rendezvous` ADD CONSTRAINT `rendezvous_availability_slot_id_fkey` FOREIGN KEY (`availability_slot_id`) REFERENCES `creneaux_disponibilite`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rendezvous` ADD CONSTRAINT `rendezvous_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `profils_medecins`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rendezvous` ADD CONSTRAINT `rendezvous_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `profils_patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions_paiement` ADD CONSTRAINT `transactions_paiement_appointment_id_fkey` FOREIGN KEY (`appointment_id`) REFERENCES `rendezvous`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evenements_notification` ADD CONSTRAINT `evenements_notification_appointment_id_fkey` FOREIGN KEY (`appointment_id`) REFERENCES `rendezvous`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journaux_audit` ADD CONSTRAINT `journaux_audit_actor_user_id_fkey` FOREIGN KEY (`actor_user_id`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `creneaux_disponibilite_doctor_id_starts_at_idx` ON `creneaux_disponibilite`(`doctor_id`, `starts_at`);
DROP INDEX `availability_slots_doctor_id_starts_at_idx` ON `creneaux_disponibilite`;

-- RedefineIndex
CREATE INDEX `creneaux_disponibilite_status_starts_at_idx` ON `creneaux_disponibilite`(`status`, `starts_at`);
DROP INDEX `availability_slots_status_starts_at_idx` ON `creneaux_disponibilite`;

-- RedefineIndex
CREATE INDEX `disponibilites_doctor_id_starts_at_idx` ON `disponibilites`(`doctor_id`, `starts_at`);
DROP INDEX `availabilities_doctor_id_starts_at_idx` ON `disponibilites`;

-- RedefineIndex
CREATE INDEX `evenements_notification_appointment_id_status_idx` ON `evenements_notification`(`appointment_id`, `status`);
DROP INDEX `notification_events_appointment_id_status_idx` ON `evenements_notification`;

-- RedefineIndex
CREATE INDEX `journaux_audit_entity_type_entity_id_idx` ON `journaux_audit`(`entity_type`, `entity_id`);
DROP INDEX `audit_logs_entity_type_entity_id_idx` ON `journaux_audit`;

-- RedefineIndex
CREATE UNIQUE INDEX `profils_medecins_user_id_key` ON `profils_medecins`(`user_id`);
DROP INDEX `doctor_profiles_user_id_key` ON `profils_medecins`;

-- RedefineIndex
CREATE UNIQUE INDEX `profils_patients_user_id_key` ON `profils_patients`(`user_id`);
DROP INDEX `patient_profiles_user_id_key` ON `profils_patients`;

-- RedefineIndex
CREATE UNIQUE INDEX `rendezvous_availability_slot_id_key` ON `rendezvous`(`availability_slot_id`);
DROP INDEX `appointments_availability_slot_id_key` ON `rendezvous`;

-- RedefineIndex
CREATE INDEX `rendezvous_payment_status_payment_due_at_idx` ON `rendezvous`(`payment_status`, `payment_due_at`);
DROP INDEX `appointments_payment_status_payment_due_at_idx` ON `rendezvous`;

-- RedefineIndex
CREATE INDEX `rendezvous_status_booked_at_idx` ON `rendezvous`(`status`, `booked_at`);
DROP INDEX `appointments_status_booked_at_idx` ON `rendezvous`;

-- RedefineIndex
CREATE INDEX `transactions_paiement_appointment_id_status_idx` ON `transactions_paiement`(`appointment_id`, `status`);
DROP INDEX `payment_transactions_appointment_id_status_idx` ON `transactions_paiement`;

-- RedefineIndex
CREATE UNIQUE INDEX `utilisateurs_email_key` ON `utilisateurs`(`email`);
DROP INDEX `users_email_key` ON `utilisateurs`;
