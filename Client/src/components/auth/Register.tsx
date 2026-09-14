import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
 
  CardTitle,
} from "@/components/ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { UserPlus,X } from "lucide-react"
import { useAuth } from '@/hooks/useAuth'
interface RegisterProps {
  isOpen: boolean
  onClose: () => void
  
}

export function Register({isOpen, onClose }: RegisterProps,) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading,setIsLoading] = useState(false)
  const {register} = useAuth()
  if (!isOpen) return null
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      alert('Mohon masukkan email dan password!')
      return
    }

    // fetch api user
    
     try {
      
      const success = await register(name, email, password)
      if (success) {
        alert(`Akun staf/admin (${name}) berhasil didaftarkan!`)

        onClose()
      } else {
        alert('Gagal mendaftarkan akun. Periksa email atau koneksi server.')
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md">
        <Card className="border-border bg-card shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <UserPlus className="size-5 text-primary" />
                Daftarkan Staf / Kasir Baru
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tambahkan akun pengguna baru untuk operasional car wash
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Nama Lengkap</Label>
                <Input
                  placeholder="Contoh: Rian Anggara"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  placeholder="rian@carwash.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Password Awal</Label>
                <Input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t border-border/60 pt-3">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={isLoading}>
                {isLoading ? 'Mendaftarkan...' : 'Daftarkan Akun'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}