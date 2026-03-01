/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PUT, DELETE } from './route'
import { prisma } from '@/lib/prisma'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}))

describe('/api/admin/users', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should return all users', async () => {
      const mockUsers = [{ id: '1', fullName: 'User 1' }]
      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any)

      const req = new Request('http://localhost/api/admin/users')
      const res = await GET(req as any)
      const data = await res.json()

      expect(res.status).toBe(200) // NextResponse.json defaults to 200
      expect(data).toEqual(mockUsers)
    })
  })

  describe('PUT', () => {
    it('should update user name', async () => {
      const updateData = { id: '1', fullName: 'Updated Name' }
      vi.mocked(prisma.user.update).mockResolvedValue(updateData as any)

      const req = new Request('http://localhost/api/admin/users', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })
      const res = await PUT(req as any)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toEqual(updateData)
    })

    it('should return 400 if id is missing', async () => {
      const req = new Request('http://localhost/api/admin/users', {
        method: 'PUT',
        body: JSON.stringify({ fullName: 'Updated Name' }),
      })
      const res = await PUT(req as any)
      expect(res.status).toBe(400)
    })
  })

  describe('DELETE', () => {
    it('should soft delete user', async () => {
      vi.mocked(prisma.user.update).mockResolvedValue({} as any)

      const req = new Request('http://localhost/api/admin/users', {
        method: 'DELETE',
        body: JSON.stringify({ id: '1' }),
      })
      const res = await DELETE(req as any)
      expect(res.status).toBe(200)
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isDelete: true },
      })
    })
  })
})
