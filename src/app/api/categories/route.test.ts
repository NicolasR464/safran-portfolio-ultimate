import { beforeEach, describe, expect, it, vi } from 'vitest'

import { backErrors } from '@/utils/constants/messages'

const { mockGetDb, mockDistinct, mockCollection } = vi.hoisted(() => ({
    mockGetDb: vi.fn(),
    mockDistinct: vi.fn(),
    mockCollection: vi.fn(),
}))

vi.mock('@/utils/mongo', () => ({
    getDb: mockGetDb,
}))

import { GET } from './route'

describe('GET /api/categories', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        mockCollection.mockReturnValue({
            distinct: mockDistinct,
        })
    })

    it('returns categories', async () => {
        mockGetDb.mockResolvedValue({
            collection: mockCollection,
        })

        mockDistinct.mockResolvedValue(['a', 'b'])

        const response = await GET()
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toEqual({ data: ['a', 'b'] })
        // assuming DB already filtered
        expect(['a', 'b']).not.toContain('home')
    })

    it('returns 500 when database connection fails', async () => {
        mockGetDb.mockResolvedValue(null)

        const response = await GET()
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(response.statusText).toBe(backErrors.DATABASE_CONNECTION_ERROR)
        expect(data).toBeNull()
    })

    it('returns 500 when category query fails', async () => {
        mockGetDb.mockResolvedValue({
            collection: mockCollection,
        })

        mockDistinct.mockResolvedValue(null)

        const response = await GET()
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(response.statusText).toBe(backErrors.DATABASE_QUERY_ERROR)
        expect(data).toBeNull()
    })
})
