import { DollarSign, Car, Timer, Award, ArrowUpRight, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { type OrderRecord } from '../../types/carwash'

interface StatCardsProps {
  orders: OrderRecord[]
}

export function StatCards({ orders }: StatCardsProps) {
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((acc, curr) => acc + curr.total, 0)

  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length
  const inProgressCount = orders.filter((o) =>
    ['QUEUED', 'WASHING', 'DRYING'].includes(o.status)
  ).length
  const memberTransactions = orders.filter((o) => o.isMember).length

  const stats = [
    {
      title: 'Omzet Hari Ini',
      value: `Rp ${totalRevenue.toLocaleString('id-ID')}`,
      change: '+18.2% vs kemarin',
      trend: 'up',
      icon: DollarSign,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Mobil Selesai Dicuci',
      value: `${completedCount} Kendaraan`,
      change: 'Rata-rata 24 menit/mobil',
      trend: 'neutral',
      icon: Car,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Sedang Proses & Antrean',
      value: `${inProgressCount} Kendaraan`,
      change: '4 Bay terisi penuh',
      trend: 'warning',
      icon: Timer,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Member Transaksi',
      value: `${memberTransactions} Pelanggan`,
      change: '10-15% diskon terpakai',
      trend: 'up',
      icon: Award,
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <Card key={idx} className="relative overflow-hidden hover:border-primary/40">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.title}
                </p>
                <div className={`rounded-xl p-2.5 ${stat.iconBg}`}>
                  <Icon className="size-5" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <TrendingUp className="size-3.5 text-emerald-500" />
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {stat.change}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
