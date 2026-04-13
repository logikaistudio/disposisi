import { sql } from '../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const departments = await sql`
      SELECT * FROM departments
      ORDER BY name ASC
    `;

    return res.json({ departments });
  } catch (err) {
    console.error('Get departments error:', err);
    return res.status(500).json({ message: 'Gagal memuat data departemen.' });
  }
}