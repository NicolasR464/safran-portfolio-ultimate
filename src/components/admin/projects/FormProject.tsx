import ButtonGeneric from '@/components/buttons/ButtonGeneric'
import Form from '@/components/Form'
import { NumberField } from '@/components/NumberFields'
import TextField from '@/components/TextField'
import { useProjectsStore } from '@/stores/admin/projects'
import { ProjectNode } from '@/types/admin/projectsTable'
import { ProjectsListResponse } from '@/types/apiResponses/admin/projects'
import { ProjectTableRowType } from '@/utils/enums'
import { queue } from '@/components/Toast'
import { reorderRowsByOrder } from '@/utils/form'
import { useState } from 'react'
import { Select, SelectItem } from '@/components/Select'

type FormProjectProps = {
    setIsModalOpen: (isOpen: boolean) => void

    projectSelected: ProjectNode
}

const FormProject = ({ projectSelected, setIsModalOpen }: FormProjectProps) => {
    const updateProjects = useProjectsStore((state) => state.updateProjects)

    const projectsByCategories = useProjectsStore(
        (state) => state.projectsByCategories,
    )

    console.log({ projectsByCategories })

    const currentCategory = projectsByCategories.find((projectsByCategory) =>
        projectsByCategory.projects.some(
            (project) => project._id.toString() === projectSelected.id,
        ),
    )

    console.log({ currentCategory })

    const currentProjects = currentCategory?.projects ?? []

    const [projectsCategory, setProjectsCategory] = useState()

    return (
        <Form
            className='w-full flex justify-center'
            action={async (formData) => {
                const projectTitle = String(formData.get('projectTitle'))
                const projectOrder = Number(formData.get('projectOrder'))
                const categoryId = String(formData.get('categoryId'))

                const projects =
                    projectsByCategories
                        .find(
                            (category) =>
                                category.category._id.toString() === categoryId,
                        )
                        ?.projects.map((project) => ({
                            id: project._id.toString(),
                            kind: ProjectTableRowType.enum.project,
                            title: project.title,
                            order: project.order,
                        })) || []

                const reorderedProjects = reorderRowsByOrder(
                    projects,
                    projectSelected.id,
                    projectOrder,
                )

                const updateResult = await updateProjects({
                    type: ProjectTableRowType.enum.project,
                    projects: reorderedProjects.map((category, index) => ({
                        _id: category.id,
                        categoryId: category.id,
                        order: index + 1,
                        ...(projectTitle && {
                            title: projectTitle,
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
                    {'Edit project:'}

                    <span className='italic'> {projectSelected.title}</span>
                </h2>

                <TextField
                    label='Project Title'
                    name='projectTitle'
                    placeholder='Update project title'
                    defaultValue={projectSelected.title}
                />

                <NumberField
                    label='Project Order'
                    name='projectOrder'
                    placeholder='Update project order'
                    defaultValue={projectSelected.order}
                    maxValue={currentProjects.length}
                />

                {currentCategory && (
                    <Select
                        label='Category'
                        name='categoryId'
                        defaultSelectedKey={currentCategory.category._id.toString()}
                    >
                        {projectsByCategories.map((group) => (
                            <SelectItem
                                key={group.category._id.toString()}
                                id={group.category._id.toString()}
                                category={group.category.name}
                            >
                                {group.category.name}
                            </SelectItem>
                        ))}
                    </Select>
                )}

                <ButtonGeneric type='submit'>Update</ButtonGeneric>
            </div>
        </Form>
    )
}

export default FormProject
