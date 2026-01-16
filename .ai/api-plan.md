# REST API Plan

This plan outlines the RESTful API endpoints for the WeeCare application. Given the tech stack (Astro + Supabase), the API layer will primarily serve as a structured interface for the frontend to interact with the Supabase database, while allowing for future extensions or third-party integrations (though not currently required by the PRD).

## 1. Resources

| Resource | Database Table | Description |
| :--- | :--- | :--- |
| **Child** | `public.children` | Child profiles (Name, DOB, Allergies) |
| **Doctor** | `public.doctors` | Medical professional contacts & personal opinions |
| **Medication** | `public.medications` | Prescription and medication history for a specific child |
| **Visit** | `public.visits` | Doctor appointment logs and diagnoses |

---

## 2. Endpoints

### 2.1 Child Profiles

- **GET `/api/children`**
  - **Description**: Retrieve all children profiles for the authenticated user.
  - **Query Parameters**: `sort` (e.g., `name:asc`, `created_at:desc`)
  - **Success**: `200 OK` - Array of Child objects.
  - **Error**: `401 Unauthorized`.

- **POST `/api/children`**
  - **Description**: Create a new child profile.
  - **Request Payload**:
    ```json
    { "name": "string", "dob": "YYYY-MM-DD", "allergies": ["string"], "photo_url": "string?" }
    ```
  - **Success**: `201 Created` - Created Child object.
  - **Error**: `400 Bad Request` (Missing name/dob), `401 Unauthorized`.

- **PATCH `/api/children/:id`**
  - **Description**: Update an existing child profile.
  - **Request Payload**: Partial Child object.
  - **Success**: `200 OK` - Updated Child object.
  - **Error**: `404 Not Found`.

- **DELETE `/api/children/:id`**
  - **Description**: Delete a child profile and all associated records (Cascade).
  - **Success**: `204 No Content`.

---

### 2.2 Doctors & Contacts

- **GET `/api/doctors`**
  - **Description**: List all doctor contacts with personal notes/opinions.
  - **Query Parameters**: `search` (name/specialty), `sort`.
  - **Success**: `200 OK`.

- **POST `/api/doctors`**
  - **Description**: Add a new doctor contact.
  - **Request Payload**:
    ```json
    { "name": "string", "specialty": "string", "phone": "string", "email": "string", "address": "string", "notes": "string" }
    ```
  - **Success**: `201 Created`.

- **GET `/api/doctors/:id`**
  - **Description**: Get detailed information and personal opinions for a specific doctor.
  - **Success**: `200 OK`.

---

### 2.3 Medical Records (Visits & Medications)

#### Visits
- **GET `/api/children/:child_id/visits`**
  - **Description**: Retrieve medical visit history for a specific child.
  - **Query Parameters**: `page`, `limit`, `sort` (default `date:desc`).
  - **Success**: `200 OK` - Paged array of Visit objects.

- **POST `/api/children/:child_id/visits`**
  - **Description**: Log a new doctor visit.
  - **Request Payload**:
    ```json
    { "doctor_id": "uuid?", "date": "YYYY-MM-DD", "reason": "string", "diagnosis": "string", "notes": "string" }
    ```
  - **Success**: `201 Created`.

#### Medications
- **GET `/api/children/:child_id/medications`**
  - **Description**: Retrieve active and historical medications for a child.
  - **Query Parameters**: `active_only` (boolean).
  - **Success**: `200 OK`.

- **POST `/api/children/:child_id/medications`**
  - **Description**: Add a medication to a child's record.
  - **Request Payload**:
    ```json
    { "name": "string", "dosage": "string", "frequency": "string", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD?", "active": "boolean" }
    ```
  - **Success**: `201 Created`.

---

## 3. Authentication and Authorization

### Mechanism
- **Bearer Token (JWT)**: The API uses Supabase's built-in authentication. All requests must include the `Authorization: Bearer <JWT>` header.

### Authorization
- **Row Level Security (RLS)**: The API relies on the database's RLS policies mentioned in the `db-plan.md`. This ensures that even if a user knows another child's ID, they cannot retrieve information unless they are the record owner (`auth.uid() = user_id`).
- **Cascade Deletes**: Deleting a user or physical profile automatically cleans up associated medical history via database constraints.

---

## 4. Validation and Business Logic

### Validation Conditions
1. **Children**:
   - `name`: Required, non-empty.
   - `dob`: Must be a valid date in the past.
2. **Medications**:
   - `start_date`: Required.
   - `end_date`: Must be after or equal to `start_date` if provided.
3. **Visits**:
   - `date`: Required.
   - `child_id`: Must exist and belong to the user.

### Business Logic Implementation
- **Hierarchical Access**: While top-level endpoints exist for management, the PRD emphasizes a child-centric view. Business logic (like calculating age or grouping active medications) is handled at the **Application Layer (Astro/React)** by consuming these granular REST endpoints.
- **Soft vs. Hard Active State**: Medications use an `active` flag to differentiate between current treatment and history without deleting data.
- **Opinion Management**: Doctor "opinions" are integrated into the `doctors.notes` field to simplify the schema while fulfilling the PRD's requirement for doctor reviews.
