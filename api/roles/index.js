import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_0CRMywjdIz9H@ep-silent-union-a1ahbe4i-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

export default async function handler(req, res) {
  // GET all roles
  if (req.method === 'GET') {
    try {
      const roles = await sql`SELECT * FROM roles ORDER BY name ASC`;
      return res.json({ roles });
    } catch (err) {
      return res.status(500).json({ message: 'Gagal memuat data role.', error: err.message });
    }
  }

  // POST - create role
  if (req.method === 'POST') {
    const { name, code, description, permissions } = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: 'Nama dan kode role wajib diisi.' });
    }
    try {
      const [newRole] = await sql`
        INSERT INTO roles (name, code, description, permissions)
        VALUES (${name}, ${code}, ${description || null}, ${permissions || null})
        RETURNING *
      `;
      return res.json({ role: newRole });
    } catch (err) {
      return res.status(500).json({ message: 'Gagal membuat role.', error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}