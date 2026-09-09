import { Waves, Wind, CheckCircle2, Clock, Play, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { type OrderRecord, type OrderStatus } from '../../types/carwash'

interface BayMonitorProps {
  orders: OrderRecord[]
  onUpdateStatus: (orderId: number, nextStatus: OrderStatus) => void
}

export function BayMonitor({ orders, onUpdateStatus }: BayMonitorProps) {
  const activeBays = [
    { bayNumber: 1, name: 'Bay 1 (Cuci Hidrolik A)', type: 'WASHING' },
    { bayNumber: 2, name: 'Bay 2 (Cuci Salju B)', type: 'WASHING' },
    { bayNumber: 3, name: 'Bay 3 (Drying & Interior A)', type: 'DRYING' },
    { bayNumber: 4, name: 'Bay 4 (Drying & Interior B)', type: 'DRYING' },
  ]

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    switch (current) {
      case 'RECEIVED':
        return 'QUEUED'
      case 'QUEUED':
        return 'WASHING'
      case 'WASHING':
        return 'DRYING'
      case 'DRYING':
        return 'READY'
      case 'READY':
        return 'COMPLETED'
      default:
        return null
    }
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'WASHING':
        return (
          <Badge variant="info">
            <Waves className="size-3" /> Sedang Dicuci
          </Badge>
        )
      case 'DRYING':
        return (
          <Badge variant="warning">
            <Wind className="size-3" /> Pengeringan
          </Badge>
        )
      case 'READY':
        return (
          <Badge variant="success">
            <CheckCircle2 className="size-3" /> Siap Ambil
          </Badge>
        )
      case 'QUEUED':
        return (
          <Badge variant="secondary">
            <Clock className="size-3" /> Dalam Antrean
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card className="border-border/80">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Waves className="size-5 text-sky-500" />
            Live Bay & Progress Cuci Kendaraan
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Monitoring slot hidrolik, bilik cuci salju, dan area pengeringan real-time
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Update
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {activeBays.map((bay) => {
            const currentOrder = orders.find((o) => o.bayNumber === bay.bayNumber && o.status !== 'COMPLETED')
            const nextStatus = currentOrder ? getNextStatus(currentOrder.status) : null

            return (
              <div
                key={bay.bayNumber}
                className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all ${
                  currentOrder
                    ? 'border-border bg-card/60 shadow-xs'
                    : 'border-dashed border-border/70 bg-muted/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {bay.name}
                    </span>
                    {currentOrder ? (
                      getStatusBadge(currentOrder.status)
                    ) : (
                      <Badge variant="outline" className="border-dashed text-muted-foreground">
                        Kosong
                      </Badge>
                    )}
                  </div>

                  {currentOrder ? (
                    <div className="mt-3">
                      {/* License plate tag */}
                      <div className="inline-block rounded-md bg-neutral-900 px-2.5 py-1 text-xs font-bold tracking-widest text-white shadow-xs dark:border dark:border-neutral-700">
                        {currentOrder.vehiclePlate}
                      </div>

                      <p className="mt-1.5 text-sm font-semibold truncate">
                        {currentOrder.vehicleModel}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currentOrder.customerName} {currentOrder.isMember && '★ Member'}
                      </p>

                      <div className="mt-2.5 rounded-lg bg-muted/50 p-2 text-xs">
                        <span className="font-medium text-foreground">
                          {currentOrder.services[0]}
                        </span>
                        {currentOrder.services.length > 1 && (
                          <span className="text-muted-foreground">
                            {' '}
                            +{currentOrder.services.length - 1} lainnya
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="my-6 flex flex-col items-center justify-center text-center">
                      <p className="text-xs text-muted-foreground">Bay Tersedia</p>
                      <span className="mt-1 text-[11px] text-muted-foreground/70">
                        Siap untuk mobil antrean berikutnya
                      </span>
                    </div>
                  )}
                </div>

                {currentOrder && nextStatus && (
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <Button
                      size="sm"
                      className="w-full text-xs font-medium justify-between"
                      onClick={() => onUpdateStatus(currentOrder.id, nextStatus)}
                    >
                      <span>Lanjut: {nextStatus}</span>
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
