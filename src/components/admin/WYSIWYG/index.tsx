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
import { useEffect, type FC } from 'react'
import type { PointerEvent } from 'react'
import { useDebouncedState } from '@mantine/hooks'
import { useProjectsStore } from '@/stores/admin/projects'

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

const WYSIWYG: FC<EditorProps> = ({ markdown }) => {
    const [value, setValue] = useDebouncedState('', 400)

    const updateDraft = useProjectsStore(
        (state) => state.updateProjectFormDraft,
    )

    useEffect(() => {
        updateDraft({ description: value })
    }, [value, updateDraft])

    return (
        <MDXEditor
            markdown={markdown}
            onChange={(markdownContent) => {
                setValue(markdownContent)
            }}
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
                            className='flex justify-around w-90 items-center gap-1'
                        >
                            <BoldItalicUnderlineToggles />

                            <CreateLink />

                            <ListsToggle options={['bullet']} />

                            <BlockTypeSelect />
                        </div>
                    ),
                }),
            ]}
        />
    )
}

export default WYSIWYG
