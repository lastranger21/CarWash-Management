import{createContext} from "react"
import { type OrderRecord,type OrderStatus } from "@/types/carwash";

export interface OrderRecordContextType{
    orders: OrderRecord[]
  addOrder: (
    newOrder: OrderRecord,
    apiPayload?: {
      customerId: number
      vehiclePlate: string
      items: { serviceId: number; quantity: number }[]
    }
  ) => void
  updateOrderStatus: (orderId: number, nextStatus: OrderStatus, note?: string) =>Promise<boolean> | void
  confirmPayment: (
    orderId: number,
    paymentMethod: 'CASH' | 'QRIS' | 'DEBIT',
    cashReceived?: number,
    change?: number
  ) => void
  updateOrder: (orderId: number, updatedData: Partial<OrderRecord>) => void
  totalRevenue: number
  completedCount: number
  unpaidCount: number
  carCountToday:number

}
export const OrderContext = createContext<OrderRecordContextType |undefined>(undefined) 