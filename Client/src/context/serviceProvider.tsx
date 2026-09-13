import React, { useState,useEffect} from 'react'
import { ServiceContext } from './serviceContext'
import { INITIAL_SERVICES } from '@/data/mockData'
import type { ServiceItem } from '@/types/carwash'
import { api } from '@/api'
export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES)
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/api/service')
        // Backend mengembalikan { data: [...] }
        if (res.data?.data && Array.isArray(res.data.data)) {
          
          const mappedServices: ServiceItem[] = res.data.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            durationMinutes: item.duration || 30,
            category: item.category || 'WASH',
            description: item.description || '',
          }))
          setServices(mappedServices)
        }
      } catch (error) {
        console.warn('Gagal memuat layanan dari API, menggunakan data cadangan:', error)
      }
    }
    fetchServices()
  }, [])

  // Tambah Layanan Baru
const addService = async (newServiceData: ServiceItem): Promise<boolean> => {
    const fallbackService: ServiceItem = {
      id: newServiceData.id || Date.now(),
      name: newServiceData.name.trim(),
      price: Number(newServiceData.price),
      durationMinutes: Number(newServiceData.durationMinutes) || 20,
      category: newServiceData.category,
      description: newServiceData.description?.trim() || '',
    }
    try {
      const payload = {
        name: fallbackService.name,
        price: fallbackService.price,
        duration: fallbackService.durationMinutes,
        category: fallbackService.category,
        description: fallbackService.description,
      }
      const res = await api.post('/api/service', payload)
      const createdItem = res.data?.data || fallbackService
      setServices((prev) => [
        {
          id: createdItem.id || fallbackService.id,
          name: createdItem.name || fallbackService.name,
          price: createdItem.price || fallbackService.price,
          durationMinutes: createdItem.duration || fallbackService.durationMinutes,
          category: createdItem.category || fallbackService.category,
          description: createdItem.description || fallbackService.description,
        },
        ...prev,
      ])
      return true
    } catch (error) {
      console.error('Gagal tambah layanan ke backend, fallback ke lokal:', error)
      setServices((prev) => [fallbackService, ...prev])
      return false
    }
  }

  // Update Layanan
  const updateService = async (id: number, updatedData: Partial<ServiceItem>) => {
   
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s))
    )
    try {
      const payload = {
        name: updatedData.name,
        price: updatedData.price,
        duration: updatedData.durationMinutes,
        category: updatedData.category,
        description: updatedData.description,
      }

      await api.put(`/api/service/${id}`, payload)
      console.log(`Layanan ${id} berhasil diperbarui di backend`)
    } catch (error) {
      console.error(`Gagal update layanan ${id} di backend:`, error)
    }
  }

  // Hapus Layanan
    const deleteService = async (id: number) => {
    
    setServices((prev) => prev.filter((s) => s.id !== id))
    
    try {
      await api.delete(`/api/service/${id}`)
      console.log(`Layanan ${id} berhasil dihapus dari backend`)
    } catch (error) {
      console.error(`Gagal hapus layanan ${id} di backend:`, error)
    }
  }

  return (
    <ServiceContext.Provider
      value={{
        services,
        addService,
        updateService,
        deleteService,
      }}
    >
      {children}
    </ServiceContext.Provider>
  )
}