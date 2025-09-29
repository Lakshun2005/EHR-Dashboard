# Application Features & Technical Overview

## 1. High-Level Summary
This application is a comprehensive, AI-powered dashboard for healthcare professionals. It is designed to streamline clinical workflows, improve patient management, and provide intelligent support for medical documentation and decision-making. The target users are doctors, nurses, and administrative staff in a clinical setting. The core value proposition is to centralize patient information, automate routine tasks, and leverage AI to enhance the quality of care.

## 2. Core Feature Breakdown

### Patient Management
- **User Story/Goal:** Allows users to view, add, edit, and delete patient records. Users can search for patients by name or Medical Record Number (MRN) and view a list of all patients with key information at a glance.
- **Key Components & Files:**
    - `app/patients/page.tsx`: The main page for displaying the patient directory.
    - `components/add-patient-dialog.tsx`: A dialog for adding new patients.
    - `components/edit-patient-dialog.tsx`: A dialog for editing existing patient records.
    - `components/view-patient-dialog.tsx`: A dialog for viewing detailed patient information.
    - `components/ui/table.tsx`: Used to display the list of patients.
    - `components/ui/button.tsx`, `components/ui/dialog.tsx`, `components/ui/input.tsx`: UI components for user interaction.
- **Data & Logic Flow:**
    1. The user navigates to the `/patients` page.
    2. The `PatientsPage` component fetches a list of patients from the `patients` table in Supabase.
    3. The list of patients is displayed in a table, showing the MRN, name, age, last visit date, status, and risk level.
    4. The user can search for patients by name or MRN, which filters the list in real-time.
    5. The user can click the "Add New Patient" button to open the `AddPatientDialog`.
    6. In the dialog, the user enters the patient's information and clicks "Save Patient."
    7. The `AddPatientDialog` component sends a request to the Supabase API to insert a new record into the `patients` table.
    8. The patient list is refreshed to include the new patient.
    9. Users can also edit or delete patient records, which triggers corresponding API calls to Supabase.
- **Associated Database Models:** `patients`, `medical_history`
- **Dependencies & Services:** Supabase for database and authentication.

### AI Clinical Support
- **User Story/Goal:** Provides AI-powered assistance to clinicians for tasks such as summarizing patient histories, generating differential diagnoses, and suggesting treatment plans.
- **Key Components & Files:**
    - `app/clinical-ai/page.tsx`: The main page for the AI clinical support feature.
    - `components/clinical-ai-assistant.tsx`: The UI component for the AI assistant.
    - `lib/openai.ts`: (Assumed) A file for configuring the OpenAI API client.
- **Data & Logic Flow:**
    1. The user navigates to the `/clinical-ai` page.
    2. The user inputs a query into the `ClinicalAIAssistant` component, such as "summarize patient John Doe's history."
    3. The component sends the query to a backend API endpoint.
    4. The backend endpoint uses the OpenAI SDK to send a prompt to the GPT-4 model, including relevant patient data fetched from Supabase.
    5. The AI model returns a response, which is then displayed to the user in the UI.
- **Associated Database Models:** `patients`, `medical_history`, `lab_results` (Assumed)
- **Dependencies & Services:** OpenAI API, Supabase.

### Smart Documentation
- **User Story/Goal:** Helps clinicians create and manage medical documentation more efficiently. This could include features like AI-powered note-taking, template generation, and automated coding.
- **Key Components & Files:**
    - `app/documentation/page.tsx`: The main page for the smart documentation feature.
    - `components/smart-documentation.tsx`: The UI component for the smart documentation editor.
- **Data & Logic Flow:**
    1. The user navigates to the `/documentation` page.
    2. The user selects a patient and a document type (e.g., SOAP note, discharge summary).
    3. The `SmartDocumentation` component provides an editor with AI-powered features, such as auto-completion and template suggestions.
    4. As the user types, the component can send requests to the OpenAI API to generate relevant text.
    5. When the document is saved, it is stored in the `documents` table in Supabase, linked to the patient's record.
- **Associated Database Models:** `documents`, `patients`
- **Dependencies & Services:** OpenAI API, Supabase.

## 3. Technical Architecture
### Tech Stack
- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/UI, Radix UI
- **Backend:** Supabase
- **Database:** Supabase (PostgreSQL)
- **AI:** OpenAI SDK
- **State Management:** React Hooks (`useState`, `useEffect`, `useCallback`)
- **Form Management:** `react-hook-form` (inferred from dependencies)
- **Schema Validation:** `zod` (inferred from dependencies)

### Folder Structure
- `/app`: Contains the application's routes and pages, following the Next.js App Router convention.
- `/components`: Contains reusable React components used throughout the application.
- `/lib`: Contains utility functions and client configurations, including the Supabase client.
- `/styles`: Contains global CSS styles.
- `/public`: Contains static assets like images and fonts.

## 4. Database Schema
The database schema is managed through Supabase. Based on the queries in the code, the following tables can be inferred:
- **`patients`**: Stores patient information.
    - `id` (uuid, primary key)
    - `medical_record_number` (text, unique)
    - `first_name` (text)
    - `last_name` (text)
    - `date_of_birth` (date)
    - `gender` (text)
    - `phone` (text)
    - `email` (text)
    - `created_at` (timestamp)
- **`medical_history`**: Stores the medical history of patients.
    - `id` (uuid, primary key)
    - `patient_id` (uuid, foreign key to `patients.id`)
    - `diagnosis` (text)
    - `diagnosis_date` (date)
    - `treatment` (text)
    - `status` (text, e.g., 'stable', 'critical')
    - `severity` (text, e.g., 'high', 'medium', 'low')
- **`documents`**: (Inferred) Stores medical documents.
    - `id` (uuid, primary key)
    - `patient_id` (uuid, foreign key to `patients.id`)
    - `document_type` (text)
    - `content` (text)
    - `created_at` (timestamp)

## 5. Environment & Configuration
The following environment variables are required to run the application:

| Variable Name                  | Purpose                                        | Example Value                                  |
| ------------------------------ | ---------------------------------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`     | The URL of the Supabase project.               | `https://<project-ref>.supabase.co`            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| The anonymous key for the Supabase project.    | `<your-anon-key>`                              |
| `OPENAI_API_KEY`               | The API key for the OpenAI service.            | `sk-<your-openai-api-key>`                     |
