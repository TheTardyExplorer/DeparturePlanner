import { Bookmark, Clock3, Settings2 } from 'lucide-react'
import { useState } from 'react'
import { Toaster, toast } from 'sonner'
import { AddTaskSheet } from './components/AddTaskSheet'
import { ArrivalCard } from './components/ArrivalCard'
import { BottomBar } from './components/BottomBar'
import { DurationSheet } from './components/DurationSheet'
import { LibrarySheet } from './components/LibrarySheet'
import { PresetsSheet } from './components/PresetsSheet'
import { SettingsSheet } from './components/SettingsSheet'
import { StartCard } from './components/StartCard'
import { EmptyPlan, Timeline } from './components/Timeline'
import { Button } from './components/ui/button'
import { useApplyTheme, useNow } from './lib/hooks'
import { useStore } from './lib/store'

export default function App() {
  useApplyTheme()
  const now = useNow()

  const items = useStore((state) => state.currentPlan.items)
  const presetCount = useStore((state) => state.presets.length)
  const theme = useStore((state) => state.settings.theme)

  const [addOpen, setAddOpen] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [presetsOpen, setPresetsOpen] = useState(false)
  const [presetsMode, setPresetsMode] = useState<'browse' | 'save'>('browse')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  const openPresets = () => {
    setPresetsMode('browse')
    setPresetsOpen(true)
  }

  const openSavePlan = () => {
    if (items.length === 0) {
      toast('Add a step before saving a plan')
      setAddOpen(true)
      return
    }
    setPresetsMode('save')
    setPresetsOpen(true)
  }

  const openLibraryFromAdd = () => {
    setAddOpen(false)
    setLibraryOpen(true)
  }

  return (
    <div className="relative min-h-dvh">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(99,102,241,0.16),transparent_72%)]"
      />

      <div className="mx-auto w-full max-w-xl px-4 pb-44">
        <header className="safe-top flex items-center justify-between gap-3 pb-5 pt-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/25">
              <Clock3 className="size-5" />
            </span>
            <div>
              <h1 className="text-[17px] font-semibold leading-tight tracking-tight">
                Departure
              </h1>
              <p className="text-[11px] text-muted-foreground">Plan backwards, leave on time</p>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
              aria-label="Saved plans"
              onClick={openPresets}
            >
              <Bookmark className="size-5" />
              {presetCount > 0 ? (
                <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-primary" />
              ) : null}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Settings"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings2 className="size-5" />
            </Button>
          </div>
        </header>

        <main className="space-y-4">
          <ArrivalCard now={now} />
          <StartCard now={now} />
          {items.length > 0 ? (
            <Timeline now={now} onEdit={setEditingItemId} />
          ) : (
            <EmptyPlan onAdd={() => setAddOpen(true)} />
          )}
        </main>
      </div>

      <BottomBar onAdd={() => setAddOpen(true)} onSavePlan={openSavePlan} />

      <AddTaskSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        onManageLibrary={openLibraryFromAdd}
      />
      <LibrarySheet open={libraryOpen} onOpenChange={setLibraryOpen} />
      <PresetsSheet
        open={presetsOpen}
        onOpenChange={setPresetsOpen}
        initialMode={presetsMode}
      />
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
      <DurationSheet itemId={editingItemId} onClose={() => setEditingItemId(null)} />

      <Toaster
        theme={theme}
        position="top-center"
        duration={2200}
        toastOptions={{
          classNames: {
            toast: 'rounded-2xl border border-border bg-card text-card-foreground shadow-xl',
            actionButton: 'rounded-lg bg-primary text-primary-foreground',
            cancelButton: 'rounded-lg bg-muted text-foreground',
          },
        }}
      />
    </div>
  )
}
