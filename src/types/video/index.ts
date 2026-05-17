import { z } from 'zod'

export const ScreenSize = z.enum(['16:9', '4:5', '1:1'])
export type ScreenSize = z.infer<typeof ScreenSize>
