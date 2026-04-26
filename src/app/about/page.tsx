import { AboutSchema } from '@/types/about/schema'
import { collections } from '@/utils/constants'
import { getDb } from '@/utils/mongo'
import Image from 'next/image'
import { notFound } from 'next/navigation'

const About = async () => {
    const database = await getDb()

    const aboutCollection = database.collection<AboutSchema>(collections.ABOUT)

    const aboutData = await aboutCollection.findOne()

    if (!aboutData) {
        notFound()
    }

    return (
        <div className='flex justify-center w-screen text-white font-mono'>
            <div className='relative isolate'>
                <div className='absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_35%),linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent_40%)]' />
                <div className='absolute inset-0 -z-10 bg-black' />

                <div className='mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 py-15 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:px-16'>
                    <div className='order-2 flex flex-col justify-center lg:order-1'>
                        <p className='mb-4 font-mono text-xs uppercase tracking-[0.35em] text-white/50'>
                            About
                        </p>

                        <h1 className='max-w-3xl tracking-wide font-poiret text-4xl font-black sm:text-5xl lg:text-6xl'>
                            Safran Lecuivre
                        </h1>

                        <p className='mt-4 max-w-2xl text-sm uppercase tracking-[0.28em] text-white/55'>
                            Cinematographer · Visual Storyteller
                        </p>

                        <div className='mt-10 max-w-2xl text-base text-white/80 md:text-lg'>
                            {aboutData.text
                                .split('\n\n')
                                .map((paragraph: string, index: number) => (
                                    <p
                                        key={index}
                                        className='mb-4 leading-7 md:leading-8'
                                    >
                                        {paragraph.trim()}
                                    </p>
                                ))}
                        </div>
                    </div>

                    <div className='order-1 flex justify-center lg:order-2 lg:h-full lg:items-stretch'>
                        <div className='group relative w-full max-w-md lg:h-full'>
                            <div className='absolute -inset-4 rounded-[2rem] bg-white/10 blur-3xl transition-opacity duration-700 group-hover:opacity-80' />

                            <div className='relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/5 shadow-2xl backdrop-blur-sm lg:h-full'>
                                <div className='absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/5' />

                                <div className='relative aspect-[4/5] w-full lg:h-full lg:aspect-auto'>
                                    <Image
                                        src={aboutData.image.url}
                                        alt='Portrait of Safran Lecuivre'
                                        fill
                                        priority
                                        className='object-cover'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default About
