import  { NextFunction, type Express, type Request, type Response } from 'express';
import prisma from '../lib/prisma';
import { triggerAsyncId } from 'node:async_hooks';
import { PrismaClientExtends } from '@prisma/client/extension';


export const createService = async (req:Request,res:Response) => {
    try {
        const {name, price, description} = req.body
        const id = (req as any).user.id
        const image = req.file ? req.file.filename : null
        const newProduct = await prisma.service.create({
            data: {
                name: name,
                price: Number(price),
                description: description,
                image
            }
        })

        return res.status(201).json({
            message: "Product Created!",
            data: newProduct
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to create product",
            error: error
        })
    }
}

export const getAllService = async(req: Request, res: Response) => {
    try {
        const {search,minPrice,sortBy} = req.query
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 10
        const skip = (page-1)*limit
        const products = await prisma.service.findMany({
            where:{
                name: {
                    contains: search as string,
                    mode:'insensitive'
                },
                price: {
                    gte: minPrice?Number(minPrice):0
                }
            },
            take: limit,
            skip:skip,
            orderBy:{
                name: sortBy === 'oldest'?'asc':'desc'
            }
        })
        const totalData = await prisma.service.count()
        return res.status(200).json({
            message: "fetching successs!",
            meta:{
                current_page:page,
                limit:limit,
                total_data:totalData,
                total_page:Math.ceil(totalData/limit)

            },
            data: products
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch product",
            error: error
        })
    }
}

export const getServiceById = async(req:Request,res:Response,next:NextFunction) =>{
     
    try {
        const{id} = req.params
        const product = await prisma.service.findUnique({
            where: {
                id:Number(id)
            }
        })
        if(!product){
            return res.status(404).json({
            message: "product is not exist"
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

export const updateService= async (req:Request,res:Response) => {
    try {
        const {id} = req.params
        const {name,price,description} = req.body

        const updatedService = await prisma.service.update({
            where: {
                id:Number(id)
            },
            data: {
                name,
                price:Number(price),
                description
            }
        })
        return res.status(200).json({
            message: "service updated successfully",
            data: updatedService
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update service",
            error: error
        })
    }
}

export const deleteService = async (req:Request, res: Response) => {
    try {
        const {id} = req.params
        await prisma.service.delete({
            where: {
                id: Number(id)
            }
        })
        return res.status(200).json({
            message: "service deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete service",
            error: error
        })
    }
}