import { Plus, Bell, RefreshCw, Moon, Sun } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

interface HeaderProps {
  onOpenNewOrder: () => void
  onRefresh: () => void
  isRefreshing?: boolean
}

export function Header({ onOpenNewOrder, onRefresh, isRefreshing }: HeaderProps) {
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight text-foreground">
            Ringkasan Operasional Car Wash
          </h2>
          <p className="text-xs text-muted-foreground">{todayFormatted}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="text-xs gap-1.5"
          disabled={isRefreshing}
        >
          <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>

        <Button
          size="sm"
          onClick={onOpenNewOrder}
          className="bg-primary text-primary-foreground font-semibold shadow-sm text-xs gap-1.5"
        >
          <Plus className="size-4" />
          <span>Transaksi POS Baru</span>
        </Button>
      </div>
    </header>
  )
}
