import prisma from './prisma'

export class ConversationDateFilterError extends Error {}

const FILTER_TIME_ZONE = 'America/Bogota'
const timeZoneFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: FILTER_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23'
})

function getTimeZoneOffset(date: Date) {
  const parts = timeZoneFormatter.formatToParts(date)
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
    date.getUTCMilliseconds()
  )
  return asUtc - date.getTime()
}

function parseDateOnly(value: string | undefined, endOfDay = false) {
  if (!value) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined

  const [year, month, day] = value.split('-').map(Number)
  const calendarDate = new Date(Date.UTC(year, month - 1, day))
  if (
    Number.isNaN(calendarDate.getTime()) ||
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== month - 1 ||
    calendarDate.getUTCDate() !== day
  ) return undefined

  const localWallClock = Date.UTC(
    year,
    month - 1,
    day,
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0
  )
  const localDate = new Date(localWallClock)
  return new Date(localWallClock - getTimeZoneOffset(localDate))
}

export async function getFilteredConversations(ownerId: string, fromValue?: string, toValue?: string) {
  const fromDate = parseDateOnly(fromValue)
  const toDate = parseDateOnly(toValue, true)

  if (fromDate === undefined || toDate === undefined) {
    throw new ConversationDateFilterError('Las fechas deben usar el formato YYYY-MM-DD.')
  }

  if (fromDate && toDate && fromDate > toDate) {
    throw new ConversationDateFilterError('La fecha desde no puede ser posterior a la fecha hasta.')
  }

  const conversations = await prisma.conversation.findMany({
    where: { business: { ownerId } },
    include: { messages: { orderBy: { createdAt: 'asc' } } }
  })

  return conversations
    .map(conversation => {
      const lastMessage = conversation.messages[conversation.messages.length - 1]
      const lastActivityAt = lastMessage?.createdAt || conversation.createdAt
      return { conversation, lastActivityAt }
    })
    .filter(({ lastActivityAt }) => {
      if (fromDate && lastActivityAt < fromDate) return false
      if (toDate && lastActivityAt > toDate) return false
      return true
    })
    .sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime())
    .map(({ conversation, lastActivityAt }) => ({ ...conversation, lastActivityAt }))
}
