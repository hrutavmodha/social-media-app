import type { Request, Response } from 'express'
import { pool } from '../config/db.ts'
import { hash } from 'bcrypt'

export default async function register(req: Request, res: Response) {
    try {
        const { username, email, password } = req.body
        const hashedPassword = await hash(password, 10)
        await pool.query(`
        INSERT INTO users(name, email, password) 
        VALUES ($1, $2, $3)
        `, [
            username, email, hashedPassword
        ])
        res.status(200).json({
            message: 'Registered successfully'
        })
    } catch (error: any) {
        console.log(error)
        res.status(500).json({
            message: 'Some internal server error occured. Please try again later'
        })
    }
}