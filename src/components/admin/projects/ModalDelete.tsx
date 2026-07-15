import ButtonGeneric from '@/components/buttons/ButtonGeneric'
import { useProjectsStore } from '@/stores/admin/projects'
import { CategoryNode, ProjectNode } from '@/types/admin/projectsTable'
import { ProjectTableRowType } from '@/utils/enums/admin'
import { useClickOutside } from '@mantine/hooks'
import Form from '@/components/Form'
import { queue as toastQueue } from '@/components/Toast'
import { ToastColorVariant } from '@/types/ui/toast'

type ModalDeleteProps = {
    setIsModalOpen: (isOpen: boolean) => void
    setIsDelete: (isDelete: boolean) => void
    rowSelected: CategoryNode | ProjectNode
}

const ModalDelete = ({
    rowSelected,
    setIsModalOpen,
    setIsDelete,
}: ModalDeleteProps) => {
    const ref = useClickOutside(() => {
        setIsDelete(false)

        setIsModalOpen(false)
    })

    const deleteRow = useProjectsStore((state) => state.deleteRow)
    const isLoading = useProjectsStore((state) => state.isLoading)

    const isCategory = rowSelected.kind === ProjectTableRowType.enum.category
    const label = isCategory ? rowSelected.name : rowSelected.title

    const handleDelete = async () => {
        const resultDelete = await deleteRow({
            _id: rowSelected.id,
            type: rowSelected.kind,
        })

        setIsModalOpen(false)
        setIsDelete(false)

        toastQueue.add(
            {
                title: resultDelete.message,
                variant: resultDelete.success
                    ? ToastColorVariant.enum.success
                    : ToastColorVariant.enum.error,
            },
            { timeout: 5000 },
        )
    }

    return (
        <div
            ref={ref}
            className='flex w-full flex-col gap-6 rounded-lg bg-neutral-900 p-6'
        >
            <Form action={handleDelete}>
                <div>
                    <h2 className='text-xl font-bold text-red-400'>
                        Delete {isCategory ? 'category' : 'project'}
                    </h2>

                    <p className='mt-3 text-sm leading-6 text-neutral-300'>
                        Are you sure you want to permanently delete this{' '}
                        {isCategory ? 'category' : 'project'}?
                    </p>

                    <p className='mt-2 rounded bg-neutral-800 px-3 py-2 font-semibold text-white'>
                        {label}
                    </p>

                    {isCategory && (
                        <p className='mt-4 text-sm text-amber-300'>
                            ⚠ Projects belonging to this category will also be
                            deleted.
                        </p>
                    )}
                </div>

                <div className='flex justify-end gap-3'>
                    <ButtonGeneric
                        type='button'
                        onClick={() => {
                            setIsDelete(false)
                            setIsModalOpen(false)
                        }}
                    >
                        Cancel
                    </ButtonGeneric>

                    <ButtonGeneric
                        type='submit'
                        className='bg-red-600 hover:bg-red-700'
                        onClick={() => {}}
                    >
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </ButtonGeneric>
                </div>
            </Form>
        </div>
    )
}

export default ModalDelete
