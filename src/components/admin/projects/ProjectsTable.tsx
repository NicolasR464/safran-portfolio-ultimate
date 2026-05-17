'use client'

import { useEffect } from 'react'
import { Table, TableHeader, TableBody, Column, Row, Cell } from './Table'

import { useProjectsStore } from '@/stores/admin/projects'

const ProjectsTable = () => {
    const { projects, isLoading, hasMore, initialized, fetchNextBatch } =
        useProjectsStore()

    useEffect(() => {
        if (!initialized) {
            void fetchNextBatch()
        }
    }, [initialized, fetchNextBatch])

    return (
        <div className='space-y-4'>
            <Table
                aria-label='Projects'
                selectionMode='multiple'
            >
                <TableHeader>
                    <Column
                        id='title'
                        isRowHeader
                    >
                        Title
                    </Column>
                    <Column id='category'>Category</Column>
                    <Column id='order'>Order</Column>
                </TableHeader>

                <TableBody>
                    {projects.map((project) => (
                        <Row
                            key={project._id.toString()}
                            id={project._id.toString()}
                        >
                            <Cell>{project.title ?? 'Untitled'}</Cell>
                            <Cell>{project.category}</Cell>
                            <Cell>{project.order ?? '-'}</Cell>
                        </Row>
                    ))}
                </TableBody>
            </Table>

            {hasMore && (
                <button
                    type='button'
                    onClick={() => void fetchNextBatch()}
                    disabled={isLoading}
                    className='rounded-md bg-white px-4 py-2 text-black disabled:opacity-50'
                >
                    {isLoading ? 'Loading...' : 'Load more'}
                </button>
            )}
        </div>
    )
}

export default ProjectsTable
