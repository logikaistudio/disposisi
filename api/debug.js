import { sql } from './lib/db.js';

export default async function handler(req, res) {
  try {
    // Cek apakah tabel users ada
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    // Cek jumlah user
    const userCount = await sql`SELECT count(*) FROM users`;
    
    // Cek satu user (tanpa password)
    const [sampleUser] = await sql`SELECT id, username, email FROM users LIMIT 1`;

    return res.json({
      success: true,
      message: 'Database check successful',
      tables: tables.map(t => t.table_name),
      userCount: userCount[0].count,
      sampleUser
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Database check failed',
      error: err.message,
      stack: err.stack
    });
  }
}
