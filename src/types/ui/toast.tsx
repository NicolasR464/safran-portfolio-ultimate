import z from 'zod'

export const ToastColorVariant = z.enum(['success', 'error', 'info'])

export type ToastColorVariant = z.infer<typeof ToastColorVariant>
