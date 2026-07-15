import { VideoPlayerType } from '@/types/project'

/**
 * Extracts the video platform and video identifier from a supported URL.
 *
 * Supported providers:
 * - YouTube
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://m.youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 * - Vimeo
 *   - https://vimeo.com/VIDEO_ID
 *   - https://player.vimeo.com/video/VIDEO_ID
 *
 * @param url Video URL.
 * @returns The video player and extracted video ID, or null if the URL is
 * invalid or from an unsupported provider.
 */
export const getVideoInfoFromUrl = (
    url: string,
): {
    player: VideoPlayerType
    id: string
} | null => {
    try {
        const parsedUrl = new URL(url)
        const hostname = parsedUrl.hostname.replace(/^www\./, '')

        /*
         * Standard YouTube URLs.
         * Example:
         * https://www.youtube.com/watch?v=dQw4w9WgXcQ
         */
        if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
            const id = parsedUrl.searchParams.get('v')

            if (!id) return null

            return {
                player: VideoPlayerType.enum.youtube,
                id,
            }
        }

        /*
         * Shortened YouTube URLs.
         * Example:
         * https://youtu.be/dQw4w9WgXcQ
         */
        if (hostname === 'youtu.be') {
            const id = parsedUrl.pathname.slice(1)

            if (!id) return null

            return {
                player: VideoPlayerType.enum.youtube,
                id,
            }
        }

        /*
         * Standard Vimeo URLs.
         * Example:
         * https://vimeo.com/123456789
         */
        if (hostname === 'vimeo.com') {
            const id = parsedUrl.pathname.split('/').filter(Boolean).pop()

            if (!id) return null

            return {
                player: VideoPlayerType.enum.vimeo,
                id,
            }
        }

        /*
         * Embedded Vimeo player URLs.
         * Example:
         * https://player.vimeo.com/video/123456789
         */
        if (hostname === 'player.vimeo.com') {
            const id = parsedUrl.pathname.split('/').filter(Boolean).pop()

            if (!id) return null

            return {
                player: VideoPlayerType.enum.vimeo,
                id,
            }
        }

        // Unsupported video provider.
        return null
    } catch {
        // Invalid URL.
        return null
    }
}

/**
 * Builds the embeddable iframe URL for a supported video provider.
 *
 * Supported providers:
 * - YouTube → https://www.youtube.com/embed/{VIDEO_ID}
 * - Vimeo   → https://player.vimeo.com/video/{VIDEO_ID}
 *
 * @param videoType The video provider.
 * @param videoId The provider-specific video identifier.
 * @returns The embeddable URL, or an empty string if the provider is unsupported.
 */
export const embedSrcBuilder = (
    videoType: VideoPlayerType,
    videoId: string,
): string => {
    switch (videoType) {
        /*
         * Standard YouTube embed URL.
         * Example:
         * https://www.youtube.com/embed/dQw4w9WgXcQ
         */
        case VideoPlayerType.enum.youtube:
            return `https://www.youtube.com/embed/${videoId}`

        /*
         * Standard Vimeo embed URL.
         * Example:
         * https://player.vimeo.com/video/123456789
         */
        case VideoPlayerType.enum.vimeo:
            return `https://player.vimeo.com/video/${videoId}`

        // Unsupported video provider.
        default:
            return ''
    }
}
