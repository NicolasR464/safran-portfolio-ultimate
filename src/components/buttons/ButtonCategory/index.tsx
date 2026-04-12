import ButtonGeneric from '@/components/buttons/ButtonGeneric'
import { useCategoriesStore } from '@/stores/portfolio/categories'
import { useThumbnailsStore } from '@/stores/portfolio/thumbnails'
import { keyToCategory } from '@/utils/constants'

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
        setActiveCategory(category)

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
    }

    const isActive = activeCategory === category
    const isLoading = isFetchingToClickedCategory && isActive

    return (
        <ButtonGeneric
            onPress={scrollToCategory}
            isDisabled={isFetchingToClickedCategory}
            className={`
            
                ${isActive && 'active-button'}

                ${isLoading && 'animate-glow'}
            `}
        >
            {keyToCategory[category]}
        </ButtonGeneric>
    )
}

export default ButtonCategory
