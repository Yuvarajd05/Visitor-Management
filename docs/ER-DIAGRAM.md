# Invenger VMS — Entity Relationship Diagram

This ER diagram reflects the current PostgreSQL schema defined in `prisma/schema.prisma`.

## ER Diagram

```mermaid
erDiagram
    USER ||--o{ VISITOR : "creates (createdBy)"
    USER ||--o{ PASSWORD_RESET_TOKEN : "has"

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

    PASSWORD_RESET_TOKEN {
        string id PK
        string tokenHash UK
        string userId FK
        datetime expiresAt
        datetime usedAt "nullable"
        datetime createdAt
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
| User | PasswordResetToken | 1 : N | One user can have many reset tokens. If a user is deleted, their tokens are deleted too (`onDelete: Cascade`). |
| Employee | — | standalone | Employee is a separate directory table. Not linked to Visitor yet. `personToMeet` is stored as text. |

## Enums

- **Role:** `ADMIN`, `SECURITY`
- **VisitorStatus:** `CHECKED_IN`, `CHECKED_OUT`

## Backend review status

**Correct / safe for current features:**
- Primary keys and unique fields (`email`, `visitorCode`, `employeeCode`, `tokenHash`)
- User → Visitor foreign key with Restrict (protects visitor history)
- Password reset tokens store hashed token, not plain text
- Optional fields match app rules (`company`, ID proof, employee email)

**Not a bug (by design for now):**
- Employee is not linked to Visitor (`personToMeet` is free text)
- Forgot-password email is optional; Admin reset is the main flow

**Future improvement (not broken today):**
- Add optional `Visitor.employeeId` → `Employee.id` so “Person to Meet” comes from Employees
- Add audit/log tables if management requires history reports
