export const handleMailPress = () => {
    window.location.href = `mailto:${process.env.NEXT_PUBLIC_MAIL_ADDRESS}`
}
