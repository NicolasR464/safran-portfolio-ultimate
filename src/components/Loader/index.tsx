import React from 'react'

type CinemaReelLoaderProps = {
    size?: number
    label?: string
}

export default function CinemaReelLoader({
    size = 96,
    label = 'Loading',
}: CinemaReelLoaderProps) {
    return (
        <div
            className="inline-flex flex-col items-center justify-center gap-3"
            role="status"
            aria-label={label}
        >
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    viewBox="0 0 120 120"
                    className="h-full w-full animate-[spin_1.6s_linear_infinite]"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle
                        cx="60"
                        cy="60"
                        r="42"
                        className="fill-zinc-900/90 stroke-white/15"
                        strokeWidth="3"
                    />

                    <circle
                        cx="60"
                        cy="60"
                        r="8"
                        className="fill-white/10 stroke-white/20"
                        strokeWidth="2"
                    />

                    <circle
                        cx="60"
                        cy="29"
                        r="11"
                        className="fill-black/80 stroke-white/10"
                        strokeWidth="2"
                    />
                    <circle
                        cx="91"
                        cy="60"
                        r="11"
                        className="fill-black/80 stroke-white/10"
                        strokeWidth="2"
                    />
                    <circle
                        cx="60"
                        cy="91"
                        r="11"
                        className="fill-black/80 stroke-white/10"
                        strokeWidth="2"
                    />
                    <circle
                        cx="29"
                        cy="60"
                        r="11"
                        className="fill-black/80 stroke-white/10"
                        strokeWidth="2"
                    />
                    <circle
                        cx="82"
                        cy="38"
                        r="11"
                        className="fill-black/80 stroke-white/10"
                        strokeWidth="2"
                    />
                    <circle
                        cx="38"
                        cy="82"
                        r="11"
                        className="fill-black/80 stroke-white/10"
                        strokeWidth="2"
                    />

                    <path
                        d="M60 18
               A42 42 0 0 1 102 60"
                        className="stroke-white/45"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                </svg>

                <div className="absolute inset-0 rounded-full bg-white/[0.04] blur-md" />
            </div>

            <span className="text-sm text-white/70">{label}...</span>
        </div>
    )
}
