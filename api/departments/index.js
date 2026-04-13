import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_0CRMywjdIz9H@ep-silent-union-a1ahbe4i-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

export default async function handler(req, res) {
  // GET /api/departments
  if (req.method === 'GET') {
    try {
      const departments = await sql`SELECT * FROM departments ORDER BY name ASC`;
      return res.json({ departments });
    } catch (err) {
      return res.status(500).json({ message: 'Gagal memuat data departemen.', error: err.message });
    }
  }

  // POST /api/departments
  if (req.method === 'POST') {
    const { name, label, color, description } = req.body;
    if (!name || !label) {
      return res.status(400).json({ message: 'Nama dan label departemen wajib diisi.' });
    }
    try {
      const [newDept] = await sql`
        INSERT INTO departments (name, label, color, description)
        VALUES (${name}, ${label}, ${color || null}, ${description || null})
        RETURNING *
      `;
      return res.json({ department: newDept });
    } catch (err) {
      return res.status(500).json({ message: 'Gagal membuat departemen.', error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}