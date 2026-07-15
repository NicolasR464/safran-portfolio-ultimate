import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ObjectId } from 'mongodb'

import { backErrors } from '@/utils/constants/messages'
import { collections } from '@/utils/constants'

const {
    mockGetDb,
    mockProjectsDistinct,
    mockCategoriesFind,
    mockCategoriesSort,
    mockCategoriesToArray,
    mockProjectsCollection,
    mockCategoriesCollection,
    mockCollection,
} = vi.hoisted(() => ({
    mockGetDb: vi.fn(),

    mockProjectsDistinct: vi.fn(),

    mockCategoriesFind: vi.fn(),
    mockCategoriesSort: vi.fn(),
    mockCategoriesToArray: vi.fn(),

    mockProjectsCollection: {
        distinct: vi.fn(),
    },

    mockCategoriesCollection: {
        find: vi.fn(),
    },

    mockCollection: vi.fn(),
}))

vi.mock('@/utils/mongo', () => ({
    getDb: mockGetDb,
}))

import { GET } from './route'

describe('GET /api/categories', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        mockProjectsCollection.distinct = mockProjectsDistinct
        mockCategoriesCollection.find = mockCategoriesFind

        mockCategoriesFind.mockReturnValue({
            sort: mockCategoriesSort,
        })

        mockCategoriesSort.mockReturnValue({
            toArray: mockCategoriesToArray,
        })

        mockCollection.mockImplementation((collectionName: string) => {
            if (collectionName === collections.PROJECTS) {
                return mockProjectsCollection
            }

            if (collectionName === collections.PROJECT_CATEGORIES) {
                return mockCategoriesCollection
            }

            throw new Error(`Unexpected collection: ${collectionName}`)
        })
    })

    it('returns categories referenced by projects', async () => {
        const categoryIds = [
            new ObjectId('6a1b4379aaaeae921cd51380'),
            new ObjectId('6a1b4391aaaeae921cd51382'),
        ]

        const categories = [
            {
                _id: categoryIds[0],
                name: 'Narrative',
                order: 1,
            },
            {
                _id: categoryIds[1],
                name: 'Reel',
                order: 2,
            },
        ]

        mockGetDb.mockResolvedValue({
            collection: mockCollection,
        })

        mockProjectsDistinct.mockResolvedValue(categoryIds)
        mockCategoriesToArray.mockResolvedValue(categories)

        const response = await GET()
        const data = await response.json()

        expect(response.status).toBe(200)

        expect(mockCollection).toHaveBeenCalledWith(collections.PROJECTS)
        expect(mockCollection).toHaveBeenCalledWith(
            collections.PROJECT_CATEGORIES,
        )

        expect(mockProjectsDistinct).toHaveBeenCalledWith('categoryId')

        expect(mockCategoriesFind).toHaveBeenCalledWith({
            _id: {
                $in: categoryIds,
            },
        })

        expect(mockCategoriesSort).toHaveBeenCalledWith({
            order: 1,
        })

        expect(mockCategoriesToArray).toHaveBeenCalledOnce()

        expect(data).toEqual({
            data: categories.map((category) => ({
                ...category,
                _id: category._id.toString(),
            })),
        })
    })

    it('returns 500 when database connection fails', async () => {
        mockGetDb.mockResolvedValue(null)

        const response = await GET()
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(response.statusText).toBe(backErrors.DATABASE_CONNECTION_ERROR)
        expect(data).toBeNull()

        expect(mockCollection).not.toHaveBeenCalled()
    })

    it('returns an empty category list when no project references a category', async () => {
        mockGetDb.mockResolvedValue({
            collection: mockCollection,
        })

        mockProjectsDistinct.mockResolvedValue([])
        mockCategoriesToArray.mockResolvedValue([])

        const response = await GET()
        const data = await response.json()

        expect(response.status).toBe(200)

        expect(mockCategoriesFind).toHaveBeenCalledWith({
            _id: {
                $in: [],
            },
        })

        expect(data).toEqual({
            data: [],
        })
    })
})
