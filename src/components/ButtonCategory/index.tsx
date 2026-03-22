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

    const scrollToCategory = async () => {
        setActiveCategory(category)

        if (!isCategoryAlreadyFetched) {
            await fetchNewCategory(category)
        }

        const elementCategory = document.getElementById(category)
        if (!elementCategory) return

        const offset = 200

        const y =
            elementCategory.getBoundingClientRect().top +
            window.scrollY -
            offset

        window.scrollTo({
            top: y,
            behavior: 'smooth',
        })
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
