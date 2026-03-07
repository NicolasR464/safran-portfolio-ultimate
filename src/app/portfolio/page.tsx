import ky from 'ky'

import { localApiEndpoints } from '@/utils/constants'

const Portfolio = async () => {
    const portfolio = await ky(
        `${process.env.LOCAL_API}${localApiEndpoints.PORTFOLIO}`,
    ).json()
    console.log(portfolio)

    return (
        <div>
            <main>Portfolio</main>
        </div>
    )
}

export default Portfolio
