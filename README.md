# AI-Powered EHR Dashboard

This is a comprehensive, production-ready Electronic Health Record (EHR) dashboard built with a modern, full-stack technology set. The application provides healthcare providers with a seamless user experience for managing patient records, leveraging AI for clinical decision support, and streamlining documentation.

## Core Features

-   **Patient Management Hub**: A central dashboard for viewing, searching, and managing patient records.
-   **AI-Powered Clinical Decision Support**: Real-time risk assessment, diagnostic assistance, and drug interaction checking powered by Google Gemini.
-   **Advanced Data Visualization**: A dedicated analytics section with interactive charts for clinical and operational metrics.
-   **Smart Documentation System**: AI-assisted tools for generating clinical notes and voice-to-text transcription.
-   **Secure & Compliant**: The architecture is designed with security in mind, leveraging Supabase for authentication and a detailed data schema for auditing.

## Technical Stack

-   **Framework**: Next.js 14+ (App Router)
-   **Language**: TypeScript
-   **Backend**: Node.js with Next.js API Routes and a service-layer architecture.
-   **Database**: Supabase (PostgreSQL)
-   **ORM**: Prisma
-   **Authentication**: Supabase Auth (Google OAuth)
-   **AI Integration**: Vercel AI SDK & Google Gemini
-   **Styling**: Tailwind CSS
-   **UI Components**: Shadcn/UI

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   Node.js (v18 or later)
-   pnpm (or your preferred package manager)
-   A Supabase account with a new project created.
-   A Google Cloud project with OAuth 2.0 credentials.
-   A Google Gemini API key.

### 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Install Dependencies

Install the project dependencies using `pnpm`:

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root of your project by copying the example file:

```bash
cp .env.example .env.local
```

Now, open `.env.local` and add your credentials. You will need to get these from your Supabase project dashboard, Google Cloud Console, and your Google AI account.

```
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url

# Supabase Anon Key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Supabase Database Connection String (for Prisma)
# Go to your Supabase project -> Settings -> Database -> Connection string
DATABASE_URL=your-supabase-pooled-connection-string

# Supabase Database Connection String (for Prisma migrations)
DATABASE_URL_NON_POOLING=your-supabase-direct-connection-string

# Google OAuth Credentials (for Supabase Auth)
# Go to your Google Cloud Console -> APIs & Services -> Credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Gemini API Key
GOOGLE_GEMINI_API_KEY=your-google-gemini-api-key
```

### 4. Set Up and Seed the Database

This project uses Prisma to manage the database schema. Once your `DATABASE_URL` is correctly set, run the following commands to create the tables and populate them with sample data.

```bash
# 1. Apply database migrations to create the table structure
npx prisma migrate dev

# 2. Seed the database with sample data
pnpm seed
```

### 5. Run the Development Server

You are now ready to run the application. Start the development server with the following command:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser. You will be redirected to the login page where you can sign in using the "Continue with Google" button.

## Project Structure

-   `/app`: Contains the application's routes and pages, following the Next.js App Router convention.
    -   `/api`: Contains all backend API route handlers.
-   `/components`: Contains reusable React components.
-   `/lib`: Contains utility functions and client configurations.
    -   `/supabase`: Supabase client setup for client, server, and middleware.
    -   `/services`: Contains the business logic for each data model.
-   `/prisma`: Contains the Prisma schema (`schema.prisma`) and migration files.
-   `/styles`: Contains global CSS styles.
-   `/public`: Contains static assets like images and fonts.

## API Overview

The backend is built with a service-layer architecture and provides a comprehensive RESTful API for all major resources.

-   **Authentication**: Handled by Supabase Auth via the `/login` page and `/auth/callback` route.
-   **Core Resources**:
    -   `/api/patients`: CRUD for patients.
    -   `/api/appointments`: CRUD for appointments.
    -   `/api/tasks`: CRUD for tasks.
    -   `/api/departments`: CRUD for departments.
    -   `/api/conversations`: CRUD for conversations.
-   **Nested Resources**: Many resources are nested logically under their parent.
    -   `/api/patients/{patientId}/medical-history`: CRUD for a patient's medical history.
    -   `/api/patients/{patientId}/clinical-notes`: CRUD for a patient's clinical notes.
    -   `/api/patients/{patientId}/encounters`: CRUD for a patient's encounters.
    -   `/api/patients/{patientId}/medications`: CRUD for a patient's medications.
    -   `/api/patients/{patientId}/allergies`: CRUD for a patient's allergies.
    -   `/api/patients/{patientId}/vital-signs`: CRUD for a patient's vital signs.
    -   `/api/departments/{departmentId}/beds`: CRUD for beds within a department.
    -   `/api/conversations/{conversationId}/messages`: For sending messages in a conversation.