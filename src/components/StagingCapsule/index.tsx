const StagingCapsule = () => {
    return (
        <div className="fixed flex t-0 text-white font-mono z-40 cursor-pointer mx-4 my-2 px-3 py-2 rounded-full border border-white/30 bg-white/[0.05] backdrop-blur-sm transition-all duration-700 hover:-translate-y-[1px] hover:brightness-110 flex items-center">
            <span>🚧</span>
            <span className="ml-2">STAGING</span>
        </div>
    )
}

export default StagingCapsule
