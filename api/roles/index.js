import { sql } from '../../../server/lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const roles = await sql`
      SELECT * FROM roles
      ORDER BY name ASC
    `;

    return res.json({ roles });
  } catch (err) {
    console.error('Get roles error:', err);
    return res.status(500).json({ message: 'Gagal memuat data role.' });
  }
}