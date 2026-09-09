import { useState } from 'react'
import { X, Car, Sparkles, Check, CreditCard, Banknote, QrCode } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

import { type ServiceItem, type OrderRecord } from '../../types/carwash'

interface NewOrderModalProps {
  isOpen: boolean
  onClose: () => void
  services: ServiceItem[]
  onAddOrder: (newOrder: OrderRecord) => void
}

export function NewOrderModal({
  isOpen,
  onClose,
  services,
  onAddOrder,
}: NewOrderModalProps) {
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [isMember, setIsMember] = useState(false)
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([1])
  const [paymentOption, setPaymentOption] = useState<'NOW' | 'LATER'>('NOW')
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'CASH' | 'DEBIT'>('CASH')
  const [cashReceived, setCashReceived] = useState<string>('')

  if (!isOpen) return null

  const toggleService = (id: number) => {
    if (selectedServiceIds.includes(id)) {
      if (selectedServiceIds.length > 1) {
        setSelectedServiceIds(selectedServiceIds.filter((item) => item !== id))
      }
    } else {
      setSelectedServiceIds([...selectedServiceIds, id])
    }
  }

  const selectedServices = services.filter((s) => selectedServiceIds.includes(s.id))
  const subtotal = selectedServices.reduce((acc, curr) => acc + curr.price, 0)
  const discountPercent = isMember ? 10 : 0
  const discountAmount = Math.round((subtotal * discountPercent) / 100)
  const total = subtotal - discountAmount

  const numericCash = parseFloat(cashReceived.replace(/\D/g, '')) || 0
  const change = numericCash - total
  const isCashInsufficient =
    paymentOption === 'NOW' && paymentMethod === 'CASH' && (numericCash < total)

  const quickCashNominals = [
    { label: 'Uang Pas', value: total },
    { label: '50.000', value: 50000 },
    { label: '100.000', value: 100000 },
    { label: '200.000', value: 200000 },
  ].filter((item) => item.value >= total || item.label === 'Uang Pas')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehiclePlate.trim() || !customerName.trim()) {
      alert('Mohon lengkapi Plat Nomor dan Nama Pelanggan')
      return
    }

    if (paymentOption === 'NOW' && paymentMethod === 'CASH' && numericCash < total) {
      alert(
        `Uang tunai yang diterima masih kurang Rp ${(total - numericCash).toLocaleString('id-ID')}!`
      )
      return
    }

    const orderNumber = Math.floor(100 + Math.random() * 900)
    const newOrder: OrderRecord = {
      id: Date.now(),
      orderCode: `CW-2609-${orderNumber}`,
      vehiclePlate: vehiclePlate.toUpperCase().trim(),
      vehicleModel: vehicleModel.trim() || 'Mobil Standar',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || '-',
      isMember,
      discountPercent,
      status: 'QUEUED',
      paymentStatus: paymentOption === 'NOW' ? 'PAID' : 'UNPAID',
      paymentMethod: paymentOption === 'NOW' ? paymentMethod : undefined,
      subtotal,
      discount: discountAmount,
      total,
      cashReceived: paymentOption === 'NOW' && paymentMethod === 'CASH' ? numericCash : undefined,
      change: paymentOption === 'NOW' && paymentMethod === 'CASH' ? change : undefined,
      services: selectedServices.map((s) => s.name),
      bayNumber: Math.floor(Math.random() * 4) + 1,
      startedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      staffName: 'Kasir Aktif',
    }

    onAddOrder(newOrder)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-4 sm:p-6 flex justify-center items-start">
    <div className="relative w-full max-w-2xl my-8">
      <Card className="border-border bg-card shadow-2xl max-h-[88vh] flex flex-col overflow-x-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4 shrink-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Car className="size-5 text-primary" />
              Input Transaksi POS & Antrean Baru
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Daftarkan kendaraan masuk ke antrean cuci dan proses pembayaran kasir
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 py-4 text-xs">
              {/* Row 1: Kendaraan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">
                    Plat Nomor Kendaraan <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="Contoh: B 1234 XYZ"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    required
                    className="uppercase font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Tipe & Warna Mobil</label>
                  <Input
                    placeholder="Contoh: Toyota Avanza Silver"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 2: Customer & Membership */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">
                    Nama Pelanggan <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="Nama pemilik mobil"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">No. WhatsApp / HP</label>
                  <Input
                    placeholder="0812xxxxxxxx"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Membership Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/20 p-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-purple-500" />
                  <div>
                    <p className="font-semibold text-foreground">Status Keanggotaan (Membership)</p>
                    <p className="text-[11px] text-muted-foreground">
                      Diskon otomatis 10% untuk seluruh paket layanan
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMember(!isMember)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    isMember
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'border border-border bg-background text-muted-foreground'
                  }`}
                >
                  {isMember ? 'Aktif (10% Off)' : 'Bukan Member'}
                </button>
              </div>

              {/* Service Selection */}
              <div>
                <label className="font-semibold block mb-1.5">Pilih Layanan Cuci & Detailing</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {services.map((svc) => {
                    const isSelected = selectedServiceIds.includes(svc.id)
                    return (
                      <div
                        key={svc.id}
                        onClick={() => toggleService(svc.id)}
                        className={`cursor-pointer rounded-lg border p-2.5 transition-all flex items-start justify-between ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-xs'
                            : 'border-border/60 hover:border-border bg-card'
                        }`}
                      >
                        <div className="pr-2">
                          <p className="font-semibold text-foreground">{svc.name}</p>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {svc.description}
                          </p>
                          <p className="mt-1 text-xs font-bold text-primary">
                            Rp {svc.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div
                          className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border ${
                            isSelected
                              ? 'border-primary bg-primary text-white'
                              : 'border-border'
                          }`}
                        >
                          {isSelected && <Check className="size-3" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Payment Section */}
              <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Opsi Pembayaran</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setPaymentOption('NOW')}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                        paymentOption === 'NOW'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-background text-muted-foreground border border-border'
                      }`}
                    >
                      Bayar di Awal (Lunas)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentOption('LATER')}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                        paymentOption === 'LATER'
                          ? 'bg-amber-600 text-white'
                          : 'bg-background text-muted-foreground border border-border'
                      }`}
                    >
                      Bayar Nanti (Selesai Cuci)
                    </button>
                  </div>
                </div>

                {paymentOption === 'NOW' && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CASH')}
                        className={`flex flex-col items-center justify-center rounded-lg border p-2 transition-all ${
                          paymentMethod === 'CASH'
                            ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold'
                            : 'border-border bg-card text-muted-foreground'
                        }`}
                      >
                        <Banknote className="size-4 mb-1" />
                        <span className="text-[11px]">Tunai (Cash)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('QRIS')}
                        className={`flex flex-col items-center justify-center rounded-lg border p-2 transition-all ${
                          paymentMethod === 'QRIS'
                            ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold'
                            : 'border-border bg-card text-muted-foreground'
                        }`}
                      >
                        <QrCode className="size-4 mb-1" />
                        <span className="text-[11px]">QRIS</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('DEBIT')}
                        className={`flex flex-col items-center justify-center rounded-lg border p-2 transition-all ${
                          paymentMethod === 'DEBIT'
                            ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold'
                            : 'border-border bg-card text-muted-foreground'
                        }`}
                      >
                        <CreditCard className="size-4 mb-1" />
                        <span className="text-[11px]">EDC / Debit</span>
                      </button>
                    </div>

                    {/* Cash Calculation Box */}
                    {paymentMethod === 'CASH' && (
                      <div className="space-y-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                        <div className="flex items-center justify-between">
                          <label className="font-semibold text-emerald-900 dark:text-emerald-300">
                            Uang Tunai Diterima (Rp)
                          </label>
                          {numericCash >= total && numericCash > 0 && (
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              ✓ Uang Cukup
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-muted-foreground text-sm">Rp</span>
                          <Input
                            type="number"
                            min={0}
                            placeholder="Nominal uang dari customer..."
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value)}
                            className="font-bold text-sm bg-background"
                          />
                        </div>

                        {/* Quick Cash Buttons */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {quickCashNominals.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setCashReceived(String(item.value))}
                              className="rounded-md border border-border/80 bg-background px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted hover:border-emerald-500/50 transition-all shadow-2xs"
                            >
                              {item.label === 'Uang Pas'
                                ? `Uang Pas (Rp ${total.toLocaleString('id-ID')})`
                                : `Rp ${item.value.toLocaleString('id-ID')}`}
                            </button>
                          ))}
                        </div>

                        {/* Change / Shortage Display */}
                        {cashReceived !== '' && (
                          <div
                            className={`rounded-lg p-2.5 flex items-center justify-between border ${
                              numericCash >= total
                                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
                                : 'bg-rose-500/20 border-rose-500/30 text-rose-950 dark:text-rose-100'
                            }`}
                          >
                            <span className="font-semibold text-xs">
                              {numericCash >= total ? 'Uang Kembalian:' : 'Uang Masih Kurang:'}
                            </span>
                            <span className="text-base font-extrabold font-mono">
                              Rp {Math.abs(change).toLocaleString('id-ID')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Ringkasan Biaya */}
                <div className="border-t border-border/60 pt-2 space-y-1 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Diskon Member (10%):</span>
                      <span>-Rp {discountAmount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm text-foreground pt-1 border-t border-border/40">
                    <span>Total Tagihan:</span>
                    <span className="text-primary">Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-end gap-2 border-t border-border/60 p-4">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isCashInsufficient}
                className="bg-primary text-primary-foreground font-semibold"
              >
                Simpan & Masuk Antrean
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
