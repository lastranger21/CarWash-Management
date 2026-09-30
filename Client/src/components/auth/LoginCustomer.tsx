import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Car, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ShieldCheck
} from "lucide-react"
import { useAuth } from '@/hooks/useAuth'

interface LoginCustomerProps {
  onSwitchToStaff?: () => void
}

export function LoginCustomer({ onSwitchToStaff }: LoginCustomerProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form state
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPlate, setRegPlate] = useState('')
  const [regModel, setRegModel] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')

  const { login, registerCustomer } = useAuth()

  // Reset messages when switching tabs
  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab)
    setErrorMsg(null)
    setSuccessMsg(null)
  }

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Mohon isi email dan password Anda.')
      return
    }

    try {
      setIsSubmitting(true)
      const success = await login(loginEmail.trim(), loginPassword)
      if (!success) {
        setErrorMsg('Email atau password salah. Silakan periksa kembali.')
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Gagal masuk. Terjadi kesalahan pada server.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!regName.trim() || !regPhone.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg('Mohon lengkapi seluruh kolom wajib bertanda bintang (*).')
      return
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password minimal harus terdiri dari 6 karakter.')
      return
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok.')
      return
    }

    try {
      setIsSubmitting(true)
      const res = await registerCustomer({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        plateNumber: regPlate.trim() ? regPlate.trim().toUpperCase() : undefined,
        modelName: regModel.trim() || undefined,
      })

      if (res.success) {
        setSuccessMsg('Akun berhasil dibuat! Mengalihkan ke portal pelanggan...')
      } else {
        setErrorMsg(res.message || 'Registrasi gagal. Silakan coba kembali.')
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Terjadi gangguan saat mendaftarkan akun.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col justify-between bg-gradient-to-b from-primary/5 via-background to-muted/30 p-4 sm:p-6 sm:items-center sm:justify-center">
      {/* Container utama: Full width di mobile, terpusat max-w-md di desktop */}
      <div className="mx-auto w-full max-w-md sm:my-8 sm:rounded-3xl sm:border sm:border-border/80 sm:bg-card/95 sm:p-7 sm:shadow-2xl sm:backdrop-blur-sm">
        
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Car className="size-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            CleanWash Pro
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
            Portal Pelanggan • Cuci Mobil & Pantau Antrean
          </p>
        </div>

        {/* Mobile-First Segmented Tab Switcher */}
        <div className="mb-6 grid grid-cols-2 rounded-2xl bg-muted/80 p-1.5 shadow-inner">
          <button
            type="button"
            onClick={() => handleTabChange('login')}
            className={`flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'login'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('register')}
            className={`flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'register'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {/* Alert Error / Success */}
        {errorMsg && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive sm:text-sm animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{errorMsg}</p>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 sm:text-sm animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{successMsg}</p>
          </div>
        )}

        {/* TAB 1: FORM LOGIN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="login-email" className="text-xs font-semibold text-foreground/80 sm:text-sm">
                Email Terdaftar
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="pelanggan@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="h-12 pl-10 rounded-xl bg-background/80 text-sm focus-visible:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password" className="text-xs font-semibold text-foreground/80 sm:text-sm">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="h-12 pl-10 pr-10 rounded-xl bg-background/80 text-sm focus-visible:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-12 w-full rounded-xl text-base font-semibold shadow-md shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                'Memproses Masuk...'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Masuk Sekarang <ArrowRight className="size-4" />
                </span>
              )}
            </Button>

            <div className="pt-2 text-center">
              <p className="text-xs text-muted-foreground">
                Belum punya akun pelanggan?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className="font-bold text-primary hover:underline"
                >
                  Daftar di sini
                </button>
              </p>
            </div>
          </form>
        )}

        {/* TAB 2: FORM REGISTER */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            {/* Nama Lengkap */}
            <div className="space-y-1.5 text-left">
              <Label htmlFor="reg-name" className="text-xs font-semibold text-foreground/80 sm:text-sm">
                Nama Lengkap *
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Contoh: Budi Santoso"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="h-11 pl-10 rounded-xl bg-background/80 text-sm focus-visible:ring-primary"
                  required
                />
              </div>
            </div>

            {/* Nomor WhatsApp / HP */}
            <div className="space-y-1.5 text-left">
              <Label htmlFor="reg-phone" className="text-xs font-semibold text-foreground/80 sm:text-sm">
                Nomor WhatsApp / HP *
              </Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reg-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="081234567890"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="h-11 pl-10 rounded-xl bg-background/80 text-sm focus-visible:ring-primary"
                  required
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Digunakan untuk notifikasi pengerjaan cuci mobil selesai
              </p>
            </div>

            {/* Data Kendaraan (Grid 2 Kolom di Tablet, Stack di HP) */}
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Car className="size-3.5 text-primary" />
                <span>Informasi Kendaraan (Opsional)</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="space-y-1 text-left">
                  <Label htmlFor="reg-plate" className="text-[11px] text-muted-foreground">
                    Nomor Plat
                  </Label>
                  <Input
                    id="reg-plate"
                    placeholder="B 1234 XYZ"
                    value={regPlate}
                    onChange={(e) => setRegPlate(e.target.value.toUpperCase())}
                    className="h-10 rounded-xl bg-background text-sm font-mono uppercase focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <Label htmlFor="reg-model" className="text-[11px] text-muted-foreground">
                    Tipe / Model Mobil
                  </Label>
                  <Input
                    id="reg-model"
                    placeholder="Contoh: Avanza / Civic"
                    value={regModel}
                    onChange={(e) => setRegModel(e.target.value)}
                    className="h-10 rounded-xl bg-background text-sm focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5 text-left">
              <Label htmlFor="reg-email" className="text-xs font-semibold text-foreground/80 sm:text-sm">
                Email Akun *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reg-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="pelanggan@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="h-11 pl-10 rounded-xl bg-background/80 text-sm focus-visible:ring-primary"
                  required
                />
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="space-y-1.5 text-left">
                <Label htmlFor="reg-password" className="text-xs font-semibold text-foreground/80 sm:text-sm">
                  Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="h-10 pl-9 pr-8 rounded-xl bg-background/80 text-xs sm:text-sm focus-visible:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <Label htmlFor="reg-confirm" className="text-xs font-semibold text-foreground/80 sm:text-sm">
                  Konfirmasi *
                </Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="reg-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Ulangi password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="h-10 pl-9 pr-8 rounded-xl bg-background/80 text-xs sm:text-sm focus-visible:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-12 w-full rounded-xl text-base font-semibold shadow-md shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                'Mendaftarkan Akun...'
              ) : (
                <span className="flex items-center justify-center gap-2">
                   Daftar & Mulai Layanan
                </span>
              )}
            </Button>

            <div className="pt-1 text-center">
              <p className="text-xs text-muted-foreground">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className="font-bold text-primary hover:underline"
                >
                  Masuk di sini
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Separator & Switch to Staff / Kasir Login */}
        <div className="mt-8 border-t border-border/60 pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Bukan pelanggan car wash?{' '}
            <button
              type="button"
              onClick={onSwitchToStaff}
              className="font-bold text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              Masuk sebagai Staf / Kasir
            </button>
          </p>
        </div>

      </div>

      {/* Footer Info Mobile */}
      <footer className="mt-4 pb-2 text-center text-[11px] text-muted-foreground sm:mt-0">
        &copy; {new Date().getFullYear()} CleanWash Pro Management. Seluruh hak cipta dilindungi.
      </footer>
    </div>
  )
}