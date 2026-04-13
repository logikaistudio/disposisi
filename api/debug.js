import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const connectionString = process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_H8xuZER1Jaoi@ep-late-mouse-a15eyd85-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

  try {
    const sql = neon(connectionString);
    
    // Simple ping query
    const result = await sql`SELECT NOW() as time, current_database() as db`;
    
    // Check tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    // Check users (no password)
    const users = await sql`SELECT id, username, email, role FROM users ORDER BY id`;

    return res.json({
      ok: true,
      time: result[0].time,
      database: result[0].db,
      usingEnvVar: !!process.env.DATABASE_URL,
      tables: tables.map(t => t.table_name),
      users
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message,
      code: err.code,
      usingEnvVar: !!process.env.DATABASE_URL
    });
  }
}
