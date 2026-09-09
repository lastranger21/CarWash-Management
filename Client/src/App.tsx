import { useState } from 'react'
import { Sidebar } from './components/dashboard/Sidebar'
import { Header } from './components/dashboard/Header'
import { StatCards } from './components/dashboard/StatCards'
import { BayMonitor } from './components/dashboard/BayMonitor'
import { RecentOrdersTable } from './components/dashboard/RecentOrdersTable'
import { NewOrderModal } from './components/dashboard/NewOrderModal'
import { INITIAL_ORDERS, INITIAL_SERVICES } from './data/mockData'
import { type OrderRecord, type OrderStatus } from './types/carwash'
import { CustomerPage } from './components/dashboard/Customer'
import { ServicesPage } from './components/dashboard/Service'
import { OrderHistoryPage } from './components/dashboard/HistoryOrder'
function App() {
  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_ORDERS)
  const [services,setServices] = useState(INITIAL_SERVICES)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleAddOrder = (newOrder: OrderRecord) => {
    setOrders((prev) => [newOrder, ...prev])
  }

  const handleUpdateStatus = (orderId: number, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: nextStatus,
          }
        }
        return order
      })
    )
  }

  const handleConfirmPayment = (
    orderId: number,
    paymentMethod: 'CASH' | 'QRIS' | 'DEBIT',
    cashReceived?: number,
    change?: number
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            paymentStatus: 'PAID',
            paymentMethod,
            cashReceived,
            change,
          }
        }
        return order
      })
    )
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 600)
  }

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewOrder={() => setIsModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        <Header
          onOpenNewOrder={() => setIsModalOpen(true)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        <main className="flex-1 space-y-6 p-4 md:p-6 lg:p-8 w-full">
 {activeTab === 'dashboard' && (
  <>
        
          {/* Top KPI Metrics */}
          <StatCards orders={orders} />

          {/* Live Bay & Wash Process Monitor */}
          <BayMonitor orders={orders} onUpdateStatus={handleUpdateStatus} />

          {/* Bottom Grid: Recent Orders Table & Service Performance */}
              <div className="w-full">
                  <RecentOrdersTable
                        orders={orders}
                        onConfirmPayment={handleConfirmPayment}
                        onUpdateStatus={handleUpdateStatus}
                  />
              </div>
              </>
)}

{activeTab === 'bay' && (
    <OrderHistoryPage orders={orders} />
  )}
{activeTab === 'services' && (
    <ServicesPage services={services} setServices={setServices} />
  )}

            
          {/* TAMPILAN HALAMAN PELANGGAN & MEMBER */}
  {activeTab === 'customers' && (
    <CustomerPage />
  )}
        </main>
      </div>

      {/* POS Modal for New Order */}
      <NewOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        services={services}
        onAddOrder={handleAddOrder}
      />
    </div>
  )
}

export default App
