# Job Portal Database Schema (PostgreSQL)

This schema supports a **Job Portal Application**, handling users, job postings, applications, saved jobs, and notifications.

---

## Enum Types

Enums ensure only valid values are stored.

- **user_role** → `seeker`, `employer`, `admin`
- **job_types** → `full-time`, `part-time`, `contract`, `internship`
- **application_status** → `applied`, `reviewed`, `rejected`, `hired`
- **notification_status** → `read`, `unread`

---

## Tables Overview

### 1. Users

Stores basic user authentication and role info.

| Column   | Type        | Notes                           |
| -------- | ----------- | ------------------------------- |
| id       | IDENTITY PK | Unique user ID                  |
| name     | VARCHAR     | User's full name                |
| email    | VARCHAR     | Unique email                    |
| password | VARCHAR     | Hashed password                 |
| role     | ENUM        | `seeker` / `employer` / `admin` |

---

### 2. Job Seeker Profile

Extra info for job seekers.

| Column     | Type                  | Notes                |
| ---------- | --------------------- | -------------------- |
| user_id    | INT PK, FK → users.id | Links to users       |
| skills     | TEXT                  | Skills summary       |
| education  | TEXT                  | Education background |
| experience | TEXT                  | Work history         |
| resume_url | TEXT                  | Resume file link     |

---

### 3. Employer Profile

Extra info for employers (companies).

| Column       | Type                  | Notes             |
| ------------ | --------------------- | ----------------- |
| user_id      | INT PK, FK → users.id | Links to users    |
| company_name | VARCHAR               | Company name      |
| description  | TEXT                  | About the company |
| industry     | VARCHAR               | Industry sector   |
| logo_url     | TEXT                  | Company logo      |

---

### 4. Jobs

Job postings by employers.

| Column       | Type              | Notes              |
| ------------ | ----------------- | ------------------ |
| id           | IDENTITY PK       | Job ID             |
| employer_id  | INT FK → users.id | Posted by employer |
| title        | VARCHAR           | Job title          |
| description  | TEXT              | Job details        |
| requirements | TEXT              | Job requirements   |
| location     | VARCHAR           | Job location       |
| salary_range | VARCHAR           | Salary range       |
| job_type     | ENUM              | Job type           |
| created_at   | TIMESTAMP         | Default: now       |

---

### 5. Applications

Tracks seekers applying to jobs.

| Column     | Type              | Notes            |
| ---------- | ----------------- | ---------------- |
| id         | IDENTITY PK       | Application ID   |
| job_id     | INT FK → jobs.id  | Applied job      |
| seeker_id  | INT FK → users.id | Applicant        |
| status     | ENUM              | Default: applied |
| created_at | TIMESTAMP         | Default: now     |

---

### 6. Saved Jobs

Jobs bookmarked by seekers.

| Column     | Type              | Notes        |
| ---------- | ----------------- | ------------ |
| id         | IDENTITY PK       | Saved job ID |
| seeker_id  | INT FK → users.id | Who saved it |
| job_id     | INT FK → jobs.id  | Saved job    |
| created_at | TIMESTAMP         | Default: now |

---

### 7. Notifications

System notifications for users.

| Column     | Type              | Notes                |
| ---------- | ----------------- | -------------------- |
| id         | IDENTITY PK       | Notification ID      |
| user_id    | INT FK → users.id | Receiver             |
| message    | TEXT              | Notification content |
| status     | ENUM              | Default: unread      |
| created_at | TIMESTAMP         | Default: now         |

---

## ER Diagram

```mermaid
erDiagram
    USERS ||--||{ JOB_SEEKER_PROFILE : "1 to 1"
    USERS ||--||{ EMPLOYER_PROFILE : "1 to 1"
    USERS ||--o{ JOBS : "1 to many"
    USERS ||--o{ APPLICATIONS : "1 to many"
    USERS ||--o{ SAVED_JOBS : "1 to many"
    USERS ||--o{ NOTIFICATIONS : "1 to many"
    JOBS ||--o{ APPLICATIONS : "1 to many"
    JOBS ||--o{ SAVED_JOBS : "1 to many"
```

# SQL Implementation

## Enum Types

```sql
-- User roles
CREATE TYPE user_role AS ENUM ('seeker', 'employer', 'admin');

-- Job types
CREATE TYPE job_types AS ENUM ('full-time', 'part-time', 'contract', 'internship');

-- Application status
CREATE TYPE application_status AS ENUM ('applied', 'reviewed', 'rejected', 'hired');

-- Notification status
CREATE TYPE notification_status AS ENUM ('read', 'unread');
```

## Tables

```sql


CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL
);

```

```sql
CREATE TABLE job_seeker_profile (
user_id INT PRIMARY KEY,
skills TEXT,
education TEXT,
experience TEXT,
resume_url TEXT,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

```sql

CREATE TABLE employer_profile (
user_id INT PRIMARY KEY,
company_name VARCHAR(100),
description TEXT,
industry VARCHAR(100),
logo_url TEXT,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

```sql
CREATE TABLE jobs (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employer_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    requirements TEXT,
    location VARCHAR(100),
    salary_range VARCHAR(50),
    job_type job_types,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE
);

```

```sql
CREATE TABLE applications (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_id INT NOT NULL,
    seeker_id INT NOT NULL,
    status application_status DEFAULT 'applied',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (seeker_id) REFERENCES users(id) ON DELETE CASCADE
);

```

```sql
CREATE TABLE saved_jobs (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    seeker_id INT NOT NULL,
    job_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seeker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);


```

```sql

CREATE TABLE notifications (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    status notification_status DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


```

## Indexes

```sql
CREATE INDEX idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_seeker_id ON applications(seeker_id);
CREATE INDEX idx_saved_jobs_seeker_id ON saved_jobs(seeker_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
```
