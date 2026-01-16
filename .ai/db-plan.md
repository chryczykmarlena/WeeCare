# Database Plan

## Overview
The database uses PostgreSQL via Supabase. It relies on the `auth.users` table for user management and uses UUIDs for primary keys. Row Level Security (RLS) is enabled on all tables to ensure users can only access their own data.

## Tables

### 1. `public.children`
Stores profiles for each child.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PK, default `uuid_generate_v4()` | Unique ID for the child |
| `user_id` | uuid | FK -> `auth.users(id)`, Not Null | The parent/guardian user ID |
| `name` | text | Not Null | Child's name |
| `dob` | date | Not Null | Date of birth |
| `allergies` | text[] | Default `{}` | Array of allergy names |
| `photo_url` | text | | Optional profile picture URL |
| `created_at` | timestamp | Default `now()`, Not Null | Record creation timestamp |

### 2. `public.doctors`
Directory of medical professionals.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PK, default `uuid_generate_v4()` | Unique ID for the doctor |
| `user_id` | uuid | FK -> `auth.users(id)`, Not Null | The user who added this contact |
| `name` | text | Not Null | Doctor's name |
| `specialty` | text | | Medical specialty (e.g., Pediatrician) |
| `phone` | text | | Contact phone number |
| `email` | text | | Contact email address |
| `address` | text | | Physical address of the clinic |
| `notes` | text | | User's personal notes/opinions |
| `created_at` | timestamp | Default `now()`, Not Null | Record creation timestamp |

### 3. `public.medications`
Tracks medications for children.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PK, default `uuid_generate_v4()` | Unique ID for the record |
| `child_id` | uuid | FK -> `public.children(id)`, Not Null | The child taking the medication |
| `user_id` | uuid | FK -> `auth.users(id)`, Not Null | Denormalized owner ID for RLS |
| `name` | text | Not Null | Name of the medication |
| `dosage` | text | | Amount to take (e.g., "5ml") |
| `frequency` | text | | How often (e.g., "Daily") |
| `start_date` | date | Not Null | When the medication started |
| `end_date` | date | | When it ended (optional) |
| `active` | boolean | Default `true` | Status flag |
| `created_at` | timestamp | Default `now()`, Not Null | Record creation timestamp |

### 4. `public.visits`
Logs doctor appointments.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PK, default `uuid_generate_v4()` | Unique ID for the visit |
| `child_id` | uuid | FK -> `public.children(id)`, Not Null | The child who visited |
| `doctor_id` | uuid | FK -> `public.doctors(id)` | The doctor seen (optional) |
| `user_id` | uuid | FK -> `auth.users(id)`, Not Null | Denormalized owner ID for RLS |
| `date` | date | Not Null | Date of the visit |
| `reason` | text | | Reason for the visit |
| `diagnosis` | text | | Medical diagnosis |
| `notes` | text | | Additional notes/instructions |
| `created_at` | timestamp | Default `now()`, Not Null | Record creation timestamp |

## Relationships
- **Children**: Belongs to User.
- **Doctors**: Belongs to User.
- **Medications**: Belongs to Child (and User).
- **Visits**: Belongs to Child (and User), optionally links to Doctor.

## Security (RLS Policies)

RLS is enabled for all tables. The general policy pattern is:
- **SELECT**: Users can view records where `auth.uid() = user_id`.
- **INSERT**: Users can create records where `auth.uid() = user_id`.
- **UPDATE**: Users can update records where `auth.uid() = user_id`.
- **DELETE**: Users can delete records where `auth.uid() = user_id`.

## Storage Buckets

### `avatars`
- **Public Access**: Enabled for reading images.
- **Upload**: Authenticated users only.

### `medical-records` (Planned)
- **Private Access**: Only the owner (`auth.uid() = owner`) can view files.
- **Upload**: Limited to owner.
