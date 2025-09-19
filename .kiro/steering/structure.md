# Project Structure & Organization

## Root Directory Structure
```
├── src/                    # Source code
├── public/                 # Static assets (PWA icons, manifest)
├── .kiro/                  # Kiro AI assistant configuration
├── .output/                # Build output (generated)
├── node_modules/           # Dependencies
└── config files            # Various config files
```

## Source Code Organization (`src/`)
```
src/
├── components/             # Reusable UI components
│   ├── ui/                # Shadcn/ui base components
│   ├── pages/             # Page-specific components
│   └── pwa-install/       # PWA installation components
├── routes/                # TanStack Router pages (file-based routing)
├── lib/                   # Utilities and configurations
├── actions/               # Server actions
├── types/                 # TypeScript type definitions
├── instant.schema.ts      # InstantDB schema definition
├── instant.queries.ts     # Database queries
├── instant.perms.ts       # Database permissions
├── router.tsx             # Router configuration
└── server.ts              # Server entry point
```

## Routing Convention
- **File-based routing** using TanStack Router
- Route files in `src/routes/` map directly to URLs
- Nested routes use dot notation: `dashboard.home.tsx` → `/dashboard/home`
- Layout routes: `dashboard.tsx` provides layout for all `dashboard.*` routes
- Root layout: `__root.tsx` wraps all routes

## Component Organization
- **UI Components** (`src/components/ui/`): Base Shadcn/ui components
- **Feature Components** (`src/components/`): Business logic components
- **Page Components** (`src/components/pages/`): Page-specific components
- Use default exports for components
- Co-locate related components in feature folders

## Database Schema Pattern
- **Schema-first approach** with InstantDB
- Define entities and relationships in `instant.schema.ts`
- Use typed queries and mutations
- Follow InstantDB naming conventions (camelCase for entities)

## Import Conventions
- Use `@/` path alias for `src/` directory
- Prefer named imports for utilities
- Use default imports for components
- Group imports: external libraries, internal modules, relative imports

## File Naming
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Routes**: kebab-case with dots for nesting (e.g., `dashboard.home.tsx`)
- **Utilities**: camelCase (e.g., `clientEnv.ts`)
- **Types**: camelCase with `.d.ts` extension for declarations