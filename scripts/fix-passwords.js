import bcrypt from 'bcryptjs';
import { sql } from '../server/lib/db.js';

async function fixPasswords() {
  try {
    console.log('Scanning users for plain-text passwords...');
    const users = await sql`SELECT id, password, username FROM users`;

    for (const user of users) {
      const password = user.password || '';
      if (!password.startsWith('$2a$') && !password.startsWith('$2b$') && !password.startsWith('$2y$')) {
        const hashed = await bcrypt.hash(password, 10);
        await sql`UPDATE users SET password = ${hashed} WHERE id = ${user.id}`;
        console.log(`Updated password for user ${user.username}`);
      }
    }

    console.log('Password fix completed.');
  } catch (error) {
    console.error('Failed to fix passwords:', error);
  } finally {
    process.exit(0);
  }
}

fixPasswords();