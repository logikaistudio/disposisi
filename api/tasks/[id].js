import { sql } from '../../lib/db.js';

const formatTask = (task) => ({
  ...task,
  assigned_by_name: task.assigned_by_name || null,
  assigned_by_dept: task.assigned_by_dept || null,
  assigned_to_name: task.assigned_to_name || null,
  assigned_to_dept: task.assigned_to_dept || null,
});

const loadTask = async (id) => {
  const [task] = await sql`
    SELECT
      t.*,
      u.name AS assigned_by_name,
      u.department AS assigned_by_dept,
      au.name AS assigned_to_name,
      au.department AS assigned_to_dept
    FROM tasks t
    LEFT JOIN users u ON t.assigned_by_user_id = u.id
    LEFT JOIN users au ON t.assigned_to_user_id = au.id
    WHERE t.id = ${id}
    LIMIT 1
  `;
  if (!task) return null;
  const attachments = await sql`SELECT * FROM attachments WHERE task_id = ${id}`;
  const logs = await sql`
    SELECT tl.*, u.name AS user_name
    FROM task_logs tl
    LEFT JOIN users u ON tl.user_id = u.id
    WHERE tl.task_id = ${id}
    ORDER BY tl.created_at DESC
  `;
  return {
    ...formatTask(task),
    attachments,
    logs: logs.map((log) => ({ ...log, date: log.created_at })),
  };
};

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const task = await loadTask(id);
      if (!task) return res.status(404).json({ message: 'Tugas tidak ditemukan.' });
      return res.json({ task });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Gagal memuat detail tugas.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM tasks WHERE id = ${id}`;
      return res.json({ message: 'Tugas berhasil dihapus.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Gagal menghapus tugas.' });
    }
  }

  if (req.method === 'POST' && req.query.action === 'action') {
    const { type, reason, targetUserId } = req.body;
    if (!type) {
      return res.status(400).json({ message: 'Tipe aksi tidak ditentukan.' });
    }

    try {
      const currentUserId = req.body.currentUserId || null;
      if (type === 'delegate') {
        const [target] = await sql`SELECT * FROM users WHERE id = ${targetUserId} LIMIT 1`;
        if (!target) {
          return res.status(400).json({ message: 'Penerima delegasi tidak ditemukan.' });
        }
        await sql`
          UPDATE tasks
          SET assigned_to_user_id = ${targetUserId}, assigned_to_dept = ${target.department}, assigned_by_user_id = ${currentUserId}
          WHERE id = ${id}
        `;
        await sql`
          INSERT INTO task_logs (task_id, user_id, action, note)
          VALUES (${id}, ${currentUserId}, 'delegated', ${`Mendelegasikan ke ${target.name}. Catatan: ${reason || ''}`})
        `;
        return res.json({ message: 'Tugas berhasil didelegasikan.' });
      }

      const status = type === 'reject' ? 'Rejected' : 'Completed';
      const action = type === 'reject' ? 'rejected' : 'completed';
      await sql`
        UPDATE tasks
        SET status = ${status}, outcome = ${reason || null}
        WHERE id = ${id}
      `;
      await sql`
        INSERT INTO task_logs (task_id, user_id, action, note)
        VALUES (${id}, ${currentUserId}, ${action}, ${reason || null})
      `;
      return res.json({ message: 'Tugas berhasil diperbarui.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Gagal memperbarui tugas.' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}