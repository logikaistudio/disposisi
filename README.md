# iwogate

Modern Task Delegation App for Mobile & Departments with serverless database.

## Features

- **Task Delegation**: Assign tasks to specific departments (Finance, Marketing, IT, HR, Ops).
- **Mobile First Design**: Optimized for mobile usage with bottom navigation and touch-friendly controls.
- **File Upload**: Support for PDF, PNG, JPG attachments (metadata stored in DB).
- **Dashboard**: Track incoming and outgoing delegations with status updates.
- **Database**: Powered by Neon Serverless Postgres.

## Tech Stack

- React (Vite)
- Neon (Serverless Postgres)
- Lucide React Icons
- Framer Motion (Transitions)
- CSS Modules / Global CSS for styling

## Database Setup

The application uses a Neon Postgres database. A setup script is included to initialize the schema and seed data.

To reset/initialize the database:
```bash
node scripts/init-db.js
```
This will create `users`, `tasks`, and `attachments` tables and insert sample data.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```
