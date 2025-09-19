import { injectManifest } from 'workbox-build'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function workboxGenerate() {
  const clientDist = resolve(__dirname, '.tanstack/start/build/client-dist')
  const swDest = resolve(clientDist, 'sw.js')
  const buildId = Date.now().toString()

  await build({
    entryPoints: [resolve(__dirname, 'src/sw.ts')],
    bundle: true,
    outfile: swDest,
    format: 'esm',
    target: 'es2020',
    minify: true,
    define: {
      'import.meta.env.DEV': 'false',
      'self.__WB_BUILD_ID': `"${buildId}"`
    }
  })

  // could have used generateSW and skipped the esbuild stages, I just needed more customisability
  const { count, warnings, size } = await injectManifest({
    swSrc: swDest,
    swDest: swDest,
    globDirectory: clientDist,
    globPatterns: [
      '**/*.{js,css,html,svg,png,ico,webmanifest,json}',
    ],
  });

  if (warnings.length) {
    console.warn('[workbox] warnings:', warnings)
  }
  console.log(`[workbox] generated sw.js with ${count.toString()} precached files (${(size/1024).toFixed(1)} KiB)`)
}