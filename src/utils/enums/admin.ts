import z from 'zod'

export const ProjectTableRowType = z.enum(['category', 'project'])
export type ProjectTableRowType = z.infer<typeof ProjectTableRowType>

export const FormMode = z.enum([
    'create-category',
    'create-project',
    'edit-category',
    'edit-project',
])
export type FormMode = z.infer<typeof FormMode>
