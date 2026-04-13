import { sql } from '../server/lib/db.js';
import { initializeDatabase } from '../server/lib/setup.js';

async function resetDatabase() {
    try {
        console.log('Resetting database...');

        // Drop tables in correct order (due to foreign keys)
        await sql`DROP TABLE IF EXISTS task_logs CASCADE`;
        await sql`DROP TABLE IF EXISTS attachments CASCADE`;
        await sql`DROP TABLE IF EXISTS tasks CASCADE`;
        await sql`DROP TABLE IF EXISTS users CASCADE`;
        await sql`DROP TABLE IF EXISTS departments CASCADE`;
        await sql`DROP TABLE IF EXISTS roles CASCADE`;

        console.log('Tables dropped. Reinitializing...');

        // Reinitialize database
        const result = await initializeDatabase();

        if (result.success) {
            console.log('Database reset and initialized successfully!');
            console.log('\nDefault users created:');
            console.log('- Username: superadmin, Password: password123');
            console.log('- Username: admin, Password: iwogate123');
            console.log('- Username: budi, Password: budi123');
            console.log('- Username: siti, Password: siti123');
        } else {
            console.error('Failed to initialize database:', result.message);
        }

    } catch (error) {
        console.error('Database reset failed:', error);
    } finally {
        process.exit(0);
    }
}

resetDatabase();