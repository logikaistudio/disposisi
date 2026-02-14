import { neon } from '@neondatabase/serverless';

// In production, this should be in an environment variable
// For this prototype, we are using the direct connection string provided by the user
const connectionString = 'postgresql://neondb_owner:npg_H8xuZER1Jaoi@ep-late-mouse-a15eyd85-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

export const sql = neon(connectionString);
