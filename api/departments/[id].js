import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_0CRMywjdIz9H@ep-silent-union-a1ahbe4i-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

export default async function handler(req, res) {
  const { id } = req.query;

  // GET /api/departments/:id
  if (req.method === 'GET') {
    try {
      const [dept] = await sql`SELECT * FROM departments WHERE id = ${id} LIMIT 1`;
      if (!dept) return res.status(404).json({ message: 'Departemen tidak ditemukan.' });
      return res.json({ department: dept });
    } catch (err) {
      return res.status(500).json({ message: 'Gagal memuat departemen.', error: err.message });
    }
  }

  // PUT /api/departments/:id
  if (req.method === 'PUT') {
    const { name, label, color, description } = req.body;
    if (!name || !label) {
      return res.status(400).json({ message: 'Nama dan label departemen wajib diisi.' });
    }
    try {
      const [updated] = await sql`
        UPDATE departments SET name = ${name}, label = ${label}, color = ${color || null}, description = ${description || null}
        WHERE id = ${id} RETURNING *
      `;
      if (!updated) return res.status(404).json({ message: 'Departemen tidak ditemukan.' });
      return res.json({ department: updated });
    } catch (err) {
      return res.status(500).json({ message: 'Gagal memperbarui departemen.', error: err.message });
    }
  }

  // DELETE /api/departments/:id
  if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM departments WHERE id = ${id}`;
      return res.json({ message: 'Departemen berhasil dihapus.' });
    } catch (err) {
      return res.status(500).json({ message: 'Gagal menghapus departemen.', error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
