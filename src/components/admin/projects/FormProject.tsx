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
import { embedSrcBuilder } from '@/utils'
import ProjectImagesGrid from './ProjectImagesGrid'
import FormSeparator from './FormSeparator'

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
    const initDraft = useProjectsStore((state) => state.initProjectFormDraft)

    const updateProjects = useProjectsStore((state) => state.updateProjects)
    const projectsByCategories = useProjectsStore(
        (state) => state.projectsByCategories,
    )
    const isLoading = useProjectsStore((state) => state.isLoading)

    useEffect(() => {
        console.count('🚀 DRAFT')

        console.log({ draft })
    }, [draft])

    useEffect(() => {
        if (draft?._id === projectSelected.id) return

        initDraft({
            _id: projectSelected.id,
            title: projectSelected.title,
            order: projectSelected.order,
            categoryId: projectSelected.categoryId,
            images: projectSelected.images ?? [],
            videoUrl: projectSelected.video
                ? embedSrcBuilder(
                      projectSelected.video.player,
                      projectSelected.video.videoId,
                  )
                : '',
            videoType: projectSelected.video?.player ?? null,
        })
    }, [draft?._id, projectSelected.id, initDraft, projectSelected])

    const formDraft = draft ?? {
        _id: projectSelected.id,
        title: projectSelected.title,
        order: projectSelected.order,
        categoryId: projectSelected.categoryId,
        images: projectSelected.images ?? [],
        videoUrl: projectSelected.video
            ? embedSrcBuilder(
                  projectSelected.video.player,
                  projectSelected.video.videoId,
              )
            : '',
        videoType: projectSelected.video?.player ?? null,
    }

    useEffect(() => {
        const categoryFound = projectsByCategories.find(
            (categoryItem) =>
                categoryItem.category._id.toString() === draft?.categoryId,
        )

        setCategoryLength(categoryFound?.projects.length ?? 1)
    }, [draft?.categoryId, projectsByCategories])

    return (
        <Form
            className='w-full flex justify-center'
            action={async () => {
                const updateResult = await updateProjects({
                    type: ProjectTableRowType.enum.project,
                    categoryInitialId: projectSelected.categoryId,
                    orderInitial: projectSelected.order,
                    project: {
                        _id: formDraft._id,
                        title: formDraft.title,
                        order: formDraft.order,
                        categoryId: formDraft.categoryId,
                        images: formDraft.images,
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
                    setIsModalOpen(false)
                }
            }}
        >
            <div className='flex flex-col p-4'>
                <h2 className='text-center text-2xl font-bold text-white mb-4'>
                    Edit project:
                    <span className='italic'> {formDraft.title}</span>
                </h2>

                <FormSeparator title='Description' />

                {/* Project Title */}
                <TextField
                    label='Project‘s title'
                    name='projectTitle'
                    placeholder='Update project title'
                    value={formDraft.title}
                    onChange={(title) => updateDraft({ title })}
                    isRequired
                />

                {/* Project Category */}
                <Select
                    label='Category'
                    name='categoryId'
                    value={formDraft.categoryId}
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
                                foundCategoryLength < formDraft.order
                                    ? foundCategoryLength + 1
                                    : formDraft.order,
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

                {/* Order of appearance */}
                <NumberField
                    label='Order of appearance'
                    name='projectOrder'
                    placeholder='Update project order'
                    value={formDraft.order}
                    onChange={(order) => updateDraft({ order })}
                    maxValue={categoryLength ?? 1}
                    minValue={1}
                    isRequired
                />

                {/* Project Images */}
                <FormSeparator title='Images' />

                <ButtonGeneric
                    type='button'
                    onPress={onUploadClick}
                    className='font-mono'
                >
                    Upload Images
                </ButtonGeneric>

                <ProjectImagesGrid
                    images={formDraft.images}
                    onImagesChange={(images) => updateDraft({ images })}
                />

                {/* Project Video */}
                <FormSeparator title='Video' />

                <TextField
                    label='Video URL '
                    name='projectVideo'
                    placeholder='Update project video'
                    value={formDraft.videoUrl}
                    onChange={(videoUrl) => updateDraft({ videoUrl })}
                />

                <RadioGroup
                    label='Video Player'
                    value={formDraft.videoType}
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

                <ButtonGeneric type='submit'>
                    {isLoading ? 'Updating...' : 'Update'}
                </ButtonGeneric>
            </div>
        </Form>
    )
}

export default FormProject
