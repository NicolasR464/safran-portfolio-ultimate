import ButtonGeneric from '@/components/buttons/ButtonGeneric'
import Form from '@/components/Form'
import TextField from '@/components/TextField'
import { CategoryNode } from '@/types/admin/projectsTable'

type FormCategoryProps = {
    categoryMetadata: CategoryNode
}

const FormCategory = ({ categoryMetadata }: FormCategoryProps) => {
    return (
        <Form className='w-full flex justify-center'>
            <div className='flex flex-col p-4'>
                <h2 className='text-center text-2xl font-bold text-white mb-4'>
                    Edit Category: {categoryMetadata.name}
                </h2>

                {/* {JSON.stringify(categoryMetadata)} */}

                <TextField
                    label='Category Name'
                    placeholder='Update category name'
                    defaultValue={categoryMetadata.name}
                />

                <ButtonGeneric type='submit'>Update</ButtonGeneric>
            </div>
        </Form>
    )
}

export default FormCategory
