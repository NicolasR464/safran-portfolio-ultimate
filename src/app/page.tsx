import NavigationsHome from '@/components/navigations/NavigationsHome'
import VideoHome from '@/components/VideoHome'

const Home = () => {
    return (
        <div className='fixed top-0 h-screen w-screen overflow-hidden bg-black'>
            <VideoHome />

            <NavigationsHome />
        </div>
    )
}

export default Home
