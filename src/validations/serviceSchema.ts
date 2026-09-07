import {z} from 'zod'
export const createServiceSchema = z.object({
    name: z.string().min(3,"Nama layanan minimal 3 karakter"),
    price:z.coerce.number().positive("harga harus bernilai positif"),
    description: z.string().optional(),
    
})