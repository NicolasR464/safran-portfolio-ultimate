import NavigationHome from '@/components/navigations/NavigationHome'

const Home = () => {
    return (
        <div className="fixed top-0 h-screen w-screen overflow-hidden bg-black">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
            >
                <source
                    src="https://res.cloudinary.com/niikkoo/video/upload/v1774782613/saf_portfolio/home_page_video/6b09ac08-a29f-4021-9150-3d65f52d7e8e_plivcw.mp4"
                    type="video/mp4"
                />
            </video>

            <NavigationHome />
        </div>
    )
}

export default Home
