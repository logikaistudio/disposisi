import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_0CRMywjdIz9H@ep-silent-union-a1ahbe4i-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Email dan password baru wajib diisi.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Password dan konfirmasi tidak cocok.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password harus minimal 6 karakter.' });
  }

  try {
    const [user] = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
    if (!user) {
      return res.status(400).json({ message: 'Email tidak terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await sql`UPDATE users SET password = ${hashedPassword} WHERE email = ${email}`;

    return res.json({ message: 'Password berhasil diubah. Silakan login kembali.' });
  } catch (err) {
    console.error('Password reset error:', err);
    return res.status(500).json({ 
      message: 'Gagal mereset password.',
      error: err.message 
    });
  }
}
