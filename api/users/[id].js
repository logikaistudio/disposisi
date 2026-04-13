import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_0CRMywjdIz9H@ep-silent-union-a1ahbe4i-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

export default async function handler(req, res) {
  const { id } = req.query;

  // GET /api/users/:id
  if (req.method === 'GET') {
    try {
      const [user] = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
      if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' });
      return res.json({ user: sanitizeUser(user) });
    } catch (err) {
      return res.status(500).json({ message: 'Gagal memuat data user.', error: err.message });
    }
  }

  // PUT /api/users/:id
  if (req.method === 'PUT') {
    const { name, username, email, role, department, password, avatar_url } = req.body;
    if (!name || !username || !email || !role) {
      return res.status(400).json({ message: 'Nama, username, email, dan role wajib diisi.' });
    }
    try {
      const existing = await sql`
        SELECT id FROM users WHERE (username = ${username} OR email = ${email}) AND id != ${id}
      `;
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Username atau email sudah digunakan.' });
      }
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await sql`
          UPDATE users SET name = ${name}, username = ${username}, email = ${email}, role = ${role},
          department = ${department || null}, avatar_url = ${avatar_url || null}, password = ${hashedPassword}
          WHERE id = ${id}
        `;
      } else {
        await sql`
          UPDATE users SET name = ${name}, username = ${username}, email = ${email}, role = ${role},
          department = ${department || null}, avatar_url = ${avatar_url || null}
          WHERE id = ${id}
        `;
      }
      const [updated] = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
      return res.json({ user: sanitizeUser(updated) });
    } catch (err) {
      return res.status(500).json({ message: 'Gagal memperbarui pengguna.', error: err.message });
    }
  }

  // DELETE /api/users/:id
  if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM users WHERE id = ${id}`;
      return res.json({ message: 'User berhasil dihapus.' });
    } catch (err) {
      return res.status(500).json({ message: 'Gagal menghapus pengguna.', error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
