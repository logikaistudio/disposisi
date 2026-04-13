import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_0CRMywjdIz9H@ep-silent-union-a1ahbe4i-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

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
    return res.status(500).json({ message: 'Gagal memuat data role.', error: err.message });
  }
}