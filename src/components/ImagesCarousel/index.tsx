'use client'

import type { ImageMetadata } from '@/types/project'
import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import type { ComponentPropsWithRef } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

const TWEEN_FACTOR_BASE = 0.2

type ImagesCarouselProps = {
    imagesCarousel: ImageMetadata[]
    options?: EmblaOptionsType
    isVideo: boolean
}

const ImagesCarousel = ({
    imagesCarousel,
    options,
    isVideo,
}: ImagesCarouselProps) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        dragFree: false,
        containScroll: 'trimSnaps',
        ...options,
    })

    const tweenFactor = useRef(0)
    const tweenNodes = useRef<HTMLElement[]>([])

    const { selectedIndex, scrollSnaps, onDotButtonClick } =
        useDotButton(emblaApi)

    const {
        prevBtnDisabled,
        nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick,
    } = usePrevNextButtons(emblaApi)

    const setTweenNodes = useCallback((api: EmblaCarouselType) => {
        tweenNodes.current = api
            .slideNodes()
            .map((slideNode) =>
                slideNode.querySelector<HTMLElement>(
                    '[data-embla-parallax-layer]',
                ),
            )
            .filter((node): node is HTMLElement => node !== null)
    }, [])

    const setTweenFactor = useCallback((api: EmblaCarouselType) => {
        tweenFactor.current = TWEEN_FACTOR_BASE * api.scrollSnapList().length
    }, [])

    const tweenParallax = useCallback((api: EmblaCarouselType) => {
        const engine = api.internalEngine()
        const scrollProgress = api.scrollProgress()
        const slidesInView = api.slidesInView()

        api.scrollSnapList().forEach((scrollSnap, snapIndex) => {
            const diffToTarget = scrollSnap - scrollProgress
            const slidesInSnap = engine.slideRegistry[snapIndex] ?? []

            slidesInSnap.forEach((slideIndex) => {
                if (!slidesInView.includes(slideIndex)) return

                const translate = diffToTarget * -tweenFactor.current * 100
                const tweenNode = tweenNodes.current[slideIndex]

                if (tweenNode) {
                    tweenNode.style.transform = `translateX(${translate}%)`
                }
            })
        })
    }, [])

    useEffect(() => {
        if (!emblaApi) return

        setTweenNodes(emblaApi)
        setTweenFactor(emblaApi)
        tweenParallax(emblaApi)

        emblaApi
            .on('reInit', setTweenNodes)
            .on('reInit', setTweenFactor)
            .on('reInit', tweenParallax)
            .on('scroll', tweenParallax)
            .on('slideFocus', tweenParallax)
    }, [emblaApi, setTweenNodes, setTweenFactor, tweenParallax])

    if (!imagesCarousel.length) return null

    const rootClassName = isVideo
        ? 'relative w-full'
        : 'relative mx-auto w-full max-w-[min(100%,calc(62dvh*16/9))]'

    const slideClassName = isVideo
        ? 'min-w-0 flex-[0_0_85%] pl-4 first:pl-0 md:flex-[0_0_42%] lg:flex-[0_0_32%]'
        : 'min-w-0 flex-[0_0_100%]'

    const imageWrapperClassName = isVideo
        ? 'relative overflow-hidden rounded-md'
        : 'relative aspect-video w-full overflow-hidden bg-black/35 shadow-2xl backdrop-blur-[2px]'

    const parallaxLayerClassName = isVideo
        ? 'relative h-44 w-[115%] -translate-x-[7.5%] md:h-56'
        : 'relative h-full w-[115%] -translate-x-[7.5%]'

    const sizes = isVideo
        ? '(min-width: 1024px) 32vw, (min-width: 768px) 42vw, 85vw'
        : 'min(100vw, calc(62dvh * 16 / 9))'

    return (
        <div className={rootClassName}>
            <div
                ref={emblaRef}
                className='overflow-hidden'
            >
                <div className='flex touch-pan-y touch-pinch-zoom'>
                    {imagesCarousel.map((image, index) => (
                        <div
                            key={`${image.imageId}-${index}`}
                            className={slideClassName}
                        >
                            <div className={imageWrapperClassName}>
                                <div
                                    data-embla-parallax-layer
                                    className={parallaxLayerClassName}
                                >
                                    <Image
                                        src={image.url}
                                        alt={`Project image ${index + 1}`}
                                        fill
                                        sizes={sizes}
                                        priority={isVideo && index === 0}
                                        className='object-cover object-center'
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {imagesCarousel.length > 1 && (
                <>
                    <CarouselButton
                        direction='prev'
                        onClick={onPrevButtonClick}
                        disabled={prevBtnDisabled}
                    />

                    <CarouselButton
                        direction='next'
                        onClick={onNextButtonClick}
                        disabled={nextBtnDisabled}
                    />

                    <div className='mt-4 flex justify-center gap-2'>
                        {scrollSnaps.map((_, index) => (
                            <button
                                key={index}
                                type='button'
                                onClick={() => onDotButtonClick(index)}
                                className={
                                    index === selectedIndex
                                        ? 'h-2 w-6 rounded-full bg-white transition-all'
                                        : 'h-2 w-2 rounded-full bg-white/40 transition-all hover:bg-white/70'
                                }
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default ImagesCarousel

const usePrevNextButtons = (emblaApi: EmblaCarouselType | undefined) => {
    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true)

    const onPrevButtonClick = useCallback(() => {
        emblaApi?.scrollPrev()
    }, [emblaApi])

    const onNextButtonClick = useCallback(() => {
        emblaApi?.scrollNext()
    }, [emblaApi])

    const onSelect = useCallback((api: EmblaCarouselType) => {
        setPrevBtnDisabled(!api.canScrollPrev())
        setNextBtnDisabled(!api.canScrollNext())
    }, [])

    useEffect(() => {
        if (!emblaApi) return

        onSelect(emblaApi)
        emblaApi.on('reInit', onSelect).on('select', onSelect)
    }, [emblaApi, onSelect])

    return {
        prevBtnDisabled,
        nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick,
    }
}

const useDotButton = (emblaApi: EmblaCarouselType | undefined) => {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

    const onDotButtonClick = useCallback(
        (index: number) => {
            emblaApi?.scrollTo(index)
        },
        [emblaApi],
    )

    const onInit = useCallback((api: EmblaCarouselType) => {
        setScrollSnaps(api.scrollSnapList())
    }, [])

    const onSelect = useCallback((api: EmblaCarouselType) => {
        setSelectedIndex(api.selectedScrollSnap())
    }, [])

    useEffect(() => {
        if (!emblaApi) return

        onInit(emblaApi)
        onSelect(emblaApi)

        emblaApi
            .on('reInit', onInit)
            .on('reInit', onSelect)
            .on('select', onSelect)
    }, [emblaApi, onInit, onSelect])

    return {
        selectedIndex,
        scrollSnaps,
        onDotButtonClick,
    }
}

type CarouselButtonProps = ComponentPropsWithRef<'button'> & {
    direction: 'prev' | 'next'
}

const CarouselButton = ({
    direction,
    className,
    ...props
}: CarouselButtonProps) => {
    const Icon = direction === 'prev' ? ChevronLeft : ChevronRight

    return (
        <button
            type='button'
            className={[
                'absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80 disabled:pointer-events-none disabled:opacity-30',
                direction === 'prev' ? 'left-3' : 'right-3',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            {...props}
        >
            <Icon className='size-6' />
        </button>
    )
}
