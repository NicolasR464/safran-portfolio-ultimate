import NavigationHome from '@/components/navigations/NavigationHome'
import VideoHome from '@/components/VideoHome'

const Home = () => {
    return (
        <div className="fixed top-0 h-screen w-screen overflow-hidden bg-black">
            <VideoHome />

            <NavigationHome />
        </div>
    )
}

export default Home
