import { useState } from 'react'
import {
  Users,
  Award,
  Search,
  Plus,
  Phone,
  Calendar,
  ExternalLink,
  Sparkles,
  XCircle,
  X,
  History,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

// 1. Tipe Data disesuaikan dengan Model Customer & Membership Prisma
export interface CustomerItem {
  id: number
  name: string
  phone: string
  createdAt: string
  frequentPlate: string
  totalWashes: number
  totalSpent: number
  lastVisit: string
  // Data Membership (Relasi 1-to-1 opsional)
  membership?: {
    id: number
    memberCode: string
    discountPercent: number
    isActive: boolean
    joinedAt: string
  }
}

// 2. Data Awal Mock
const INITIAL_CUSTOMERS: CustomerItem[] = [
  {
    id: 1,
    name: 'Budi Santoso',
    phone: '081234567890',
    createdAt: '10 Jan 2026',
    frequentPlate: 'B 1492 ABC',
    totalWashes: 14,
    totalSpent: 945000,
    lastVisit: 'Hari ini, 08:15',
    membership: {
      id: 101,
      memberCode: 'MBR-2026-001',
      discountPercent: 10,
      isActive: true,
      joinedAt: '12 Jan 2026',
    },
  },
  {
    id: 2,
    name: 'Siti Rahma',
    phone: '081987654321',
    createdAt: '01 Feb 2026',
    frequentPlate: 'B 3012 WXY',
    totalWashes: 8,
    totalSpent: 620000,
    lastVisit: 'Hari ini, 08:05',
    membership: {
      id: 102,
      memberCode: 'MBR-2026-015',
      discountPercent: 15,
      isActive: true,
      joinedAt: '03 Feb 2026',
    },
  },
  {
    id: 3,
    name: 'Ahmad Fauzi',
    phone: '085712344321',
    createdAt: '15 Feb 2026',
    frequentPlate: 'D 8821 ZYX',
    totalWashes: 3,
    totalSpent: 285000,
    lastVisit: 'Hari ini, 08:30',
    // Tidak memiliki membership (Reguler)
  },
  {
    id: 4,
    name: 'Maya Kusuma',
    phone: '081344556677',
    createdAt: '20 Jan 2026',
    frequentPlate: 'F 4421 CD',
    totalWashes: 6,
    totalSpent: 405000,
    lastVisit: 'Kemarin',
    membership: {
      id: 103,
      memberCode: 'MBR-2026-008',
      discountPercent: 10,
      isActive: true,
      joinedAt: '25 Jan 2026',
    },
  },
  {
    id: 5,
    name: 'Hendro Wijaya',
    phone: '082199887766',
    createdAt: '01 Mar 2026',
    frequentPlate: 'B 9918 TAA',
    totalWashes: 2,
    totalSpent: 100000,
    lastVisit: 'Hari ini, 08:50',
    membership: {
      id: 104,
      memberCode: 'MBR-2026-099',
      discountPercent: 10,
      isActive: false, // Member dinonaktifkan
      joinedAt: '05 Mar 2026',
    },
  },
]

export function CustomerPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>(INITIAL_CUSTOMERS)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE_MEMBER' | 'REGULAR' | 'INACTIVE_MEMBER'>('ALL')
  
  // State Modal Tambah Customer / Member Baru
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newPlate, setNewPlate] = useState('')
  const [registerAsMember, setRegisterAsMember] = useState(true)

  // State Modal Detail Riwayat Customer
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null)

  // Statistik Ringkasan
  const totalCustomers = customers.length
  const activeMembers = customers.filter((c) => c.membership?.isActive).length
  const regularCustomers = customers.filter((c) => !c.membership).length
  const inactiveMembers = customers.filter((c) => c.membership && !c.membership.isActive).length

  // Filter Data
  const filteredCustomers = customers.filter((cust) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      cust.name.toLowerCase().includes(term) ||
      cust.phone.includes(term) ||
      cust.frequentPlate.toLowerCase().includes(term) ||
      (cust.membership?.memberCode.toLowerCase().includes(term) ?? false)

    if (!matchesSearch) return false

    if (statusFilter === 'ACTIVE_MEMBER') return cust.membership?.isActive === true
    if (statusFilter === 'REGULAR') return !cust.membership
    if (statusFilter === 'INACTIVE_MEMBER') return cust.membership && !cust.membership.isActive
    return true
  })

  // Fungsi Toggle Status Membership (Aktif / Nonaktif / Daftar Baru)
  const handleToggleMembership = (customerId: number) => {
    setCustomers((prev) =>
      prev.map((cust) => {
        if (cust.id !== customerId) return cust

        if (!cust.membership) {
          // Jika belum member, daftarkan jadi member aktif
          const randomCode = Math.floor(100 + Math.random() * 900)
          return {
            ...cust,
            membership: {
              id: Date.now(),
              memberCode: `MBR-2026-${randomCode}`,
              discountPercent: 10,
              isActive: true,
              joinedAt: new Date().toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }),
            },
          }
        } else {
          // Jika sudah punya membership, ubah status aktif/nonaktifnya
          return {
            ...cust,
            membership: {
              ...cust.membership,
              isActive: !cust.membership.isActive,
            },
          }
        }
      })
    )
  }

  // Fungsi Submit Tambah Pelanggan Baru
  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newPhone.trim()) {
      alert('Nama dan Nomor HP wajib diisi!')
      return
    }

    const randomCode = Math.floor(100 + Math.random() * 900)
    const newCustomer: CustomerItem = {
      id: Date.now(),
      name: newName.trim(),
      phone: newPhone.trim(),
      createdAt: 'Hari ini',
      frequentPlate: newPlate.toUpperCase().trim() || 'B 0000 XXX',
      totalWashes: 0,
      totalSpent: 0,
      lastVisit: 'Belum pernah',
      membership: registerAsMember
        ? {
            id: Date.now() + 1,
            memberCode: `MBR-2026-${randomCode}`,
            discountPercent: 10,
            isActive: true,
            joinedAt: 'Hari ini',
          }
        : undefined,
    }

    setCustomers([newCustomer, ...customers])
    setNewName('')
    setNewPhone('')
    setNewPlate('')
    setIsAddModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* 1. KARTU STATISTIK RINGKASAN */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Total Pelanggan
              </p>
              <h3 className="text-2xl font-bold mt-1 tracking-tight">{totalCustomers} Orang</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Database CRM Car Wash</p>
            </div>
            <div className="rounded-xl p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Member Aktif
              </p>
              <h3 className="text-2xl font-bold mt-1 tracking-tight text-purple-600 dark:text-purple-400">
                {activeMembers} Member
              </h3>
              <p className="text-xs text-emerald-600 font-medium mt-0.5">
                Otomatis diskon 10% - 15%
              </p>
            </div>
            <div className="rounded-xl p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Award className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Pelanggan Reguler
              </p>
              <h3 className="text-2xl font-bold mt-1 tracking-tight">{regularCustomers} Orang</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Tanpa keanggotaan</p>
            </div>
            <div className="rounded-xl p-3 bg-neutral-500/10 text-neutral-600 dark:text-neutral-400">
              <Sparkles className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Member Non-Aktif
              </p>
              <h3 className="text-2xl font-bold mt-1 tracking-tight text-amber-600 dark:text-amber-400">
                {inactiveMembers} Member
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Masa aktif habis / ditangguhkan</p>
            </div>
            <div className="rounded-xl p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <XCircle className="size-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. TABEL PELANGGAN & STATUS MEMBER */}
      <Card>
        <CardHeader className="p-5 pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Data Pelanggan & Status Keanggotaan</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Kelola status keanggotaan, diskon tarif, kontak WhatsApp, dan histori kendaraan
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Cari Nama, No WA, Plat, atau Kode Member..."
                  className="pl-8 text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Button
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="gap-1.5 text-xs font-semibold shrink-0"
              >
                <Plus className="size-4" />
                Tambah Pelanggan
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/50 pt-3 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              Semua ({totalCustomers})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE_MEMBER')}
              className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                statusFilter === 'ACTIVE_MEMBER'
                  ? 'bg-purple-600 text-white'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              Member Aktif ({activeMembers})
            </button>
            <button
              onClick={() => setStatusFilter('REGULAR')}
              className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                statusFilter === 'REGULAR'
                  ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              Reguler ({regularCustomers})
            </button>
            <button
              onClick={() => setStatusFilter('INACTIVE_MEMBER')}
              className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                statusFilter === 'INACTIVE_MEMBER'
                  ? 'bg-amber-600 text-white'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              Non-Aktif ({inactiveMembers})
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full overflow-hidden">
            <table className="w-full table-auto text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-y border-border/60">
                <tr>
                  <th className="px-5 py-3 font-semibold">Nama Pelanggan</th>
                  <th className="px-4 py-3 font-semibold">No. WhatsApp</th>
                  <th className="px-4 py-3 font-semibold">Status Membership</th>
                  <th className="px-4 py-3 font-semibold">Kode Member</th>
                  <th className="px-4 py-3 font-semibold">Plat Utama</th>
                  <th className="px-4 py-3 font-semibold text-center">Total Kunjungan</th>
                  <th className="px-4 py-3 font-semibold text-right">Total Belanja</th>
                  <th className="px-5 py-3 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      Data pelanggan tidak ditemukan
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-muted/30 transition-colors">
                      {/* Nama & Tgl Gabung */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs uppercase">
                            {cust.name.substring(0, 2)}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground text-sm block">
                              {cust.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Calendar className="size-3" /> Sejak {cust.createdAt}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* No. WhatsApp (Klik untuk Chat) */}
                      <td className="px-4 py-3">
                        <a
                          href={`https://wa.me/62${cust.phone.replace(/^0/, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-foreground hover:text-emerald-600 font-mono transition-colors"
                          title="Buka Chat WhatsApp"
                        >
                          <Phone className="size-3 text-emerald-600" />
                          <span>{cust.phone}</span>
                          <ExternalLink className="size-2.5 text-muted-foreground" />
                        </a>
                      </td>

                      {/* Status Membership */}
                      <td className="px-4 py-3">
                        {cust.membership ? (
                          cust.membership.isActive ? (
                            <Badge variant="purple" className="gap-1 font-semibold">
                              <Award className="size-3" /> Member ({cust.membership.discountPercent}%)
                            </Badge>
                          ) : (
                            <Badge variant="warning" className="gap-1">
                              <XCircle className="size-3" /> Non-Aktif
                            </Badge>
                          )
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Reguler
                          </Badge>
                        )}
                      </td>

                      {/* Kode Member */}
                      <td className="px-4 py-3 font-mono text-xs font-semibold">
                        {cust.membership?.memberCode ? (
                          <span className="rounded-md bg-muted/60 px-2 py-0.5 border border-border/80">
                            {cust.membership.memberCode}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>

                      {/* Plat Kendaraan Utama */}
                      <td className="px-4 py-3">
                        <span className="inline-block rounded bg-neutral-900 px-2 py-0.5 font-mono text-xs font-bold text-white tracking-wider dark:border dark:border-neutral-700">
                          {cust.frequentPlate}
                        </span>
                      </td>

                      {/* Total Kunjungan */}
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-foreground">{cust.totalWashes}x</span>
                        <span className="block text-[10px] text-muted-foreground">
                          {cust.lastVisit}
                        </span>
                      </td>

                      {/* Total Belanja */}
                      <td className="px-4 py-3 text-right font-bold text-foreground">
                        Rp {cust.totalSpent.toLocaleString('id-ID')}
                      </td>

                      {/* Tombol Aksi */}
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Tombol Toggle Membership */}
                          <Button
                            size="xs"
                            variant={cust.membership?.isActive ? 'outline' : 'default'}
                            className={`text-xs font-semibold ${
                              !cust.membership
                                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                : cust.membership.isActive
                                ? 'border-amber-500/40 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                            onClick={() => handleToggleMembership(cust.id)}
                          >
                            {!cust.membership
                              ? '+ Jadikan Member'
                              : cust.membership.isActive
                              ? 'Nonaktifkan'
                              : 'Aktifkan Kembali'}
                          </Button>

                          {/* Tombol Lihat Detail / Riwayat */}
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            title="Lihat Profil & Riwayat"
                            onClick={() => setSelectedCustomer(cust)}
                          >
                            <History className="size-3.5 text-muted-foreground" />
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

      {/* 3. MODAL TAMBAH PELANGGAN / MEMBER BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md">
            <Card className="border-border bg-card shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  Tambah Pelanggan Baru
                </CardTitle>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </CardHeader>

              <form onSubmit={handleAddCustomerSubmit}>
                <CardContent className="p-5 space-y-3.5 text-xs">
                  <div>
                    <label className="font-semibold block mb-1">
                      Nama Lengkap <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Contoh: Budi Santoso"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">
                      No. WhatsApp / HP <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Contoh: 081234567890"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Plat Kendaraan Utama</label>
                    <Input
                      placeholder="Contoh: B 1234 ABC"
                      className="uppercase font-mono font-semibold"
                      value={newPlate}
                      onChange={(e) => setNewPlate(e.target.value)}
                    />
                  </div>

                  {/* Checklist Langsung Daftarkan Member */}
                  <div className="flex items-center justify-between rounded-xl border border-purple-500/30 bg-purple-500/5 p-3 mt-2">
                    <div>
                      <p className="font-bold text-foreground flex items-center gap-1.5">
                        <Award className="size-4 text-purple-600" />
                        Daftarkan Sebagai Member
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Mendapatkan kode member & diskon 10% di setiap pencucian
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={registerAsMember}
                      onChange={(e) => setRegisterAsMember(e.target.checked)}
                      className="size-4 rounded accent-purple-600"
                    />
                  </div>
                </CardContent>

                <div className="flex items-center justify-end gap-2 border-t border-border/60 p-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" size="sm" className="font-semibold">
                    Simpan Pelanggan
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* 4. MODAL DETAIL PROFIL & KARTU DIGITAL MEMBER */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md">
            <Card className="border-border bg-card shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  Profil & Kartu Member
                </CardTitle>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </CardHeader>

              <CardContent className="p-5 space-y-4 text-xs">
                {/* Visual Kartu Digital Member (Jika Member Aktif) */}
                {selectedCustomer.membership?.isActive ? (
                  <div className="rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-purple-950 p-5 text-white shadow-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold">
                          CleanWash Loyalty Card
                        </span>
                        <h4 className="text-base font-bold tracking-tight">
                          {selectedCustomer.name}
                        </h4>
                      </div>
                      <Badge variant="purple" className="bg-purple-500/30 text-purple-200 border-purple-400/40">
                        DISCOUNT {selectedCustomer.membership.discountPercent}%
                      </Badge>
                    </div>

                    <div className="flex justify-between items-end pt-3 border-t border-neutral-700/60">
                      <div>
                        <p className="text-[10px] text-neutral-400">Kode Member</p>
                        <p className="font-mono text-sm font-bold tracking-wider">
                          {selectedCustomer.membership.memberCode}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-neutral-400">Bergabung</p>
                        <p className="text-xs font-semibold">
                          {selectedCustomer.membership.joinedAt}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-4 text-center text-muted-foreground">
                    <p className="font-semibold text-foreground">Pelanggan Reguler</p>
                    <p className="text-[11px] mt-0.5">Belum mengaktifkan keanggotaan member.</p>
                  </div>
                )}

                {/* Ringkasan Histori */}
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nomor WhatsApp:</span>
                    <span className="font-semibold font-mono">{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plat Kendaraan:</span>
                    <span className="font-semibold font-mono">{selectedCustomer.frequentPlate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Pencucian:</span>
                    <span className="font-bold text-foreground">{selectedCustomer.totalWashes} Kali</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Akumulasi Belanja:</span>
                    <span className="font-bold text-emerald-600">
                      Rp {selectedCustomer.totalSpent.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </CardContent>

              <div className="flex justify-end p-4 border-t border-border/60">
                <Button size="sm" variant="outline" onClick={() => setSelectedCustomer(null)}>
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