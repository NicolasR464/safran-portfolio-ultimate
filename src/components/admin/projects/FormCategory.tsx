import ButtonGeneric from '@/components/buttons/ButtonGeneric'
import Form from '@/components/Form'
import { NumberField } from '@/components/NumberFields'
import TextField from '@/components/TextField'
import { useProjectsStore } from '@/stores/admin/projects'
import { CategoryNode } from '@/types/admin/projectsTable'
import { ProjectsListResponse } from '@/types/apiResponses/admin/projects'
import { ProjectTableRowType } from '@/utils/enums'
import { queue } from '@/components/Toast'
import { reorderRowsByOrder } from '@/utils/form'

type FormCategoryProps = {
    setIsModalOpen: (isOpen: boolean) => void

    categorySelected: CategoryNode
}

const FormCategory = ({
    categorySelected,
    setIsModalOpen,
}: FormCategoryProps) => {
    const updateProjects = useProjectsStore((state) => state.updateProjects)

    const projectsByCategories = useProjectsStore(
        (state) => state.projectsByCategories,
    )

    return (
        <Form
            className='w-full flex justify-center'
            action={async (formData) => {
                const categoryName = String(formData.get('categoryName') ?? '')
                const categoryOrder = Number(formData.get('categoryOrder'))

                const categoryNodes: CategoryNode[] = projectsByCategories.map(
                    ({ category, projects }) => ({
                        id: category._id.toString(),
                        kind: ProjectTableRowType.enum.category,
                        name: category.name,
                        order: category.order,
                        children: projects.map((project) => ({
                            id: project._id.toString(),
                            kind: ProjectTableRowType.enum.project,
                            title: project.title ?? 'Untitled',
                            order: project.order ?? 0,
                            children: [],
                        })),
                    }),
                )

                const reorderedCategories = reorderRowsByOrder(
                    categoryNodes,
                    categorySelected.id,
                    categoryOrder,
                )

                const updateResult = await updateProjects({
                    type: ProjectTableRowType.enum.category,
                    categories: reorderedCategories.map((category, index) => ({
                        _id: category.id,
                        order: index + 1,
                        ...(category.id === categorySelected.id && {
                            name: categoryName,
                        }),
                    })),
                })

                queue.add(
                    {
                        title: updateResult.message,
                    },
                    { timeout: 5000 },
                )

                setIsModalOpen(false)
            }}
        >
            <div className='flex flex-col p-4'>
                <h2 className='text-center text-2xl font-bold text-white mb-4'>
                    {'Edit category'}

                    <span className='italic'> {categorySelected.name}</span>
                </h2>

                <TextField
                    label='Category Name'
                    name='categoryName'
                    placeholder='Update category name'
                    defaultValue={categorySelected.name}
                />

                <NumberField
                    label='Category Order'
                    name='categoryOrder'
                    placeholder='Update category order'
                    defaultValue={categorySelected.order}
                    maxValue={projectsByCategories.length}
                />

                <ButtonGeneric type='submit'>Update</ButtonGeneric>
            </div>
        </Form>
    )
}

export default FormCategory
