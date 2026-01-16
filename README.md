# WeeCare - Child Medical History Tracker

WeeCare is a comprehensive, secure, and user-friendly application designed to help parents and guardians centralize and manage their children's medical history. From doctor appointments and prescriptions to contact details and personal notes on medical professionals, WeeCare ensures all vital information is accessible in one place.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-In%20Development-yellow.svg)

## 🎯 Goals & Objectives

- **Centralization**: Keep all doctor appointments, prescriptions, and medical records for multiple children in a single, organized dashboard.
- **Personalization**: Store personal notes and opinions about doctors and clinics.
- **Accessibility**: Provide quick and easy web access to critical medical history whenever needed.

## ✨ Features

### ✅ Implemented
- **Authentication**: Secure email/password login and registration using Supabase Auth.
- **Child Profiles**: 
  - Create and manage profiles for multiple children.
  - Track basic details (Name, DOB, Allergies).
  - Calculate age automatically.
  - **Safety**: Delete profiles with confirmation dialogs.
- **Medical Records**:
  - **Dashboard**: Individual dashboard for each child.
  - **Visits Log**: Record doctor visits with dates, reasons, diagnoses, and notes.
  - **Medication Tracker**: Manage active and past medications includes dosages and frequencies.
- **Doctors & Contacts Directory**:
  - Manage a contact list of medical professionals.
  - Store details like specialty, phone, email, address, and personal notes.
  - Direct call/email actions from the interface.

### 🚀 Planned / In Progress
- **Document Storage**: Upload and secure photos/PDFs of lab results and prescriptions.
- **Search & Filtering**: Advanced filtering for medical history.

## 🛠️ Tech Stack

- **Framework**: [Astro 5](https://astro.build/) (Server-Side Rendering enabled)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix Primitives)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- **Deployment**: Vercel (Adapter configured)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- Node.js (v18 or higher)
- npm, pnpm, or yarn
- A Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/weecare.git
   cd weecare
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   PUBLIC_SUPABASE_URL=your_supabase_project_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   Run the content of `supabase_schema.sql` in your Supabase SQL Editor to verify the database schema and Row Level Security (RLS) policies.

5. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:4321](http://localhost:4321) in your browser.

## 📂 Project Structure

```
/src
  /components    # React UI components (Forms, Lists, Shadcn primitives)
  /layouts       # Astro application layouts
  /lib           # Utilities (Supabase client, helpers)
  /pages         # File-based routing
    /children    # Child profile & dashboard routes
    /doctors     # Doctor directory routes
    index.astro  # Landing/Home page
  styles/        # Global CSS and Tailwind directives
```

## 🔒 Security & Privacy

WeeCare leverages **Supabase Auth** and **Row Level Security (RLS)** within PostgreSQL.
- **Data Isolation**: Users can only access and modify data belonging to their own account.
- **Secure Access**: All API requests are authenticated and authorized at the database level.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
