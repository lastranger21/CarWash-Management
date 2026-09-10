import { useState } from 'react'
import { Sidebar } from './components/dashboard/Sidebar'
import { Header } from './components/dashboard/Header'
import { StatCards } from './components/dashboard/StatCards'
import { BayMonitor } from './components/dashboard/BayMonitor'
import { RecentOrdersTable } from './components/dashboard/RecentOrdersTable'
import { NewOrderModal } from './components/dashboard/NewOrderModal'
import { INITIAL_SERVICES } from './data/mockData'
import { CustomerPage } from './components/dashboard/Customer'
import { ServicesPage } from './components/dashboard/Service'
import { OrderHistoryPage } from './components/dashboard/HistoryOrder'
import { Login } from './components/auth/Login'
import { Register } from './components/auth/Register'
import { OrderProvider } from './context/orderProvider'
import { useOrder } from './hooks/useOrder'
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
        {authMode === 'login' ? (
          <Login
            onLoginSuccess={() => setIsAuthenticated(true)}
            onSwitchToRegister={() => setAuthMode('register')} 
          />
        ) : (
          <Register
            onRegisterSuccess={() => {
              alert('Pendaftaran akun berhasil! Silakan login.')
              setAuthMode('login') 
            }}
            onSwitchToLogin={() => setAuthMode('login')} // <-- Kembali ke Login
          />
        )}
      </div>
    )
  }
  return (
    <OrderProvider>
      <Dashboard />
    </OrderProvider>
  )
}

function Dashboard() {
  const { orders, addOrder } = useOrder()
  const [services, setServices] = useState(INITIAL_SERVICES)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

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
        onLogout={() => setIsAuthenticated(false)}
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
          <BayMonitor   />

          {/* Bottom Grid: Recent Orders Table & Service Performance */}
              <div className="w-full">
                  <RecentOrdersTable/>
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
        onAddOrder={addOrder}
      />
    </div>
  )
}

export default App
