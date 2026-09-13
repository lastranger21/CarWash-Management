import React, { useState, useEffect, useCallback } from 'react'
import { CustomerContext } from './customerContext'
import type { CustomerItem, CreateCustomerPayload } from '@/types/customer'
import { api } from '@/api'

// data dummy
const FALLBACK_CUSTOMERS: CustomerItem[] = [
  {
    id: 1,
    name: 'Budi Santoso',
    phone: '081234567890',
    createdAt: '10 Jan 2026',
    frequentPlate: 'B 1492 ABC',
    totalWashes: 14,
    totalSpent: 945000,
    lastVisit: 'Hari ini, 08:15',
    membership: {
      id: 101,
      memberCode: 'MBR-2026-001',
      discountPercent: 10,
      isActive: true,
      joinedAt: '12 Jan 2026',
    },
  },
  {
    id: 2,
    name: 'Siti Rahma',
    phone: '081987654321',
    createdAt: '01 Feb 2026',
    frequentPlate: 'B 3012 WXY',
    totalWashes: 8,
    totalSpent: 620000,
    lastVisit: 'Hari ini, 08:05',
    membership: {
      id: 102,
      memberCode: 'MBR-2026-015',
      discountPercent: 15,
      isActive: true,
      joinedAt: '03 Feb 2026',
    },
  },
  {
    id: 3,
    name: 'Ahmad Fauzi',
    phone: '085712344321',
    createdAt: '15 Feb 2026',
    frequentPlate: 'D 8821 ZYX',
    totalWashes: 3,
    totalSpent: 285000,
    lastVisit: 'Hari ini, 08:30',
  },
]

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<CustomerItem[]>(FALLBACK_CUSTOMERS)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  //  fetch data ke backend
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/api/customers')
      if (res.data?.data && Array.isArray(res.data.data)) {
        const mapped: CustomerItem[] = res.data.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          phone: item.phone,
          createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : 'Baru saja',
          frequentPlate: item.orders?.[0]?.vehiclePlate || 'B 0000 XXX',
          totalWashes: item.orders?.length || 0,
          totalSpent: item.orders?.reduce((acc: number, curr: any) => acc + (curr.total || 0), 0) || 0,
          lastVisit: item.orders?.[0]?.createdAt ? 'Terakhir order' : 'Belum pernah',
          membership: item.membership
            ? {
                id: item.membership.id,
                memberCode: item.membership.memberCode,
                discountPercent: Number(item.membership.discountPercent) || 10,
                isActive: item.membership.isActive,
                joinedAt: item.membership.joinedAt
                  ? new Date(item.membership.joinedAt).toLocaleDateString('id-ID')
                  : 'Hari ini',
              }
            : undefined,
        }))
        setCustomers(mapped)
      }
    } catch (error) {
      console.warn('Gagal memuat customer dari API, menggunakan data cadangan:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  //  Tambah Customer Baru
  const addCustomer = async (payload: CreateCustomerPayload): Promise<boolean> => {
    const tempId = Date.now()
    const fallbackCustomer: CustomerItem = {
      id: tempId,
      name: payload.name.trim(),
      phone: payload.phone.trim(),
      createdAt: 'Hari ini',
      frequentPlate: payload.plate?.toUpperCase().trim() || 'B 0000 XXX',
      totalWashes: 0,
      totalSpent: 0,
      lastVisit: 'Belum pernah',
    }

    try {
      // Simpan customer ke backend
      const res = await api.post('/api/customers', {
        name: payload.name.trim(),
        phone: payload.phone.trim(),
      })

      const created = res.data?.data || fallbackCustomer
      let createdCustomer: CustomerItem = {
        ...fallbackCustomer,
        id: created.id,
        name: created.name,
        phone: created.phone,
      }

      // Jika dicentang daftar membership
      if (payload.registerAsMember) {
        try {
          const memRes = await api.patch(`/api/customers/${created.id}/membership`)
          if (memRes.data?.data) {
            createdCustomer.membership = {
              id: memRes.data.data.id,
              memberCode: memRes.data.data.memberCode,
              discountPercent: Number(memRes.data.data.discountPercent) || 10,
              isActive: memRes.data.data.isActive,
              joinedAt: 'Hari ini',
            }
          }
        } catch (memErr) {
          console.warn('Gagal aktivasi membership di backend, aktifkan di state lokal:', memErr)
        }
      }

      setCustomers((prev) => [createdCustomer, ...prev])
      return true
    } catch (error) {
      console.error('Gagal tambah customer ke backend, menyimpan ke lokal:', error)
      if (payload.registerAsMember) {
        fallbackCustomer.membership = {
          id: Date.now() + 1,
          memberCode: `MBR-2026-${Math.floor(100 + Math.random() * 900)}`,
          discountPercent: 10,
          isActive: true,
          joinedAt: 'Hari ini',
        }
      }
      setCustomers((prev) => [fallbackCustomer, ...prev])
      return false
    }
  }

  //  Toggle Status Membership
  const toggleMembership = async (customerId: number): Promise<boolean> => {
    // Update optimistik di UI
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c
        if (!c.membership) {
          return {
            ...c,
            membership: {
              id: Date.now(),
              memberCode: `MBR-${Math.floor(1000 + Math.random() * 9000)}`,
              discountPercent: 10,
              isActive: true,
              joinedAt: 'Hari ini',
            },
          }
        }
        return {
          ...c,
          membership: {
            ...c.membership,
            isActive: !c.membership.isActive,
          },
        }
      })
    )

    try {
      await api.patch(`/api/customers/${customerId}/membership`)
      return true
    } catch (error) {
      console.error(`Gagal toggle membership customer ${customerId} di backend:`, error)
      return false
    }
  }

  // Update Customer
  const updateCustomer = async (id: number, data: { name: string; phone: string }): Promise<boolean> => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: data.name, phone: data.phone } : c))
    )
    try {
      await api.put(`/api/customers/${id}`, data)
      return true
    } catch (error) {
      console.error(`Gagal update customer ${id} di backend:`, error)
      return false
    }
  }

  return (
    <CustomerContext.Provider
      value={{
        customers,
        isLoading,
        addCustomer,
        toggleMembership,
        updateCustomer,
        refreshCustomers: fetchCustomers,
      }}
    >
      {children}
    </CustomerContext.Provider>
  )
}