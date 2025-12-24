import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.ts'

export default function validate(req: Request, res: Response, next: NextFunction) {
    try {
        if (req.cookies.token) {
            const decoded = jwt.verify(req.cookies.token, env.JWT_KEY as string);
            (req as any).user = decoded
            next()
        } else {
            res.status(401).json({
                message: 'Invalid credentials'
            })
        }
    } catch (error: any) {
        console.log(error)
        res.status(500).json({
            message: 'Some internal server error occured. Please try again later'
        })
        next(error)
    }
}