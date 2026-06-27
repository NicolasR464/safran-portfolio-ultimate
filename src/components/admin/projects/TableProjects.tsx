'use client'

import { useEffect, useState } from 'react'
import { Collection, useDragAndDrop } from 'react-aria-components'
import type { Key } from 'react-aria-components'
import { MyToastRegion } from '@/components/Toast'

import {
    Cell,
    Column,
    Row,
    Table,
    TableBody,
    TableHeader,
} from '@/components/Table'
import { useProjectsStore } from '@/stores/admin/projects'
import { ProjectTableRowType } from '@/utils/enums'
import ButtonGeneric from '@/components/buttons/ButtonGeneric'
import { Pencil } from 'lucide-react'
import ModalTrigger from '@/components/Modal/ModalTrigger'
import Modal from '@/components/Modal'
import FormCategory from '@/components/admin/projects/FormCategory'
import FormProject from '@/components/admin/projects/FormProject'
import { CategoryNode, ProjectTreeItem } from '@/types/admin/projectsTable'

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
    console.log('🔥 reorderCategoriesOnDrag')

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

const reorderProjectsOnDrag = (
    projects: CategoryNode[],
    movedId: string,
    targetId: string,
) => {
    console.log('🔥 reorderProjectsOnDrag')

    console.log({ projects })
    console.log({ movedId })
    console.log({ targetId })

    const movedCategory = projects.find((category) =>
        category.children.some((project) => project.id === movedId),
    )

    const targetCategory = projects.find((category) =>
        category.children.some((project) => project.id === targetId),
    )

    const isSameCategory = movedCategory?.id === targetCategory?.id

    console.log({ isSameCategory })
}

const TableProjects = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMetadata, setModalMetadata] = useState<ProjectTreeItem>()

    const projectsByCategories = useProjectsStore(
        (state) => state.projectsByCategories,
    )
    const initialized = useProjectsStore((state) => state.initialized)
    const isLoading = useProjectsStore((state) => state.isLoading)
    const fetchProjects = useProjectsStore((state) => state.fetchProjects)
    const updateProjects = useProjectsStore((state) => state.updateProjects)

    useEffect(() => {
        if (!initialized) {
            void fetchProjects()
        }
    }, [initialized, fetchProjects])

    const initialItems: ProjectTreeItem[] = projectsByCategories.map(
        ({ category, projects }) => ({
            id: category._id.toString(),
            kind: ProjectTableRowType.enum.category,
            name: category.name,
            order: category.order,
            children: projects.map((project) => ({
                id: project._id.toString(),
                kind: ProjectTableRowType.enum.project,
                ...project,
            })),
        }),
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

            const targetIsProject =
                targetItem.kind === ProjectTableRowType.enum.project

            console.log('🔥 event drop : ', event.target.dropPosition)

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
                console.log('PROJECT UPDATE')

                console.log({ event })

                console.log({ targetItem })
                console.log({ movedItem })

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
            if (
                isMovingProject &&
                targetIsProject &&
                (event.target.dropPosition === 'before' ||
                    event.target.dropPosition === 'after')
            ) {
                console.log('Project update its category')
                const parentCategory = initialItems.find(
                    (item): item is CategoryNode =>
                        item.kind === ProjectTableRowType.enum.category &&
                        item.children.some(
                            (project) => project.id === targetItem.id,
                        ),
                )

                if (!parentCategory) return

                const projects = [...parentCategory.children]

                const movedIndex = projects.findIndex(
                    (project) => project.id === movedItem.id,
                )
                const targetIndex = projects.findIndex(
                    (project) => project.id === targetItem.id,
                )

                if (movedIndex === -1 || targetIndex === -1) return

                const [movedProject] = projects.splice(movedIndex, 1)

                const nextTargetIndex = projects.findIndex(
                    (project) => project.id === targetItem.id,
                )

                projects.splice(
                    event.target.dropPosition === 'before'
                        ? nextTargetIndex
                        : nextTargetIndex + 1,
                    0,
                    movedProject,
                )

                await updateProjects({
                    type: ProjectTableRowType.enum.project,
                    categoryId: parentCategory.id,
                    projects: projects.map((project, index) => ({
                        categoryId: parentCategory.id,
                        _id: project.id,
                        order: index + 1,
                    })),
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
                <Cell>
                    <ButtonGeneric
                        onPress={() => {
                            setIsModalOpen(true)
                            setModalMetadata(item)
                        }}
                    >
                        <Pencil />
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

    return (
        <div className='px-4 pt-20 mt-8'>
            <MyToastRegion />

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
                    <Column id='userAction'>User Action</Column>
                </TableHeader>

                <TableBody items={initialItems}>{renderItem}</TableBody>
            </Table>

            {/** Modal */}
            <ModalTrigger
                isOpen={isModalOpen}
                onOpenChange={(open) => {
                    setIsModalOpen(open)
                }}
            >
                <Modal>
                    {/** Category form */}
                    {modalMetadata?.kind ===
                        ProjectTableRowType.enum.category && (
                        <FormCategory
                            categorySelected={modalMetadata}
                            setIsModalOpen={setIsModalOpen}
                        />
                    )}

                    {/** Project form */}
                    {modalMetadata?.kind ===
                        ProjectTableRowType.enum.project && (
                        <FormProject
                            projectSelected={modalMetadata}
                            setIsModalOpen={setIsModalOpen}
                        />
                    )}
                </Modal>
            </ModalTrigger>
        </div>
    )
}

export default TableProjects
