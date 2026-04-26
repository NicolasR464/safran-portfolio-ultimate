export const collections = {
    PROJECTS: 'projects',
    ABOUT: 'about',
}

export const searchParamsNames = {
    BATCH_NUMBER: 'batch_number',
    CATEGORY: 'category',
    SCREEN_SIZE: 'screen_size',
}

export const DEFAULT_BATCH_SIZE = 10

export const keyToCategory: Record<string, string> = {
    music_video: 'Music Video',
    commercial: 'Commercial',
    narrative: 'Narrative',
    reel: 'Reel',
}

export const localLogos = {
    reel: { SRC: '/reel.png', ALT: 'Cinema reel' },
    loaderCinemaReel: { SRC: '/cinema-reel-white.png', ALT: 'Loading' },
    instagramLogo: { SRC: '/ig-logo.webp', ALT: 'Instagram logo' },
}
