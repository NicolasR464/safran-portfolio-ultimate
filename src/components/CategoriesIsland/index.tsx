'use client'

import { useCategoriesStore } from '@/stores/portfolio/categories'
import { useEffect } from 'react'
import ButtonCategory from '@/components/ButtonCategory'

const CategoriesIsland = () => {
    const categories = useCategoriesStore((state) => state.categories)
    const initialized = useCategoriesStore((state) => state.initialized)
    const getCategories = useCategoriesStore((state) => state.fetchCategories)

    useEffect(() => {
        if (!initialized) {
            getCategories()
        }
    }, [initialized, getCategories])

    return (
        <div className="w-full flex justify-center">
            <div className="fixed top-16 flex flex-wrap justify-center gap-4">
                {categories.map((category) => (
                    <ButtonCategory key={category} category={category} active />
                ))}
            </div>
        </div>
    )
}

export default CategoriesIsland
