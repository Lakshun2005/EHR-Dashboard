-- Seed Departments
INSERT INTO "public"."Department" ("id", "name", "description") VALUES
('d1', 'Cardiology', 'Focuses on heart-related issues.'),
('d2', 'Emergency', 'Handles urgent medical cases.'),
('d3', 'Orthopedics', 'Deals with bone and muscle injuries.'),
('d4', 'Pediatrics', 'Cares for children and infants.'),
('d5', 'Internal Medicine', 'General adult medicine.');

-- Seed Users (Healthcare Providers)
INSERT INTO "public"."User" ("id", "email", "firstName", "lastName", "role", "createdAt", "updatedAt") VALUES
('u1', 'dr.alice@ehr.com', 'Alice', 'Wong', 'PHYSICIAN', NOW(), NOW()),
('u2', 'nurse.bob@ehr.com', 'Bob', 'Smith', 'NURSE', NOW(), NOW()),
('u3', 'dr.charlie@ehr.com', 'Charlie', 'Brown', 'SPECIALIST', NOW(), NOW());

-- Seed Beds
INSERT INTO "public"."Bed" ("id", "bedNumber", "isOccupied", "departmentId") VALUES
('b1', 'CARD-01', false, 'd1'),
('b2', 'CARD-02', false, 'd1'),
('b3', 'EMER-01', true, 'd2'),
('b4', 'ORTH-01', false, 'd3');

-- Seed Patients
INSERT INTO "public"."Patient" ("id", "medicalRecordNumber", "firstName", "lastName", "dateOfBirth", "gender", "email", "primaryPhysicianId", "createdAt", "updatedAt") VALUES
('p1', 'MRN001', 'John', 'Doe', '1985-02-10T00:00:00Z', 'Male', 'john.doe@test.com', 'u1', NOW(), NOW()),
('p2', 'MRN002', 'Jane', 'Smith', '1992-07-22T00:00:00Z', 'Female', 'jane.smith@test.com', 'u1', NOW(), NOW()),
('p3', 'MRN003', 'Peter', 'Jones', '1978-11-30T00:00:00Z', 'Male', 'peter.jones@test.com', 'u3', NOW(), NOW());

-- Seed Encounters
INSERT INTO "public"."Encounter" ("id", "status", "type", "startTime", "endTime", "patientId", "providerId", "departmentId", "bedId", "createdAt", "updatedAt") VALUES
('e1', 'COMPLETED', 'OUTPATIENT', '2024-05-10T09:00:00Z', '2024-05-10T09:45:00Z', 'p1', 'u1', 'd1', NULL, NOW(), NOW()),
('e2', 'COMPLETED', 'INPATIENT', '2024-05-12T14:00:00Z', '2024-05-15T11:00:00Z', 'p2', 'u1', 'd1', 'b2', NOW(), NOW()),
('e3', 'IN_PROGRESS', 'EMERGENCY', '2024-05-20T18:00:00Z', NULL, 'p3', 'u2', 'd2', 'b3', NOW(), NOW());

-- Seed Medical History
INSERT INTO "public"."MedicalHistory" ("id", "diagnosis", "diagnosisDate", "treatment", "patientId", "createdAt", "updatedAt") VALUES
('mh1', 'Hypertension', '2022-01-15T00:00:00Z', 'Lisinopril', 'p1', NOW(), NOW()),
('mh2', 'Atrial Fibrillation', '2024-05-10T00:00:00Z', 'Eliquis', 'p1', NOW(), NOW()),
('mh3', 'Pneumonia', '2024-05-12T00:00:00Z', 'Antibiotics', 'p2', NOW(), NOW()),
('mh4', 'Fractured Tibia', '2024-05-20T00:00:00Z', 'Cast and rest', 'p3', NOW(), NOW());

-- Seed Medications
INSERT INTO "public"."Medication" ("id", "name", "dosage", "frequency", "startDate", "patientId") VALUES
('med1', 'Lisinopril', '10mg', 'Once a day', '2022-01-15T00:00:00Z', 'p1'),
('med2', 'Eliquis', '5mg', 'Twice a day', '2024-05-10T00:00:00Z', 'p1');

-- Seed Allergies
INSERT INTO "public"."Allergy" ("id", "substance", "reaction", "severity", "patientId") VALUES
('al1', 'Penicillin', 'Hives', 'MEDIUM', 'p2');

-- Seed Vital Signs
INSERT INTO "public"."VitalSign" ("id", "timestamp", "heartRate", "bloodPressure", "temperature", "patientId") VALUES
('vs1', '2024-05-10T09:05:00Z', 88, '145/92', 98.7, 'p1'),
('vs2', '2024-05-12T14:30:00Z', 95, '120/80', 101.2, 'p2');