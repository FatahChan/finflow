# FinFlow 💰

A modern, privacy-first personal finance management app built with React, TypeScript, and InstantDB. Track your expenses, manage multiple accounts, and gain insights into your spending patterns with a beautiful, responsive interface.

## ✨ Features

- **🔐 Secure Authentication** - Google OAuth integration with InstantDB
- **💳 Multi-Account Management** - Track multiple bank accounts, credit cards, and wallets
- **📊 Smart Analytics** - Visual insights into your spending patterns
- **🌙 Dark Mode Support** - Beautiful light and dark themes
- **📱 PWA Ready** - Install as a native app on any device
- **🔄 Real-time Sync** - Data syncs instantly across all devices
- **🛡️ Privacy First** - Your data stays private and secure
- **💸 Transaction Tracking** - Categorized income and expense tracking
- **🌍 Multi-Currency** - Support for multiple currencies with exchange rates
- **📴 Offline Support** - Works offline with service worker caching

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, TanStack Router
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Database**: InstantDB (real-time database)
- **State Management**: Legend State
- **Authentication**: Google OAuth via InstantDB
- **PWA**: Vite PWA plugin with Workbox
- **Build Tool**: Vite with Rolldown
- **Deployment**: Vercel
- **Release Management**: Release-it with conventional changelog

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Google OAuth credentials
- InstantDB app credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/FatahChan/finflow.git
   cd finflow
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   VITE_INSTANT_APP_ID=your_instant_app_id
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_GOOGLE_CLIENT_NAME=your_google_client_name
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Build for production**
   ```bash
   pnpm build
   ```

## 📱 PWA Installation

FinFlow can be installed as a Progressive Web App:

- **Desktop**: Click the install button in your browser's address bar
- **Mobile**: Use "Add to Home Screen" from your browser menu
- **In-app**: Use the install prompt within the application

## 🔧 Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm release` - Create a new release

### Project Structure

```
src/
├── components/          # Reusable UI components
├── routes/             # Page components and routing
├── lib/                # Utilities and configurations
├── actions/            # Server actions
└── instant.schema.ts   # InstantDB schema definition
```

## 🚢 Deployment

The app is configured for deployment on Vercel with:

- Automatic builds on push to main
- Preview deployments for pull requests
- PWA optimization and caching
- Release-based production deployments

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome through issues.
