'use client'

import { ProjectsListResponse } from '@/types/apiResponses/admin/projects'

import { Collection } from 'react-aria-components'
import { useDragAndDrop } from 'react-aria-components'
import { useTreeData } from 'react-stately'
import type { Key } from 'react-aria-components'
import type { Node } from '@react-types/shared'

import {
    Table,
    TableHeader,
    TableBody,
    Column,
    Row,
    Cell,
} from '@/components/Table'

type ProjectTreeItem = CategoryNode | ProjectNode

type DragItem = {
    value: ProjectTreeItem
}

type CategoryNode = {
    id: string
    kind: 'category'
    name: string
    order: number
    children: ProjectNode[]
}

type ProjectNode = {
    id: string
    kind: 'project'
    title: string
    order: number
    children: []
}

const ProjectsTreeTable = ({
    projectsByCategories,
}: {
    projectsByCategories: ProjectsListResponse
}) => {
    const tree = useTreeData<ProjectTreeItem>({
        initialItems: projectsByCategories.map(({ category, projects }) => ({
            id: `category-${category.name}`,
            kind: 'category',
            name: category.name,
            order: category.order,
            children: projects.map((project) => ({
                id: project._id.toString(),
                kind: 'project',
                title: project.title ?? 'Untitled',
                order: project.order ?? 0,
                children: [],
            })),
        })),
    })

    const { dragAndDropHooks } = useDragAndDrop({
        getItems: (_keys, items) =>
            (items as DragItem[]).map((item) => ({
                'text/plain':
                    item.value.kind === 'category'
                        ? item.value.name
                        : item.value.title,
            })),

        onMove: (event) => {
            const movedKeys = Array.from(event.keys)
            const targetNode = tree.getItem(event.target.key)

            if (!targetNode) return

            const movedNodes = movedKeys
                .map((key) => tree.getItem(key))
                .filter(Boolean)

            const isMovingCategory = movedNodes.some(
                (node) => node?.value.kind === 'category',
            )

            const isMovingProject = movedNodes.some(
                (node) => node?.value.kind === 'project',
            )

            const targetIsCategory = targetNode.value.kind === 'category'
            const targetIsProject = targetNode.value.kind === 'project'

            // Categories can only move before/after other categories.
            if (isMovingCategory) {
                if (!targetIsCategory) return
                if (event.target.dropPosition === 'on') return

                if (event.target.dropPosition === 'before') {
                    tree.moveBefore(event.target.key, event.keys)
                    return
                }

                if (event.target.dropPosition === 'after') {
                    tree.moveAfter(event.target.key, event.keys)
                }

                return
            }

            // Projects can be dropped ON a category.
            if (
                isMovingProject &&
                targetIsCategory &&
                event.target.dropPosition === 'on'
            ) {
                const targetIndex = targetNode.children?.length ?? 0

                movedKeys.forEach((key, index) => {
                    tree.move(key, event.target.key, targetIndex + index)
                })

                return
            }

            // Projects can move before/after other projects.
            if (
                isMovingProject &&
                targetIsProject &&
                event.target.dropPosition === 'before'
            ) {
                tree.moveBefore(event.target.key, event.keys)
                return
            }

            if (
                isMovingProject &&
                targetIsProject &&
                event.target.dropPosition === 'after'
            ) {
                tree.moveAfter(event.target.key, event.keys)
            }
        },
    })

    const renderItem = (item: Node<ProjectTreeItem>) => (
        <Row id={item.key as Key}>
            <Cell>
                {item.value?.kind === 'category'
                    ? item.value.name
                    : item.value?.title}
            </Cell>

            <Cell>
                {item.value?.kind === 'category' ? 'Category' : 'Project'}
            </Cell>

            <Cell>{item.value?.order}</Cell>

            {item.children && (
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

            <TableBody items={tree.items}>{renderItem}</TableBody>
        </Table>
    )
}

export default ProjectsTreeTable
