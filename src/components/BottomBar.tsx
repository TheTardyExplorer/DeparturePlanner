import { BookmarkPlus, Plus } from 'lucide-react'
import { Button } from './ui/button'

interface BottomBarProps {
  onAdd: () => void
  onSavePlan: () => void
}

export function BottomBar({ onAdd, onSavePlan }: BottomBarProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30">
      <div className="mx-auto max-w-xl bg-gradient-to-t from-background via-background/95 to-transparent px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-10">
        <div className="pointer-events-auto flex gap-2">
          <Button
            size="lg"
            className="h-12 flex-1 rounded-2xl shadow-lg shadow-primary/25"
            onClick={onAdd}
          >
            <Plus className="size-5" />
            Add task
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 rounded-2xl bg-card/90 px-4 backdrop-blur"
            onClick={onSavePlan}
            aria-label="Save this plan as a preset"
          >
            <BookmarkPlus className="size-5" />
            <span className="hidden sm:inline">Save plan</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
