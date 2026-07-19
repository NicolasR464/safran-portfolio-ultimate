import ButtonGeneric from '@/components/buttons/ButtonGeneric'
import Form from '@/components/Form'
import { NumberField } from '@/components/NumberFields'
import TextField from '@/components/TextField'
import { ProjectFormDraft, useProjectsStore } from '@/stores/admin/projects'
import { ProjectNode } from '@/types/admin/projectsTable'
import { FormMode, ProjectTableRowType } from '@/utils/enums/admin'
import { queue as toastQueue } from '@/components/Toast'
import { Key, useEffect, useMemo, useState } from 'react'
import { Select, SelectItem } from '@/components/Select'
import { ToastColorVariant } from '@/types/ui/toast'

import ProjectImagesGrid from '@/components/admin/projects/ProjectImagesGrid'
import FormSeparator from '@/components/admin/projects/FormSeparator'
import WYSIWYG from '@/components/admin/WYSIWYG'
import { ImagePlus, Info, Upload, X } from 'lucide-react'
import { ProjectCategorySchema } from '@/types/projectCategory/schema'
import { embedSrcBuilder } from '@/utils/functions/video'
import { VideoPlayerType } from '@/types/project'

type FormProjectProps = {
    projectSelected?: ProjectNode
    setIsModalOpen: (isOpen: boolean) => void
    onImageUploadClick: () => void
    resetState: () => void
    formMode: FormMode | null
}

const FormProject = ({
    projectSelected,
    onImageUploadClick,
    resetState,
    formMode,
}: FormProjectProps) => {
    const [categoryLength, setCategoryLength] = useState<number>(1)
    const [isImageTypeMissing, setIsImageTypeMissing] = useState(false)
    const [title, setTitle] = useState('')

    const draft = useProjectsStore((state) => state.projectFormDraft)
    const updateDraft = useProjectsStore(
        (state) => state.updateProjectFormDraft,
    )
    const initDraft = useProjectsStore((state) => state.initProjectFormDraft)
    const updateProjects = useProjectsStore((state) => state.updateProjects)
    const createProject = useProjectsStore((state) => state.createProject)
    const projectsByCategories = useProjectsStore(
        (state) => state.projectsByCategories,
    )
    const isLoading = useProjectsStore((state) => state.isLoading)

    const firstCategory = projectsByCategories[0]

    const emptyProjectDraft = useMemo<ProjectFormDraft>(
        () => ({
            _id: null,
            title: '',
            description: '',
            order: 1,
            categoryId: firstCategory?.category._id.toString() ?? '',
            images: [],
            videoUrl: '',
        }),
        [firstCategory],
    )

    const selectedProjectDraft = useMemo<ProjectFormDraft | null>(() => {
        if (!projectSelected) {
            return null
        }

        const videoUrl =
            projectSelected.video?.url ||
            embedSrcBuilder(
                projectSelected.video?.player ?? VideoPlayerType.enum.youtube,
                projectSelected.video?.videoId ?? '',
            )

        return {
            _id: projectSelected.id,
            title: projectSelected.title,
            description: projectSelected.description ?? '',
            order: projectSelected.order,
            categoryId: projectSelected.categoryId,
            images: projectSelected.images ?? [],
            videoUrl,
        }
    }, [projectSelected])

    const isCreateMode = formMode === FormMode.enum['create-project']

    useEffect(() => {
        if (isCreateMode) {
            if (draft?._id === null) {
                return
            }

            initDraft(emptyProjectDraft)
            return
        }

        if (!selectedProjectDraft) {
            return
        }

        if (draft?._id === selectedProjectDraft._id) {
            return
        }

        initDraft(selectedProjectDraft)
    }, [
        formMode,
        draft?._id,
        emptyProjectDraft,
        selectedProjectDraft,
        initDraft,
        isCreateMode,
    ])

    const formDraft =
        draft ?? (isCreateMode ? emptyProjectDraft : selectedProjectDraft)

    useEffect(() => {
        setTitle(formDraft?.title ?? '')
    }, [formDraft, formDraft?._id, isCreateMode])

    useEffect(() => {
        if (!formDraft) {
            return
        }

        const categoryFound = projectsByCategories.find(
            (categoryItem: { category: ProjectCategorySchema }) =>
                categoryItem.category._id.toString() === formDraft.categoryId,
        )

        setCategoryLength(
            Math.max((categoryFound?.projects.length ?? 0) + 1, 1),
        )
    }, [formDraft, formDraft?.categoryId, projectsByCategories])

    if (!formDraft) {
        return null
    }

    const handleSubmit = async () => {
        const hasMissingImageType = formDraft.images.some(
            (image) => !image.types?.length,
        )

        if (hasMissingImageType) {
            setIsImageTypeMissing(true)
            return
        }

        setIsImageTypeMissing(false)

        const projectPayload = {
            title,
            description: formDraft.description,
            order: formDraft.order,
            categoryId: formDraft.categoryId,
            images: formDraft.images,
            videoUrl: formDraft.videoUrl,
        }

        const result = isCreateMode
            ? await createProject(projectPayload)
            : await updateProjects({
                  type: ProjectTableRowType.enum.project,
                  categoryInitialId: projectSelected!.categoryId,
                  orderInitial: projectSelected!.order,
                  project: {
                      _id: formDraft._id!,
                      ...projectPayload,
                      ...(formDraft.videoUrl && {
                          videoUrl: formDraft.videoUrl,
                      }),
                  },
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
    }

    return (
        <Form
            className={[
                'relative',
                'box-border',
                'h-[80dvh] max-h-[calc(100dvh-2rem)]',
                'w-[calc(100dvw-2rem)] max-w-xl',
                'min-w-0',
                'overflow-x-hidden overflow-y-auto',
                'overscroll-contain',
                'rounded-2xl',
                'bg-[var(--grey-dark)]',
            ].join(' ')}
            action={handleSubmit}
        >
            {/* Header */}
            <div className='sticky top-0 z-30 box-border w-full min-w-0 bg-[var(--grey-dark)]/80 px-3 pb-2 pt-3 backdrop-blur-2xl sm:px-4 sm:pt-4'>
                <ButtonGeneric
                    type='button'
                    className='absolute left-2 top-2 z-40'
                    onPress={resetState}
                >
                    <X />
                </ButtonGeneric>

                <h2 className='min-h-12 min-w-0 break-words px-14 text-center text-lg font-bold text-white sm:px-16 sm:text-xl'>
                    {isCreateMode ? 'Create project' : 'Edit project'}

                    {!isCreateMode && (
                        <span className='italic'> {formDraft.title}</span>
                    )}
                </h2>
            </div>

            {/* Form content */}
            <div className='box-border flex w-full min-w-0 max-w-full flex-col overflow-x-hidden px-3 pb-28 sm:px-4'>
                <FormSeparator
                    title='Information'
                    icon={<Info />}
                />

                <div className='w-full min-w-0 max-w-full'>
                    <TextField
                        label='Project‘s title'
                        name='projectTitle'
                        placeholder={
                            isCreateMode
                                ? 'Project title'
                                : 'Edit project title'
                        }
                        value={title}
                        onChange={setTitle}
                        onBlur={() => updateDraft({ title })}
                        isRequired
                    />
                </div>

                <div className='w-full min-w-0 max-w-full overflow-hidden'>
                    <span className='text-sm'>Description</span>

                    <div className='w-full min-w-0 max-w-full overflow-x-auto'>
                        <WYSIWYG
                            key={
                                isCreateMode
                                    ? 'create-project'
                                    : (formDraft._id ?? 'project')
                            }
                            markdown={formDraft.description ?? ''}
                            onChange={(description) => {
                                updateDraft({ description })
                            }}
                        />
                    </div>
                </div>

                <div className='w-full min-w-0 max-w-full'>
                    <Select
                        label='Category'
                        name='categoryId'
                        className='mt-2 w-full min-w-0 max-w-full'
                        value={formDraft.categoryId}
                        onChange={(value: Key | null) => {
                            if (typeof value !== 'string') {
                                return
                            }

                            const category = projectsByCategories.find(
                                (categoryItem: {
                                    category: ProjectCategorySchema
                                }) =>
                                    categoryItem.category._id.toString() ===
                                    value,
                            )

                            const nextCategoryLength =
                                (category?.projects.length ?? 0) + 1

                            updateDraft({
                                categoryId: value,
                                order: Math.min(
                                    formDraft.order,
                                    nextCategoryLength,
                                ),
                            })

                            setCategoryLength(nextCategoryLength)
                        }}
                        isRequired
                    >
                        {projectsByCategories.map(
                            (group: { category: ProjectCategorySchema }) => (
                                <SelectItem
                                    key={group.category._id.toString()}
                                    id={group.category._id.toString()}
                                    category={group.category.name}
                                >
                                    {group.category.name}
                                </SelectItem>
                            ),
                        )}
                    </Select>
                </div>

                <div className='w-full min-w-0 max-w-full'>
                    <NumberField
                        className='mt-2 w-full min-w-0 max-w-full'
                        label='Order of appearance'
                        name='projectOrder'
                        placeholder='Project order'
                        value={formDraft.order}
                        onChange={(order) => updateDraft({ order })}
                        maxValue={categoryLength}
                        minValue={1}
                        isRequired
                    />
                </div>

                {/* Images */}
                <div className='mt-4 flex w-full min-w-0 max-w-full flex-col overflow-hidden'>
                    <FormSeparator
                        title='Images'
                        icon={<ImagePlus />}
                    />

                    <ButtonGeneric
                        type='button'
                        onPress={onImageUploadClick}
                        className='w-full min-w-0 font-mono'
                    >
                        <Upload /> <span className='ml-2'>Upload Images</span>
                    </ButtonGeneric>

                    {!!formDraft.images.length && (
                        <div className='w-full min-w-0 max-w-full overflow-x-auto'>
                            <ProjectImagesGrid
                                images={formDraft.images}
                                onImagesChange={(images) => {
                                    setIsImageTypeMissing(
                                        images.some(
                                            (image) => !image.types?.length,
                                        ),
                                    )

                                    updateDraft({ images })
                                }}
                                isTypeMissing={isImageTypeMissing}
                            />
                        </div>
                    )}
                </div>

                {/* Video */}
                <div className='mt-4 flex w-full min-w-0 max-w-full flex-col'>
                    <FormSeparator title='Video' />

                    <div className='w-full min-w-0 max-w-full'>
                        <TextField
                            label='Video URL'
                            name='projectVideo'
                            placeholder='Project video'
                            value={formDraft.videoUrl}
                            onChange={(videoUrl) => {
                                updateDraft({ videoUrl })
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className='sticky bottom-0 z-30 box-border w-full min-w-0 bg-[var(--grey-dark)]/80 p-2 backdrop-blur-2xl'>
                <ButtonGeneric
                    className='w-full min-w-0'
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
    )
}

export default FormProject
