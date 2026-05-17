import { ObjectId } from 'mongodb'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import ButtonBack from '@/components/buttons/ButtonBack'
import { ProjectSchema } from '@/types/project/schema'
import { collections, keyToCategory } from '@/utils/constants'
import { getDb } from '@/utils/mongo'
import { embedSrcBuilder } from '@/utils'
import { ImageCategory } from '@/types/project'
import ModalContainer from '@/components/Modal/ModalContainer'

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

    const imageBackground = project.images?.find((img) =>
        img.types.includes(ImageCategory.enum.background),
    )

    const imagePoster = project.images?.find((img) =>
        img.types.includes(ImageCategory.enum.poster),
    )

    const imagesCarousel =
        project.images?.filter((img) =>
            img.types.includes(ImageCategory.enum.carousel),
        ) ?? []

    return (
        <div className='relative h-[calc(100dvh-var(--header-height))] bg-black text-white'>
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

                <div className='absolute inset-0 bg-black/45' />
                <div className='absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-black' />
            </div>

            <section className='relative z-10 mx-auto flex min-h-[calc(100dvh-var(--header-height))] w-full max-w-6xl flex-col justify-end gap-8 px-6 pb-10 pt-24'>
                {/* Video */}
                {!!embedSrc && (
                    <div className='flex w-full justify-center'>
                        <div className='relative aspect-video w-full max-w-[min(100%,calc(58dvh*16/9))] overflow-hidden border border-white/40 bg-black/35 shadow-2xl backdrop-blur-[2px]'>
                            <iframe
                                src={embedSrc}
                                title={project.title}
                                allowFullScreen
                                className='absolute inset-0 h-full w-full'
                            />
                        </div>
                    </div>
                )}

                {/* Image Poster */}
                {!!imagePoster?.url && (
                    <div className='flex w-full justify-center'>
                        <div className='relative flex max-h-[70dvh] w-full max-w-5xl items-center justify-center overflow-hidden bg-black/35 shadow-2xl backdrop-blur-[2px]'>
                            <Image
                                src={imagePoster.url}
                                alt={project.title || 'Project poster image'}
                                width={1200}
                                height={1200}
                                priority
                                className='h-auto max-h-[70dvh] w-auto max-w-full object-contain'
                            />
                        </div>
                    </div>
                )}

                {/* Project Metadata */}
                <div className='w-full max-w-3xl mx-auto'>
                    <h1 className='text-3xl font-black font-mono tracking-tight md:text-5xl text-center'>
                        {project.title}
                    </h1>

                    <p className='mt-2 text-sm uppercase tracking-[0.3em] text-white/60 text-center'>
                        {keyToCategory[project.category.name]}
                    </p>

                    {!!project.description && (
                        <div
                            className='prose prose-neutral max-w-none mt-4 text-left prose prose-invert max-w-none prose-h2:text-3xl prose-h2:font-semibold prose-h2:mb-4 prose-h3:text-xl prose-h3:font-medium prose-h3:mt-8 prose-h3:mb-3 prose-p:leading-8 prose-p:mb-4 prose-li:mb-2 prose-strong:text-white'
                            dangerouslySetInnerHTML={{
                                __html: project.description,
                            }}
                        />
                    )}
                </div>

                {/* Carousel Images */}
                {!!imagesCarousel?.length && (
                    <ModalContainer images={imagesCarousel} />
                )}
            </section>
        </div>
    )
}

export default Project
