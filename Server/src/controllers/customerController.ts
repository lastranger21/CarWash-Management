import  { NextFunction, type Express, type Request, type Response } from 'express';
import prisma from '../lib/prisma';
import { triggerAsyncId } from 'node:async_hooks';
import { PrismaClientExtends } from '@prisma/client/extension';


export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, plate } = req.body; 
    const newCustomer = await prisma.customer.create({
      data: {
        name: name,
        phone: phone,
        // Jika plat disertakan, otomatis buat kendaraan di tabel Vehicle
        ...(plate
          ? {
              vehicles: {
                create: {
                  plateNumber: plate.toUpperCase().trim(),
                  modelName: 'Mobil Standar',
                },
              },
            }
          : {}),
      },
      include: {
        vehicles: true,
        membership: true,
        orders: true,
      },
    });
    return res.status(201).json({
      message: 'Customer Created!',
      data: newCustomer,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCustomer = async(req: Request, res: Response,next:NextFunction) => {
    try {
        const {search,sortBy} = req.query
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 10
        const skip = (page-1)*limit
        const customers = await prisma.customer.findMany({
            where:{
                name: {
                    contains: search as string,
                    mode:'insensitive'
                }
               
            }, include: {
        membership: true,
        orders: true,
        vehicles: true
    },
            take: limit,
            skip:skip,
            orderBy:{
                createdAt : sortBy === 'oldest'?'asc':'desc'
            }
        })
        const totalData = await prisma.customer.count()
        return res.status(200).json({
            message: "fetching successs!",
            meta:{
                current_page:page,
                limit:limit,
                total_data:totalData,
                total_page:Math.ceil(totalData/limit)

            },
            data: customers
        })
    } catch (error) {
        next(error)
    }
}

export const getCustomerById = async(req:Request,res:Response,next:NextFunction) =>{
     
    try {
        const{id} = req.params
        const product = await prisma.customer.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                membership: true,
                vehicles: true,
                orders: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            }
        })
        if(!product){
            return res.status(404).json({
            message: "customer is not exist"
         } )}
        return res.status(200).json({
            message: "fetching successs!",
            data: product
        })
    } catch (error:any) {
        error.message = "id tidak ditemukan"
        next(error)
    }
}
export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, phone, newVehicle } = req.body;
    const updatedCustomer = await prisma.customer.update({
      where: {
        id: Number(id),
      },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(phone ? { phone: phone.trim() } : {}),
        
        ...(newVehicle && newVehicle.plateNumber
          ? {
              vehicles: {
                create: {
                  plateNumber: newVehicle.plateNumber.toUpperCase().trim(),
                  modelName: newVehicle.modelName?.trim() || 'Mobil Standar',
                },
              },
            }
          : {}),
      },
      include: {
        vehicles: true,
        membership: true,
        orders: true,
      },
    });
    return res.status(200).json({
      message: 'Customer updated successfully',
      data: updatedCustomer,
    });
  } catch (error) {
    next(error);
  }
};
export const toggleMembership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; 
    
    const customer = await prisma.customer.findUnique({
      where: { id: Number(id) },
      include: { membership: true },
    });
    if (!customer) {
      return res.status(404).json({
        message: 'Customer tidak ditemukan',
      });
    }
    //  Skenario A: Customer belum memiliki membership sama sekali -> Buat baru
    if (!customer.membership) {
      // Generate Kode Member Unik (contoh: MBR-BUD-1234)
      const sanitizedName = customer.name.slice(0, 3).toUpperCase();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const memberCode = `MBR-${sanitizedName}-${randomSuffix}`;
      const newMembership = await prisma.membership.create({
        data: {
          customerId: customer.id,
          memberCode,
          discountPercent: 10.0, // Default diskon 10% sesuai PRD
          isActive: true,
        },
      });
      return res.status(201).json({
        message: 'Membership berhasil diaktifkan untuk customer ini',
        data: newMembership,
      });
    }
    //  Skenario B: Customer sudah punya membership -> Toggle status isActive
    const updatedMembership = await prisma.membership.update({
      where: { customerId: customer.id },
      data: {
        isActive: !customer.membership.isActive,
      },
    });
    return res.status(200).json({
      message: updatedMembership.isActive
        ? 'Membership berhasil diaktifkan kembali'
        : 'Membership berhasil dinonaktifkan',
      data: updatedMembership,
    });
  } catch (error) {
    next(error);
  }
};