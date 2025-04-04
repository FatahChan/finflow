/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as LoginImport } from './routes/login'
import { Route as ProtectedImport } from './routes/_protected'
import { Route as ProtectedIndexImport } from './routes/_protected/index'
import { Route as ProtectedAccountIndexImport } from './routes/_protected/account.index'
import { Route as ProtectedAccountIdIndexImport } from './routes/_protected/account.$id.index'
import { Route as ProtectedAccountIdTransactionImport } from './routes/_protected/account.$id.transaction'

// Create/Update Routes

const LoginRoute = LoginImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const ProtectedRoute = ProtectedImport.update({
  id: '/_protected',
  getParentRoute: () => rootRoute,
} as any)

const ProtectedIndexRoute = ProtectedIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => ProtectedRoute,
} as any)

const ProtectedAccountIndexRoute = ProtectedAccountIndexImport.update({
  id: '/account/',
  path: '/account/',
  getParentRoute: () => ProtectedRoute,
} as any)

const ProtectedAccountIdIndexRoute = ProtectedAccountIdIndexImport.update({
  id: '/account/$id/',
  path: '/account/$id/',
  getParentRoute: () => ProtectedRoute,
} as any)

const ProtectedAccountIdTransactionRoute =
  ProtectedAccountIdTransactionImport.update({
    id: '/account/$id/transaction',
    path: '/account/$id/transaction',
    getParentRoute: () => ProtectedRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_protected': {
      id: '/_protected'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof ProtectedImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/_protected/': {
      id: '/_protected/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof ProtectedIndexImport
      parentRoute: typeof ProtectedImport
    }
    '/_protected/account/': {
      id: '/_protected/account/'
      path: '/account'
      fullPath: '/account'
      preLoaderRoute: typeof ProtectedAccountIndexImport
      parentRoute: typeof ProtectedImport
    }
    '/_protected/account/$id/transaction': {
      id: '/_protected/account/$id/transaction'
      path: '/account/$id/transaction'
      fullPath: '/account/$id/transaction'
      preLoaderRoute: typeof ProtectedAccountIdTransactionImport
      parentRoute: typeof ProtectedImport
    }
    '/_protected/account/$id/': {
      id: '/_protected/account/$id/'
      path: '/account/$id'
      fullPath: '/account/$id'
      preLoaderRoute: typeof ProtectedAccountIdIndexImport
      parentRoute: typeof ProtectedImport
    }
  }
}

// Create and export the route tree

interface ProtectedRouteChildren {
  ProtectedIndexRoute: typeof ProtectedIndexRoute
  ProtectedAccountIndexRoute: typeof ProtectedAccountIndexRoute
  ProtectedAccountIdTransactionRoute: typeof ProtectedAccountIdTransactionRoute
  ProtectedAccountIdIndexRoute: typeof ProtectedAccountIdIndexRoute
}

const ProtectedRouteChildren: ProtectedRouteChildren = {
  ProtectedIndexRoute: ProtectedIndexRoute,
  ProtectedAccountIndexRoute: ProtectedAccountIndexRoute,
  ProtectedAccountIdTransactionRoute: ProtectedAccountIdTransactionRoute,
  ProtectedAccountIdIndexRoute: ProtectedAccountIdIndexRoute,
}

const ProtectedRouteWithChildren = ProtectedRoute._addFileChildren(
  ProtectedRouteChildren,
)

export interface FileRoutesByFullPath {
  '': typeof ProtectedRouteWithChildren
  '/login': typeof LoginRoute
  '/': typeof ProtectedIndexRoute
  '/account': typeof ProtectedAccountIndexRoute
  '/account/$id/transaction': typeof ProtectedAccountIdTransactionRoute
  '/account/$id': typeof ProtectedAccountIdIndexRoute
}

export interface FileRoutesByTo {
  '/login': typeof LoginRoute
  '/': typeof ProtectedIndexRoute
  '/account': typeof ProtectedAccountIndexRoute
  '/account/$id/transaction': typeof ProtectedAccountIdTransactionRoute
  '/account/$id': typeof ProtectedAccountIdIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/_protected': typeof ProtectedRouteWithChildren
  '/login': typeof LoginRoute
  '/_protected/': typeof ProtectedIndexRoute
  '/_protected/account/': typeof ProtectedAccountIndexRoute
  '/_protected/account/$id/transaction': typeof ProtectedAccountIdTransactionRoute
  '/_protected/account/$id/': typeof ProtectedAccountIdIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | ''
    | '/login'
    | '/'
    | '/account'
    | '/account/$id/transaction'
    | '/account/$id'
  fileRoutesByTo: FileRoutesByTo
  to: '/login' | '/' | '/account' | '/account/$id/transaction' | '/account/$id'
  id:
    | '__root__'
    | '/_protected'
    | '/login'
    | '/_protected/'
    | '/_protected/account/'
    | '/_protected/account/$id/transaction'
    | '/_protected/account/$id/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  ProtectedRoute: typeof ProtectedRouteWithChildren
  LoginRoute: typeof LoginRoute
}

const rootRouteChildren: RootRouteChildren = {
  ProtectedRoute: ProtectedRouteWithChildren,
  LoginRoute: LoginRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/_protected",
        "/login"
      ]
    },
    "/_protected": {
      "filePath": "_protected.tsx",
      "children": [
        "/_protected/",
        "/_protected/account/",
        "/_protected/account/$id/transaction",
        "/_protected/account/$id/"
      ]
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/_protected/": {
      "filePath": "_protected/index.tsx",
      "parent": "/_protected"
    },
    "/_protected/account/": {
      "filePath": "_protected/account.index.tsx",
      "parent": "/_protected"
    },
    "/_protected/account/$id/transaction": {
      "filePath": "_protected/account.$id.transaction.tsx",
      "parent": "/_protected"
    },
    "/_protected/account/$id/": {
      "filePath": "_protected/account.$id.index.tsx",
      "parent": "/_protected"
    }
  }
}
ROUTE_MANIFEST_END */
