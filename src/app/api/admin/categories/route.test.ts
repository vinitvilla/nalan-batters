/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST, PUT, DELETE } from './route'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/requireAdmin'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/requireAdmin', () => ({
  requireAdmin: vi.fn(),
}))

describe('/api/admin/categories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should return categories if admin', async () => {
      vi.mocked(requireAdmin).mockResolvedValue({ admin: true } as any)
      const mockCategories = [{ id: '1', name: 'Category 1' }]
      vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories as any)

      const req = new Request('http://localhost/api/admin/categories')
      const res = await GET(req as any)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toEqual(mockCategories)
    })
  })

  describe('POST', () => {
    it('should create a category', async () => {
      vi.mocked(requireAdmin).mockResolvedValue({ admin: true } as any)
      const newCategory = { name: 'New Category' }
      const createdCategory = { ...newCategory, id: '1' }
      vi.mocked(prisma.category.create).mockResolvedValue(createdCategory as any)

      const req = new Request('http://localhost/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify(newCategory),
      })
      const res = await POST(req as any)
      const data = await res.json()

      expect(res.status).toBe(201)
      expect(data).toEqual(createdCategory)
    })

    it('should return 400 if name is missing', async () => {
      vi.mocked(requireAdmin).mockResolvedValue({ admin: true } as any)
      const req = new Request('http://localhost/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify({}),
      })
      const res = await POST(req as any)
      expect(res.status).toBe(400)
    })
  })

  describe('PUT', () => {
    it('should update a category', async () => {
      vi.mocked(requireAdmin).mockResolvedValue({ admin: true } as any)
      const updateData = { id: '1', name: 'Updated Category' }
      vi.mocked(prisma.category.update).mockResolvedValue(updateData as any)

      const req = new Request('http://localhost/api/admin/categories', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })
      const res = await PUT(req as any)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toEqual(updateData)
    })
  })

  describe('DELETE', () => {
    it('should soft delete a category', async () => {
      vi.mocked(requireAdmin).mockResolvedValue({ admin: true } as any)
      vi.mocked(prisma.category.update).mockResolvedValue({} as any)

      const req = new Request('http://localhost/api/admin/categories', {
        method: 'DELETE',
        body: JSON.stringify({ id: '1' }),
      })
      const res = await DELETE(req as any)
      expect(res.status).toBe(200)
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isDelete: true },
      })
    })
  })
})
