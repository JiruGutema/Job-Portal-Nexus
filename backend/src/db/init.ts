import pool from "../config/db";

const createSchema = async () => {
  const query = `
    -----------------------------------------------------
    -- ✅ SAFE ENUM CREATION
    -----------------------------------------------------
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

    -----------------------------------------------------
    -- ✅ TABLES CREATION
    -----------------------------------------------------
    CREATE TABLE IF NOT EXISTS users (
      id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role user_role NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS job_seeker_profile (
      user_id INT PRIMARY KEY,
      skills TEXT,
      education TEXT,
      experience TEXT,
      resume_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS employer_profile (
      user_id INT PRIMARY KEY,
      company_name VARCHAR(100),
      description TEXT,
      industry VARCHAR(100),
      logo_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

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
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE
    );

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

    CREATE TABLE IF NOT EXISTS saved_jobs (
      id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      seeker_id INT NOT NULL,
      job_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seeker_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      UNIQUE (seeker_id, job_id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id INT NOT NULL,
      message TEXT NOT NULL,
      status notification_status DEFAULT 'unread',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS revoked_tokens (
      id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      token TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      revoked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -----------------------------------------------------
    -- ✅ INDEXES
    -----------------------------------------------------
    CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);
    CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
    CREATE INDEX IF NOT EXISTS idx_applications_seeker_id ON applications(seeker_id);
    CREATE INDEX IF NOT EXISTS idx_saved_jobs_seeker_id ON saved_jobs(seeker_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_revoked_tokens_token ON revoked_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires_at ON revoked_tokens(expires_at);

    -----------------------------------------------------
    -- ✅ AUTOMATIC updated_at TRIGGER
    -----------------------------------------------------
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Apply triggers only to tables that have updated_at column
    DO $$
    DECLARE
      tbl TEXT;
    BEGIN
      FOR tbl IN
        SELECT table_name
        FROM information_schema.columns
        WHERE column_name = 'updated_at'
      LOOP
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger
          WHERE tgname = 'set_updated_at_' || tbl
        ) THEN
          EXECUTE format('
            CREATE TRIGGER set_updated_at_%I
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
          ', tbl, tbl);
        END IF;
      END LOOP;
    END $$;
  `;

  try {
    await pool.query(query);
    console.log("✅ Schema, columns, and triggers checked/created successfully!");
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
