// file: Client/src/types/customer.ts

export interface MembershipItem {
  id: number
  memberCode: string
  discountPercent: number
  isActive: boolean
  joinedAt: string
}
export interface VehicleItem {
  id: number
  plateNumber: string
  modelName: string
  type?: string
}

export interface CustomerItem {
  id: number
  name: string
  phone: string
  createdAt: string
  frequentPlate: string    
  totalWashes: number      
  totalSpent: number       
  lastVisit: string        
  membership?: MembershipItem
  vehicles?: VehicleItem[]
}

export interface CreateCustomerPayload {
  name: string
  phone: string
  plate?: string
  registerAsMember?: boolean
}