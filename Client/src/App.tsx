import { useState } from 'react'
import { Sidebar } from './components/dashboard/Sidebar'
import { Header } from './components/dashboard/Header'
import { StatCards } from './components/dashboard/StatCards'
import { BayMonitor } from './components/dashboard/BayMonitor'
import { RecentOrdersTable } from './components/dashboard/RecentOrdersTable'
import { NewOrderModal } from './components/dashboard/NewOrderModal'
import { CustomerPage } from './components/dashboard/Customer'
import { ServicesPage } from './components/dashboard/Service'
import { OrderHistoryPage } from './components/dashboard/HistoryOrder'
import { Login } from './components/auth/Login'
import { Register } from './components/auth/Register'
import { OrderProvider } from './context/orderProvider'
import { useOrder } from './hooks/useOrder'
import { useAuth } from './hooks/useAuth'
import { useService } from './hooks/useService'
import { CustomerProvider } from './context/customerProvider'
function App() {
  const { isAuthenticated, isLoading } = useAuth()
  
 if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Memuat...</div>
  }
 if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
        
          <Login  />
        
      </div>
    )
  }
  return (
   <CustomerProvider>
    <OrderProvider>
      <Dashboard />
    </OrderProvider>
    </CustomerProvider>
  )
}

function Dashboard() {
  const { orders, addOrder } = useOrder()
  const { services } = useService()
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isRegister, setIsRegister] = useState(false)


  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewOrder={() => setIsModalOpen(true)}
        isAdmin={isAdmin}
        onOpenRegister={() => setIsRegister(true)}
      />
      
<Register
        isOpen={isRegister}
        onClose={() => setIsRegister(false)}
      />
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        <Header
          onOpenNewOrder={() => setIsModalOpen(true)}
          
          isRefreshing={isRefreshing}
        />
        <main className="flex-1 space-y-6 p-4 md:p-6 lg:p-8 w-full">
 {activeTab === 'dashboard' && (
  <>
        
          {/* Top KPI Metrics */}
          <StatCards orders={orders} />

          {/* Live Bay & Wash Process Monitor */}
          <BayMonitor   />

          {/* Bottom Grid: Recent Orders Table & Service Performance */}
              <div className="w-full">
                  <RecentOrdersTable/>
              </div>
              </>
)}

{activeTab === 'bay' && isAdmin && (
    <OrderHistoryPage orders={orders} />
  )}
{activeTab === 'services' && isAdmin && (
    <ServicesPage />
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
        
      />
    </div>
  )
}

export default App
