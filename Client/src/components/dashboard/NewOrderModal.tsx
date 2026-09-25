import { useState,useRef,useEffect} from 'react'
import { X, Car, Sparkles, PackageCheck, CreditCard, Banknote, QrCode,Plus,Minus,ShoppingBag,Search,        
  ChevronDown,User,Phone,}from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useCustomer } from '@/hooks/useCustomer'
import { type ServiceItem, type OrderRecord } from '../../types/carwash'
import { api } from '@/api'
import { useOrder } from '@/hooks/useOrder'
import { Label } from '../ui/label'
interface NewOrderModalProps {
  isOpen: boolean
  onClose: () => void
  services: ServiceItem[]
  
}
interface SearchableDropdownProps {
  label: string
  placeholder: string
  value: string
  onChange: (val: string) => void
  options: Array<{
    id: string | number
    primary: string
    secondary?: string
    badge?: string
    data: any
  }>
  onSelect: (data: any) => void
  icon?: React.ComponentType<{ className?: string }>
  required?: boolean
  searchPlaceholder?: string
}
function SearchableDropdown({
  label,
  placeholder,
  value,
  onChange,
  options,
  onSelect,
  icon: Icon,
  required = false,
  searchPlaceholder = 'Ketik untuk mencari...',
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  // Menutup dropdown otomatis jika klik di luar area
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  // Filter daftar berdasarkan teks yang diketik di searchbar
  const filteredOptions = options.filter(
    (opt) =>
      opt.primary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opt.secondary && opt.secondary.toLowerCase().includes(searchTerm.toLowerCase()))
  )
  return (
    <div className="relative" ref={dropdownRef}>
      <label className="font-semibold block mb-1">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {/* Input Utama dengan Tombol Dropdown */}
      <div className="relative flex items-center">
        {Icon && (
          <Icon className="absolute left-3 size-3.5 text-muted-foreground pointer-events-none" />
        )}
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={`${Icon ? 'pl-8' : ''} pr-8`}
        />
        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev)
            setSearchTerm('')
          }}
          className="absolute right-2 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ChevronDown
            className={`size-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
      {/* Menu Popup Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-2xl animate-in fade-in-0 zoom-in-95">
          {/* Search Bar di dalam Dropdown */}
          <div className="relative mb-2 flex items-center">
            <Search className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              autoFocus
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-xs outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
            
          </div>
          {/* List Hasil Pencarian */}
          <div className="max-h-44 overflow-y-auto space-y-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onSelect(opt.data)
                    setIsOpen(false)
                    setSearchTerm('')
                  }}
                  className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs hover:bg-muted cursor-pointer transition-colors"
                >
                  <div className="truncate pr-2">
                    <p className="font-semibold text-foreground truncate">{opt.primary}</p>
                    {opt.secondary && (
                      <p className="text-[11px] text-muted-foreground truncate">
                        {opt.secondary}
                      </p>
                    )}
                  </div>
                  {opt.badge && (
                    <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      {opt.badge}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-muted-foreground">
                <p>Data tidak ditemukan.</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Kamu bisa langsung mengetik untuk data baru.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function NewOrderModal({
  isOpen,
  onClose,
  services,
 
}: NewOrderModalProps) {
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [isMember, setIsMember] = useState(false)
  const [selectedQuantities, setSelectedQuantities] = useState<Record<number, number>>({ 1: 1 })
  const [paymentOption, setPaymentOption] = useState<'NOW' | 'LATER'>('NOW')
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'CASH' | 'DEBIT'>('CASH')
  const [cashReceived, setCashReceived] = useState<string>('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const { customers, addCustomer } = useCustomer()
  const {addOrder,confirmPayment} = useOrder()
  if (!isOpen) return null
  const handlePhoneChange = (phoneInput: string) => {
    setCustomerPhone(phoneInput)
    const existing = customers.find(
      (c) => c.phone.trim() === phoneInput.trim() && phoneInput.trim().length >= 8
    )
    if (existing) {
      setCustomerName(existing.name)
      if (existing.membership && existing.membership.isActive) {
        setIsMember(true)
        setDiscountPercent(existing.membership.discountPercent)
      }
    }
  }
 // Fungsi Menambah Kuantitas (+1)
const increaseQuantity = (id: number) => {
  setSelectedQuantities((prev) => ({
    ...prev,
    [id]: (prev[id] || 0) + 1,
  }))
}
// Fungsi Mengurangi Kuantitas (-1)
const decreaseQuantity = (id: number) => {
  setSelectedQuantities((prev) => {
    const currentQty = prev[id] || 0
    if (currentQty <= 1) {
      // Jika dikurangi dari 1, hilangkan item dari daftar terpilih
      const updated = { ...prev }
      delete updated[id]
      return updated
    }
    return {
      ...prev,
      [id]: currentQty - 1,
    }
  })
}
// Hitung total harga seblum diskon(harga × kuantitas)
const subtotal = services.reduce((sum, svc) => {
  const qty = selectedQuantities[svc.id] || 0
  return sum + (svc.price * qty)
}, 0)
 
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


  const matchedCustomer = customers.find(
    (c) =>
      (customerPhone.trim() && c.phone.trim() === customerPhone.trim()) ||
      (customerName.trim() && c.name.toLowerCase().trim() === customerName.toLowerCase().trim())
  )
  const registeredVehicles = matchedCustomer?.vehicles || []
  const plateOptions = customers.flatMap((c) => {
    const list = c.vehicles && c.vehicles.length > 0
      ? c.vehicles
      : c.frequentPlate
      ? [{ id: `freq-${c.id}`, plateNumber: c.frequentPlate, modelName: 'Mobil Standar' }]
      : []
    return list.map((v) => ({
      id: `plate-${c.id}-${v.plateNumber}`,
      primary: v.plateNumber,
      secondary: `${v.modelName || 'Mobil'} • ${c.name} (${c.phone})`,
      badge: c.membership?.isActive ? 'MEMBER' : undefined,
      data: { vehicle: v, customer: c },
    }))
  })
  // Data opsi untuk Dropdown Nama Pelanggan
  const customerOptions = customers.map((c) => ({
    id: `cust-${c.id}`,
    primary: c.name,
    secondary: `${c.phone} • ${c.vehicles?.[0]?.plateNumber || c.frequentPlate || 'Belum ada mobil'}`,
    badge: c.membership?.isActive ? 'MEMBER' : undefined,
    data: c,
  }))
  //Data opsi untuk Dropdown Nomor HP
  const phoneOptions = customers
    .filter((c) => c.phone && c.phone !== '-')
    .map((c) => ({
      id: `phone-${c.id}`,
      primary: c.phone,
      secondary: `${c.name} • ${c.vehicles?.[0]?.plateNumber || c.frequentPlate || ''}`,
      badge: c.membership?.isActive ? 'MEMBER' : undefined,
      data: c,
    }))
  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault()
    if (!vehiclePlate.trim() || !customerName.trim()) {
      alert('Mohon lengkapi Plat Nomor dan Nama Pelanggan')
      return
    }
    //  cek dan daftar customer
    let targetCustomerId: number | undefined
    const existingCustomer = customers.find(
      (c) =>
        (customerPhone.trim() && c.phone.trim() === customerPhone.trim()) ||
        c.name.toLowerCase().trim() === customerName.toLowerCase().trim()
    )
    if (existingCustomer) {
      targetCustomerId = existingCustomer.id
    } else {
      // Buat customer baru ke backend
      try {
        const resCust = await api.post('/api/customers', {
          name: customerName.trim(),
          phone: customerPhone.trim() || '-',
        })
        targetCustomerId = resCust.data?.data?.id
      } catch (err) {
        console.warn('Gagal buat customer baru di DB:', err)
      }
    }
    //  Siapkan items untuk backend
    const apiItems = services
      .filter((svc) => (selectedQuantities[svc.id] || 0) > 0)
      .map((svc) => ({
        serviceId: svc.id,
        quantity: selectedQuantities[svc.id] || 1,
      }))
    if (apiItems.length === 0) {
      alert('Silakan pilih minimal 1 layanan!')
      return
    }
    //  Siapkan UI record
    const orderNumber = Math.floor(100 + Math.random() * 900)
    const selectedServicesList = services
      .filter((svc) => (selectedQuantities[svc.id] || 0) > 0)
      .map((svc) => {
        const qty = selectedQuantities[svc.id]
        return qty > 1 ? `${svc.name} (${qty}x)` : svc.name
      })
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
      services: selectedServicesList,
      bayNumber: Math.floor(Math.random() * 4) + 1,
      startedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      staffName: 'Kasir Aktif',
      createdAt: new Date().toISOString(),
    }
    //  Kirim ke addOrder beserta apiPayload jika customerId tersedia
    const apiPayload = targetCustomerId
      ? {
          customerId: targetCustomerId,
          vehiclePlate: vehiclePlate.toUpperCase().trim(),
          vehicleModel: vehicleModel.trim() || 'Mobil Standar',
          items: apiItems,
        }
      : undefined
    try {
      // Kirim order ke backend
      const res = await api.post('/api/order', apiPayload)
      const createdOrderFromDb = res.data?.data
      //  Tampilkan di state lokal
      addOrder({
        ...newOrder,
        id: createdOrderFromDb?.id || newOrder.id,
        orderCode: createdOrderFromDb?.orderCode || newOrder.orderCode,
      })
      //  JIKA KASIR PILIH "BAYAR SEKARANG", SEGERA PROSES PEMBAYARANNYA DI DATABASE
      if (paymentOption === 'NOW' && createdOrderFromDb?.id) {
        await confirmPayment(
          createdOrderFromDb.id,
          paymentMethod,
          paymentMethod === 'CASH' ? numericCash : undefined,
          paymentMethod === 'CASH' ? change : undefined
        )
      }
      onClose()
    } catch (err) {
      console.error('Gagal buat order:', err)
      // Fallback ke lokal jika backend offline
      addOrder(newOrder)
      onClose()
    }
    
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-4 sm:p-6 flex justify-center items-start">
    <div className="relative w-full max-w-2xl my-8">
      <Card className="border-border bg-card shadow-2xl max-h-[88vh] min-h-0 flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4 shrink-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Car className="size-5 text-primary" />
              Input Order Baru
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

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <CardContent className="min-h-0 flex-1 overflow-y-auto space-y-4 py-4 text-xs">
              {/* Row 1: Kendaraan */}
              <div>
                
                <SearchableDropdown
                  label="Nama Pelanggan"
                  placeholder="Nama pemilik kendaraan"
                  value={customerName}
                  onChange={(val) => setCustomerName(val)}
                  icon={User}
                  required
                  searchPlaceholder="Cari nama pelanggan..."
                  options={customerOptions}
                  onSelect={(c) => {
                    setCustomerName(c.name)
                    setCustomerPhone(c.phone)
                    if (c.membership?.isActive) {
                      setIsMember(true)
                      setDiscountPercent(c.membership.discountPercent)
                    } else {
                      setIsMember(false)
                      setDiscountPercent(0)
                    }
                    // Auto-fill mobil pertama pelanggan jika ada
                    const firstVeh = c.vehicles?.[0]
                    if (firstVeh) {
                      setVehiclePlate(firstVeh.plateNumber)
                      setVehicleModel(firstVeh.modelName || 'Mobil Standar')
                    } else if (c.frequentPlate) {
                      setVehiclePlate(c.frequentPlate)
                      setVehicleModel('Mobil Standar')
                    }
                  }}
                />
                
              </div>
              {/* Row 2: Nama Pelanggan & No. HP dengan Searchable Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SearchableDropdown
                  label="Nomor Plat Kendaraan"
                  placeholder="Contoh: B 1234 ABC"
                  value={vehiclePlate}
                  onChange={(val) => setVehiclePlate(val.toUpperCase())}
                  icon={Car}
                  required
                  searchPlaceholder="Cari plat nomor atau pemilik..."
                  options={plateOptions}
                  onSelect={({ vehicle, customer }) => {
                    setVehiclePlate(vehicle.plateNumber)
                    setVehicleModel(vehicle.modelName || 'Mobil Standar')
                    setCustomerName(customer.name)
                    setCustomerPhone(customer.phone)
                    if (customer.membership?.isActive) {
                      setIsMember(true)
                      setDiscountPercent(customer.membership.discountPercent)
                    } else {
                      setIsMember(false)
                      setDiscountPercent(0)
                    }
                  }}
                />
                {/* Tombol pintas ganti mobil jika pelanggan punya > 1 mobil */}
                {registeredVehicles.length > 1 && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">Mobil lain milik pelanggan ini:</span>
                    {registeredVehicles.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setVehiclePlate(v.plateNumber)
                          setVehicleModel(v.modelName)
                        }}
                        className="flex items-center gap-1 rounded border border-border bg-muted/60 px-2 py-0.5 text-xs hover:border-primary hover:bg-primary/10 transition-colors"
                      >
                        <Car className="size-3 text-primary" />
                        <span className="font-bold">{v.plateNumber}</span>
                        <span className="text-[10px] text-muted-foreground">({v.modelName})</span>
                      </button>
                    ))}
                  </div>
                )}
                <SearchableDropdown
                  label="No. WhatsApp / HP"
                  placeholder="0812xxxxxxxx"
                  value={customerPhone}
                  onChange={(val) => handlePhoneChange(val)}
                  icon={Phone}
                  searchPlaceholder="Cari nomor HP..."
                  options={phoneOptions}
                  onSelect={(c) => {
                    setCustomerPhone(c.phone)
                    setCustomerName(c.name)
                    if (c.membership?.isActive) {
                      setIsMember(true)
                      setDiscountPercent(c.membership.discountPercent)
                    } else {
                      setIsMember(false)
                      setDiscountPercent(0)
                    }
                    const firstVeh = c.vehicles?.[0]
                    if (firstVeh) {
                      setVehiclePlate(firstVeh.plateNumber)
                      setVehicleModel(firstVeh.modelName || 'Mobil Standar')
                    } else if (c.frequentPlate) {
                      setVehiclePlate(c.frequentPlate)
                      setVehicleModel('Mobil Standar')
                    }
                  }}
                />
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
  <div className="flex items-center justify-between mb-1.5">
    <label className="font-semibold block text-foreground">
      Pilih Layanan Cuci & Detailing
    </label>
    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
      <ShoppingBag className="size-3.5 text-primary" />
      Klik <strong>+</strong> atau <strong>-</strong> untuk mengatur jumlah
    </span>
  </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
    {services.map((svc) => {
      const qty = selectedQuantities[svc.id] || 0
      const isSelected = qty > 0
      return (
        <div
          key={svc.id}
          className={`relative rounded-xl border p-3 transition-all flex flex-col justify-between ${
            isSelected
              ? 'border-primary/80 bg-primary/5 shadow-xs ring-1 ring-primary/20'
              : 'border-border/60 hover:border-border/90 bg-card hover:bg-muted/20'
          }`}
        >
          {/* Header Kartu: Nama & Badge Kuantitas */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-sm text-foreground">{svc.name}</p>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                {svc.description}
              </p>
            </div>
            {/* Ikon Indikator Kuantitas Menarik (Muncul jika dipilih) */}
            {isSelected && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold text-primary-foreground shadow-xs animate-in zoom-in-75">
                <PackageCheck className="size-3" />
                {qty}x
              </span>
            )}
          </div>
          {/* Footer Kartu: Harga Satuan & Tombol Stepper Kuantitas */}
          <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-primary font-mono">
                Rp {svc.price.toLocaleString('id-ID')}
              </p>
              {qty > 1 && (
                <p className="text-[10px] text-muted-foreground font-semibold">
                  Total: Rp {(svc.price * qty).toLocaleString('id-ID')}
                </p>
              )}
            </div>
            {/* Stepper Kuantitas: [-] [qty] [+] */}
            {isSelected ? (
              <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-background p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => decreaseQuantity(svc.id)}
                  className="flex size-6 items-center justify-center rounded-md hover:bg-muted text-foreground transition-colors cursor-pointer"
                  title="Kurangi kuantitas"
                >
                  <Minus className="size-3" />
                </button>
                <span className="min-w-[24px] text-center font-extrabold text-xs font-mono text-primary">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => increaseQuantity(svc.id)}
                  className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                  title="Tambah kuantitas"
                >
                  <Plus className="size-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => increaseQuantity(svc.id)}
                className="flex items-center gap-1 rounded-lg border border-border/80 bg-background px-2.5 py-1 text-xs font-semibold text-foreground hover:border-primary hover:bg-primary/5 hover:text-primary transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="size-3" />
                Pilih
              </button>
            )}
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
{/* Tampilkan item terpilih beserta kuantitasnya */}
<div className="border-t border-border/60 pt-2 space-y-1 text-xs">
  {services
    .filter((svc) => (selectedQuantities[svc.id] || 0) > 0)
    .map((svc) => {
      const qty = selectedQuantities[svc.id]
      return (
        <div key={svc.id} className="flex justify-between text-muted-foreground text-[11px]">
          <span>
            {svc.name} <strong className="text-foreground">({qty}x)</strong>:
          </span>
          <span>Rp {(svc.price * qty).toLocaleString('id-ID')}</span>
        </div>
      )
    })}

  <div className="flex justify-between text-muted-foreground pt-1 border-t border-dashed border-border/50">
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
