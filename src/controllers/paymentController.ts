import  { NextFunction, type Express, type Request, type Response } from 'express';
import prisma from '../lib/prisma';


export const getPaymentById = (req: Request, res: Response,next:NextFunction) => {
    try {
        const {id} = req.params
        return res.json({
          message:`Display data using the params from: ${id}`
        })
        
  } catch (error) {
    next(error)
  }
}
export const createPayment = (req: Request, res: Response,next:NextFunction) => {
    try {
      const {id, name} = req.body
      return res.json({
        message:`Display data using the params from: ${id} and ${name}`,
        data: {id, name}
      })
    
  } catch (error) {
    next(error)
  }
}
