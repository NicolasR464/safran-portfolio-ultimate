import { ObjectId } from 'mongodb'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import ButtonBack from '@/components/buttons/ButtonBack'
import { ProjectSchema } from '@/types/project/schema'
import { collections, keyToCategory } from '@/utils/constants'
import { getDb } from '@/utils/mongo'
import { embedSrcBuilder } from '@/utils'
import { ImageCategory } from '@/types/project'

/** Single Project page displaying a project's details. */
const Project = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params

    if (!ObjectId.isValid(id)) {
        notFound()
    }

    const database = await getDb()

    const projectsCollection = database.collection<ProjectSchema>(
        collections.PROJECTS,
    )

    const project = await projectsCollection.findOne({
        _id: new ObjectId(id),
    })

    if (!project) {
        notFound()
    }

    const embedSrc =
        project.video &&
        embedSrcBuilder(project.video.player, project.video.videoId)

    const imageBackground = project.images?.find(
        (img) => img.type === ImageCategory.enum.background,
    )

    const imageThumbnail = project.images?.find(
        (img) => img.type === ImageCategory.enum.thumbnail,
    )

    return (
        <div className='relative h-[calc(100dvh-var(--header-height))] overflow-hidden bg-black text-white'>
            <ButtonBack />

            <div className='fixed inset-0'>
                {/* Image Background */}
                {imageBackground && (
                    <Image
                        src={imageBackground.url}
                        alt={project.title || 'Project image background'}
                        fill
                        priority
                        className='object-cover object-center opacity-70'
                    />
                )}

                {/* Image Thumbnail (if no Image Background) */}
                {!imageBackground && imageThumbnail && (
                    <Image
                        src={imageThumbnail.url}
                        alt={project.title || 'Project image thumbnail'}
                        fill
                        priority
                        className='object-cover object-center opacity-70'
                    />
                )}

                <div className='absolute inset-0 bg-black/45' />
                <div className='absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-black' />
            </div>

            <section className='relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col items-center justify-center gap-4 overflow-hidden p-4'>
                {/* Video */}
                {!!embedSrc && (
                    <div className='flex w-full justify-center'>
                        <div className='relative aspect-video w-full max-w-[min(100%,calc(62dvh*16/9))] overflow-hidden border border-white/40 bg-black/35 shadow-2xl backdrop-blur-[2px]'>
                            <iframe
                                src={embedSrc}
                                title={project.title}
                                allowFullScreen
                                className='absolute inset-0 h-full w-full'
                            />
                        </div>
                    </div>
                )}

                {/* Image Placeholder */}
                {!embedSrc && imageThumbnail && (
                    <div className='flex w-full justify-center'>
                        <div className='relative aspect-video w-full max-w-[min(100%,calc(62dvh*16/9))] overflow-hidden border border-white/40 bg-black/35 shadow-2xl backdrop-blur-[2px]'>
                            <Image
                                src={imageThumbnail.url}
                                alt={project.title || 'Project image thumbnail'}
                                fill
                                priority
                                className='object-cover object-center'
                            />
                        </div>
                    </div>
                )}

                {/* Project Description */}
                <div className='flex w-full max-w-3xl flex-col items-center text-center'>
                    <h1 className='text-3xl font-black font-mono tracking-tight md:text-5xl'>
                        {project.title}
                    </h1>

                    <p className='mt-4 text-left text-white/80'>
                        {project.description}
                    </p>

                    <p className='mt-2 text-sm uppercase tracking-[0.3em] text-white/60'>
                        {keyToCategory[project.category]}
                    </p>
                </div>
            </section>
        </div>
    )
}

export default Project
