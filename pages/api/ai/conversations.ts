import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const convs = await prisma.conversation.findMany({ include: { messages: true } })
  return res.json(convs)
}
