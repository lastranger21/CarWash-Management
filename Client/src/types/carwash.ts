export type OrderStatus =
  | 'RECEIVED'
  | 'QUEUED'
  | 'WASHING'
  | 'DRYING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED'

export type PayStatus = 'UNPAID' | 'PAID'

export interface ServiceItem {
  id: number
  name: string
  price: number
  description: string
  durationMinutes: number
  category: 'WASH' | 'DETAIL' | 'INTERIOR' | 'ADDON'
}

export interface OrderRecord {
  id: number
  orderCode: string
  vehiclePlate: string
  vehicleModel: string
  customerName: string
  customerPhone: string
  isMember: boolean
  discountPercent: number
  status: OrderStatus
  paymentStatus: PayStatus
  paymentMethod?: 'CASH' | 'QRIS' | 'TRANSFER' | 'DEBIT'
  subtotal: number
  discount: number
  total: number
  cashReceived?: number
  change?: number
  services: string[]
  bayNumber?: number
  startedAt: string
  staffName: string
}
