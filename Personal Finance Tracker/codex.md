# Personal Finance Tracker - Development Rules

## 1. Project Identity & Stack
- **Project Name:** Personal Finance Tracker
- **Frontend:** React (Stable), TanStack Query, Zustand, Tailwind CSS, Recharts.
- **Backend:** spring Bote (Web API), Entity Framework Core.
- **Database:** PostgreSQL (using UUIDs for all Primary Keys).
- **Core Principle:** Clean, calm, finance-focused UI. Accuracy and security are top priorities.

## 2. Backend Architecture Rules (ASP.NET Core)
- **Pattern:** Follow the Controller-Service-Repository pattern.
- **DTOs:** Always use Data Transfer Objects (DTOs) for API requests and responses. Never expose Database Entities directly to the frontend.
- **Security:** - Every database query MUST be scoped by `userId`. 
    - Use `Guid` (UUID) for all IDs.
    - Password hashing: Use BCrypt.
    - Authentication: JWT-based.
- **Naming:** PascalCase for C# classes and methods, camelCase for JSON properties.

## 3. Frontend Architecture Rules (React)
- **Directory Structure:** Follow the feature-based structure: `/src/features/{featureName}/components`.
- **State Management:**
    - Use **TanStack Query** for all server-side state (fetching transactions, reports).
    - Use **Zustand** for global UI state (modals, active filters).
- **Forms:** Use `react-hook-form` with `Zod` for schema validation.
- **Validation Rules:**
    - Transactions: Amount > 0, Date required, Account/Category required.
    - Goals: Target amount > 0.
- **Naming:** PascalCase for components, camelCase for hooks and variables.

## 4. Database & Schema Rules (PostgreSQL)
- **Primary Keys:** Use `uuid` with `gen_random_uuid()`.
- **Naming:** Table names and column names should be `snake_case`.
- **Integrity:** - Transactions must affect Account balances (balance logic should happen in the Service layer within a transaction block).
    - Transfers must record a source account and a destination account.

## 5. UI/UX Design System
- **Colors:** Primary: Indigo/Deep Blue (#3F51B5), Success: Green (#4CAF50), Danger: Red (#F44336).
- **Typography:** Inter or System Sans-Serif.
- **Components:** - Use "Summary Cards" for Dashboard numbers.
    - Modals for all "Add/Edit" flows to keep the user context.
- **Responsiveness:** Use a Sidebar for Desktop and a Bottom Navigation Bar or Hamburger menu for Mobile.

## 6. Implementation Milestones (Build Order)
1. Auth (Sign up/Login) + App Shell.
2. Account & Category Management.
3. Transaction CRUD (The core engine).
4. Dashboard Widgets (Calculated from transactions).
5. Budgets & Goals (Progress tracking).
6. Recurring Transactions (Background jobs/schedulers).