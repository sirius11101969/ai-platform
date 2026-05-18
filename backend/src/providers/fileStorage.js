const fs = require('fs/promises')
const path = require('path')
const crypto = require('crypto')

const DEFAULT_STORAGE_ROOT = path.resolve(process.env.AI_ARTIFACT_STORAGE_ROOT || path.join(process.cwd(), 'storage', 'ai-artifacts'))

function assertSafeSegment(segment) {
  const value = String(segment || '').trim()
  if (!/^[a-zA-Z0-9._=-]+$/.test(value)) throw new Error('Unsafe storage path segment')
  return value
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

async function persistBuffer({ buffer, workspaceId, kind, extension, contentType, metadata = {} }) {
  const safeWorkspace = assertSafeSegment(workspaceId || 'global')
  const safeKind = assertSafeSegment(kind)
  const safeExtension = assertSafeSegment(extension || 'bin').replace(/^\./, '')
  const now = new Date()
  const relativeDir = path.join(safeWorkspace, safeKind, String(now.getUTCFullYear()), String(now.getUTCMonth() + 1).padStart(2, '0'))
  const absoluteDir = path.join(DEFAULT_STORAGE_ROOT, relativeDir)
  await ensureDir(absoluteDir)
  const id = crypto.randomUUID()
  const fileName = `${id}.${safeExtension}`
  const absolutePath = path.join(absoluteDir, fileName)
  await fs.writeFile(absolutePath, buffer, { flag: 'wx' })
  const metadataPath = `${absolutePath}.json`
  await fs.writeFile(metadataPath, JSON.stringify({ contentType, size: buffer.length, metadata, createdAt: now.toISOString() }, null, 2), { flag: 'wx' })
  return {
    id,
    storageRoot: DEFAULT_STORAGE_ROOT,
    path: absolutePath,
    relativePath: path.join(relativeDir, fileName),
    contentType,
    size: buffer.length,
  }
}

async function downloadAndPersist({ url, workspaceId, kind, extension, contentType, metadata }) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Artifact download failed with HTTP ${response.status}`)
  const arrayBuffer = await response.arrayBuffer()
  return persistBuffer({
    buffer: Buffer.from(arrayBuffer),
    workspaceId,
    kind,
    extension,
    contentType: contentType || response.headers.get('content-type') || 'application/octet-stream',
    metadata: { ...metadata, sourceUrl: url },
  })
}

module.exports = { persistBuffer, downloadAndPersist, DEFAULT_STORAGE_ROOT }
