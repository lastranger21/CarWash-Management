
import { useState, useMemo, useEffect } from "react"
import type { OrderRecord, OrderStatus } from "@/types/carwash"
import { OrderContext } from "./orderContext"

import { api } from "@/api"
import { useAuth } from "@/hooks/useAuth"

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const {user} = useAuth()
  
  //  Ambil order yang tersimpan dari database backend saat load
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/api/order')
        if (res.data?.data && Array.isArray(res.data.data)) {
          const mappedOrders: OrderRecord[] = res.data.data.map((o: any,index:number) => ({
            id: o.id,
            orderCode: o.orderCode,
            vehiclePlate: o.vehiclePlate,
            vehicleModel: 'Mobil Standar',
            customerName: o.customer?.name || 'Pelanggan',
            customerPhone: o.customer?.phone || '-',
            isMember: o.customer?.membership?.isActive ?? false,
            discountPercent: Number(o.customer?.membership?.discountPercent) || 0,
            status: o.status as OrderStatus,
            paymentStatus: o.paymentStatus,
            paymentMethod: o.payment?.method,
            subtotal: o.subtotal,
            discount: Number(o.discount),
            total: o.total,
            services: o.orderItems?.map((i: any) => 
              i.quantity > 1 ? `${i.service?.name} (${i.quantity}x)` : i.service?.name
            ) || [],
            bayNumber: o.bayNumber || ((index % 4) + 1),
            startedAt: new Date(o.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            staffName: user?.name,
            createdAt: o.createdAt,
          }))
          setOrders(mappedOrders)
        }
      } catch (error) {
        console.warn('Gagal memuat order dari API, log error :', error)
      }
    }

    fetchOrders()
  }, [])

  //  Tambah Order ke Database Backend
  const addOrder = async (newOrder: OrderRecord, apiPayload?: { customerId: number; vehiclePlate: string; items: { serviceId: number; quantity: number }[] }) => {
    // Tampilan optimistik
    setOrders((prev) => [newOrder, ...prev])

    if (apiPayload) {
      try {
        const res = await api.post('/api/order', apiPayload)
        console.log('Order berhasil tersimpan di database:', res.data)
        if (res.data?.data?.id) {
          // Sinkronkan ID 
          setOrders((prev) =>
            prev.map((o) => (o.id === newOrder.id ? { ...o, id: res.data.data.id, orderCode: res.data.data.orderCode } : o))
          )
        }
      } catch (error) {
        console.error('Gagal menyimpan order ke database backend:', error)
      }
    }
  }

  const updateOrderStatus = async (
    orderId: number,
    nextStatus: OrderStatus,
    note?: string
  ): Promise<boolean> => {
    // Simpan status lama untuk rollback jika backend menolak
    const prevOrder = orders.find((o) => o.id === orderId)
    const previousStatus = prevOrder?.status
    // generate content optimistik
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: nextStatus } : order
      )
    )
    //  Kirim request PATCH ke endpoint backend
    try {
      const res = await api.patch(`/api/order/${orderId}/status`, {
        nextStatus,
        note: note || `Status diubah menjadi ${nextStatus}`,
      })
      console.log(`Status order #${orderId} berhasil diperbarui:`, res.data)
      return true
    } catch (error: any) {
      console.error(`Gagal update status order #${orderId} di backend:`, error)
      // Ambil pesan error dari backend 
      const errorMsg =
        error.response?.data?.message || 'Gagal memperbarui status order di server'
      alert(errorMsg)
      //  rollback jika ditolak backend
      if (previousStatus) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: previousStatus } : order
          )
        )
      }
      return false
    }
  }

   const confirmPayment = async (
    orderId: number,
    paymentMethod: 'CASH' | 'QRIS' | 'DEBIT',
    cashReceived?: number,
    change?: number
  ) => {
    //  Update optimistik ui
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, paymentStatus: 'PAID', paymentMethod, cashReceived, change }
          : order
      )
    )
    //  Cari data order  nominal pembayaran
    const targetOrder = orders.find((o) => o.id === orderId)
    const amountToSend =
      paymentMethod === 'CASH' && cashReceived && cashReceived >= (targetOrder?.total || 0)
        ? cashReceived
        : targetOrder?.total || 0
    // kirim ke backend
    try {
      const res = await api.post('/api/payments', {
        orderId: Number(orderId),
        amount: Number(amountToSend),
        method: paymentMethod,
      })
      console.log('Pembayaran berhasil dicatat di backend:', res.data)
    } catch (error) {
      console.error('Gagal mencatat pembayaran ke database:', error)
    }
  }

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
  const carCountToday = useMemo(() => {
    const today = new Date()

    return orders.filter((order) => {
      if (!order.createdAt) return false

      const createdAt = new Date(order.createdAt)
      return (
        createdAt.getFullYear() === today.getFullYear() &&
        createdAt.getMonth() === today.getMonth() &&
        createdAt.getDate() === today.getDate()
      )
    }).length
  }, [orders])
  const updateOrder = (orderId: number, updatedData: Partial<OrderRecord>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updatedData } : o))
    )
  }


  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        updateOrderStatus,
        confirmPayment,
        updateOrder,
        totalRevenue,
        completedCount,
        unpaidCount,
        carCountToday
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}