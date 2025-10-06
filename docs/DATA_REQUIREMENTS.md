# Data Requirements Specification

This document outlines the data requirements for the EHR Dashboard, inferred from a static analysis of the frontend codebase.

---

## Feature: Patient Directory

**Description & User Flow:**
- This feature provides a comprehensive directory of all patients in the system. Users can view a paginated list of patients, search for specific patients by name or Medical Record Number (MRN), and perform actions such as adding, editing, or deleting patient records. The main view includes a table displaying key patient information like MRN, name, age, last visit date, status, and risk level.

**Inferred Data Model:**
- **Entity:** `Patient`
- **Attributes:**
    - `id`: `UUID` - A unique identifier for each patient record.
    - `medical_record_number`: `String` - The patient's unique Medical Record Number.
    - `first_name`: `String` - The patient's first name.
    - `last_name`: `String` - The patient's last name.
    - `date_of_birth`: `DateTime` - The patient's date of birth, used to calculate their age.
    - `gender`: `String` - The patient's gender (e.g., Male, Female, Other, Prefer not to say).
    - `phone_number`: `String` - The patient's contact phone number.
    - `email_address`: `String` - The patient's contact email address.
    - `last_visit_date`: `DateTime` - The timestamp of the patient's most recent visit.
    - `status`: `String` - The current clinical status of the patient (e.g., 'stable', 'critical').
    - `risk_level`: `String` - The assessed risk level for the patient (e.g., 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL').
- **Relationships:**
    - A `Patient` may have many `Appointments`.
    - A `Patient` may have many `ClinicalNotes` or `Records`.

**Required Data Operations (CRUD):**
- **Create:** New `Patient` records are created through the "Add New Patient" dialog, which captures first name, last name, date of birth, and gender.
- **Read:** The system reads a list of all patients to populate the main directory table. It supports searching and pagination. It also fetches the full details of a single patient when the user initiates an edit.
- **Update:** A patient's information (including first name, last name, DOB, gender, phone, and email) can be modified through the "Edit Patient" dialog.
- **Delete:** A patient record can be deleted from the system via an option in the patient table's action menu.

**Evidence from Code:**
- **`app/(dashboard)/patients/page.tsx`**: Defines the main patient table, state management for patient data (`useState<Patient[]>`), and functions for loading, searching, and deleting patients. The `Patient` interface here includes `id`, `mrn`, `name`, `age`, `lastVisit`, `status`, and `riskLevel`.
- **`components/add-patient-dialog.tsx`**: Implements the form for creating a new patient, making a `POST` request to `/api/patients` with `firstName`, `lastName`, `dateOfBirth`, and `gender`.
- **`components/edit-patient-dialog.tsx`**: Implements the form for updating an existing patient, making a `PUT` request to `/api/patients/{patient.id}`. This component reveals additional attributes like `phone` and `email`.
- **API Calls**: The code makes API calls to `/api/patients` for fetching, creating, updating, and deleting patient data, confirming the full range of CRUD operations.

---

## Feature: Appointment Scheduling

**Description & User Flow:**
- This feature allows users to schedule, view, and manage patient appointments. The main page displays a list of all appointments with details about the patient, provider, date, time, and status. Users can initiate a scheduling process through a dialog, where they select a patient and provider, and specify the appointment date, time, and type.

**Inferred Data Model:**
- **Entity:** `Appointment`
- **Attributes:**
    - `id`: `UUID` - Unique identifier for the appointment.
    - `appointment_date`: `DateTime` - The specific date and time for the appointment.
    - `duration_minutes`: `Integer` - The planned length of the appointment in minutes.
    - `appointment_type`: `String` - The category of the appointment (e.g., 'routine_checkup', 'follow_up', 'consultation').
    - `status`: `String` - The current status of the appointment (e.g., 'scheduled', 'completed', 'canceled').
    - `chief_complaint`: `String` - The primary reason for the appointment, as reported by the patient.
    - `patient_id`: `UUID` (Foreign Key) - A reference to the associated `Patient`.
    - `provider_id`: `UUID` (Foreign Key) - A reference to the associated `Profile` (Provider).
- **Relationships:**
    - Belongs to one `Patient`.
    - Belongs to one `Profile` (Provider).

- **Entity:** `Profile` (Inferred Provider/Doctor)
- **Attributes:**
    - `id`: `UUID` - Unique identifier for the provider.
    - `first_name`: `String` - The provider's first name.
    - `last_name`: `String` - The provider's last name.
- **Relationships:**
    - Has many `Appointments`.

**Required Data Operations (CRUD):**
- **Create:** A new `Appointment` is created using the "Schedule Appointment" dialog. This operation requires selecting a patient and a provider and setting the appointment details.
- **Read:** The system reads a list of all appointments, joining `patients` and `profiles` data to display names. It also reads all patients and providers to populate the selection dropdowns in the scheduling dialog.
- **Update:** The UI includes a "Reschedule" option, which implies the ability to update an appointment's date and time.
- **Delete:** The UI includes a "Cancel" option, which implies either deleting an appointment record or updating its status to 'canceled'.

**Evidence from Code:**
- **`app/(dashboard)/appointments/page.tsx`**: Fetches and displays a list of appointments using a Supabase query that joins `appointments` with `patients` and `profiles`.
- **`components/schedule-appointment-dialog.tsx`**: Contains the form for creating a new appointment. It makes a Supabase `insert` call to the `appointments` table and fetches data from the `patients` and `profiles` tables to populate dropdowns.
- **Supabase Client**: Direct database interaction from the frontend via `lib/supabase/client.ts` confirms the table names (`appointments`, `patients`, `profiles`) and relationships.

---

## Feature: Medical Records Viewer

**Description & User Flow:**
- This feature enables users to search for a patient by their name or Medical Record Number (MRN). Once a patient is found, the system displays their medical history in a table, showing details like the condition, diagnosis date, status, and severity.

**Inferred Data Model:**
- **Entity:** `MedicalHistory`
- **Attributes:**
    - `id`: `UUID` - Unique identifier for the medical history record.
    - `condition_name`: `String` - The name of the diagnosed condition.
    - `diagnosis_date`: `Date` - The date when the condition was diagnosed.
    - `status`: `String` - The current status of the condition (e.g., 'active', 'resolved').
    - `severity`: `String` - The severity of the condition (e.g., 'mild', 'moderate', 'severe').
    - `patient_id`: `UUID` (Foreign Key) - A reference to the associated `Patient`.
- **Relationships:**
    - Belongs to one `Patient`.

**Required Data Operations (CRUD):**
- **Create:** No functionality to create new medical history records is visible in this component. This is likely handled elsewhere, perhaps in a clinical documentation feature.
- **Read:** The system reads `Patient` data based on a search term. Upon finding a patient, it reads all associated `MedicalHistory` records for that patient.
- **Update:** No update functionality is present in the UI.
- **Delete:** No delete functionality is present in the UI.

**Evidence from Code:**
- **`app/(dashboard)/records/page.tsx`**: Implements the patient search and displays medical records. It uses a Supabase query to search for patients and another to fetch records from the `medical_history` table based on the `patient_id`.
- **Supabase Query**: The code explicitly queries `from("medical_history")` and selects fields like `condition_name`, `diagnosis_date`, `status`, and `severity`.

---

## Feature: Analytics Dashboard

**Description & User Flow:**
- This feature provides a high-level overview of hospital operations through various data visualizations. It includes key performance indicators (KPIs), patient volume trends, diagnosis distributions, and other metrics across different tabs like Patients, Clinical, Operations, and Financial. The data is fetched from an analytics API and is intended for business intelligence and monitoring purposes.

**Inferred Data Model (Aggregated Views):**
- **Data View:** `KPIs`
- **Attributes:**
    - `total_patients`: `Integer` - The total number of unique patients.
    - `avg_satisfaction`: `Float` - The average patient satisfaction score.
    - `bed_occupancy`: `Float` - The percentage of hospital beds currently in use.
    - `avg_length_of_stay`: `Float` - The average length of a patient's stay in days.

- **Data View:** `PatientVolume` (Time-series)
- **Attributes:**
    - `month`: `String` - The month for the data point.
    - `inpatient`: `Integer` - The number of inpatient admissions.
    - `outpatient`: `Integer` - The number of outpatient visits.
    - `emergency`: `Integer` - The number of emergency room visits.

- **Data View:** `DiagnosisDistribution`
- **Attributes:**
    - `name`: `String` - The name of the diagnosis category.
    - `value`: `Float` - The percentage of this diagnosis relative to the total.
    - `count`: `Integer` - The absolute number of patients with this diagnosis.
    - `color`: `String` - A hex color code for the chart.

- **Data View:** `DepartmentMetrics` (Inferred)
- **Attributes:**
    - Likely contains performance metrics broken down by hospital department.

- **Data View:** `FinancialData` (Inferred from mock data)
- **Attributes:**
    - `month`: `String` - The month for the financial data.
    - `revenue`: `Decimal` - Total revenue for the period.
    - `expenses`: `Decimal` - Total expenses for the period.
    - `profit`: `Decimal` - Total profit for the period.

**Required Data Operations (CRUD):**
- **Create:** Not applicable. Data is generated by aggregating underlying records.
- **Read:** The dashboard reads aggregated data from the `/api/analytics` endpoint. It does not perform reads on raw data tables directly.
- **Update:** Not applicable.
- **Delete:** Not applicable.

**Evidence from Code:**
- **`components/analytics-dashboard.tsx`**: The core component that fetches and renders all analytics data. The `fetchData` function makes multiple calls to `/api/analytics` with different `metric` parameters (`kpis`, `patientVolume`, `diagnosisDistribution`, `departmentMetrics`).
- **State Variables**: The component's state (`kpis`, `patientVolumeData`, `diagnosisDistribution`, etc.) clearly defines the structure of the data being consumed.
- **Mock Data**: The presence of mock data for `vitalTrends`, `qualityMetrics`, `resourceUtilization`, and `financialData` strongly suggests the intended scope of the full dashboard, even if the API endpoints are not all implemented.

---

## Feature: Smart Documentation

**Description & User Flow:**
- This feature provides advanced tools for creating clinical documentation. Users can generate structured notes (like SOAP notes) by filling out a detailed form, transcribing voice recordings into text, or extracting medical information from pasted documents. The generated note can then be reviewed, edited, and saved to a patient's record. The feature also includes a system of templates to standardize different types of documentation.

**Inferred Data Model:**
- **Entity:** `ClinicalNote`
- **Attributes:**
    - `id`: `UUID` - Unique identifier for the clinical note.
    - `content`: `Text` - The full text of the generated or transcribed clinical note.
    - `note_type`: `String` - The type of note, likely linked to a template (e.g., 'SOAP Note', 'Progress Note').
    - `status`: `String` - The status of the note (e.g., 'draft', 'final', 'signed').
    - `patient_id`: `UUID` (Foreign Key) - A reference to the associated `Patient`.
    - `provider_id`: `UUID` (Foreign Key) - A reference to the `Profile` of the provider who authored the note.
    - `appointment_id`: `UUID` (Foreign Key, Optional) - A reference to the `Appointment` this note is associated with.
    - `structured_data`: `JSONB` - A JSON object to store the structured data used to generate the note (vitals, symptoms, diagnosis, etc.). This allows for both narrative text and queryable data.
- **Relationships:**
    - Belongs to one `Patient`.
    - Belongs to one `Profile` (Provider).
    - Can belong to one `Appointment`.

- **Entity:** `NoteTemplate`
- **Attributes:**
    - `id`: `String` - A unique identifier for the template (e.g., 'soap', 'progress').
    - `name`: `String` - The display name of the template (e.g., 'SOAP Note').
    - `type`: `String` - The category of the template (e.g., 'clinical', 'administrative').
    - `description`: `String` - A brief description of the template's purpose.
    - `fields`: `Array<String>` - A list of the required fields or sections for the template.
- **Relationships:**
    - Has many `ClinicalNotes` (conceptually, as a note is based on a template).

**Required Data Operations (CRUD):**
- **Create:** The primary function is to create new `ClinicalNote` records. This can be done by generating a note from a form, transcribing voice, or extracting from a document. The "Save to Record" button confirms this operation.
- **Read:** The system reads `NoteTemplate` data to display the list of available templates. It also implicitly needs to read patient data to associate the note with a patient.
- **Update:** While not explicitly shown, a real-world workflow would require updating notes (e.g., saving a draft and editing it later).
- **Delete:** No delete functionality is visible, but might be required for draft notes.

**Evidence from Code:**
- **`components/smart-documentation.tsx`**: This component is the main source of evidence. It contains the forms, state, and API calls for note generation.
- **State Variables**: The component's state (`patientName`, `chiefComplaint`, `symptoms`, `vitals`, `diagnosis`, etc.) defines the structured data that would populate a `ClinicalNote`.
- **API Calls**: The component makes `POST` requests to `/api/documentation` with different `type` payloads (`generate_soap_note`, `transcribe_voice`, `extract_medical_info`), indicating the various methods of creating note content.
- **`documentationTemplates` Array**: This hardcoded array provides the exact structure for the `NoteTemplate` entity.
- **`handleSaveNote` Function**: Although a placeholder, this function's existence confirms the intent to save the created note, implying a `Create` operation on a `ClinicalNote` entity.

---

## Feature: AI Clinical Decision Support

**Description & User Flow:**
- This feature provides AI-powered tools to assist clinicians in decision-making. Users can load a patient's data and then run various analyses, such as a comprehensive clinical assessment, a drug interaction check, or a request for diagnostic suggestions. The results are presented in a structured format, and the system handles asynchronous AI tasks by polling for their status.

**Inferred Data Model:**
- **Entity:** `AIAssessment`
- **Attributes:**
    - `id`: `UUID` - Unique identifier for the assessment.
    - `risk_level`: `String` - The AI-determined risk level for the patient (e.g., 'critical', 'high', 'medium', 'low').
    - `primary_concerns`: `Array<String>` - A list of the most significant issues identified by the AI.
    - `recommendations`: `Array<JSONB>` - A structured list of recommended actions, each with a `priority`, `action`, and `rationale`.
    - `differential_diagnosis`: `Array<JSONB>` - A list of potential diagnoses, each with a `condition`, `probability`, and `supporting_factors`.
    - `patient_id`: `UUID` (Foreign Key) - A reference to the `Patient` who was the subject of the assessment.
    - `source_data`: `JSONB` - A snapshot of the input data used for the assessment (symptoms, vitals, history) to ensure reproducibility.
- **Relationships:**
    - Belongs to one `Patient`.

- **Entity:** `AITask` (Supporting Entity)
- **Attributes:**
    - `id`: `UUID` - Unique identifier for the asynchronous task.
    - `status`: `String` - The current status of the task (e.g., 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED').
    - `output`: `JSONB` (Nullable) - The result of the completed task (e.g., the `AIAssessment` object).
    - `error`: `String` (Nullable) - Any error message if the task failed.
    - `task_type`: `String` - The type of task being run (e.g., 'clinical_assessment', 'drug_interaction').
- **Relationships:**
    - Can be linked to a `Patient` or `User` who initiated the task.

**Required Data Operations (CRUD):**
- **Create:** An `AIAssessment` record is created when an AI analysis is successfully completed. An `AITask` record is created every time a new analysis is initiated.
- **Read:** The system reads comprehensive data from a `Patient` and their related `MedicalHistory` and `Medications` to provide context for the AI. The UI polls the `AITask` entity by its ID to get status updates.
- **Update:** The `AITask` entity is updated as the background job progresses (e.g., status changes from 'IN_PROGRESS' to 'COMPLETED').
- **Delete:** No delete functionality is apparent.

**Evidence from Code:**
- **`components/clinical-ai-assistant.tsx`**: This is the primary file. It contains the logic for fetching patient data, initiating AI tasks, and displaying the results.
- **`useAITask` Hook**: This custom hook implements the polling logic for asynchronous tasks by repeatedly fetching `/api/tasks/{taskId}`, confirming the existence and role of the `AITask` entity.
- **API Calls**: The component makes `POST` requests to `/api/clinical-ai` with different `type` payloads (`clinical_assessment`, `drug_interaction`, `diagnostic_assistance`).
- **State and Props**: The structure of the `assessment` state variable and the data passed to the result display components perfectly outlines the attributes of the `AIAssessment` entity.

---

## Feature: Communication Hub

**Description & User Flow:**
- This feature serves as a central point for team collaboration. It includes a real-time messaging system for team communication, a task management system for assigning and tracking clinical and administrative tasks, a notification center for important alerts, and a team directory.

**Inferred Data Model:**
- **Entity:** `Message`
- **Attributes:**
    - `id`: `UUID` - Unique identifier for the message.
    - `content`: `Text` - The text content of the message.
    - `created_at`: `DateTime` - Timestamp when the message was created.
    - `sender_id`: `UUID` (Foreign Key) - A reference to the `Profile` of the sender.
    - `conversation_id`: `UUID` (Foreign Key) - A reference to the `Conversation` this message belongs to.
    - `message_type`: `String` - The type of message (e.g., 'text', 'system_alert').
- **Relationships:**
    - Belongs to one `Profile` (sender).
    - Belongs to one `Conversation`.

- **Entity:** `Conversation`
- **Attributes:**
    - `id`: `UUID` - Unique identifier for the conversation.
    - `name`: `String` (Nullable) - The name of the conversation or channel.
    - `is_group_conversation`: `Boolean` - Flag to indicate if it's a group chat or direct message.
- **Relationships:**
    - Has many `Messages`.
    - Has many `ConversationParticipants`.

- **Entity:** `ConversationParticipant` (Join Table)
- **Attributes:**
    - `conversation_id`: `UUID` (Foreign Key) - Reference to `Conversation`.
    - `profile_id`: `UUID` (Foreign Key) - Reference to `Profile`.
- **Relationships:**
    - Connects `Conversation` and `Profile`.

- **Entity:** `Task`
- **Attributes:**
    - `id`: `UUID` - Unique identifier for the task.
    - `title`: `String` - A brief title for the task.
    - `description`: `Text` - A detailed description of the task.
    - `status`: `String` - The current status of the task (e.g., 'pending', 'in_progress', 'completed').
    - `priority`: `String` - The urgency of the task (e.g., 'low', 'medium', 'high', 'urgent').
    - `due_date`: `Date` - The target completion date for the task.
    - `assigned_to_id`: `UUID` (Foreign Key) - A reference to the `Profile` of the assignee.
    - `patient_id`: `UUID` (Foreign Key, Optional) - A reference to a `Patient` if the task is patient-specific.
- **Relationships:**
    - Belongs to one `Profile` (assignee).
    - Can belong to one `Patient`.

- **Entity:** `Notification` (Inferred)
- **Attributes:**
    - `id`: `UUID` - Unique identifier for the notification.
    - `content`: `String` - The text of the notification.
    - `type`: `String` - The type of notification (e.g., 'alert', 'reminder', 'task_update').
    - `priority`: `String` - The severity of the notification (e.g., 'critical', 'info').
    - `is_read`: `Boolean` - Flag to indicate if the notification has been read.
    - `recipient_id`: `UUID` (Foreign Key) - A reference to the `Profile` receiving the notification.
- **Relationships:**
    - Belongs to one `Profile` (recipient).

**Required Data Operations (CRUD):**
- **Create:** Users can create new `Messages` and `Tasks` through the UI.
- **Read:** The component fetches lists of `Messages` and `Tasks`.
- **Update:** Users can update the `status` of a `Task`.
- **Delete:** No delete functionality is explicitly shown, but would be necessary for managing old messages or tasks.

**Evidence from Code:**
- **`components/communication-hub.tsx`**: This file contains the entire implementation for this feature.
- **Interfaces**: The `Message` and `Task` interfaces defined at the top of the file provide a clear schema for these entities.
- **API Calls**: The `fetchMessages`, `fetchTasks`, `sendMessage`, `createTask`, and `updateTaskStatus` functions demonstrate the full range of CRUD operations on the `messages` and `tasks` API endpoints.
- **UI Tabs**: The tabs for "Messages", "Tasks", "Notifications", and "Team" confirm the different data domains managed by this hub.

---

## Feature: User Settings

**Description & User Flow:**
- This feature allows users to manage their personal account settings. It is organized into tabs for Profile, Notifications, Security, Billing, and Preferences. Users can update their personal information, configure how they receive notifications, manage their password and security settings, view their subscription plan and billing history, and customize the application's appearance and behavior.

**Inferred Data Model:**
- **Entity:** `Profile` (Expanded)
- **Attributes:**
    - `id`: `UUID`
    - `first_name`: `String`
    - `last_name`: `String`
    - `email`: `String` (Unique)
    - `phone_number`: `String` (Nullable)
    - `avatar_url`: `String` (Nullable) - URL to the user's profile picture.
    - `bio`: `Text` (Nullable) - A short user biography.
    - `timezone`: `String` - The user's preferred timezone.

- **Entity:** `UserSetting`
- **Attributes:**
    - `profile_id`: `UUID` (Primary Key, Foreign Key) - A direct one-to-one link to the `Profile`.
    - `notification_preferences`: `JSONB` - Stores key-value pairs for notification settings (e.g., `{"email": true, "push": false}`).
    - `application_preferences`: `JSONB` - Stores settings like `theme` and `language`.
    - `privacy_preferences`: `JSONB` - Stores settings like `analytics_enabled`.
- **Relationships:**
    - Has a one-to-one relationship with `Profile`.

- **Entity:** `Subscription` (Inferred from Billing tab)
- **Attributes:**
    - `id`: `UUID` - Unique identifier for the subscription.
    - `profile_id`: `UUID` (Foreign Key) - The user who owns the subscription.
    - `plan_name`: `String` - The name of the subscription plan (e.g., 'Pro Plan').
    - `status`: `String` - The status of the subscription (e.g., 'active', 'canceled').
    - `next_billing_date`: `Date` - The date of the next payment.
- **Relationships:**
    - Belongs to one `Profile`.

- **Entity:** `Invoice` (Inferred from Billing tab)
- **Attributes:**
    - `id`: `UUID` - Unique identifier for the invoice.
    - `subscription_id`: `UUID` (Foreign Key) - The subscription this invoice is for.
    - `amount`: `Decimal` - The amount billed.
    - `invoice_date`: `Date` - The date the invoice was issued.
    - `status`: `String` - The payment status (e.g., 'paid', 'due').
- **Relationships:**
    - Belongs to one `Subscription`.

**Required Data Operations (CRUD):**
- **Create:** New `Subscription` records are created when a user signs up for a plan.
- **Read:** The settings page reads all the user's current settings from their `Profile` and `UserSetting` records. It also reads `Subscription` and `Invoice` history.
- **Update:** The primary function is to update `Profile` and `UserSetting` records. Users can also update their payment method and change their subscription plan.
- **Delete:** The "Delete Account" functionality implies deleting a user's `Profile` and all associated data. The "Cancel Subscription" option implies updating a `Subscription` status or deleting it.

**Evidence from Code:**
- **`app/(dashboard)/settings/page.tsx`**: This file contains the complete UI and state management for all settings tabs.
- **State Variables**: The `notifications` state object directly maps to the `notification_preferences` JSONB structure.
- **UI Tabs and Fields**: Each tab ("Profile", "Notifications", "Security", "Billing", "Preferences") and its corresponding input fields directly inform the attributes of the `Profile` and `UserSetting` entities. The "Billing" tab, with its "Current Plan" and "Billing History" sections, provides strong evidence for the `Subscription` and `Invoice` entities.

---

## Feature: Team Management

**Description & User Flow:**
- This feature allows administrators to manage team members, their roles, and pending invitations. It provides a directory of all team members with their status and activity, a list of pending invitations, and an overview of the different roles and their associated permissions within the system.

**Inferred Data Model:**
- **Entity:** `Profile` (Further Expanded)
- **Attributes:**
    - `role_id`: `UUID` (Foreign Key) - A reference to the `Role` assigned to the user.
    - `status`: `String` - The user's current presence status (e.g., 'online', 'away', 'offline').
    - `last_active`: `DateTime` - Timestamp of the user's last activity.
    - `join_date`: `Date` - The date the user joined the team.

- **Entity:** `Role`
- **Attributes:**
    - `id`: `UUID` - Unique identifier for the role.
    - `name`: `String` - The name of the role (e.g., 'Owner', 'Manager', 'Engineer').
    - `description`: `String` - A brief description of the role's responsibilities.
    - `permissions`: `Array<String>` - A list of permissions granted to this role (e.g., 'admin', 'billing', 'workflows').
- **Relationships:**
    - Has many `Profiles`.

- **Entity:** `Invitation`
- **Attributes:**
    - `id`: `UUID` - Unique identifier for the invitation.
    - `email`: `String` - The email address of the person being invited.
    - `role_id`: `UUID` (Foreign Key) - The `Role` to be assigned upon accepting the invitation.
    - `invited_by_id`: `UUID` (Foreign Key) - A reference to the `Profile` of the person who sent the invitation.
    - `status`: `String` - The status of the invitation (e.g., 'pending', 'accepted', 'expired').
    - `created_at`: `DateTime` - Timestamp when the invitation was sent.
- **Relationships:**
    - Belongs to one `Role`.
    - Belongs to one `Profile` (the inviter).

**Required Data Operations (CRUD):**
- **Create:** Users can create new `Invitations` to add new members to the team.
- **Read:** The system reads all `Profiles` (team members), `Invitations`, and `Roles` to populate the different tabs of the interface.
- **Update:** A user's `Role` can be edited. An `Invitation` status is updated when it's accepted or expires.
- **Delete:** Users can remove team members (delete a `Profile` or change its status) and cancel `Invitations`.

**Evidence from Code:**
- **`app/(dashboard)/team/page.tsx`**: This file contains the complete UI and mock data for the team management feature.
- **Mock Data**: The `teamMembers`, `invitations`, and `roles` arrays at the top of the file provide a detailed schema for the `Profile` (expanded), `Invitation`, and `Role` entities, including their attributes and relationships.
- **UI Components**: The UI for displaying team members, their statuses, roles, and the lists of invitations and roles directly reflects the structure of the inferred data models. The "Invite Member" button and the dropdown actions ("Edit Role", "Remove Member", "Cancel Invitation") confirm the CRUD operations.

---

## Feature: Workflow Management

**Description & User Flow:**
- This feature allows users to create, manage, and monitor automation workflows. The main page displays a list of all configured workflows with their status, run history, and performance metrics. It also provides a view of recent workflow executions (runs) and a place for managing workflow templates.

**Inferred Data Model:**
- **Entity:** `Workflow`
- **Attributes:**
    - `id`: `UUID` - Unique identifier for the workflow.
    - `name`: `String` - The name of the workflow.
    - `description`: `Text` - A description of what the workflow does.
    - `status`: `String` - The current status of the workflow (e.g., 'active', 'paused', 'error').
    - `definition`: `JSONB` - The actual definition of the workflow's steps, triggers, and actions.
    - `created_by_id`: `UUID` (Foreign Key) - A reference to the `Profile` of the user who created it.
- **Relationships:**
    - Has many `WorkflowRuns`.
    - Belongs to one `Profile` (creator).

- **Entity:** `WorkflowRun`
- **Attributes:**
    - `id`: `UUID` - Unique identifier for a specific execution of a workflow.
    - `workflow_id`: `UUID` (Foreign Key) - A reference to the `Workflow` that was executed.
    - `status`: `String` - The outcome of the run (e.g., 'running', 'success', 'failed').
    - `started_at`: `DateTime` - Timestamp when the run began.
    - `ended_at`: `DateTime` (Nullable) - Timestamp when the run finished.
    - `duration_ms`: `Integer` - The total execution time in milliseconds.
    - `logs`: `Text` - Detailed logs generated during the execution.
    - `output`: `JSONB` (Nullable) - Any data produced as a result of the run.
- **Relationships:**
    - Belongs to one `Workflow`.

- **Entity:** `WorkflowTemplate` (Inferred)
- **Attributes:**
    - `id`: `UUID` - Unique identifier for the template.
    - `name`: `String` - The name of the template.
    - `description`: `Text` - A description of the template's purpose.
    - `definition`: `JSONB` - The predefined workflow definition that can be used to create new workflows.
- **Relationships:**
    - Can be used to create many `Workflows`.

**Required Data Operations (CRUD):**
- **Create:** Users can create new `Workflows`, potentially from `WorkflowTemplates`. Each execution automatically creates a new `WorkflowRun` record.
- **Read:** The system reads all `Workflows` and `WorkflowRuns` to populate the dashboards.
- **Update:** Users can "Pause" and "Resume" workflows, which updates their `status`.
- **Delete:** Users can delete `Workflows`.

**Evidence from Code:**
- **`app/(dashboard)/workflows/page.tsx`**: Contains the complete UI and mock data for this feature.
- **Mock Data**: The `workflows` and `recentRuns` arrays provide a clear and detailed schema for the `Workflow` and `WorkflowRun` entities, including their attributes and relationships.
- **UI Components**: The "All Workflows" and "Recent Runs" tabs and their corresponding tables and cards directly map to the inferred data models. The various buttons ("New Workflow", "Pause", "Resume", "Delete") confirm the CRUD operations.
