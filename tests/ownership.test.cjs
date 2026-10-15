const assert = require('node:assert/strict')
const { after, beforeEach, test } = require('node:test')

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'CommonJS', moduleResolution: 'node' }
})

const envKeys = ['ADMIN_TOKEN', 'AI_TOKEN', 'ADMIN_USER_ID', 'AI_USER_ID']
const originalEnv = Object.fromEntries(envKeys.map(key => [key, process.env[key]]))
const prismaModulePath = require.resolve('../lib/prisma')
const originalPrismaModule = require.cache[prismaModulePath]

function unmockedOperation(name) {
  return () => {
    throw new Error(`Unmocked Prisma operation: ${name}`)
  }
}

function createPrismaDelegate(name) {
  return new Proxy({}, {
    get(target, property) {
      if (Reflect.has(target, property)) return Reflect.get(target, property)
      return unmockedOperation(`${name}.${String(property)}`)
    },
    set(target, property, value) {
      return Reflect.set(target, property, value)
    }
  })
}

const prisma = new Proxy({
  user: createPrismaDelegate('user'),
  business: createPrismaDelegate('business'),
  digitalProfile: createPrismaDelegate('digitalProfile'),
  tag: createPrismaDelegate('tag'),
  conversation: createPrismaDelegate('conversation'),
  message: createPrismaDelegate('message'),
  $transaction: unmockedOperation('$transaction')
}, {
  get(target, property) {
    if (Reflect.has(target, property)) return Reflect.get(target, property)
    return unmockedOperation(`prisma.${String(property)}`)
  }
})

require.cache[prismaModulePath] = {
  id: prismaModulePath,
  filename: prismaModulePath,
  loaded: true,
  exports: { __esModule: true, default: prisma }
}

process.env.ADMIN_TOKEN = 'test-admin-token'
process.env.AI_TOKEN = 'test-ai-token'
process.env.ADMIN_USER_ID = 'user-a'
process.env.AI_USER_ID = 'user-a'

const adminProfiles = require('../pages/api/profiles/index.ts').default
const patchProfile = require('../pages/api/profiles/[id].ts').default
const createTag = require('../pages/api/tags/index.ts').default
const patchTag = require('../pages/api/tags/[id].ts').default
const aiConversations = require('../pages/api/ai/conversations.ts').default
const patchConversation = require('../pages/api/ai/conversations/[id].ts').default
const humanMessage = require('../pages/api/ai/conversations/[id]/messages.ts').default
const exportConversations = require('../pages/api/ai/conversations/export-json.ts').default
const aiMessage = require('../pages/api/ai/message.ts').default
const aiInit = require('../pages/api/ai/init.ts').default
const publicChat = require('../pages/api/chat/message.ts').default
const n8nChat = require('../pages/api/integrations/n8n/chat.ts').default
const aiContext = require('../services/ai/context')
const aiConversation = require('../services/ai/conversation')
const aiService = require('../services/ai/index.ts')
const { TELAR_AI_KNOWLEDGE } = require('../services/ai/knowledge')

const originalInfo = console.info
const originalError = console.error
const databaseMethods = new Map()
const contextOriginal = aiContext.getAIContext
const incomingOriginal = aiConversation.handleIncoming
const answerMessageOriginal = aiService.answerMessage

let users
let businesses
let profiles
let tags
let conversations
let writes
let queries

function remember(target, key, replacement) {
  let methods = databaseMethods.get(target)
  if (!methods) {
    methods = new Map()
    databaseMethods.set(target, methods)
  }
  if (!methods.has(key)) methods.set(key, target[key])
  target[key] = replacement
}

function matchesOwner(businessId, ownerId) {
  return businesses.some(business => business.id === businessId && business.ownerId === ownerId)
}

function fixtureResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this },
    send(body) { this.body = body; return this },
    setHeader() {},
    end() { return this }
  }
}

function apiRequest(method, principal, query = {}, body = {}, tokenType = 'admin') {
  return {
    method,
    query,
    body,
    cookies: {},
    headers: tokenType === 'admin'
      ? { 'x-admin-token': process.env.ADMIN_TOKEN }
      : { 'x-ai-token': process.env.AI_TOKEN },
    principal
  }
}

async function call(handler, req) {
  const res = fixtureResponse()
  await handler(req, res)
  return res
}

function resetFixtures() {
  users = [{ id: 'user-a' }, { id: 'user-b' }]
  businesses = [
    { id: 'business-a', name: 'Business A', ownerId: 'user-a', profileId: 'profile-a' },
    { id: 'business-b', name: 'Business B', ownerId: 'user-b', profileId: 'profile-b' },
    {
      id: 'ai-business-a', name: 'TELAR AI', ownerId: 'user-a', profileId: null,
      knowledge: TELAR_AI_KNOWLEDGE.map((item, index) => ({ id: `kb-${index}`, ...item }))
    }
  ]
  profiles = [
    { id: 'profile-a', businessId: 'business-a', title: 'Perfil A', description: 'Perfil A', business: { name: 'Business A', contactPhone: '+34123456789', whatsapp: '+34123456789' } },
    { id: 'profile-b', businessId: 'business-b', title: 'Perfil B', description: 'Perfil B', business: { name: 'Business B', contactPhone: '+34123456789', whatsapp: '+34123456789' } }
  ]
  tags = [
    { id: 'tag-a', identifier: 'tag-a', status: 'active', profileId: 'profile-a' },
    { id: 'tag-b', identifier: 'tag-b', status: 'active', profileId: 'profile-b' }
  ]
  conversations = [
    { id: 'conversation-a', businessId: 'business-a', from: 'fixture-a', state: 'open', createdAt: new Date('2026-01-01T00:00:00Z'), messages: [] },
    { id: 'conversation-b', businessId: 'business-b', from: 'fixture-b', state: 'open', createdAt: new Date('2026-01-02T00:00:00Z'), messages: [] }
  ]
  writes = []
  queries = []
}

function installPrismaFakes() {
  remember(prisma.user, 'findUnique', async ({ where }) => users.find(user => user.id === where.id) || null)

  remember(prisma.business, 'findFirst', async args => {
    queries.push({ model: 'business.findFirst', args })
    return businesses.find(business => business.name === args.where.name && business.profileId === null) || null
  })

  remember(prisma.business, 'update', async args => {
    writes.push({ model: 'business.update', args })
    const business = businesses.find(item => item.id === args.where.id)
    if (business) Object.assign(business, args.data)
    return business
  })

  remember(prisma.digitalProfile, 'findMany', async ({ where }) => {
    queries.push({ model: 'profile.findMany', where })
    return profiles.filter(profile => matchesOwner(profile.businessId, where.business.ownerId))
  })

  remember(prisma.digitalProfile, 'findFirst', async ({ where }) => {
    queries.push({ model: 'profile.findFirst', where })
    return profiles.find(profile => profile.id === where.id && matchesOwner(profile.businessId, where.business.ownerId)) || null
  })

  remember(prisma.digitalProfile, 'update', async args => {
    writes.push({ model: 'profile.update', args })
    const profile = profiles.find(item => item.id === args.where.id)
    if (profile) Object.assign(profile, args.data)
    return profile
  })

  remember(prisma.digitalProfile, 'findUnique', async ({ where }) => profiles.find(profile => profile.id === where.id) || null)

  remember(prisma.tag, 'findFirst', async ({ where }) => {
    queries.push({ model: 'tag.findFirst', where })
    return tags.find(tag => tag.identifier === where.identifier && matchesOwner(
      profiles.find(profile => profile.id === tag.profileId)?.businessId,
      where.profile.business.ownerId
    )) || null
  })

  remember(prisma.tag, 'update', async args => {
    writes.push({ model: 'tag.update', args })
    const tag = tags.find(item => item.id === args.where.id)
    if (tag) Object.assign(tag, args.data)
    return tag
  })

  remember(prisma.conversation, 'findMany', async ({ where }) => {
    queries.push({ model: 'conversation.findMany', where })
    return conversations.filter(conversation => matchesOwner(conversation.businessId, where.business.ownerId))
  })

  remember(prisma.conversation, 'findFirst', async ({ where }) => {
    queries.push({ model: 'conversation.findFirst', where })
    if (where.id) {
      return conversations.find(conversation => conversation.id === where.id && matchesOwner(conversation.businessId, where.business.ownerId)) || null
    }
    return conversations
      .filter(conversation => conversation.businessId === where.businessId && conversation.from === where.from && conversation.state === where.state)
      .sort((left, right) => right.createdAt - left.createdAt)[0] || null
  })

  remember(prisma.conversation, 'update', async args => {
    writes.push({ model: 'conversation.update', args })
    const conversation = conversations.find(item => item.id === args.where.id)
    if (conversation) Object.assign(conversation, args.data)
    return conversation
  })

  remember(prisma.message, 'create', async args => {
    const message = {
      id: `message-${writes.filter(write => write.model === 'message.create').length + 1}`,
      conversationId: args.data.conversationId,
      from: args.data.from,
      text: args.data.text,
      isFromAI: args.data.isFromAI,
      createdAt: new Date('2026-09-30T00:00:00.000Z')
    }
    writes.push({ model: 'message.create', args })
    return message
  })

  remember(prisma, '$transaction', async callback => callback({
    business: {
      create: async ({ data }) => {
        writes.push({ model: 'business.create', data })
        const business = { id: `created-${businesses.length}`, ...data, profileId: `created-profile-${profiles.length}` }
        businesses.push(business)
        profiles.push({ id: business.profileId, businessId: business.id, ...data.profile.create, business: { name: data.name, contactPhone: data.contactPhone, whatsapp: data.whatsapp } })
        return { ...business, profile: { id: business.profileId } }
      },
      update: async args => {
        writes.push({ model: 'business.update', args })
        const business = businesses.find(item => item.id === args.where.id)
        if (business) Object.assign(business, args.data)
        return business
      }
    },
    tag: {
      create: async ({ data }) => {
        writes.push({ model: 'tag.create', data })
        const tag = { id: `created-tag-${tags.length}`, ...data }
        tags.push(tag)
        return tag
      }
    },
    digitalProfile: {
      update: async args => {
        writes.push({ model: 'profile.update', args })
        const profile = profiles.find(item => item.id === args.where.id)
        if (profile) Object.assign(profile, args.data)
        return profile
      },
      findUnique: async ({ where }) => profiles.find(profile => profile.id === where.id) || null
    },
  }))
}

beforeEach(() => {
  aiContext.getAIContext = contextOriginal
  aiConversation.handleIncoming = incomingOriginal
  aiService.answerMessage = answerMessageOriginal
  process.env.ADMIN_USER_ID = 'user-a'
  process.env.AI_USER_ID = 'user-a'
  resetFixtures()
  installPrismaFakes()
})

after(() => {
  for (const [target, methods] of databaseMethods) {
    for (const [key, original] of methods) target[key] = original
  }
  aiContext.getAIContext = contextOriginal
  aiConversation.handleIncoming = incomingOriginal
  aiService.answerMessage = answerMessageOriginal
  console.info = originalInfo
  console.error = originalError
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  if (originalPrismaModule) require.cache[prismaModulePath] = originalPrismaModule
  else delete require.cache[prismaModulePath]
})

test('TAG profile reads are scoped independently to users A and B', async () => {
  for (const [owner, expectedProfile] of [['user-a', 'profile-a'], ['user-b', 'profile-b']]) {
    process.env.ADMIN_USER_ID = owner
    const res = await call(adminProfiles, apiRequest('GET', owner))
    assert.equal(res.statusCode, 200)
    assert.deepEqual(res.body.map(profile => profile.id), [expectedProfile])
  }
})

test('TAG profile patch permits owner and denies cross-owner access in both directions', async () => {
  const payload = { title: 'Actualizado', description: 'Descripcion valida', contactPhone: '+34123456789', whatsapp: '+34123456789' }
  process.env.ADMIN_USER_ID = 'user-a'
  assert.equal((await call(patchProfile, apiRequest('PATCH', 'user-a', { id: 'profile-a' }, payload))).statusCode, 200)
  assert.equal((await call(patchProfile, apiRequest('PATCH', 'user-a', { id: 'profile-b' }, payload))).statusCode, 404)
  process.env.ADMIN_USER_ID = 'user-b'
  assert.equal((await call(patchProfile, apiRequest('PATCH', 'user-b', { id: 'profile-a' }, payload))).statusCode, 404)
  assert.equal((await call(patchProfile, apiRequest('PATCH', 'user-b', { id: 'profile-b' }, payload))).statusCode, 200)
})

test('TAG status patch permits owner and denies cross-owner access in both directions', async () => {
  process.env.ADMIN_USER_ID = 'user-a'
  assert.equal((await call(patchTag, apiRequest('PATCH', 'user-a', { id: 'tag-a' }, { status: 'inactive' }))).statusCode, 200)
  assert.equal((await call(patchTag, apiRequest('PATCH', 'user-a', { id: 'tag-b' }, { status: 'inactive' }))).statusCode, 404)
  process.env.ADMIN_USER_ID = 'user-b'
  assert.equal((await call(patchTag, apiRequest('PATCH', 'user-b', { id: 'tag-a' }, { status: 'inactive' }))).statusCode, 404)
  assert.equal((await call(patchTag, apiRequest('PATCH', 'user-b', { id: 'tag-b' }, { status: 'inactive' }))).statusCode, 200)
})

test('TAG creation always takes ownerId from the authenticated server principal', async () => {
  process.env.ADMIN_USER_ID = 'user-b'
  const res = await call(createTag, apiRequest('POST', 'user-b', {}, {
    name: 'Nuevo negocio', description: 'Descripcion', contactPhone: '+34123456789', whatsapp: '+34123456789',
    identifier: 'new-tag', status: 'active', ownerId: 'user-a'
  }))
  assert.equal(res.statusCode, 201)
  assert.equal(writes.find(write => write.model === 'business.create').data.ownerId, 'user-b')
})

test('AI conversation list and export are scoped to each owner', async () => {
  for (const [owner, expectedConversation] of [['user-a', 'conversation-a'], ['user-b', 'conversation-b']]) {
    process.env.AI_USER_ID = owner
    const list = await call(aiConversations, apiRequest('GET', owner, {}, {}, 'ai'))
    assert.equal(list.statusCode, 200)
    assert.deepEqual(list.body.map(conversation => conversation.id), [expectedConversation])
    const exported = await call(exportConversations, apiRequest('GET', owner, {}, {}, 'ai'))
    assert.equal(exported.statusCode, 200)
    assert.deepEqual(JSON.parse(exported.body).conversations.map(conversation => conversation.conversationId), [expectedConversation])
  }
})

test('AI conversation patch permits owner and denies cross-owner access in both directions', async () => {
  process.env.AI_USER_ID = 'user-a'
  assert.equal((await call(patchConversation, apiRequest('PATCH', 'user-a', { id: 'conversation-a' }, { state: 'human' }, 'ai'))).statusCode, 200)
  assert.equal((await call(patchConversation, apiRequest('PATCH', 'user-a', { id: 'conversation-b' }, { state: 'human' }, 'ai'))).statusCode, 404)
  process.env.AI_USER_ID = 'user-b'
  assert.equal((await call(patchConversation, apiRequest('PATCH', 'user-b', { id: 'conversation-a' }, { state: 'human' }, 'ai'))).statusCode, 404)
  assert.equal((await call(patchConversation, apiRequest('PATCH', 'user-b', { id: 'conversation-b' }, { state: 'human' }, 'ai'))).statusCode, 200)
})

test('AI message ignores a client-selected businessId and uses the server context', async () => {
  process.env.AI_USER_ID = 'user-a'
  let contextOwner
  let usedBusiness
  aiContext.getAIContext = async ownerId => {
    contextOwner = ownerId
    return { id: 'ai-business-a' }
  }
  aiConversation.handleIncoming = async (businessId, from, text) => {
    usedBusiness = businessId
    return { conv: { id: 'new-conversation' }, aiReply: 'ok', from, text }
  }
  const res = await call(aiMessage, apiRequest('POST', 'user-a', {}, { businessId: 'business-b', from: 'fixture', text: 'hello' }, 'ai'))
  assert.equal(res.statusCode, 200)
  assert.equal(contextOwner, 'user-a')
  assert.equal(usedBusiness, 'ai-business-a')
})

test('AI init resolves the already-owned technical context without reassigning it', async () => {
  process.env.AI_USER_ID = 'user-a'
  const originalInfo = console.info
  console.info = () => {}
  try {
    const res = await call(aiInit, apiRequest('GET', 'user-a', {}, {}, 'ai'))
    assert.equal(res.statusCode, 200)
    assert.equal(res.body.success, true)
    assert.equal(businesses.find(business => business.id === 'ai-business-a').ownerId, 'user-a')
    assert.equal(writes.length, 0)
    assert.deepEqual(queries.find(query => query.model === 'business.findFirst').args.where, {
      name: 'TELAR AI',
      profile: { is: null }
    })
  } finally {
    console.info = originalInfo
  }
})

test('missing resources return controlled 404 responses', async () => {
  process.env.ADMIN_USER_ID = 'user-a'
  process.env.AI_USER_ID = 'user-a'
  const payload = { title: 'Missing', description: 'Descripcion valida', contactPhone: '+34123456789', whatsapp: '+34123456789' }
  assert.equal((await call(patchProfile, apiRequest('PATCH', 'user-a', { id: 'missing-profile' }, payload))).statusCode, 404)
  assert.equal((await call(patchTag, apiRequest('PATCH', 'user-a', { id: 'missing-tag' }, { status: 'inactive' }))).statusCode, 404)
  assert.equal((await call(patchConversation, apiRequest('PATCH', 'user-a', { id: 'missing-conversation' }, { state: 'human' }, 'ai'))).statusCode, 404)
})

test('AI handoff reuses the matching human conversation, persists the incoming message, and skips the AI', async () => {
  const humanConversation = {
    id: 'human-conversation',
    businessId: 'ai-business-a',
    from: 'public:session-a',
    state: 'human',
    createdAt: new Date('2026-02-01T00:00:00Z'),
    messages: []
  }
  conversations.push(humanConversation)
  let answerCalls = 0
  aiService.answerMessage = async () => {
    answerCalls += 1
    return 'No debe responder la IA'
  }

  const result = await aiConversation.handleIncoming('ai-business-a', 'public:session-a', '  Necesito ayuda  ')

  assert.equal(result.conv.id, 'human-conversation')
  assert.equal(result.aiReply, null)
  assert.equal(result.handedOff, true)
  assert.equal(answerCalls, 0)
  assert.deepEqual(queries.find(query => query.model === 'conversation.findFirst' && query.where.state === 'human').where, {
    businessId: 'ai-business-a',
    from: 'public:session-a',
    state: 'human'
  })
  assert.deepEqual(writes.find(write => write.model === 'message.create').args.data, {
    conversationId: 'human-conversation',
    from: 'public:session-a',
    text: 'Necesito ayuda',
    isFromAI: false
  })
})

test('AI continues to answer an open conversation and returns handedOff false', async () => {
  let answerCalls = 0
  aiService.answerMessage = async () => {
    answerCalls += 1
    return 'Respuesta de IA'
  }

  const result = await aiConversation.handleIncoming('business-a', 'fixture-a', 'Consulta abierta')

  assert.equal(result.conv.id, 'conversation-a')
  assert.equal(result.handedOff, false)
  assert.equal(result.aiReply, 'Respuesta de IA')
  assert.equal(answerCalls, 1)
})

test('human message endpoint authenticates, validates ownership and state, and returns the persisted message', async () => {
  const unauthorizedRequest = apiRequest('POST', null, { id: 'conversation-a' }, { text: 'Respuesta humana' }, 'ai')
  unauthorizedRequest.headers = {}
  assert.equal((await call(humanMessage, unauthorizedRequest)).statusCode, 401)

  for (const body of [{ text: '' }, { text: 42 }, { text: 'x'.repeat(2001) }]) {
    assert.equal((await call(humanMessage, apiRequest('POST', 'user-a', { id: 'conversation-a' }, body, 'ai'))).statusCode, 400)
  }

  assert.equal((await call(humanMessage, apiRequest('POST', 'user-a', { id: 'missing-conversation' }, { text: 'Respuesta' }, 'ai'))).statusCode, 404)
  assert.equal((await call(humanMessage, apiRequest('POST', 'user-a', { id: 'conversation-b' }, { text: 'Respuesta' }, 'ai'))).statusCode, 404)
  assert.equal((await call(humanMessage, apiRequest('POST', 'user-a', { id: 'conversation-a' }, { text: 'Respuesta' }, 'ai'))).statusCode, 409)

  conversations.find(conversation => conversation.id === 'conversation-a').state = 'human'
  const response = await call(humanMessage, apiRequest('POST', 'user-a', { id: 'conversation-a' }, { text: '  Respuesta del equipo  ' }, 'ai'))
  assert.equal(response.statusCode, 200)
  assert.deepEqual(Object.keys(response.body).sort(), ['conversationId', 'createdAt', 'from', 'id', 'isFromAI', 'text'].sort())
  assert.equal(response.body.conversationId, 'conversation-a')
  assert.equal(response.body.from, 'human')
  assert.equal(response.body.text, 'Respuesta del equipo')
  assert.equal(response.body.isFromAI, false)
  assert.ok(response.body.createdAt instanceof Date)
  assert.deepEqual(writes.find(write => write.model === 'message.create').args.data, {
    conversationId: 'conversation-a',
    from: 'human',
    text: 'Respuesta del equipo',
    isFromAI: false
  })
})

test('public chat reports handoff without an AI reply', async () => {
  const originalInfo = console.info
  console.info = () => {}
  conversations.push({
    id: 'public-human-conversation',
    businessId: 'ai-business-a',
    from: 'public:session-public',
    state: 'human',
    createdAt: new Date('2026-02-01T00:00:00Z'),
    messages: []
  })
  aiContext.getAIContext = async () => ({ id: 'ai-business-a', name: 'TELAR AI' })
  let answerCalls = 0
  aiService.answerMessage = async () => {
    answerCalls += 1
    return 'No debe responder la IA'
  }

  try {
    const response = await call(publicChat, apiRequest('POST', null, {}, { text: 'Necesito ayuda', sessionId: 'session-public' }))
    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.body, { conversationId: 'public-human-conversation', aiReply: null, handedOff: true })
    assert.equal(answerCalls, 0)
    assert.deepEqual(writes.find(write => write.model === 'message.create').args.data, {
      conversationId: 'public-human-conversation',
      from: 'public:session-public',
      text: 'Necesito ayuda',
      isFromAI: false
    })
  } finally {
    console.info = originalInfo
  }
})

test('n8n chat reports handoff without an AI reply', async () => {
  const originalSecret = process.env.N8N_WEBHOOK_SECRET
  const originalInfo = console.info
  process.env.N8N_WEBHOOK_SECRET = 'test-n8n-secret'
  console.info = () => {}
  conversations.push({
    id: 'n8n-human-conversation',
    businessId: 'ai-business-a',
    from: 'n8n:session-n8n',
    state: 'human',
    createdAt: new Date('2026-02-01T00:00:00Z'),
    messages: []
  })
  aiContext.getAIContext = async () => ({ id: 'ai-business-a', name: 'TELAR AI' })
  let answerCalls = 0
  aiService.answerMessage = async () => {
    answerCalls += 1
    return 'No debe responder la IA'
  }

  try {
    const request = apiRequest('POST', null, {}, { text: 'Necesito ayuda', sessionId: 'session-n8n' })
    request.headers = { 'x-n8n-secret': process.env.N8N_WEBHOOK_SECRET }
    const response = await call(n8nChat, request)
    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.body, { conversationId: 'n8n-human-conversation', aiReply: null, handedOff: true })
    assert.equal(answerCalls, 0)
    assert.deepEqual(writes.find(write => write.model === 'message.create').args.data, {
      conversationId: 'n8n-human-conversation',
      from: 'n8n:session-n8n',
      text: 'Necesito ayuda',
      isFromAI: false
    })
  } finally {
    console.info = originalInfo
    if (originalSecret === undefined) delete process.env.N8N_WEBHOOK_SECRET
    else process.env.N8N_WEBHOOK_SECRET = originalSecret
  }
})
