export interface CustomerVehicle {
  id: number
  plateNumber: string
  modelName?: string
}

export interface CustomerProfile {
  id: number
  name: string
  phone: string
  vehicles?: CustomerVehicle[]
  membership?: {
    id: number
    memberCode: string
    discountPercent: number
    isActive: boolean
  } | null
}

export interface AuthUser {
  id: number
  name: string
  email: string
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER'
  customer?: CustomerProfile | null
}