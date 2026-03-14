'use client'

import { useCategoriesStore } from '@/stores/portfolio/categories'
import { useEffect } from 'react'

const CategoriesIsland = () => {
    const categories = useCategoriesStore((state) => state.categories)
    const initialized = useCategoriesStore((state) => state.initialized)
    const getCategories = useCategoriesStore((state) => state.getCategories)

    useEffect(() => {
        if (!initialized) {
            getCategories()
        }
    }, [initialized, getCategories])

    return (
        <>
            {categories.map((category) => (
                <div key={category}>{category}</div>
            ))}
        </>
    )
}

export default CategoriesIsland
