import { VideoPlayerType } from '@/types/project'

export const embedSrcBuilder = (
    videoType: VideoPlayerType,
    videoId: string,
): string => {
    switch (videoType) {
        case VideoPlayerType.enum.youtube:
            return `https://www.youtube.com/embed/${videoId}`
        case VideoPlayerType.enum.vimeo:
            return `https://player.vimeo.com/video/${videoId}`
        default:
            return ''
    }
}
