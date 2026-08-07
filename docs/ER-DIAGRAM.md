# Invenger VMS — Entity Relationship Diagram

This ER diagram reflects the current PostgreSQL schema defined in `prisma/schema.prisma`.

## ER Diagram

```mermaid
erDiagram
    USER ||--o{ VISITOR : "creates (createdBy)"

    USER {
        string id PK
        string name
        string email UK
        string password
        enum role "ADMIN | SECURITY"
        boolean mustChangePassword
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    VISITOR {
        string id PK
        string visitorCode UK
        string fullName
        string phone
        string company "nullable"
        string purpose
        string personToMeet
        string idProofType "nullable"
        string idProofNumber "nullable"
        string vehicleNumber "nullable"
        datetime checkInTime
        datetime checkOutTime "nullable"
        enum status "CHECKED_IN | CHECKED_OUT"
        string createdBy FK
        datetime createdAt
        datetime updatedAt
    }

    EMPLOYEE {
        string id PK
        string employeeCode UK
        string fullName
        string email "nullable, UK"
        string phone
        string department
        string designation
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }
```

## Relationships

| From | To | Type | Description |
|------|----|------|-------------|
| User | Visitor | 1 : N | One user can create many visitors. `createdBy` is a foreign key. If a user still has visitors, that user cannot be deleted (`onDelete: Restrict`). |
| Employee | — | standalone | Employee is a separate directory table. Not linked to Visitor yet. `personToMeet` is stored as text. |

## Enums

- **Role:** `ADMIN`, `SECURITY`
- **VisitorStatus:** `CHECKED_IN`, `CHECKED_OUT`

## Backend review status

**Correct / safe for current features:**
- Primary keys and unique fields (`email`, `visitorCode`, `employeeCode`)
- User → Visitor foreign key with Restrict (protects visitor history)
- Optional fields match app rules (`company`, ID proof, employee email)
- Password recovery is admin-initiated temporary password reset (no self-service forgot-password)

**Not a bug (by design for now):**
- Employee is not linked to Visitor (`personToMeet` is free text)

**Future improvement (not broken today):**
- Add optional `Visitor.employeeId` → `Employee.id` so “Person to Meet” comes from Employees
- Add audit/log tables if management requires history reports
