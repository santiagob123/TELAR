import type { NextApiRequest, NextApiResponse } from 'next'
import { ConversationDateFilterError, getFilteredConversations } from '../../../../lib/ai-conversations'
import { requireAiAccess } from '../../../../lib/ai-auth'

function csvCell(value: unknown) {
  let text = value == null ? '' : String(value)
  // Prevent formula execution when a CSV is opened in spreadsheet software.
  let firstVisibleCharacter = 0
  while (firstVisibleCharacter < text.length && text.charCodeAt(firstVisibleCharacter) <= 0x20) {
    firstVisibleCharacter += 1
  }
  if ('=+@-'.includes(text[firstVisibleCharacter] || '\0')) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

function getFilename(from?: string, to?: string) {
  if (from && to) return `telar-ai-conversations-${from}-to-${to}.csv`
  if (from) return `telar-ai-conversations-from-${from}.csv`
  if (to) return `telar-ai-conversations-to-${to}.csv`
  return 'telar-ai-conversations.csv'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const access = await requireAiAccess(req, res)
  if (!access) return

  const from = typeof req.query.from === 'string' ? req.query.from : undefined
  const to = typeof req.query.to === 'string' ? req.query.to : undefined

  try {
    const conversations = await getFilteredConversations(access.isGlobalAdmin ? undefined : access.ownerId, from, to)
    const rows: unknown[][] = [[
      'conversationId', 'business', 'ownerEmail', 'conversationCreatedAt', 'lastActivityAt', 'state', 'contact', 'messageCreatedAt', 'sender', 'message'
    ]]

    for (const conversation of conversations) {
      const lastActivityAt = conversation.lastActivityAt.toISOString()
      if (conversation.messages.length === 0) {
        rows.push([conversation.id, conversation.business.name, conversation.business.owner?.email || '', conversation.createdAt.toISOString(), lastActivityAt, conversation.state, conversation.from, '', '', ''])
        continue
      }
      for (const message of conversation.messages) {
        rows.push([
          conversation.id,
          conversation.business.name,
          conversation.business.owner?.email || '',
          conversation.createdAt.toISOString(),
          lastActivityAt,
          conversation.state,
          conversation.from,
          message.createdAt.toISOString(),
          message.from === 'human' ? 'Equipo' : message.isFromAI ? 'Asistente' : 'Cliente',
          message.text
        ])
      }
    }

    const csv = `\uFEFF${rows.map(row => row.map(csvCell).join(',')).join('\r\n')}`
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${getFilename(from, to)}"`)
    return res.status(200).send(csv)
  } catch (error) {
    if (error instanceof ConversationDateFilterError) return res.status(400).json({ error: error.message })
    console.error('[TELAR] conversation CSV export failed', error instanceof Error ? error.message : 'unknown error')
    return res.status(500).json({ error: 'No se pudieron exportar las conversaciones.' })
  }
}
