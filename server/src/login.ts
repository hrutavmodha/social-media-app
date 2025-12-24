import type {
    Request,
    Response
} from 'express'
import { compare } from 'bcrypt'
import jwt from 'jsonwebtoken'
import { pool } from '../config/db.ts'
import { env } from '../config/env.ts'

export default async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body
        const user = await pool.query(`
            SELECT *
            FROM users
            WHERE email = $1
        `, [
            email
        ])

        if (user.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const passwordMatch = await compare(password, user.rows[0].password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(user.rows[0], env.JWT_KEY as string)

        res.status(200).cookie('token', token, {
            httpOnly: true,
            secure: false
        }).json({
            message: 'Logged in successfully'
        })
    } catch (error: any) {
        console.log(error)
        res.status(500).send('An internal server error occured. Please try again later')
    }
}