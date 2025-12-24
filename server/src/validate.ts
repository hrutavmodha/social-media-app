import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.ts'

export default function validate(req: Request, res: Response, next: NextFunction) {
    try {
        // console.log(req)
        if (req.cookies.token) {
            const decoded = jwt.verify(req.cookies.token, env.JWT_KEY as string);
            (req as any).user = decoded
            console.log(JSON.stringify(decoded, null, 4))
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