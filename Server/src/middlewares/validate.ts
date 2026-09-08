import  { type Express, type Request, type Response, NextFunction } from 'express';
import z from 'zod';
import { is } from 'zod/locales';

export const validate =(schema:z.ZodSchema)=> (req:Request,res:Response,next:NextFunction) => {
    try {
        schema.parse(req.body)
        next()
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                status: "error",
                message: "Data tidak valid",
                error: z.treeifyError(error)
            })
        }
        next(error)
    }
}