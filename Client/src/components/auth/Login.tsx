import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Car } from "lucide-react"
interface LoginProps {
  onLoginSuccess: () => void
  onSwitchToRegister: () => void // <-- Tambah prop ini
}

export function Login({ onLoginSuccess,onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      alert('Mohon masukkan email dan password!')
      return
    }

    // pasang api backend user logic disini

    onLoginSuccess()
  }
  

  return (
    <Card className="w-full max-w-sm shadow-xl border-border/80">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <Car className="size-6" />
          </div>
        </div>
        <CardTitle className="text-xl font-bold">CleanWash Pro</CardTitle>
        <CardDescription>
          Masukkan email dan password untuk masuk ke dashboard kasir
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid gap-2 text-left">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@cleanwash.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2 text-left">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                Lupa password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
          </div>
          <div className="text-center pt-1 text-xs text-muted-foreground">
            Belum punya akun?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-semibold text-primary underline-offset-4 hover:underline cursor-pointer"
            >
              Sign Up Disini
            </button>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-2 pt-2">
          <Button type="submit" className="w-full font-semibold">
            Masuk ke Dashboard
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}