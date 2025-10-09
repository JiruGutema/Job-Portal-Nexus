import pool from "../config/db";

const createSchema = async () => {
  const query = `
    -- Create enums safely
    DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('seeker', 'employer', 'admin');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      CREATE TYPE job_types AS ENUM ('full-time', 'part-time', 'contract', 'internship');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      CREATE TYPE application_status AS ENUM ('applied', 'reviewed', 'rejected', 'hired');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      CREATE TYPE notification_status AS ENUM ('read', 'unread');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role user_role NOT NULL
    );

    -- Job seeker profile
    CREATE TABLE IF NOT EXISTS job_seeker_profile (
      user_id INT PRIMARY KEY,
      skills TEXT,
      education TEXT,
      experience TEXT,
      resume_url TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Employer profile
    CREATE TABLE IF NOT EXISTS employer_profile (
      user_id INT PRIMARY KEY,
      company_name VARCHAR(100),
      description TEXT,
      industry VARCHAR(100),
      logo_url TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Jobs
    CREATE TABLE IF NOT EXISTS jobs (
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

    -- Applications
    CREATE TABLE IF NOT EXISTS applications (
      id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      job_id INT NOT NULL,
      seeker_id INT NOT NULL,
      status application_status DEFAULT 'applied',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (seeker_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Saved jobs
    CREATE TABLE IF NOT EXISTS saved_jobs (
      id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      seeker_id INT NOT NULL,
      job_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seeker_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    -- Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id INT NOT NULL,
      message TEXT NOT NULL,
      status notification_status DEFAULT 'unread',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);
    CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
    CREATE INDEX IF NOT EXISTS idx_applications_seeker_id ON applications(seeker_id);
    CREATE INDEX IF NOT EXISTS idx_saved_jobs_seeker_id ON saved_jobs(seeker_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
  `;

  try {
    await pool.query(query);
    console.log("✅ All tables & enums created successfully!");
  } catch (err) {
    console.error("❌ Error creating schema:", err);
  } finally {
    pool.end();
  }
};

createSchema();

// First create name `Job_Portal` database in your PostgreSQL server,
// then Just run `npx ts-node src/db/init.ts` in your terminal to create the tables in your database.
// Make sure your .env file is set up with the correct database connection details.
