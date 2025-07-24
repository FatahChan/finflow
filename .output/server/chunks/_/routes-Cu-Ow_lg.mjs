import { d as createServerRpc, e as createServerFn } from './ssr.mjs';
import * as fs from 'node:fs';
import 'react/jsx-runtime';
import '@tanstack/react-router';
import '@tanstack/react-router/ssr/server';
import 'node:async_hooks';
import 'node:crypto';

const filePath = "count.txt";
async function readCount() {
  return parseInt(await fs.promises.readFile(filePath, "utf-8").catch(() => "0"));
}
const updateCount_createServerFn_handler = createServerRpc("src_routes_index_tsx--updateCount_createServerFn_handler", "/_serverFn", (opts, signal) => {
  return updateCount.__executeServer(opts, signal);
});
const updateCount = createServerFn({ method: "POST" }).validator((d) => d).handler(updateCount_createServerFn_handler, async ({ data }) => {
  const count = await readCount();
  await fs.promises.writeFile(filePath, `${count + data}`);
});

export { updateCount_createServerFn_handler };
//# sourceMappingURL=routes-Cu-Ow_lg.mjs.map
