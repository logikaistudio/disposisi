import { neon } from '@neondatabase/serverless';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_0CRMywjdIz9H@ep-silent-union-a1ahbe4i-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export const sql = neon(connectionString);
