import type { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

interface BadgeProps extends ComponentProps<'span'> {}

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <span
      className={twMerge(
        'px-3 rounded-lg border text-mono text-sm font-semibold text-zinc-100 border-zinc-600 bg-zinc-800',
        className,
      )}
      {...props}
    />
  )
}
