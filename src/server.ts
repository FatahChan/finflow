import {
    createStartHandler,
    defaultStreamHandler,
  } from '@tanstack/react-start/server'
  import { createRouter } from './router'
   
  const handler = createStartHandler({
    createRouter,
  });
  
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  export default handler(defaultStreamHandler)