import 'server-only'

import { type ScreenType } from '@/types/video/schema'

export type VideoHomeDocument = {
    videoUrl: string
    videoId: string
    screenTypes: ScreenType[]
}
