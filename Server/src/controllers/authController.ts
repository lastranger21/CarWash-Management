import  { NextFunction, type Express, type Request, type Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Role } from '@prisma/client';

export const register = async (req:Request,res:Response,next:NextFunction) => {
    try {
        const {name,email,password,role} = req.body
        const salt = await bcrypt.genSalt(10)

        const hashedPassword = await bcrypt.hash(password,salt)
        console.log(hashedPassword)

        const newUser =  await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role:role as Role
            }
        })
        return res.status(201).json({
            message: "has Created!",
            data: hashedPassword
        })
    } catch (error) {
        next(error)
    }
}
export const login = async (req:Request,res:Response,next:NextFunction) =>{
    try {
        const{email,password} = req.body
        const user = await prisma.user.findUnique({where:{email}})
        const isMatch = user ? await bcrypt.compare(password,user.password) : false;

        if (!user || !isMatch) {
            return res.status(401).json({message: "email atau password salah"})
        }
        const token = jwt.sign({
            id: user.id, name:user.email, role: user.role
        },process.env.JWT_SECRET as string,
        {expiresIn:'1d'});
        return res.status(200).json({
            message: "login berhasil!",
            token,
        })
    } catch (error) {
        next(error)
    }
}