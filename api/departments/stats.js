import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_0CRMywjdIz9H@ep-silent-union-a1ahbe4i-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

// GET /api/departments/stats
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const departments = await sql`SELECT * FROM departments ORDER BY name ASC`;
    const users = await sql`SELECT department, count(*) as count FROM users GROUP BY department`;
    const tasks = await sql`SELECT assigned_to_dept, count(*) as count, status FROM tasks GROUP BY assigned_to_dept, status`;

    const stats = departments.map(dept => {
      const userCount = users.find(u => u.department === dept.name)?.count || 0;
      const deptTasks = tasks.filter(t => t.assigned_to_dept === dept.name);
      const taskCount = deptTasks.reduce((sum, t) => sum + parseInt(t.count, 10), 0);
      const pendingCount = deptTasks
        .filter(t => t.status === 'Pending')
        .reduce((sum, t) => sum + parseInt(t.count, 10), 0);

      return {
        ...dept,
        userCount: parseInt(userCount, 10),
        taskCount,
        pendingCount,
      };
    });

    return res.json({ stats });
  } catch (err) {
    return res.status(500).json({ message: 'Gagal memuat statistik departemen.', error: err.message });
  }
}
