import { useState } from 'react'
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Waves,
  Wind,
  Printer,
  CreditCard,
  UserCheck,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { type OrderRecord, type OrderStatus } from '../../types/carwash'
import { PaymentModal } from './PaymentModal'
import { ReceiptModal } from './ReceiptModal'

interface RecentOrdersTableProps {
  orders: OrderRecord[]
  onConfirmPayment: (
    orderId: number,
    paymentMethod: 'CASH' | 'QRIS' | 'DEBIT',
    cashReceived?: number,
    change?: number
  ) => void
  onUpdateStatus: (orderId: number, nextStatus: OrderStatus) => void
}

export function RecentOrdersTable({
  orders,
  onConfirmPayment,
  onUpdateStatus,
}: RecentOrdersTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'READY' | 'COMPLETED' | 'UNPAID'>('ALL')
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<OrderRecord | null>(null)
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<OrderRecord | null>(null)

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    if (statusFilter === 'ACTIVE') {
      return ['RECEIVED', 'QUEUED', 'WASHING', 'DRYING'].includes(order.status)
    }
    if (statusFilter === 'READY') {
      return order.status === 'READY'
    }
    if (statusFilter === 'COMPLETED') {
      return order.status === 'COMPLETED'
    }
    if (statusFilter === 'UNPAID') {
      return order.paymentStatus === 'UNPAID'
    }
    return true
  })

  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'RECEIVED':
        return <Badge variant="secondary"><Clock className="size-3" /> Baru Masuk</Badge>
      case 'QUEUED':
        return <Badge variant="secondary"><Clock className="size-3" /> Antrean</Badge>
      case 'WASHING':
        return <Badge variant="info"><Waves className="size-3" /> Cuci Salju</Badge>
      case 'DRYING':
        return <Badge variant="warning"><Wind className="size-3" /> Pengeringan</Badge>
      case 'READY':
        return <Badge variant="success"><CheckCircle2 className="size-3" /> Siap Diambil</Badge>
      case 'COMPLETED':
        return <Badge variant="outline">Selesai</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Batal</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="p-5 pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Transaksi & Antrean Hari Ini</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Daftar seluruh tiket pengerjaan cucian mobil dan pembayaran kasir
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari Plat, Nama, No. Tiket..."
                className="pl-8 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/50 pt-3 text-xs">
          <span className="text-muted-foreground mr-1 flex items-center gap-1">
            <Filter className="size-3" /> Filter:
          </span>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
              statusFilter === 'ALL'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            Semua ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
              statusFilter === 'ACTIVE'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            Sedang Proses ({orders.filter((o) => ['RECEIVED', 'QUEUED', 'WASHING', 'DRYING'].includes(o.status)).length})
          </button>
          <button
            onClick={() => setStatusFilter('READY')}
            className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
              statusFilter === 'READY'
                ? 'bg-emerald-600 text-white'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            Siap Ambil ({orders.filter((o) => o.status === 'READY').length})
          </button>
          <button
            onClick={() => setStatusFilter('UNPAID')}
            className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
              statusFilter === 'UNPAID'
                ? 'bg-amber-600 text-white'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            Belum Lunas ({orders.filter((o) => o.paymentStatus === 'UNPAID').length})
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
              statusFilter === 'COMPLETED'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            Selesai ({orders.filter((o) => o.status === 'COMPLETED').length})
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-hidden">
          <table className="w-full table-auto text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-y border-border/60">
              <tr>
                <th className="px-5 py-3 font-semibold">No. Tiket</th>
                <th className="px-4 py-3 font-semibold">Plat & Kendaraan</th>
                <th className="px-4 py-3 font-semibold">Pelanggan</th>
                <th className="px-4 py-3 font-semibold">Layanan</th>
                <th className="px-4 py-3 font-semibold">Status Pengerjaan</th>
                <th className="px-4 py-3 font-semibold">Pembayaran</th>
                <th className="px-4 py-3 font-semibold text-right">Total</th>
                <th className="px-5 py-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    Tidak ada pesanan yang sesuai filter
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-mono font-medium text-foreground">
                      {order.orderCode}
                      <span className="block text-[10px] text-muted-foreground">
                        Mulai {order.startedAt}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded bg-neutral-900 px-2 py-0.5 font-mono text-xs font-bold text-white tracking-wider dark:border dark:border-neutral-700">
                        {order.vehiclePlate}
                      </span>
                      <span className="mt-1 block font-medium text-foreground">
                        {order.vehicleModel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground">
                          {order.customerName}
                        </span>
                        {order.isMember && (
                          <Badge variant="purple" className="px-1.5 py-0 text-[10px]">
                            Member
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {order.customerPhone}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {order.services.join(', ')}
                      </p>
                      {order.discount > 0 && (
                        <span className="text-[10px] text-emerald-600 font-medium">
                          Diskon Member {order.discountPercent}% (-Rp {order.discount.toLocaleString('id-ID')})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {renderStatusBadge(order.status)}
                    </td>
                    <td className="px-4 py-3">
                      {order.paymentStatus === 'PAID' ? (
                        <div className="flex flex-col items-start gap-0.5">
                          <Badge variant="success" className="text-[11px]">
                            Lunas ({order.paymentMethod || 'TUNAI'})
                          </Badge>
                          {order.paymentMethod === 'CASH' && order.cashReceived && (
                            <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 font-mono">
                              Kembali: Rp {(order.change ?? 0).toLocaleString('id-ID')}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            PJ: {order.staffName}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="destructive" className="text-[11px]">
                          Belum Bayar
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-foreground">
                      Rp {order.total.toLocaleString('id-ID')}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {order.paymentStatus === 'UNPAID' && (
                          <Button
                            size="xs"
                            variant="outline"
                            className="text-[11px] border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-semibold"
                            onClick={() => setSelectedOrderForPayment(order)}
                          >
                            <CreditCard className="size-3" />
                            Bayar
                          </Button>
                        )}

                        {order.status === 'READY' && (
                          <Button
                            size="xs"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px]"
                            onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
                          >
                            Selesai & Keluar
                          </Button>
                        )}

                        <Button
                          size="icon-xs"
                          variant="ghost"
                          title="Cetak Struk"
                          onClick={() => setSelectedOrderForReceipt(order)}
                        >
                          <Printer className="size-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Modal Pembayaran Kasir */}
      <PaymentModal
        isOpen={!!selectedOrderForPayment}
        onClose={() => setSelectedOrderForPayment(null)}
        order={selectedOrderForPayment}
        onConfirmPayment={(orderId, method, cashReceived, change) => {
          onConfirmPayment(orderId, method, cashReceived, change)
          const target = orders.find((o) => o.id === orderId)
          if (target) {
            setSelectedOrderForReceipt({
              ...target,
              paymentStatus: 'PAID',
              paymentMethod: method,
              cashReceived,
              change,
            })
          }
        }}
      />

      {/* Modal Cetak Struk */}
      <ReceiptModal
        isOpen={!!selectedOrderForReceipt}
        onClose={() => setSelectedOrderForReceipt(null)}
        order={selectedOrderForReceipt}
      />
    </Card>
  )
}
