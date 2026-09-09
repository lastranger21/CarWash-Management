import { useState } from 'react'
import { X, CreditCard, Banknote, QrCode, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { type OrderRecord } from '../../types/carwash'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  order: OrderRecord | null
  onConfirmPayment: (
    orderId: number,
    paymentMethod: 'CASH' | 'QRIS' | 'DEBIT',
    cashReceived?: number,
    change?: number
  ) => void
}

export function PaymentModal({
  isOpen,
  onClose,
  order,
  onConfirmPayment,
}: PaymentModalProps) {
  if (!isOpen || !order) return null

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | 'DEBIT'>('CASH')
  const [cashReceived, setCashReceived] = useState<string>('')

  const numericCash = parseFloat(cashReceived.replace(/\D/g, '')) || 0
  const change = numericCash - order.total
  const isCashInsufficient = paymentMethod === 'CASH' && (numericCash < order.total)

  const quickCashNominals = [
    { label: 'Uang Pas', value: order.total },
    { label: '50.000', value: 50000 },
    { label: '100.000', value: 100000 },
    { label: '200.000', value: 200000 },
  ].filter((item, idx, self) => item.value >= order.total || item.label === 'Uang Pas')

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()

    if (paymentMethod === 'CASH') {
      if (numericCash < order.total) {
        alert(
          `Uang tunai masih kurang Rp ${(order.total - numericCash).toLocaleString('id-ID')}!`
        )
        return
      }
      onConfirmPayment(order.id, 'CASH', numericCash, change)
    } else {
      onConfirmPayment(order.id, paymentMethod)
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md">
        <Card className="border-border bg-card shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CreditCard className="size-5 text-emerald-600" />
                Kasir Pembayaran
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {order.orderCode} • {order.vehiclePlate} ({order.customerName})
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </CardHeader>

          <form onSubmit={handleConfirm}>
            <CardContent className="p-5 space-y-4 text-xs">
              {/* Ringkasan Order */}
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Layanan:</span>
                  <span className="text-foreground font-semibold truncate max-w-[200px]">
                    {order.services.join(', ')}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Diskon Member ({order.discountPercent}%):</span>
                    <span>-Rp {order.discount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-1.5 border-t border-border/50 text-sm">
                  <span className="font-bold text-foreground">Total Tagihan:</span>
                  <span className="font-extrabold text-base text-primary">
                    Rp {order.total.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Pilihan Metode Bayar */}
              <div>
                <label className="font-semibold block mb-2 text-foreground">
                  Pilih Metode Pembayaran
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 transition-all ${
                      paymentMethod === 'CASH'
                        ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Banknote className="size-5 mb-1" />
                    <span className="text-xs">Tunai (Cash)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('QRIS')}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 transition-all ${
                      paymentMethod === 'QRIS'
                        ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <QrCode className="size-5 mb-1" />
                    <span className="text-xs">QRIS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('DEBIT')}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 transition-all ${
                      paymentMethod === 'DEBIT'
                        ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <CreditCard className="size-5 mb-1" />
                    <span className="text-xs">EDC / Debit</span>
                  </button>
                </div>
              </div>

              {/* Section Khusus Pembayaran Tunai (Cash) */}
              {paymentMethod === 'CASH' && (
                <div className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 transition-all">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-emerald-900 dark:text-emerald-200">
                      Uang Tunai Diterima (Rp)
                    </label>
                    {numericCash >= order.total && numericCash > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3.5" /> Uang Cukup
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-muted-foreground text-sm">Rp</span>
                    <Input
                      type="number"
                      min={0}
                      autoFocus
                      placeholder="Ketik nominal uang..."
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="font-bold text-base bg-background h-10"
                    />
                  </div>

                  {/* Tombol Nominal Cepat */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] text-muted-foreground font-medium block">
                      Nominal Cepat:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {quickCashNominals.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCashReceived(String(item.value))}
                          className="rounded-lg border border-border/80 bg-background px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted hover:border-emerald-500/50 transition-all shadow-2xs"
                        >
                          {item.label === 'Uang Pas'
                            ? `Uang Pas (Rp ${order.total.toLocaleString('id-ID')})`
                            : `Rp ${item.value.toLocaleString('id-ID')}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Display Kembalian / Kekurangan */}
                  {cashReceived !== '' && (
                    <div
                      className={`rounded-xl p-3 flex items-center justify-between border transition-all ${
                        numericCash >= order.total
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-950 dark:text-emerald-100'
                          : 'bg-rose-500/20 border-rose-500/40 text-rose-950 dark:text-rose-100'
                      }`}
                    >
                      <span className="font-semibold text-xs">
                        {numericCash >= order.total
                          ? 'Uang Kembalian:'
                          : 'Uang Masih Kurang:'}
                      </span>
                      <span className="text-lg font-extrabold font-mono tracking-tight">
                        Rp {Math.abs(change).toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex items-center justify-end gap-2 border-t border-border/60 p-4">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isCashInsufficient}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
              >
                <CheckCircle2 className="size-4" />
                Konfirmasi Lunas
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
