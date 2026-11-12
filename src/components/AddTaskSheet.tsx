import { ArrowLeft, Plus, Search, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useStore } from '../lib/store'
import type { TaskDef } from '../lib/types'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader } from './ui/sheet'
import { TaskForm, type TaskDraft } from './TaskForm'

interface AddTaskSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onManageLibrary: () => void
}

type Mode = 'browse' | 'create'

export function AddTaskSheet({ open, onOpenChange, onManageLibrary }: AddTaskSheetProps) {
  const library = useStore((state) => state.library)
  const addPlanItem = useStore((state) => state.addPlanItem)
  const addCustomPlanTask = useStore((state) => state.addCustomPlanTask)

  const [mode, setMode] = useState<Mode>('browse')
  const [query, setQuery] = useState('')
  const [saveToLibrary, setSaveToLibrary] = useState(true)

  useEffect(() => {
    if (open) {
      setMode('browse')
      setQuery('')
      setSaveToLibrary(true)
    }
  }, [open])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return library
    return library.filter((task) => task.name.toLowerCase().includes(needle))
  }, [library, query])

  const handleAdd = (task: TaskDef) => {
    addPlanItem(task)
    toast(`${task.name} added to your plan`)
  }

  const handleCreate = (draft: TaskDraft) => {
    addCustomPlanTask(draft.emoji, draft.name, draft.minutes, saveToLibrary)
    toast(`${draft.name} added to your plan`)
    setMode('browse')
    setQuery('')
  }

  const createInitialName = query.trim() && filtered.length === 0 ? query.trim() : ''

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        {mode === 'browse' ? (
          <>
            <SheetHeader
              title="Add a task"
              description="Tap to add. New steps stack backwards from arrival."
              action={
                <Button variant="ghost" size="sm" onClick={onManageLibrary}>
                  Manage
                </Button>
              }
            />

            <SheetBody className="space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search your tasks"
                  className="pl-9"
                  aria-label="Search tasks"
                />
              </div>

              <button
                type="button"
                onClick={() => setMode('create')}
                className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/[0.04] px-3.5 py-3 text-left transition-colors hover:bg-primary/[0.07]"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">Create a custom task</span>
                  <span className="block text-xs text-muted-foreground">
                    Name it, pick an icon, set the time
                  </span>
                </span>
                <Plus className="size-4 shrink-0 text-primary" />
              </button>

              <div>
                <div className="mb-1.5 flex items-center justify-between px-1">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Your tasks
                  </span>
                  <span className="text-xs text-muted-foreground">{filtered.length}</span>
                </div>

                {filtered.length > 0 ? (
                  <div className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border bg-card">
                    {filtered.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => handleAdd(task)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors active:bg-muted"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-lg">
                          {task.emoji}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{task.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            {task.defaultMinutes} min
                          </span>
                        </span>
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                          <Plus className="size-4" />
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border px-4 py-7 text-center text-sm text-muted-foreground">
                    No tasks match “{query.trim()}”.
                    <button
                      type="button"
                      onClick={() => setMode('create')}
                      className="mt-1 block w-full font-medium text-primary"
                    >
                      Create “{query.trim()}”
                    </button>
                  </div>
                )}
              </div>
            </SheetBody>

            <SheetFooter>
              <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </SheetFooter>
          </>
        ) : (
          <>
            <SheetHeader
              title="New task"
              description="Add something you do before leaving."
            />
            <SheetBody>
              <button
                type="button"
                onClick={() => setMode('browse')}
                className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
              >
                <ArrowLeft className="size-4" />
                Back to tasks
              </button>

              <TaskForm
                initial={{ emoji: '✨', name: createInitialName, minutes: 5 }}
                submitLabel="Add to plan"
                onSubmit={handleCreate}
              >
                <label className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={saveToLibrary}
                    onChange={(event) => setSaveToLibrary(event.target.checked)}
                    className="size-4 accent-primary"
                  />
                  <span>
                    <span className="block font-medium">Save to my task library</span>
                    <span className="block text-xs text-muted-foreground">
                      Reuse it in future plans
                    </span>
                  </span>
                </label>
              </TaskForm>
            </SheetBody>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
