import { sql } from '../../lib/db.js';

const formatTask = (task) => ({
  ...task,
  assigned_by_name: task.assigned_by_name || null,
  assigned_by_dept: task.assigned_by_dept || null,
  assigned_to_name: task.assigned_to_name || null,
  assigned_to_dept: task.assigned_to_dept || null,
});

const loadTasks = async () => {
  const tasks = await sql`
    SELECT
      t.*,
      u.name AS assigned_by_name,
      u.department AS assigned_by_dept,
      au.name AS assigned_to_name,
      au.department AS assigned_to_dept
    FROM tasks t
    LEFT JOIN users u ON t.assigned_by_user_id = u.id
    LEFT JOIN users au ON t.assigned_to_user_id = au.id
    ORDER BY t.created_at DESC
  `;
  return tasks.map(formatTask);
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const allTasks = await loadTasks();
      let filtered = allTasks;
      if (req.query.type) {
        filtered = filtered.filter((task) => task.type === req.query.type);
      }
      if (req.query.status) {
        filtered = filtered.filter((task) => task.status === req.query.status);
      }
      if (req.query.search) {
        const search = req.query.search.toLowerCase();
        filtered = filtered.filter(
          (task) =>
            task.title.toLowerCase().includes(search) ||
            task.description.toLowerCase().includes(search) ||
            (task.assigned_to_name || task.assigned_to_dept || '')
              .toLowerCase()
              .includes(search)
        );
      }
      return res.json({ tasks: filtered });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Gagal memuat tugas.' });
    }
  }

  if (req.method === 'POST') {
    const { tasks, desc, refNo, docDate, sender, attachments, assignedById } = req.body;
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ message: 'Daftar tugas tidak boleh kosong.' });
    }

    try {
      const created = [];
      for (const row of tasks) {
        if (!row.title || !row.assigned_to_dept || !row.due_date) {
          continue;
        }
        const [newTask] = await sql`
          INSERT INTO tasks (
            title,
            description,
            assigned_by_user_id,
            assigned_to_dept,
            assigned_to_user_id,
            status,
            due_date,
            type,
            reference_no,
            document_date,
            sender_info,
            task_types
          ) VALUES (
            ${row.title},
            ${desc || ''},
            ${assignedById || null},
            ${row.assigned_to_dept},
            ${row.assigned_to_user_id || null},
            'Pending',
            ${row.due_date},
            'outgoing',
            ${refNo || null},
            ${docDate || null},
            ${sender || null},
            ${row.task_types || null}
          ) RETURNING *
        `;

        if (newTask && Array.isArray(attachments) && attachments.length > 0) {
          for (const att of attachments) {
            await sql`
              INSERT INTO attachments (task_id, file_name, file_type, file_size, file_url)
              VALUES (${newTask.id}, ${att.name}, ${att.type}, ${att.size}, ${att.url})
            `;
          }
        }
        created.push(newTask);
      }
      return res.json({ tasks: created });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Gagal membuat tugas.' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}