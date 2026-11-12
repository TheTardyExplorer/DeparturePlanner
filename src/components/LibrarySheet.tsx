import { ArrowLeft, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useStore } from '../lib/store'
import type { TaskDef } from '../lib/types'
import { Button } from './ui/button'
import { Sheet, SheetBody, SheetContent, SheetHeader } from './ui/sheet'
import { TaskForm, type TaskDraft } from './TaskForm'

interface LibrarySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Mode = 'browse' | 'create' | 'edit'

export function LibrarySheet({ open, onOpenChange }: LibrarySheetProps) {
  const library = useStore((state) => state.library)
  const createLibraryTask = useStore((state) => state.createLibraryTask)
  const updateLibraryTask = useStore((state) => state.updateLibraryTask)
  const removeLibraryTask = useStore((state) => state.removeLibraryTask)
  const insertLibraryTask = useStore((state) => state.insertLibraryTask)
  const restoreDefaultLibrary = useStore((state) => state.restoreDefaultLibrary)

  const [mode, setMode] = useState<Mode>('browse')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    if (open) {
      setMode('browse')
      setEditingId(null)
      setConfirmReset(false)
    }
  }, [open])

  const editingTask = library.find((task) => task.id === editingId)

  const startEdit = (task: TaskDef) => {
    setEditingId(task.id)
    setMode('edit')
  }

  const handleCreate = (draft: TaskDraft) => {
    createLibraryTask(draft.emoji, draft.name, draft.minutes)
    toast(`${draft.name} added to your library`)
    setMode('browse')
  }

  const handleSave = (draft: TaskDraft) => {
    if (!editingId) return
    updateLibraryTask(editingId, {
      emoji: draft.emoji,
      name: draft.name,
      defaultMinutes: draft.minutes,
    })
    toast('Task updated')
    setEditingId(null)
    setMode('browse')
  }

  const handleDelete = () => {
    if (!editingId) return
    const removed = removeLibraryTask(editingId)
    if (removed) {
      toast(`Deleted ${removed.task.name}`, {
        action: {
          label: 'Undo',
          onClick: () => insertLibraryTask(removed.task, removed.index),
        },
      })
    }
    setEditingId(null)
    setMode('browse')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        {mode === 'browse' ? (
          <>
            <SheetHeader
              title="Task library"
              description="Defaults for the tasks you add. Existing plans keep their own timings."
              action={
                <Button variant="ghost" size="sm" onClick={() => setMode('create')}>
                  <Plus className="size-4" />
                  New
                </Button>
              }
            />

            <SheetBody className="space-y-3">
              <div className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border bg-card">
                {library.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => startEdit(task)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors active:bg-muted"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-lg">
                      {task.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{task.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {task.defaultMinutes} min default
                      </span>
                    </span>
                    <Pencil className="size-4 shrink-0 text-muted-foreground/60" />
                  </button>
                ))}
              </div>

              {confirmReset ? (
                <div className="rounded-2xl border border-danger/30 bg-danger/5 p-3.5">
                  <p className="text-sm font-medium">Replace your task library?</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    Custom tasks will be removed. Plans you've already built are not affected.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setConfirmReset(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      className="flex-1"
                      onClick={() => {
                        restoreDefaultLibrary()
                        setConfirmReset(false)
                        toast('Default tasks restored')
                      }}
                    >
                      Restore
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={() => setConfirmReset(true)}
                >
                  <RotateCcw className="size-3.5" />
                  Restore default tasks
                </Button>
              )}
            </SheetBody>
          </>
        ) : (
          <>
            <SheetHeader
              title={mode === 'create' ? 'New library task' : 'Edit task'}
              description={
                mode === 'create'
                  ? 'This task will be available to add to any plan.'
                  : 'Changes here update the default, not plans you have already built.'
              }
            />

            <SheetBody>
              <button
                type="button"
                onClick={() => {
                  setMode('browse')
                  setEditingId(null)
                }}
                className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
              >
                <ArrowLeft className="size-4" />
                Back to library
              </button>

              {mode === 'create' ? (
                <TaskForm
                  initial={{ emoji: '✨', name: '', minutes: 5 }}
                  submitLabel="Add to library"
                  onSubmit={handleCreate}
                />
              ) : editingTask ? (
                <TaskForm
                  key={editingTask.id}
                  initial={{
                    emoji: editingTask.emoji,
                    name: editingTask.name,
                    minutes: editingTask.defaultMinutes,
                  }}
                  submitLabel="Save changes"
                  onSubmit={handleSave}
                  footer={
                    <Button
                      variant="danger-ghost"
                      className="w-full"
                      onClick={handleDelete}
                    >
                      <Trash2 className="size-4" />
                      Delete from library
                    </Button>
                  }
                />
              ) : null}
            </SheetBody>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
