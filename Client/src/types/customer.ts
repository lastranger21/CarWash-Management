// file: Client/src/types/customer.ts

export interface MembershipItem {
  id: number
  memberCode: string
  discountPercent: number
  isActive: boolean
  joinedAt: string
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
}

export interface CreateCustomerPayload {
  name: string
  phone: string
  plate?: string
  registerAsMember?: boolean
}