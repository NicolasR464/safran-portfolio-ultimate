import ButtonGeneric from '@/components/buttons/ButtonGeneric'
import Form from '@/components/Form'
import { NumberField } from '@/components/NumberFields'
import TextField from '@/components/TextField'
import { useProjectsStore } from '@/stores/admin/projects'
import { ProjectNode } from '@/types/admin/projectsTable'
import { ProjectTableRowType } from '@/utils/enums'
import { queue as toastQueue } from '@/components/Toast'
import { Key, useEffect, useState } from 'react'
import { Select, SelectItem } from '@/components/Select'
import { ToastColorVariant } from '@/types/ui/toast'
import { MyRadio, RadioGroup } from '@/components/RadioGroup'
import { VideoPlayerType } from '@/types/project'

type FormProjectProps = {
    setIsModalOpen: (isOpen: boolean) => void
    projectSelected: ProjectNode
    onUploadClick: () => void
}

const FormProject = ({
    projectSelected,
    setIsModalOpen,
    onUploadClick,
}: FormProjectProps) => {
    const [categoryLength, setCategoryLength] = useState<number>()

    const draft = useProjectsStore((state) => state.projectFormDraft)
    const updateDraft = useProjectsStore(
        (state) => state.updateProjectFormDraft,
    )
    const clearDraft = useProjectsStore((state) => state.clearProjectFormDraft)

    const updateProjects = useProjectsStore((state) => state.updateProjects)
    const projectsByCategories = useProjectsStore(
        (state) => state.projectsByCategories,
    )

    useEffect(() => {
        const categoryFound = projectsByCategories.find(
            (categoryItem) =>
                categoryItem.category._id.toString() === draft?.categoryId,
        )

        setCategoryLength(categoryFound?.projects.length ?? 1)
    }, [draft?.categoryId, projectsByCategories])

    if (!draft) return null

    return (
        <Form
            className='w-full flex justify-center'
            action={async () => {
                const updateResult = await updateProjects({
                    type: ProjectTableRowType.enum.project,
                    categoryInitialId: projectSelected.categoryId,
                    orderInitial: projectSelected.order,
                    project: {
                        _id: draft._id,
                        title: draft.title,
                        order: draft.order,
                        categoryId: draft.categoryId,
                        images: draft.images,
                    },
                })

                toastQueue.add(
                    {
                        title: updateResult.message,
                        variant: updateResult.success
                            ? ToastColorVariant.enum.success
                            : ToastColorVariant.enum.error,
                    },
                    { timeout: 5000 },
                )

                if (updateResult.success) {
                    clearDraft()
                    setIsModalOpen(false)
                }
            }}
        >
            <div className='flex flex-col p-4'>
                <h2 className='text-center text-2xl font-bold text-white mb-4'>
                    Edit project:
                    <span className='italic'> {draft.title}</span>
                </h2>

                {/* Project Title */}
                <TextField
                    label='Project Title'
                    name='projectTitle'
                    placeholder='Update project title'
                    value={draft.title}
                    onChange={(title) => updateDraft({ title })}
                    isRequired
                />

                {/* Project Order */}
                <NumberField
                    label='Project Order'
                    name='projectOrder'
                    placeholder='Update project order'
                    value={draft.order}
                    onChange={(order) => updateDraft({ order })}
                    maxValue={categoryLength ?? 1}
                    minValue={1}
                    isRequired
                />

                {/* Project Category */}
                <Select
                    label='Category'
                    name='categoryId'
                    defaultSelectedKey={draft.categoryId}
                    onChange={(value: Key | null) => {
                        if (typeof value !== 'string') return

                        const foundCategoryLength =
                            projectsByCategories.find(
                                (categoryItem) =>
                                    categoryItem.category._id.toString() ===
                                    value,
                            )?.projects.length ?? 1

                        updateDraft({
                            categoryId: value,
                            order:
                                foundCategoryLength < draft.order
                                    ? foundCategoryLength + 1
                                    : draft.order,
                        })

                        setCategoryLength(foundCategoryLength + 1)
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

                {/* Project Images */}
                <ButtonGeneric
                    type='button'
                    onPress={onUploadClick}
                >
                    Upload Files
                </ButtonGeneric>

                <h2 className='text-start text-xl font-bold text-white mb-4'>
                    Video Fields
                </h2>

                {/* Project Video */}
                <TextField
                    label='Project Video'
                    name='projectVideo'
                    placeholder='Update project video'
                    value={draft.videoUrl}
                    onChange={(videoUrl) => updateDraft({ videoUrl })}
                />

                <RadioGroup
                    label='Video Player'
                    value={draft.videoType}
                    onChange={(videoType) =>
                        updateDraft({
                            videoType: videoType as VideoPlayerType,
                        })
                    }
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
