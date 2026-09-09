import { X, Printer, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card'
import { Button } from '../ui/button'
import { type OrderRecord } from '../../types/carwash'

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  order: OrderRecord | null
}

export function ReceiptModal({ isOpen, onClose, order }: ReceiptModalProps) {
  if (!isOpen || !order) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-sm">
        <Card className="border-border bg-card shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Printer className="size-4 text-primary" />
              Struk Pembayaran POS
            </CardTitle>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </CardHeader>

          <CardContent className="p-5 font-mono text-xs text-neutral-800 dark:text-neutral-200">
            {/* Thermal receipt look */}
            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 space-y-3">
              <div className="text-center space-y-0.5 border-b border-dashed border-border pb-2.5">
                <h3 className="font-bold text-sm tracking-wider uppercase">CLEANWASH PRO</h3>
                <p className="text-[10px] text-muted-foreground">Jl. Sukses Makmur No. 88, Jakarta</p>
                <p className="text-[10px] text-muted-foreground">Telp / WA: 0812-9988-7766</p>
              </div>

              <div className="text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">No. Tiket:</span>
                  <span className="font-bold">{order.orderCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Waktu:</span>
                  <span>{order.startedAt} WIB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plat Nomor:</span>
                  <span className="font-bold tracking-wider">{order.vehiclePlate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kendaraan:</span>
                  <span>{order.vehicleModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pelanggan:</span>
                  <span>{order.customerName} {order.isMember && '(Member)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kasir:</span>
                  <span>{order.staffName}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-border pt-2 space-y-1 text-[11px]">
                {order.services.map((svc, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate pr-2">{svc}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-border pt-2 space-y-1 text-[11px]">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span>Rp {order.subtotal.toLocaleString('id-ID')}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Diskon ({order.discountPercent}%):</span>
                    <span>-Rp {order.discount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-border/40 text-foreground">
                  <span>TOTAL TAGIHAN:</span>
                  <span>Rp {order.total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Payment details with Cash Received & Change */}
              <div className="border-t border-dashed border-border pt-2 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Metode Bayar:</span>
                  <span className="font-bold">{order.paymentMethod || 'TUNAI'}</span>
                </div>
                {order.paymentMethod === 'CASH' && order.cashReceived && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uang Diterima:</span>
                      <span className="font-bold">Rp {order.cashReceived.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xs text-emerald-600 dark:text-emerald-400 pt-0.5">
                      <span>KEMBALIAN:</span>
                      <span>Rp {(order.change ?? 0).toLocaleString('id-ID')}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-1">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-bold text-emerald-600">
                    {order.paymentStatus === 'PAID' ? 'LUNAS' : 'BELUM LUNAS'}
                  </span>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-dashed border-border text-[10px] text-muted-foreground">
                <p>Terima kasih atas kunjungan Anda!</p>
                <p>Mobil Bersih, Perjalanan Nyaman</p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-end gap-2 border-t border-border/60 p-4">
            <Button variant="outline" size="sm" onClick={onClose}>
              Tutup
            </Button>
            <Button size="sm" onClick={handlePrint} className="gap-1.5 font-semibold">
              <Printer className="size-3.5" />
              Cetak Struk
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
