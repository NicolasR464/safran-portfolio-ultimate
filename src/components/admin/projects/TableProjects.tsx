'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Collection, useDragAndDrop } from 'react-aria-components'
import type { Key } from 'react-aria-components'
import { MyToastRegion } from '@/components/Toast'
import { queue as toastQueue } from '@/components/Toast'

import {
    Cell,
    Column,
    Row,
    Table,
    TableBody,
    TableHeader,
} from '@/components/Table'
import { useProjectsStore } from '@/stores/admin/projects'
import { FormMode, ProjectTableRowType } from '@/utils/enums/admin'
import ButtonGeneric from '@/components/buttons/ButtonGeneric'
import { Pencil, Trash } from 'lucide-react'
import ModalTrigger from '@/components/Modal/ModalTrigger'
import Modal from '@/components/Modal'
import FormCategory from '@/components/admin/projects/FormCategory'
import FormProject from '@/components/admin/projects/FormProject'
import { ProjectTreeItem } from '@/types/admin/projectsTable'
import { CldUploadWidget } from 'next-cloudinary'
import { cloudinaryFolders } from '@/utils/constants'
import { ToastColorVariant } from '@/types/ui/toast'
import ModalDelete from './ModalDelete'

const findItem = (
    items: ProjectTreeItem[],
    key: Key,
): ProjectTreeItem | undefined => {
    for (const item of items) {
        if (item.id === key) return item

        if (item.kind === ProjectTableRowType.enum.category) {
            const child = item.children.find((project) => project.id === key)

            if (child) return child
        }
    }
}

const reorderCategoriesOnDrag = (
    categories: ProjectTreeItem[],
    movedId: Key,
    targetId: Key,
    dropPosition: 'before' | 'after',
) => {
    const current = [...categories]

    const movedIndex = current.findIndex((item) => item.id === movedId)

    if (movedIndex === -1) return current

    const [movedItem] = current.splice(movedIndex, 1)

    const targetIndex = current.findIndex((item) => item.id === targetId)

    if (targetIndex === -1) return current

    current.splice(
        dropPosition === 'before' ? targetIndex : targetIndex + 1,
        0,
        movedItem,
    )

    return current
}

const TableProjects = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDelete, setIsDelete] = useState(false)

    const [isCloudinaryOpen, setIsCloudinaryOpen] = useState(false)
    const cloudinaryOpenRef = useRef<null | (() => void)>(null)

    const [formMode, setFormMode] = useState<FormMode | null>(null)
    const [selectedItemId, setSelectedItemId] = useState<Key | null>(null)

    const projectsByCategories = useProjectsStore(
        (state) => state.projectsByCategories,
    )
    const initialized = useProjectsStore((state) => state.initialized)
    const isLoading = useProjectsStore((state) => state.isLoading)
    const fetchProjects = useProjectsStore((state) => state.fetchProjects)
    const updateProjects = useProjectsStore((state) => state.updateProjects)

    const draft = useProjectsStore((state) => state.projectFormDraft)
    const updateDraft = useProjectsStore(
        (state) => state.updateProjectFormDraft,
    )
    const resetDraft = useProjectsStore((state) => state.clearProjectFormDraft)

    useEffect(() => {
        if (!initialized) {
            void fetchProjects()
        }
    }, [initialized, fetchProjects])

    const initialItems = useMemo<ProjectTreeItem[]>(
        () =>
            projectsByCategories.map(({ category, projects }) => ({
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
            })),

        [projectsByCategories],
    )

    const modalMetadata = useMemo(
        () =>
            selectedItemId !== null
                ? findItem(initialItems, selectedItemId)
                : undefined,

        [initialItems, selectedItemId],
    )

    const { dragAndDropHooks } = useDragAndDrop({
        getItems: (_keys, items) =>
            [...items].map((item) => {
                const value =
                    'value' in item ? item.value : (item as ProjectTreeItem)

                const projectItem = value as ProjectTreeItem

                return {
                    'text/plain':
                        projectItem.kind === ProjectTableRowType.enum.category
                            ? projectItem.name
                            : projectItem.title,
                }
            }),

        onMove: async (event) => {
            const movedKeys = Array.from(event.keys)
            const movedKey = movedKeys[0]

            if (!movedKey) return

            const movedItem = findItem(initialItems, movedKey)
            const targetItem = findItem(initialItems, event.target.key)

            if (!movedItem || !targetItem) return

            const isMovingCategory =
                movedItem.kind === ProjectTableRowType.enum.category

            const isMovingProject =
                movedItem.kind === ProjectTableRowType.enum.project

            const targetIsCategory =
                targetItem.kind === ProjectTableRowType.enum.category

            /* Category update */
            if (isMovingCategory) {
                if (!targetIsCategory) return

                const categoryDropPosition =
                    event.target.dropPosition === 'before' ? 'before' : 'after'

                const reorderedCategories = reorderCategoriesOnDrag(
                    initialItems,
                    movedKey,
                    event.target.key,
                    categoryDropPosition,
                )

                await updateProjects({
                    type: ProjectTableRowType.enum.category,
                    categories: reorderedCategories.map((category, index) => ({
                        _id: category.id,
                        order: index + 1,
                    })),
                })

                return
            }

            /* Project update */
            if (
                isMovingProject &&
                !targetIsCategory &&
                event.target.dropPosition === 'on'
            ) {
                await updateProjects({
                    type: ProjectTableRowType.enum.project,
                    categoryInitialId: movedItem.categoryId,
                    orderInitial: movedItem.order,
                    project: {
                        _id: movedItem.id,
                        categoryId: targetItem.categoryId,
                        order: targetItem.order,
                    },
                })

                return
            }

            /* Project update its category */
            if (isMovingProject && targetIsCategory) {
                await updateProjects({
                    type: ProjectTableRowType.enum.project,
                    categoryInitialId: movedItem.categoryId,
                    orderInitial: movedItem.order,
                    project: {
                        _id: movedItem.id,
                        categoryId: targetItem.id,
                        order: 1,
                    },
                })
            }
        },
    })

    const renderItem = (item: ProjectTreeItem) => {
        const isCategory = item.kind === ProjectTableRowType.enum.category

        return (
            <Row id={item.id}>
                <Cell>{isCategory ? item.name : item.title}</Cell>
                <Cell>{isCategory ? 'Category' : 'Project'}</Cell>
                <Cell>{item.order}</Cell>

                {/** Update button */}
                <Cell>
                    <ButtonGeneric
                        onPress={() => {
                            if (draft?._id !== item.id) {
                                resetDraft()
                            }

                            setSelectedItemId(item.id)

                            setFormMode(
                                item.kind === ProjectTableRowType.enum.category
                                    ? FormMode.enum['edit-category']
                                    : FormMode.enum['edit-project'],
                            )

                            setIsModalOpen(true)
                        }}
                    >
                        <Pencil />
                    </ButtonGeneric>
                </Cell>

                {/** Delete button */}
                <Cell>
                    <ButtonGeneric
                        onPress={() => {
                            setSelectedItemId(item.id)
                            setIsModalOpen(true)
                            setIsDelete(true)
                        }}
                    >
                        <Trash />
                    </ButtonGeneric>
                </Cell>

                {isCategory && (
                    <Collection items={item.children}>{renderItem}</Collection>
                )}
            </Row>
        )
    }

    if (isLoading && !initialized) {
        return <p>Loading projects...</p>
    }

    const selectedProject =
        modalMetadata?.kind === ProjectTableRowType.enum.project
            ? modalMetadata
            : undefined

    const selectedCategory =
        modalMetadata?.kind === ProjectTableRowType.enum.category
            ? modalMetadata
            : undefined

    const openCloudinary = () => {
        setIsCloudinaryOpen(true)

        setTimeout(() => {
            cloudinaryOpenRef.current?.()
        }, 0)
    }

    const closeAndResetForm = () => {
        setIsModalOpen(false)
        setSelectedItemId(null)
        setFormMode(null)
        resetDraft()
    }

    return (
        <div className='px-4 pt-20 mt-8'>
            <MyToastRegion />

            {/** Create project button */}
            <ButtonGeneric
                type='button'
                onPress={() => {
                    resetDraft()
                    setSelectedItemId(null)
                    setFormMode(FormMode.enum['create-project'])
                    setIsModalOpen(true)
                }}
            >
                Create project
            </ButtonGeneric>

            <Table
                aria-label='Projects'
                treeColumn='name'
                defaultExpandedKeys={initialItems.map((item) => item.id)}
                dragAndDropHooks={dragAndDropHooks}
            >
                <TableHeader className='sticky top-0 z-20 bg-neutral-100/95 dark:bg-neutral-700/95 backdrop-blur-md'>
                    <Column
                        id='name'
                        isRowHeader
                    >
                        Name
                    </Column>
                    <Column id='type'>Type</Column>
                    <Column id='order'>Order</Column>
                    <Column id='update'>Update</Column>
                    <Column id='delete'>Delete</Column>
                </TableHeader>

                <TableBody items={initialItems}>{renderItem}</TableBody>
            </Table>

            {/** Modal */}
            <ModalTrigger
                isOpen={isModalOpen && !isCloudinaryOpen}
                onOpenChange={setIsModalOpen}
            >
                <Modal isDismissable={false}>
                    {formMode === FormMode.enum['edit-category'] &&
                        selectedCategory && (
                            <FormCategory
                                categorySelected={selectedCategory}
                                setIsModalOpen={setIsModalOpen}
                                resetState={closeAndResetForm}
                            />
                        )}

                    {formMode === FormMode.enum['create-project'] && (
                        <FormProject
                            setIsModalOpen={setIsModalOpen}
                            onImageUploadClick={openCloudinary}
                            resetState={closeAndResetForm}
                            formMode={formMode}
                        />
                    )}

                    {formMode === FormMode.enum['edit-project'] &&
                        selectedProject && (
                            <FormProject
                                projectSelected={selectedProject}
                                setIsModalOpen={setIsModalOpen}
                                onImageUploadClick={openCloudinary}
                                resetState={closeAndResetForm}
                                formMode={formMode}
                            />
                        )}

                    {isDelete && modalMetadata && (
                        <ModalDelete
                            rowSelected={modalMetadata}
                            setIsModalOpen={setIsModalOpen}
                            setIsDelete={setIsDelete}
                        />
                    )}
                </Modal>
            </ModalTrigger>

            {draft && (
                <CldUploadWidget
                    uploadPreset={
                        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
                    }
                    options={{
                        multiple: true,
                        sources: ['local', 'dropbox', 'google_drive'],
                        folder:
                            cloudinaryFolders.MAIN +
                            cloudinaryFolders.PORTFOLIO,
                        resourceType: 'image',
                    }}
                    onSuccess={(result) => {
                        if (!result?.info || typeof result.info === 'string') {
                            return
                        }

                        const newImage = {
                            imageId: result.info.public_id,
                            url: result.info.secure_url,
                            types: [],
                        }

                        updateDraft((currentDraft) => ({
                            ...currentDraft,
                            images: [...(currentDraft.images ?? []), newImage],
                        }))
                    }}
                    onClose={() => {
                        setIsCloudinaryOpen(false)
                    }}
                    onError={(error) => {
                        if (error)
                            toastQueue.add(
                                {
                                    title: error.toString(),
                                    variant: ToastColorVariant.enum.error,
                                },
                                { timeout: 5000 },
                            )
                    }}
                >
                    {({ open }) => {
                        cloudinaryOpenRef.current = open
                        return null
                    }}
                </CldUploadWidget>
            )}
        </div>
    )
}

export default TableProjects
