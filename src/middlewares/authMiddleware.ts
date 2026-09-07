import  { type Express, type Request, type Response, NextFunction } from 'express';
import jwt  from 'jsonwebtoken'


export const authentication = (req:Request,res:Response,next:NextFunction) => {
    const authHeader =req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({
            message: "akses ditolak,token tidak ada"
        })
    }
    try {
        const decoded = jwt.verify(token as string ,process.env.JWT_SECRET as string);
        console.log(decoded);
        (req as any).user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            message: "token tidak valid atau kadaluwarsa"
        })
    }
}