import { useAuth } from '@/hooks/useAuth'
import {
  LayoutDashboard,
  CreditCard,
  Users,

  ClipboardList,
  BrushCleaning,
  LogOut,
  Car,
} from 'lucide-react'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  onOpenNewOrder: () => void
  
}

export function Sidebar({ activeTab, setActiveTab, onOpenNewOrder }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Operasional', icon: LayoutDashboard },
    { id: 'pos', label: 'Kasir & POS', icon: CreditCard },
    { id: 'bay', label: 'Riwayat Transaksi', icon: ClipboardList },
    { id: 'services', label: 'Paket & Layanan', icon: BrushCleaning },
    { id: 'customers', label: 'Pelanggan & Member', icon: Users },
  ]
  const {logout} =useAuth()
  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-card p-4 lg:flex justify-between shrink-0">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-3 border-b border-border/60">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <Car className="size-6" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-foreground">
              CleanWash Pro
            </h1>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sistem Aktif
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Menu Utama
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'pos') {
                    onOpenNewOrder()
                  } else {
                    setActiveTab(item.id)
                  }
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* User / Shift Profile */}
      <div className="border-t border-border/60 pt-4">
        <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
              AD
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Admin Kasir</p>
              <p className="text-[10px] text-muted-foreground">Shift Pagi • Bay 1-4</p>
            </div>
          </div>
          <button
            title="Keluar"
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          onClick={ logout}
         >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
