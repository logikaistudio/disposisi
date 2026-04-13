import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_0CRMywjdIz9H@ep-silent-union-a1ahbe4i-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

export default async function handler(req, res) {
  const { id } = req.query;

  // PUT /api/roles/:id
  if (req.method === 'PUT') {
    const { name, code, description, permissions } = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: 'Nama dan kode role wajib diisi.' });
    }
    try {
      const [updated] = await sql`
        UPDATE roles SET name = ${name}, code = ${code}, description = ${description || null}, permissions = ${permissions || null}
        WHERE id = ${id} RETURNING *
      `;
      if (!updated) return res.status(404).json({ message: 'Role tidak ditemukan.' });
      return res.json({ role: updated });
    } catch (err) {
      return res.status(500).json({ message: 'Gagal memperbarui role.', error: err.message });
    }
  }

  // DELETE /api/roles/:id
  if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM roles WHERE id = ${id}`;
      return res.json({ message: 'Role berhasil dihapus.' });
    } catch (err) {
      return res.status(500).json({ message: 'Gagal menghapus role.', error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
