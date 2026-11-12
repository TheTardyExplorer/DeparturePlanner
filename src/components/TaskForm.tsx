import { type FormEvent, type ReactNode, useState } from 'react'
import { cn } from '../lib/cn'
import { EMOJI_CHOICES } from '../lib/defaults'
import { clampMinutes } from '../lib/time'
import { Button } from './ui/button'
import { DurationField } from './DurationField'
import { Input } from './ui/input'

export interface TaskDraft {
  emoji: string
  name: string
  minutes: number
}

interface TaskFormProps {
  initial: TaskDraft
  submitLabel: string
  onSubmit: (draft: TaskDraft) => void
  children?: ReactNode
  footer?: ReactNode
}

export function TaskForm({ initial, submitLabel, onSubmit, children, footer }: TaskFormProps) {
  const [emoji, setEmoji] = useState(initial.emoji)
  const [name, setName] = useState(initial.name)
  const [minutes, setMinutes] = useState(clampMinutes(initial.minutes))
  const [showEmojiGrid, setShowEmojiGrid] = useState(true)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onSubmit({ emoji, name: trimmed, minutes })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium" htmlFor="task-name">
            Name
          </label>
          <button
            type="button"
            onClick={() => setShowEmojiGrid((value) => !value)}
            className="text-xs font-medium text-primary"
          >
            {showEmojiGrid ? 'Hide icons' : 'Change icon'}
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowEmojiGrid((value) => !value)}
            aria-label="Choose an icon"
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-card text-2xl shadow-sm"
          >
            {emoji}
          </button>
          <Input
            id="task-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Make a snack"
            autoFocus
            maxLength={80}
            required
          />
        </div>
      </div>

      {showEmojiGrid ? (
        <div className="grid grid-cols-8 gap-1">
          {EMOJI_CHOICES.map((choice) => (
            <button
              key={choice}
              type="button"
              aria-label={`Use ${choice}`}
              aria-pressed={choice === emoji}
              onClick={() => setEmoji(choice)}
              className={cn(
                'grid aspect-square place-items-center rounded-lg text-xl transition-colors',
                choice === emoji
                  ? 'bg-primary/15 ring-1 ring-primary/40'
                  : 'hover:bg-muted',
              )}
            >
              {choice}
            </button>
          ))}
        </div>
      ) : null}

      <div className="space-y-2">
        <span className="text-sm font-medium">How long does it take?</span>
        <DurationField minutes={minutes} onChange={setMinutes} />
      </div>

      {children}

      <div className="space-y-2">
        <Button type="submit" size="lg" className="w-full" disabled={!name.trim()}>
          {submitLabel}
        </Button>
        {footer}
      </div>
    </form>
  )
}
