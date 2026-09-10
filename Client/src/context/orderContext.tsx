import{createContext} from "react"
import { type OrderRecord,type OrderStatus } from "@/types/carwash";

export interface OrderRecordContextType{
    orders: OrderRecord[]
  addOrder: (newOrder: OrderRecord) => void
  updateOrderStatus: (orderId: number, nextStatus: OrderStatus) => void
  confirmPayment: (
    orderId: number,
    paymentMethod: 'CASH' | 'QRIS' | 'DEBIT',
    cashReceived?: number,
    change?: number
  ) => void
  totalRevenue: number
  completedCount: number
  unpaidCount: number
}
export const OrderContext = createContext<OrderRecordContextType |undefined>(undefined) 