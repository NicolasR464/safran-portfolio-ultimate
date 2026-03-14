import ky from 'ky'

export const api = ky.create({
    prefixUrl: process.env.LOCAL_API,
    throwHttpErrors: false,
})

export const apiClientSide = ky.create({
    prefixUrl: process.env.NEXT_PUBLIC_LOCAL_API,
    throwHttpErrors: false,
})
