import schema from '@/instant.schema';
import { init } from '@instantdb/react';
import { clientEnv } from './client-env';

// ID for app: finflow
const APP_ID = clientEnv.VITE_INSTANT_APP_ID;

export const db = init({ appId: APP_ID, schema: schema });
