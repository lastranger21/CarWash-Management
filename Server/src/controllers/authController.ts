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
export const registerCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, phone, plateNumber, modelName } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "Nama, email, password, dan nomor telepon wajib diisi!" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar!" });
    }

    const existingPhone = await prisma.customer.findUnique({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ message: "Nomor telepon sudah terdaftar!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'CUSTOMER' as Role,
        },
      });

      const customer = await tx.customer.create({
        data: {
          name,
          phone,
          userId: user.id,
          ...(plateNumber
            ? {
                vehicles: {
                  create: {
                    plateNumber: plateNumber.toUpperCase().trim(),
                    modelName: modelName?.trim() || 'Mobil Pribadi',
                  },
                },
              }
            : {}),
        },
        include: {
          vehicles: true,
          membership: true,
        },
      });

      return { user, customer };
    });

    const token = jwt.sign(
      { id: result.user.id, name: result.user.email, role: result.user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: "Registrasi customer berhasil!",
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        customer: result.customer,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        customer: {
          include: {
            vehicles: true,
            membership: true,
          },
        },
      },
    });
    const isMatch = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isMatch) {
      return res.status(401).json({ message: "email atau password salah" });
    }
    const token = jwt.sign(
      { id: user.id, name: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );
    res.status(200).json({
      message: "login berhasil!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        customer: user.customer,
      },
    });
  } catch (error) {
    next(error);
  }
};