export const collections = {
    ABOUT: 'about',
    PROJECT_CATEGORIES: 'projectCategories',
    PROJECTS: 'projects',
    VIDEOS: 'videos',
}

export const searchParamsNames = {
    BATCH_NUMBER: 'batch_number',
    CATEGORY: 'category',
    SCREEN_SIZE: 'screen_size',
}

export const DEFAULT_BATCH_SIZE = 10

export const localLogos = {
    instagramLogo: { SRC: '/ig-logo.webp', ALT: 'Instagram logo' },
    loaderCinemaReel: { SRC: '/cinema-reel-white.png', ALT: 'Loading' },
    reel: { SRC: '/reel.png', ALT: 'Cinema reel' },
}

export const cloudinaryFolders = {
    MAIN:
        process.env.NEXT_PUBLIC_CLOUDINARY_MAIN_FOLDER ||
        process.env.CLOUDINARY_MAIN_FOLDER ||
        'saf_portfolio/',
    PORTFOLIO: 'portfolio',
    HOME_PAGE_VIDEO: 'home',
}
