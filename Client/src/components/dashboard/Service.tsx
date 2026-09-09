import { useState } from 'react'
import {
  Sparkles,
  Plus,
  Search,
  Clock,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Tag,
  Layers,
  Car,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { type ServiceItem } from '../../types/carwash'

interface ServicesPageProps {
  services: ServiceItem[]
  setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>
}

export function ServicesPage({ services, setServices }: ServicesPageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  // State Modal Form (Tambah / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [durationMinutes, setDurationMinutes] = useState<number | ''>(25)
  const [category, setCategory] = useState<'WASH' | 'DETAIL' | 'INTERIOR' | 'ADDON'>('WASH')
  const [description, setDescription] = useState('')

  // Buka Modal Tambah Baru
  const handleOpenAddModal = () => {
    setEditingServiceId(null)
    setName('')
    setPrice('')
    setDurationMinutes(30)
    setCategory('WASH')
    setDescription('')
    setIsModalOpen(true)
  }

  // Buka Modal Edit Layanan
  const handleOpenEditModal = (item: ServiceItem) => {
    setEditingServiceId(item.id)
    setName(item.name)
    setPrice(item.price)
    setDurationMinutes(item.durationMinutes)
    setCategory(item.category)
    setDescription(item.description)
    setIsModalOpen(true)
  }

  // Simpan Layanan (Tambah Baru / Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || price === '' || Number(price) <= 0) {
      alert('Mohon isi nama layanan dan harga yang valid!')
      return
    }

    if (editingServiceId !== null) {
      // Mode Edit
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingServiceId
            ? {
                ...s,
                name: name.trim(),
                price: Number(price),
                durationMinutes: Number(durationMinutes) || 20,
                category,
                description: description.trim(),
              }
            : s
        )
      )
    } else {
      // Mode Tambah Baru
      const newService: ServiceItem = {
        id: Date.now(),
        name: name.trim(),
        price: Number(price),
        durationMinutes: Number(durationMinutes) || 20,
        category,
        description: description.trim() || 'Layanan cuci kendaraan',
      }
      setServices((prev) => [newService, ...prev])
    }

    setIsModalOpen(false)
  }

  // Hapus Layanan
  const handleDeleteService = (id: number, serviceName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus layanan "${serviceName}"?`)) {
      setServices((prev) => prev.filter((s) => s.id !== id))
    }
  }

  // Filter Layanan
  const filteredServices = services.filter((svc) => {
    const matchesSearch =
      svc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      svc.description.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false
    if (selectedCategory !== 'ALL' && svc.category !== selectedCategory) return false
    return true
  })

  // Label Kategori
  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'WASH':
        return <Badge variant="info">Cuci Bodi / Kolong</Badge>
      case 'INTERIOR':
        return <Badge variant="purple">Interior & Vacuum</Badge>
      case 'DETAIL':
        return <Badge variant="warning">Detailing & Polish</Badge>
      case 'ADDON':
        return <Badge variant="secondary">Add-on Tambahan</Badge>
      default:
        return <Badge variant="outline">{cat}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Tombol Tambah */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Manajemen Paket & Layanan Cuci
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daftar tarif layanan cuci, detailing, dan paket komplit yang tampil di kasir POS
          </p>
        </div>

        <Button onClick={handleOpenAddModal} size="sm" className="gap-1.5 font-semibold shrink-0">
          <Plus className="size-4" />
          Tambah Layanan Baru
        </Button>
      </div>

      {/* 2. Filter & Pencarian */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama layanan atau deskripsi..."
                className="pl-8 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                  selectedCategory === 'ALL'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                Semua ({services.length})
              </button>
              <button
                onClick={() => setSelectedCategory('WASH')}
                className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                  selectedCategory === 'WASH'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                Cuci ({services.filter((s) => s.category === 'WASH').length})
              </button>
              <button
                onClick={() => setSelectedCategory('INTERIOR')}
                className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                  selectedCategory === 'INTERIOR'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                Interior ({services.filter((s) => s.category === 'INTERIOR').length})
              </button>
              <button
                onClick={() => setSelectedCategory('DETAIL')}
                className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                  selectedCategory === 'DETAIL'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                Detailing ({services.filter((s) => s.category === 'DETAIL').length})
              </button>
              <button
                onClick={() => setSelectedCategory('ADDON')}
                className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                  selectedCategory === 'ADDON'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                Add-on ({services.filter((s) => s.category === 'ADDON').length})
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Grid Kartu Layanan */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredServices.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <Layers className="size-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm font-medium">Tidak ada layanan yang sesuai</p>
            <p className="text-xs text-muted-foreground mt-1">
              Coba gunakan kata kunci pencarian atau kategori lain
            </p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <Card
              key={service.id}
              className="flex flex-col justify-between hover:border-primary/50 transition-all shadow-xs"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  {getCategoryBadge(service.category)}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span>~{service.durationMinutes} menit</span>
                  </div>
                </div>
                <CardTitle className="text-base font-bold mt-2 text-foreground">
                  {service.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                  {service.description}
                </p>
              </CardHeader>

              <CardContent className="p-5 pt-0">
                <div className="border-t border-border/60 pt-3 mt-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      Tarif Kasir
                    </span>
                    <h4 className="text-lg font-extrabold text-primary font-mono">
                      Rp {service.price.toLocaleString('id-ID')}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="icon-xs"
                      variant="outline"
                      title="Edit Layanan"
                      onClick={() => handleOpenEditModal(service)}
                    >
                      <Edit3 className="size-3.5" />
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Hapus Layanan"
                      onClick={() => handleDeleteService(service.id, service.name)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 4. MODAL FORM: TAMBAH / EDIT LAYANAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-4 sm:p-6 flex justify-center items-start">
          <div className="relative w-full max-w-lg my-8">
            <Card className="border-border bg-card shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Tag className="size-4 text-primary" />
                  {editingServiceId !== null ? 'Edit Layanan' : 'Tambah Layanan Baru'}
                </CardTitle>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="p-5 space-y-3.5 text-xs">
                  {/* Nama Layanan */}
                  <div>
                    <label className="font-semibold block mb-1 text-foreground">
                      Nama Layanan / Paket <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Contoh: Cuci Salju + Engine Clean"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Kategori & Durasi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold block mb-1 text-foreground">
                        Kategori Layanan
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs shadow-xs focus:ring-2 focus:ring-ring"
                      >
                        <option value="WASH">Cuci Bodi & Kolong (WASH)</option>
                        <option value="INTERIOR">Interior & Vacuum</option>
                        <option value="DETAIL">Detailing & Polish</option>
                        <option value="ADDON">Add-on / Tambahan</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold block mb-1 text-foreground">
                        Estimasi Waktu (Menit)
                      </label>
                      <Input
                        type="number"
                        min={5}
                        placeholder="Contoh: 30"
                        value={durationMinutes}
                        onChange={(e) =>
                          setDurationMinutes(e.target.value ? Number(e.target.value) : '')
                        }
                      />
                    </div>
                  </div>

                  {/* Tarif Harga */}
                  <div>
                    <label className="font-semibold block mb-1 text-foreground">
                      Tarif Harga (Rp) <span className="text-destructive">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-muted-foreground text-sm">Rp</span>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Contoh: 50000"
                        value={price}
                        onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                        required
                        className="font-bold font-mono text-sm"
                      />
                    </div>
                  </div>

                  {/* Deskripsi */}
                  <div>
                    <label className="font-semibold block mb-1 text-foreground">
                      Deskripsi Pengerjaan
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Jelaskan apa saja yang didapatkan oleh pelanggan dalam paket ini..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-2.5 text-xs shadow-xs focus:ring-2 focus:ring-ring resize-none"
                    />
                  </div>
                </CardContent>

                <div className="flex items-center justify-end gap-2 border-t border-border/60 p-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" size="sm" className="font-semibold">
                    {editingServiceId !== null ? 'Simpan Perubahan' : 'Tambah Layanan'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}