import express from 'express';
import cors from 'cors';
import { setupAuthRoutes } from '../server/routes/auth.js';
import { setupUserRoutes } from '../server/routes/users.js';
import { setupRoleRoutes } from '../server/routes/roles.js';
import { setupDepartmentRoutes } from '../server/routes/departments.js';
import { setupTaskRoutes } from '../server/routes/tasks.js';

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy' });
});

// Setup all routes
setupAuthRoutes(app);
setupUserRoutes(app);
setupRoleRoutes(app);
setupDepartmentRoutes(app);
setupTaskRoutes(app);

// Export for Vercel
export default app;
