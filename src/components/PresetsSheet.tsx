import { ArrowLeft, Bookmark, BookmarkPlus, Pencil, Plus, Trash2 } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useStore } from '../lib/store'
import type { SavedPlan } from '../lib/types'
import { formatDuration, formatTime, getArrivalDate, totalMinutes } from '../lib/time'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Sheet, SheetBody, SheetContent, SheetHeader } from './ui/sheet'

interface PresetsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialMode?: 'browse' | 'save'
  onLoaded?: () => void
}

type Mode = 'browse' | 'save' | 'rename'

export function PresetsSheet({
  open,
  onOpenChange,
  initialMode = 'browse',
  onLoaded,
}: PresetsSheetProps) {
  const presets = useStore((state) => state.presets)
  const currentPlan = useStore((state) => state.currentPlan)
  const hourCycle = useStore((state) => state.settings.hourCycle)
  const savePreset = useStore((state) => state.savePreset)
  const loadPreset = useStore((state) => state.loadPreset)
  const deletePreset = useStore((state) => state.deletePreset)
  const restorePreset = useStore((state) => state.restorePreset)
  const renamePreset = useStore((state) => state.renamePreset)
  const setPlan = useStore((state) => state.setPlan)

  const [mode, setMode] = useState<Mode>(initialMode)
  const [name, setName] = useState('')
  const [includeArrival, setIncludeArrival] = useState(true)
  const [renamingId, setRenamingId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setMode(initialMode)
      setName('')
      setIncludeArrival(true)
      setRenamingId(null)
    }
  }, [open, initialMode])

  const renamingPreset = presets.find((preset) => preset.id === renamingId)
  const canSave = currentPlan.items.length > 0

  const handleSave = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !canSave) return
    const preset = savePreset(name, includeArrival)
    toast(`Saved “${preset.name}”`)
    setName('')
    setMode('browse')
  }

  const startRename = (preset: SavedPlan) => {
    setRenamingId(preset.id)
    setName(preset.name)
    setMode('rename')
  }

  const handleRename = (event: FormEvent) => {
    event.preventDefault()
    if (!renamingId || !name.trim()) return
    renamePreset(renamingId, name)
    toast('Plan renamed')
    setRenamingId(null)
    setMode('browse')
  }

  const handleLoad = (preset: SavedPlan) => {
    const previous = loadPreset(preset.id)
    if (previous) {
      toast(`Loaded “${preset.name}”`, {
        action: { label: 'Undo', onClick: () => setPlan(previous) },
      })
    }
    onOpenChange(false)
    onLoaded?.()
  }

  const handleDelete = (preset: SavedPlan) => {
    const removed = deletePreset(preset.id)
    if (removed) {
      toast(`Deleted “${preset.name}”`, {
        action: { label: 'Undo', onClick: () => restorePreset(removed) },
      })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        {mode === 'browse' ? (
          <>
            <SheetHeader
              title="Saved plans"
              description="Reuse a step list for future departures."
              action={
                <Button variant="ghost" size="sm" onClick={() => setMode('save')}>
                  <Plus className="size-4" />
                  New
                </Button>
              }
            />

            <SheetBody className="space-y-2.5">
              {presets.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border px-5 py-8 text-center">
                  <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Bookmark className="size-5" />
                  </div>
                  <p className="mt-3 text-sm font-medium">No saved plans yet</p>
                  <p className="mx-auto mt-1 max-w-[15rem] text-xs leading-relaxed text-muted-foreground">
                    Save your current steps to reuse them next time.
                  </p>
                  <Button
                    size="sm"
                    className="mt-4"
                    onClick={() => setMode('save')}
                    disabled={!canSave}
                  >
                    <BookmarkPlus className="size-4" />
                    Save current plan
                  </Button>
                  {!canSave ? (
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Add a step to your plan first.
                    </p>
                  ) : null}
                </div>
              ) : (
                presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center gap-1 rounded-2xl border border-border bg-card p-2 pl-3"
                  >
                    <button
                      type="button"
                      onClick={() => handleLoad(preset)}
                      className="flex min-w-0 flex-1 items-center gap-3 py-1 text-left"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Bookmark className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{preset.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {preset.items.length} {preset.items.length === 1 ? 'step' : 'steps'} ·{' '}
                          {formatDuration(totalMinutes(preset.items))}
                          {preset.arrivalTime
                            ? ` · arrive ${formatTime(
                                getArrivalDate({
                                  arrivalTime: preset.arrivalTime,
                                  dayOffset: 0,
                                }),
                                hourCycle,
                              )}`
                            : ''}
                        </span>
                      </span>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-full text-muted-foreground"
                      aria-label={`Rename ${preset.name}`}
                      onClick={() => startRename(preset)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-full text-muted-foreground hover:text-danger"
                      aria-label={`Delete ${preset.name}`}
                      onClick={() => handleDelete(preset)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))
              )}
            </SheetBody>
          </>
        ) : mode === 'save' ? (
          <>
            <SheetHeader
              title="Save this plan"
              description="Give this step list a name so you can reuse it."
            />
            <SheetBody>
              <button
                type="button"
                onClick={() => setMode('browse')}
                className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
              >
                <ArrowLeft className="size-4" />
                Back to saved plans
              </button>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="rounded-xl bg-muted/60 px-3.5 py-2.5 text-sm text-muted-foreground">
                  {currentPlan.items.length} {currentPlan.items.length === 1 ? 'step' : 'steps'} ·{' '}
                  {formatDuration(totalMinutes(currentPlan.items))}
                </div>

                <div className="space-y-2">
                  <label htmlFor="preset-name" className="text-sm font-medium">
                    Plan name
                  </label>
                  <Input
                    id="preset-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Work day"
                    maxLength={60}
                    autoFocus
                    required
                  />
                </div>

                <label className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={includeArrival}
                    onChange={(event) => setIncludeArrival(event.target.checked)}
                    className="size-4 accent-primary"
                  />
                  <span>
                    <span className="block font-medium">Remember arrival time</span>
                    <span className="block text-xs text-muted-foreground">
                      Restore {formatTime(getArrivalDate(currentPlan), hourCycle)} when loading
                    </span>
                  </span>
                </label>

                <Button type="submit" size="lg" className="w-full" disabled={!name.trim() || !canSave}>
                  Save plan
                </Button>
              </form>
            </SheetBody>
          </>
        ) : (
          <>
            <SheetHeader title="Rename plan" />
            <SheetBody>
              <button
                type="button"
                onClick={() => {
                  setMode('browse')
                  setRenamingId(null)
                }}
                className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
              >
                <ArrowLeft className="size-4" />
                Back to saved plans
              </button>

              <form onSubmit={handleRename} className="space-y-4">
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={renamingPreset?.name ?? 'Plan name'}
                  maxLength={60}
                  autoFocus
                  required
                />
                <Button type="submit" size="lg" className="w-full" disabled={!name.trim()}>
                  Save name
                </Button>
              </form>
            </SheetBody>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
