import { createHmac, timingSafeEqual } from 'crypto'
import type { NextApiRequest, NextApiResponse } from 'next'
import { secureCompare } from '../../../../lib/secure-compare'

const MAX_BODY_BYTES = 1024 * 1024
const N8N_TIMEOUT_MS = 8_000

class PayloadTooLargeError extends Error {}

function readRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let totalBytes = 0
    let tooLarge = false

    req.on('data', (chunk: Buffer | string) => {
      if (tooLarge) return

      const part = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      totalBytes += part.length
      if (totalBytes > MAX_BODY_BYTES) {
        tooLarge = true
        chunks.length = 0
        return
      }
      chunks.push(part)
    })

    req.once('end', () => {
      if (tooLarge) {
        reject(new PayloadTooLargeError())
        return
      }
      resolve(Buffer.concat(chunks, totalBytes))
    })

    req.once('error', reject)
    req.once('aborted', () => reject(new Error('Request body was aborted')))
  })
}

function singleQueryValue(req: NextApiRequest, key: string): string | undefined {
  const value = req.query[key]
  return typeof value === 'string' ? value : undefined
}

function hasValidMetaSignature(signatureHeader: unknown, rawBody: Buffer, appSecret: string): boolean {
  if (typeof signatureHeader !== 'string' || !/^sha256=[a-f0-9]{64}$/i.test(signatureHeader)) {
    return false
  }

  const received = Buffer.from(signatureHeader.slice('sha256='.length), 'hex')
  const expected = createHmac('sha256', appSecret).update(rawBody).digest()
  return received.length === expected.length && timingSafeEqual(received, expected)
}

function isWhatsAppWebhookPayload(value: unknown): boolean {
  return typeof value === 'object' && value !== null &&
    (value as Record<string, unknown>).object === 'whatsapp_business_account'
}

function getN8nWebhookUrl(value: string): URL | null {
  try {
    const url = new URL(value)
    const localDevelopmentHost = ['localhost', '127.0.0.1'].includes(url.hostname)
    if (url.username || url.password) return null
    if (url.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && localDevelopmentHost && url.protocol === 'http:')) {
      return null
    }
    return url
  } catch {
    return null
  }
}

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'GET') {
    const verifyToken = process.env.META_WHATSAPP_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN
    if (!verifyToken) return res.status(503).send('Webhook verification is not configured')

    const mode = singleQueryValue(req, 'hub.mode')
    const suppliedToken = singleQueryValue(req, 'hub.verify_token')
    const challenge = singleQueryValue(req, 'hub.challenge')
    if (mode !== 'subscribe' || !challenge || !secureCompare(suppliedToken, verifyToken)) {
      return res.status(403).send('Forbidden')
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    return res.status(200).send(challenge)
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const contentType = req.headers['content-type']
  if (typeof contentType !== 'string' || !contentType.toLowerCase().startsWith('application/json')) {
    return res.status(415).json({ error: 'Expected application/json' })
  }

  const appSecret = process.env.META_APP_SECRET
  const forwardSecret = process.env.N8N_WHATSAPP_FORWARD_SECRET
  const configuredN8nUrl = process.env.N8N_WHATSAPP_WEBHOOK_URL
  if (!appSecret || !forwardSecret || forwardSecret.length < 32 || !configuredN8nUrl) {
    return res.status(503).json({ error: 'WhatsApp webhook is not configured' })
  }

  let rawBody: Buffer
  try {
    rawBody = await readRawBody(req)
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return res.status(413).json({ error: 'Payload too large' })
    }
    return res.status(400).json({ error: 'Invalid request body' })
  }

  if (rawBody.length === 0 || !hasValidMetaSignature(req.headers['x-hub-signature-256'], rawBody, appSecret)) {
    return res.status(401).json({ error: 'Invalid webhook signature' })
  }

  let payload: unknown
  try {
    payload = JSON.parse(rawBody.toString('utf8'))
  } catch {
    return res.status(400).json({ error: 'Invalid JSON payload' })
  }
  if (!isWhatsAppWebhookPayload(payload)) {
    return res.status(400).json({ error: 'Unsupported webhook payload' })
  }

  const n8nUrl = getN8nWebhookUrl(configuredN8nUrl)
  if (!n8nUrl) return res.status(503).json({ error: 'WhatsApp forwarding is not configured' })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), N8N_TIMEOUT_MS)
  try {
    const upstream = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telar-webhook-secret': forwardSecret
      },
      body: rawBody,
      redirect: 'error',
      signal: controller.signal
    })
    if (!upstream.ok) {
      return res.status(502).json({ error: 'WhatsApp event could not be forwarded' })
    }
  } catch {
    return res.status(502).json({ error: 'WhatsApp event could not be forwarded' })
  } finally {
    clearTimeout(timeout)
  }

  return res.status(200).json({ received: true })
}
