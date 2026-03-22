'use client'

import { useEffect } from 'react'
import useIsMobile from '@/hooks/useIsMobile'
import { useCategoriesStore } from '@/stores/portfolio/categories'
import ButtonCategory from '@/components/ButtonCategory'
import { Select, SelectItem } from '@/components/Select'
import { keyToCategory } from '@/utils/constants'

const CategoriesIsland = () => {
    const categories = useCategoriesStore((state) => state.categories)
    const initialized = useCategoriesStore((state) => state.initialized)
    const getCategories = useCategoriesStore((state) => state.fetchCategories)
    const activeCategory = useCategoriesStore((state) => state.activeCategory)

    const isMobile = useIsMobile()

    useEffect(() => {
        if (!initialized) {
            getCategories()
        }
    }, [initialized, getCategories])

    return (
        <div className="w-full flex justify-center">
            <h2 className="fixed bottom-0.5">{activeCategory}</h2>
            <div className="fixed bottom-12 flex flex-wrap justify-center gap-4">
                {!isMobile && (
                    <>
                        {categories.map((category) => (
                            <ButtonCategory
                                key={category}
                                category={category}
                            />
                        ))}
                    </>
                )}

                {isMobile && (
                    <Select>
                        {categories.map((category) => (
                            <SelectItem key={category}>{category}</SelectItem>
                        ))}
                    </Select>
                )}
            </div>
        </div>
    )
}

export default CategoriesIsland
