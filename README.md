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

Ini akan membuat tabel `users`, `tasks`, `attachments`, dan `task_logs` serta memasukkan data sample.

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

## Setup Neon Database

1. Buat akun Neon dan project baru
2. Buat branch serverless
3. Salin connection string PostgreSQL
4. Buat file `.env` di root project:
   ```
   DATABASE_URL="postgresql://user:password@host:port/dbname"
   ```
5. Jalankan backend:
   ```bash
   npm run dev:api
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
