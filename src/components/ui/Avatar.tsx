import Image from 'next/image'

type AvatarProps = {
  src?: string | null
  fallback?: string
  size?: 24 | 32 | 40 | 48 | 64
}

export function Avatar({ src, fallback = '?', size = 32 }: AvatarProps) {
  const initials = fallback.includes('@')
    ? fallback[0].toUpperCase()
    : fallback
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

  if (src) {
    return (
      <div
        className="rounded-full overflow-hidden shrink-0 ring-1 ring-[var(--color-bg-border)]"
        style={{ width: size, height: size }}
      >
        <Image src={src} alt={fallback} width={size} height={size} className="object-cover" />
      </div>
    )
  }

  return (
    <div
      className="rounded-full shrink-0 bg-[var(--color-bg-elevated)] ring-1 ring-[var(--color-bg-border)] flex items-center justify-center text-[var(--color-accent)] font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  )
}
