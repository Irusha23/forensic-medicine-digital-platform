CREATE DATABASE IF NOT EXISTS forensic_platform CHARACTER SET = 'utf8mb4' COLLATE = 'utf8mb4_unicode_ci';
USE forensic_platform;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: forensic_platform
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_log`
--

DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_log` (
  `log_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_type` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` bigint DEFAULT NULL,
  `workstation_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payload` json DEFAULT NULL,
  PRIMARY KEY (`log_id`),
  KEY `idx_audit_log_ts` (`timestamp`),
  KEY `idx_audit_log_user` (`user_id`),
  CONSTRAINT `audit_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `autopsy_case`
--

DROP TABLE IF EXISTS `autopsy_case`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `autopsy_case` (
  `case_id` bigint NOT NULL,
  `postmortem_number` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `death_category` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `authorization_id` bigint DEFAULT NULL,
  `is_authorized` tinyint(1) DEFAULT '0',
  `place_of_death` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_time_of_death` datetime DEFAULT NULL,
  `body_received_date_time` datetime DEFAULT NULL,
  `condition_upon_arrival` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `identification_status` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `informing_officer` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notification_source` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receiving_officer` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `antecedent_causes` text COLLATE utf8mb4_unicode_ci,
  `external_findings` text COLLATE utf8mb4_unicode_ci,
  `immediate_cause_of_death` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `internal_findings` text COLLATE utf8mb4_unicode_ci,
  `manner_of_death` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notification_date_time` datetime DEFAULT NULL,
  PRIMARY KEY (`case_id`),
  CONSTRAINT `autopsy_case_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`case_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `autopsy_details`
--

DROP TABLE IF EXISTS `autopsy_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `autopsy_details` (
  `case_id` bigint NOT NULL,
  `time_since_death_estimate` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `organ_findings` json DEFAULT NULL,
  `immediate_cause_of_death` text COLLATE utf8mb4_unicode_ci,
  `antecedent_causes` text COLLATE utf8mb4_unicode_ci,
  `manner_of_death` enum('NATURAL','ACCIDENT','HOMICIDE','SUICIDE','UNDETERMINED','PENDING_INVESTIGATION') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `clothing_details` text COLLATE utf8mb4_unicode_ci,
  `external_injuries` json DEFAULT NULL,
  `identification_marks` text COLLATE utf8mb4_unicode_ci,
  `internal_injuries` json DEFAULT NULL,
  PRIMARY KEY (`case_id`),
  CONSTRAINT `autopsy_details_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`case_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `case_status_lu`
--

DROP TABLE IF EXISTS `case_status_lu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `case_status_lu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `case_type_lu`
--

DROP TABLE IF EXISTS `case_type_lu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `case_type_lu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cases`
--

DROP TABLE IF EXISTS `cases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cases` (
  `case_id` bigint NOT NULL AUTO_INCREMENT,
  `case_number` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `case_type_id` int DEFAULT NULL,
  `case_status_id` int DEFAULT NULL,
  `status` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigned_doctor_id` bigint DEFAULT NULL,
  `police_station_id` int DEFAULT NULL,
  `opened_date` date DEFAULT NULL,
  `closed_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `version` int NOT NULL DEFAULT '1',
  `bht_number` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `patient_id` bigint DEFAULT NULL,
  PRIMARY KEY (`case_id`),
  UNIQUE KEY `case_number` (`case_number`),
  KEY `case_type_id` (`case_type_id`),
  KEY `case_status_id` (`case_status_id`),
  KEY `assigned_doctor_id` (`assigned_doctor_id`),
  KEY `police_station_id` (`police_station_id`),
  KEY `idx_cases_status_created` (`status`,`created_at`),
  KEY `cases_patient_id_fkey` (`patient_id`),
  CONSTRAINT `cases_ibfk_1` FOREIGN KEY (`case_type_id`) REFERENCES `case_type_lu` (`id`),
  CONSTRAINT `cases_ibfk_2` FOREIGN KEY (`case_status_id`) REFERENCES `case_status_lu` (`id`),
  CONSTRAINT `cases_ibfk_3` FOREIGN KEY (`assigned_doctor_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cases_ibfk_4` FOREIGN KEY (`police_station_id`) REFERENCES `police_stations` (`police_station_id`),
  CONSTRAINT `cases_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`)
) ENGINE=InnoDB AUTO_INCREMENT=275 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `chain_of_custody`
--

DROP TABLE IF EXISTS `chain_of_custody`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chain_of_custody` (
  `custody_id` bigint NOT NULL AUTO_INCREMENT,
  `evidence_id` bigint DEFAULT NULL,
  `transferred_from` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transferred_to` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_time` datetime DEFAULT NULL,
  `purpose` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`custody_id`),
  KEY `chain_of_custody_evidence_id_idx` (`evidence_id`),
  CONSTRAINT `chain_of_custody_evidence_id_fkey` FOREIGN KEY (`evidence_id`) REFERENCES `evidence` (`evidence_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `clinical_case`
--

DROP TABLE IF EXISTS `clinical_case`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clinical_case` (
  `case_id` bigint NOT NULL,
  `referral_source` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ward_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `clinical_category` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mlef_serial_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `institution_details` text COLLATE utf8mb4_unicode_ci,
  `referral_date_time` datetime DEFAULT NULL,
  `referring_officer` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `examination_findings` text COLLATE utf8mb4_unicode_ci,
  `incident_date_time` datetime DEFAULT NULL,
  `incident_description` text COLLATE utf8mb4_unicode_ci,
  `past_medical_history` text COLLATE utf8mb4_unicode_ci,
  `provisional_diagnosis` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`case_id`),
  CONSTRAINT `clinical_case_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`case_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `court_event`
--

DROP TABLE IF EXISTS `court_event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `court_event` (
  `court_event_id` bigint NOT NULL AUTO_INCREMENT,
  `case_id` bigint DEFAULT NULL,
  `court_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `event_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `outcome_or_response` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`court_event_id`),
  KEY `case_id` (`case_id`),
  CONSTRAINT `court_event_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`case_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `court_order`
--

DROP TABLE IF EXISTS `court_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `court_order` (
  `authorization_id` bigint NOT NULL,
  `court_order_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `court_case_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `court_name` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`authorization_id`),
  CONSTRAINT `court_order_ibfk_1` FOREIGN KEY (`authorization_id`) REFERENCES `legal_authorizations` (`authorization_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `courts`
--

DROP TABLE IF EXISTS `courts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courts` (
  `court_id` int NOT NULL AUTO_INCREMENT,
  `court_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`court_id`),
  UNIQUE KEY `court_name` (`court_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `document_type_lu`
--

DROP TABLE IF EXISTS `document_type_lu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_type_lu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `document_id` bigint NOT NULL AUTO_INCREMENT,
  `case_id` bigint DEFAULT NULL,
  `document_type_id` int DEFAULT NULL,
  `document_type` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_path` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `version` int DEFAULT '1',
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `uploaded_by` bigint DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `date_received` date DEFAULT NULL,
  `issuing_authority` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`document_id`),
  KEY `document_type_id` (`document_type_id`),
  KEY `idx_documents_case_id` (`case_id`),
  KEY `idx_documents_uploaded_by` (`uploaded_by`),
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`case_id`) ON DELETE CASCADE,
  CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`document_type_id`) REFERENCES `document_type_lu` (`id`),
  CONSTRAINT `documents_ibfk_3` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `evidence`
--

DROP TABLE IF EXISTS `evidence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evidence` (
  `evidence_id` bigint NOT NULL AUTO_INCREMENT,
  `case_id` bigint DEFAULT NULL,
  `evidence_type` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `storage_location` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `collection_date` date DEFAULT NULL,
  PRIMARY KEY (`evidence_id`),
  KEY `evidence_case_id_idx` (`case_id`),
  CONSTRAINT `evidence_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `cases` (`case_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `finding`
--

DROP TABLE IF EXISTS `finding`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `finding` (
  `finding_id` bigint NOT NULL AUTO_INCREMENT,
  `case_id` bigint DEFAULT NULL,
  `phase` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `recorded_by` bigint DEFAULT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`finding_id`),
  KEY `idx_finding_case_id` (`case_id`),
  KEY `idx_finding_recorded_by` (`recorded_by`),
  CONSTRAINT `finding_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`case_id`) ON DELETE CASCADE,
  CONSTRAINT `finding_ibfk_2` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inquest_order`
--

DROP TABLE IF EXISTS `inquest_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inquest_order` (
  `authorization_id` bigint NOT NULL,
  `inquest_order_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isd_officer_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `police_station` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`authorization_id`),
  CONSTRAINT `inquest_order_ibfk_1` FOREIGN KEY (`authorization_id`) REFERENCES `legal_authorizations` (`authorization_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `investigation`
--

DROP TABLE IF EXISTS `investigation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `investigation` (
  `investigation_id` bigint NOT NULL AUTO_INCREMENT,
  `case_id` bigint DEFAULT NULL,
  `investigation_type` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requested_date` date DEFAULT NULL,
  `completed_date` date DEFAULT NULL,
  `status` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `summary` text COLLATE utf8mb4_unicode_ci,
  `document_id` bigint DEFAULT NULL,
  `results` text COLLATE utf8mb4_unicode_ci,
  `laboratory_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sample_details` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`investigation_id`),
  KEY `case_id` (`case_id`),
  KEY `document_id` (`document_id`),
  CONSTRAINT `investigation_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`case_id`) ON DELETE CASCADE,
  CONSTRAINT `investigation_ibfk_2` FOREIGN KEY (`document_id`) REFERENCES `documents` (`document_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `legal_authorizations`
--

DROP TABLE IF EXISTS `legal_authorizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `legal_authorizations` (
  `authorization_id` bigint NOT NULL AUTO_INCREMENT,
  `case_id` bigint NOT NULL,
  `authorization_type` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `issuing_authority` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `document_id` bigint DEFAULT NULL,
  `details` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`authorization_id`),
  KEY `case_id` (`case_id`),
  KEY `document_id` (`document_id`),
  CONSTRAINT `legal_authorizations_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`case_id`),
  CONSTRAINT `legal_authorizations_ibfk_2` FOREIGN KEY (`document_id`) REFERENCES `documents` (`document_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `media`
--

DROP TABLE IF EXISTS `media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media` (
  `media_id` bigint NOT NULL AUTO_INCREMENT,
  `case_id` bigint DEFAULT NULL,
  `media_type_id` int DEFAULT NULL,
  `media_type` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_path` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `version` int DEFAULT '1',
  `captured_at` timestamp NULL DEFAULT NULL,
  `captured_by` bigint DEFAULT NULL,
  `investigation_id` bigint DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`media_id`),
  KEY `media_type_id` (`media_type_id`),
  KEY `idx_media_case_id` (`case_id`),
  KEY `idx_media_captured_by` (`captured_by`),
  KEY `media_ibfk_4` (`investigation_id`),
  CONSTRAINT `media_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`case_id`) ON DELETE CASCADE,
  CONSTRAINT `media_ibfk_2` FOREIGN KEY (`media_type_id`) REFERENCES `media_type_lu` (`id`),
  CONSTRAINT `media_ibfk_3` FOREIGN KEY (`captured_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `media_ibfk_4` FOREIGN KEY (`investigation_id`) REFERENCES `investigation` (`investigation_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `media_type_lu`
--

DROP TABLE IF EXISTS `media_type_lu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_type_lu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notification_priority_lu`
--

DROP TABLE IF EXISTS `notification_priority_lu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_priority_lu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` bigint NOT NULL AUTO_INCREMENT,
  `sender_user_id` bigint DEFAULT NULL,
  `receiver_user_id` bigint DEFAULT NULL,
  `case_id` bigint DEFAULT NULL,
  `notification_type` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` timestamp NULL DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `priority_id` int DEFAULT NULL,
  `status` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`notification_id`),
  KEY `sender_user_id` (`sender_user_id`),
  KEY `case_id` (`case_id`),
  KEY `priority_id` (`priority_id`),
  KEY `idx_notifications_receiver_unread` (`receiver_user_id`,`is_read`,`created_at`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`sender_user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`receiver_user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`case_id`) REFERENCES `cases` (`case_id`),
  CONSTRAINT `notifications_ibfk_4` FOREIGN KEY (`priority_id`) REFERENCES `notification_priority_lu` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `patient_id` bigint NOT NULL AUTO_INCREMENT,
  `full_name` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nic` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `telephone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `age` int DEFAULT NULL,
  PRIMARY KEY (`patient_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `police_stations`
--

DROP TABLE IF EXISTS `police_stations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `police_stations` (
  `police_station_id` int NOT NULL AUTO_INCREMENT,
  `station_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `district` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`police_station_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `referral`
--

DROP TABLE IF EXISTS `referral`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `referral` (
  `referral_id` bigint NOT NULL AUTO_INCREMENT,
  `case_id` bigint DEFAULT NULL,
  `specialty` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `consultant_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referral_date` date DEFAULT NULL,
  `recommendation` text COLLATE utf8mb4_unicode_ci,
  `document_id` bigint DEFAULT NULL,
  `referred_to_user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`referral_id`),
  KEY `case_id` (`case_id`),
  KEY `document_id` (`document_id`),
  KEY `idx_referral_user` (`referred_to_user_id`),
  CONSTRAINT `referral_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`case_id`) ON DELETE CASCADE,
  CONSTRAINT `referral_ibfk_2` FOREIGN KEY (`document_id`) REFERENCES `documents` (`document_id`),
  CONSTRAINT `referral_ibfk_3` FOREIGN KEY (`referred_to_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `report`
--

DROP TABLE IF EXISTS `report`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report` (
  `report_id` bigint NOT NULL AUTO_INCREMENT,
  `case_id` bigint DEFAULT NULL,
  `report_type` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `version` int DEFAULT '1',
  `final_opinion` text COLLATE utf8mb4_unicode_ci,
  `issued_date` date DEFAULT NULL,
  `issued_by` bigint DEFAULT NULL,
  `document_id` bigint DEFAULT NULL,
  `certificate_of_receipt_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `method_of_delivery` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient_details` text COLLATE utf8mb4_unicode_ci,
  `digital_signature` text COLLATE utf8mb4_unicode_ci,
  `qr_code_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`report_id`),
  KEY `document_id` (`document_id`),
  KEY `idx_reports_case_id` (`case_id`),
  KEY `idx_reports_issued_by` (`issued_by`),
  CONSTRAINT `report_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`case_id`) ON DELETE CASCADE,
  CONSTRAINT `report_ibfk_2` FOREIGN KEY (`issued_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `report_ibfk_3` FOREIGN KEY (`document_id`) REFERENCES `documents` (`document_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `report_issuance`
--

DROP TABLE IF EXISTS `report_issuance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_issuance` (
  `issuance_id` bigint NOT NULL AUTO_INCREMENT,
  `report_id` bigint DEFAULT NULL,
  `recipient_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient_designation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issued_date` date DEFAULT NULL,
  `method_of_delivery` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receipt_document_id` bigint DEFAULT NULL,
  PRIMARY KEY (`issuance_id`),
  KEY `report_id` (`report_id`),
  KEY `receipt_document_id` (`receipt_document_id`),
  CONSTRAINT `report_issuance_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `report` (`report_id`) ON DELETE CASCADE,
  CONSTRAINT `report_issuance_ibfk_2` FOREIGN KEY (`receipt_document_id`) REFERENCES `documents` (`document_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `review_visit`
--

DROP TABLE IF EXISTS `review_visit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_visit` (
  `review_id` bigint NOT NULL AUTO_INCREMENT,
  `case_id` bigint DEFAULT NULL,
  `review_date` date DEFAULT NULL,
  `findings` text COLLATE utf8mb4_unicode_ci,
  `recommendations` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`review_id`),
  KEY `case_id` (`case_id`),
  CONSTRAINT `review_visit_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`case_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `summon`
--

DROP TABLE IF EXISTS `summon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `summon` (
  `authorization_id` bigint NOT NULL,
  `MLEF_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `court_case_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `court_date` date DEFAULT NULL,
  `court_name` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`authorization_id`),
  CONSTRAINT `summon_ibfk_1` FOREIGN KEY (`authorization_id`) REFERENCES `legal_authorizations` (`authorization_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_role`
--

DROP TABLE IF EXISTS `user_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_role` (
  `user_id` bigint NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_role_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_role_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_lower` varchar(255) COLLATE utf8mb4_unicode_ci GENERATED ALWAYS AS (lower(`email`)) STORED,
  `designation` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_users_username` (`username`),
  UNIQUE KEY `uq_users_email_lower` (`email_lower`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-23  4:57:02
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: forensic_platform
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `case_status_lu`
--

LOCK TABLES `case_status_lu` WRITE;
/*!40000 ALTER TABLE `case_status_lu` DISABLE KEYS */;
INSERT INTO `case_status_lu` VALUES (1,'open','Open'),(2,'closed','Closed'),(3,'archived','Archived');
/*!40000 ALTER TABLE `case_status_lu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `case_type_lu`
--

LOCK TABLES `case_type_lu` WRITE;
/*!40000 ALTER TABLE `case_type_lu` DISABLE KEYS */;
INSERT INTO `case_type_lu` VALUES (1,'forensic','Forensic'),(2,'clinical','Clinical'),(3,'autopsy','Autopsy');
/*!40000 ALTER TABLE `case_type_lu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `document_type_lu`
--

LOCK TABLES `document_type_lu` WRITE;
/*!40000 ALTER TABLE `document_type_lu` DISABLE KEYS */;
INSERT INTO `document_type_lu` VALUES (1,'report','Report'),(2,'investigation','Investigation'),(3,'referral','Referral'),(4,'mlef','MLEF'),(5,'police_request_letter','Police Request Letter'),(6,'court_order','Court Order'),(7,'referral_letter','Referral Letter'),(8,'doctor_copy_of_mlef','Doctor Copy of MLEF'),(9,'bht_extract','BHT Extract'),(10,'x_ray_report','X-ray Report'),(11,'ct_scan_report','CT Scan Report'),(12,'toxicology_report','Toxicology Report'),(13,'dna_report','DNA Report'),(14,'laboratory_report','Laboratory Report'),(15,'specialist_referral_report','Specialist Referral Report'),(16,'clinical_photograph','Clinical Photograph'),(17,'body_diagram','Body Diagram'),(18,'medico_legal_report__mlr_','Medico-Legal Report (MLR)'),(19,'court_summons','Court Summons'),(20,'supplementary_report','Supplementary Report'),(21,'certificate_of_receipt','Certificate of Receipt'),(22,'inquest_order','Inquest Order'),(23,'crime_scene_report','Crime Scene Report'),(24,'bed_head_ticket__bht_','Bed Head Ticket (BHT)'),(25,'hospital_record','Hospital Record'),(26,'witness_statement','Witness Statement'),(27,'family_statement','Family Statement'),(28,'police_statement','Police Statement'),(29,'postmortem_report__pmr_','Postmortem Report (PMR)'),(30,'autopsy_notes','Autopsy Notes'),(31,'histopathology_report','Histopathology Report'),(32,'radiology_report','Radiology Report'),(33,'crime_scene_photograph','Crime Scene Photograph'),(34,'postmortem_photograph','Postmortem Photograph'),(35,'cause_of_death_form','Cause of Death Form');
/*!40000 ALTER TABLE `document_type_lu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `media_type_lu`
--

LOCK TABLES `media_type_lu` WRITE;
/*!40000 ALTER TABLE `media_type_lu` DISABLE KEYS */;
INSERT INTO `media_type_lu` VALUES (1,'image','Image'),(2,'video','Video'),(3,'audio','Audio');
/*!40000 ALTER TABLE `media_type_lu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `notification_priority_lu`
--

LOCK TABLES `notification_priority_lu` WRITE;
/*!40000 ALTER TABLE `notification_priority_lu` DISABLE KEYS */;
INSERT INTO `notification_priority_lu` VALUES (1,'low','Low'),(2,'normal','Normal'),(3,'high','High');
/*!40000 ALTER TABLE `notification_priority_lu` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-23  4:57:13
