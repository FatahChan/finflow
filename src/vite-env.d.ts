/// <reference types="vite/client" />

// Declare module for CSS imports
declare module "*.css" {
  const content: string;
  export default content;
}

// Declare module for CSS imports with ?url suffix
declare module "*.css?url" {
  const content: string;
  export default content;
}

// Declare module for CSS imports with ?inline suffix
declare module "*.css?inline" {
  const content: string;
  export default content;
}
