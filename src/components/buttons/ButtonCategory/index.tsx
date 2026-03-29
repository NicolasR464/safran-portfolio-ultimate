import { useCategoriesStore } from '@/stores/portfolio/categories'
import { useThumbnailsStore } from '@/stores/portfolio/thumbnails'
import { keyToCategory } from '@/utils/constants'

import { Button as ReactAriaButton } from 'react-aria-components'

type ButtonCategoryProperties = {
    category: string
}

const ButtonCategory = ({ category }: ButtonCategoryProperties) => {
    const activeCategory = useCategoriesStore((state) => state.activeCategory)
    const setActiveCategory = useCategoriesStore(
        (state) => state.setActiveCategory,
    )
    const categoriesFetched = useThumbnailsStore(
        (state) => state.categoriesFetched,
    )
    const fetchNewCategory = useThumbnailsStore(
        (state) => state.fetchNewCategory,
    )
    const isFetchingToClickedCategory = useThumbnailsStore(
        (state) => state.isFetchingToClickedCategory,
    )

    const isCategoryAlreadyFetched = categoriesFetched.includes(category)

    const waitForElement = async (id: string, maxFrames = 30) => {
        for (let i = 0; i < maxFrames; i++) {
            const el = document.getElementById(id)
            if (el) return el
            await new Promise((resolve) => requestAnimationFrame(resolve))
        }
        return null
    }

    const scrollToCategory = async () => {
        if (!isCategoryAlreadyFetched) {
            await fetchNewCategory(category)
        }

        await new Promise((resolve) => requestAnimationFrame(resolve))

        const elementCategory = await waitForElement(category)
        if (!elementCategory) return

        elementCategory.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        })

        setActiveCategory(category)
    }

    const isActive = activeCategory === category
    const isLoading = isFetchingToClickedCategory && isActive

    return (
        <ReactAriaButton
            onPress={scrollToCategory}
            isDisabled={isFetchingToClickedCategory}
            className={`
                cursor-pointer
                m-2 px-5 py-2.5
                rounded-full
            
                border 
                backdrop-blur-sm
                transition-all duration-700

                hover:-translate-y-[1px]
                hover:brightness-110

                ${isActive ? 'active-button' : 'border-white/30 bg-white/[0.05]'}

                ${isLoading && 'animate-glow'}
            `}
        >
            <span
                className={`
                    font-poiret 
                    text-xl 
                    font-semibold
                    text-white

                    transition-all 
                    duration-700

                    ${isActive ? 'font-bold' : 'opacity-60'}
                `}
            >
                {keyToCategory[category]}
            </span>
        </ReactAriaButton>
    )
}

export default ButtonCategory
