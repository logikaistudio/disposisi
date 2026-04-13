# Disposisi

Aplikasi Modern untuk Delegasi Tugas dengan Database Serverless untuk Mobile & Departemen.

## Fitur

- **Delegasi Tugas**: Tetapkan tugas ke departemen spesifik (Keuangan, Pemasaran, IT, SDM, Operasional).
- **Jenis Tugas**: Pilih dari 20 jenis tugas (UMP, UDK/Monitor, UDL, Proses, dll).
- **Desain Mobile First**: Dioptimalkan untuk penggunaan mobile dengan navigasi bawah dan kontrol sentuh.
- **Upload File**: Dukungan untuk lampiran PDF, PNG, JPG (metadata disimpan di DB).
- **Dashboard**: Pantau delegasi masuk dan keluar dengan update status.
- **Database**: Didukung oleh Neon Serverless Postgres.

## Tech Stack

- React (Vite)
- Neon (Serverless Postgres)
- Lucide React Icons
- Framer Motion (Transisi)
- CSS Modules / Global CSS untuk styling

## Setup Database

Aplikasi menggunakan database Neon Postgres. Script setup disertakan untuk menginisialisasi schema dan data awal.

Untuk reset/menginisialisasi database:
```bash
node scripts/init-db.js
```

Untuk reset total database (hapus semua data dan buat ulang):
```bash
node scripts/reset-db.js
```

Ini akan membuat tabel `users`, `tasks`, `attachments`, dan `task_logs` serta memasukkan data sample.

## User Credentials Default

Setelah setup database, gunakan credentials berikut untuk login:

| Username | Password | Role |
|----------|----------|------|
| `superadmin` | `password123` | Superuser |
| `admin` | `iwogate123` | Admin |
| `budi` | `budi123` | User |
| `siti` | `siti123` | User |

## Memulai

1. Install dependencies:
   ```bash
   npm install
   ```

2. Jalankan server development:
   ```bash
   npm run dev
   ```

3. Build untuk production:
   ```bash
   npm run build
   ```

## Deployment ke Vercel

1. **Connect Repository ke Vercel**
   - Import project dari GitHub repository
   - Pilih branch `main`

2. **Environment Variables**
   Tambahkan environment variable berikut di Vercel dashboard:
   ```
   DATABASE_URL=postgresql://username:password@hostname:port/database
   NODE_ENV=production
   ```

3. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy**
   - Vercel akan otomatis mendeteksi konfigurasi dan deploy
   - API routes akan tersedia di `/api/*`
   - Frontend akan served sebagai static files

## Struktur API Routes (Vercel)

```
api/
├── auth/
│   └── login.js          # POST /api/auth/login
├── tasks/
│   ├── index.js          # GET/POST /api/tasks
│   └── [id].js           # GET/DELETE/POST /api/tasks/[id]
├── users/
│   └── index.js          # GET /api/users
├── departments/
│   └── index.js          # GET /api/departments
├── roles/
│   └── index.js          # GET /api/roles
└── health.js             # GET /api/health
```

## Struktur Project

```
disposisi/
├── server/                 # Backend Node.js/Express
│   ├── lib/
│   │   ├── db.js          # Koneksi database
│   │   └── setup.js       # Setup schema database
│   └── routes/            # API endpoints
├── src/                   # Frontend React
│   ├── components/        # Komponen reusable
│   ├── pages/            # Halaman aplikasi
│   └── lib/              # Utilities dan API client
├── android/               # Konfigurasi Android (Capacitor)
├── scripts/              # Script utility
└── public/               # Static assets
```

## Lisensi

MIT License
