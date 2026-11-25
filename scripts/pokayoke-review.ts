/**
 * Sends this repo's source to pokayoke for a security review and prints the
 * findings grouped into proven, confirmed (by reading) and unproven.
 *
 *   npm run security:review
 *
 * Needs POKAYOKE_API_KEY in .env.local or .env (create a free key on
 * https://pokayoke.sh). Nothing is committed or deployed by this script.
 */
import fs from 'node:fs'
import path from 'node:path'
import { config as loadEnv } from 'dotenv'
import JSZip from 'jszip'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const API = 'https://pokayoke.sh'
const POLL_MS = 10_000
const TIMEOUT_MS = 20 * 60 * 1000
const MAX_ARCHIVE_BYTES = 24 * 1024 * 1024

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  '.vercel',
  '.freebuff',
  '.claude',
  '.windsurf',
  '.seo-check',
  '.agents',
  'migration-data',
])

const SKIP_FILES = [/^\.env/, /\.log$/, /\.tsbuildinfo$/, /-backup\.json$/]
const SKIP_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.svg',
  '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm', '.pdf', '.zip',
])

type Finding = {
  finding_id: string
  severity: string
  verdict: string
  tier: string
  title: string
  file: string
  line: number
  cwe: string | null
  verification?: { method?: string; reason?: string }
  notProvenHere?: boolean
}

type Review = {
  review_id: string
  status: string
  subject: string
  error: string | null
  findings: {
    total: number
    confirmed: number
    proven: number
    confirmed_by_reading?: number
    unproven: number
  }
  report_url: string
}

function archiveRepo(): Promise<{ buffer: Buffer; files: number }> {
  const zip = new JSZip()
  let files = 0

  const walk = (dir: string, prefix: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue
        walk(full, rel)
        continue
      }
      if (SKIP_FILES.some((re) => re.test(entry.name))) continue
      if (SKIP_EXT.has(path.extname(entry.name).toLowerCase())) continue
      zip.file(rel, fs.readFileSync(full))
      files++
    }
  }

  walk(process.cwd(), '')

  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }).then((buffer) => {
    if (buffer.byteLength > MAX_ARCHIVE_BYTES) {
      throw new Error(
        `archive is ${(buffer.byteLength / 1048576).toFixed(1)} MiB, over pokayoke's 25 MiB upload limit`
      )
    }
    return { buffer, files }
  })
}

async function call<T>(pathname: string, apiKey: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${pathname}`, {
    ...init,
    headers: { Authorization: `Bearer ${apiKey}`, ...(init.headers || {}) },
  })
  const body = (await res.json().catch(() => null)) as
    | (T & { error?: { code: string; message: string } })
    | null
  if (!res.ok || !body) {
    const code = body?.error?.code || `http_${res.status}`
    const message = body?.error?.message || res.statusText
    throw new Error(`pokayoke refused the request: ${code} (${message})`)
  }
  return body
}

function reportUrl(rel: string): string {
  return rel.startsWith('http') ? rel : `${API}${rel}`
}

function printGroup(label: string, rows: Finding[]) {
  console.log(`\n${label} (${rows.length})`)
  if (rows.length === 0) {
    console.log('  none')
    return
  }
  for (const f of rows) {
    const where = f.line > 0 ? `${f.file}:${f.line}` : f.file
    const cwe = f.cwe ? ` ${f.cwe}` : ''
    const carried = f.notProvenHere ? ' [carried, not re-proven here]' : ''
    console.log(`  - [${f.severity}]${cwe} ${f.title}${carried}`)
    console.log(`    ${where}`)
    if (f.verification?.reason) console.log(`    ${f.verification.reason}`)
  }
}

async function main() {
  const apiKey = (process.env.POKAYOKE_API_KEY || '').trim()
  if (!apiKey) {
    console.error('POKAYOKE_API_KEY is not set.')
    console.error('Create a free key on https://pokayoke.sh, then add it to .env.local as')
    console.error('POKAYOKE_API_KEY=<api_key> and run this again.')
    process.exit(1)
  }

  console.log('Packing this repo...')
  const { buffer, files } = await archiveRepo()
  console.log(`Packed ${files} source files (${(buffer.byteLength / 1048576).toFixed(2)} MiB).`)

  const form = new FormData()
  form.set('kind', 'upload')
  form.set('archive', new Blob([new Uint8Array(buffer)], { type: 'application/zip' }), 'repo.zip')

  const queued = await call<{ review_id: string; report_url: string }>('/api/v1/reviews', apiKey, {
    method: 'POST',
    body: form,
  })
  console.log(`Review ${queued.review_id} queued: ${reportUrl(queued.report_url)}`)

  const started = Date.now()
  let review = await call<Review>(`/api/v1/reviews/${queued.review_id}`, apiKey)
  let lastStatus = ''
  while (!['complete', 'partial', 'failed'].includes(review.status)) {
    if (Date.now() - started > TIMEOUT_MS) {
      console.log(`Still ${review.status} after 20 minutes; open ${reportUrl(review.report_url)} to watch it.`)
      return
    }
    if (review.status !== lastStatus) {
      lastStatus = review.status
      console.log(`pokayoke: ${review.status}`)
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_MS))
    review = await call<Review>(`/api/v1/reviews/${queued.review_id}`, apiKey)
  }

  console.log(`\npokayoke finished with status: ${review.status}`)
  if (review.error) console.log(`error: ${review.error}`)

  const { findings } = await call<{ findings: Finding[] }>(
    `/api/v1/reviews/${queued.review_id}/findings`,
    apiKey
  )

  const proven = findings.filter((f) => f.verdict === 'confirm' && f.tier === 'T0')
  const confirmed = findings.filter((f) => f.verdict === 'confirm' && f.tier !== 'T0')
  const unproven = findings.filter((f) => f.verdict === 'pending' || f.verdict === 'inconclusive')
  const refuted = findings.filter((f) => f.verdict === 'refute')

  printGroup('PROVEN (an executed run demonstrated the exploit)', proven)
  printGroup('CONFIRMED (confirmed by reading the code)', confirmed)
  printGroup('UNPROVEN (checked, not settled)', unproven)
  if (refuted.length > 0) console.log(`\nRefuted by pokayoke, not listed: ${refuted.length}`)

  const counts = review.findings
  console.log(
    `\nTotal ${counts.total}: ${counts.proven} proven, ${counts.confirmed_by_reading ?? confirmed.length} confirmed by reading, ${counts.unproven} unproven.`
  )
  console.log(`Report: ${reportUrl(review.report_url)}`)
}

main().catch((err: Error) => {
  console.error('FAILED ->', err.message)
  process.exit(1)
})
