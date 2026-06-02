'use client'

import { clsx } from 'clsx'
import { ProjectsListResponse } from '@/types/apiResponses/admin/projects'

import { Collection } from 'react-aria-components'
import { useDragAndDrop } from 'react-aria-components'
import { useTreeData } from 'react-stately'
import type { Key } from 'react-aria-components'

import {
    Table,
    TableHeader,
    TableBody,
    Column,
    Row,
    Cell,
} from '@/components/Table'
import { ProjectTableRowType } from '@/utils/enums'
import { apiClientSide } from '@/utils/ky'
import { localApiEndpoints } from '@/utils/constants/endpoints'

type ProjectTreeItem = CategoryNode | ProjectNode

type DragItem = {
    value: ProjectTreeItem
}

type CategoryNode = {
    id: string
    kind: typeof ProjectTableRowType.enum.category
    name: string
    order: number
    children: ProjectNode[]
}

type ProjectNode = {
    id: string
    kind: typeof ProjectTableRowType.enum.project
    title: string
    order: number
    children: []
}

const ProjectsTreeTable = ({
    projectsByCategories,
}: {
    projectsByCategories: ProjectsListResponse
}) => {
    const initialItems: ProjectTreeItem[] = projectsByCategories.map(
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

    const tree = useTreeData<ProjectTreeItem>({
        initialItems,
    })

    const { dragAndDropHooks } = useDragAndDrop({
        getItems: (_keys, items) =>
            (items as DragItem[]).map((item) => ({
                'text/plain':
                    item.value.kind === ProjectTableRowType.enum.category
                        ? item.value.name
                        : item.value.title,
            })),

        onMove: async (event) => {
            const movedKeys = Array.from(event.keys)
            const targetNode = tree.getItem(event.target.key)

            if (!targetNode) return

            const movedNodes = movedKeys
                .map((key) => tree.getItem(key))
                .filter(Boolean)

            const isMovingCategory = movedNodes.some(
                (node) =>
                    node?.value.kind === ProjectTableRowType.enum.category,
            )

            const isMovingProject = movedNodes.some(
                (node) => node?.value.kind === ProjectTableRowType.enum.project,
            )

            const targetIsCategory =
                targetNode.value.kind === ProjectTableRowType.enum.category

            const targetIsProject =
                targetNode.value.kind === ProjectTableRowType.enum.project

            // Categories can only move before/after categories.
            if (isMovingCategory) {
                console.log({ isMovingCategory })

                if (!targetIsCategory) return
                if (event.target.dropPosition === 'on') return

                if (event.target.dropPosition === 'before') {
                    tree.moveBefore(event.target.key, event.keys)
                }

                if (event.target.dropPosition === 'after') {
                    tree.moveAfter(event.target.key, event.keys)
                }

                const categoriesPayload = tree.items.map((node, index) => ({
                    id: node.value.id,
                    order: index,
                }))

                await apiClientSide.patch(localApiEndpoints.ADMIN.PROJECTS, {
                    json: {
                        type: ProjectTableRowType.enum.category,
                        categories: categoriesPayload,
                    },
                })

                return
            }

            // Projects can be dropped ON a category.
            if (
                isMovingProject &&
                targetIsCategory &&
                event.target.dropPosition === 'on'
            ) {
                const targetIndex =
                    targetNode.value.kind === ProjectTableRowType.enum.category
                        ? targetNode.value.children.length
                        : 0

                movedKeys.forEach((key, index) => {
                    tree.move(key, event.target.key, targetIndex + index)
                })

                const updatedCategory = tree.getItem(event.target.key)

                await apiClientSide.patch(localApiEndpoints.ADMIN.PROJECTS, {
                    json: {
                        type: ProjectTableRowType.enum.project,
                        categoryId: targetNode.value.id,
                        projects:
                            updatedCategory?.value.children.map(
                                (project, index) => ({
                                    id: project.id,
                                    order: index,
                                }),
                            ) ?? [],
                    },
                })

                return
            }

            // Projects can move before/after projects.
            if (isMovingProject && targetIsProject) {
                console.log('🔥 isMovingProject')
                console.log({ isMovingProject })

                const parentKey = targetNode.parentKey

                if (!parentKey) return

                if (event.target.dropPosition === 'before') {
                    tree.moveBefore(event.target.key, event.keys)
                }

                if (event.target.dropPosition === 'after') {
                    tree.moveAfter(event.target.key, event.keys)
                }

                const parentCategory = tree.getItem(parentKey)

                await apiClientSide.patch(localApiEndpoints.ADMIN.PROJECTS, {
                    json: {
                        type: ProjectTableRowType.enum.project,
                        categoryId: parentCategory?.value.id,
                        projects:
                            parentCategory?.value.children.map(
                                (project, index) => ({
                                    id: project.id,
                                    order: index,
                                }),
                            ) ?? [],
                    },
                })

                return
            }
        },
    })

    const renderItem = (item: ProjectTreeItem) => (
        <Row
            id={item.id as Key}
            className={clsx({
                'sticky top-0 z-10':
                    item.kind === ProjectTableRowType.enum.category,
            })}
        >
            <Cell>
                {item.kind === ProjectTableRowType.enum.category
                    ? item.name
                    : item.title}
            </Cell>

            <Cell>
                {item.kind === ProjectTableRowType.enum.category
                    ? 'Category'
                    : 'Project'}
            </Cell>

            <Cell>{item.order}</Cell>

            {item.kind === ProjectTableRowType.enum.category && (
                <Collection items={item.children}>{renderItem}</Collection>
            )}
        </Row>
    )

    return (
        <Table
            aria-label='Projects'
            treeColumn='name'
            defaultExpandedKeys={tree.items.map((item) => item.key)}
            dragAndDropHooks={dragAndDropHooks}
        >
            <TableHeader>
                <Column
                    id='name'
                    isRowHeader
                >
                    Name
                </Column>
                <Column id='type'>Type</Column>
                <Column id='order'>Order</Column>
            </TableHeader>

            <TableBody items={initialItems}>{renderItem}</TableBody>
        </Table>
    )
}

export default ProjectsTreeTable
