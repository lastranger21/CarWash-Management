import  { type Express, type Request, type Response, NextFunction } from 'express';

export const errorHandler = (err:any,req:Request,res:Response,next:NextFunction) => {
    console.error(err.stack)
    const statusCode = err.statusCode || 500;
    const message = err.message || "internal server error"
    res.status(statusCode).json({
        status: "error",
        message: message
        
    })
}