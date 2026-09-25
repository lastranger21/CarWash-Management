import { useState, useEffect } from 'react'
import { X, Pencil,UserCog, Car, Sparkles, Plus, Minus,User,Phone,Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { type OrderRecord } from '../../types/carwash'
import { useService } from '@/hooks/useService'
import { useOrder } from '@/hooks/useOrder'
import { api } from '@/api'
import { useCustomer } from '@/hooks/useCustomer'
import type { CustomerItem } from '@/types/customer'

interface EditCustomerProps {
  isOpen: boolean
  onClose: () => void
  customer: CustomerItem | null
}
export function EditCustomer({ isOpen, onClose, customer }: EditCustomerProps)  {
    const { updateCustomer } = useCustomer()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [newPlate, setNewPlate] = useState('')
  const [newModel, setNewModel] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Isi data awal saat modal dibuka
  useEffect(() => {
    if (customer) {
      setName(customer.name || '')
      setPhone(customer.phone || '')
      setNewPlate('')
      setNewModel('')
    }
  }, [customer])
  if (!isOpen || !customer) return null
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) {
      alert('Nama dan No. WhatsApp wajib diisi!')
      return
    }
    setIsSubmitting(true)
    try {
      const payload: {
        name: string
        phone: string
        newVehicle?: { plateNumber: string; modelName: string }
      } = {
        name: name.trim(),
        phone: phone.trim(),
      }
      // Jika ada input plat baru
      if (newPlate.trim()) {
        payload.newVehicle = {
          plateNumber: newPlate.toUpperCase().trim(),
          modelName: newModel.trim() || 'Mobil Standar',
        }
      }
      const success = await updateCustomer(customer.id, payload)
      if (success) {
        onClose()
      } else {
        alert('Gagal memperbarui data pelanggan.')
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg">
        <Card className="border-border bg-card shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <UserCog className="size-4 text-primary" />
              Edit Data Pelanggan & Kendaraan
            </CardTitle>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 py-4 text-xs">
              {/* Data Utama */}
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold block mb-1">
                    Nama Pelanggan <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3 size-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama lengkap"
                      required
                      className="pl-8"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold block mb-1">
                    No. WhatsApp / HP <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3 size-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0812xxxxxxxx"
                      required
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
              {/* Daftar Kendaraan yang Sudah Ada */}
              <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
                <Label className="text-[11px] font-semibold text-muted-foreground block mb-2">
                  Kendaraan Terdaftar Saat Ini:
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {customer.vehicles && customer.vehicles.length > 0 ? (
                    customer.vehicles.map((v:any) => (
                      <div
                        key={v.id}
                        className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs shadow-xs"
                      >
                        <Car className="size-3 text-primary" />
                        <span className="font-mono font-bold text-foreground">{v.plateNumber}</span>
                        <span className="text-[10px] text-muted-foreground">({v.modelName})</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs italic text-muted-foreground">
                      {customer.frequentPlate && customer.frequentPlate !== 'Belum Ada'
                        ? `Plat default: ${customer.frequentPlate}`
                        : 'Belum ada kendaraan terdaftar'}
                    </span>
                  )}
                </div>
              </div>
              {/* Tambah Kendaraan Baru (Opsional) */}
              <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Plus className="size-3.5" />
                  Tambah Kendaraan Baru (Opsional)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] text-muted-foreground mb-1 block">
                      Nomor Plat Baru
                    </Label>
                    <Input
                      placeholder="B 1234 XYZ"
                      value={newPlate}
                      onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                      className="font-mono text-xs uppercase"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground mb-1 block">
                      Model / Jenis Mobil
                    </Label>
                    <Input
                      placeholder="Contoh: Innova, Avanza, Brio"
                      value={newModel}
                      onChange={(e) => setNewModel(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  *Kosongkan jika hanya ingin mengubah nama atau nomor HP.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t border-border/60 pt-3">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5">
                <Check className="size-3.5" />
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}