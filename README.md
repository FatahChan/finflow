# Legend State + Supabase Todo App

A modern todo application built with Legend State for state management and Supabase as the backend.

<div align="center">

[![Demo](https://img.shields.io/badge/▶️%20Live%20Demo-todo--legend--state--supabase.vercel.app-blue?style=for-the-badge)](https://todo-legend-state-supabase.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/FatahChan/todo-legend-state-supabase)

</div>

## Features

- ⚡️ Real-time todo updates
- 🔄 Sync across devices
- ✨ Modern UI with shadcn/ui
- 🎯 Optimistic updates
- 🏃‍♂️ Fast and responsive
- 🔒 Data persistence with Supabase
- 🛜 Offline-first
- 📱 PWA ready - installable as a native app
- 🌐 Works on all devices

## Tech Stack

- [Legend State](https://legendapp.com/open-source/state/) - Reactive state management
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [React](https://reactjs.org/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## Getting Started

### Prerequisites

1. Install Docker Desktop:
   - Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Start Docker Desktop
   - Ensure Docker is running before proceeding

### Installation

1. Clone the repository:
```bash
git clone https://github.com/FatahChan/todo-legend-state-supabase
cd todo-legend-state-supabase
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up Supabase locally:
```bash
# Start Supabase services
pnpx supabase start
```

After running `supabase start`, you'll see output containing your local credentials. Create a `.env` file in the project root with these values:

```makefile
# Local Supabase configuration
VITE_SUPABASE_URL="http://localhost:54321"
VITE_SUPABASE_ANON_KEY="your-anon-key-from-supabase-start-output"
```
4. Reset the database:
```bash
pnpx supabase db reset
```

5. The database will be automatically initialized with:
   - Tables and schemas from `supabase/migrations`
   - Sample data from `supabase/seed.sql`

6. Start the development server:
```bash
pnpm run start
```

### Supabase Local Development

Common Supabase CLI commands:

```bash
# View Supabase status
pnpx supabase status

# Reset the database to a clean state (applies migrations and seeds)
pnpx supabase db reset

# Stop Supabase services
pnpx supabase stop

# Generate database types (if using TypeScript)
pnpx supabase gen types typescript --local > src/lib/database.types.ts
```

Access local Supabase services:
- Studio (Dashboard): http://localhost:54323
- API URL: http://localhost:54321
- DB Connection string: postgresql://postgres:postgres@localhost:54322/postgres

## Development

The app uses:
- Supabase for data storage and real-time updates
- Legend State for state management
- shadcn/ui for the user interface components

### Database Schema

The todo table schema includes:
- `id`: UUID primary key
- `counter`: Auto-incrementing ID
- `text`: Todo text content
- `done`: Boolean status
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `deleted`: Soft delete flag

## License

MIT
