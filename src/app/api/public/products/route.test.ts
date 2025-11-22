import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { NextResponse } from 'next/server'

// Mock the helper function
vi.mock('@/lib/utils/productHelpers', () => ({
  getProductsWithCategoryName: vi.fn(),
}))

import { getProductsWithCategoryName } from '@/lib/utils/productHelpers'

describe('GET /api/public/products', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return products with status 200', async () => {
    const mockProducts = [
      { id: '1', name: 'Product 1', category: 'Category 1' },
      { id: '2', name: 'Product 2', category: 'Category 2' },
    ]

    vi.mocked(getProductsWithCategoryName).mockResolvedValue(mockProducts as any)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockProducts)
  })

  it('should handle errors and return 500', async () => {
    const mockError = new Error('Database error')
    vi.mocked(getProductsWithCategoryName).mockRejectedValue(mockError)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch products')
  })
})
