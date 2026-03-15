'use client'

import { useCategoriesStore } from '@/stores/portfolio/categories'
import { useEffect } from 'react'
import Button from '@/components/Button'

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
        <div className="w-full flex justify-center">
            <div className="fixed top-16 flex">
                {categories.map((category) => (
                    <Button key={category} text={category} active />
                ))}
            </div>
        </div>
    )
}

export default CategoriesIsland
