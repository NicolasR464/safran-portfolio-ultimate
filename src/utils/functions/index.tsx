import { VideoPlayerType } from '@/types/project'

export const getVideoInfoFromUrl = (
    url: string,
): {
    player: VideoPlayerType
    id: string
} | null => {
    try {
        const parsedUrl = new URL(url)
        const hostname = parsedUrl.hostname.replace(/^www\./, '')

        // YouTube
        if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
            const id = parsedUrl.searchParams.get('v')

            if (!id) return null

            return {
                player: VideoPlayerType.enum.youtube,
                id,
            }
        }

        if (hostname === 'youtu.be') {
            const id = parsedUrl.pathname.slice(1)

            if (!id) return null

            return {
                player: VideoPlayerType.enum.youtube,
                id,
            }
        }

        // Vimeo
        if (hostname === 'vimeo.com') {
            const id = parsedUrl.pathname.split('/').filter(Boolean).pop()

            if (!id) return null

            return {
                player: VideoPlayerType.enum.vimeo,
                id,
            }
        }

        if (hostname === 'player.vimeo.com') {
            const id = parsedUrl.pathname.split('/').filter(Boolean).pop()

            if (!id) return null

            return {
                player: VideoPlayerType.enum.vimeo,
                id,
            }
        }

        return null
    } catch {
        return null
    }
}
