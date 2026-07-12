'use client'

import {
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    CreateLink,
    headingsPlugin,
    linkDialogPlugin,
    linkPlugin,
    listsPlugin,
    ListsToggle,
    MDXEditor,
    toolbarPlugin,
} from '@mdxeditor/editor'
import type { FC } from 'react'
import type { PointerEvent } from 'react'

interface EditorProps {
    markdown: string

    onChange?: (markdown: string) => void
}

const enableMdxEditorPopup = () => {
    requestAnimationFrame(() => {
        document

            .querySelectorAll<HTMLElement>('.mdxeditor-popup-container')

            .forEach((popup) => {
                popup.removeAttribute('inert')

                popup.removeAttribute('aria-hidden')

                popup.style.pointerEvents = 'auto'

                popup.style.zIndex = '99999'

                popup

                    .querySelectorAll<HTMLElement>(
                        '[data-radix-popper-content-wrapper]',
                    )

                    .forEach((wrapper) => {
                        wrapper.style.pointerEvents = 'auto'

                        wrapper.style.zIndex = '100000'
                    })
            })
    })
}

const handleToolbarPointerDownCapture = (
    event: PointerEvent<HTMLDivElement>,
) => {
    const target = event.target as HTMLElement

    const opensPopup = target.closest(
        [
            '[role="combobox"]',

            '[aria-haspopup="listbox"]',

            '[aria-haspopup="dialog"]',

            '[aria-haspopup="menu"]',
        ].join(','),
    )

    if (opensPopup) {
        enableMdxEditorPopup()
    }
}

const WYSIWYG: FC<EditorProps> = ({ markdown, onChange }) => {
    return (
        <MDXEditor
            markdown={markdown}
            onChange={onChange}
            className='wysiwyg-theme'
            contentEditableClassName='wysiwyg-content'
            plugins={[
                headingsPlugin({
                    allowedHeadingLevels: [2, 3],
                }),
                linkPlugin(),
                linkDialogPlugin(),
                listsPlugin(),
                toolbarPlugin({
                    toolbarContents: () => (
                        <div
                            role='toolbar'
                            onPointerDownCapture={
                                handleToolbarPointerDownCapture
                            }
                            className='flex items-center gap-1'
                        >
                            <BlockTypeSelect />
                            <BoldItalicUnderlineToggles />
                            <CreateLink />
                            <ListsToggle options={['bullet']} />
                        </div>
                    ),
                }),
            ]}
        />
    )
}

export default WYSIWYG
