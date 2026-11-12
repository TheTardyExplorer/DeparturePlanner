import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Check, GripVertical, ListChecks, MapPin, Plus } from 'lucide-react'
import { cn } from '../lib/cn'
import { useStore } from '../lib/store'
import {
  buildTimeline,
  dayDiff,
  formatAbsoluteDay,
  formatDuration,
  formatTime,
  totalMinutes,
  type TimelineEntry,
} from '../lib/time'
import { Button } from './ui/button'

interface TimelineProps {
  now: Date
  onEdit: (itemId: string) => void
}

export function Timeline({ now, onEdit }: TimelineProps) {
  const plan = useStore((state) => state.currentPlan)
  const hourCycle = useStore((state) => state.settings.hourCycle)
  const reorderPlanItems = useStore((state) => state.reorderPlanItems)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const { arrival, entries } = buildTimeline(plan, now)
  const total = totalMinutes(plan.items)

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      reorderPlanItems(String(active.id), String(over.id))
    }
  }

  return (
    <section>
      <div className="mb-2 flex items-end justify-between px-1">
        <h2 className="text-[15px] font-semibold">Your plan</h2>
        <span className="text-xs text-muted-foreground">
          {plan.items.length} {plan.items.length === 1 ? 'step' : 'steps'} ·{' '}
          {formatDuration(total)}
        </span>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-24px_rgba(15,23,42,0.35)]">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={plan.items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y divide-border/70">
              {entries.map((entry) => (
                <SortableTaskRow
                  key={entry.item.id}
                  entry={entry}
                  arrival={arrival}
                  now={now}
                  hourCycle={hourCycle}
                  onEdit={onEdit}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="flex items-center gap-2 border-t border-border/70 bg-primary/[0.04] px-3 py-3.5">
          <span className="w-[62px] shrink-0 text-[13px] font-semibold tabular">
            {formatTime(arrival, hourCycle)}
          </span>
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <MapPin className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold">Arrive</span>
            <span className="block text-xs text-muted-foreground">
              {formatAbsoluteDay(arrival, now)}
            </span>
          </span>
          <span className="grid size-8 shrink-0 place-items-center">
            <Check className="size-4 text-success" />
          </span>
        </div>
      </div>

      <p className="mt-2 px-1 text-center text-[11px] text-muted-foreground/80">
        Tap a step to change its timing · drag the handle to reorder
      </p>
    </section>
  )
}

interface SortableTaskRowProps {
  entry: TimelineEntry
  arrival: Date
  now: Date
  hourCycle: '12' | '24'
  onEdit: (itemId: string) => void
}

function SortableTaskRow({ entry, arrival, now, hourCycle, onEdit }: SortableTaskRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: entry.item.id,
  })

  const item = entry.item
  const overridden = item.minutes !== item.defaultMinutes
  const dayTag =
    dayDiff(entry.start, arrival) !== 0 ? formatAbsoluteDay(entry.start, now) : null

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : undefined,
        position: 'relative',
      }}
      className={cn(
        'flex items-center gap-2 bg-card px-3 py-3',
        isDragging && 'rounded-2xl shadow-xl ring-1 ring-border',
      )}
    >
      <span className="w-[62px] shrink-0 text-[13px] font-semibold tabular text-foreground/90">
        {formatTime(entry.start, hourCycle)}
      </span>

      <button
        type="button"
        onClick={() => onEdit(item.id)}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-lg">
          {item.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-medium">{item.name}</span>
            {overridden ? (
              <span
                className="size-1.5 shrink-0 rounded-full bg-primary"
                title="Custom duration"
              />
            ) : null}
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {formatDuration(item.minutes)}
            {overridden ? ' · custom' : ''}
            {dayTag ? ` · ${dayTag}` : ''}
          </span>
        </span>
      </button>

      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${item.name}`}
        className="grid size-8 shrink-0 touch-none place-items-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
    </div>
  )
}

export function EmptyPlan({ onAdd }: { onAdd: () => void }) {
  return (
    <section className="rounded-[26px] border border-dashed border-border bg-card/60 px-6 py-9 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <ListChecks className="size-6" />
      </div>
      <h2 className="mt-4 text-[15px] font-semibold">Nothing to do yet</h2>
      <p className="mx-auto mt-1 max-w-[16rem] text-[13px] leading-relaxed text-muted-foreground">
        Add the things you do before leaving — travel, shoes, a snack — and we'll work out
        when to start.
      </p>
      <Button className="mt-5" onClick={onAdd}>
        <Plus className="size-4" />
        Add your first task
      </Button>
    </section>
  )
}
