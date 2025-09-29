# Tasks: EHR Dashboard – Phase 1: Foundation & Prisma Setup

## Setup Tasks
- [ ] T001 Initialize Prisma in the Next.js project (`npx prisma init`)
- [ ] T002 Configure Prisma to connect to Supabase Postgres (set DATABASE_URL in `.env`)
- [ ] T003 [P] Install Prisma Client and dependencies (`@prisma/client`, `prisma`)

## Data Model & Migration Tasks
- [ ] T004 Define models in `prisma/schema.prisma`:
    - User (id, name, email, role, etc.)
    - Patient (id, demographics, medicalHistory, etc.)
    - Appointment (id, patientId, providerId, date, status, etc.)
    - MedicalHistory (id, patientId, details, etc.)
    - ClinicalNote (id, patientId, authorId, content, createdAt, etc.)
    - Define relations (e.g., Patient has many Appointments, MedicalHistory, ClinicalNotes)
- [ ] T005 [P] Generate Prisma Client (`npx prisma generate`)
- [ ] T006 Create and apply initial migration (`npx prisma migrate dev --name init`)

## Parallel Execution Guidance
- T003 and T005 can run in parallel after T001/T002/T004
- T006 depends on T004 (schema) and T005 (client generated)

## Validation Checklist
- [x] Prisma is initialized and connected to Supabase
- [x] All models and relations are defined in schema.prisma
- [x] Prisma Client is generated
- [x] Migration is applied and tables are created in Supabase
