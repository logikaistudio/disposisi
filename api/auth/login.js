import { sql } from '../../../server/lib/db.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password diperlukan.' });
  }

  try {
    const [user] = await sql`
      SELECT u.*, r.name as role_name, r.permissions
      FROM users u
      LEFT JOIN roles r ON u.role = r.code
      WHERE u.username = ${username}
      LIMIT 1
    `;

    if (!user) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      message: 'Login berhasil.',
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}