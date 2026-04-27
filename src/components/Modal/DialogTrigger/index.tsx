'use client'
import { Button, DialogTrigger } from 'react-aria-components'

import Modal from '..'
import Dialog from '../Dialog'

const Example = (props) => {
    return (
        <DialogTrigger {...props}>
            <Button>Sign up…</Button>
            <Modal
                {...props}
                isDismissable
            >
                <Dialog>
                    <h1
                        slot='title'
                        className='text-xl mt-0'
                    >
                        Subscribe to our newsletter
                    </h1>
                    <p className='text-sm'>
                        Enter your information to subscribe to our newsletter
                        and receive updates about new features and
                        announcements.
                    </p>
                </Dialog>
            </Modal>
        </DialogTrigger>
    )
}

export default Example
