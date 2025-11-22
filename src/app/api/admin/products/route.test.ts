import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST, PUT, DELETE } from './route'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/requireAdmin'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/requireAdmin', () => ({
  requireAdmin: vi.fn(),
}))

vi.mock('@/lib/utils/productHelpers', () => ({
  getProductsWithCategoryName: vi.fn(),
}))

import { getProductsWithCategoryName } from '@/lib/utils/productHelpers'

describe('/api/admin/products', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should return 401 if not admin', async () => {
      vi.mocked(requireAdmin).mockResolvedValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const req = new Request('http://localhost/api/admin/products')
      const res = await GET(req as any)
      expect(res.status).toBe(401)
    })

    it('should return products if admin', async () => {
      vi.mocked(requireAdmin).mockResolvedValue({ admin: true } as any)
      const mockProducts = [{ id: '1', name: 'Product 1' }]
      vi.mocked(getProductsWithCategoryName).mockResolvedValue(mockProducts as any)

      const req = new Request('http://localhost/api/admin/products')
      const res = await GET(req as any)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toEqual(mockProducts)
    })
  })

  describe('POST', () => {
    it('should create a product', async () => {
      vi.mocked(requireAdmin).mockResolvedValue({ admin: true } as any)
      const newProduct = {
        name: 'New Product',
        description: 'Desc',
        price: 100,
        categoryId: 'cat1',
        stock: 10,
      }
      const createdProduct = { ...newProduct, id: '1', category: { name: 'Cat 1' } }
      vi.mocked(prisma.product.create).mockResolvedValue(createdProduct as any)

      const req = new Request('http://localhost/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(newProduct),
      })
      const res = await POST(req as any)
      const data = await res.json()

      expect(res.status).toBe(201)
      expect(data).toEqual({ ...createdProduct, category: 'Cat 1' })
    })

    it('should return 400 if missing fields', async () => {
      vi.mocked(requireAdmin).mockResolvedValue({ admin: true } as any)
      const req = new Request('http://localhost/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({}),
      })
      const res = await POST(req as any)
      expect(res.status).toBe(400)
    })
  })

  describe('PUT', () => {
    it('should update a product', async () => {
      vi.mocked(requireAdmin).mockResolvedValue({ admin: true } as any)
      const updateData = { id: '1', name: 'Updated Product' }
      const updatedProduct = { ...updateData, category: { name: 'Cat 1' } }
      vi.mocked(prisma.product.update).mockResolvedValue(updatedProduct as any)

      const req = new Request('http://localhost/api/admin/products', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })
      const res = await PUT(req as any)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toEqual({ ...updatedProduct, category: 'Cat 1' })
    })
  })

  describe('DELETE', () => {
    it('should soft delete a product', async () => {
      vi.mocked(requireAdmin).mockResolvedValue({ admin: true } as any)
      vi.mocked(prisma.product.update).mockResolvedValue({} as any)

      const req = new Request('http://localhost/api/admin/products', {
        method: 'DELETE',
        body: JSON.stringify({ id: '1' }),
      })
      const res = await DELETE(req as any)
      expect(res.status).toBe(200)
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isDelete: true },
      })
    })
  })
})
