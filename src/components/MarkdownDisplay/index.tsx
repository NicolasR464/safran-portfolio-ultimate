import ReactMarkdown from 'react-markdown'

const MarkdownDisplay = ({ markdown }: { markdown: string }) => {
    return (
        <ReactMarkdown
            components={{
                h2: ({ children }) => (
                    <h2 className='markdown-h2'>{children}</h2>
                ),
                h3: ({ children }) => (
                    <h3 className='markdown-h3'>{children}</h3>
                ),
                p: ({ children }) => (
                    <p className='markdown-paragraph'>{children}</p>
                ),
                ul: ({ children }) => (
                    <ul className='markdown-list'>{children}</ul>
                ),
                li: ({ children }) => (
                    <li className='markdown-list-item'>{children}</li>
                ),
                a: ({ children, href }) => (
                    <a
                        href={href}
                        className='markdown-link'
                        target='_blank'
                        rel='noreferrer'
                    >
                        {children}
                    </a>
                ),
                strong: ({ children }) => (
                    <strong className='markdown-strong'>{children}</strong>
                ),
            }}
        >
            {markdown}
        </ReactMarkdown>
    )
}

export default MarkdownDisplay
