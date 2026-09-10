import { useState,useMemo } from "react"
import type { OrderRecord,OrderStatus } from "@/types/carwash"
import { OrderContext } from "./orderContext"
import { INITIAL_ORDERS } from '../data/mockData'
export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_ORDERS)
  const addOrder = (newOrder: OrderRecord) => {
    setOrders((prev) => [newOrder, ...prev])
  }
  const updateOrderStatus = (orderId: number, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: nextStatus } : order
      )
    )
  }
  const confirmPayment = (
    orderId: number,
    paymentMethod: 'CASH' | 'QRIS' | 'DEBIT',
    cashReceived?: number,
    change?: number
  ) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, paymentStatus: 'PAID', paymentMethod, cashReceived, change }
          : order
      )
    )
  }
  // Pre-calculated stats (no need to recalculate in multiple components)
  const totalRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.paymentStatus === 'PAID')
        .reduce((sum, o) => sum + o.total, 0),
    [orders]
  )
  const completedCount = useMemo(
    () => orders.filter((o) => o.status === 'COMPLETED').length,
    [orders]
  )
  const unpaidCount = useMemo(
    () => orders.filter((o) => o.paymentStatus === 'UNPAID').length,
    [orders]
  )
  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        updateOrderStatus,
        confirmPayment,
        totalRevenue,
        completedCount,
        unpaidCount,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}
