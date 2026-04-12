/** @type {import("prettier").Options} */
const config = {
    jsxSingleQuote: true,
    semi: false,
    singleAttributePerLine: true,
    singleQuote: true,
    tabWidth: 4,
    overrides: [
        {
            files: ['*.json'],
            options: {
                tabWidth: 2,
            },
        },
    ],
}

export default config
