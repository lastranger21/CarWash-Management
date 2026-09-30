import { useAuth } from '@/hooks/useAuth'
import CheckoutPage from './CheckOutPage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Car, LogOut, Phone, User, ShieldCheck } from 'lucide-react'

export function CustomerPortal() {
  const { user, logout } = useAuth()
  const customer = user?.customer
  const vehicles = customer?.vehicles || []

  return (
    <div className="min-h-screen bg-muted/20 font-sans text-foreground pb-12">
      {/* Mobile-First Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Car className="size-5" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">CleanWash Pro</h1>
              <p className="text-[11px] text-muted-foreground">Portal Pelanggan</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Keluar</span>
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-2xl p-4 sm:p-6 space-y-5">
        {/* Welcome Card */}
        <Card className="border-border/70 shadow-sm bg-card overflow-hidden">
          <CardHeader className="bg-primary/5 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <User className="size-5 text-primary" />
                  Halo, {user?.name || 'Pelanggan'}!
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
              </div>
              <Badge variant={customer?.membership?.isActive ? 'outline' : 'default'} className={`w-22 justify-center text-[11px] font-semibold transition-all shadow-2xs ${
                              !user?.customer?.membership
                                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                                : user?.customer?.membership.isActive
                                ? 'border-purple-500/40 text-purple-600 hover:bg-purple-50 dark:hover:bg-amber-950/30'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}>
                {user?.customer?.membership?.isActive ? 'Member' : 'Reguler'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-3.5 space-y-2 text-xs sm:text-sm">
            {customer?.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-3.5" />
                <span>WhatsApp/HP: <strong className="text-foreground">{customer.phone}</strong></span>
              </div>
            )}
            {vehicles.length > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Car className="size-3.5" />
                <span>
                  Kendaraan Terdaftar:{' '}
                  <strong className="text-foreground">
                    {vehicles.map(v => `${v.plateNumber} (${v.modelName || 'Mobil'})`).join(', ')}
                  </strong>
                </span>
              </div>
            )}
            {customer?.membership && (
              <div className="flex items-center gap-2 text-emerald-600 font-medium">
                <ShieldCheck className="size-3.5" />
                <span>Member Aktif • Diskon {Number(customer.membership.discountPercent)}%</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Layanan & Checkout Realtime Payment */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-1">
            Pemesanan & Pembayaran
          </h2>
          <CheckoutPage />
        </div>
      </main>
    </div>
  )
}
