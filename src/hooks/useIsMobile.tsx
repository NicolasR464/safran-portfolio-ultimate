import { useEffect, useState } from 'react'

const useIsMobile = (breakpoint = 500): boolean => {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const check = () => {
            setIsMobile(window.innerWidth < breakpoint)
        }

        check()

        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [breakpoint])

    return isMobile
}

export default useIsMobile
