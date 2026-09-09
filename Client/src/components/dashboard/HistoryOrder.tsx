import { useState } from 'react'
import {
  History,
  Search,
  DollarSign,
  Printer,
  CheckCircle2,
  Clock,
  FileText,
  Eye,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { type OrderRecord, type OrderStatus } from '../../types/carwash'
import { ReceiptModal } from './ReceiptModal'

interface OrderHistoryPageProps {
  orders: OrderRecord[]
}

export function OrderHistoryPage({ orders }: OrderHistoryPageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS'>('ALL')
  const [payFilter, setPayFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL')
  const [methodFilter, setMethodFilter] = useState<string>('ALL')

  // State Modal Cetak Struk
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<OrderRecord | null>(null)

  // State Modal Detail Order
  const [detailOrder, setDetailOrder] = useState<OrderRecord | null>(null)

  // 1. Kalkulasi Statistik Rekapitulasi
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.total, 0)

  const completedOrdersCount = orders.filter((o) => o.status === 'COMPLETED').length
  const unpaidOrdersCount = orders.filter((o) => o.paymentStatus === 'UNPAID').length

  // 2. Filter Logika
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      order.orderCode.toLowerCase().includes(term) ||
      order.vehiclePlate.toLowerCase().includes(term) ||
      order.customerName.toLowerCase().includes(term) ||
      order.customerPhone.includes(term) ||
      order.vehicleModel.toLowerCase().includes(term)

    if (!matchesSearch) return false

    // Filter Status Order
    if (statusFilter === 'COMPLETED' && order.status !== 'COMPLETED') return false
    if (statusFilter === 'CANCELLED' && order.status !== 'CANCELLED') return false
    if (
      statusFilter === 'IN_PROGRESS' &&
      ['COMPLETED', 'CANCELLED'].includes(order.status)
    )
      return false

    // Filter Pembayaran
    if (payFilter === 'PAID' && order.paymentStatus !== 'PAID') return false
    if (payFilter === 'UNPAID' && order.paymentStatus !== 'UNPAID') return false

    // Filter Metode Bayar
    if (methodFilter !== 'ALL' && order.paymentMethod !== methodFilter) return false

    return true
  })

  // Helper Badge Status
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="outline" className="text-emerald-600 border-emerald-500/30">Selesai</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Dibatalkan</Badge>
      case 'WASHING':
        return <Badge variant="info">Sedang Cuci</Badge>
      case 'DRYING':
        return <Badge variant="warning">Pengeringan</Badge>
      case 'READY':
        return <Badge variant="success">Siap Ambil</Badge>
      default:
        return <Badge variant="secondary">Antrean</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. KARTU REKAPITULASI OMZET & TRANSAKSI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Total Pendapatan Terbayar
              </p>
              <h3 className="text-2xl font-bold mt-1 tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">
                Rp {totalRevenue.toLocaleString('id-ID')}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Dari seluruh transaksi lunas</p>
            </div>
            <div className="rounded-xl p-3 bg-emerald-500/10 text-emerald-600">
              <DollarSign className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Cucian Selesai
              </p>
              <h3 className="text-2xl font-bold mt-1 tracking-tight">
                {completedOrdersCount} Kendaraan
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Pengerjaan sukses tuntas</p>
            </div>
            <div className="rounded-xl p-3 bg-blue-500/10 text-blue-600">
              <CheckCircle2 className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Menunggu Pembayaran
              </p>
              <h3 className="text-2xl font-bold mt-1 tracking-tight text-amber-600 dark:text-amber-400">
                {unpaidOrdersCount} Tiket
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Status belum lunas</p>
            </div>
            <div className="rounded-xl p-3 bg-amber-500/10 text-amber-600">
              <Clock className="size-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. FILTER & TABEL RIWAYAT ORDER */}
      <Card>
        <CardHeader className="p-5 pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="size-5 text-primary" />
                Arsip & Riwayat Transaksi Cucian
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cari data riwayat order terdahulu, cetak ulang struk, dan audit pembayaran
              </p>
            </div>

            {/* Input Pencarian */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari No Tiket, Plat, Nama, HP..."
                className="pl-8 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-border/50 pt-3 text-xs">
            {/* Filter Status Pengerjaan */}
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground mr-1">Status:</span>
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setStatusFilter('COMPLETED')}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  statusFilter === 'COMPLETED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                Selesai
              </button>
              <button
                onClick={() => setStatusFilter('IN_PROGRESS')}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  statusFilter === 'IN_PROGRESS'
                    ? 'bg-blue-600 text-white'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                Sedang Berjalan
              </button>
            </div>

            <div className="h-4 w-[1px] bg-border mx-1 hidden sm:block" />

            {/* Filter Pembayaran */}
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground mr-1">Bayar:</span>
              <button
                onClick={() => setPayFilter('ALL')}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  payFilter === 'ALL'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setPayFilter('PAID')}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  payFilter === 'PAID'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                Lunas
              </button>
              <button
                onClick={() => setPayFilter('UNPAID')}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  payFilter === 'UNPAID'
                    ? 'bg-rose-600 text-white'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                Belum Bayar
              </button>
            </div>

            <div className="h-4 w-[1px] bg-border mx-1 hidden sm:block" />

            {/* Filter Metode */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="h-7 rounded-md border border-input bg-background px-2 text-xs text-muted-foreground font-medium"
            >
              <option value="ALL">Semua Metode</option>
              <option value="CASH">Tunai (Cash)</option>
              <option value="QRIS">QRIS</option>
              <option value="DEBIT">EDC / Debit</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full overflow-hidden">
            <table className="w-full table-auto text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-y border-border/60">
                <tr>
                  <th className="px-5 py-3 font-semibold">No. Tiket & Waktu</th>
                  <th className="px-4 py-3 font-semibold">Plat & Mobil</th>
                  <th className="px-4 py-3 font-semibold">Pelanggan</th>
                  <th className="px-4 py-3 font-semibold">Layanan Dikerjakan</th>
                  <th className="px-4 py-3 font-semibold">Status Pengerjaan</th>
                  <th className="px-4 py-3 font-semibold">Status Bayar & Metode</th>
                  <th className="px-4 py-3 font-semibold text-right">Total Biaya</th>
                  <th className="px-5 py-3 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-muted-foreground">
                      <FileText className="size-8 mx-auto text-muted-foreground/40 mb-2" />
                      Tidak ada data riwayat order yang cocok dengan filter
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      {/* No Tiket & Jam */}
                      <td className="px-5 py-3 font-mono">
                        <span className="font-bold text-foreground text-sm block">
                          {order.orderCode}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="size-3" /> Jam {order.startedAt}
                        </span>
                      </td>

                      {/* Plat Kendaraan */}
                      <td className="px-4 py-3">
                        <span className="inline-block rounded bg-neutral-900 px-2 py-0.5 font-mono text-xs font-bold text-white tracking-wider dark:border dark:border-neutral-700">
                          {order.vehiclePlate}
                        </span>
                        <span className="mt-1 block font-medium text-foreground text-xs">
                          {order.vehicleModel}
                        </span>
                      </td>

                      {/* Pelanggan */}
                      <td className="px-4 py-3">
                        <span className="font-semibold text-foreground block">
                          {order.customerName}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[11px] text-muted-foreground">
                            {order.customerPhone}
                          </span>
                          {order.isMember && (
                            <Badge variant="purple" className="px-1.5 py-0 text-[9px]">
                              Member
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Layanan */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground line-clamp-1">
                          {order.services.join(', ')}
                        </p>
                        {order.discount > 0 && (
                          <span className="text-[10px] text-emerald-600 font-medium">
                            Potongan Diskon: -Rp {order.discount.toLocaleString('id-ID')}
                          </span>
                        )}
                      </td>

                      {/* Status Pengerjaan */}
                      <td className="px-4 py-3">
                        {getStatusBadge(order.status)}
                      </td>

                      {/* Status Bayar & Metode */}
                      <td className="px-4 py-3">
                        {order.paymentStatus === 'PAID' ? (
                          <div className="space-y-0.5">
                            <Badge variant="success" className="text-[11px]">
                              Lunas ({order.paymentMethod || 'TUNAI'})
                            </Badge>
                            {order.paymentMethod === 'CASH' && order.cashReceived && (
                              <p className="text-[10px] font-mono text-muted-foreground">
                                Masuk: Rp {order.cashReceived.toLocaleString('id-ID')} | Kembali: Rp {(order.change ?? 0).toLocaleString('id-ID')}
                              </p>
                            )}
                          </div>
                        ) : (
                          <Badge variant="destructive" className="text-[11px]">
                            Belum Bayar
                          </Badge>
                        )}
                      </td>

                      {/* Total Biaya */}
                      <td className="px-4 py-3 text-right font-extrabold font-mono text-sm text-foreground">
                        Rp {order.total.toLocaleString('id-ID')}
                      </td>

                      {/* Aksi */}
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Tombol Cetak Ulang Struk */}
                          <Button
                            size="icon-xs"
                            variant="outline"
                            title="Cetak Ulang Struk"
                            onClick={() => setSelectedReceiptOrder(order)}
                          >
                            <Printer className="size-3.5 text-muted-foreground" />
                          </Button>

                          {/* Tombol Detail Riwayat */}
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            title="Lihat Detail Transaksi"
                            onClick={() => setDetailOrder(order)}
                          >
                            <Eye className="size-3.5 text-muted-foreground" />
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
      </Card>

      {/* 3. MODAL CETAK ULANG STRUK */}
      <ReceiptModal
        isOpen={!!selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
        order={selectedReceiptOrder}
      />

      {/* 4. MODAL DETAIL RINCIAN ORDER */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-4 sm:p-6 flex justify-center items-start">
          <div className="relative w-full max-w-lg my-8">
            <Card className="border-border bg-card shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  Rincian Tiket {detailOrder.orderCode}
                </CardTitle>
                <button
                  type="button"
                  onClick={() => setDetailOrder(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </CardHeader>

              <CardContent className="p-5 space-y-4 text-xs">
                {/* Info Kendaraan */}
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plat Nomor:</span>
                    <span className="font-bold font-mono text-sm">{detailOrder.vehiclePlate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipe Mobil:</span>
                    <span className="font-semibold">{detailOrder.vehicleModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pelanggan:</span>
                    <span>{detailOrder.customerName} ({detailOrder.customerPhone})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Petugas Kasir:</span>
                    <span className="font-medium">{detailOrder.staffName}</span>
                  </div>
                </div>

                {/* Paket Layanan */}
                <div className="space-y-1.5">
                  <p className="font-semibold text-foreground">Daftar Layanan</p>
                  <div className="rounded-lg border border-border/60 divide-y divide-border/60">
                    {detailOrder.services.map((s, idx) => (
                      <div key={idx} className="p-2.5 flex justify-between font-medium">
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rincian Finansial */}
                <div className="space-y-1 border-t border-border/60 pt-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>Rp {detailOrder.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  {detailOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Diskon ({detailOrder.discountPercent}%):</span>
                      <span>-Rp {detailOrder.discount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-sm text-foreground pt-1 border-t border-border/40">
                    <span>Total Pembayaran:</span>
                    <span className="text-primary">Rp {detailOrder.total.toLocaleString('id-ID')}</span>
                  </div>
                  {detailOrder.paymentMethod === 'CASH' && detailOrder.cashReceived && (
                    <div className="pt-2 text-muted-foreground space-y-0.5">
                      <div className="flex justify-between">
                        <span>Uang Masuk:</span>
                        <span>Rp {detailOrder.cashReceived.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Uang Kembalian:</span>
                        <span>Rp {(detailOrder.change ?? 0).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>

              <div className="flex justify-between p-4 border-t border-border/60">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={() => {
                    const target = detailOrder
                    setDetailOrder(null)
                    setSelectedReceiptOrder(target)
                  }}
                >
                  <Printer className="size-3.5" />
                  Cetak Struk
                </Button>
                <Button size="sm" onClick={() => setDetailOrder(null)}>
                  Tutup
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}