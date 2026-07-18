import ButtonGeneric from '@/components/buttons/ButtonGeneric'
import Form from '@/components/Form'
import { NumberField } from '@/components/NumberFields'
import TextField from '@/components/TextField'
import { queue as toastQueue } from '@/components/Toast'
import { useProjectsStore } from '@/stores/admin/projects'
import { CategoryNode } from '@/types/admin/projectsTable'
import { ProjectCategorySchema } from '@/types/projectCategory/schema'
import { ProjectSchema } from '@/types/project/schema'
import { ToastColorVariant } from '@/types/ui/toast'
import { FormMode, ProjectTableRowType } from '@/utils/enums/admin'
import { reorderRowsByOrder } from '@/utils/form'
import { X } from 'lucide-react'
import { useMemo, useState } from 'react'

type FormCategoryProps = {
    categorySelected?: CategoryNode
    setIsModalOpen: (isOpen: boolean) => void
    resetState: () => void
    formMode: FormMode | null
}

const FormCategory = ({
    categorySelected,
    setIsModalOpen,
    resetState,
    formMode,
}: FormCategoryProps) => {
    const projectsByCategories = useProjectsStore(
        (state) => state.projectsByCategories,
    )

    const updateProjects = useProjectsStore((state) => state.updateProjects)
    const createCategory = useProjectsStore((state) => state.createCategory)
    const isLoading = useProjectsStore((state) => state.isLoading)

    const isCreateMode = formMode === FormMode.enum['create-category']

    const initialCategoryOrder = useMemo(() => {
        if (isCreateMode) {
            return projectsByCategories.length + 1
        }

        return categorySelected?.order ?? 1
    }, [categorySelected?.order, isCreateMode, projectsByCategories.length])

    const [name, setName] = useState(categorySelected?.name ?? '')
    const [order, setOrder] = useState(initialCategoryOrder)

    const handleSubmit = async () => {
        const categoryName = name.trim()

        if (!categoryName) {
            toastQueue.add(
                {
                    title: 'Category name is required.',
                    variant: ToastColorVariant.enum.error,
                },
                { timeout: 5000 },
            )

            return
        }

        if (isCreateMode) {
            const result = await createCategory({
                name: categoryName,
                order,
            })

            toastQueue.add(
                {
                    title: result.message,
                    variant: result.success
                        ? ToastColorVariant.enum.success
                        : ToastColorVariant.enum.error,
                },
                { timeout: 5000 },
            )

            if (result.success) {
                resetState()
            }

            return
        }

        if (!categorySelected) {
            return
        }

        const categoryNodes: CategoryNode[] = projectsByCategories.map(
            ({
                category,
                projects,
            }: {
                category: ProjectCategorySchema
                projects: ProjectSchema[]
            }) => ({
                id: category._id.toString(),
                kind: ProjectTableRowType.enum.category,
                name: category.name,
                order: category.order,
                children: projects.map((project) => ({
                    ...project,
                    id: project._id.toString(),
                    kind: ProjectTableRowType.enum.project,
                    categoryId: category._id.toString(),
                })),
            }),
        )

        const reorderedCategories = reorderRowsByOrder(
            categoryNodes,
            categorySelected.id,
            order,
        )

        const result = await updateProjects({
            type: ProjectTableRowType.enum.category,
            categories: reorderedCategories.map((category, index) => ({
                _id: category.id,
                order: index + 1,
                ...(category.id === categorySelected.id && {
                    name: categoryName,
                }),
            })),
        })

        toastQueue.add(
            {
                title: result.message,
                variant: result.success
                    ? ToastColorVariant.enum.success
                    : ToastColorVariant.enum.error,
            },
            { timeout: 5000 },
        )

        setIsModalOpen(false)

        if (result.success) {
            resetState()
        }
    }

    return (
        <div className='overflow-y-scroll'>
            <Form
                className='flex w-full justify-center'
                action={handleSubmit}
            >
                <div className='relative flex min-w-0 flex-col p-4 m-2'>
                    <ButtonGeneric
                        type='button'
                        className='absolute left-0 top-0 z-50'
                        onPress={() => {
                            setIsModalOpen(false)
                            resetState()
                        }}
                    >
                        <X />
                    </ButtonGeneric>

                    <h2 className='mt-6 mb-4 bg-[var(--grey-dark)] p-2 px-12 text-center text-2xl font-bold text-white'>
                        {isCreateMode ? 'Create category' : 'Edit category'}

                        {!isCreateMode && categorySelected && (
                            <span className='italic'>
                                {' '}
                                {categorySelected.name}
                            </span>
                        )}
                    </h2>

                    <TextField
                        label='Category Name'
                        name='categoryName'
                        placeholder={
                            isCreateMode
                                ? 'Category name'
                                : 'Update category name'
                        }
                        value={name}
                        onChange={setName}
                        isRequired
                    />

                    <NumberField
                        className='mt-2'
                        label='Category Order'
                        name='categoryOrder'
                        placeholder={
                            isCreateMode
                                ? 'Category order'
                                : 'Update category order'
                        }
                        value={order}
                        onChange={setOrder}
                        minValue={1}
                        maxValue={
                            isCreateMode
                                ? projectsByCategories.length + 1
                                : projectsByCategories.length
                        }
                        isRequired
                    />

                    <ButtonGeneric
                        className='mt-4 backdrop-blur-2xl'
                        type='submit'
                        isDisabled={isLoading}
                    >
                        {isLoading
                            ? isCreateMode
                                ? 'Creating...'
                                : 'Updating...'
                            : isCreateMode
                              ? 'Create'
                              : 'Update'}
                    </ButtonGeneric>
                </div>
            </Form>
        </div>
    )
}

export default FormCategory
