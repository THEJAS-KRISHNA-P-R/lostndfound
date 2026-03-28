import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  className?: string
  scale?: number
}

export function Logo({ className = '', scale = 1 }: LogoProps) {
  return (
    <Link
      href="/"
      className={`flex items-center shrink-0 group ${className}`}
      aria-label="LOFO Home"
      style={{ transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: 'left center' }}
    >
      <Image
        src="/logos/lofo-merged.png"
        alt="LOFO Logo"
        width={180}
        height={48}
        quality={95}
        priority
        className="h-10 w-auto transition-transform group-active:scale-95"
      />
    </Link>
  )
}
