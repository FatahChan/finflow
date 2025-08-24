# Changelog

## [0.1.3](https://github.com/FatahChan/finflow/compare/0.1.2...0.1.3) (2025-08-24)

## [0.1.2](https://github.com/FatahChan/finflow/compare/0.1.0...0.1.2) (2025-08-24)

## [0.1.1](https://github.com/FatahChan/finflow/compare/0.1.0...0.1.1) (2025-08-24)

# 0.1.0 (2025-08-24)


### Bug Fixes

* auth middleware ([d96ecfe](https://github.com/FatahChan/finflow/commit/d96ecfe73b8a74ce64ec4466e9b6c09c979b407a))
* correct transaction-account linking in database and remove debug logs ([0da0e4b](https://github.com/FatahChan/finflow/commit/0da0e4bcffa63ba5fe51a1514425da9e14f548a3))
* handle array account type and improve form select behavior in transactions ([38370e7](https://github.com/FatahChan/finflow/commit/38370e7abe7edae06dcd54ba2916019b413d6085))
* loading ([0523aae](https://github.com/FatahChan/finflow/commit/0523aae25d3734ff2377e50113fc7a9239f350e7))
* move exchange rate calculation inside observable to prevent stale data ([c5fa301](https://github.com/FatahChan/finflow/commit/c5fa3014bd0b35092dbc371f1ed69adb99a60116))
* update app navigation to use /dashboard/home as default landing page ([8f5926b](https://github.com/FatahChan/finflow/commit/8f5926b62f2a94337c3e511f6f63f31ae96dabf0))
* use correct user id from auth context for transaction account operations ([cfc1812](https://github.com/FatahChan/finflow/commit/cfc18127e89dc75ea0d22d8557af8531d90d4d86))


### Features

* add form validation and default values for transaction dialog ([4c01514](https://github.com/FatahChan/finflow/commit/4c0151435bc0735b35a7df8c397fafa8dc36cab2))
* add landing page with PWA install support and route configuration ([b5c5ef2](https://github.com/FatahChan/finflow/commit/b5c5ef245616eaa03f254a7a9a8168e187726d68))
* add loading states and skeleton UI for data fetching ([30dd64a](https://github.com/FatahChan/finflow/commit/30dd64a0b4708a2c9ca21d3fa22701ecab19bcf6))
* add navigation drawer and header components with new routes ([e26f5a3](https://github.com/FatahChan/finflow/commit/e26f5a367173600e5587bc66168559dc36deded8))
* add prerendered routes for home and about pages ([2ebf06d](https://github.com/FatahChan/finflow/commit/2ebf06dfe7cba949dfa12b7356975bfb5a0b6b23))
* add PWA installation support with platform-specific dialogs ([682fbd6](https://github.com/FatahChan/finflow/commit/682fbd637525d5fb45fa9ca0af500417f3c3d733))
* add PWA support and migrate from Netlify to Vercel deployment ([b24f56b](https://github.com/FatahChan/finflow/commit/b24f56bffdf168ec20640c811db8c9adf395e864))
* disable SSR for protected routes and remove unused dependencies ([662fc9a](https://github.com/FatahChan/finflow/commit/662fc9ae713efe5195311eee10f4308ce6492cc5))
* implement auth system with better-auth and user-specific transactions ([985a525](https://github.com/FatahChan/finflow/commit/985a5259dc6c098b31d12436f16021d962032940))
* implement dark mode with next-themes and update UI icons ([21a8453](https://github.com/FatahChan/finflow/commit/21a845301d16f3d4229bba9099a72f8634715849))
* implement database integration with drizzle and legend-state for accounts and transactions ([fc4edbf](https://github.com/FatahChan/finflow/commit/fc4edbf9f93bdc56b58156daa133c31ce4877f07))
* implement instant db permissions and schema for accounts and transactions ([35daa8c](https://github.com/FatahChan/finflow/commit/35daa8c3e3145b88bf59bc24836e2e781246050e))
* implement protected routes and UI components with shadcn styling ([141bc95](https://github.com/FatahChan/finflow/commit/141bc95cdc579fc5ab17f2c912c5e430713ba4b5))
* implement PWA install functionality with UI prompts and offline support ([9c19722](https://github.com/FatahChan/finflow/commit/9c19722f33cb3483ef496c8b7d7298093a17b4e1))
* implement user data deletion and export functionality with env validation ([a5e5698](https://github.com/FatahChan/finflow/commit/a5e5698b92863aa5db73f045049ffea68ced2597))
* improve UI with PWA support, select styling and account navigation ([0075d26](https://github.com/FatahChan/finflow/commit/0075d26611f0db20d248c35ced375ab290d1db8d))
* link new accounts to user during creation ([5a3f499](https://github.com/FatahChan/finflow/commit/5a3f499afab1294b29ef102cbe591421e1644fbd))
* update color scheme to use shadcn theme variables and reorganize dashboard routes ([69ec70b](https://github.com/FatahChan/finflow/commit/69ec70b46818561c534861e16b7c497d5c20267f))
* update UI icons, branding and remove unused dependencies ([9a8e976](https://github.com/FatahChan/finflow/commit/9a8e97620a045dafcb2fc02e0ef4ffe717025086))


### Performance Improvements

* lazy load Calendar component to improve initial load time ([e0c0684](https://github.com/FatahChan/finflow/commit/e0c068460e934b69281606c169878e9ffd01df5d))
