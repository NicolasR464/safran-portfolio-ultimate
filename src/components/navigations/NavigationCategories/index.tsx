'use client'

import { useEffect } from 'react'
import useIsMobile from '@/hooks/useIsMobile'
import { useCategoriesStore } from '@/stores/portfolio/categories'
import ButtonCategory from '@/components/buttons/ButtonCategory'
import { Select, SelectItem } from '@/components/Select'
import ButtonsGroup from '@/components/buttons/ButtonsGroup'

/** Navigation by categories for the portfolio page */
const NavigationCategories = () => {
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
        <ButtonsGroup>
            {/* Desktop */}
            {!isMobile && (
                <div className="flex flex-wrap justify-center gap-4">
                    {categories.map((category) => (
                        <ButtonCategory key={category} category={category} />
                    ))}
                </div>
            )}

            {/* Mobile */}
            {isMobile && (
                <Select value={activeCategory}>
                    {categories.map((category) => (
                        <SelectItem
                            category={category}
                            key={category}
                            id={category}
                        >
                            {category}
                        </SelectItem>
                    ))}
                </Select>
            )}
        </ButtonsGroup>
    )
}

export default NavigationCategories
