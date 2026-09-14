// file: Client/src/components/dashboard/EditOrderModal.tsx
import { useState, useEffect } from 'react'
import { X, Pencil, Car, Sparkles, Plus, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { type OrderRecord } from '../../types/carwash'
import { useService } from '@/hooks/useService'
import { useOrder } from '@/hooks/useOrder'
import { api } from '@/api'

interface EditOrderModalProps {
  isOpen: boolean
  onClose: () => void
  order: OrderRecord | null
}

export function EditOrderModal({ isOpen, onClose, order }: EditOrderModalProps) {
  const { services } = useService()
  const { updateOrder } = useOrder()

  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [bayNumber, setBayNumber] = useState<number>(1)
  const [selectedQuantities, setSelectedQuantities] = useState<Record<number, number>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Isi data form 
  useEffect(() => {
    if (order) {
      setVehiclePlate(order.vehiclePlate || '')
      setVehicleModel(order.vehicleModel || '')
      setBayNumber(order.bayNumber || 1)

      // map service => order
      const initialQty: Record<number, number> = {}
      services.forEach((svc) => {
        const found = order.services.find((s) => s.includes(svc.name))
        if (found) {
          const match = found.match(/\((\d+)x\)/)
          initialQty[svc.id] = match ? parseInt(match[1]) : 1
        }
      })
      setSelectedQuantities(initialQty)
    }
  }, [order, services])

  if (!isOpen || !order) return null

  // Handler kuantitas layanan
  const handleQuantityChange = (serviceId: number, delta: number) => {
    setSelectedQuantities((prev) => {
      const current = prev[serviceId] || 0
      const next = Math.max(0, current + delta)
      return { ...prev, [serviceId]: next }
    })
  }

  // Hitung ulang subtotal dan total baru
  const subtotal = services.reduce((sum, svc) => {
    const qty = selectedQuantities[svc.id] || 0
    return sum + svc.price * qty
  }, 0)

  const discountAmount = Math.round((subtotal * (order.discountPercent || 0)) / 100)
  const total = subtotal - discountAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const apiItems = services
      .filter((svc) => (selectedQuantities[svc.id] || 0) > 0)
      .map((svc) => ({
        serviceId: svc.id,
        quantity: selectedQuantities[svc.id] || 1,
      }))

    if (apiItems.length === 0) {
      alert('Pesanan harus memiliki minimal 1 layanan!')
      return
    }

    setIsLoading(true)
    try {
      // Kirim pembaruan ke backend
      const res = await api.put(`/api/order/${order.id}`, {
        vehiclePlate: vehiclePlate.toUpperCase().trim(),
        vehicleModel: vehicleModel.trim(),
        bayId: bayNumber,
        items: apiItems,
      })

      // 2. Format daftar nama layanan baru
      const newServicesList = services
        .filter((svc) => (selectedQuantities[svc.id] || 0) > 0)
        .map((svc) => {
          const qty = selectedQuantities[svc.id]
          return qty > 1 ? `${svc.name} (${qty}x)` : svc.name
        })

      // 3. Update state di frontend
      updateOrder(order.id, {
        vehiclePlate: vehiclePlate.toUpperCase().trim(),
        vehicleModel: vehicleModel.trim(),
        bayNumber,
        services: newServicesList,
        subtotal,
        discount: discountAmount,
        total,
      })

      alert('Data order berhasil diperbarui!')
      onClose()
    } catch (err: any) {
      console.error('Gagal update order:', err)
      alert(err.response?.data?.message || 'Gagal memperbarui pesanan di server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg my-8">
        <Card className="border-border bg-card shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Pencil className="size-4 text-primary" />
                Edit Data Pesanan #{order.orderCode}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pelanggan: <span className="font-semibold text-foreground">{order.customerName}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-4 text-xs">
              {/* Plat Nomor & Model Kendaraan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Plat Nomor Kendaraan</Label>
                  <Input
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                    placeholder="B 1234 ABC"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Model Kendaraan</Label>
                  <Input
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="Honda CR-V Hitam"
                    required
                  />
                </div>
              </div>

              {/* Pilihan Bilik Bay */}
              <div className="space-y-1.5">
                <Label className="text-xs">Pindahkan ke Bilik Bay</Label>
                <select
                  value={bayNumber}
                  onChange={(e) => setBayNumber(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value={1}>Bay 1 (Cuci Salju)</option>
                  <option value={2}>Bay 2 (Cuci Salju)</option>
                  <option value={3}>Bay 3 (Pengeringan)</option>
                  <option value={4}>Bay 4 (Detailing)</option>
                </select>
              </div>

              {/* Tambah / Kurang Layanan Cuci */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" />
                  Paket & Layanan Cuci
                </Label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {services.map((svc) => {
                    const qty = selectedQuantities[svc.id] || 0
                    return (
                      <div
                        key={svc.id}
                        className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                          qty > 0 ? 'border-primary/50 bg-primary/5' : 'border-border bg-muted/20'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-foreground">{svc.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            Rp {svc.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="outline"
                            onClick={() => handleQuantityChange(svc.id, -1)}
                            disabled={qty === 0}
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="w-5 text-center font-bold text-xs">{qty}</span>
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="outline"
                            onClick={() => handleQuantityChange(svc.id, 1)}
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Rincian Total Baru */}
              <div className="rounded-lg bg-muted/40 p-3 space-y-1 text-xs border border-border/60">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal Baru:</span>
                  <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                {order.discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Diskon Member ({order.discountPercent}%):</span>
                    <span>-Rp {discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-foreground pt-1 border-t border-border/40">
                  <span>Total Tagihan Baru:</span>
                  <span className="text-primary">Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-2 border-t border-border/60 p-3">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}