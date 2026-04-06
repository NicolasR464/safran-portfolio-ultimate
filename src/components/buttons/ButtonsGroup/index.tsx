import { ReactNode } from 'react'

const ButtonsGroup = ({ children }: { children: ReactNode }) => {
    return (
        <div className="w-full flex justify-center">
            <div className="fixed bottom-4 flex flex-wrap justify-center items-center gap-4">
                {children}
            </div>
        </div>
    )
}

export default ButtonsGroup
