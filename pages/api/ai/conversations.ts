import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { requireAiToken } from '../../../lib/ai-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (!requireAiToken(req, res)) return
  const convs = await prisma.conversation.findMany({ include: { messages: true } })
  return res.json(convs)
}
