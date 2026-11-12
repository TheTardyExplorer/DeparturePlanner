import { RotateCcw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDuration } from '../lib/time'
import { useStore } from '../lib/store'
import { DurationField } from './DurationField'
import { Button } from './ui/button'
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader } from './ui/sheet'

interface DurationSheetProps {
  itemId: string | null
  onClose: () => void
}

export function DurationSheet({ itemId, onClose }: DurationSheetProps) {
  const item = useStore((state) =>
    itemId ? state.currentPlan.items.find((entry) => entry.id === itemId) : undefined,
  )
  const setPlanItemMinutes = useStore((state) => state.setPlanItemMinutes)
  const resetPlanItemDuration = useStore((state) => state.resetPlanItemDuration)
  const removePlanItem = useStore((state) => state.removePlanItem)
  const insertPlanItem = useStore((state) => state.insertPlanItem)

  const open = Boolean(itemId && item)

  const handleRemove = () => {
    if (!item) return
    const removed = removePlanItem(item.id)
    if (removed) {
      toast(`Removed ${item.name}`, {
        action: {
          label: 'Undo',
          onClick: () => insertPlanItem(removed.item, removed.index),
        },
      })
    }
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent>
        {item ? (
          <>
            <SheetHeader
              title={
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="truncate">{item.name}</span>
                </span>
              }
              description="Change the timing just for this plan."
            />

            <SheetBody>
              <DurationField
                minutes={item.minutes}
                onChange={(minutes) => setPlanItemMinutes(item.id, minutes)}
              />

              <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/60 px-3.5 py-2.5 text-sm">
                <span className="text-muted-foreground">Default duration</span>
                <span className="font-medium tabular">{formatDuration(item.defaultMinutes)}</span>
              </div>

              {item.minutes !== item.defaultMinutes ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1.5 w-full text-muted-foreground"
                  onClick={() => resetPlanItemDuration(item.id)}
                >
                  <RotateCcw className="size-3.5" />
                  Reset to {formatDuration(item.defaultMinutes)}
                </Button>
              ) : null}

              <Button
                variant="danger-ghost"
                className="mt-5 w-full"
                onClick={handleRemove}
              >
                <Trash2 className="size-4" />
                Remove this step
              </Button>
            </SheetBody>

            <SheetFooter>
              <Button className="w-full" onClick={onClose}>
                Done
              </Button>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
