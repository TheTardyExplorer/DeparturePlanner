import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Button } from './button'

export const Sheet = Dialog.Root
export const SheetTrigger = Dialog.Trigger
export const SheetClose = Dialog.Close

export function SheetContent({
  className,
  children,
  ...props
}: ComponentProps<typeof Dialog.Content>) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay
        data-slot="sheet-overlay"
        className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]"
      />
      <Dialog.Content
        data-slot="sheet-content"
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col rounded-t-[28px] border-t border-border bg-card shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.45)] outline-none',
          'sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[min(560px,92vw)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px] sm:border',
          className,
        )}
        {...props}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-border sm:hidden" />
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  )
}

interface SheetHeaderProps {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}

export function SheetHeader({ title, description, action }: SheetHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-3 sm:pt-5">
      <div className="min-w-0">
        <Dialog.Title className="text-[19px] font-semibold tracking-tight">{title}</Dialog.Title>
        {description ? (
          <Dialog.Description className="mt-0.5 text-sm text-muted-foreground">
            {description}
          </Dialog.Description>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {action}
        <Dialog.Close asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Close" className="size-10 rounded-full">
            <X className="size-4" />
          </Button>
        </Dialog.Close>
      </div>
    </div>
  )
}

export function SheetBody({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex-1 overflow-y-auto overscroll-contain px-5 pb-5', className)}
      {...props}
    />
  )
}

export function SheetFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('border-t border-border/70 px-5 py-3 safe-bottom sm:pb-3', className)}
      {...props}
    />
  )
}
