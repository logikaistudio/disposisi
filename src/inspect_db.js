import { sql } from './lib/db.js';

async function inspect() {
    try {
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'tasks';
        `;
        console.log("Tasks Columns:", columns);
    } catch (err) {
        console.error(err);
    }
}

inspect();
