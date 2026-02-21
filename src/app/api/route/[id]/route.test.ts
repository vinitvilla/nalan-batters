/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'

describe('/api/route/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should decode valid base64 id', async () => {
      const routeData = { origin: 'A', destination: 'B' }
      const encodedId = btoa(JSON.stringify(routeData))

      const req = new Request(`http://localhost/api/route/${encodedId}`)
      const params = Promise.resolve({ id: encodedId })
      const res = await GET(req as any, { params } as any)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.route).toEqual(routeData)
    })

    it('should return 400 for invalid base64', async () => {
      const req = new Request('http://localhost/api/route/invalid')
      const params = Promise.resolve({ id: 'invalid' })
      const res = await GET(req as any, { params } as any)
      const data = await res.json()

      expect(res.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })
})
