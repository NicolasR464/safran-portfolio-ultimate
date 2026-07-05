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
import { embedSrcBuilder } from '@/utils'
import { MyRadio, RadioGroup } from '@/components/RadioGroup'
import { VideoPlayerType } from '@/types/project'
import { CldUploadWidget } from 'next-cloudinary'

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
    const [videoType, setVideoType] = useState<string | null>(
        projectSelected.video?.player ?? null,
    )
    const [categoryLength, setCategoryLength] = useState<number>()
    const [projectOrder, setProjectOrder] = useState<number>(
        projectSelected.order,
    )

    const updateProjects = useProjectsStore((state) => state.updateProjects)
    const projectsByCategories = useProjectsStore(
        (state) => state.projectsByCategories,
    )

    useEffect(() => {
        const categoryFound = projectsByCategories.find(
            (categoryItem) =>
                categoryItem.category._id.toString() ===
                projectSelected.categoryId,
        )

        const categoryLength = categoryFound?.projects.length ?? 1

        setCategoryLength(categoryLength)
    }, [projectSelected.categoryId, projectsByCategories])

    const currentCategory = projectsByCategories.find((projectsByCategory) =>
        projectsByCategory.projects.some(
            (project) => project._id.toString() === projectSelected.id,
        ),
    )

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
                    value={projectOrder}
                    onChange={setProjectOrder}
                    maxValue={categoryLength ?? 1}
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
                            if (value && typeof value === 'string') {
                                const foundCategoryLength =
                                    projectsByCategories.find(
                                        (categoryItem) =>
                                            categoryItem.category._id.toString() ===
                                            value,
                                    )?.projects.length ?? 1

                                if (foundCategoryLength < projectOrder)
                                    setProjectOrder(foundCategoryLength + 1)

                                setCategoryLength(foundCategoryLength + 1)
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

                {/** Project Images Upload */}

                <ButtonGeneric
                    type='button'
                    onPress={onUploadClick}
                >
                    Upload Files
                </ButtonGeneric>

                <CldUploadWidget
                    uploadPreset={
                        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
                    }
                >
                    {({ open }) => {
                        return (
                            <button
                                type='button'
                                onClick={() => open()}
                            >
                                Upload Files
                            </button>
                        )
                    }}
                </CldUploadWidget>

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
