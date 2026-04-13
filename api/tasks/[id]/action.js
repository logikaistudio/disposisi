import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_0CRMywjdIz9H@ep-silent-union-a1ahbe4i-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

// POST /api/tasks/:id/action
export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { type, reason, targetUserId, currentUserId } = req.body;
  if (!type) {
    return res.status(400).json({ message: 'Tipe aksi tidak ditentukan.' });
  }

  try {
    if (type === 'delegate') {
      const [target] = await sql`SELECT * FROM users WHERE id = ${targetUserId} LIMIT 1`;
      if (!target) {
        return res.status(400).json({ message: 'Penerima delegasi tidak ditemukan.' });
      }
      await sql`
        UPDATE tasks
        SET assigned_to_user_id = ${targetUserId}, assigned_to_dept = ${target.department}, assigned_by_user_id = ${currentUserId || null}
        WHERE id = ${id}
      `;
      await sql`
        INSERT INTO task_logs (task_id, user_id, action, note)
        VALUES (${id}, ${currentUserId || null}, 'delegated', ${`Mendelegasikan ke ${target.name}. Catatan: ${reason || ''}`})
      `;
      return res.json({ message: 'Tugas berhasil didelegasikan.' });
    }

    const status = type === 'reject' ? 'Rejected' : 'Completed';
    const action = type === 'reject' ? 'rejected' : 'completed';
    await sql`UPDATE tasks SET status = ${status}, outcome = ${reason || null} WHERE id = ${id}`;
    await sql`
      INSERT INTO task_logs (task_id, user_id, action, note)
      VALUES (${id}, ${currentUserId || null}, ${action}, ${reason || null})
    `;
    return res.json({ message: 'Tugas berhasil diperbarui.' });
  } catch (err) {
    return res.status(500).json({ message: 'Gagal memperbarui tugas.', error: err.message });
  }
}
