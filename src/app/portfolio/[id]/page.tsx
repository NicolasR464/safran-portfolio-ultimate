import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ObjectId } from 'mongodb'

import { VideoSchema } from '@/types/video/schema'
import { collections } from '@/utils/constants'
import { db } from '@/utils/mongo'
import ButtonBack from '@/components/ButtonBack'

const Video = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params

    if (!ObjectId.isValid(id)) {
        notFound()
    }

    const database = await db()

    const videosCollection = database.collection<VideoSchema>(
        collections.VIDEOS,
    )

    const video = await videosCollection.findOne({
        _id: new ObjectId(id),
    })

    if (!video) {
        notFound()
    }

    const embedSrc =
        video.player === 'vimeo'
            ? `https://player.vimeo.com/video/${video.vidId}`
            : `https://www.youtube.com/embed/${video.vidId}`

    return (
        <div className="relative h-[calc(100dvh-var(--header-height))] overflow-hidden bg-black text-white">
            <div className="fixed inset-0">
                <ButtonBack />

                <Image
                    src={video.image.url}
                    alt={video.title}
                    fill
                    priority
                    className="object-cover object-center opacity-70"
                />
                <div className="absolute inset-0 bg-black/45" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-black" />
            </div>

            <section className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col items-center justify-center gap-4 overflow-hidden p-4">
                <div className="flex w-full justify-center">
                    <div className="relative aspect-video w-full max-w-[min(100%,calc(62dvh*16/9))] overflow-hidden border border-white/40 bg-black/35 shadow-2xl backdrop-blur-[2px]">
                        <iframe
                            src={embedSrc}
                            title={video.title}
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 h-full w-full"
                        />
                    </div>
                </div>

                <div className="flex w-full max-w-3xl flex-col items-center text-center">
                    <h1 className="text-3xl font-black font-mono tracking-tight md:text-6xl">
                        {video.title}
                    </h1>

                    <p className="mt-2 text-sm uppercase tracking-[0.3em] text-white/60">
                        {video.category}
                    </p>
                </div>
            </section>
        </div>
    )
}

export default Video
