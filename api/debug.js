import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_0CRMywjdIz9H@ep-silent-union-a1ahbe4i-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

export default async function handler(req, res) {
  try {
    // Get all users with their current password state
    const users = await sql`SELECT id, username, email, role, LEFT(password, 6) as pass_prefix, LENGTH(password) as pass_len FROM users ORDER BY id`;

    // Check if passwords are hashed
    const allUsers = await sql`SELECT id, username, password FROM users ORDER BY id`;
    const results = [];

    for (const user of allUsers) {
      const isHashed = user.password && (
        user.password.startsWith('$2a$') ||
        user.password.startsWith('$2b$') ||
        user.password.startsWith('$2y$')
      );
      results.push({
        id: user.id,
        username: user.username,
        isHashed,
        passLength: user.password?.length
      });

      // If not hashed, hash it now with password123
      if (!isHashed) {
        const hashed = await bcrypt.hash('password123', 10);
        await sql`UPDATE users SET password = ${hashed} WHERE id = ${user.id}`;
        results[results.length - 1].action = 'FIXED: hashed with password123';
      }
    }

    // Verify superadmin can now login with password123
    const [superadmin] = await sql`SELECT password FROM users WHERE username = 'superadmin'`;
    const testMatch = superadmin ? await bcrypt.compare('password123', superadmin.password) : false;

    return res.json({
      ok: true,
      users: results,
      superadminTest: {
        password123Works: testMatch
      }
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message, stack: err.stack });
  }
}
