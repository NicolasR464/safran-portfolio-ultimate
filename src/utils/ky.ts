import ky from 'ky'

export const apiClientSide = ky.create({
    prefixUrl: process.env.NEXT_PUBLIC_LOCAL_API,
    throwHttpErrors: false,
})
