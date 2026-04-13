import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_0CRMywjdIz9H@ep-silent-union-a1ahbe4i-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

export default async function handler(req, res) {
  const log = [];

  try {
    // Create Tables
    await sql`CREATE TABLE IF NOT EXISTS roles (id SERIAL PRIMARY KEY, name TEXT NOT NULL, code TEXT NOT NULL UNIQUE, description TEXT, permissions TEXT, created_at TIMESTAMP DEFAULT NOW())`;
    log.push('✅ Table: roles');

    await sql`CREATE TABLE IF NOT EXISTS departments (id SERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL, label TEXT NOT NULL, color TEXT, description TEXT, created_at TIMESTAMP DEFAULT NOW())`;
    log.push('✅ Table: departments');

    await sql`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT NOT NULL, username TEXT UNIQUE, email TEXT UNIQUE, password TEXT, role TEXT NOT NULL, department TEXT, avatar_url TEXT, created_at TIMESTAMP DEFAULT NOW())`;
    log.push('✅ Table: users');

    await sql`CREATE TABLE IF NOT EXISTS tasks (id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, assigned_by_user_id INTEGER REFERENCES users(id), assigned_to_user_id INTEGER REFERENCES users(id), assigned_to_dept TEXT NOT NULL, status TEXT DEFAULT 'Pending', due_date DATE, reference_no TEXT, document_date DATE, sender_info TEXT, outcome TEXT, type TEXT DEFAULT 'incoming', task_types TEXT, created_at TIMESTAMP DEFAULT NOW())`;
    log.push('✅ Table: tasks');

    await sql`CREATE TABLE IF NOT EXISTS attachments (id SERIAL PRIMARY KEY, task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE, file_name TEXT NOT NULL, file_type TEXT NOT NULL, file_size TEXT NOT NULL, file_url TEXT)`;
    log.push('✅ Table: attachments');

    await sql`CREATE TABLE IF NOT EXISTS task_logs (id SERIAL PRIMARY KEY, task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE, user_id INTEGER REFERENCES users(id), action TEXT NOT NULL, note TEXT, created_at TIMESTAMP DEFAULT NOW())`;
    log.push('✅ Table: task_logs');

    // Seed Roles
    const roleCount = await sql`SELECT count(*) FROM roles`;
    if (parseInt(roleCount[0].count, 10) === 0) {
      await sql`INSERT INTO roles (name, code, description, permissions) VALUES ('Superuser', 'superuser', 'Akses penuh ke seluruh sistem tanpa batasan.', 'all'), ('Admin', 'admin', 'Manajer tingkat departemen atau operasional.', 'view_task, create_task, edit_task, delete_task, manage_users'), ('User', 'user', 'Pengguna standar untuk pelaksana tugas.', 'view_task, update_status, view_profile')`;
      log.push('✅ Seeded: roles');
    } else {
      log.push('⏭️ Skipped: roles (already seeded)');
    }

    // Seed Departments
    const deptCount = await sql`SELECT count(*) FROM departments`;
    if (parseInt(deptCount[0].count, 10) === 0) {
      await sql`INSERT INTO departments (name, label, color, description) VALUES ('Management', 'Manajemen', '#64748b', 'Eksekutif dan strategi'), ('Finance', 'Keuangan', '#3b82f6', 'Mengelola keuangan perusahaan'), ('Marketing', 'Pemasaran', '#f97316', 'Promosi dan branding'), ('IT', 'Teknologi Informasi', '#8b5cf6', 'Sistem dan infrastruktur IT'), ('HR', 'SDM', '#10b981', 'Pengelolaan sumber daya manusia'), ('Ops', 'Operasional', '#ef4444', 'Operasional sehari-hari')`;
      log.push('✅ Seeded: departments');
    } else {
      log.push('⏭️ Skipped: departments (already seeded)');
    }

    // Seed Users
    const userCount = await sql`SELECT count(*) FROM users`;
    if (parseInt(userCount[0].count, 10) === 0) {
      const superadminHash = await bcrypt.hash('password123', 10);
      const adminHash = await bcrypt.hash('password123', 10);
      const budiHash = await bcrypt.hash('password123', 10);
      const sitiHash = await bcrypt.hash('password123', 10);

      await sql`
        INSERT INTO users (name, username, email, password, role, department, avatar_url)
        VALUES
          ('Super Administrator', 'superadmin', 'superadmin@example.com', ${superadminHash}, 'superuser', 'Management', 'https://ui-avatars.com/api/?name=Super+Admin'),
          ('Administrator', 'admin', 'admin@example.com', ${adminHash}, 'admin', 'IT', 'https://ui-avatars.com/api/?name=Administrator'),
          ('Budi Santoso', 'budi', 'budi.santoso@example.com', ${budiHash}, 'user', 'Finance', 'https://ui-avatars.com/api/?name=Budi+Santoso'),
          ('Siti Aminah', 'siti', 'siti.aminah@example.com', ${sitiHash}, 'user', 'Marketing', 'https://ui-avatars.com/api/?name=Siti+Aminah')
      `;
      log.push('✅ Seeded: users (password: password123)');
    } else {
      log.push('⏭️ Skipped: users (already seeded)');
    }

    return res.json({ ok: true, log });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message, log });
  }
}
