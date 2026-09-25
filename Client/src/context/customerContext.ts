import { createContext } from 'react'
import type { CustomerItem, CreateCustomerPayload } from '@/types/customer'

export interface CustomerContextType {
  customers: CustomerItem[]
  isLoading: boolean
  addCustomer: (payload: CreateCustomerPayload) => Promise<boolean>
  toggleMembership: (customerId: number) => Promise<boolean>
  updateCustomer: (
    id: number,
    data: {
      name: string
      phone: string
      newVehicle?: { plateNumber: string; modelName?: string }
    }
  ) => Promise<boolean>
  refreshCustomers: () => Promise<void>
}

export const CustomerContext = createContext<CustomerContextType | undefined>(undefined)