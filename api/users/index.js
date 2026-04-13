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
  // GET /api/users
  if (req.method === 'GET') {
    try {
      const users = await sql`SELECT * FROM users ORDER BY id ASC`;
      return res.json({ users: users.map(sanitizeUser) });
    } catch (err) {
      return res.status(500).json({ message: 'Gagal memuat daftar pengguna.', error: err.message });
    }
  }

  // POST /api/users
  if (req.method === 'POST') {
    const { name, username, email, role, department, password, avatar_url } = req.body;
    if (!name || !username || !email || !role) {
      return res.status(400).json({ message: 'Nama, username, email, dan role wajib diisi.' });
    }
    try {
      const existing = await sql`SELECT id FROM users WHERE username = ${username} OR email = ${email}`;
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Username atau email sudah digunakan.' });
      }
      const hashedPassword = password ? await bcrypt.hash(password, 10) : '';
      const [newUser] = await sql`
        INSERT INTO users (name, username, email, password, role, department, avatar_url)
        VALUES (${name}, ${username}, ${email}, ${hashedPassword}, ${role}, ${department || null}, ${avatar_url || null})
        RETURNING *
      `;
      return res.json({ user: sanitizeUser(newUser) });
    } catch (err) {
      return res.status(500).json({ message: 'Gagal membuat pengguna.', error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}