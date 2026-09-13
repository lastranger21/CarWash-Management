
import type { ServiceItem } from "@/types/carwash"
import{createContext} from "react"

export interface ServiceItemContextType{
    services: ServiceItem[]
  addService: (newService: ServiceItem) => void
  updateService: (serviceId: number, updatedData: Partial<ServiceItem>) => void
    deleteService: (id: number) => void
}
export const ServiceContext = createContext<ServiceItemContextType | undefined>(undefined)