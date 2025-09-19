# Technology Stack & Build System

## Core Technologies
- **Frontend Framework**: React 19 with TypeScript
- **Routing**: TanStack Router with file-based routing
- **Database**: InstantDB (real-time database with schema-first approach)
- **State Management**: Legend State for reactive state management
- **Authentication**: Google OAuth via InstantDB
- **Styling**: Tailwind CSS v4 with Shadcn/ui components
- **Build Tool**: Vite with Rolldown bundler
- **PWA**: Custom Workbox implementation for service worker and caching

## Key Libraries
- **UI Components**: Radix UI primitives with Shadcn/ui styling
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for analytics visualization
- **Icons**: Lucide React
- **Environment**: T3 Env for type-safe environment variables
- **Notifications**: Sonner for toast notifications
- **Themes**: Next Themes for dark/light mode

## Development Commands
```bash
# Start development server (port 3000)
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint

# Create release (conventional changelog)
pnpm release
```

## Build Configuration
- **Target**: Vercel deployment with SPA mode enabled
- **Prerendering**: Static pages for /, /about, /privacy, /terms, /dashboard/home
- **PWA**: Custom Workbox configuration for offline support
- **TypeScript**: Strict mode with path aliases (@/* → src/*)

## Environment Variables
All client-side variables must be prefixed with `VITE_`:
- `VITE_INSTANT_APP_ID`: InstantDB application identifier
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID
- `VITE_GOOGLE_CLIENT_NAME`: Google OAuth client name
- `INSTANT_APP_ADMIN_TOKEN`: Server-side InstantDB admin token