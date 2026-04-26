import NavigationCategories from '@/components/navigations/NavigationCategories'
import Thumbnails from '@/components/Thumbnails'

/** Main Portfolio page displaying projects' thumbnails divided by categories. */
const Portfolio = async () => {
    return (
        <>
            <Thumbnails />

            <NavigationCategories />
        </>
    )
}

export default Portfolio
