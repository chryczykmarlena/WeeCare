# Testing Plan - WeeCare

This document outlines the proposed strategy for introducing automated testing to the WeeCare application. This plan focuses on establishing a "testing pyramid" that provides maximum confidence with sustainable maintenance.

## 1. Testing Strategy: The Pyramid

We will use a multi-layered approach to ensure reliability from individual logic to complex user journeys.

| Layer | Tool | Purpose | Coverage Goal |
| :--- | :--- | :--- | :--- |
| **Unit Tests** | Vitest | Test business logic and helper functions (e.g., age calculation, date formatting). | 80%+ |
| **Component Tests** | Vitest + React Testing Library | Test individual React components (e.g., forms, badges) in isolation. | Key UI units |
| **E2E Tests** | Playwright | Test full user flows (Login, Child creation, Logging records) and check Supabase RLS. | All critical flows |

---

## 2. Selected Tools

### [Vitest](https://vitest.dev/)
- **Why**: Native support for Vite (which Astro uses), fast execution, and modern features.
- **Usage**: Perfect for testing `calculateAge` logic in `ChildrenList.tsx` or data transformations throughout the app.

### [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **Why**: The gold standard for testing React components by focusing on user behavior rather than implementation details.
- **Usage**: Used in tandem with Vitest to test component rendering, user interactions, and specific form logic in isolation.

### [Playwright](https://playwright.dev/)
- **Why**: Reliable, fast, and handles modern web features (shadow DOM, async hydration) perfectly. Excellent for testing cross-page navigation.
- **Key Use Case**: Verifying that security works—ensuring that User A cannot access `/children/[user_b_id]`.

---

## 3. High-Priority Test Cases

### 🏠 Dashboard & Navigation
- **Home Links**: Verify that "Manage Children" and "Doctors & Contacts" buttons navigate to correct pages.
- **Sign Out**: Verify user is redirected back to login and session is cleared.

### 🔐 Authentication & Access Control
- **Registration**: User can sign up and is redirected to login.
- **Login**: User can log in and session persists.
- **Security (RLS)**: Authenticated users can only see their own children/doctors. Unauthenticated users are redirected to `/login`.

### 👶 Child Management
- **Empty State**: Verify "No children added yet" message appears for new accounts.
- **Add Child**: Submitting the form with valid data adds a new card.
- **Validation**: Ensure form cannot be submitted with empty Name or DOB.
- **Delete Child**: Profile is removed after confirming the AlertDialog.
- **Calculations**: Ensure `calculateAge` correctly handles leap years and various birth dates (Unit test).

### 🩺 Medical Records
- **Visit Logging**: Adding a visit shows up in the child's dashboard history (timeline view).
- **Medication Management**: Verify "Active" status toggle correctly updates the UI badges.
- **Overview Sync**: Ensure recent visits and medication summaries on the "Overview" tab match the full history tabs.

### 👨‍⚕️ Doctors & Contacts
- **Directory**: Adding/Editing a doctor updates the contact card in the list.
- **Communication Links**: Verify that Phone and Email icons have correct `tel:` and `mailto:` URIs.
- **Notes Visibility**: Ensure personal opinions/notes are displayed on the doctor's card.
- **Delete Doctor**: Contact is removed after confirmation.

---

## 4. Implementation Phases

| Phase | Milestone | Description |
| :--- | :--- | :--- |
| **Phase 1** | Foundation | Install tools (Vitest, Playwright) and implement basic unit tests for helpers. |
| **Phase 2** | Critical Flows (E2E) | Implement E2E tests for Login and the "Happy Path" of adding a child. |
| **Phase 3** | Security Validation | Add "Negative Tests" to verify that RLS blocks unauthorized data access. |
| **Phase 4** | Component Coverage | Add tests for complex forms and dashboard interactions. |

---

## 5. Next Steps for Implementation

1. **User Approval**: Review this strategy and confirm the tool choices.
2. **Infrastructure**: Set up a test command (`npm test`) and configure a test environment (dummy Supabase project or mocked services).
3. **Execution**: Start with Phase 1.
