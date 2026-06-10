import z from 'zod'

export const ProjectTableRowType = z.enum(['category', 'project'])
export type ProjectTableRowType = z.infer<typeof ProjectTableRowType>
