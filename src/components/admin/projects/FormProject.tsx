import ButtonGeneric from '@/components/buttons/ButtonGeneric'
import Form from '@/components/Form'
import { NumberField } from '@/components/NumberFields'
import TextField from '@/components/TextField'
import { useProjectsStore } from '@/stores/admin/projects'
import { ProjectNode } from '@/types/admin/projectsTable'
import { ProjectsCategoryResponse } from '@/types/apiResponses/admin/projects'
import { ProjectTableRowType } from '@/utils/enums'
import { queue as toastQueue } from '@/components/Toast'
import { reorderRowsByOrder } from '@/utils/form'
import { Key, useState } from 'react'
import { Select, SelectItem } from '@/components/Select'
import { ProjectSchema } from '@/types/project/schema'
import { ToastColorVariant } from '@/types/ui/toast'
import { embedSrcBuilder } from '@/utils'
import { MyRadio, RadioGroup } from '@/components/RadioGroup'
import { VideoPlayerType } from '@/types/project'

type FormProjectProps = {
    setIsModalOpen: (isOpen: boolean) => void

    projectSelected: ProjectNode
}

const FormProject = ({ projectSelected, setIsModalOpen }: FormProjectProps) => {
    const [videoType, setVideoType] = useState<string | null>(
        projectSelected.video?.player ?? null,
    )

    const updateProjects = useProjectsStore((state) => state.updateProjects)

    const projectsByCategories = useProjectsStore(
        (state) => state.projectsByCategories,
    )

    console.log({ projectsByCategories })
    console.log({ projectSelected })

    const currentCategory = projectsByCategories.find((projectsByCategory) =>
        projectsByCategory.projects.some(
            (project) => project._id.toString() === projectSelected.id,
        ),
    )

    console.log({ currentCategory })

    const currentProjects = currentCategory?.projects ?? []

    const [newProjectsCategory, setNewProjectsCategory] =
        useState<ProjectSchema[]>()

    return (
        <Form
            className='w-full flex justify-center'
            action={async (formData) => {
                const title = String(formData.get('projectTitle'))
                const order = Number(formData.get('projectOrder'))
                const categoryId = String(formData.get('categoryId'))

                const updateResult = await updateProjects({
                    type: ProjectTableRowType.enum.project,
                    categoryInitialId: projectSelected.categoryId,
                    orderInitial: projectSelected.order,
                    project: {
                        _id: projectSelected.id,
                        title,
                        order,
                        categoryId,
                    },
                })

                console.log({ updateResult })

                toastQueue.add(
                    {
                        title: updateResult.message,
                        variant: updateResult.success
                            ? ToastColorVariant.enum.success
                            : ToastColorVariant.enum.error,
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

                {/** Project Title */}
                <TextField
                    label='Project Title'
                    name='projectTitle'
                    placeholder='Update project title'
                    defaultValue={projectSelected.title}
                    isRequired
                />

                {/** Project Order */}
                <NumberField
                    label='Project Order'
                    name='projectOrder'
                    placeholder='Update project order'
                    defaultValue={projectSelected.order}
                    maxValue={currentProjects.length}
                    minValue={1}
                    isRequired
                />

                {/** Project Category */}
                {currentCategory && (
                    <Select
                        label='Category'
                        name='categoryId'
                        defaultSelectedKey={currentCategory.category._id.toString()}
                        onChange={(value: Key | null) => {
                            if (typeof value === 'string') {
                                handleChangeCategory(value)
                            }
                        }}
                        isRequired
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

                {/** Project Images */}

                {/** Video Fields */}
                <h2 className='text-start text-xl font-bold text-white mb-4'>
                    {'Video Fields'}
                </h2>
                {projectSelected.video && (
                    <TextField
                        label='Project Video'
                        name='projectVideo'
                        placeholder='Update project video'
                        defaultValue={embedSrcBuilder(
                            projectSelected.video.player,
                            projectSelected.video.videoId,
                        )}
                    />
                )}

                <RadioGroup
                    label='Video Player'
                    value={videoType}
                    onChange={setVideoType}
                >
                    <MyRadio value={VideoPlayerType.enum.youtube}>
                        Youtube
                    </MyRadio>
                    <MyRadio value={VideoPlayerType.enum.vimeo}>Vimeo</MyRadio>
                </RadioGroup>

                <ButtonGeneric type='submit'>Update</ButtonGeneric>
            </div>
        </Form>
    )
}

export default FormProject
