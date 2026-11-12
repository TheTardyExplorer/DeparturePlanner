import { Download, FileUp, HardDrive, RotateCcw, ShieldCheck, Smartphone } from 'lucide-react'
import { type ChangeEvent, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useStore } from '../lib/store'
import type { HourCycle, ThemeSetting } from '../lib/types'
import { Button } from './ui/button'
import { Segmented } from './ui/segmented'
import { Sheet, SheetBody, SheetContent, SheetHeader } from './ui/sheet'

interface SettingsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const settings = useStore((state) => state.settings)
  const setSettings = useStore((state) => state.setSettings)
  const getBackup = useStore((state) => state.getBackup)
  const importBackup = useStore((state) => state.importBackup)
  const resetAll = useStore((state) => state.resetAll)

  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(getBackup(), null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `departure-planner-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast('Backup downloaded')
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const parsed: unknown = JSON.parse(await file.text())
      if (importBackup(parsed)) {
        toast('Backup restored')
      } else {
        toast.error('That file is not a valid Departure Planner backup')
      }
    } catch {
      toast.error('Could not read that file')
    }
    event.target.value = ''
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader title="Settings" description="Make the planner feel like yours." />

        <SheetBody className="space-y-6">
          <div className="space-y-2">
            <span className="text-sm font-medium">Appearance</span>
            <Segmented<ThemeSetting>
              className="w-full"
              ariaLabel="Theme"
              value={settings.theme}
              onChange={(theme) => setSettings({ theme })}
              options={[
                { value: 'system', label: 'System' },
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
            />
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Time format</span>
            <Segmented<HourCycle>
              className="w-full"
              ariaLabel="Time format"
              value={settings.hourCycle}
              onChange={(hourCycle) => setSettings({ hourCycle })}
              options={[
                { value: '12', label: '12-hour' },
                { value: '24', label: '24-hour' },
              ]}
            />
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Your data</span>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="size-4" />
                Export
              </Button>
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <FileUp className="size-4" />
                Import
              </Button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImport}
            />
            <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">
              Export a backup before clearing Safari data. Everything lives in this browser —
              there is no account or server.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Reset</span>
            {confirmReset ? (
              <div className="rounded-2xl border border-danger/30 bg-danger/5 p-3.5">
                <p className="text-sm font-medium">Erase everything?</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  Your plans, saved presets, and custom task library will be deleted.
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
                      resetAll()
                      setConfirmReset(false)
                      toast('Everything reset')
                      onOpenChange(false)
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground hover:text-danger"
                onClick={() => setConfirmReset(true)}
              >
                <RotateCcw className="size-3.5" />
                Reset all data
              </Button>
            )}
          </div>

          <div className="space-y-3 rounded-2xl bg-muted/60 p-4">
            <div className="flex items-start gap-3">
              <Smartphone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                On iPhone, open this page in Safari and choose{' '}
                <span className="font-medium text-foreground">Share → Add to Home Screen</span>{' '}
                for a full-screen app that works offline.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                No tracking, no accounts. Your data never leaves this device.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <HardDrive className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Departure Planner v1.0 · works offline once installed.
              </p>
            </div>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}
