import { useThumbnailsStore } from '@/stores/portfolio/thumbnails'
import { keyToCategory } from '@/utils/constants'

import { Button as ReactAriaButton } from 'react-aria-components'

type ButtonCategoryProperties = {
    category: string
    active?: boolean
}

const ButtonCategory = ({
    category,
    active = true,
}: ButtonCategoryProperties) => {
    const categoriesFetched = useThumbnailsStore(
        (state) => state.categoriesFetched,
    )
    const fetchNewCategory = useThumbnailsStore(
        (state) => state.fetchNewCategory,
    )

    const isCategoryAlreadyFetched = categoriesFetched.includes(category)

    const scrollToCategory = async () => {
        // If the category is not already fetched, fetch it.
        if (!isCategoryAlreadyFetched) {
            await fetchNewCategory(category)
        }

        const elementCategory = document.getElementById(category)

        if (!elementCategory) return

        const offset = 440

        const y =
            elementCategory.getBoundingClientRect().top +
            window.scrollY -
            offset

        window.scrollTo({
            top: y,
            behavior: 'smooth',
        })

        elementCategory.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        })
    }

    return (
        <ReactAriaButton
            onPress={scrollToCategory}
            className={`
  group relative cursor-pointer
  m-2 px-5 py-2.5
  flex items-center justify-center gap-2
  rounded-full text-sm font-medium
  text-white/90

  border 
  ${active ? 'border-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'border-white/30'}
  backdrop-blur-2xl

  transition-all duration-300 ease-out
  hover:-translate-y-[1px]
  active:scale-95

  before:absolute before:inset-0
  before:rounded-full
  before:bg-gradient-to-b
  before:from-white/40
  before:to-white/5
  before:opacity-40
  before:pointer-events-none

  after:absolute after:inset-0
  after:rounded-full
  after:ring-1
  after:ring-inset
  after:ring-white/20
  after:pointer-events-none

  ${
      active
          ? 'shadow-[0_0_25px_rgba(255,255,255,0.35),0_0_60px_rgba(255,255,255,0.15)]'
          : 'bg-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.25)]'
  }
`}
        >
            <span
                className={`select-none text-shadow-[0_0_10px_rgba(255,255,255,0.8)] text-white font-poiret
text-xl ${active && 'font-bold'}`}
            >
                {keyToCategory[category]}
            </span>
        </ReactAriaButton>
    )
}

export default ButtonCategory
