import { sql } from './lib/db.js';

async function fix() {
    console.log("Starting DB Constraint Fix...");

    try {
        // Fix 1: assigned_by_user_id
        console.log("Fixing tasks_assigned_by_user_id_fkey...");
        await sql`ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assigned_by_user_id_fkey`;
        // We assume the column is 'assigned_by_user_id' and it references 'users(id)'
        // If this fails (e.g. column doesn't exist), it will catch error.
        await sql`ALTER TABLE tasks ADD CONSTRAINT tasks_assigned_by_user_id_fkey FOREIGN KEY (assigned_by_user_id) REFERENCES users(id) ON DELETE CASCADE`;
        console.log("SUCCESS: assigned_by_user_id constraint updated to CASCADE.");
    } catch (err) {
        console.log("INFO: Could not fix assigned_by_user_id (maybe column doesn't exist or different name). Error: " + err.message);
    }

    try {
        // Fix 2: assigned_to_user_id (Common variation)
        console.log("Fixing tasks_assigned_to_user_id_fkey...");
        await sql`ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assigned_to_user_id_fkey`;
        await sql`ALTER TABLE tasks ADD CONSTRAINT tasks_assigned_to_user_id_fkey FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE CASCADE`;
        console.log("SUCCESS: assigned_to_user_id constraint updated to CASCADE.");
    } catch (err) {
        console.log("INFO: Could not fix assigned_to_user_id. Error: " + err.message);
    }

    console.log("DB Fix attempt complete.");
    process.exit(0);
}

fix();
