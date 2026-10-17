import { timingSafeEqual } from 'crypto'

export function secureCompare(candidate: unknown, expected: string | undefined): candidate is string {
  if (typeof candidate !== 'string' || !expected) return false
  const candidateBytes = Buffer.from(candidate, 'utf8')
  const expectedBytes = Buffer.from(expected, 'utf8')
  return candidateBytes.length === expectedBytes.length && timingSafeEqual(candidateBytes, expectedBytes)
}
