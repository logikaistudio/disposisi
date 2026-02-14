import { sql } from './db.js';

export const initializeDatabase = async () => {
    console.log('Initializing database...');
    try {
        // Enable UUID extension if needed, but SERIAL is fine for simple app

        // Create Users Table
        await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        department TEXT NOT NULL,
        avatar_url TEXT
      );
    `;

        // Create Tasks Table
        await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        assigned_by_user_id INTEGER REFERENCES users(id),
        assigned_to_dept TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        due_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        type TEXT DEFAULT 'incoming'
      );
    `;

        // Create Attachments Table
        await sql`
      CREATE TABLE IF NOT EXISTS attachments (
        id SERIAL PRIMARY KEY,
        task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
        file_name TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size TEXT NOT NULL,
        file_url TEXT
      );
    `;

        console.log('Tables created successfully.');

        // Seed Data
        const userCount = await sql`SELECT count(*) FROM users`;
        if (userCount[0].count == 0) {
            console.log('Seeding initial data...');

            // Insert Users
            const users = await sql`
          INSERT INTO users (name, role, department, avatar_url)
          VALUES 
            ('Pak Hartono', 'Direktur Utama', 'Management', 'https://ui-avatars.com/api/?name=Pak+Hartono'),
            ('Budi Santoso', 'Manager Keuangan', 'Finance', 'https://ui-avatars.com/api/?name=Budi+Santoso'),
            ('Siti Aminah', 'Lead Marketing', 'Marketing', 'https://ui-avatars.com/api/?name=Siti+Aminah')
          RETURNING id, name
        `;

            const hartonoId = users.find(u => u.name === 'Pak Hartono').id;
            const budiId = users.find(u => u.name === 'Budi Santoso').id;
            const sitiId = users.find(u => u.name === 'Siti Aminah').id;

            // Insert Tasks
            // Incoming for Hartono (assigned by others)
            await sql`
           INSERT INTO tasks (title, description, assigned_by_user_id, assigned_to_dept, status, due_date, type)
           VALUES 
           ('Tinjau Laporan Keuangan Q1', 'Mohon tinjau laporan keuangan kuartal pertama sebelum rapat direksi hari Jumat. Lampiran tersedia.', ${budiId}, 'Management', 'Pending', '2026-02-16', 'incoming'),
           ('Desain Banner Promosi Ramadhan', 'Buatkan desain banner untuk promosi bulan Ramadhan sesuai guideline terbaru.', ${sitiId}, 'Management', 'In Progress', '2026-02-20', 'incoming')
        `;

            // Outgoing from Hartono (assigned by him)
            await sql`
           INSERT INTO tasks (title, description, assigned_by_user_id, assigned_to_dept, status, due_date, type)
           VALUES
           ('Perbaikan Sistem Login', 'Terdapat bug pada sistem login user baru. Segera perbaiki untuk menghindari komplain customer.', ${hartonoId}, 'IT', 'Completed', '2026-02-14', 'outgoing'),
           ('Delegasi Meeting Vendor IT', 'Saya berhalangan hadir, tolong wakilkan meeting dengan vendor server besok pagi.', ${hartonoId}, 'IT', 'Pending', '2026-02-17', 'outgoing')
        `;

            console.log('Seeding completed.');
        }

        return { success: true, message: 'Database initialized successfully' };
    } catch (error) {
        console.error('Database initialization failed:', error);
        return { success: false, message: error.message };
    }
};
